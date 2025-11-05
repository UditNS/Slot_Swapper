import React from 'react'
import { Calendar, Clock, Users, ArrowLeftRight, Bell, LogOut, Plus, X } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition ${
                currentView === 'calendar'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              My Calendar
            </button>
            <button
              onClick={() => setCurrentView('marketplace')}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition ${
                currentView === 'marketplace'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Marketplace
            </button>
            <button
              onClick={() => setCurrentView('requests')}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition relative ${
                currentView === 'requests'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Requests
              {swapRequests.incoming.length > 0 && (
                <span className="absolute top-2 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </nav>
  )
}

export default Navigation