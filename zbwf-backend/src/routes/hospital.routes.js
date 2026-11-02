import express from 'express';
import {
  createHospital,
  getHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  getHospitalsDropdown
} from '../controllers/hospital.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/',verifyToken, createHospital);
router.get('/',verifyToken, getHospitals);
router.get('/:id',verifyToken, getHospitalById);
router.put('/:id',verifyToken, updateHospital);
router.delete('/:id',verifyToken, deleteHospital);
router.get('/dropdown/list', getHospitalsDropdown);

export default router;
