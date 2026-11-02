import express from 'express';
import {
  createColorBlindTest,
  updateColorBlindTest,
  deleteColorBlindTest,
  getColorBlindTestsByRelatedId,
} from '../controllers/colorBlindTestController';
import authenticateToken from '../middleware/authMiddleware';
import { Roles } from '../utils/enum';

const router = express.Router();

router.post('/', authenticateToken([Roles.Patient]), createColorBlindTest);
router.put('/:id', authenticateToken([Roles.Patient]), updateColorBlindTest);
router.delete('/:id', authenticateToken([Roles.Patient]), deleteColorBlindTest);
router.post('/related', authenticateToken([Roles.Admin, Roles.Doctor, Roles.Optician, Roles.Patient]), getColorBlindTestsByRelatedId);


export default router;
