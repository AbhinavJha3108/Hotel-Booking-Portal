import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import SearchBar from './components/SearchBar.jsx';
import HotelCard from './components/HotelCard.jsx';
import BookingModal from './components/BookingModal.jsx';
import ManageBookings from './components/ManageBookings.jsx';
import { fetchHotels } from './api.js';
import { AlertCircle, Loader2, Sparkles, BedDouble } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Search parameters
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Selected hotel for booking
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Load initial hotels
  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async (params = {}) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchHotels(params);
      setHotels(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load hotels. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadHotels({ location, checkIn, checkOut });
  };

  const handleReset = () => {
    setLocation('');
    setCheckIn('');
    setCheckOut('');
    loadHotels();
  };

  const handleBookingSuccess = () => {
    // Refresh hotel availability after a booking
    loadHotels({ location, checkIn, checkOut });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'explore' ? (
          <div className="space-y-8">
            {/* Hero Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5" />
                Curated Luxury Stays
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Find your perfect destination
              </h1>
              <p className="text-sm text-slate-500">
                Browse verified properties, check real-time date availability, and reserve with zero hassle.
              </p>
            </div>

            {/* Search Filters */}
            <SearchBar
              location={location}
              setLocation={setLocation}
              checkIn={checkIn}
              setCheckIn={setCheckIn}
              checkOut={checkOut}
              setCheckOut={setCheckOut}
              onSearch={handleSearch}
              onReset={handleReset}
            />

            {/* Error Alert */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Hotels Grid */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="text-sm">Fetching available hotels...</span>
              </div>
            ) : hotels.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <BedDouble className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No hotels found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any properties matching your criteria. Try adjusting your destination or dates.
                </p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onSelect={(h) => setSelectedHotel(h)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <ManageBookings />
        )}
      </main>

      {/* Booking Modal */}
      {selectedHotel && (
        <BookingModal
          hotel={selectedHotel}
          defaultCheckIn={checkIn}
          defaultCheckOut={checkOut}
          onClose={() => setSelectedHotel(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 TC Stays - Developer Internship Assessment</span>
          <span>Built with Spring Boot 3 & React</span>
        </div>
      </footer>
    </div>
  );
}
