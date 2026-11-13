import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, CheckCircle, XCircle, Calendar, User, Mail, MapPin } from 'lucide-react';

export default function BookingPassCard({ booking, onClose }) {
  if (!booking) return null;

  const isCancelled = booking.status === 'CANCELLED';

  const handlePrint = () => {
    window.print();
  };

  const bookingRef = booking.booking_reference || booking.bookingReference || 'N/A';
  const hotelName = booking.hotel_name || booking.hotelName || 'Hotel Reservation';
  const location = booking.hotel_location || booking.hotelLocation || booking.location || '';
  const guestName = booking.guest_name || booking.guestName || '';
  const guestEmail = booking.guest_email || booking.guestEmail || '';
  const checkIn = booking.check_in_date || booking.checkInDate;
  const checkOut = booking.check_out_date || booking.checkOutDate;
  const nights = booking.total_nights ?? booking.totalNights ?? 0;
  const amount = booking.total_amount ?? booking.totalAmount ?? 0;

  const qrData = JSON.stringify({
    ref: bookingRef,
    email: guestEmail,
    hotel: hotelName,
    in: checkIn,
    out: checkOut
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl max-w-xl mx-auto">
      {/* Top Banner */}
      <div className={`p-6 text-white ${isCancelled ? 'bg-rose-600' : 'bg-slate-900'} relative`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase opacity-75">
              Official Hotel Check-In Pass
            </span>
            <h2 className="text-xl font-bold mt-0.5">{hotelName}</h2>
            {location && (
              <p className="text-xs opacity-80 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {location}
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-semibold opacity-70 block">
              Booking Ref
            </span>
            <span className="font-mono font-bold text-sm bg-white/20 px-2.5 py-1 rounded-lg inline-block mt-0.5 tracking-wider">
              {bookingRef}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {isCancelled ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/25 text-white">
              <XCircle className="w-3.5 h-3.5" />
              Booking Cancelled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/25 text-emerald-200 border border-emerald-400/30">
              <CheckCircle className="w-3.5 h-3.5" />
              Confirmed Reservation
            </span>
          )}
        </div>
      </div>

      {/* Ticket Body */}
      <div id="printable-pass" className="p-6 bg-white">
        <div className="grid grid-cols-2 gap-4 text-sm pb-5 border-b border-dashed border-slate-200">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Guest Name</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              {guestName || 'Valued Guest'}
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium block">Guest Email</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              {guestEmail || 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 py-5 border-b border-dashed border-slate-200 text-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Check-In
            </span>
            <span className="font-semibold text-slate-900 block mt-0.5">
              {formatDate(checkIn)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Check-Out
            </span>
            <span className="font-semibold text-slate-900 block mt-0.5">
              {formatDate(checkOut)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium block">Duration</span>
            <span className="font-semibold text-indigo-600 block mt-0.5">
              {nights} {nights === 1 ? 'Night' : 'Nights'}
            </span>
          </div>
        </div>

        {/* Amount & QR Section */}
        <div className="pt-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-slate-900 block">
              ₹{Number(amount).toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Taxes and nightly room charges included
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <QRCodeSVG value={qrData} size={84} level="M" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">Scan at Check-in</span>
          </div>
        </div>
      </div>

      {/* Action Footer (Hidden during window.print) */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between no-print">
        <span className="text-xs text-slate-500">
          Present this pass at front desk on arrival
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
