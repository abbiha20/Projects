// controllers/authController.ts
import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { calculateAverageRating } from '../controllers/doctorController'
import { PrismaClient } from '@prisma/client';
import sendApiResponse from '../utils/apiResponse'; // Replace with the actual path
import { LogActions, Roles } from '../utils/enum';
import authenticateToken from '../middleware/authMiddleware';
import { logToDatabase } from '../utils/logToDatabase';

const prisma = new PrismaClient();

const signin = async (req: Request, res: Response) => {
     const { emailAddress, password } = req.body;

     try {
          const user = await prisma.user.findUnique({
               where: { emailAddress },
               include: {
                    patient: true,
                    optician: true,
                    doctor: true,
                    admin: true,
               },
          });

          if (!user) {
               return sendApiResponse(res, 'Invalid username or password', null, 'Invalid username or password', 401);
          }

          // Determine role based on related tables
          let role = '';
          let userId = "abc";
          if (user.patient.length > 0) {
               role = Roles.Patient;
               userId = user.patient[0].id
          } else if (user.optician.length > 0) {
               role = Roles.Optician;
               userId = user.optician[0].id
          } else if (user.doctor.length > 0) {
               const rating = await calculateAverageRating(user.doctor[0].id);
               (user.doctor[0] as any).rating = rating;

               userId = user.doctor[0].id
               role = Roles.Doctor;
          } else if (user.admin.length > 0) {
               userId = user.admin[0].id
               role = Roles.Admin;
          } else {
               // If user is not related to any specific role
               return sendApiResponse(res, 'Invalid username or password', null, 'Invalid username or password', 401);
          }

          return handleSignInResponse(user, role, userId, password, res);
     } catch (error) {
          console.error(error);
          sendApiResponse(res, 'Internal Server Error', null, 'Internal Server Error', 500);
     }
};

const handleSignInResponse = async (user: any, role: string, userId: String, password: string, res: Response) => {
     const passwordMatch = await bcrypt.compare(password, user.password);

     if (!passwordMatch) {
          return sendApiResponse(res, 'Invalid username or password', null, 'Invalid username or password', 401);
     }

     const token = jwt.sign(
          {
               id: user.id,
               userId,
               username: user.username,
               role,
          },
          process.env.JWT_SECRETKEY as Secret,
          { expiresIn: '10y' } // You can adjust the expiration time
     );
     user.role = role;

     await logToDatabase(LogActions.Login, user.id);


     sendApiResponse(res, 'Success', { token, user: { ...user, password: undefined } });
};


export { signin };
