-- ========================================================
-- Hotel Booking Portal - Database Initialization Script
-- ========================================================

CREATE DATABASE IF NOT EXISTS hotel_booking_db;
USE hotel_booking_db;

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS hotels;

-- 1. Hotels Table
CREATE TABLE hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amenities VARCHAR(255) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    total_rooms INT NOT NULL DEFAULT 5,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bookings Table
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    hotel_id BIGINT NOT NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE,
    INDEX idx_hotel_availability (hotel_id, status, check_in_date, check_out_date),
    INDEX idx_booking_lookup (booking_reference, guest_email)
);

-- 3. Seed Sample Data (6 realistic hotels)
INSERT INTO hotels (name, location, description, amenities, price_per_night, total_rooms, image_url) VALUES
(
    'The Grand Palace',
    'Jaipur',
    'Experience royal Rajasthani heritage with opulent architecture, lush courtyards, and world-class hospitality.',
    'Free WiFi, Swimming Pool, Royal Spa, Complimentary Breakfast, Fine Dining',
    6500.00,
    8,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
),
(
    'Ocean Breeze Beach Resort',
    'Goa',
    'Charming beachfront resort nestled along pristine sands with stunning sunset views and coastal breeze.',
    'Beach Access, Infinity Pool, Beachside Bar, Free WiFi, Water Sports',
    4800.00,
    6,
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
),
(
    'The Silicon Heights Hotel',
    'Bangalore',
    'Contemporary boutique hotel in the heart of Indiranagar, perfect for business travelers and city explorers.',
    'High-Speed WiFi, Rooftop Cafe, Fitness Center, Airport Shuttle, Work Desks',
    3200.00,
    10,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
),
(
    'Himalayan Haven Retreat',
    'Manali',
    'Peaceful mountain sanctuary offering panoramic Himalayan snow peaks, cedar forest trails, and cozy fires.',
    'Mountain View Balcony, Heated Rooms, Evening Bonfire, Hiking Guide, Free WiFi',
    3900.00,
    5,
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
),
(
    'Marine Bay Grand',
    'Mumbai',
    'Luxury sea-facing retreat overlooking the iconic Queen''s Necklace, featuring gourmet culinary experiences.',
    'Sea View, Executive Lounge, 24/7 Room Service, Valet Parking, Spa & Sauna',
    7200.00,
    7,
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80'
),
(
    'Serene Backwaters Sanctuary',
    'Kerala',
    'Tranquil lakeside paradise surrounded by emerald backwaters, coconut groves, and authentic Ayurvedic wellness.',
    'Backwater Facing, Ayurvedic Spa, Traditional Kerala Dining, Houseboat Tour, Free WiFi',
    5400.00,
    6,
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
);
