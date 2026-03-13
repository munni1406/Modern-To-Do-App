import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './database.js';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;
const SECRET_KEY = 'super_secret_key_change_in_production';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Access denied, token missing!' });
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token is not valid' });
        req.user = user;
        next();
    });
};

// --- AUTHENTICATION ROUTES ---

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        console.log('Signup failed: Missing fields');
        return res.status(400).json({ error: 'All fields (name, email, password) are required' });
    }

    console.log(`Signup attempt for: ${email}`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hashedPassword], function(err) {
            if (err) {
                console.error(`Database error during signup for ${email}:`, err.message);
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Database error during account creation' });
            }
            
            console.log(`User created successfully: ${email} (ID: ${this.lastID})`);
            const token = jwt.sign({ id: this.lastID, email }, SECRET_KEY, { expiresIn: '1h' });
            res.status(201).json({ token, user: { id: this.lastID, name, email } });
        });
    } catch (err) {
        console.error(`Bcrypt/Server error during signup for ${email}:`, err);
        res.status(500).json({ error: 'Internal server error during signup' });
    }
});

// Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields are required' });

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
});

// --- TODO ROUTES ---

// Get all todos for user
app.get('/api/todos', verifyToken, (req, res) => {
    db.all(`SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Add new todo
app.post('/api/todos', verifyToken, (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'Task content missing' });

    db.run(`INSERT INTO todos (user_id, task) VALUES (?, ?)`, [req.user.id, task], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ id: this.lastID, task, completed: 0 });
    });
});

// Update todo
app.put('/api/todos/:id', verifyToken, (req, res) => {
    const { task, completed } = req.body;
    const { id } = req.params;

    db.run(`UPDATE todos SET task = COALESCE(?, task), completed = COALESCE(?, completed) WHERE id = ? AND user_id = ?`, 
        [task, completed, id, req.user.id], 
        function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (this.changes === 0) return res.status(404).json({ error: 'Todo not found or unauthorized' });
            res.json({ message: 'Todo updated successfully' });
    });
});

// Delete todo
app.delete('/api/todos/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM todos WHERE id = ? AND user_id = ?`, [id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Todo not found or unauthorized' });
        res.json({ message: 'Todo deleted successfully' });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
