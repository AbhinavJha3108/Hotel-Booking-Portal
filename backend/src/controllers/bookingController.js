import * as bookingService from '../services/bookingService.js';

export async function getQuote(req, res, next) {
  try {
    const { hotelId, checkInDate, checkOutDate } = req.body;
    const quote = await bookingService.calculateQuote({ hotelId, checkInDate, checkOutDate });
    res.json(quote);
  } catch (error) {
    next(error);
  }
}

export async function createBooking(req, res, next) {
  try {
    const { hotelId, guestName, guestEmail, checkInDate, checkOutDate } = req.body;
    const booking = await bookingService.createBooking({
      hotelId,
      guestName,
      guestEmail,
      checkInDate,
      checkOutDate
    });
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

export async function getBooking(req, res, next) {
  try {
    const { reference } = req.params;
    const { email } = req.query;
    const booking = await bookingService.getBookingByReference(reference, email);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const { reference } = req.params;
    const { email } = req.body;
    const result = await bookingService.cancelBooking(reference, email);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
