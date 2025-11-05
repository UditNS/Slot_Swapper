// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { logout } from '../store/slices/authSlice';
import { fetchEvents, fetchEventStats } from '../store/slices/eventSlice';
import { fetchSwapStats } from '../store/slices/swapSlice';
import { 
  Calendar, Users, Bell, LogOut, ArrowLeftRight,
  TrendingUp, Clock, Activity
} from 'lucide-react';
import CalendarView from '../components/CalanderView';
import MarketplaceView from '../components/MarketplaceView';
import RequestsView from '../components/RequestsView';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { stats: eventStats } = useSelector((state) => state.events);
  const { stats: swapStats, incomingRequests } = useSelector((state) => state.swaps);
  
  const [currentView, setCurrentView] = useState('calendar');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchEvents());
      dispatch(fetchEventStats());
      dispatch(fetchSwapStats());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const pendingIncoming = incomingRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <ArrowLeftRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SlotSwapper</h1>
                <p className="text-xs text-gray-500">Peer-to-peer scheduling</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">My Events</p>
                  <p className="text-2xl font-bold text-blue-900">{eventStats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Swappable</p>
                  <p className="text-2xl font-bold text-green-900">{eventStats.swappable}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-600 font-medium">Pending Swaps</p>
                  <p className="text-2xl font-bold text-yellow-900">{eventStats.swapPending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium">Total Swaps</p>
                  <p className="text-2xl font-bold text-purple-900">{swapStats.total}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
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
              {pendingIncoming > 0 && (
                <span className="absolute top-2 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingIncoming}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'marketplace' && <MarketplaceView />}
        {currentView === 'requests' && <RequestsView />}
      </main>
    </div>
  );
};

export default Dashboard;