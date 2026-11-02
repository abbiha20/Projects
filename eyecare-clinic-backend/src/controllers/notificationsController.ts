import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse';
import { Roles } from '../utils/enum';

const prisma = new PrismaClient();


const getUnseenNotifications = async (req: any, res: Response) => {
     try {
          const result = await prisma.notifications.findMany({
               where: {
                    patientId: req.user.role === Roles.Patient ? req.user.userId : null,
                    doctorId: req.user.role === Roles.Doctor ? req.user.userId : null,
                    opticianId: req.user.role === Roles.Optician ? req.user.userId : null,
               },
               orderBy: {
                    date: 'desc' // Order by createdAt field in descending order (latest first)
               },
               take: 50 // Limit the result to 50 records
          });

          // Check if there are any unseen notifications
          const hasUnseenNotifications = result.some(notification => !notification.seen);

          // Construct the response object
          const response = {
               notifications: result,
               hasUnseenNotifications // Add the flag indicating if there are unseen notifications
          };

          sendApiResponse(res, 'success', response);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const updateNotificationsSeenStatus = async (req: any, res: Response) => {
     try {
          const result = await prisma.notifications.updateMany({
               where: {
                    patientId: req.user.role === Roles.Patient ? req.user.userId : null,
                    doctorId: req.user.role === Roles.Doctor ? req.user.userId : null,
                    opticianId: req.user.role === Roles.Optician ? req.user.userId : null,
                    seen: false
               },
               data: {
                    seen: true // Update the 'seen' field to 'true'
               }
          });
          sendApiResponse(res, 'success', result);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const deleteNotification = async (req: any, res: Response) => {
     const notificationId = req.params.id
     try {
          const result = await prisma.notifications.delete({
               where: {
                    id: notificationId // Assuming notificationId is the ID of the notification you want to delete
               }
          });
          sendApiResponse(res, 'success', result);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};



export { getUnseenNotifications, updateNotificationsSeenStatus, deleteNotification };
