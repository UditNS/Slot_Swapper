// src/components/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleSwappable,
  clearError,
} from '../store/slices/eventSlice';
import { Plus, Clock, X, Edit2, Trash2, AlertCircle } from 'lucide-react';
import CreateEventModal from './CreateEventModal';
import EditEventModal from './EditEventModal';

const CalendarView = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleToggleSwappable = async (eventId) => {
    await dispatch(toggleSwappable(eventId));
    dispatch(fetchEvents());
  };

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await dispatch(deleteEvent(eventId));
      dispatch(fetchEvents());
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'BUSY':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SWAPPABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SWAP_PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusAction = (event) => {
    if (event.status === 'SWAP_PENDING') {
      return null;
    }
    return (
      <button
        onClick={() => handleToggleSwappable(event._id)}
        className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
          event.status === 'BUSY'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        {event.status === 'BUSY' ? 'Make Swappable' : 'Mark as Busy'}
      </button>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Calendar</h2>
          <p className="text-gray-600 mt-1">Manage your schedule and availability</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => dispatch(clearError())}
            className="ml-auto text-red-700 hover:text-red-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600 mb-4">Create your first event to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                {/* Event Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(event.startTime)}</span>
                    </div>
                    <span>→</span>
                    <span>{formatDateTime(event.endTime)}</span>
                  </div>

                  {event.location && (
                    <p className="text-sm text-gray-500 mt-2">📍 {event.location}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="ml-4 flex flex-col space-y-2">
                  {getStatusAction(event)}
                  
                  {event.status !== 'SWAP_PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(event)}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(event._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {event.status === 'SWAP_PENDING' && (
                    <p className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                      Swap in progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            dispatch(fetchEvents());
          }}
        />
      )}

      {showEditModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
            dispatch(fetchEvents());
          }}
        />
      )}
    </div>
  );
};

export default CalendarView;