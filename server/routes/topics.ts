import express from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getTopicResources } from '../services/ai_service.js';

const router = express.Router();

router.get('/:id/resources', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    // Fetch the topic to get title + domain context
    const topicResult = await query(
      `SELECT t.*, d.name as domain_name FROM ai_generated_topics t
       JOIN domains d ON d.id = t.domain_id WHERE t.id = $1`,
      [id]
    );
    const topic = topicResult.rows[0];
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    const resources = getTopicResources(id, topic.title, topic.domain_name);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/vit-info', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM ai_generated_topics WHERE id = $1 AND is_vit_available = true', [id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/demand', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    await query(
      'INSERT INTO topic_demand (topic_id, student_id) VALUES ($1, $2) ON CONFLICT (topic_id, student_id) DO NOTHING',
      [id, userId]
    );

    res.json({ message: 'Demand recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/demand', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    await query('DELETE FROM topic_demand WHERE topic_id = $1 AND student_id = $2', [id, userId]);

    res.json({ message: 'Demand removed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
