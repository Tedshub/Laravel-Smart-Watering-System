import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ScheduleManagementCard({ initialDeviceId = null }) {
    const [schedules, setSchedules] = useState([]);
    const [scheduleHour, setScheduleHour] = useState('');
    const [scheduleMinute, setScheduleMinute] = useState('');
    const [deviceId, setDeviceId] = useState(initialDeviceId || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deviceAuthError, setDeviceAuthError] = useState(false);

    // Configure axios to send credentials with requests
    axios.defaults.withCredentials = true;

    // Fetch schedules from API
    const fetchSchedules = async () => {
        try {
            setLoading(true);
            setError(null);
            setDeviceAuthError(false);

            const params = {};
            if (deviceId) {
                params.device_id = deviceId;
            }

            const response = await axios.get('/schedules', { params });

            if (response.data.status === 'success') {
                setSchedules(response.data.data);
            } else {
                setError('Failed to fetch schedules');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError('Error fetching schedules: ' + errorMessage);

            if (err.response?.status === 401) {
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    // Load schedules when deviceId changes
    useEffect(() => {
        if (deviceId) {
            fetchSchedules();
        } else {
            setSchedules([]);
        }
    }, [deviceId]);

    // Handle form submission
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();

        if (!scheduleHour || !scheduleMinute || !deviceId) {
            setError('Please fill in all fields (hour, minute, and device ID)');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setDeviceAuthError(false);

            const scheduleData = {
                hour: parseInt(scheduleHour),
                minute: parseInt(scheduleMinute),
                active: true,
                device_id: deviceId
            };

            const response = await axios.post('/schedules', scheduleData);

            if (response.data.status === 'success') {
                setScheduleHour('');
                setScheduleMinute('');
                fetchSchedules(); // Refresh the list
            } else {
                setError('Failed to add schedule');
            }
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessage = errorData?.message || err.message;

            if (err.response?.status === 401) {
                if (errorData?.errors?.device_id) {
                    setDeviceAuthError(true);
                    setError('Device authentication failed: ' + errorData.errors.device_id.join(', '));
                } else {
                    window.location.href = '/login';
                }
            } else if (err.response?.status === 400) {
                // Handle validation errors
                const validationErrors = errorData?.errors || {};
                const errorMessages = Object.values(validationErrors).flat().join(', ');
                setError('Validation error: ' + errorMessages);
            } else {
                setError('Error adding schedule: ' + errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete schedule
    const deleteSchedule = async (scheduleId) => {
        if (!confirm('Are you sure you want to delete this schedule?')) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setDeviceAuthError(false);

            const response = await axios.delete(`/schedules/${scheduleId}`);

            if (response.data.status === 'success') {
                fetchSchedules(); // Refresh the list
            } else {
                setError('Failed to delete schedule');
            }
        } catch (err) {
            setError('Error deleting schedule: ' + (err.response?.data?.message || err.message));

            if (err.response?.status === 401) {
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-blue-600 px-5 py-4">
                <h3 className="text-lg font-medium text-white">Schedule Management</h3>
            </div>
            <div className="p-5">
                {error && (
                    <div className={`mb-4 p-3 rounded-lg ${deviceAuthError ? 'bg-orange-100 border border-orange-400 text-orange-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
                        {error}
                        {deviceAuthError && (
                            <div className="mt-2">
                                <p className="text-sm">Please ensure the device ID is correct and you have permission to access it.</p>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleScheduleSubmit} className="mb-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor="device-id" className="block text-sm font-medium text-gray-700 mb-2">
                                Device ID
                            </label>
                            <input
                                type="text"
                                id="device-id"
                                value={deviceId}
                                onChange={(e) => setDeviceId(e.target.value)}
                                required
                                disabled={loading || initialDeviceId}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="Enter device ID"
                            />
                        </div>
                        <div>
                            <label htmlFor="schedule-hour" className="block text-sm font-medium text-gray-700 mb-2">
                                Hour (0-23)
                            </label>
                            <input
                                type="number"
                                id="schedule-hour"
                                value={scheduleHour}
                                onChange={(e) => setScheduleHour(e.target.value)}
                                min="0"
                                max="23"
                                required
                                disabled={loading || !deviceId}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="schedule-minute" className="block text-sm font-medium text-gray-700 mb-2">
                                Minute (0-59)
                            </label>
                            <input
                                type="number"
                                id="schedule-minute"
                                value={scheduleMinute}
                                onChange={(e) => setScheduleMinute(e.target.value)}
                                min="0"
                                max="59"
                                required
                                disabled={loading || !deviceId}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !deviceId}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        {loading ? 'Adding...' : 'Add Schedule'}
                    </button>
                </form>

                <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">
                        {deviceId ? `Active Schedules for Device ${deviceId}` : 'Active Schedules'}
                    </h4>

                    {loading && schedules.length === 0 ? (
                        <p className="text-gray-500 text-center py-3">Loading schedules...</p>
                    ) : schedules && schedules.length > 0 ? (
                        <ul className="space-y-2">
                            {schedules.map((schedule) => (
                                <li key={schedule.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {String(schedule.hour).padStart(2, '0')}:{String(schedule.minute).padStart(2, '0')}
                                        </span>
                                        {schedule.device && (
                                            <span className="text-sm text-gray-600">
                                                Device: {schedule.device.name || `ID: ${schedule.device.id}`}
                                            </span>
                                        )}
                                        <span className={`text-xs ${schedule.active ? 'text-green-600' : 'text-red-600'}`}>
                                            {schedule.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteSchedule(schedule.id)}
                                        disabled={loading}
                                        className="text-red-500 hover:text-red-700 disabled:text-gray-400 transition-colors duration-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-3">
                            {deviceId ? 'No active schedules for this device' : 'Enter a device ID to view schedules'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
