/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // AI Insights Endpoint
  app.post('/api/analyze', async (req, res) => {
    try {
      const { transactions } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        You are an expert Financial Data Analyst. 
        Analyze the following transaction data (last 30 days) and provide 3 key insights.
        Data: ${JSON.stringify(transactions)}

        Return your response in strict JSON format as an array of objects:
        [
          {
            "title": "Short title of insight",
            "analysis": "Detailed explanation of what the data shows",
            "recommendation": "Concrete advice for the user",
            "sentiment": "positive" | "warning" | "neutral"
          }
        ]
        Respond ONLY with the JSON.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('No content returned from AI');
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error('Analysis error:', error);
      
      const errorMessage = error.message || String(error);
      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({ 
          error: 'Rate limit or quota exceeded. Consider upgrading to a paid tier in the Settings panel for higher limits.',
          type: 'QUOTA_EXCEEDED'
        });
      }
      
      res.status(500).json({ error: 'Failed to generate AI insights.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
