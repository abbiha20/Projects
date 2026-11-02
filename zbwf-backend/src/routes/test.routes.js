import express from 'express';
import {
  getTests,
  addTest,
  updateTest,
  deleteTest,
  getSingleTest
} from '../controllers/test.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/',verifyToken, getTests);              
router.get('/:id',verifyToken, getSingleTest);              
router.post('/',verifyToken, addTest);             

router.put('/:id',verifyToken, updateTest);        
router.delete('/:id',verifyToken, deleteTest);     

export default router;
