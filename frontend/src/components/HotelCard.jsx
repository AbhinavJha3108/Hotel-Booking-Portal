import React from 'react';
import { MapPin, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function HotelCard({ hotel, onSelect }) {
  const price = Number(hotel.price_per_night ?? hotel.pricePerNight ?? 0);
  const availableRooms = hotel.available_rooms ?? hotel.availableRooms ?? hotel.total_rooms ?? hotel.totalRooms ?? 0;
  const imageUrl = hotel.image_url || hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
  const isSoldOut = availableRooms === 0;

  const amenitiesList = hotel.amenities
    ? hotel.amenities.split(',').map((a) => a.trim()).slice(0, 4)
    : [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
      {/* Hotel Image Container with Badges */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
          }}
        />

        {/* Top Badges Bar: Cleanly spaced left and right */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <span className="bg-white/95 backdrop-blur-md text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-100/50">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            {hotel.location}
          </span>

          <div>
            {isSoldOut ? (
              <span className="bg-rose-500/95 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <AlertCircle className="w-3.5 h-3.5" />
                Sold Out
              </span>
            ) : (
              <span className="bg-emerald-600/95 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Check className="w-3.5 h-3.5" />
                {availableRooms} {availableRooms === 1 ? 'room' : 'rooms'} left
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
            {hotel.name}
          </h3>
          <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
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

        {/* Pricing and Action */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">
                ₹{price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 font-normal">/ night</span>
            </div>
          </div>

          <button
            onClick={() => onSelect(hotel)}
            disabled={isSoldOut}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
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
