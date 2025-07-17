import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in to AquaFlow" />

            <div className="mx-auto w-full max-w-md px-6">
                <div className="flex justify-center">
                    <svg className="h-12 w-12 text-blue-600" viewBox="0 0 24 24" fill="none">
                        <path d="M17 15.5V17C17 18.1046 16.1046 19 15 19H5C3.89543 19 3 18.1046 3 17V11C3 9.89543 3.89543 9 5 9H7M17 15.5H7M17 15.5V9M7 9V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V9M7 9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
                    Welcome back
                </h1>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in to manage your watering system
                </p>

                {status && (
                    <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="mt-8 space-y-6">
                    <div>
                        <InputLabel htmlFor="email" value="Email address" className="block text-sm font-medium text-gray-700" />
                        <div className="mt-1">
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                autoComplete="email"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" className="block text-sm font-medium text-gray-700" />
                        <div className="mt-1">
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <InputLabel htmlFor="remember" value="Remember me" className="ml-2 block text-sm text-gray-700" />
                        </div>

                        {canResetPassword && (
                            <div className="text-sm">
                                <Link
                                    href={route('password.request')}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        )}
                    </div>

                    <div>
                        <PrimaryButton
                            className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            disabled={processing}
                        >
                            Sign in
                        </PrimaryButton>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                        href={route('register')}
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Register now
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
