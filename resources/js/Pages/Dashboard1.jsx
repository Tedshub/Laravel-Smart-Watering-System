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

export default function Dashboard() {
    const [deviceStatus, setDeviceStatus] = useState({
        relay_active: false,
        relay_scheduled: false,
        relay_duration: 0
    });
    const [sensorStatus, setSensorStatus] = useState({ sensors: [] });
    const [schedules, setSchedules] = useState([]);
    const [relayLogs, setRelayLogs] = useState([]);
    const [sensorLogs, setSensorLogs] = useState([]);
    const [duration, setDuration] = useState(10);
    const [scheduleHour, setScheduleHour] = useState('');
    const [scheduleMinute, setScheduleMinute] = useState('');
    const [activeTab, setActiveTab] = useState('relay');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const updateDeviceStatus = async () => {
        try {
            const response = await fetch('/api/device/status');
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

    const updateSensorStatus = async () => {
        try {
            const response = await fetch('/api/sensor/status');
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

    const loadSchedules = async () => {
        try {
            const response = await fetch('/api/schedules');
            if (response.ok) {
                const data = await safeJsonParse(response);
                if (data && Array.isArray(data)) {
                    setSchedules(data);
                } else {
                    setSchedules([]);
                }
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    };

    const deleteSchedule = async (id) => {
        try {
            const response = await fetch(`/api/schedules/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });
            if (response.ok) {
                await loadSchedules();
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    };

    const loadRelayLogs = async () => {
        try {
            const response = await fetch('/api/relay/logs');
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

    const loadSensorLogs = async () => {
        try {
            const response = await fetch('/api/sensor/logs');
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
        try {
            const body = { action };
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
                await updateDeviceStatus();
                await loadRelayLogs();
            }
        } catch (error) {
            console.error('Error controlling relay:', error);
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({
                    hour: parseInt(scheduleHour),
                    minute: parseInt(scheduleMinute)
                })
            });

            if (response.ok) {
                await loadSchedules();
                setScheduleHour('');
                setScheduleMinute('');
            }
        } catch (error) {
            console.error('Error adding schedule:', error);
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
                    loadSchedules(),
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

        const deviceInterval = setInterval(updateDeviceStatus, 5000);
        const sensorInterval = setInterval(updateSensorStatus, 5000);

        return () => {
            clearInterval(deviceInterval);
            clearInterval(sensorInterval);
        };
    }, []);

    if (loading) {
        return (
            <AuthenticatedLayout
                header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Smart Watering System Dashboard</h2>}
            >
                <Head title="Smart Watering System Dashboard" />
                <LoadingState />
            </AuthenticatedLayout>
        );
    }

    if (error) {
        return (
            <AuthenticatedLayout
                header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Smart Watering System Dashboard</h2>}
            >
                <Head title="Smart Watering System Dashboard" />
                <ErrorState error={error} />
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-semibold leading-tight text-gray-800">Smart Watering System Dashboard</h2>}
        >
            <Head title="Smart Watering System Dashboard" />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <DeviceStatusCard deviceStatus={deviceStatus} />
                        <SensorStatusCard sensorStatus={sensorStatus} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <ManualControlCard
                            deviceStatus={deviceStatus}
                            duration={duration}
                            setDuration={setDuration}
                            handleRelayControl={handleRelayControl}
                        />
                        <ScheduleManagementCard
                            schedules={schedules}
                            scheduleHour={scheduleHour}
                            scheduleMinute={scheduleMinute}
                            setScheduleHour={setScheduleHour}
                            setScheduleMinute={setScheduleMinute}
                            handleScheduleSubmit={handleScheduleSubmit}
                            deleteSchedule={deleteSchedule}
                        />
                    </div>

                    <div className="mb-8">
                        <HistoryLogsCard
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            relayLogs={relayLogs}
                            sensorLogs={sensorLogs}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
