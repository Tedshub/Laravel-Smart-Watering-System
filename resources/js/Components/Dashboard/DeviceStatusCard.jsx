import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DeviceStatusCard({ onDeviceSelect }) {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to format date to Indonesian locale
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'Never';

        const date = new Date(dateTimeString);
        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };

        return date.toLocaleDateString('en-US', options) + ' GMT+7';
    };

    // Fetch all devices when component mounts
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/devices');
                const devicesData = response.data.data;
                setDevices(devicesData);

                // Automatically select the first device if available
                if (devicesData.length > 0) {
                    handleDeviceChange(devicesData[0].id);
                }

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch devices');
                setLoading(false);
                console.error('Error fetching devices:', err);
            }
        };

        fetchDevices();
    }, []);

    // Handle device selection
    const handleDeviceChange = async (deviceId) => {
        if (!deviceId) {
            setSelectedDevice(null);
            // Notify parent component about device selection
            if (onDeviceSelect) {
                onDeviceSelect(null);
            }
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`/api/device/${deviceId}`);
            const deviceData = response.data.data;
            setSelectedDevice(deviceData);

            // Notify parent component about device selection
            if (onDeviceSelect) {
                onDeviceSelect(deviceData);
            }

            setLoading(false);
        } catch (err) {
            setError('Failed to fetch device details');
            setLoading(false);
            console.error('Error fetching device:', err);
        }
    };

    if (loading && !selectedDevice) {
        return (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-5">
                <p>Loading devices...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-5">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-blue-600 px-5 py-4">
                <h3 className="text-lg font-medium text-white">Device Status</h3>
            </div>
            <div className="p-5">
                <div className="mb-4">
                    <label htmlFor="device-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Device
                    </label>
                    <select
                        id="device-select"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => handleDeviceChange(e.target.value)}
                        value={selectedDevice?.id || (devices.length > 0 ? devices[0].id : '')}
                    >
                        <option value="">-- Select a device --</option>
                        {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                                {device.name} (ID: {device.id})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedDevice ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Device Name:</span>
                            <span className="font-medium text-gray-800">{selectedDevice.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedDevice.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {selectedDevice.status}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">IP Address:</span>
                            <span className="font-medium text-gray-800">{selectedDevice.ip_address}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Last Seen:</span>
                            <span className="font-medium text-gray-800">
                                {formatDateTime(selectedDevice.last_seen_at)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Registered:</span>
                            <span className="font-medium text-gray-800">
                                {formatDateTime(selectedDevice.created_at)}
                            </span>
                        </div>
                    </div>
                ) : devices.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No devices available</p>
                ) : (
                    <p className="text-gray-500 text-center py-4">Loading device details...</p>
                )}

                {loading && selectedDevice && (
                    <div className="mt-3 text-blue-500">Updating device info...</div>
                )}
            </div>
        </div>
    );
}
