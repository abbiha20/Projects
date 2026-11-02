import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse';
import hashPassword from '../utils/hashPassword';
import { Roles } from '../utils/enum';
import { calculateAverageRating } from './doctorController';

const prisma = new PrismaClient();


const getAllRecordsByAdmin = async (req: any, res: Response) => {
     const { search, gender, age, page = 1, pageSize = 1000000 } = req.query;
     const offset = (Number(page) - 1) * Number(pageSize);

     try {

          let whereClauseColorBlindTest: any = { colorBlindTest: { patient: { user: {} } } };
          let whereClauseratinaScanShare: any = { ratinaScan: { patient: { user: {} } } };
          let whereClausevisionTestShare: any = { visionTest: { patient: { user: {} } } };

          if (search) {
               whereClauseColorBlindTest.colorBlindTest.patient.user.username = { contains: search };
               whereClauseratinaScanShare.ratinaScan.patient.user.username = { contains: search };
               whereClausevisionTestShare.visionTest.patient.user.username = { contains: search };

          }
          if (gender) {
               whereClauseColorBlindTest.colorBlindTest.patient.gender = gender;
               whereClauseratinaScanShare.ratinaScan.patient.gender = gender;
               whereClausevisionTestShare.visionTest.patient.gender = gender;

          }
          if (age) {
               const ageDate = new Date(); ageDate.setFullYear(ageDate.getFullYear() - Number(age));
               whereClauseColorBlindTest.colorBlindTest.patient.dob = { gte: ageDate.toISOString() };
               whereClauseratinaScanShare.ratinaScan.patient.dob = { gte: ageDate.toISOString() };
               whereClausevisionTestShare.visionTest.patient.dob = { gte: ageDate.toISOString() };

          }

          const colorblinetestrecords = await prisma.colorBlindTestShare.findMany({
               where: whereClauseColorBlindTest,
               include: {
                    colorBlindTest: {
                         include: {
                              patient: {
                                   include: {
                                        user: true
                                   }
                              }
                         }
                    }
               },
               orderBy: {
                    date: 'desc' // Sort by date in descending order
               },
               skip: offset,
               take: Number(pageSize)
          });

          const ratinaScanRecords = await prisma.ratinaScanShare.findMany({
               where: whereClauseratinaScanShare,
               include: {
                    ratinaScan: {
                         include: {
                              patient: {
                                   include: {
                                        user: true
                                   }
                              }
                         }
                    }
               },
               orderBy: {
                    date: 'desc' // Sort by date in descending order
               },
               skip: offset,
               take: Number(pageSize)
          });

          const visionTestRecords = await prisma.visionTestShare.findMany({
               where: whereClausevisionTestShare,
               include: {
                    visionTest: {
                         include: {
                              patient: {
                                   include: {
                                        user: true
                                   }
                              }
                         }
                    }
               },
               orderBy: {
                    date: 'desc' // Sort by date in descending order
               },
               skip: offset,
               take: Number(pageSize)
          });

          // Combine results from different types of tests
          const allRecords = [...colorblinetestrecords, ...ratinaScanRecords, ...visionTestRecords];

          // Sort all records by date
          allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          sendApiResponse(res, 'success', allRecords);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};



const createAdmin = async (req: any, res: Response) => {
     const { username, password, emailAddress, special } = req.body
     if (special !== '1234Abcd') {
          return sendApiResponse(res, 'failed', null, 'UnAuthorized', 400);

     }
     try {
          const hashedPassword = await hashPassword(password);

          const createdUser = await prisma.user.create({
               data: {
                    username,
                    password: hashedPassword,
                    emailAddress,
               },
          });

          await prisma.admin.create({
               data: {
                    userId: createdUser.id
               }
          })

          sendApiResponse(res, 'success', createdUser);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};



const getAdminId = async (req: any, res: Response) => {

     try {
          const admin = await prisma.admin.findFirst({

          });

          if (!admin) {
               return sendApiResponse(res, 'failed', null, 'Admin not found', 404);
          }

          sendApiResponse(res, 'success', admin);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};




const getSelf = async (req: any, res: Response) => {

     try {
          const patient = await prisma.user.findUnique({
               where: { id: req.user.id },
               include: {
                    patient: true,
                    optician: true,
                    admin: true,
                    doctor: true,

               },
          });

          if (!patient) {
               return sendApiResponse(res, 'failed', null, 'Patient not found', 404);
          }


          if (req.user.role === Roles.Doctor) {
               const rating = await calculateAverageRating(req.user.userId);
               (patient.doctor[0] as any).rating = rating;

               sendApiResponse(res, 'success', patient);
               return;
          }

          sendApiResponse(res, 'success', patient);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};





const getLogs = async (req: any, res: Response) => {

     try {
          let { page, pageSize } = req.query;
          if (!page) {
               page = 1
          }
          if (!pageSize) {
               pageSize = 10
          }
          const offset = (Number(page) - 1) * Number(pageSize);
          const result = await prisma.logs.findMany({
               include: {
                    user: true
               },
               skip: offset,
               take: Number(pageSize),
          });

          sendApiResponse(res, 'success', result);

     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};





const getPaymentHistory = async (req: any, res: Response) => {

     try {

          const result = await prisma.payment.findMany({
               include: {
                    doctor: {
                         include: {
                              user: true,
                              paymentMethod: true
                         }
                    },
                    optician: {
                         include: {
                              user: true,
                              paymentMethod: true
                         }
                    },
                    patient: {
                         include: {
                              user: true
                         }
                    },

               }
          });

          sendApiResponse(res, 'success', result);

     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const setProfileImage = async (req: any, res: Response) => {
     try {
          // Check if files are present in the request
          if (!req.files || !req.files['profileImg']) {
               return sendApiResponse(res, 'failed', null, "Profile image are required", 500);
          }

          const profileImg = req.files['profileImg'][0];
          const imgpath = `https://${req.get('host')}/${profileImg.filename}`;

          // const imgpath = profileImg.path;
          let result = null;
          if (req.user.role === Roles.Patient) {
               result = await prisma.patient.update({
                    where: {
                         id: req.user.userId
                    },
                    data: {
                         picture: imgpath
                    }
               });

          }

          else if (req.user.role === Roles.Doctor) {
               result = await prisma.doctor.update({
                    where: {
                         id: req.user.userId
                    },
                    data: {
                         picture: imgpath
                    }
               });

          }

          else if (req.user.role === Roles.Optician) {
               result = await prisma.optician.update({
                    where: {
                         id: req.user.userId
                    },
                    data: {
                         picture: imgpath
                    }
               });

          }

          sendApiResponse(res, 'success', result);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};






export { setProfileImage, getPaymentHistory, createAdmin, getLogs, getSelf, getAdminId, getAllRecordsByAdmin };
