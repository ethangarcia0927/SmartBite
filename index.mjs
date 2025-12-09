import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// === MySQL connection pool ===
const pool = mysql.createPool({
    host: "mgs0iaapcj3p9srz.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "pt9o45jlc8mfql6a",
    password: "j713t4qjjvej3s00",
    database: "sxc7jag8se2txrqk",
    waitForConnections: true,
    connectionLimit: 10
});

// === Routes ===

// Home page
app.get('/', async (req, res) => {
    try {
        const [recipes] = await pool.query("SELECT * FROM recipes ORDER BY title");
        res.render('index', { recipes }); // pass recipes to home page
    } catch (err) {
        console.error("DB error:", err);
        res.status(500).send("Database error");
    }
 });

// Test database connection
app.get('/dbTest', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE() AS today");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});

// Login page, can make Home page require login later if needed!
app.get('/login', (req, res) => {
    res.render('login')
});

app.post('/login', async(req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    // let passwordHash = "$2a$10$06ofFgXJ9wysAOzQh0D0..RcDp1w/urY3qhO6VuUJL2c6tzAJPfj6";
    // test user: test@user.com, pw = secret
    let sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await pool.query(sql,[email]);
    if (rows.length == 0) {
        console.log("No user found!");
        res.redirect("/login");
    }
    let passwordHash = rows[0].password_hash;
    let match = await bcrypt.compare(password, passwordHash);

    if (match) {
        // res.render("/profile") //place holder till profile page made below
        res.send("Login successful")
    } else {
        res.redirect("/login");
    }
});

// Favorites API - Ethan
// Add recipe to favorites
app.post('/api/favorites', async (req, res) => {
    const { user_id, recipe_id } = req.body;
    const sql = `INSERT INTO favorites (user_id, recipe_id, created at)
    VALUES (? , ?, NOW())`;
    await pool.query(sql, [user_id, recipe_id]);
    res.redirect(`/recipe/${recipe_id}`);
});

// Remove from favorites
app.get("/api/favorites/delete", async (req,res) => {
    const { user_id, recipe_id } = req.query;
    let sql = `DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?`;
    await pool.query(sql, [user_id, recipe_id]);
    res.redirect("/favorites");
});

// Show favorites page
app.get("/favorites", async (req, res) => {
    const user_id = 1; // TEMP - no login session yet
    const sql = `
        SELECT r.recipe_id, r.title, r.cuisine, r.meal_type, r.image_url
        FROM favorites f
        JOIN recipes r on f.recipe_id = r.recipe_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
        `;

        const [favorites] = await pool.query(sql, [user_id]);
        res.render("favorites", { favorites });
});

// Recipe Details Page
app.get("/recipe/:id", async (req, res) => {
    const recipeId = req.params.id;
    const sql = `SELECT * FROM recipes WHERE recipe_id = ?`;
    const [rows] = await pool.query(sql, [recipeId]);

    res.render("recipeDetails", { recipe: rows[0] });
});

// Start server
app.listen(3000, () => {
    console.log("SmartBite server running on port 3000");
});