import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

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

// Start server
app.listen(3000, () => {
    console.log("SmartBite server running on port 3000");
});