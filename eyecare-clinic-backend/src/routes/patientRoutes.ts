// routes/patientRoutes.ts

import express from 'express';
import * as patientController from '../controllers/patientController';
import authenticateToken from '../middleware/authMiddleware';
import { Roles } from '../utils/enum';

const router = express.Router();


router.post('/', patientController.createPatient);
router.get('/', authenticateToken([Roles.Patient]), patientController.getPatients);
// router.get('/getself', authenticateToken([Roles.Patient]), patientController.getSelf);
router.put('/', authenticateToken([Roles.Patient]), patientController.updatePatient);
router.delete('/:id', authenticateToken([Roles.Patient]), patientController.deletePatient);
router.post('/sharecolorblindtest', authenticateToken([Roles.Patient]), patientController.shareColorBlindTest);
router.post('/sharevisiontest', authenticateToken([Roles.Patient]), patientController.shareVisionTest);
router.post('/shareratinascantest', authenticateToken([Roles.Patient]), patientController.shareRatinScan);
router.post('/create-payment-intent', authenticateToken([Roles.Patient]), patientController.createPayment);
router.post('/savepaymentrecord', authenticateToken([Roles.Patient]), patientController.savePaymentRecord);

router.post('/giveratingtodoctor', authenticateToken([Roles.Patient]), patientController.giveRatingToDoctor);
router.post('/dashboard', authenticateToken([Roles.Patient]), patientController.getDashboardHistory);

export default router;
