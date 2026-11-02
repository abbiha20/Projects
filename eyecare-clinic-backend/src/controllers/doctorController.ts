import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse';
import hashPassword from '../utils/hashPassword';
import { LogActions } from '../utils/enum';
import { logToDatabase } from '../utils/logToDatabase';

const prisma = new PrismaClient();

const getDoctors = async (req: Request, res: Response) => {
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

          const doctors = await prisma.doctor.findMany({
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

          // Calculate and include rating for each doctor
          for (const doctor of doctors) {
               const rating = await calculateAverageRating(doctor.id) || 0;
               (doctor as any).rating = rating;
          }

          sendApiResponse(res, 'success', doctors);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};



const getAppointments = async (req: any, res: Response) => {
     try {
          const { page = 1, pageSize = 100000, search, gender } = req.query;
          const offset = (Number(page) - 1) * Number(pageSize);


          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          const appointments = await prisma.message.findMany({
               where: {
                    isAppoitment: true,
                    appointmentDate: {
                         gte: yesterday
                    },
                    receiver: req.user.userId
               },
               include: {
                    chat: {
                         include: {
                              doctor: {
                                   include: {
                                        user: true
                                   }
                              }
                         }
                    }

               },
               skip: offset,
               take: Number(pageSize),
          });


          sendApiResponse(res, 'success', appointments);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const getDoctorById = async (req: Request, res: Response) => {
     const doctorId = req.params.id

     try {
          const doctor = await prisma.doctor.findUnique({
               where: { id: doctorId },
               include: {
                    user: true,
               },
          });

          if (!doctor) {
               return sendApiResponse(res, 'failed', null, 'Doctor not found', 404);
          }

          sendApiResponse(res, 'success', doctor);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};
const createDoctor = async (req: Request, res: Response) => {
     const {
          gender,
          category,
          department,
          yearOfExperience,
          speciality,
          examinationFee,
          consultationSchedule,
          consultationHours,
          hospitalAddress,
          contactNo,
          picture,
          username,
          password,
          emailAddress,
          latitude,
          longitude,
          bankName,
          accountHolderName,
          accountNumber,
          paymentMethod
     } = req.body;

     const prisma = new PrismaClient();

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

               const doctor = await prisma.doctor.create({
                    data: {
                         gender,
                         category,
                         department,
                         yearOfExperience,
                         speciality,
                         examinationFee,
                         consultationSchedule,
                         consultationHours,
                         hospitalAddress,
                         contactNo,
                         picture,
                         latitude,
                         longitude,
                         userId: createdUser.id,
                         paymentMethodId: paymentMethodRecord ? paymentMethodRecord.id : null
                    },
                    include: {
                         user: true,
                    },
               });

               return { createdUser, doctor };
          });

          const { createdUser, doctor } = result;

          await logToDatabase(LogActions.NewDoctorRegisterd, createdUser.id);

          sendApiResponse(res, 'success', doctor);
     } catch (error: any) {
          console.error(error);

          sendApiResponse(res, 'failed', null, error.message, 500);
     } finally {
          await prisma.$disconnect();
     }
};

const updateDoctor = async (req: any, res: Response) => {
     const { examinationFee, consultationSchedule, consultationHours, username } = req.body;
     try {
          // Check if a doctor with the given id exists
          const existingDoctor = await prisma.doctor.findUnique({
               where: {
                    id: req.user.userId,
               },
               include: {
                    user: true,
               },
          });

          if (!existingDoctor) {
               // Doctor with the same id not found
               return sendApiResponse(res, 'failed', null, 'Doctor Not Found', 400);
          }

          const updatedDoctor = await prisma.doctor.update({
               where: { id: existingDoctor.id },
               data: {
                    examinationFee,
                    consultationSchedule,
                    consultationHours,
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


          sendApiResponse(res, 'success', updatedDoctor);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const deleteDoctor = async (req: Request, res: Response) => {
     const doctorId = req.params.id

     try {
          const doctor = await prisma.doctor.findUnique({
               where: { id: doctorId },
               include: {
                    user: true,
               },
          });

          if (!doctor) {
               return sendApiResponse(res, 'failed', null, 'Doctor not found', 404);
          }

          await prisma.doctor.delete({
               where: { id: doctorId },
          });

          await prisma.user.delete({
               where: { id: doctor.user.id },
          });

          sendApiResponse(res, 'success', { message: 'Doctor and associated user deleted successfully' });
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const getUpdatedDoctorRating = async (req: any, res: Response) => {

     try {

          let rating = await calculateAverageRating(req.user.userId)

          sendApiResponse(res, 'success', { rating });
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};



const calculateAverageRating = async (doctorId: string) => {
     const ratings = await prisma.doctorRating.findMany({
          where: { doctorId },
     });

     if (ratings.length === 0) {
          return null;
     }

     const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
     const averageRating = totalRating / ratings.length;
     return averageRating.toFixed(1);
};



const getPatientsOfDoctor = async (req: any, res: Response) => {
     const { search, page = 1, pageSize = 100000 } = req.query;
     const offset = (Number(page) - 1) * Number(pageSize);

     try {
          let whereClause = {};
          if (search) {
               whereClause = {
                    doctorId: req.user.userId,
                    AND: {
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

          // Fetch distinct patient IDs
          const distinctPatientIds = await prisma.notifications.findMany({
               where: whereClause,
               select: {
                    patientId: true
               },
               distinct: ['patientId']
          });

          // Extract patient IDs from the result, filtering out null values
          const patientIds = distinctPatientIds.map(item => item.patientId).filter(id => id !== null) as string[];

          // Use distinct patient IDs in the main query
          const result = await prisma.notifications.findMany({
               where: {
                    doctorId: req.user.userId,
                    patientId: {
                         in: patientIds
                    }
               },
               include: {
                    patient: true
               },
               skip: offset,
               take: Number(pageSize)
          });

          sendApiResponse(res, 'success', result);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};
const getAllRecords = async (req: any, res: Response) => {
     const { search, gender, age, page = 1, pageSize = 10 } = req.query;
     const offset = (Number(page) - 1) * Number(pageSize);

     try {

          let whereClauseColorBlindTest: any = {
               colorBlindTest: {
                    patient: {
                         user: {}
                    }
               },
               doctorId: req.user.userId
          };

          let whereClauseratinaScanShare: any = {
               ratinaScan: {
                    patient: {
                         user: {}
                    }
               },
               doctorId: req.user.userId
          };

          let whereClausevisionTestShare: any = {
               visionTest: {
                    patient: {
                         user: {}
                    }
               },
               doctorId: req.user.userId
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



// const getDoctorDashboard = async (req: any, res: Response) => {


//      try {

//           const colorblinetestrecords = await prisma.colorBlindTestShare.findMany({
//                include: {
//                     colorBlindTest: {
//                          include: {
//                               patient: {
//                                    include: {
//                                         user: true
//                                    }
//                               }
//                          }
//                     }
//                },
//                orderBy: {
//                     date: 'desc' // Sort by date in descending order
//                },
//                skip: 0,
//                take: Number(1)
//           });

//           const ratinaScanRecords = await prisma.ratinaScanShare.findMany({
//                include: {
//                     ratinaScan: {
//                          include: {
//                               patient: {
//                                    include: {
//                                         user: true
//                                    }
//                               }
//                          }
//                     }
//                },
//                orderBy: {
//                     date: 'desc' // Sort by date in descending order
//                },
//                skip: 0,
//                take: Number(1)
//           });

//           const visionTestRecords = await prisma.visionTestShare.findMany({
//                include: {
//                     visionTest: {
//                          include: {
//                               patient: {
//                                    include: {
//                                         user: true
//                                    }
//                               }
//                          }
//                     }
//                },
//                orderBy: {
//                     date: 'desc'
//                },
//                skip: 0,
//                take: Number(1)
//           });




//           let chats = await prisma.chat.findMany({
//                where: {
//                     doctorId: req.user.userId
//                },
//                include: {
//                     patient: {
//                          include: {
//                               user: true
//                          }
//                     },
//                     message: {
//                          take: 1,
//                          orderBy: {
//                               sentAt: 'desc'
//                          }
//                     }
//                },
//                take: 3

//           });


//           const allRecords = [...colorblinetestrecords, ...ratinaScanRecords, ...visionTestRecords];

//           // Sort all records by date
//           allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

//           sendApiResponse(res, 'success', { records: allRecords, chats });
//      } catch (error: any) {
//           console.error(error);
//           sendApiResponse(res, 'failed', null, error.message, 500);
//      }
// };




const getDoctorDashboard = async (req: any, res: Response) => {


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
                    doctorId: req.user.userId
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
                    doctorId: req.user.userId
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
                    doctorId: req.user.userId
               },
               orderBy: {
                    date: 'desc'
               },
               skip: 0,
               take: Number(1)
          });




          let chats = await prisma.chat.findMany({
               where: {
                    doctorId: req.user.userId
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

export { getDoctors, getDoctorById, getAppointments, getUpdatedDoctorRating, getDoctorDashboard, createDoctor, getAllRecords, calculateAverageRating, updateDoctor, deleteDoctor, getPatientsOfDoctor };


