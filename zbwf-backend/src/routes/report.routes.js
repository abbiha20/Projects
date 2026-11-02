import express from 'express';
import {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
  updateReport,
  downloadPatientReport
} from '../controllers/reports.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/',verifyToken, createReport);
router.get('/', verifyToken,getAllReports);
router.get('/:id',verifyToken, getReportById);
router.delete('/:id',verifyToken, deleteReport);
router.put('/:report_id',verifyToken, updateReport);
router.post('/download-report',verifyToken, downloadPatientReport);
export default router;
