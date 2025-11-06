
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSwappableSlots, createSwapRequest } from '../store/slices/swapSlice';
import { fetchEvents } from '../store/slices/eventSlice';
import { Clock, Users, ArrowLeftRight, X, AlertCircle } from 'lucide-react';

const MarketplaceView = () => {
  const dispatch = useDispatch();
  const { swappableSlots, loading, error, actionLoading } = useSelector((state) => state.swaps);
  const { events } = useSelector((state) => state.events);

  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [swapError, setSwapError] = useState('');

  useEffect(() => {
    dispatch(fetchSwappableSlots());
    dispatch(fetchEvents());
  }, [dispatch]);

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

  const getDuration = (start, end) => {
    const duration = (new Date(end) - new Date(start)) / (1000 * 60);
    if (duration < 60) return `${duration} min`;
    return `${Math.floor(duration / 60)}h ${duration % 60}min`;
  };

  const mySwappableEvents = events.filter((e) => e.status === 'SWAPPABLE');

  const handleRequestSwap = (slot) => {
    if (mySwappableEvents.length === 0) {
      setSwapError('You need to have at least one swappable event to request a swap');
      return;
    }
    setSelectedSlot(slot);
    setShowSwapModal(true);
    setSwapError('');
  };

  const handleSwapSubmit = async (mySlotId) => {
    setSwapError('');
    try {
      await dispatch(
        createSwapRequest({
          mySlotId,
          theirSlotId: selectedSlot.id,
        })
      ).unwrap();
      setShowSwapModal(false);
      setSelectedSlot(null);
      dispatch(fetchSwappableSlots());
      dispatch(fetchEvents());
    } catch (err) {
      setSwapError(err);
    }
  };

  if (loading && swappableSlots?.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Marketplace</h2>
        <p className="text-gray-600 mt-1">
          Browse and request swaps from other users' available time slots
        </p>
      </div>

      {/* Info Box */}
      {mySwappableEvents.length === 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Make your events swappable first!</p>
            <p>To request swaps, you need to have at least one swappable event in your calendar.</p>
          </div>
        </div>
      )}

      {/* Available Slots */}
      {swappableSlots?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No slots available</h3>
          <p className="text-gray-600">Check back later for swappable time slots from other users</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {swappableSlots?.map((slot) => (
            <div
              key={slot.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                {/* Slot Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{slot.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <Users className="w-4 h-4 inline mr-1" />
                        Offered by <span className="font-medium">{slot.owner.name}</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      AVAILABLE
                    </span>
                  </div>

                  {slot.description && (
                    <p className="text-gray-600 text-sm mb-3">{slot.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(slot.startTime)}</span>
                    </div>
                    <span>→</span>
                    <span>{formatDateTime(slot.endTime)}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {getDuration(slot.startTime, slot.endTime)}
                    </span>
                  </div>

                  {slot.location && (
                    <p className="text-sm text-gray-500 mt-2">📍 {slot.location}</p>
                  )}
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  <button
                    onClick={() => handleRequestSwap(slot)}
                    disabled={mySwappableEvents.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>Request Swap</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Swap Request Modal */}
      {showSwapModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Request Swap</h3>
              <button
                onClick={() => {
                  setShowSwapModal(false);
                  setSelectedSlot(null);
                  setSwapError('');
                }}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error */}
            {swapError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {swapError}
              </div>
            )}

            {/* Selected Slot Info */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">You want:</p>
              <p className="font-semibold text-gray-900">{selectedSlot.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                {formatDateTime(selectedSlot.startTime)}
              </p>
              <p className="text-xs text-gray-500 mt-1">by {selectedSlot.owner.name}</p>
            </div>

            {/* My Swappable Events */}
            <p className="text-sm font-medium text-gray-700 mb-3">
              Select your slot to offer in exchange:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mySwappableEvents.map((event) => (
                <button
                  key={event._id}
                  onClick={() => handleSwapSubmit(event._id)}
                  disabled={actionLoading}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDateTime(event.startTime)}
                  </p>
                  {event.description && (
                    <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                  )}
                </button>
              ))}
            </div>

            {actionLoading && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Sending swap request...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceView;