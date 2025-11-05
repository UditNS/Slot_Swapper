import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ArrowLeftRight, Bell, LogOut, Plus, X } from 'lucide-react';
const Auth = () => {

    const handleLogin = (e) => {
        e.preventDefault();
        setUser(mockUser);
        setCurrentView('calendar');
    };

    const handleSignup = (e) => {
        e.preventDefault();
        setUser(mockUser);
        setCurrentView('calendar');
    };

    
    if (!user) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                  <ArrowLeftRight className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">SlotSwapper</h1>
                <p className="text-gray-600 mt-2">Peer-to-peer time slot scheduling</p>
              </div>
    
              {currentView === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium">
                    Log In
                  </button>
                  <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setCurrentView('signup')} className="text-indigo-600 hover:underline font-medium">
                      Sign Up
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium">
                    Sign Up
                  </button>
                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setCurrentView('login')} className="text-indigo-600 hover:underline font-medium">
                      Log In
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        );
      }
}

export default Auth