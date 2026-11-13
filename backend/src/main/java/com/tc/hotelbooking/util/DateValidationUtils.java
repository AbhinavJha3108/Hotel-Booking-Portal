package com.tc.hotelbooking.util;

import com.tc.hotelbooking.exception.InvalidBookingException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class DateValidationUtils {

    public static void validateDates(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate == null || checkOutDate == null) {
            throw new InvalidBookingException("Both check-in and check-out dates are required.");
        }

        LocalDate today = LocalDate.now();
        if (checkInDate.isBefore(today)) {
            throw new InvalidBookingException("Check-in date cannot be in the past.");
        }

        if (!checkOutDate.isAfter(checkInDate)) {
            throw new InvalidBookingException("Check-out date must be strictly after check-in date.");
        }
    }

    public static int calculateNights(LocalDate checkInDate, LocalDate checkOutDate) {
        return (int) ChronoUnit.DAYS.between(checkInDate, checkOutDate);
    }

    public static boolean doesOverlap(LocalDate existingIn, LocalDate existingOut,
                                     LocalDate requestedIn, LocalDate requestedOut) {
        return existingIn.isBefore(requestedOut) && existingOut.isAfter(requestedIn);
    }
}
