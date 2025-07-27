import express from 'express';

const router = express.Router();

router.post('/process-text', (req, res) => {
  const { text } = req.body;
  res.json({
    text: `Processed: ${text}`,
    confidence: 0.9
  });
});

router.get('/profile', (req, res) => {
  res.json({
    languagePreferences: ['en-IN'],
    voiceSettings: { speed: 1.0, pitch: 0.0, volume: 0.0 }
  });
});

export { router as voiceRoutes };