import React, { useState } from 'react';
import { Search, Mail, KeyRound, AlertCircle, CheckCircle, Ban, Loader2 } from 'lucide-react';
import { lookupBooking, cancelBooking } from '../api.js';
import BookingPassCard from './BookingPassCard.jsx';

export default function ManageBookings() {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setBooking(null);

    if (!reference.trim() || !email.trim()) {
      setErrorMessage('Please provide both your Booking Reference and Guest Email.');
      return;
    }

    setLoading(true);
    try {
      const data = await lookupBooking(reference.trim(), email.trim());
      setBooking(data);
    } catch (err) {
      setErrorMessage(err.message || 'No booking found matching those details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this reservation? This cannot be undone.')) {
      return;
    }

    setCancelling(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await cancelBooking(booking.booking_reference, booking.guest_email);
      setSuccessMessage(result.message);
      // Refresh local booking status to CANCELLED
      setBooking((prev) => ({ ...prev, status: 'CANCELLED' }));
    } catch (err) {
      setErrorMessage(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Manage Your Reservation</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your unique booking reference and the email address used during booking to retrieve your pass or cancel your reservation.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium px-4 py-3 rounded-xl flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                Booking Reference
              </label>
              <input
                type="text"
                placeholder="e.g. BK-1A2B3C"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                Guest Email
              </label>
              <input
                type="email"
                placeholder="e.g. raj@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Locating Reservation...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Find Booking
              </>
            )}
          </button>
        </form>
      </div>

      {booking && (
        <div className="space-y-4">
          <BookingPassCard booking={booking} />

          {booking.status === 'CONFIRMED' && (
            <div className="bg-white rounded-2xl p-4 border border-rose-100 flex items-center justify-between shadow-sm">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Need to cancel your stay?</h4>
                <p className="text-xs text-slate-500">
                  Free cancellation is permitted. Cancelling will immediately release your room.
                </p>
              </div>

              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-1.5"
              >
                {cancelling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Ban className="w-3.5 h-3.5" />
                )}
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
