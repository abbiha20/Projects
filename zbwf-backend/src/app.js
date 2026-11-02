import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'
import dotenv from 'dotenv';

dotenv.config()
const app = express()

app.use(cors({
    origin:  "*",
    credentials :true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true , limit :"16kb"}))
app.use(express.static("public"))

app.use(cookieParser())




//routes
import userRouter from './routes/user.routes.js'
import patientRouter from './routes/patient.routes.js'
import hospitalRoutes from './routes/hospital.routes.js'
import consultantRoutes from './routes/consultants.routes.js'
import cardInventoryRoutes from './routes/cardInventory.routes.js';
import kitRoutes from './routes/kit.routes.js';
import FileHandling from './routes/importFile.routes.js';
import reportRoutes from './routes/report.routes.js';
import testsRoutes from './routes/test.routes.js';



//router declaration

app.use("/api/users",userRouter)
app.use("/api/patients",patientRouter)
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/consultant', consultantRoutes);
app.use('/api/card-inventory', cardInventoryRoutes);
app.use('/api/kit', kitRoutes);
app.use('/api/fileHandling', FileHandling);
app.use('/api/reports', reportRoutes);
app.use('/api/tests', testsRoutes);

export  {app}