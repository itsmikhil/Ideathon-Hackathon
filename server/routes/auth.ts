import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';

router.post('/register', async (req, res) => {
  try {
    const { name, email, registration_number, password, role } = req.body;

    if (!name || !email || !registration_number || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!email.endsWith('@vitstudent.ac.in') && !email.endsWith('@vit.ac.in')) {
      return res.status(400).json({ error: 'Must use a valid VIT email address' });
    }

    if (!process.env.DB_NAME) {
      return res.status(500).json({ error: 'Database connection string is not configured.' });
    }

    if (role && !['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role || (email.endsWith('@vitstudent.ac.in') ? 'student' : 'teacher');

    const result = await query(
      'INSERT INTO users (name, email, registration_number, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, registration_number, hashedPassword, userRole]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email or registration number already exists' });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { registration_number, email, password } = req.body;

    if (!email || !registration_number || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!process.env.DB_NAME) {
      return res.status(500).json({ error: 'Database connection string is not configured.' });
    }

    const result = await query(
      'SELECT * FROM users WHERE registration_number = $1 AND email = $2',
      [registration_number, email]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.id, role: user.role, name: user.name },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
