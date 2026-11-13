package com.tc.hotelbooking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tc.hotelbooking.model.Hotel;
import java.math.BigDecimal;

public record HotelResponseDto(
    Long id,
    String name,
    String location,
    String description,
    String amenities,
    @JsonProperty("price_per_night") BigDecimal pricePerNight,
    @JsonProperty("total_rooms") int totalRooms,
    @JsonProperty("available_rooms") int availableRooms,
    @JsonProperty("is_available") boolean isAvailable,
    @JsonProperty("image_url") String imageUrl
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

    @JsonProperty("pricePerNight")
    public BigDecimal getPricePerNight() { return pricePerNight; }

    @JsonProperty("totalRooms")
    public int getTotalRooms() { return totalRooms; }

    @JsonProperty("availableRooms")
    public int getAvailableRooms() { return availableRooms; }

    @JsonProperty("isAvailable")
    public boolean getIsAvailable() { return isAvailable; }

    @JsonProperty("imageUrl")
    public String getImageUrl() { return imageUrl; }
}
