import express from 'express';
import upload from '../middleware/fileUpload.js'; 
import { importPatientsFromExcel } from '../controllers/ImportFile.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/import',verifyToken, upload.single('file'), importPatientsFromExcel);

export default router;
