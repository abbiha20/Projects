import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse';
import { LogActions } from '../utils/enum';
import { logToDatabase } from '../utils/logToDatabase';

const prisma = new PrismaClient();

const createColorBlindTest = async (req: any, res: Response) => {
     const { score } = req.body;

     try {
          const colorBlindTest = await prisma.colorBlindTest.create({
               data: {
                    patientId: req.user.userId,
                    score,
                    date: new Date(),
               },
               include: {
                    patient: true,
               },
          });
          console.log(req.user)
          await logToDatabase(LogActions.TestAdded, req.user.id);


          sendApiResponse(res, 'success', colorBlindTest);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const getColorBlindTestsByRelatedId = async (req: any, res: Response) => {
     const { patientId, doctorId, opticianId } = req.body;
     try {
          let colorBlindTests;

          if (patientId) {
               colorBlindTests = await prisma.colorBlindTest.findMany({
                    where: {
                         patientId,
                    },
                    orderBy: {
                         date: 'desc'
                    }
               });
          }

          sendApiResponse(res, 'success', colorBlindTests);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const updateColorBlindTest = async (req: any, res: Response) => {
     const colorBlindTestId = req.params.id
     const { score } = req.body;

     try {
          const updatedColorBlindTest = await prisma.colorBlindTest.update({
               where: { id: colorBlindTestId },
               data: { score },
               include: {
                    patient: true,
               },
          });

          await logToDatabase(LogActions.UpdatedTest, req.user.id);

          sendApiResponse(res, 'success', updatedColorBlindTest);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const deleteColorBlindTest = async (req: Request, res: Response) => {
     const colorBlindTestId = req.params.id

     try {
          await prisma.colorBlindTest.delete({
               where: { id: colorBlindTestId },
          });

          sendApiResponse(res, 'success', { message: 'ColorBlindTest deleted successfully' });
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

export { createColorBlindTest, updateColorBlindTest, deleteColorBlindTest, getColorBlindTestsByRelatedId };
