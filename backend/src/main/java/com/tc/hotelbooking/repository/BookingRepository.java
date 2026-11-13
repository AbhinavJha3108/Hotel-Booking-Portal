package com.tc.hotelbooking.repository;

import com.tc.hotelbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.bookingReference = :reference AND LOWER(b.guestEmail) = LOWER(:email)")
    Optional<Booking> findByReferenceAndEmail(
        @Param("reference") String reference,
        @Param("email") String email
    );

    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.hotel.id = :hotelId " +
           "AND b.status = 'CONFIRMED' " +
           "AND b.checkInDate < :checkOutDate " +
           "AND b.checkOutDate > :checkInDate")
    long countActiveOverlappingBookings(
        @Param("hotelId") Long hotelId,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );

    @Query("SELECT b.hotel.id, COUNT(b) FROM Booking b " +
           "WHERE b.status = 'CONFIRMED' " +
           "AND b.checkInDate < :checkOutDate " +
           "AND b.checkOutDate > :checkInDate " +
           "GROUP BY b.hotel.id")
    List<Object[]> countActiveOverlappingBookingsGrouped(
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );
}
