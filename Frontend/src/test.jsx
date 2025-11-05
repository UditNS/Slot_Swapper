import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ArrowLeftRight, Bell, LogOut, Plus, X } from 'lucide-react';
import Navigation from './components/Navigation';
import Header from './components/Header';

// Mock data for demonstration
const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };

const SlotSwapper = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [swapRequests, setSwapRequests] = useState({ incoming: [], outgoing: [] });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '', endTime: '' });

  // Initialize demo data
  useEffect(() => {
    if (user) {
      setMyEvents([
        { id: '1', title: 'Team Meeting', startTime: '2025-11-05T10:00', endTime: '2025-11-05T11:00', status: 'BUSY', userId: '1' },
        { id: '2', title: 'Focus Block', startTime: '2025-11-06T14:00', endTime: '2025-11-06T15:00', status: 'SWAPPABLE', userId: '1' }
      ]);
      setSwappableSlots([
        { id: '3', title: 'Code Review', startTime: '2025-11-07T09:00', endTime: '2025-11-07T10:00', status: 'SWAPPABLE', userId: '2', ownerName: 'Alice Smith' },
        { id: '4', title: 'Design Sprint', startTime: '2025-11-08T13:00', endTime: '2025-11-08T15:00', status: 'SWAPPABLE', userId: '3', ownerName: 'Bob Johnson' }
      ]);
      setSwapRequests({
        incoming: [
          { id: 'sr1', mySlot: { title: 'Focus Block', startTime: '2025-11-06T14:00' }, theirSlot: { title: 'Code Review', startTime: '2025-11-07T09:00' }, requester: 'Alice Smith', status: 'PENDING' }
        ],
        outgoing: [
          { id: 'sr2', mySlot: { title: 'Team Meeting', startTime: '2025-11-05T10:00' }, theirSlot: { title: 'Design Sprint', startTime: '2025-11-08T13:00' }, recipient: 'Bob Johnson', status: 'PENDING' }
        ]
      });
    }
  }, [user]);

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const event = {
      id: Date.now().toString(),
      ...newEvent,
      status: 'BUSY',
      userId: user.id
    };
    setMyEvents([...myEvents, event]);
    setNewEvent({ title: '', startTime: '', endTime: '' });
    setShowCreateModal(false);
  };

  const toggleSwappable = (eventId) => {
    setMyEvents(myEvents.map(event => 
      event.id === eventId 
        ? { ...event, status: event.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY' }
        : event
    ));
  };

  const requestSwap = (theirSlot, mySlotId) => {
    const mySlot = myEvents.find(e => e.id === mySlotId);
    setSwapRequests({
      ...swapRequests,
      outgoing: [...swapRequests.outgoing, {
        id: Date.now().toString(),
        mySlot: { title: mySlot.title, startTime: mySlot.startTime },
        theirSlot: { title: theirSlot.title, startTime: theirSlot.startTime },
        recipient: theirSlot.ownerName,
        status: 'PENDING'
      }]
    });
    setShowSwapModal(false);
    setSelectedSlot(null);
  };

  const handleSwapResponse = (requestId, accepted) => {
    setSwapRequests({
      ...swapRequests,
      incoming: swapRequests.incoming.map(req =>
        req.id === requestId ? { ...req, status: accepted ? 'ACCEPTED' : 'REJECTED' } : req
      )
    });
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'BUSY': return 'bg-red-100 text-red-800 border-red-200';
      case 'SWAPPABLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'SWAP_PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  // Main App
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'calendar' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Calendar</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Create Event</span>
              </button>
            </div>

            <div className="grid gap-4">
              {myEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <div className="flex items-center space-x-2 mt-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatDateTime(event.startTime)}</span>
                        <span className="text-sm">→</span>
                        <span className="text-sm">{formatDateTime(event.endTime)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      {event.status === 'BUSY' && (
                        <button
                          onClick={() => toggleSwappable(event.id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                        >
                          Make Swappable
                        </button>
                      )}
                      {event.status === 'SWAPPABLE' && (
                        <button
                          onClick={() => toggleSwappable(event.id)}
                          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition"
                        >
                          Mark as Busy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'marketplace' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Slots</h2>
            <div className="grid gap-4">
              {swappableSlots.map(slot => (
                <div key={slot.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{slot.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Offered by {slot.ownerName}</p>
                      <div className="flex items-center space-x-2 mt-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatDateTime(slot.startTime)}</span>
                        <span className="text-sm">→</span>
                        <span className="text-sm">{formatDateTime(slot.endTime)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSlot(slot);
                        setShowSwapModal(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      <span>Request Swap</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'requests' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Incoming Requests</h2>
              <div className="grid gap-4">
                {swapRequests.incoming.map(request => (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">From: {request.requester}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        request.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">They want your:</p>
                        <p className="font-semibold text-gray-900">{request.mySlot.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{formatDateTime(request.mySlot.startTime)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">They're offering:</p>
                        <p className="font-semibold text-gray-900">{request.theirSlot.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{formatDateTime(request.theirSlot.startTime)}</p>
                      </div>
                    </div>
                    {request.status === 'PENDING' && (
                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={() => handleSwapResponse(request.id, true)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleSwapResponse(request.id, false)}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Outgoing Requests</h2>
              <div className="grid gap-4">
                {swapRequests.outgoing.map(request => (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">To: {request.recipient}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {request.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">You're offering:</p>
                        <p className="font-semibold text-gray-900">{request.mySlot.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{formatDateTime(request.mySlot.startTime)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">You want:</p>
                        <p className="font-semibold text-gray-900">{request.theirSlot.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{formatDateTime(request.theirSlot.startTime)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Team Meeting"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Swap Request Modal */}
      {showSwapModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Request Swap</h3>
              <button onClick={() => setShowSwapModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">You want:</p>
              <p className="font-semibold text-gray-900">{selectedSlot.title}</p>
              <p className="text-sm text-gray-600 mt-1">{formatDateTime(selectedSlot.startTime)}</p>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-3">Select your slot to offer:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {myEvents.filter(e => e.status === 'SWAPPABLE').map(event => (
                <button
                  key={event.id}
                  onClick={() => requestSwap(selectedSlot, event.id)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition"
                >
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{formatDateTime(event.startTime)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotSwapper;