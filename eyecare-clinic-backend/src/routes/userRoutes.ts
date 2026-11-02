// routes/patientRoutes.ts

import express from 'express';
import authenticateToken from '../middleware/authMiddleware';
import { Roles } from '../utils/enum';
import { setProfileImage, getSelf, createAdmin, getAllRecordsByAdmin, getAdminId, getLogs, getPaymentHistory } from '../controllers/userController';

import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
     destination: (req, file, cb) => {
          cb(null, path.join(__dirname, '..', 'public')); // Save files in the images folder one level up from the routes folder
     },
     filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
          cb(null, `${uniqueSuffix}-${file.originalname}`);
     },
});


const upload = multer({ storage: storage });

const router = express.Router();

router.get('/getself', authenticateToken([Roles.Patient, Roles.Doctor, Roles.Optician, Roles.Admin]), getSelf);
router.post('/createadmin', createAdmin);
router.get('/getadminid', authenticateToken([Roles.Patient]), getAdminId);
router.get('/logs', authenticateToken([Roles.Admin]), getLogs);
router.get('/records', authenticateToken([Roles.Admin]), getAllRecordsByAdmin);
router.post('/image', authenticateToken([Roles.Patient, Roles.Doctor, Roles.Optician, Roles.Admin]), upload.fields([{ name: 'profileImg', maxCount: 1 }]), setProfileImage);
router.get('/paymentrecord', authenticateToken([Roles.Admin]), getPaymentHistory);



export default router;
