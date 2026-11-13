package com.tc.hotelbooking;

import com.tc.hotelbooking.dto.BookingRequestDto;
import com.tc.hotelbooking.dto.BookingResponseDto;
import com.tc.hotelbooking.dto.QuoteRequestDto;
import com.tc.hotelbooking.dto.QuoteResponseDto;
import com.tc.hotelbooking.exception.InvalidBookingException;
import com.tc.hotelbooking.model.Booking;
import com.tc.hotelbooking.model.Hotel;
import com.tc.hotelbooking.repository.BookingRepository;
import com.tc.hotelbooking.repository.HotelRepository;
import com.tc.hotelbooking.service.BookingService;
import com.tc.hotelbooking.util.DateValidationUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private BookingService bookingService;

    private Hotel sampleHotel;

    @BeforeEach
    void setUp() {
        sampleHotel = new Hotel(
            "Ocean Breeze Beach Resort",
            "Goa",
            "Beachfront resort",
            "Pool, WiFi",
            BigDecimal.valueOf(4800.00),
            5,
            "https://example.com/hotel.jpg"
        );
        sampleHotel.setId(1L);
    }

    @Nested
    @DisplayName("Pricing and Night Calculation")
    class PricingTests {

        @Test
        @DisplayName("Calculates total nights and stay amount correctly")
        void shouldCalculateCorrectQuote() {
            LocalDate checkIn = LocalDate.now().plusDays(2);
            LocalDate checkOut = LocalDate.now().plusDays(5); // 3 nights

            when(hotelRepository.findById(1L)).thenReturn(Optional.of(sampleHotel));
            when(bookingRepository.countActiveOverlappingBookings(1L, checkIn, checkOut)).thenReturn(1L);

            QuoteRequestDto request = new QuoteRequestDto(1L, checkIn, checkOut);
            QuoteResponseDto quote = bookingService.calculateQuote(request);

            assertEquals(3, quote.totalNights());
            assertEquals(0, BigDecimal.valueOf(14400.00).compareTo(quote.totalAmount()));
            assertEquals(4, quote.availableRooms());
            assertTrue(quote.isAvailable());
        }
    }

    @Nested
    @DisplayName("Date Validation Rules")
    class DateValidationTests {

        @Test
        @DisplayName("Rejects check-in date in the past")
        void shouldRejectPastCheckIn() {
            LocalDate pastCheckIn = LocalDate.now().minusDays(2);
            LocalDate futureCheckOut = LocalDate.now().plusDays(3);

            assertThrows(InvalidBookingException.class, () ->
                DateValidationUtils.validateDates(pastCheckIn, futureCheckOut)
            );
        }

        @Test
        @DisplayName("Rejects check-out date equal to check-in date")
        void shouldRejectSameDayStay() {
            LocalDate date = LocalDate.now().plusDays(2);

            assertThrows(InvalidBookingException.class, () ->
                DateValidationUtils.validateDates(date, date)
            );
        }

        @Test
        @DisplayName("Rejects check-out date before check-in date")
        void shouldRejectReversedDates() {
            LocalDate checkIn = LocalDate.now().plusDays(5);
            LocalDate checkOut = LocalDate.now().plusDays(2);

            assertThrows(InvalidBookingException.class, () ->
                DateValidationUtils.validateDates(checkIn, checkOut)
            );
        }
    }

    @Nested
    @DisplayName("Stay Overlap Detection")
    class OverlapTests {

        private final LocalDate existingIn = LocalDate.of(2026, 12, 10);
        private final LocalDate existingOut = LocalDate.of(2026, 12, 15);

        @Test
        @DisplayName("Detects overlap when stay is completely inside existing booking")
        void detectsOverlapInside() {
            LocalDate reqIn = LocalDate.of(2026, 12, 11);
            LocalDate reqOut = LocalDate.of(2026, 12, 14);

            assertTrue(DateValidationUtils.doesOverlap(existingIn, existingOut, reqIn, reqOut));
        }

        @Test
        @DisplayName("Detects overlap when stay spans across existing booking")
        void detectsOverlapSpanning() {
            LocalDate reqIn = LocalDate.of(2026, 12, 8);
            LocalDate reqOut = LocalDate.of(2026, 12, 18);

            assertTrue(DateValidationUtils.doesOverlap(existingIn, existingOut, reqIn, reqOut));
        }

        @Test
        @DisplayName("Allows back-to-back stay when new checkout equals existing checkin")
        void allowsAdjacentTurnaroundBefore() {
            LocalDate reqIn = LocalDate.of(2026, 12, 5);
            LocalDate reqOut = LocalDate.of(2026, 12, 10);

            assertFalse(DateValidationUtils.doesOverlap(existingIn, existingOut, reqIn, reqOut));
        }

        @Test
        @DisplayName("Allows back-to-back stay when new checkin equals existing checkout")
        void allowsAdjacentTurnaroundAfter() {
            LocalDate reqIn = LocalDate.of(2026, 12, 15);
            LocalDate reqOut = LocalDate.of(2026, 12, 20);

            assertFalse(DateValidationUtils.doesOverlap(existingIn, existingOut, reqIn, reqOut));
        }
    }

    @Nested
    @DisplayName("Capacity and Booking Creation")
    class BookingCreationTests {

        @Test
        @DisplayName("Creates booking successfully when capacity is available")
        void createsBookingSuccessfully() {
            LocalDate checkIn = LocalDate.now().plusDays(10);
            LocalDate checkOut = LocalDate.now().plusDays(12);

            when(hotelRepository.findByIdWithLock(1L)).thenReturn(Optional.of(sampleHotel));
            when(bookingRepository.countActiveOverlappingBookings(1L, checkIn, checkOut)).thenReturn(2L);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

            BookingRequestDto request = new BookingRequestDto(
                1L,
                "Raj Kapoor",
                "raj@example.com",
                checkIn,
                checkOut
            );

            BookingResponseDto response = bookingService.createBooking(request);

            assertNotNull(response.bookingReference());
            assertTrue(response.bookingReference().startsWith("BK-"));
            assertEquals("CONFIRMED", response.status());
            assertEquals(2, response.totalNights());
            verify(bookingRepository, times(1)).save(any(Booking.class));
        }

        @Test
        @DisplayName("Rejects booking when hotel capacity is full for the stay dates")
        void rejectsBookingWhenCapacityExhausted() {
            LocalDate checkIn = LocalDate.now().plusDays(10);
            LocalDate checkOut = LocalDate.now().plusDays(12);

            when(hotelRepository.findByIdWithLock(1L)).thenReturn(Optional.of(sampleHotel));
            // Hotel has 5 total rooms; 5 active bookings already exist
            when(bookingRepository.countActiveOverlappingBookings(1L, checkIn, checkOut)).thenReturn(5L);

            BookingRequestDto request = new BookingRequestDto(
                1L,
                "Raj Kapoor",
                "raj@example.com",
                checkIn,
                checkOut
            );

            InvalidBookingException ex = assertThrows(InvalidBookingException.class, () ->
                bookingService.createBooking(request)
            );

            assertTrue(ex.getMessage().contains("no rooms are available"));
            verify(bookingRepository, never()).save(any(Booking.class));
        }
    }
}
