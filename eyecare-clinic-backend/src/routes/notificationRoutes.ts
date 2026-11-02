import express from 'express';
import {
     deleteNotification,
     getUnseenNotifications,
     updateNotificationsSeenStatus
} from '../controllers/notificationsController';
import { Roles } from '../utils/enum';
import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateToken([Roles.Patient, Roles.Doctor, Roles.Optician, Roles.Admin]), getUnseenNotifications);
router.delete('/:id', authenticateToken([Roles.Patient, Roles.Doctor, Roles.Optician, Roles.Admin]), deleteNotification);
router.get('/seen', authenticateToken([Roles.Patient, Roles.Doctor, Roles.Optician, Roles.Admin]), updateNotificationsSeenStatus);


export default router;
