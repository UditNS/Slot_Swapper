// src/components/RequestsView.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyRequests, respondToSwap, cancelSwapRequest } from '../store/slices/swapSlice';
import { fetchEvents } from '../store/slices/eventSlice';
import { Clock, User, CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';

const RequestsView = () => {
  const dispatch = useDispatch();
  const { incomingRequests, outgoingRequests, loading, actionLoading, error } = useSelector(
    (state) => state.swaps
  );

  useEffect(() => {
    dispatch(fetchMyRequests());
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

  const handleAccept = async (requestId) => {
    if (window.confirm('Are you sure you want to accept this swap? The events will be exchanged.')) {
      await dispatch(respondToSwap({ requestId, accepted: true }));
      dispatch(fetchMyRequests());
      dispatch(fetchEvents());
    }
  };

  const handleReject = async (requestId) => {
    if (window.confirm('Are you sure you want to reject this swap request?')) {
      await dispatch(respondToSwap({ requestId, accepted: false }));
      dispatch(fetchMyRequests());
      dispatch(fetchEvents());
    }
  };

  const handleCancel = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this swap request?')) {
      await dispatch(cancelSwapRequest(requestId));
      dispatch(fetchMyRequests());
      dispatch(fetchEvents());
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading && incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  const pendingIncoming = incomingRequests.filter((r) => r.status === 'PENDING');
  const pendingOutgoing = outgoingRequests.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Incoming Requests */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Incoming Requests</h2>
            <p className="text-gray-600 mt-1">
              Swap requests from other users
              {pendingIncoming.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                  {pendingIncoming.length} pending
                </span>
              )}
            </p>
          </div>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No incoming requests</h3>
            <p className="text-gray-600">You haven't received any swap requests yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {incomingRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      From: {request.requesterId?.name || 'Unknown'}
                    </span>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {/* Swap Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* They Want */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <p className="text-xs text-red-600 font-medium mb-1">They want your:</p>
                    <p className="font-semibold text-gray-900">{request.theirSlotId?.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(request.theirSlotId?.startTime)}</span>
                    </div>
                    {request.theirSlotId?.description && (
                      <p className="text-xs text-gray-600 mt-2">{request.theirSlotId.description}</p>
                    )}
                  </div>

                  {/* They Offer */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-green-600 font-medium mb-1">They're offering:</p>
                    <p className="font-semibold text-gray-900">{request.mySlotId?.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(request.mySlotId?.startTime)}</span>
                    </div>
                    {request.mySlotId?.description && (
                      <p className="text-xs text-gray-600 mt-2">{request.mySlotId.description}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                {request.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Message:</p>
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                )}

                {/* Actions */}
                {request.status === 'PENDING' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAccept(request._id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Accept Swap</span>
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {request.status === 'ACCEPTED' && (
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-green-700 font-medium">
                      ✓ Swap completed! Events have been exchanged.
                    </p>
                  </div>
                )}

                {request.status === 'REJECTED' && (
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-sm text-red-700 font-medium">✗ Swap request rejected</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Requests */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Outgoing Requests</h2>
            <p className="text-gray-600 mt-1">
              Swap requests you've sent to others
              {pendingOutgoing.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  {pendingOutgoing.length} pending
                </span>
              )}
            </p>
          </div>
        </div>

        {outgoingRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No outgoing requests</h3>
            <p className="text-gray-600">You haven't sent any swap requests yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {outgoingRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      To: {request.recipientId?.name || 'Unknown'}
                    </span>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {/* Swap Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* You're Offering */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium mb-1">You're offering:</p>
                    <p className="font-semibold text-gray-900">{request.mySlotId?.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(request.mySlotId?.startTime)}</span>
                    </div>
                  </div>

                  {/* You Want */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-xs text-purple-600 font-medium mb-1">You want:</p>
                    <p className="font-semibold text-gray-900">{request.theirSlotId?.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(request.theirSlotId?.startTime)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {request.status === 'PENDING' && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleCancel(request._id)}
                      disabled={actionLoading}
                      className="flex items-center justify-center space-x-2 w-full md:w-auto px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Cancel Request</span>
                    </button>
                  </div>
                )}

                {request.status === 'ACCEPTED' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-green-700 font-medium">
                      ✓ Request accepted! Events have been swapped.
                    </p>
                  </div>
                )}

                {request.status === 'REJECTED' && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-sm text-red-700 font-medium">
                      ✗ Request was rejected by the other user
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsView;