import express from 'express';
import { query } from '../db.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireRole('teacher'));

router.post('/blogs', async (req: AuthRequest, res) => {
  try {
    const { title, content, subject_tag, difficulty_tag } = req.body;
    const userId = req.user.user_id;

    const result = await query(
      'INSERT INTO blog_posts (teacher_id, title, content, subject_tag, difficulty_tag) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, content, subject_tag, difficulty_tag]
    );

    await query(
      'INSERT INTO teacher_points (teacher_id, action, points, reference_id) VALUES ($1, $2, $3, $4)',
      [userId, 'blog_post', 5, result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/blogs/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, content, subject_tag, difficulty_tag } = req.body;
    const userId = req.user.user_id;

    const result = await query(
      'UPDATE blog_posts SET title = $1, content = $2, subject_tag = $3, difficulty_tag = $4 WHERE id = $5 AND teacher_id = $6 RETURNING *',
      [title, content, subject_tag, difficulty_tag, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/blogs/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const result = await query('DELETE FROM blog_posts WHERE id = $1 AND teacher_id = $2 RETURNING *', [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/points', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.user_id;

    const result = await query(
      'SELECT action, SUM(points) as subtotal FROM teacher_points WHERE teacher_id = $1 GROUP BY action ORDER BY subtotal DESC',
      [userId]
    );

    const totalResult = await query(
      'SELECT SUM(points) as total FROM teacher_points WHERE teacher_id = $1',
      [userId]
    );

    res.json({
      total: totalResult.rows[0].total || 0,
      breakdown: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/active-students', async (req: AuthRequest, res) => {
  try {
    const userId = req.user.user_id;

    // Get subject tags the teacher has posted about
    const tagsResult = await query('SELECT DISTINCT subject_tag FROM blog_posts WHERE teacher_id = $1', [userId]);
    const tags = tagsResult.rows.map(r => r.subject_tag);

    if (tags.length === 0) {
      return res.json([]);
    }

    // Find students active in those tags (commenting on blogs or posting doubts)
    const activeStudentsResult = await query(
      `SELECT u.id, u.name, COUNT(c.id) as interactions
       FROM users u
       JOIN comments c ON u.id = c.author_id
       JOIN blog_posts b ON c.post_id = b.id
       WHERE b.subject_tag = ANY($1) AND u.role = 'student'
       GROUP BY u.id, u.name
       ORDER BY interactions DESC
       LIMIT 10`,
      [tags]
    );

    res.json(activeStudentsResult.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
