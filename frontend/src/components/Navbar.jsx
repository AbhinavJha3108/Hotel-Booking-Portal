import React from 'react';
import { Building2, CalendarSearch, BookmarkCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('explore')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TC</span>
            <span className="text-xl font-semibold text-indigo-600">Stays</span>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'explore'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarSearch className="w-4 h-4" />
            Find Hotels
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'manage'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            Manage Booking
          </button>
        </nav>
      </div>
    </header>
  );
}
