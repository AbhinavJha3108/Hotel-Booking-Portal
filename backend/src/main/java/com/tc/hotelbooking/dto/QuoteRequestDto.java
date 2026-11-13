package com.tc.hotelbooking.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record QuoteRequestDto(
    @NotNull(message = "Hotel ID is required")
    Long hotelId,

    @NotNull(message = "Check-in date is required")
    LocalDate checkInDate,

    @NotNull(message = "Check-out date is required")
    LocalDate checkOutDate
) {}
