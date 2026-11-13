package com.tc.hotelbooking.controller;

import com.tc.hotelbooking.dto.*;
import com.tc.hotelbooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/quote")
    public ResponseEntity<QuoteResponseDto> getQuote(@Valid @RequestBody QuoteRequestDto request) {
        return ResponseEntity.ok(bookingService.calculateQuote(request));
    }

    @PostMapping
    public ResponseEntity<BookingResponseDto> createBooking(@Valid @RequestBody BookingRequestDto request) {
        BookingResponseDto booking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping("/{reference}")
    public ResponseEntity<BookingResponseDto> getBooking(
            @PathVariable String reference,
            @RequestParam String email) {
        return ResponseEntity.ok(bookingService.getBookingByReferenceAndEmail(reference, email));
    }

    @PostMapping("/{reference}/cancel")
    public ResponseEntity<BookingCancelResponseDto> cancelBooking(
            @PathVariable String reference,
            @Valid @RequestBody BookingCancelRequestDto request) {
        return ResponseEntity.ok(bookingService.cancelBooking(reference, request));
    }
}
