import { Router } from 'express';
import {
  getQuote,
  createBooking,
  getBooking,
  cancelBooking
} from '../controllers/bookingController.js';

const router = Router();

router.post('/quote', getQuote);
router.post('/', createBooking);
router.get('/:reference', getBooking);
router.post('/:reference/cancel', cancelBooking);

export default router;
