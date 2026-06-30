import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/plan', async (req, res) => {
  const { tasks, goals, habits } = req.body;

  try {
    if (!tasks || tasks.length === 0) {
      return res.json({ message: 'No active tasks to prioritize.' });
    }

    const prompt = `
      You are an AI Productivity Planner.
      Here are the user's active tasks:
      ${JSON.stringify(tasks.map((t: any) => ({ id: t.id, title: t.title, deadline: t.deadline_adjusted })))}
      
      Here are their high-level goals:
      ${JSON.stringify((goals || []).map((g: any) => ({ title: g.title })))}
      
      Here are their habits:
      ${JSON.stringify((habits || []).map((h: any) => ({ title: h.title, frequency: h.frequency })))}
      
      Determine the priority (HIGH, MEDIUM, LOW) for each task, a suggested time to work on it (in ISO format within the next 48 hours), and a short rationale.
      Return the output as a valid JSON object:
      {
        "tasks": [
          { "id": "task_id", "priority": "HIGH", "ai_scheduled_time": "2024-01-01T10:00:00Z", "ai_rationale": "Aligns with Goal X and is due soon." }
        ],
        "message": "A motivational summary message for the user"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const output = JSON.parse(response.text || '{}');
    res.json(output);
  } catch (error: any) {
    console.error('AI Planning Error:', error);
    res.status(500).json({ error: 'Failed to generate AI plan' });
  }
});

export default router;
