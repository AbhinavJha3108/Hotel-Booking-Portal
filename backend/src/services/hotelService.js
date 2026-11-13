import pool from '../config/db.js';
import { validateStayDates } from '../utils/dateUtils.js';

export async function getHotels({ location, checkIn, checkOut }) {
  let query = 'SELECT * FROM hotels';
  const params = [];

  if (location && location.trim() !== '') {
    query += ' WHERE LOWER(location) LIKE ? OR LOWER(name) LIKE ?';
    const term = `%${location.trim().toLowerCase()}%`;
    params.push(term, term);
  }

  query += ' ORDER BY id ASC';
  const [hotels] = await pool.query(query, params);

  // If stay dates are provided, calculate dynamic availability per hotel
  if (checkIn && checkOut) {
    const dateValidation = validateStayDates(checkIn, checkOut);
    if (!dateValidation.valid) {
      throw new Error(dateValidation.message);
    }

    const [bookedRows] = await pool.query(
      `SELECT hotel_id, COUNT(*) AS active_bookings
       FROM bookings
       WHERE status = 'CONFIRMED'
         AND check_in_date < ?
         AND check_out_date > ?
       GROUP BY hotel_id`,
      [checkOut, checkIn]
    );

    const bookedMap = new Map();
    bookedRows.forEach(row => bookedMap.set(row.hotel_id, row.active_bookings));

    return hotels.map(hotel => {
      const booked = bookedMap.get(hotel.id) || 0;
      const availableRooms = Math.max(0, hotel.total_rooms - booked);
      return {
        ...hotel,
        available_rooms: availableRooms,
        is_available: availableRooms > 0
      };
    });
  }

  return hotels.map(hotel => ({
    ...hotel,
    available_rooms: hotel.total_rooms,
    is_available: hotel.total_rooms > 0
  }));
}

export async function getHotelById(id, checkIn, checkOut) {
  const [rows] = await pool.query('SELECT * FROM hotels WHERE id = ?', [id]);
  if (rows.length === 0) {
    return null;
  }

  const hotel = rows[0];

  if (checkIn && checkOut) {
    const dateValidation = validateStayDates(checkIn, checkOut);
    if (!dateValidation.valid) {
      throw new Error(dateValidation.message);
    }

    const [bookedRows] = await pool.query(
      `SELECT COUNT(*) AS active_bookings
       FROM bookings
       WHERE hotel_id = ?
         AND status = 'CONFIRMED'
         AND check_in_date < ?
         AND check_out_date > ?`,
      [id, checkOut, checkIn]
    );

    const activeBookings = bookedRows[0].active_bookings;
    const availableRooms = Math.max(0, hotel.total_rooms - activeBookings);

    return {
      ...hotel,
      available_rooms: availableRooms,
      is_available: availableRooms > 0
    };
  }

  return {
    ...hotel,
    available_rooms: hotel.total_rooms,
    is_available: hotel.total_rooms > 0
  };
}
