-- Hotel Booking Portal schema (MySQL 8+)
-- Run once after creating/selecting hotel_booking_db.

CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amenities VARCHAR(255) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    total_rooms INT NOT NULL DEFAULT 5,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_hotels_price_positive CHECK (price_per_night > 0),
    CONSTRAINT chk_hotels_rooms_positive CHECK (total_rooms > 0)
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    hotel_id BIGINT NOT NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE,
    CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT chk_booking_nights CHECK (total_nights > 0),
    CONSTRAINT chk_booking_amount CHECK (total_amount >= 0),
    CONSTRAINT chk_booking_status CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    INDEX idx_hotel_availability (hotel_id, status, check_in_date, check_out_date),
    INDEX idx_booking_lookup (booking_reference, guest_email)
);
