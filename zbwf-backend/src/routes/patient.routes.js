import { Router } from 'express';
import { addPatient, updatePatient, deletePatient, getPatients, getPatientById } from '../controllers/patient.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();


router.post('/add', verifyToken, addPatient);

router.put('/update/:patient_id', verifyToken, updatePatient);

router.delete('/delete/:patient_id', verifyToken, deletePatient);

router.get('/:id', verifyToken, getPatientById);

router.get('/', verifyToken, getPatients);

export default router;
