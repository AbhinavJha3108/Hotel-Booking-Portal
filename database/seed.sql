-- Sample hotel catalog. Safe to rerun; bookings are not seeded.
-- Requires database/schema.sql to have been applied first.

INSERT INTO hotels (name, location, description, amenities, price_per_night, total_rooms, image_url)
SELECT seed.name, seed.location, seed.description, seed.amenities, seed.price_per_night, seed.total_rooms, seed.image_url
FROM (
    SELECT 'The Grand Palace' AS name, 'Jaipur' AS location,
           'Experience royal Rajasthani heritage with opulent architecture, lush courtyards, and world-class hospitality.' AS description,
           'Free WiFi, Swimming Pool, Royal Spa, Complimentary Breakfast, Fine Dining' AS amenities,
           6500.00 AS price_per_night, 8 AS total_rooms,
           'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' AS image_url
    UNION ALL SELECT 'Ocean Breeze Beach Resort', 'Goa',
           'Charming beachfront resort nestled along pristine sands with stunning sunset views and coastal breeze.',
           'Beach Access, Infinity Pool, Beachside Bar, Free WiFi, Water Sports', 4800.00, 6,
           'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    UNION ALL SELECT 'The Silicon Heights Hotel', 'Bangalore',
           'Contemporary boutique hotel in the heart of Indiranagar, perfect for business travelers and city explorers.',
           'High-Speed WiFi, Rooftop Cafe, Fitness Center, Airport Shuttle, Work Desks', 3200.00, 10,
           'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    UNION ALL SELECT 'Himalayan Haven Retreat', 'Manali',
           'Peaceful mountain sanctuary offering panoramic Himalayan snow peaks, cedar forest trails, and cozy fires.',
           'Mountain View Balcony, Heated Rooms, Evening Bonfire, Hiking Guide, Free WiFi', 3900.00, 5,
           'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
    UNION ALL SELECT 'Marine Bay Grand', 'Mumbai',
           'Luxury sea-facing retreat overlooking the iconic Queen''s Necklace, featuring gourmet culinary experiences.',
           'Sea View, Executive Lounge, 24/7 Room Service, Valet Parking, Spa & Sauna', 7200.00, 7,
           'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80'
    UNION ALL SELECT 'Serene Backwaters Sanctuary', 'Kerala',
           'Tranquil lakeside paradise surrounded by emerald backwaters, coconut groves, and authentic Ayurvedic wellness.',
           'Backwater Facing, Ayurvedic Spa, Traditional Kerala Dining, Houseboat Tour, Free WiFi', 5400.00, 6,
           'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM hotels existing WHERE existing.name = seed.name AND existing.location = seed.location);
