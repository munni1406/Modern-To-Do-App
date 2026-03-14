const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(cors());

// Create users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE
  )
`);

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

app.listen(4000, () => {
    console.log("database.db server running on port 4000");
});


const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const App = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: "/ws" });

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.send("Connected to WebSocket server");

    ws.on("message", (message) => {
        console.log("Received:", message.toString());
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});