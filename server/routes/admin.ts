import express from 'express';
import { query } from '../db.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { generateTopics } from '../services/ai_service.js';

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/domain-interest', async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT d.name, COUNT(s.student_id) as count
      FROM domains d
      LEFT JOIN student_domain_selections s ON d.id = s.domain_id
      GROUP BY d.name
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/topic-demand', async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT t.title, d.name as domain_name, COUNT(td.student_id) as demand_count
      FROM ai_generated_topics t
      JOIN domains d ON t.domain_id = d.id
      JOIN topic_demand td ON t.id = td.topic_id
      GROUP BY t.id, t.title, d.name
      ORDER BY demand_count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/teachers/leaderboard', async (req: AuthRequest, res) => {
  try {
    const { subject_tag } = req.query;
    let queryStr = `
      SELECT u.id, u.name, SUM(tp.points) as total_points
      FROM users u
      JOIN teacher_points tp ON u.id = tp.teacher_id
      WHERE u.role = 'teacher'
    `;
    const params: any[] = [];

    if (subject_tag) {
      queryStr += ` AND u.id IN (SELECT teacher_id FROM blog_posts WHERE subject_tag = $1)`;
      params.push(subject_tag);
    }

    queryStr += ` GROUP BY u.id, u.name ORDER BY total_points DESC`;

    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/subject-activity', async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT subject_tag, COUNT(id) as post_count, SUM(upvotes) as total_upvotes
      FROM blog_posts
      GROUP BY subject_tag
      ORDER BY post_count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/domains/:id/refresh-topics', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const domainResult = await query('SELECT * FROM domains WHERE id = $1', [id]);
    const domain = domainResult.rows[0];

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    await query('DELETE FROM ai_generated_topics WHERE domain_id = $1', [id]);
    const generatedTopics = await generateTopics(domain.id, domain.name, domain.slug);

    res.json(generatedTopics);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/flagged-content', async (req: AuthRequest, res) => {
  try {
    const blogsResult = await query("SELECT * FROM blog_posts WHERE status = 'flagged'");
    const doubtsResult = await query("SELECT * FROM doubt_questions WHERE status = 'flagged'");
    res.json({ blogs: blogsResult.rows, doubts: doubtsResult.rows });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/content/:id/remove', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'blog' or 'doubt'

    if (type === 'blog') {
      await query("UPDATE blog_posts SET status = 'removed' WHERE id = $1", [id]);
    } else if (type === 'doubt') {
      await query("UPDATE doubt_questions SET status = 'removed' WHERE id = $1", [id]);
    } else {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    res.json({ message: 'Content removed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all topics for a domain (admin topic manager)
router.get('/domains/:id/topics', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT * FROM ai_generated_topics WHERE domain_id = $1 ORDER BY source, title`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle VIT availability of a topic
router.patch('/topics/:id/vit-availability', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { is_vit_available } = req.body;

    if (typeof is_vit_available !== 'boolean') {
      return res.status(400).json({ error: 'is_vit_available must be a boolean' });
    }

    const result = await query(
      `UPDATE ai_generated_topics SET is_vit_available = $1 WHERE id = $2 RETURNING *`,
      [is_vit_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
