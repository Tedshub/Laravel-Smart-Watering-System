import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DeviceStatusCard from '@/Components/Dashboard/DeviceStatusCard';
import SensorStatusCard from '@/Components/Dashboard/SensorStatusCard';
import ManualControlCard from '@/Components/Dashboard/ManualControlCard';
import ScheduleManagementCard from '@/Components/Dashboard/ScheduleManagementCard';
import HistoryLogsCard from '@/Components/Dashboard/HistoryLogsCard';
import LoadingState from '@/Components/Shared/LoadingState';
import ErrorState from '@/Components/Shared/ErrorState';

export default function Dashboard({ auth }) {
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [deviceStatus, setDeviceStatus] = useState({
        relay_active: false,
        relay_scheduled: false,
        relay_duration: 0
    });
    const [sensorStatus, setSensorStatus] = useState({ sensors: [] });
    const [relayLogs, setRelayLogs] = useState([]);
    const [sensorLogs, setSensorLogs] = useState([]);
    const [duration, setDuration] = useState(10);
    const [activeTab, setActiveTab] = useState('relay');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const safeJsonParse = async (response) => {
        try {
            const text = await response.text();
            if (!text) return null;
            return JSON.parse(text);
        } catch (error) {
            console.error('JSON parse error:', error);
            return null;
        }
    };

    const getCsrfToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : '';
    };

    const updateDeviceStatus = async (deviceId = null) => {
        try {
            let url = '/api/device/status';
            if (deviceId) {
                url = `/api/device/${deviceId}/status`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await safeJsonParse(response);
                if (data) {
                    setDeviceStatus(prev => ({
                        relay_active: data.relay_active || false,
                        relay_scheduled: data.relay_scheduled || false,
                        relay_duration: data.relay_duration || 0
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching device status:', error);
        }
    };

    const updateSensorStatus = async (deviceId = null) => {
        try {
            let url = '/api/sensor/status';
            if (deviceId) {
                url = `/api/device/${deviceId}/sensor/status`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await safeJsonParse(response);
                if (data && Array.isArray(data.sensors)) {
                    setSensorStatus(data);
                } else {
                    setSensorStatus({ sensors: [] });
                }
            }
        } catch (error) {
            console.error('Error fetching sensor status:', error);
        }
    };

    const loadRelayLogs = async (deviceId = null) => {
        try {
            let url = '/api/relay/logs';
            if (deviceId) {
                url = `/api/device/${deviceId}/relay/logs`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await safeJsonParse(response);
                if (data && Array.isArray(data)) {
                    setRelayLogs(data);
                } else {
                    setRelayLogs([]);
                }
            }
        } catch (error) {
            console.error('Error loading relay logs:', error);
        }
    };

    const loadSensorLogs = async (deviceId = null) => {
        try {
            let url = '/api/sensor/logs';
            if (deviceId) {
                url = `/api/device/${deviceId}/sensor/logs`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await safeJsonParse(response);
                if (data && Array.isArray(data)) {
                    setSensorLogs(data);
                } else {
                    setSensorLogs([]);
                }
            }
        } catch (error) {
            console.error('Error loading sensor logs:', error);
        }
    };

    const handleRelayControl = async (action) => {
        if (!selectedDevice) {
            setError('Please select a device first');
            return;
        }

        try {
            const body = { action, device_id: selectedDevice.id };
            if (action === 'activate') {
                body.duration = parseInt(duration) || 10;
            }

            const response = await fetch('/control/relay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                await updateDeviceStatus(selectedDevice.id);
                await loadRelayLogs(selectedDevice.id);
            }
        } catch (error) {
            console.error('Error controlling relay:', error);
        }
    };

    const handleDeviceSelect = (device) => {
        setSelectedDevice(device);
        if (device) {
            updateDeviceStatus(device.id);
            updateSensorStatus(device.id);
            loadRelayLogs(device.id);
            loadSensorLogs(device.id);
        } else {
            updateDeviceStatus();
            updateSensorStatus();
            loadRelayLogs();
            loadSensorLogs();
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });

            if (response.ok) {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            setError(null);

            try {
                await Promise.all([
                    updateDeviceStatus(),
                    updateSensorStatus(),
                    loadRelayLogs(),
                    loadSensorLogs()
                ]);
            } catch (error) {
                console.error('Error initializing data:', error);
                setError('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };

        initializeData();

        const deviceInterval = setInterval(() => {
            if (selectedDevice) {
                updateDeviceStatus(selectedDevice.id);
            } else {
                updateDeviceStatus();
            }
        }, 5000);

        const sensorInterval = setInterval(() => {
            if (selectedDevice) {
                updateSensorStatus(selectedDevice.id);
            } else {
                updateSensorStatus();
            }
        }, 5000);

        return () => {
            clearInterval(deviceInterval);
            clearInterval(sensorInterval);
        };
    }, []);

    // Custom Sticky Navbar Component
    const StickyNavbar = () => (
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-lg border-b border-emerald-500/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Title */}
                    <div className="flex items-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                            <svg className="w-8 h-8 mr-3 text-emerald-200" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                            </svg>
                            Smart Watering System Dashboard
                        </h1>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg px-4 py-2 transition-colors duration-200"
                        >
                            <div className="w-8 h-8 bg-emerald-300 rounded-full flex items-center justify-center">
                                <span className="text-emerald-800 font-medium text-sm">
                                    {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                            </div>
                            <span className="hidden sm:block font-medium">
                                {auth?.user?.name || 'User'}
                            </span>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm text-gray-600">Signed in as</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {auth?.user?.email || 'user@example.com'}
                                        </p>
                                    </div>

                                    {/* Profile Link */}
                                    <a
                                        href="/profile"
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </a>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    {/* Logout Button */}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                    >
                                        <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
                <Head title="Smart Watering System Dashboard" />
                <StickyNavbar />
                <LoadingState />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
                <Head title="Smart Watering System Dashboard" />
                <StickyNavbar />
                <ErrorState error={error} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <Head title="Smart Watering System Dashboard" />
            <StickyNavbar />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <DeviceStatusCard
                            onDeviceSelect={handleDeviceSelect}
                        />
                        <ScheduleManagementCard
                            selectedDevice={selectedDevice}
                        />
                    </div>

                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <ManualControlCard
                            deviceStatus={deviceStatus}
                            duration={duration}
                            setDuration={setDuration}
                            handleRelayControl={handleRelayControl}
                            selectedDevice={selectedDevice}
                        />
                        <SensorStatusCard
                            sensorStatus={sensorStatus}
                            selectedDevice={selectedDevice}
                        />
                    </div> */}

                    <div className="mb-8">
                        <HistoryLogsCard
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            relayLogs={relayLogs}
                            sensorLogs={sensorLogs}
                            selectedDevice={selectedDevice}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
