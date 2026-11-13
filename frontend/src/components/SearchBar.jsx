import React from 'react';
import { Search, Calendar, MapPin, RotateCcw } from 'lucide-react';

export default function SearchBar({
  location,
  setLocation,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  onSearch,
  onReset
}) {
  const today = new Date().toISOString().split('T')[0];

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);
    if (checkOut && newCheckOutCompare(newCheckIn, checkOut)) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const newCheckOutCompare = (inDate, outDate) => {
    return new Date(outDate) <= new Date(inDate);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            Destination
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Jaipur, Goa, Bangalore..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            Check-In
          </label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={handleCheckInChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            Check-Out
          </label>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-100"
          >
            <Search className="w-4 h-4" />
            Search
          </button>

          {(location || checkIn || checkOut) && (
            <button
              type="button"
              onClick={onReset}
              title="Reset Filters"
              className="px-3 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
