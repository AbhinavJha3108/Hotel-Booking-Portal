import crypto from 'crypto';
import pool from '../config/db.js';
import { calculateNights, validateStayDates } from '../utils/dateUtils.js';

function generateBookingReference() {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  const timestamp = Date.now().toString(36).slice(-3).toUpperCase();
  return `BK-${timestamp}${randomHex}`;
}

export async function calculateQuote({ hotelId, checkInDate, checkOutDate }) {
  const dateValidation = validateStayDates(checkInDate, checkOutDate);
  if (!dateValidation.valid) {
    throw { status: 400, message: dateValidation.message };
  }

  const [hotels] = await pool.query('SELECT * FROM hotels WHERE id = ?', [hotelId]);
  if (hotels.length === 0) {
    throw { status: 404, message: 'Hotel not found.' };
  }

  const hotel = hotels[0];
  const nights = calculateNights(checkInDate, checkOutDate);
  const pricePerNight = Number(hotel.price_per_night);
  const totalAmount = Number((nights * pricePerNight).toFixed(2));

  const [booked] = await pool.query(
    `SELECT COUNT(*) AS active_bookings
     FROM bookings
     WHERE hotel_id = ?
       AND status = 'CONFIRMED'
       AND check_in_date < ?
       AND check_out_date > ?`,
    [hotelId, checkOutDate, checkInDate]
  );

  const availableRooms = Math.max(0, hotel.total_rooms - booked[0].active_bookings);

  return {
    hotelId: hotel.id,
    hotelName: hotel.name,
    location: hotel.location,
    checkInDate,
    checkOutDate,
    totalNights: nights,
    pricePerNight,
    totalAmount,
    availableRooms,
    isAvailable: availableRooms > 0
  };
}

export async function createBooking({ hotelId, guestName, guestEmail, checkInDate, checkOutDate }) {
  if (!guestName || !guestName.trim()) {
    throw { status: 400, message: 'Guest name is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!guestEmail || !emailRegex.test(guestEmail.trim())) {
    throw { status: 400, message: 'A valid email address is required.' };
  }

  const dateValidation = validateStayDates(checkInDate, checkOutDate);
  if (!dateValidation.valid) {
    throw { status: 400, message: dateValidation.message };
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Pessimistic lock on hotel record to serialize concurrent bookings
    const [hotels] = await connection.query(
      'SELECT id, name, location, price_per_night, total_rooms FROM hotels WHERE id = ? FOR UPDATE',
      [hotelId]
    );

    if (hotels.length === 0) {
      throw { status: 404, message: 'Selected hotel does not exist.' };
    }

    const hotel = hotels[0];

    const [bookedRows] = await connection.query(
      `SELECT COUNT(*) AS active_bookings
       FROM bookings
       WHERE hotel_id = ?
         AND status = 'CONFIRMED'
         AND check_in_date < ?
         AND check_out_date > ?`,
      [hotelId, checkOutDate, checkInDate]
    );

    const activeBookings = bookedRows[0].active_bookings;
    if (activeBookings >= hotel.total_rooms) {
      throw { status: 409, message: 'Sorry, no rooms are available for the selected dates.' };
    }

    const nights = calculateNights(checkInDate, checkOutDate);
    const pricePerNight = Number(hotel.price_per_night);
    const totalAmount = Number((nights * pricePerNight).toFixed(2));
    const bookingReference = generateBookingReference();

    const [result] = await connection.query(
      `INSERT INTO bookings 
        (booking_reference, hotel_id, guest_name, guest_email, check_in_date, check_out_date, total_nights, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
      [
        bookingReference,
        hotel.id,
        guestName.trim(),
        guestEmail.trim().toLowerCase(),
        checkInDate,
        checkOutDate,
        nights,
        totalAmount
      ]
    );

    await connection.commit();

    return {
      id: result.insertId,
      bookingReference,
      hotelId: hotel.id,
      hotelName: hotel.name,
      location: hotel.location,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      checkInDate,
      checkOutDate,
      totalNights: nights,
      pricePerNight,
      totalAmount,
      status: 'CONFIRMED'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getBookingByReference(reference, email) {
  if (!reference || !email) {
    throw { status: 400, message: 'Both booking reference and email are required.' };
  }

  const [rows] = await pool.query(
    `SELECT b.*, h.name AS hotel_name, h.location AS hotel_location, h.image_url, h.amenities
     FROM bookings b
     JOIN hotels h ON b.hotel_id = h.id
     WHERE b.booking_reference = ? AND LOWER(b.guest_email) = ?`,
    [reference.trim().toUpperCase(), email.trim().toLowerCase()]
  );

  if (rows.length === 0) {
    throw { status: 404, message: 'Booking not found. Please verify the booking reference and email.' };
  }

  return rows[0];
}

export async function cancelBooking(reference, email) {
  if (!reference || !email) {
    throw { status: 400, message: 'Both booking reference and email are required.' };
  }

  const booking = await getBookingByReference(reference, email);

  if (booking.status === 'CANCELLED') {
    throw { status: 400, message: 'This booking has already been cancelled.' };
  }

  await pool.query(
    `UPDATE bookings SET status = 'CANCELLED' WHERE booking_reference = ?`,
    [reference.trim().toUpperCase()]
  );

  return {
    bookingReference: booking.booking_reference,
    hotelName: booking.hotel_name,
    status: 'CANCELLED',
    message: 'Booking cancelled successfully. Reserved room capacity has been released.'
  };
}
