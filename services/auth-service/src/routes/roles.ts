import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Roles endpoint' });
});

export { router as roleRoutes };