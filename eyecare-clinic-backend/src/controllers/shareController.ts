import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse';
import hashPassword from '../utils/hashPassword';

const prisma = new PrismaClient();

const getShareColorBlindTestOfDoctor = async (req: Request, res: Response) => {
     const { page = 1, pageSize = 100000, search } = req.query;
     const offset = (Number(page) - 1) * Number(pageSize);

     try {
          let whereClause = {};
          if (search) {
               whereClause = {
                    colorBlindTest: {
                         patient: {
                              user: {
                                   username: {
                                        contains: search
                                   }
                              }
                         }
                    }
               };
          }

          const patients = await prisma.colorBlindTestShare.findMany({
               where: whereClause,
               include: {
                    colorBlindTest: {
                         include: {
                              patient: true // Include all fields of patient
                         }
                    }
               },
               skip: offset,
               take: Number(pageSize)
          });

          sendApiResponse(res, 'success', patients);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

export { getShareColorBlindTestOfDoctor };
