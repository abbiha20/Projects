import express from 'express';
import {
     createRatinaScan,
     getRatinaScanById,
     deleteRatinaScan,
     getRatinaScansByRelatedId
} from '../controllers/ratinaScanController';
import authenticateToken from '../middleware/authMiddleware';
import { Roles } from '../utils/enum';
import multer from 'multer';
import path from 'path';

const router = express.Router();

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

router.post('/', authenticateToken([Roles.Patient]), upload.fields([{ name: 'leftEye', maxCount: 1 }, { name: 'rightEye', maxCount: 1 }]), createRatinaScan);







router.delete('/:id', authenticateToken([Roles.Patient]), deleteRatinaScan);
router.get('/:id', authenticateToken([Roles.Admin, Roles.Doctor, Roles.Optician, Roles.Patient]), getRatinaScanById);
router.post('/related', authenticateToken([Roles.Admin, Roles.Doctor, Roles.Optician, Roles.Patient]), getRatinaScansByRelatedId);


export default router;
