package com.tc.hotelbooking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record BookingCancelResponseDto(
    @JsonProperty("booking_reference") String bookingReference,
    @JsonProperty("hotel_name") String hotelName,
    String status,
    String message
) {}
