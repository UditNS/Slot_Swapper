import React from 'react'
import { Calendar, Clock, Users, ArrowLeftRight, Bell, LogOut, Plus, X } from 'lucide-react';

const Header = () => {

    const handleLogout = () => {
        setUser(null);
        setCurrentView('login');
        setMyEvents([]);
        setSwappableSlots([]);
        setSwapRequests({ incoming: [], outgoing: [] });
    };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <ArrowLeftRight className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SlotSwapper</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
  )
}

export default Header