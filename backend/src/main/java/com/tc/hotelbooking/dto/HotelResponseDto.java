package com.tc.hotelbooking.dto;

import com.tc.hotelbooking.model.Hotel;
import java.math.BigDecimal;

public record HotelResponseDto(
    Long id,
    String name,
    String location,
    String description,
    String amenities,
    BigDecimal pricePerNight,
    int totalRooms,
    int availableRooms,
    boolean isAvailable,
    String imageUrl
) {
    public static HotelResponseDto fromEntity(Hotel hotel, int availableRooms) {
        return new HotelResponseDto(
            hotel.getId(),
            hotel.getName(),
            hotel.getLocation(),
            hotel.getDescription(),
            hotel.getAmenities(),
            hotel.getPricePerNight(),
            hotel.getTotalRooms(),
            availableRooms,
            availableRooms > 0,
            hotel.getImageUrl()
        );
    }
}
