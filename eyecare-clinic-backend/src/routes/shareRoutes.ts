// routes/patientRoutes.ts

import express from 'express';
import * as patientController from '../controllers/patientController';
import authenticateToken from '../middleware/authMiddleware';
import { Roles } from '../utils/enum';

const router = express.Router();


export default router;
