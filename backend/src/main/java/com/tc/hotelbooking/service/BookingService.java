package com.tc.hotelbooking.service;

import com.tc.hotelbooking.dto.*;
import com.tc.hotelbooking.exception.InvalidBookingException;
import com.tc.hotelbooking.exception.ResourceNotFoundException;
import com.tc.hotelbooking.model.Booking;
import com.tc.hotelbooking.model.Hotel;
import com.tc.hotelbooking.repository.BookingRepository;
import com.tc.hotelbooking.repository.HotelRepository;
import com.tc.hotelbooking.util.DateValidationUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.Locale;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final SecureRandom random = new SecureRandom();

    public BookingService(BookingRepository bookingRepository, HotelRepository hotelRepository) {
        this.bookingRepository = bookingRepository;
        this.hotelRepository = hotelRepository;
    }

    public QuoteResponseDto calculateQuote(QuoteRequestDto request) {
        if (request.hotelId() == null) {
            throw new InvalidBookingException("Hotel ID is required.");
        }
        DateValidationUtils.validateDates(request.checkInDate(), request.checkOutDate());

        Hotel hotel = hotelRepository.findById(request.hotelId())
            .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.hotelId()));

        int nights = DateValidationUtils.calculateNights(request.checkInDate(), request.checkOutDate());
        BigDecimal totalAmount = hotel.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        long booked = bookingRepository.countActiveOverlappingBookings(
            request.hotelId(), request.checkInDate(), request.checkOutDate()
        );
        int availableRooms = (int) Math.max(0, hotel.getTotalRooms() - booked);

        return new QuoteResponseDto(
            hotel.getId(),
            hotel.getName(),
            hotel.getLocation(),
            request.checkInDate(),
            request.checkOutDate(),
            nights,
            hotel.getPricePerNight(),
            totalAmount,
            availableRooms,
            availableRooms > 0
        );
    }

    @Transactional
    public BookingResponseDto createBooking(BookingRequestDto request) {
        if (request.hotelId() == null) {
            throw new InvalidBookingException("Hotel ID is required.");
        }
        DateValidationUtils.validateDates(request.checkInDate(), request.checkOutDate());

        // Pessimistic lock on hotel row to serialize concurrent booking attempts
        Hotel hotel = hotelRepository.findByIdWithLock(request.hotelId())
            .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.hotelId()));

        long activeOverlappingBookings = bookingRepository.countActiveOverlappingBookings(
            hotel.getId(), request.checkInDate(), request.checkOutDate()
        );

        if (activeOverlappingBookings >= hotel.getTotalRooms()) {
            throw new InvalidBookingException("Sorry, no rooms are available for the selected dates.");
        }

        int nights = DateValidationUtils.calculateNights(request.checkInDate(), request.checkOutDate());
        BigDecimal totalAmount = hotel.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        String reference = generateBookingReference();

        Booking booking = new Booking(
            reference,
            hotel,
            request.guestName().trim(),
            request.guestEmail().trim().toLowerCase(Locale.ROOT),
            request.checkInDate(),
            request.checkOutDate(),
            nights,
            totalAmount
        );

        Booking savedBooking = bookingRepository.save(booking);
        return BookingResponseDto.fromEntity(savedBooking);
    }

    @Transactional(readOnly = true)
    public BookingResponseDto getBookingByReferenceAndEmail(String reference, String email) {
        if (reference == null || email == null) {
            throw new InvalidBookingException("Both booking reference and email are required.");
        }

        Booking booking = bookingRepository.findByReferenceAndEmail(reference.trim(), email.trim())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Booking not found. Please verify your reference number and email address."
            ));

        return BookingResponseDto.fromEntity(booking);
    }

    @Transactional
    public BookingCancelResponseDto cancelBooking(String reference, BookingCancelRequestDto request) {
        Booking booking = bookingRepository.findByReferenceAndEmail(reference.trim(), request.email().trim())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Booking not found. Please verify your reference number and email address."
            ));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new InvalidBookingException("This booking has already been cancelled.");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        return new BookingCancelResponseDto(
            booking.getBookingReference(),
            booking.getHotel().getName(),
            "CANCELLED",
            "Booking cancelled successfully. Reserved room capacity has been released."
        );
    }

    private String generateBookingReference() {
        int code = random.nextInt(900000) + 100000;
        return "BK-" + code;
    }
}
