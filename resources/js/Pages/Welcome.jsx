import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome to AquaFlow" />
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 text-gray-800">
                <div className="relative flex min-h-screen flex-col items-center justify-center">
                    <div className="w-full max-w-4xl px-6 py-12">
                        <header className="flex items-center justify-between py-6">
                            <div className="flex items-center">
                                <svg className="h-10 w-10 text-blue-600" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 15.5V17C17 18.1046 16.1046 19 15 19H5C3.89543 19 3 18.1046 3 17V11C3 9.89543 3.89543 9 5 9H7M17 15.5H7M17 15.5V9M7 9V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V9M7 9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="ml-3 text-2xl font-bold text-blue-600">AquaFlow</span>
                            </div>
                            <nav className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg px-4 py-2 text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="mt-12">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                                    Smart Watering System
                                </h1>
                                <p className="mt-6 text-lg leading-8 text-gray-600">
                                    Automate your plant care with our intelligent watering solution.
                                    Save water, save time, and grow healthier plants.
                                </p>
                            </div>

                            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="rounded-xl bg-white p-6 shadow-lg transition hover:shadow-xl">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-gray-900">Smart Scheduling</h3>
                                    <p className="mt-2 text-gray-600">
                                        Our system learns your plants' needs and adjusts watering automatically.
                                    </p>
                                </div>

                                <div className="rounded-xl bg-white p-6 shadow-lg transition hover:shadow-xl">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-gray-900">Water Conservation</h3>
                                    <p className="mt-2 text-gray-600">
                                        Save up to 50% water with our precision watering technology.
                                    </p>
                                </div>

                                <div className="rounded-xl bg-white p-6 shadow-lg transition hover:shadow-xl">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-gray-900">Remote Control</h3>
                                    <p className="mt-2 text-gray-600">
                                        Manage your system from anywhere with our mobile app.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-16 rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 p-8 text-white">
                                <div className="max-w-2xl">
                                    <h2 className="text-3xl font-bold">Ready to transform your garden?</h2>
                                    <p className="mt-4">
                                        Join thousands of happy plant lovers who trust our smart watering system.
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            href={auth.user ? route('dashboard') : route('register')}
                                            className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-blue-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                                        >
                                            Get Started
                                            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>

                        <footer className="mt-16 py-8 text-center text-sm text-gray-500">
                            © {new Date().getFullYear()} AquaFlow Watering System. All rights reserved.
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
