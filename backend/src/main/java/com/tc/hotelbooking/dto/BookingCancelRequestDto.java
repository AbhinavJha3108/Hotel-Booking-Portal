package com.tc.hotelbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record BookingCancelRequestDto(
    @NotBlank(message = "Email is required to verify booking cancellation")
    @Email(message = "Valid email address is required")
    String email
) {}
