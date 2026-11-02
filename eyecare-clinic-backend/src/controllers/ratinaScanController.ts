import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse';
import { logToDatabase } from '../utils/logToDatabase';
import { LogActions } from '../utils/enum';

const prisma = new PrismaClient();


const createRatinaScan = async (req: any, res: Response) => {
     try {
          // Check if files are present in the request
          if (!req.files || !req.files['leftEye'] || !req.files['rightEye']) {
               return sendApiResponse(res, 'failed', null, "left eye and right eye images are required", 500);
          }
          const leftEyeFile = req.files['leftEye'][0];
          const rightEyeFile = req.files['rightEye'][0];

          // Construct URLs for the uploaded files
          const leftEyePath = `https://${req.get('host')}/${leftEyeFile.filename}`;
          const rightEyePath = `https://${req.get('host')}/${rightEyeFile.filename}`;


          // Save the paths to the database
          const ratinaScan = await prisma.ratinaScan.create({
               data: {
                    patientId: req.user.userId,
                    leftEye: leftEyePath,
                    rightEye: rightEyePath,
                    date: new Date(),
               },
               include: {
                    patient: true,
               },
          });
          await logToDatabase(LogActions.TestAdded, req.user.id);
          sendApiResponse(res, 'success', ratinaScan);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const getRatinaScansByRelatedId = async (req: Request, res: Response) => {
     const { patientId, doctorId, opticianId } = req.body;

     try {
          let ratinaScanTests;

          if (patientId) {
               ratinaScanTests = await prisma.ratinaScan.findMany({
                    where: {
                         patientId: patientId,
                    },

                    orderBy: {
                         date: 'desc'
                    }
               });
          }
          // else if (doctorId) {
          //      ratinaScanTests = await prisma.ratinaScan.findMany({
          //           where: {
          //                doctorId: parseInt(doctorId),
          //           },

          //           orderBy: {
          //                date: 'desc'
          //           }
          //      });
          // } else if (opticianId) {
          //      ratinaScanTests = await prisma.ratinaScan.findMany({
          //           where: {
          //                opticianId: parseInt(opticianId),
          //           },
          //           orderBy: {
          //                date: 'desc'
          //           }
          //      });
          // } else {
          //      return res.status(400).json({ error: "No valid ID provided" });
          // }

          sendApiResponse(res, 'success', ratinaScanTests);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const getRatinaScanById = async (req: Request, res: Response) => {
     const ratinaScanId = req.params.id

     try {
          const ratinaScan = await prisma.ratinaScan.findUnique({
               where: { id: ratinaScanId },
               include: {
                    patient: true,
               },
          });

          if (!ratinaScan) {
               return sendApiResponse(res, 'failed', null, 'RatinaScan not found', 404);
          }

          sendApiResponse(res, 'success', ratinaScan);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const deleteRatinaScan = async (req: Request, res: Response) => {
     const ratinaScanId = req.params.id

     try {
          await prisma.ratinaScan.delete({
               where: { id: ratinaScanId },
          });

          sendApiResponse(res, 'success', { message: 'RatinaScan deleted successfully' });
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

export { createRatinaScan, getRatinaScansByRelatedId, getRatinaScanById, deleteRatinaScan };