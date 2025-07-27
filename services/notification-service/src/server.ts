import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
});

app.post('/send', (req, res) => {
  const { userId, type, message, channel } = req.body;
  
  // Mock notification sending
  console.log(`Sending ${type} notification to user ${userId}: ${message}`);
  
  res.json({
    success: true,
    notificationId: `notif_${Date.now()}`,
    status: 'sent'
  });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});