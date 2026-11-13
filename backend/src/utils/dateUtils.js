export function calculateNights(checkInDate, checkOutDate) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function validateStayDates(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) {
    return { valid: false, message: 'Both check-in and check-out dates are required.' };
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return { valid: false, message: 'Invalid date format. Expected YYYY-MM-DD.' };
  }

  // Normalize to midnight UTC for date comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInMidnight = new Date(checkIn);
  checkInMidnight.setHours(0, 0, 0, 0);

  if (checkInMidnight < today) {
    return { valid: false, message: 'Check-in date cannot be in the past.' };
  }

  if (checkOut <= checkIn) {
    return { valid: false, message: 'Check-out date must be strictly after check-in date.' };
  }

  return { valid: true };
}

export function datesOverlap(existingCheckIn, existingCheckOut, requestedCheckIn, requestedCheckOut) {
  const eIn = new Date(existingCheckIn).getTime();
  const eOut = new Date(existingCheckOut).getTime();
  const rIn = new Date(requestedCheckIn).getTime();
  const rOut = new Date(requestedCheckOut).getTime();

  return eIn < rOut && eOut > rIn;
}
