import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse';
import hashPassword from '../utils/hashPassword';
import { LogActions } from '../utils/enum';
import { logToDatabase } from '../utils/logToDatabase';
const stripe = require('stripe')(process.env.STRIPE_PRIVATEKEY);

const prisma = new PrismaClient();

const getPatients = async (_req: Request, res: Response) => {
     try {
          const patients = await prisma.patient.findMany({
               include: {
                    user: true,
               },
          });
          sendApiResponse(res, 'success', patients);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const getSelf = async (req: any, res: Response) => {

     try {
          const patient = await prisma.patient.findUnique({
               where: { id: req.user.userId },
               include: {
                    user: true,
               },
          });

          if (!patient) {
               return sendApiResponse(res, 'failed', null, 'Patient not found', 404);
          }

          sendApiResponse(res, 'success', patient);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const createPatient = async (req: Request, res: Response) => {
     const { gender, dob, picture, username, password, emailAddress } = req.body;

     // Check if any required field is missing
     if (!gender || !dob || !username || !password || !emailAddress) {
          return sendApiResponse(res, 'failed', null, 'All fields are required', 400);
     }

     const dobDate = new Date(dob);
     const hashedPassword = await hashPassword(password);
     try {
          // Check if a user with the given email already exists
          const existingUser = await prisma.user.findUnique({
               where: {
                    emailAddress,
               },
          });

          if (existingUser) {
               // User with the same email already exists
               return sendApiResponse(res, 'failed', null, 'User with the same email already exists', 400);
          }

          const createdUser = await prisma.user.create({
               data: {
                    username,
                    password: hashedPassword,
                    emailAddress,
               },
          });

          const patient = await prisma.patient.create({
               data: {
                    gender,
                    dob: dobDate,
                    picture,
                    userId: createdUser.id,
               },
               include: {
                    user: true,
               },
          });
          await logToDatabase(LogActions.NewDoctorRegisterd, createdUser.id);

          sendApiResponse(res, 'success', patient);
     } catch (error: any) {
          console.error(error.message);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const updatePatient = async (req: any, res: Response) => {
     const { dob, username } = req.body;

     const dobDate = new Date(dob);

     try {
          // Check if a user with the given email already exists
          const existingUser = await prisma.patient.findUnique({
               where: {
                    id: req.user.userId,
               },
          });

          if (!existingUser) {
               // User with the same email already exists, and it's not the same patient being updated
               return sendApiResponse(res, 'failed', null, 'User Not Found', 400);
          }

          const updatedPatient = await prisma.patient.update({
               where: { id: existingUser.id },
               data: {
                    dob: dobDate,
                    user: {
                         update: {
                              username,
                         },
                    },
               }
          });
          await logToDatabase(LogActions.ProfileUpdate, req.user.id);

          sendApiResponse(res, 'success', updatedPatient);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};




const createPayment = async (req: Request, res: Response) => {
     const { amount, currency } = req.body;

     try {
          const customer = await stripe.customers.create();
          const ephemeralKey = await stripe.ephemeralKeys.create(
               { customer: customer.id },
               { apiVersion: '2024-04-10' }
          );
          const paymentIntent = await stripe.paymentIntents.create({
               amount: amount,
               currency: currency,
               customer: customer.id,
               automatic_payment_methods: {
                    enabled: true,
               },
          });


          sendApiResponse(res, 'success', {
               paymentIntent: paymentIntent.client_secret,
               ephemeralKey: ephemeralKey.secret,
               customer: customer.id,
          });
     }

     catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const savePaymentRecord = async (req: any, res: Response) => {
     const { doctorId, opticianId, appointmentDate, paidAmount } = req.body;

     try {

          const result = await prisma.payment.create({
               data: {
                    date: new Date(),
                    doctorId,
                    opticianId,
                    appointmentDate: new Date(appointmentDate),
                    patientId: req.user.userId,
                    paidAmount
               }
          })

          sendApiResponse(res, 'success', result);
     }

     catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};



const deletePatient = async (req: Request, res: Response) => {
     const patientId = req.params.id;

     try {
          const patient = await prisma.patient.findUnique({
               where: { id: patientId },
               include: {
                    user: true,
               },
          });

          if (!patient) {
               return sendApiResponse(res, 'failed', null, 'Patient not found', 404);
          }

          await prisma.patient.delete({
               where: { id: patientId },
          });

          await prisma.user.delete({
               where: { id: patient.user.id },
          });

          sendApiResponse(res, 'success', { message: 'Patient and associated user deleted successfully' });
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const shareColorBlindTest = async (req: any, res: Response) => {
     const { doctorId, opticianId, colorBlindTestId } = req.body;

     try {
          // Check if the record already exists
          const existingRecord = await prisma.colorBlindTestShare.findFirst({
               where: {
                    patientId: req.user.userId,
                    doctorId,
                    opticianId,
                    colorBlindTestId
               }
          });

          // If the record already exists, send an error response
          if (existingRecord) {
               return sendApiResponse(res, 'failed', null, 'Record already exists', 400);
          }

          // If the record does not exist, create it
          const result = await prisma.colorBlindTestShare.create({
               data: {
                    patientId: req.user.userId,
                    date: new Date(),
                    doctorId,
                    opticianId,
                    colorBlindTestId
               }
          });

          // Create a notification for the newly created record
          const notification = await prisma.notifications.create({
               data: {
                    date: new Date(),
                    colorBlindTestShareId: result.id,
                    doctorId,
                    opticianId
               }
          });

          await logToDatabase(LogActions.Share, req.user.id);


          sendApiResponse(res, 'success', result);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const shareRatinScan = async (req: any, res: Response) => {
     const { doctorId, opticianId, ratinaScanId } = req.body

     try {

          // Check if the record already exists
          const existingRecord = await prisma.ratinaScanShare.findFirst({
               where: {
                    patientId: req.user.userId,
                    doctorId,
                    opticianId,
                    ratinaScanId
               }
          });

          // If the record already exists, send an error response
          if (existingRecord) {
               return sendApiResponse(res, 'failed', null, 'Record already exists', 400);
          }

          const result = await prisma.ratinaScanShare.create({
               data: {
                    patientId: req.user.userId,
                    date: new Date(),
                    doctorId,
                    opticianId,
                    ratinaScanId
               }
          });

          const notification = await prisma.notifications.create({
               data: {
                    date: new Date(),
                    ratinaScanShareId: result.id,
                    doctorId,
                    opticianId
               }
          });

          await logToDatabase(LogActions.Share, req.user.id);

          sendApiResponse(res, 'success', result);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};



const getDashboardHistory = async (req: any, res: Response) => {
     try {

          const colorBlindTest = await prisma.colorBlindTest.findMany({
               where: {
                    patientId: req.user.userId,
               },
               take: 3,
               orderBy: {
                    date: 'desc'
               }
          });

          const visionTest = await prisma.visionTest.findMany({
               where: {
                    patientId: req.user.userId,
               },
               take: 3,
               orderBy: {
                    date: 'desc'
               }
          });


          const ratinaScanTest = await prisma.ratinaScan.findMany({
               where: {
                    patientId: req.user.userId,
               },
               take: 3,
               orderBy: {
                    date: 'desc'
               }
          });





          sendApiResponse(res, 'success', { colorBlindTest, ratinaScanTest, visionTest });
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};


const shareVisionTest = async (req: any, res: Response) => {
     const { doctorId, opticianId, visionTestId } = req.body

     console.log(req.user.userId)
     try {

          const existingRecord = await prisma.visionTestShare.findFirst({
               where: {
                    patientId: req.user.userId,
                    doctorId,
                    opticianId,
                    visionTestId
               }
          });

          // If the record already exists, send an error response
          if (existingRecord) {
               return sendApiResponse(res, 'failed', null, 'Record already exists', 400);
          }

          const result = await prisma.visionTestShare.create({
               data: {
                    patientId: req.user.userId,
                    date: new Date(),
                    doctorId,
                    opticianId,
                    visionTestId
               }
          });

          const notification = await prisma.notifications.create({
               data: {
                    date: new Date(),
                    visionTestShareId: result.id,
                    doctorId,
                    opticianId
               }
          });

          await logToDatabase(LogActions.Share, req.user.id);

          sendApiResponse(res, 'success', result);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};

const giveRatingToDoctor = async (req: any, res: Response) => {
     const { doctorId, rating } = req.body

     try {
          const result = await prisma.doctorRating.create({
               data: {
                    doctorId,
                    patientId: req.user.userId,
                    rating,
                    date: new Date()
               }
          });


          sendApiResponse(res, 'success', result);
     } catch (error: any) {
          console.error(error);
          sendApiResponse(res, 'failed', null, error.message, 500);
     }
};






export { getPatients, getDashboardHistory, savePaymentRecord, createPayment, getSelf, createPatient, updatePatient, deletePatient, shareColorBlindTest, shareRatinScan, shareVisionTest, giveRatingToDoctor };
