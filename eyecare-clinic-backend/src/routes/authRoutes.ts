// routes/authRoutes.ts
import express from 'express';
import { signin } from '../controllers/authController';

const router = express.Router();

router.post('/signin', signin);

export default router;
