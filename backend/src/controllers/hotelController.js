import * as hotelService from '../services/hotelService.js';

export async function getHotels(req, res, next) {
  try {
    const { location, checkIn, checkOut } = req.query;
    const hotels = await hotelService.getHotels({ location, checkIn, checkOut });
    res.json(hotels);
  } catch (error) {
    next(error);
  }
}

export async function getHotelById(req, res, next) {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;
    const hotel = await hotelService.getHotelById(id, checkIn, checkOut);

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json(hotel);
  } catch (error) {
    next(error);
  }
}
