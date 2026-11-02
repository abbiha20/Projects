import express from 'express';
import { addCard, searchCards } from '../controllers/cardsInventory.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/',verifyToken, addCard);
router.get('/', verifyToken,searchCards);

export default router;
