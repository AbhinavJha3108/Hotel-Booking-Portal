import React from 'react';
import { MapPin, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function HotelCard({ hotel, onSelect }) {
  const amenitiesList = hotel.amenities
    ? hotel.amenities.split(',').map((a) => a.trim()).slice(0, 4)
    : [];

  const isSoldOut = hotel.available_rooms === 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 group">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={hotel.image_url}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          {hotel.location}
        </div>

        <div className="absolute top-3 right-3">
          {isSoldOut ? (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              Sold Out
            </span>
          ) : (
            <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Check className="w-3.5 h-3.5" />
              {hotel.available_rooms} {hotel.available_rooms === 1 ? 'room' : 'rooms'} left
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
            {hotel.name}
          </h3>
          <p className="text-slate-600 text-xs mt-1 line-clamp-2">
            {hotel.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {amenitiesList.map((amenity, idx) => (
              <span
                key={idx}
                className="bg-slate-50 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Starting from</span>
            <span className="text-lg font-bold text-slate-900">
              ₹{Number(hotel.price_per_night).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 font-normal"> / night</span>
          </div>

          <button
            onClick={() => onSelect(hotel)}
            disabled={isSoldOut}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${
              isSoldOut
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
            }`}
          >
            {isSoldOut ? 'Unavailable' : 'View & Book'}
          </button>
        </div>
      </div>
    </div>
  );
}
