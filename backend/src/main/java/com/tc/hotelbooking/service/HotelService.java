package com.tc.hotelbooking.service;

import com.tc.hotelbooking.dto.HotelResponseDto;
import com.tc.hotelbooking.exception.ResourceNotFoundException;
import com.tc.hotelbooking.model.Hotel;
import com.tc.hotelbooking.repository.BookingRepository;
import com.tc.hotelbooking.repository.HotelRepository;
import com.tc.hotelbooking.util.DateValidationUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class HotelService {

    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;

    public HotelService(HotelRepository hotelRepository, BookingRepository bookingRepository) {
        this.hotelRepository = hotelRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<HotelResponseDto> getHotels(String location, LocalDate checkIn, LocalDate checkOut) {
        List<Hotel> hotels;
        if (location != null && !location.trim().isEmpty()) {
            hotels = hotelRepository.searchByNameOrLocation(location.trim());
        } else {
            hotels = hotelRepository.findAll();
        }

        if (checkIn != null && checkOut != null) {
            DateValidationUtils.validateDates(checkIn, checkOut);

            List<Object[]> bookedCounts = bookingRepository.countActiveOverlappingBookingsGrouped(checkIn, checkOut);
            Map<Long, Long> bookedMap = new HashMap<>();
            for (Object[] row : bookedCounts) {
                Long hotelId = (Long) row[0];
                Long count = (Long) row[1];
                bookedMap.put(hotelId, count);
            }

            return hotels.stream().map(hotel -> {
                long active = bookedMap.getOrDefault(hotel.getId(), 0L);
                int available = (int) Math.max(0, hotel.getTotalRooms() - active);
                return HotelResponseDto.fromEntity(hotel, available);
            }).toList();
        }

        return hotels.stream()
            .map(hotel -> HotelResponseDto.fromEntity(hotel, hotel.getTotalRooms()))
            .toList();
    }

    public HotelResponseDto getHotelById(Long id, LocalDate checkIn, LocalDate checkOut) {
        Hotel hotel = hotelRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        if (checkIn != null && checkOut != null) {
            DateValidationUtils.validateDates(checkIn, checkOut);
            long booked = bookingRepository.countActiveOverlappingBookings(id, checkIn, checkOut);
            int available = (int) Math.max(0, hotel.getTotalRooms() - booked);
            return HotelResponseDto.fromEntity(hotel, available);
        }

        return HotelResponseDto.fromEntity(hotel, hotel.getTotalRooms());
    }
}
