const API_BASE = '/api';

export async function fetchHotels(params = {}) {
  const query = new URLSearchParams();
  if (params.location) query.append('location', params.location);
  if (params.checkIn) query.append('checkIn', params.checkIn);
  if (params.checkOut) query.append('checkOut', params.checkOut);

  const res = await fetch(`${API_BASE}/hotels?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch hotels');
  }
  return res.json();
}

export async function fetchHotelById(id, dates = {}) {
  const query = new URLSearchParams();
  if (dates.checkIn) query.append('checkIn', dates.checkIn);
  if (dates.checkOut) query.append('checkOut', dates.checkOut);

  const res = await fetch(`${API_BASE}/hotels/${id}?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch hotel details');
  }
  return res.json();
}

export async function getBookingQuote(payload) {
  const res = await fetch(`${API_BASE}/bookings/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to calculate quote');
  }
  return data;
}

export async function createBooking(payload) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to confirm booking');
  }
  return data;
}

export async function lookupBooking(reference, email) {
  const query = new URLSearchParams({ email });
  const res = await fetch(`${API_BASE}/bookings/${reference}?${query.toString()}`);

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Booking not found');
  }
  return data;
}

export async function cancelBooking(reference, email) {
  const res = await fetch(`${API_BASE}/bookings/${reference}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to cancel booking');
  }
  return data;
}
