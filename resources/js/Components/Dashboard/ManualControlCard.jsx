import React, { useState } from 'react';
import axios from 'axios';

export default function ManualControlCard({ deviceStatus, onStatusUpdate }) {
    const [duration, setDuration] = useState(10); // Default duration
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRelayControl = async (action) => {
        setError(null);
        setIsLoading(true);

        try {
            const data = {
                action: action,
                duration: action === 'activate' ? duration : null
            };

            const response = await axios.post('/control/relay', data, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json'
                }
            });

            if (onStatusUpdate) {
                onStatusUpdate(); // Refresh the status
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            console.error('Error controlling relay:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-green-600 px-5 py-4">
                <h3 className="text-lg font-medium text-white">Manual Control</h3>
            </div>
            <div className="p-5">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                    <button
                        onClick={() => handleRelayControl('activate')}
                        disabled={deviceStatus.relay_active || isLoading}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                            deviceStatus.relay_active || isLoading
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                        {isLoading ? 'Processing...' :
                         (deviceStatus.relay_active ? 'Watering Active' : 'Activate Watering')}
                    </button>
                    <button
                        onClick={() => handleRelayControl('deactivate')}
                        disabled={!deviceStatus.relay_active || isLoading}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                            !deviceStatus.relay_active || isLoading
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {isLoading ? 'Processing...' : 'Deactivate Watering'}
                    </button>
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (seconds)
                    </label>
                    <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value > 0) {
                                setDuration(value);
                            }
                        }}
                        min="1"
                        max="3600"
                        disabled={isLoading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Set watering duration in seconds (1-3600)
                    </p>
                </div>
            </div>
        </div>
    );
}
