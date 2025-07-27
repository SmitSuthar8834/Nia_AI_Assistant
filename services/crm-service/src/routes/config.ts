import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Config endpoint' });
});

export { router as configRoutes };