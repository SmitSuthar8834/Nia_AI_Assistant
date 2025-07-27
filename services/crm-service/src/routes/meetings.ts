import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Meetings endpoint' });
});

export { router as meetingRoutes };