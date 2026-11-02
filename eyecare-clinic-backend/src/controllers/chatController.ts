import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse';
import { logToDatabase } from '../utils/logToDatabase';
import { LogActions } from '../utils/enum';

const prisma = new PrismaClient();


const sendMessage = async (req: any, res: Response) => {
     const { patientId, doctorId, isRx, adminId, opticianId, message, appointmentDate } = req.body;

     try {

          if (!message && appointmentDate) {
               sendApiResponse(res, 'Please enter a message', null, 'Please enter a message', 400);
               return;
          }


          let picture = null
          if (req.files && req.files['picture']) {
               const File = req.files['picture'][0];
               picture = `https://${req.get('host')}/${File.filename}`
          }

          await logToDatabase(appointmentDate ? LogActions.Appoitment : isRx ? LogActions.Prescription : LogActions.Message, req.user.id);

          let receiverId;

          if (patientId && patientId !== req.user.userId) {
               receiverId = patientId;
          } else if (doctorId && doctorId !== req.user.userId) {
               receiverId = doctorId;
          } else if (opticianId && opticianId !== req.user.userId) {
               receiverId = opticianId;
          } else if (adminId && adminId !== req.user.userId) {
               receiverId = adminId;
          }

          const senderId =
               req.user.userId === patientId ? patientId :
                    req.user.userId === doctorId ? doctorId :
                         req.user.userId === opticianId ? opticianId :
                              req.user.userId === adminId ? adminId :
                                   null;

          let existingChat = await prisma.chat.findFirst({
               where: {
                    patientId,
                    doctorId,
                    opticianId,
                    adminId
               },
               include: {
                    message: {
                         take: 50,
                         orderBy: {
                              sentAt: 'desc'
                         }
                    }
               }
          });

          if (existingChat) {
               const result = await prisma.message.create({
                    data: {
                         chatId: existingChat.id,
                         message,
                         receiver: receiverId,
                         sender: senderId,
                         isRx: isRx ? true : false,
                         appointmentDate: appointmentDate ? appointmentDate : null,
                         isAppoitment: appointmentDate ? true : false,
                         picture
                    }

               })
               if (!existingChat.isAccepted && !receiverId !== req.user.userId) {
                    await prisma.chat.update({
                         where: {
                              id: existingChat.id
                         },
                         data: {
                              isAccepted: true
                         }
                    })
               }
               existingChat.message.unshift(result);

               // Create a new array with modified message objects
               const modifiedMessages = existingChat.message.map(msg => ({
                    ...msg,
                    isSender: msg.sender === req.user.userId
               }));


               const notification = await prisma.notifications.create({
                    data: {
                         date: new Date(),
                         prescription: isRx ? true : false,
                         appointment: appointmentDate ? true : false,
                         chatId: existingChat.id,
                         doctorId: req.user.userId === doctorId ? null : doctorId,
                         patientId: req.user.userId === patientId ? null : patientId,
                         opticianId: req.user.userId === opticianId ? null : opticianId

                    }
               });



               sendApiResponse(res, 'success', { ...existingChat, message: modifiedMessages });
               return;
          }

          const chat = await prisma.chat.create({
               data: {
                    patientId,
                    doctorId,
                    adminId,
                    opticianId,
                    message: {
                         create: {
                              message,
                              receiver: receiverId,
                              sender: senderId,
                              isRx: isRx ? true : false,
                              appointmentDate: appointmentDate ? appointmentDate : null,
                              isAppoitment: appointmentDate ? true : false,
                              picture
                         }
                    }
               },
               include: {
                    message: true
               }
          });
          const updatedMessages = chat.message.map(message => ({
               ...message,
               isSender: true
          }));

          // Merge updatedMessages with chat object
          const updatedChat = {
               ...chat,
               message: updatedMessages
          };

          const notification = await prisma.notifications.create({
               data: {
                    date: new Date(),
                    chatId: chat.id,
                    prescription: isRx ? true : false,
                    appointment: appointmentDate ? true : false,
                    doctorId: req.user.userId === doctorId ? null : doctorId,
                    patientId: req.user.userId === patientId ? null : patientId,
                    opticianId: req.user.userId === opticianId ? null : opticianId

               }
          });

          sendApiResponse(res, 'success', updatedChat);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const getChat = async (req: any, res: Response) => {
     const { patientId, doctorId, isRx, adminId, opticianId } = req.body;

     try {
          let existingChat = await prisma.chat.findFirst({
               where: {
                    patientId,
                    doctorId,
                    adminId,
                    opticianId
               },
               include: {
                    message: {
                         take: 50,
                         orderBy: {
                              sentAt: 'desc'
                         }
                    },
                    doctor: true,
                    optician: true
               }
          });

          if (!existingChat) {
               sendApiResponse(res, 'success', []);

          }
          else {

               const modifiedMessages = existingChat.message.map(msg => ({
                    ...msg,
                    isSender: msg.sender === req.user.userId
               }));

               sendApiResponse(res, 'success', { ...existingChat, message: modifiedMessages, examinationFee: existingChat.doctor?.examinationFee });
               return;
          }
     }
     catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};






const getAllChats = async (req: any, res: Response) => {
     const { patientId, doctorId, adminId, opticianId } = req.body;
     try {
          let result = await prisma.chat.findMany({
               where: {
                    patientId,
                    doctorId,
                    adminId,
                    opticianId
               },
               include: {
                    patient: {
                         include: {
                              user: true
                         }
                    },
                    message: {
                         take: 1,
                         orderBy: {
                              sentAt: 'desc'
                         }
                    }
               },

          });
          result = result.sort((a, b) => {
               const aMessageDate = a.message[0]?.sentAt?.getTime() ?? 0;
               const bMessageDate = b.message[0]?.sentAt?.getTime() ?? 0;
               return bMessageDate - aMessageDate; // Sort in descending order
          });

          sendApiResponse(res, 'success', result);

          return;
     }

     catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


export { sendMessage, getChat, getAllChats };
