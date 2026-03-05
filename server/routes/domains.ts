import express from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generateTopics } from '../services/ai_service.js';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT * FROM domains');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/select', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    await query(
      'INSERT INTO student_domain_selections (student_id, domain_id) VALUES ($1, $2) ON CONFLICT (student_id, domain_id) DO NOTHING',
      [userId, id]
    );

    await query('UPDATE users SET selected_domain = $1 WHERE id = $2', [id, userId]);

    res.json({ message: 'Domain selected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/topics', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const domainResult = await query('SELECT * FROM domains WHERE id = $1', [id]);
    const domain = domainResult.rows[0];

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // Fetch VIT curriculum subjects (seeded, managed by admin)
    const vitResult = await query(
      `SELECT * FROM ai_generated_topics WHERE domain_id = $1 AND source IN ('vit','both') ORDER BY title`,
      [id]
    );

    // Fetch AI-generated suggestions (max 3)
    let aiResult = await query(
      `SELECT * FROM ai_generated_topics WHERE domain_id = $1 AND source = 'ai' ORDER BY created_at DESC LIMIT 3`,
      [id]
    );

    // If no AI topics yet, generate them via Gemini (only insert if none exist)
    if (aiResult.rows.length === 0) {
      const aiTopics = await generateTopics(domain.id, domain.name, domain.slug);
      aiResult = { rows: aiTopics.slice(0, 3) } as any;
    }

    res.json({
      vitTopics: vitResult.rows,
      aiTopics: aiResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/topics/refresh', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

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

export default router;
