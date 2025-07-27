import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'ai-service',
    timestamp: new Date().toISOString()
  });
});

app.post('/process', (req, res) => {
  const { text, userId, context } = req.body;
  
  // Mock AI response for now
  res.json({
    response: `I understand you said: "${text}". How can I help you with your sales tasks?`,
    intent: 'general_inquiry',
    entities: {},
    confidence: 0.85
  });
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});