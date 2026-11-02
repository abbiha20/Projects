import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse';
import hashPassword from '../utils/hashPassword';
import { LogActions } from '../utils/enum';
import { logToDatabase } from '../utils/logToDatabase';

const prisma = new PrismaClient();


const getOpticians = async (req: Request, res: Response) => {
     try {
          const { page = 1, pageSize = 100000, search, gender } = req.query;
          const offset = (Number(page) - 1) * Number(pageSize);

          let whereCondition: any = {};

          if (search) {
               whereCondition = {
                    OR: [
                         {
                              user: {
                                   username: {
                                        contains: search.toString(), // Assuming you're searching by username
                                   },
                              },
                         },
                         {
                              user: {
                                   emailAddress: {
                                        contains: search.toString(), // Assuming you're searching by email address
                                   },
                              },
                         },
                    ],
               };
          }

          // Adding filters for gender and age if provided
          if (gender) {
               whereCondition = {
                    ...whereCondition,
                    gender: gender.toString(),
               };
          }

          const opticians = await prisma.optician.findMany({
               include: {
                    user: {
                         select: {
                              username: true,
                              emailAddress: true,
                         },
                    },
               },
               where: whereCondition,
               skip: offset,
               take: Number(pageSize),
          });


          sendApiResponse(res, 'success', opticians);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const getOpticianById = async (req: Request, res: Response) => {
     const opticianId = req.params.id

     try {
          const optician = await prisma.optician.findUnique({
               where: { id: opticianId },
               include: {
                    user: true,
               },
          });

          if (!optician) {
               return sendApiResponse(res, 'failed', null, 'Optician not found', 404);
          }

          sendApiResponse(res, 'success', optician);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const createOptician = async (req: Request, res: Response) => {
     const {
          businessLocation,
          username,
          password,
          emailAddress,
          services,
          latitude,
          longitude,
          examinationFee,
          bankName,
          accountHolderName,
          accountNumber,
          paymentMethod
     } = req.body;

     if (!businessLocation || !username || !password || !emailAddress || !services || !examinationFee) {
          return sendApiResponse(res, 'failed', null, 'All fields are required', 400);
     }
     try {
          const hashedPassword = await hashPassword(password);

          const result = await prisma.$transaction(async (prisma) => {
               const createdUser = await prisma.user.create({
                    data: {
                         username,
                         password: hashedPassword,
                         emailAddress,
                    },
               });

               let paymentMethodRecord = null;
               if (bankName && accountHolderName && accountNumber && paymentMethod) {
                    paymentMethodRecord = await prisma.paymentMethod.create({
                         data: {
                              bankName,
                              accountHolderName,
                              accountNumber,
                              paymentMethod
                         },
                    });
               }

               const optician = await prisma.optician.create({
                    data: {
                         businessLocation,
                         userId: createdUser.id,
                         services,
                         latitude,
                         longitude,
                         examinationFee,
                         paymentMethodId: paymentMethodRecord ? paymentMethodRecord.id : null
                    },
                    include: {
                         user: true,
                    },
               });

               return { createdUser, optician };
          });

          const { createdUser, optician } = result;

          await logToDatabase(LogActions.NewDoctorRegisterd, createdUser.id);

          sendApiResponse(res, 'success', optician);
     } catch (error: any) {
          console.error(error);

          sendApiResponse(res, 'failed', null, error.message, 500);
     } finally {
          await prisma.$disconnect();
     }
};



const getOpticianDashboard = async (req: any, res: Response) => {


     try {

          const colorblinetestrecords = await prisma.colorBlindTestShare.findMany({
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
               where: {
                    opticianId: req.user.userId
               },
               orderBy: {
                    date: 'desc' // Sort by date in descending order
               },
               skip: 0,
               take: Number(4)
          });

          const ratinaScanRecords = await prisma.ratinaScanShare.findMany({
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
               where: {
                    opticianId: req.user.userId
               },
               orderBy: {
                    date: 'desc' // Sort by date in descending order
               },
               skip: 0,
               take: Number(1)
          });

          const visionTestRecords = await prisma.visionTestShare.findMany({
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
               where: {
                    opticianId: req.user.userId
               },
               orderBy: {
                    date: 'desc'
               },
               skip: 0,
               take: Number(1)
          });




          let chats = await prisma.chat.findMany({
               where: {
                    opticianId: req.user.userId
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
               take: 3

          });


          const allRecords = [...colorblinetestrecords, ...ratinaScanRecords, ...visionTestRecords];

          // Sort all records by date
          allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          sendApiResponse(res, 'success', { records: allRecords, chats });
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const getAllOpticianRecords = async (req: any, res: Response) => {
     const { search, gender, age, page = 1, pageSize = 10 } = req.query;
     const offset = (Number(page) - 1) * Number(pageSize);

     try {

          let whereClauseColorBlindTest: any = {
               colorBlindTest: {
                    patient: {
                         user: {}
                    }
               },
               opticianId: req.user.userId
          };

          let whereClauseratinaScanShare: any = {
               ratinaScan: {
                    patient: {
                         user: {}
                    }
               },
               opticianId: req.user.userId
          };

          let whereClausevisionTestShare: any = {
               visionTest: {
                    patient: {
                         user: {}
                    }
               },
               opticianId: req.user.userId
          };

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

const updateOptician = async (req: any, res: Response) => {
     const { businessLocation, services, username } = req.body;
     try {
          const existingOptician = await prisma.optician.findUnique({
               where: {
                    id: req.user.userId,
               },
               include: {
                    user: true,
               },
          });

          if (!existingOptician) {
               // Doctor with the same id not found
               return sendApiResponse(res, 'failed', null, 'Doctor Not Found', 400);
          }

          const updatedOptician = await prisma.optician.update({
               where: { id: existingOptician.id },
               data: {
                    businessLocation,
                    services,
                    user: {
                         update: {
                              username,
                         },
                    },
               },
               include: {
                    user: true,
               },
          });
          await logToDatabase(LogActions.ProfileUpdate, req.user.id);

          sendApiResponse(res, 'success', updatedOptician);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const deleteOptician = async (req: Request, res: Response) => {
     const opticianId = req.params.id

     try {
          const optician = await prisma.optician.findUnique({
               where: { id: opticianId },
               include: {
                    user: true,
               },
          });

          if (!optician) {
               return sendApiResponse(res, 'failed', null, 'Optician not found', 404);
          }

          await prisma.optician.delete({
               where: { id: opticianId },
          });

          await prisma.user.delete({
               where: { id: optician.user.id },
          });

          sendApiResponse(res, 'success', { message: 'Optician and associated user deleted successfully' });
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

export { getOpticians, getAllOpticianRecords, getOpticianById, getOpticianDashboard, createOptician, updateOptician, deleteOptician };
