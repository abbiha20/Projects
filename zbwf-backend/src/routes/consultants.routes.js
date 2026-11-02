import express from 'express';
import {
  addConsultant,
  getConsultants,
  getConsultantById,
  updateConsultant,
  deleteConsultant,
  getConsultantsDropdown
} from '../controllers/consultants.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/',verifyToken, addConsultant);
router.get('/',verifyToken, getConsultants);
router.get('/:id',verifyToken, getConsultantById);
router.put('/:id',verifyToken, updateConsultant);
router.delete('/:id',verifyToken, deleteConsultant);
router.get('/dropdown/list',verifyToken, getConsultantsDropdown);

export default router;
