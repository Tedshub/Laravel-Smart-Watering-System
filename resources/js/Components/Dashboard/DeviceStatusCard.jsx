import React from 'react';

export default function DeviceStatusCard({ deviceStatus }) {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-blue-600 px-5 py-4">
                <h3 className="text-lg font-medium text-white">Device Status</h3>
            </div>
            <div className="p-5">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Relay Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            deviceStatus.relay_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {deviceStatus.relay_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Scheduled:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            deviceStatus.relay_scheduled
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {deviceStatus.relay_scheduled ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Duration:</span>
                        <span className="font-medium text-gray-800">
                            {Math.floor(deviceStatus.relay_duration / 1000)} seconds
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
