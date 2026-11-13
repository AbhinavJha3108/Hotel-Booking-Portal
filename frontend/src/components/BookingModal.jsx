import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { getBookingQuote, createBooking } from '../api.js';
import BookingPassCard from './BookingPassCard.jsx';

export default function BookingModal({ hotel, defaultCheckIn, defaultCheckOut, onClose, onBookingSuccess }) {
  const [checkInDate, setCheckInDate] = useState(defaultCheckIn || '');
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut || '');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  // Fetch live price quote whenever dates change
  useEffect(() => {
    if (!checkInDate || !checkOutDate) {
      setQuote(null);
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setErrorMessage('Check-out date must be strictly after check-in date.');
      setQuote(null);
      return;
    }

    let isCurrent = true;
    setLoadingQuote(true);
    setErrorMessage('');

    getBookingQuote({
      hotelId: hotel.id,
      checkInDate,
      checkOutDate
    })
      .then((data) => {
        if (isCurrent) {
          setQuote(data);
          setErrorMessage('');
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setErrorMessage(err.message);
          setQuote(null);
        }
      })
      .finally(() => {
        if (isCurrent) setLoadingQuote(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [hotel.id, checkInDate, checkOutDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!guestName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }

    if (!guestEmail.trim()) {
      setErrorMessage('Please provide your email address.');
      return;
    }

    if (!quote || !quote.isAvailable) {
      setErrorMessage('No rooms are available for the selected dates.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createBooking({
        hotelId: hotel.id,
        guestName,
        guestEmail,
        checkInDate,
        checkOutDate
      });

      setConfirmedBooking({
        ...result,
        hotel_name: result.hotel_name || result.hotelName || hotel.name,
        hotel_location: result.hotel_location || result.hotelLocation || hotel.location,
        booking_reference: result.booking_reference || result.bookingReference,
        guest_name: result.guest_name || result.guestName || guestName,
        guest_email: result.guest_email || result.guestEmail || guestEmail,
        check_in_date: result.check_in_date || result.checkInDate || checkInDate,
        check_out_date: result.check_out_date || result.checkOutDate || checkOutDate,
        total_nights: result.total_nights || result.totalNights || (quote ? quote.totalNights : 1),
        total_amount: result.total_amount || result.totalAmount || (quote ? quote.totalAmount : 0),
        status: result.status || 'CONFIRMED'
      });

      if (onBookingSuccess) {
        onBookingSuccess(result);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl my-8">
        {confirmedBooking ? (
          <div>
            <div className="mb-4 text-center">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full mb-1">
                Reservation Confirmed!
              </span>
              <h3 className="text-xl font-bold text-white">Your Stay is Booked</h3>
            </div>
            <BookingPassCard
              booking={confirmedBooking}
              onClose={onClose}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
              <div>
                <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase">
                  Reserve Room
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{hotel.name}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {hotel.location} • ₹{Number(hotel.price_per_night ?? hotel.pricePerNight ?? 0).toLocaleString('en-IN')} / night
                </p>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    min={checkInDate || today}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Guest Details */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  Guest Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Raj Kapoor"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  Guest Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. raj@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              {/* Real-time Pricing Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Price Calculation</span>
                  {loadingQuote && (
                    <span className="flex items-center gap-1 text-indigo-600 font-normal">
                      <Loader2 className="w-3 h-3 animate-spin" /> Calculating...
                    </span>
                  )}
                </div>

                {quote ? (
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Rate per night</span>
                      <span>₹{Number(quote.pricePerNight).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Stay duration</span>
                      <span>{quote.totalNights} {quote.totalNights === 1 ? 'night' : 'nights'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Rooms currently available</span>
                      <span className="font-semibold text-emerald-600">{quote.availableRooms} rooms left</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900 font-bold text-base">
                      <span>Total Amount</span>
                      <span className="text-indigo-600">₹{Number(quote.totalAmount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Select valid check-in and check-out dates to preview the total price and availability.
                  </p>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !quote || !quote.isAvailable}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition flex items-center gap-2 shadow-sm ${
                    submitting || !quote || !quote.isAvailable
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Securing Booking...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Confirm & Reserve
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
