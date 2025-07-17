import React from 'react';

export default function SensorStatusCard({ sensorStatus }) {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-yellow-600 px-5 py-4">
                <h3 className="text-lg font-medium text-white">Sensor Status</h3>
            </div>
            <div className="p-5">
                {sensorStatus.sensors && sensorStatus.sensors.length > 0 ? (
                    <div className="space-y-3">
                        {sensorStatus.sensors.map((sensor) => (
                            <div key={sensor.id} className="flex items-center justify-between">
                                <span className="text-gray-600">Sensor {sensor.id}:</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    sensor.status === 'raining'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {sensor.status === 'raining' ? 'Raining' : 'Safe'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No sensors available</p>
                )}
            </div>
        </div>
    );
}
