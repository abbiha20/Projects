import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse';
import { logToDatabase } from '../utils/logToDatabase';
import { LogActions } from '../utils/enum';

const prisma = new PrismaClient();

const createVisionTest = async (req: any, res: Response) => {
     const {
          ipd,
          rightVaUnaided,
          rightVaAided,
          leftVaUnaided,
          leftVaAided,
          nearVisionLeft,
          nearVisionRight,
          nearVisionBottomLeft,
          nearVisionBottomRight,
          leftleftVisionField,
          leftVisionField,
          rightrightVisionField,
          rightField
     } = req.body;

     // Parse values to integers
     const parsedIpd = parseInt(ipd);
     const parsedRightVaUnaided = parseInt(rightVaUnaided);
     const parsedRightVaAided = parseInt(rightVaAided);
     const parsedLeftVaUnaided = parseInt(leftVaUnaided);
     const parsedLeftVaAided = parseInt(leftVaAided);
     const parsedNearVisionLeft = parseInt(nearVisionLeft);
     const parsedNearVisionRight = parseInt(nearVisionRight);
     const parsedNearVisionBottomLeft = parseInt(nearVisionBottomLeft);
     const parsedNearVisionBottomRight = parseInt(nearVisionBottomRight);
     const parsedLeftleftVisionField = parseInt(leftleftVisionField);
     const parsedLeftVisionField = parseInt(leftVisionField);
     const parsedRightrightVisionField = parseInt(rightrightVisionField);
     const parsedRightField = parseInt(rightField);

     try {
          const visionTest = await prisma.visionTest.create({
               data: {
                    patientId: req.user.userId,
                    ipd: parsedIpd,
                    rightVaUnaided: parsedRightVaUnaided,
                    rightVaAided: parsedRightVaAided,
                    leftVaUnaided: parsedLeftVaUnaided,
                    leftVaAided: parsedLeftVaAided,
                    nearVisionLeft: parsedNearVisionLeft,
                    nearVisionRight: parsedNearVisionRight,
                    nearVisionBottomLeft: parsedNearVisionBottomLeft,
                    nearVisionBottomRight: parsedNearVisionBottomRight,
                    leftleftVisionField: parsedLeftleftVisionField,
                    leftVisionField: parsedLeftVisionField,
                    rightrightVisionField: parsedRightrightVisionField,
                    rightField: parsedRightField,
                    date: new Date(),
               },
               include: {
                    patient: true,
               },
          });
          await logToDatabase(LogActions.TestAdded, req.user.id);

          sendApiResponse(res, 'success', visionTest);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const getVisionTestById = async (req: Request, res: Response) => {
     const visionTestId = req.params.id

     try {
          const visionTest = await prisma.visionTest.findUnique({
               where: { id: visionTestId },
               include: {
                    patient: true,
               },
          });

          if (!visionTest) {
               return sendApiResponse(res, 'failed', null, 'VisionTest not found', 404);
          }

          sendApiResponse(res, 'success', visionTest);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const deleteVisionTest = async (req: Request, res: Response) => {
     const visionTestId = req.params.id

     try {
          await prisma.visionTest.delete({
               where: { id: visionTestId },
          });

          sendApiResponse(res, 'success', { message: 'VisionTest deleted successfully' });
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const getVisionTestsByRelatedId = async (req: Request, res: Response) => {
     const { patientId, doctorId, opticianId } = req.body;

     try {
          let ratinaScanTests;

          if (patientId) {
               ratinaScanTests = await prisma.visionTest.findMany({
                    where: {
                         patientId: patientId,
                    },

                    orderBy: {
                         date: 'desc'
                    }
               });
          }

          sendApiResponse(res, 'success', ratinaScanTests);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

export { createVisionTest, getVisionTestsByRelatedId, getVisionTestById, deleteVisionTest };
