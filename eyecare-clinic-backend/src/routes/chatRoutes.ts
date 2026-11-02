import express from 'express';
import {
     getAllChats,
     getChat,
     sendMessage
} from '../controllers/chatController';
import authenticateToken from '../middleware/authMiddleware';
import { Roles } from '../utils/enum';
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

router.post('/', authenticateToken([Roles.Patient, Roles.Doctor, Roles.Optician, Roles.Admin]), upload.fields([{ name: 'picture', maxCount: 1 }]), sendMessage);
router.post('/existingchat', authenticateToken([Roles.Patient, Roles.Doctor, Roles.Optician, Roles.Admin]), getChat);
router.post('/allchats', authenticateToken([Roles.Patient, Roles.Doctor, Roles.Optician, Roles.Admin]), getAllChats);

export default router;
