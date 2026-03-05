import express from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.get('/blogs', authenticate, async (req: AuthRequest, res) => {
  try {
    const { subject_tag } = req.query;
    let queryStr = 'SELECT b.*, u.name as teacher_name FROM blog_posts b JOIN users u ON b.teacher_id = u.id WHERE b.status = $1';
    const params: any[] = ['published'];

    if (subject_tag) {
      queryStr += ' AND b.subject_tag = $2';
      params.push(subject_tag);
    }

    queryStr += ' ORDER BY b.published_at DESC';

    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/blogs/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const postResult = await query('SELECT b.*, u.name as teacher_name FROM blog_posts b JOIN users u ON b.teacher_id = u.id WHERE b.id = $1', [id]);
    const post = postResult.rows[0];

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentsResult = await query('SELECT c.*, u.name as author_name FROM comments c JOIN users u ON c.author_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at ASC', [id]);

    res.json({ ...post, comments: commentsResult.rows });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/blogs/:id/comment', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content, parent_id } = req.body;
    const userId = req.user.user_id;

    const result = await query(
      'INSERT INTO comments (post_id, author_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, userId, content, parent_id || null]
    );

    const postResult = await query('SELECT teacher_id FROM blog_posts WHERE id = $1', [id]);
    const teacherId = postResult.rows[0]?.teacher_id;

    if (teacherId && teacherId !== userId) {
      await query(
        'INSERT INTO teacher_points (teacher_id, action, points, reference_id) VALUES ($1, $2, $3, $4)',
        [teacherId, 'comment_received', 1, result.rows[0].id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/blogs/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    // In a real app, we'd have a likes table to prevent duplicate likes. For now, just increment.
    await query('UPDATE blog_posts SET upvotes = upvotes + 1 WHERE id = $1', [id]);

    const postResult = await query('SELECT teacher_id FROM blog_posts WHERE id = $1', [id]);
    const teacherId = postResult.rows[0]?.teacher_id;

    if (teacherId && teacherId !== userId) {
      await query(
        'INSERT INTO teacher_points (teacher_id, action, points, reference_id) VALUES ($1, $2, $3, $4)',
        [teacherId, 'like_received', 1, id]
      );
    }

    res.json({ message: 'Post liked' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/doubts', authenticate, async (req: AuthRequest, res) => {
  try {
    const { subject_tag } = req.query;
    let queryStr = 'SELECT d.*, u.name as student_name FROM doubt_questions d JOIN users u ON d.student_id = u.id WHERE d.status = $1';
    const params: any[] = ['active'];

    if (subject_tag) {
      queryStr += ' AND d.subject_tag = $2';
      params.push(subject_tag);
    }

    queryStr += ' ORDER BY d.created_at DESC';

    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/doubts', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, subject_tag } = req.body;
    const userId = req.user.user_id;

    const result = await query(
      'INSERT INTO doubt_questions (student_id, title, content, subject_tag) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, content, subject_tag]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/doubts/:id/upvote', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE doubt_questions SET upvotes = upvotes + 1 WHERE id = $1', [id]);
    res.json({ message: 'Doubt upvoted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/doubts/:id/reply', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.user_id;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    const result = await query(
      'INSERT INTO comments (post_id, author_id, content) VALUES ($1, $2, $3) RETURNING *',
      [id, userId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

