import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Session settings
app.set('trust proxy', 1);  
app.use(session({ 
    secret: 'keyboard cat', 
    resave: false, 
    saveUninitialized: true 
}))

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

        // Get distinct health goals for dropdown
        const [healthGoals] = await pool.query("SELECT DISTINCT health_goal FROM fp_recipes");

        res.render('index', { recipes,
            "healthGoals" : healthGoals
         }); // pass recipes to home page
    } catch (err) {
        console.error("DB error:", err);
        res.status(500).send("Database error");
    }

    // Get distinct health goals for dropdown
        // const [healthGoals] = await pool.query("SELECT DISTINCT health_goal FROM fp_recipes");
        // res.render('index', { 
        //     "healthGoals" : healthGoals
        //  });

 });

 //keyword search -Aohua
 app.get('/searchByKeyword', async (req, res) => {
    let userKeyword = req.query.keyword;
    let sql = `SELECT *
                From fp_recipes
                WHERE title LIKE ? OR ingredients LIKE ?`;
    let sqlParams = [`%${userKeyword}%`, `%${userKeyword}%`];
    const [rows] = await pool.query(sql, sqlParams);

    res.render("results", 
        { 
            "recipes": rows 
        });

});

// Search by Health Goal
app.get('/searchByGoal', async (req, res) => {
    let goal = req.query.healthGoal;
    let sql = `SELECT * FROM fp_recipes WHERE health_goal = ?`;
    const [rows] = await pool.query(sql, [goal]);
    res.render("results", { recipes: rows });
});

// Search by Budget
app.get('/searchByBudget', async (req, res) => {
    let budget = req.query.budget;
    let sql = `SELECT * FROM fp_recipes WHERE budget_level = ?`;
    const [rows] = await pool.query(sql, [budget]);
    res.render("results", { recipes: rows });
});

// Search by Cook Time
app.get('/searchByTime', async (req, res) => {
    let time = parseInt(req.query.cookTime);
    let sql;
    let sqlParams;

    if (time === 10) {
        // Under 10 min
        sql = `SELECT * FROM fp_recipes WHERE cook_time < ?`;
        sqlParams = [10];
    } else if (time === 61) {
        // 1hr and more
        sql = `SELECT * FROM fp_recipes WHERE cook_time >= ?`;
        sqlParams = [60];
    } else if (time === 60) {
        // 30-60
        sql = `SELECT * FROM fp_recipes WHERE cook_time >= ? AND cook_time < ?`;
        sqlParams = [time - 30, time];
    } else {
        // Between ranges (10-20, 20-30, 30-60)
        sql = `SELECT * FROM fp_recipes WHERE cook_time >= ? AND cook_time < ?`;
        sqlParams = [time - 10, time];
    }

    const [rows] = await pool.query(sql, sqlParams);
    res.render("results", { recipes: rows });
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
    res.render('login', {message: req.query.message});
});

app.post('/login', async(req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if (!email || !password) {
        return res.redirect("/login?message=Incorrect+email+or+password!");
    }

    // let passwordHash = "$2a$10$06ofFgXJ9wysAOzQh0D0..RcDp1w/urY3qhO6VuUJL2c6tzAJPfj6";
    // test user: test@user.com, pw = secret, admin/secret added 12/13
    let sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await pool.query(sql,[email]);
    if (rows.length === 0) {
        console.log("No user found!");
        return res.redirect("/login?message=No+user+found!");
    }
    let passwordHash = rows[0].password_hash;
    let match = await bcrypt.compare(password, passwordHash);

    if (match) {
        req.session.authenticated = true;
        req.session.user_id = rows[0].user_id;
        req.session.email = rows[0].email;
        // res.render("/profile") //place holder till profile page made below
        res.redirect("/myProfile");
    } else {
        return res.redirect("/login?message=Incorrect+email+or+password!");
    }
});

//Render profile if authenticated
app.get('/myProfile', isAuthenticated, async (req, res) => {
    const userId = req.session.user_id;
    let sql = `SELECT name, email, diet_goal, budget_level FROM users WHERE user_id = ?`;
    const[rows] = await pool.query(sql, [userId]);
    res.render("profile", {user: rows[0]});
});

//Adding update profile feature
app.post("/myProfile", isAuthenticated, async (req, res) => {
  const userId = req.session.user_id;
  const {name, diet_goal, budget_level} = req.body;
  let sql = `UPDATE users SET name = ?, diet_goal = ?, budget_level = ? WHERE user_id = ?`;
//   const[rows] = await pool.query(sql, [name || null, diet_goal || null, budget_level || null, userId]);
  
  res.redirect("/myProfile");
});


//Authentication function for login
function isAuthenticated(req,res,next) {
    if (!req.session.authenticated || !req.session.user_id) {
        return res.redirect("/login?message=Please+log+in.");
    } else {
        next();
    }
}

//Logout route
app.get('/logout', isAuthenticated, (req,res) => {
    req.session.destroy();
    res.redirect("/");
});

//Register User
app.get("/register", (req, res) => {
    res.render("register", {message: req.query.message});
});

app.post("/register", async (req , res) => {
    const {name, email, password, diet_goal, budget_level} = req.body;
    if (!email || !password) {
        return res.redirect("/register?message=Email+and+password+required");
    }
    if (password.length < 6) {
      return res.redirect("/register?message=Password+must+be+six+characters+minimum.");
    }

    let checkExistingSql = `SELECT user_id FROM users WHERE email = ?`;
    const [rows] = await pool.query(checkExistingSql,[email]);
    if (rows.length > 0) {
        return res.redirect("/register?message=Email+already+registered");
    }

    let password_hash = await bcrypt.hash(password, 10);
    let userSql = `INSERT INTO users (name, email, password_hash, diet_goal, budget_level) VALUES (?, ?, ?, ?, ?)`;
    const[userRows] = await pool.query(userSql, [name || null, email, password_hash, diet_goal || null, budget_level || null]);

    req.session.authenticated = true;
    req.session.email = email;

    req.session.user_id = userRows.insertId; //?

    return res.redirect("/myProfile");

});


// Favorites API - Ethan
// Add recipe to favorites
app.post('/api/favorites', isAuthenticated, async (req, res) => {
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipe_id;

    const sql = `INSERT INTO favorites (user_id, recipe_id, created_at)
    VALUES (? , ?, NOW())`;
    await pool.query(sql, [user_id, recipe_id]);
    res.redirect(`/recipe/${recipe_id}`);
});

// Remove from favorites
app.get("/api/favorites/delete", isAuthenticated, async (req,res) => {
    const user_id = req.session.user_id;
    const { recipe_id } = req.query;
    let sql = `DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?`;
    await pool.query(sql, [user_id, recipe_id]);
    res.redirect("/favorites");
});

// Show favorites page
app.get("/favorites", isAuthenticated, async (req, res) => {
    const user_id = req.session.user_id;

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