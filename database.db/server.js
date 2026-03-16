const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const db = require("./db");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['https://modern-to-do-app-eight.vercel.app/auth', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers,
    // credentials: true
}));

// --- DATABASE TABLES ---
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE
  )
`);

// --- REST API ROUTES ---

// GET all users
app.get("/users", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// POST a new user
app.post("/add-user", (req, res) => {
    const { name, email } = req.body;
    db.run(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: "User added", id: this.lastID });
            }
        }
    );
});

// Dummy Signup Route (from the pasted snippet)
app.post('/api/signup', (req, res) => {
    res.status(200).send('Signup successful');
});

// --- HTTP & WEBSOCKET SETUP ---
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    ws.send("Connected to WebSocket server");

    ws.on("message", (message) => {
        console.log("Received:", message.toString());
    });

    ws.on("close", () => {
        console.log("WebSocket client disconnected");
    });
});

// Start the server on port 4000
// (Note: Port 3000 and 5000 might be used by the frontend or main backend)
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Consolidated server running on port ${PORT}`);
    console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
});

// const cors = require("cors");
// app.use(cors());
