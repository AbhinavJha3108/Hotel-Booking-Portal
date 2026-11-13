package com.tc.hotelbooking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tc.hotelbooking.model.Booking;
import java.math.BigDecimal;
import java.time.LocalDate;

public record BookingResponseDto(
    Long id,
    @JsonProperty("booking_reference") String bookingReference,
    @JsonProperty("hotel_id") Long hotelId,
    @JsonProperty("hotel_name") String hotelName,
    @JsonProperty("hotel_location") String hotelLocation,
    @JsonProperty("guest_name") String guestName,
    @JsonProperty("guest_email") String guestEmail,
    @JsonProperty("check_in_date") LocalDate checkInDate,
    @JsonProperty("check_out_date") LocalDate checkOutDate,
    @JsonProperty("total_nights") int totalNights,
    @JsonProperty("total_amount") BigDecimal totalAmount,
    String status,
    @JsonProperty("image_url") String imageUrl,
    String amenities
) {
    public static BookingResponseDto fromEntity(Booking booking) {
        return new BookingResponseDto(
            booking.getId(),
            booking.getBookingReference(),
            booking.getHotel().getId(),
            booking.getHotel().getName(),
            booking.getHotel().getLocation(),
            booking.getGuestName(),
            booking.getGuestEmail(),
            booking.getCheckInDate(),
            booking.getCheckOutDate(),
            booking.getTotalNights(),
            booking.getTotalAmount(),
            booking.getStatus(),
            booking.getHotel().getImageUrl(),
            booking.getHotel().getAmenities()
        );
    }

    @JsonProperty("bookingReference")
    public String getBookingReference() { return bookingReference; }

    @JsonProperty("guestName")
    public String getGuestName() { return guestName; }

    @JsonProperty("guestEmail")
    public String getGuestEmail() { return guestEmail; }

    @JsonProperty("checkInDate")
    public LocalDate getCheckInDate() { return checkInDate; }

    @JsonProperty("checkOutDate")
    public LocalDate getCheckOutDate() { return checkOutDate; }

    @JsonProperty("totalNights")
    public int getTotalNights() { return totalNights; }

    @JsonProperty("totalAmount")
    public BigDecimal getTotalAmount() { return totalAmount; }

    @JsonProperty("hotelName")
    public String getHotelName() { return hotelName; }

    @JsonProperty("hotelLocation")
    public String getHotelLocation() { return hotelLocation; }
}
