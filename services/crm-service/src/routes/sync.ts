import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
  res.json({ message: 'Sync endpoint' });
});

export { router as syncRoutes };