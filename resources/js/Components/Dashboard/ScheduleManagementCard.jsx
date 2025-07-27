import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ScheduleManagementCard({ selectedDevice }) {
    const [schedules, setSchedules] = useState([]);
    const [scheduleHour, setScheduleHour] = useState('');
    const [scheduleMinute, setScheduleMinute] = useState('');
    const [scheduleDuration, setScheduleDuration] = useState('15'); // Default 30 menit
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deviceAuthError, setDeviceAuthError] = useState(false);

    // Configure axios to send credentials with requests
    axios.defaults.withCredentials = true;

    // Fetch schedules from API
    const fetchSchedules = async () => {
        if (!selectedDevice) {
            setSchedules([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setDeviceAuthError(false);

            const params = {
                device_id: selectedDevice.id
            };

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

    // Load schedules when selectedDevice changes
    useEffect(() => {
        fetchSchedules();
    }, [selectedDevice]);

    // Handle form submission
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();

        if (!scheduleHour || !scheduleMinute || !scheduleDuration) {
            setError('Please fill in all fields');
            return;
        }

        if (!selectedDevice) {
            setError('Please select a device first');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setDeviceAuthError(false);

            const scheduleData = {
                hour: parseInt(scheduleHour),
                minute: parseInt(scheduleMinute),
                duration: parseInt(scheduleDuration),
                active: true,
                device_id: selectedDevice.id
            };

            const response = await axios.post('/schedules', scheduleData);

            if (response.data.status === 'success') {
                setScheduleHour('');
                setScheduleMinute('');
                setScheduleDuration('30'); // Reset to default
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

    // Format duration to hours and minutes
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0 && mins > 0) {
            return `${hours} jam ${mins} menit`;
        } else if (hours > 0) {
            return `${hours} jam`;
        } else {
            return `${mins} menit`;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-blue-600 px-5 py-4">
                <h3 className="text-lg font-medium text-white">Schedule Management</h3>
            </div>
            <div className="p-5">
                {/* Device Selection Info */}
                {selectedDevice && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-800">
                                Managing schedules for: {selectedDevice.name} (ID: {selectedDevice.id})
                            </span>
                        </div>
                    </div>
                )}

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

                {!selectedDevice && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                        <div className="text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm">Please select a device from Device Status to manage schedules</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleScheduleSubmit} className="mb-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
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
                                disabled={loading || !selectedDevice}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="0"
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
                                disabled={loading || !selectedDevice}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label htmlFor="schedule-duration" className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                id="schedule-duration"
                                value={scheduleDuration}
                                onChange={(e) => setScheduleDuration(e.target.value)}
                                min="1"
                                max="1440"
                                required
                                disabled={loading || !selectedDevice}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="30"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !selectedDevice}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        {loading ? 'Adding...' : 'Add Schedule'}
                    </button>
                </form>

                <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">
                        {selectedDevice ? `Active Schedules for ${selectedDevice.name}` : 'Active Schedules'}
                    </h4>

                    {loading && schedules.length === 0 ? (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center gap-2 text-gray-500">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading schedules...
                            </div>
                        </div>
                    ) : schedules && schedules.length > 0 ? (
                        <ul className="space-y-2">
                            {schedules.map((schedule) => (
                                <li key={schedule.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-lg">
                                            {String(schedule.hour).padStart(2, '0')}:{String(schedule.minute).padStart(2, '0')}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Duration: {formatDuration(schedule.duration)}
                                        </span>
                                        {schedule.device && (
                                            <span className="text-sm text-gray-600">
                                                Device: {schedule.device.name || `ID: ${schedule.device.id}`}
                                            </span>
                                        )}
                                        <span className={`text-xs font-medium ${schedule.active ? 'text-green-600' : 'text-red-600'}`}>
                                            {schedule.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteSchedule(schedule.id)}
                                        disabled={loading}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 disabled:text-gray-400 p-2 rounded-lg transition-all duration-200"
                                        title="Delete schedule"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500">
                                {selectedDevice
                                    ? 'No active schedules for this device'
                                    : 'Select a device to view schedules'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
