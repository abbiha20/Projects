import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorMiddleware';

import patientRoute from './routes/patientRoutes'
import doctorRoute from './routes/doctorRoutes'
import notificationRoutes from './routes/notificationRoutes'
import authRoute from './routes/authRoutes'
import chatRoutes from './routes/chatRoutes'
import colorBlindTestRoutes from './routes/colorBlindTestRoutes'
import ratinaScanRoutes from './routes/ratinaScanRoutes'
import visionTestRoutes from './routes/visionTestRoutes'
import opticianRoutes from './routes/opticianRoutes'
import userRoutes from './routes/userRoutes'

import shareRoutes from './routes/shareRoutes'


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

app.use('/auth', authRoute);
app.use('/patients', patientRoute);
app.use('/doctors', doctorRoute);
app.use('/notifications', notificationRoutes);
app.use('/chats', chatRoutes);
app.use('/color-blind-tests', colorBlindTestRoutes);
app.use('/ratina-scans', ratinaScanRoutes);
app.use('/opticians', opticianRoutes);
app.use('/vision-tests', visionTestRoutes);
app.use('/share', shareRoutes);
app.use('/user', userRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
})
