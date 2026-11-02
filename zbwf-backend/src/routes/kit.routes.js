import express from 'express';
import {
  addKit,
  updateKit,
  searchKits,
} from '../controllers/kit.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/',verifyToken, addKit);
router.put('/:id',verifyToken, updateKit);
router.get('/',verifyToken, searchKits);

export default router;
