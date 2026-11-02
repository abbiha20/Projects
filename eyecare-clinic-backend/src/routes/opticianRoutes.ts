import express from 'express';
import {
     getOpticians,
     getOpticianById,
     createOptician,
     updateOptician,
     deleteOptician,
     getOpticianDashboard,
     getAllOpticianRecords,
} from '../controllers/opticianController';
import authenticateToken from '../middleware/authMiddleware';
import { Roles } from '../utils/enum';

const router = express.Router();

router.post('/', createOptician);
router.get('/records', authenticateToken([Roles.Optician]), getAllOpticianRecords);
router.get('/dashboard', authenticateToken([Roles.Optician]), getOpticianDashboard);
router.get('/', authenticateToken([Roles.Optician, Roles.Admin, Roles.Patient, Roles.Doctor]), getOpticians);
router.get('/:id', getOpticianById);
router.put('/', authenticateToken([Roles.Optician]), updateOptician);
router.delete('/:id', deleteOptician);

export default router;