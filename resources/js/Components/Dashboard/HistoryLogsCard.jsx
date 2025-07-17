import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';

export default function HistoryLogsCard({ activeTab, setActiveTab }) {
    const { csrf } = usePage().props;
    const [relayLogs, setRelayLogs] = useState([]);
    const [sensorLogs, setSensorLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [relayPagination, setRelayPagination] = useState(null);
    const [sensorPagination, setSensorPagination] = useState(null);
    const [relayFilters, setRelayFilters] = useState({
        device_id: '',
        action: '',
        date_from: '',
        date_to: '',
        limit: 20
    });
    const [sensorFilters, setSensorFilters] = useState({
        device_id: '',
        sensor_number: '',
        limit: 20
    });

    const fetchRelayLogs = async (page = 1) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: relayFilters.limit.toString(),
                ...(relayFilters.device_id && { device_id: relayFilters.device_id }),
                ...(relayFilters.action && { action: relayFilters.action }),
                ...(relayFilters.date_from && { date_from: relayFilters.date_from }),
                ...(relayFilters.date_to && { date_to: relayFilters.date_to })
            });

            const response = await axios.get(`/relay/logs?${params}`, {
                headers: {
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json'
                }
            });

            if (response.data.status === 'success') {
                setRelayLogs(response.data.data.data);
                setRelayPagination(response.data.data);
            } else {
                setError('Failed to load relay logs');
            }
        } catch (err) {
            setError('Failed to load relay logs');
            console.error('Error fetching relay logs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSensorLogs = async (page = 1) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: sensorFilters.limit.toString(),
                ...(sensorFilters.device_id && { device_id: sensorFilters.device_id }),
                ...(sensorFilters.sensor_number && { sensor_number: sensorFilters.sensor_number })
            });

            const response = await axios.get(`/sensor/logs?${params}`, {
                headers: {
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json'
                }
            });

            if (response.data.status === 'success') {
                setSensorLogs(response.data.data.data);
                setSensorPagination(response.data.data);
            } else {
                setError('Failed to load sensor logs');
            }
        } catch (err) {
            setError('Failed to load sensor logs');
            console.error('Error fetching sensor logs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'relay') {
            fetchRelayLogs();
        } else {
            fetchSensorLogs();
        }
    }, [activeTab, relayFilters, sensorFilters]);

    const handleRelayFilterChange = (key, value) => {
        setRelayFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSensorFilterChange = (key, value) => {
        setSensorFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePageChange = (page) => {
        if (activeTab === 'relay') {
            fetchRelayLogs(page);
        } else {
            fetchSensorLogs(page);
        }
    };

    const clearRelayFilters = () => {
        setRelayFilters({
            device_id: '',
            action: '',
            date_from: '',
            date_to: '',
            limit: 20
        });
    };

    const clearSensorFilters = () => {
        setSensorFilters({
            device_id: '',
            sensor_number: '',
            limit: 20
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionBadgeClass = (action) => {
        switch (action) {
            case 'activated':
                return 'bg-green-100 text-green-800';
            case 'deactivated':
                return 'bg-red-100 text-red-800';
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'raining':
                return 'bg-red-100 text-red-800';
            case 'safe':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const currentPagination = activeTab === 'relay' ? relayPagination : sensorPagination;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gray-700 px-5 py-4">
                <h3 className="text-lg font-medium text-white">History Logs</h3>
            </div>
            <div className="p-5">
                {/* Tab Navigation */}
                <div className="mb-5">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('relay')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'relay'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Relay Logs
                            </button>
                            <button
                                onClick={() => setActiveTab('sensor')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'sensor'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Sensor Logs
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    {activeTab === 'relay' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Device ID
                                </label>
                                <input
                                    type="text"
                                    value={relayFilters.device_id}
                                    onChange={(e) => handleRelayFilterChange('device_id', e.target.value)}
                                    placeholder="Enter device ID"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Action
                                </label>
                                <select
                                    value={relayFilters.action}
                                    onChange={(e) => handleRelayFilterChange('action', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Actions</option>
                                    <option value="activated">Activated</option>
                                    <option value="deactivated">Deactivated</option>
                                    <option value="scheduled">Scheduled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date From
                                </label>
                                <input
                                    type="date"
                                    value={relayFilters.date_from}
                                    onChange={(e) => handleRelayFilterChange('date_from', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date To
                                </label>
                                <input
                                    type="date"
                                    value={relayFilters.date_to}
                                    onChange={(e) => handleRelayFilterChange('date_to', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Limit
                                </label>
                                <select
                                    value={relayFilters.limit}
                                    onChange={(e) => handleRelayFilterChange('limit', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Device ID
                                </label>
                                <input
                                    type="text"
                                    value={sensorFilters.device_id}
                                    onChange={(e) => handleSensorFilterChange('device_id', e.target.value)}
                                    placeholder="Enter device ID"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sensor Number
                                </label>
                                <select
                                    value={sensorFilters.sensor_number}
                                    onChange={(e) => handleSensorFilterChange('sensor_number', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Sensors</option>
                                    <option value="1">Sensor 1</option>
                                    <option value="2">Sensor 2</option>
                                    <option value="3">Sensor 3</option>
                                    <option value="4">Sensor 4</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Limit
                                </label>
                                <select
                                    value={sensorFilters.limit}
                                    onChange={(e) => handleSensorFilterChange('limit', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    )}
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={activeTab === 'relay' ? clearRelayFilters : clearSensorFilters}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Loading, Error, and Data Display */}
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4 bg-red-50 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {activeTab === 'relay' ? (
                            relayLogs.length > 0 ? (
                                <>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Device
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Action
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Duration (seconds)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {relayLogs.map((log, index) => (
                                                <tr key={log.id || index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(log.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {log.device?.name || 'Unknown Device'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeClass(log.action)}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {log.duration_seconds || 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-lg mb-2">📋</div>
                                    <p className="text-gray-500">No relay logs available</p>
                                </div>
                            )
                        ) : (
                            sensorLogs.length > 0 ? (
                                <>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Device
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Sensor
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {sensorLogs.map((log, index) => (
                                                <tr key={log.id || index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(log.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {log.device?.name || 'Unknown Device'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        Sensor {log.sensor_number || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(log.status)}`}>
                                                            {log.status === 'raining' ? 'Raining' : 'Safe'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-lg mb-2">📊</div>
                                    <p className="text-gray-500">No sensor logs available</p>
                                </div>
                            )
                        )}

                        {/* Pagination */}
                        {currentPagination && currentPagination.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {currentPagination.from} to {currentPagination.to} of {currentPagination.total} results
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPagination.current_page - 1)}
                                        disabled={currentPagination.current_page === 1}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: currentPagination.last_page }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1 text-sm border rounded-md ${
                                                page === currentPagination.current_page
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPagination.current_page + 1)}
                                        disabled={currentPagination.current_page === currentPagination.last_page}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
