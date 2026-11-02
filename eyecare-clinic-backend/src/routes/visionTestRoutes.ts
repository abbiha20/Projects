import express from 'express';
import {
     createVisionTest,
     getVisionTestById,
     deleteVisionTest,
     getVisionTestsByRelatedId
} from '../controllers/visionTestController';
import { Roles } from '../utils/enum';
import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();
router.post('/', authenticateToken([Roles.Patient]), createVisionTest);
router.delete('/:id', authenticateToken([Roles.Patient]), deleteVisionTest);

router.post('/related', authenticateToken([Roles.Admin, Roles.Doctor, Roles.Optician, Roles.Patient]), getVisionTestsByRelatedId);
router.get('/:id', getVisionTestById);


export default router;
