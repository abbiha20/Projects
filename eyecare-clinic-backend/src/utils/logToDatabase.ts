import { PrismaClient } from '@prisma/client';
import { LogActions } from './enum';

const prisma = new PrismaClient();

const logToDatabase = async (action: LogActions, userId: string) => {
     try {
          await prisma.logs.create({
               data: {
                    action,
                    userId,
                    date: new Date(),
               },
          });
     } catch (error) {
          console.error('Error storing log in the database:', error);
     }
};



export { logToDatabase };
