import express from 'express';
import {
     createDoctor,
     getDoctors,
     getDoctorById,
     updateDoctor,
     deleteDoctor,
     getPatientsOfDoctor,
     getAllRecords,
     getDoctorDashboard,
     getUpdatedDoctorRating,
     getAppointments
} from '../controllers/doctorController';
import { Roles } from '../utils/enum';
import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', createDoctor);
router.get('/records', authenticateToken([Roles.Doctor]), getAllRecords);
router.get('/dashboard', authenticateToken([Roles.Doctor]), getDoctorDashboard);
router.get('/rating', authenticateToken([Roles.Doctor]), getUpdatedDoctorRating);
router.get('/appointment', authenticateToken([Roles.Patient]), getAppointments);

router.get('/', authenticateToken([Roles.Patient]), getDoctors);
router.get('/:id', authenticateToken([Roles.Patient]), getDoctorById);
router.put('/', authenticateToken([Roles.Doctor]), updateDoctor);
router.delete('/:id', authenticateToken([Roles.Doctor]), deleteDoctor);
router.delete('/:id', authenticateToken([Roles.Doctor]), getPatientsOfDoctor);

export default router;
