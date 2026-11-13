package com.tc.hotelbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record BookingRequestDto(
    @NotNull(message = "Hotel ID is required")
    Long hotelId,

    @NotBlank(message = "Guest name is required")
    String guestName,

    @NotBlank(message = "Guest email is required")
    @Email(message = "Valid email address is required")
    String guestEmail,

    @NotNull(message = "Check-in date is required")
    LocalDate checkInDate,

    @NotNull(message = "Check-out date is required")
    LocalDate checkOutDate
) {}
