package com.tc.hotelbooking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record QuoteResponseDto(
    Long hotelId,
    String hotelName,
    String location,
    LocalDate checkInDate,
    LocalDate checkOutDate,
    int totalNights,
    BigDecimal pricePerNight,
    BigDecimal totalAmount,
    int availableRooms,
    boolean isAvailable
) {}
