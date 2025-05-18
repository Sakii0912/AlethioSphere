'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {getCurrentUser, login} from '@/app/utils/client-jwt';
import BubblesBackground from '@/app/components/layout/Bubbles';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // Check for URL parameters on load
    useEffect(() => {
        const registered = searchParams.get('registered');
        const sessionExpired = searchParams.get('session_expired');
        const authRequired = searchParams.get('auth_required');

        if (registered === 'true') {
            setStatusMessage({
                type: 'success',
                text: 'Registration successful! Please login with your new account.'
            });
        } else if (sessionExpired === 'true') {
            setStatusMessage({
                type: 'warning',
                text: 'Your session has expired. Please login again.'
            });
        } else if (authRequired === 'true') {
            setStatusMessage({
                type: 'warning',
                text: 'Please login to access that page.'
            });
        } else if (getCurrentUser() !== null) {
            router.push('/home');
        }
    }, [searchParams, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});
        setStatusMessage(null);

        try {
            // Use the login function from client-jwt.js
            const data = await login({
                email: formData.email,
                password: formData.password
            });

            if (!data.success) {
                setErrors({ form: data.message || 'Login failed. Please check your credentials.' });
                setStatusMessage({
                    type: 'error',
                    text: data.message || 'Invalid email or password'
                });
                return;
            }

            // Login successful - redirect to home/dashboard
            router.push('/home');

        } catch (error) {
            console.error('Login error:', error);
            setErrors({ form: 'An unexpected error occurred. Please try again.' });
            setStatusMessage({
                type: 'error',
                text: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
      	<div className="flex min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#4B3F72] font-['Geist_Mono'] relative overflow-hidden">
        	<BubblesBackground />

        <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-8">
          	<div className="text-center mb-8">
            	<h1 className="text-5xl font-bold text-[#FFC857] mb-4">
              		AlethioSphere
            	</h1>
            	<p className="text-xl text-white">
              		Your AI companion for personal journaling
            	</p>
          	</div>
          	<div className="relative">
            	<div className="bg-[#1F2041] p-2 rounded-lg shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-300 group">
					<Image
						src="/images/landing_page_avatar.jpg"
						alt="AI Avatar"
						width={300}
						height={350}
						className="rounded-lg group-hover:scale-105 transition-all duration-300"
						style={{ objectFit: "cover" }}
					/>
					<div className="absolute -bottom-4 -right-4 bg-[#FFC857] text-[#1F2041] py-2 px-4 rounded-lg shadow-md text-sm font-bold">
						Welcome Back!
					</div>
            	</div>
          	</div>
        </div>

        {/* Right side with login form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 relative z-10">
			<div className="w-full max-w-md rounded-lg bg-white/95 backdrop-blur-sm p-8 shadow-xl">
				<div className="mb-6 text-center">
				<h1 className="text-4xl font-bold text-[#1F2041] tracking-tight">
					Welcome Back!
				</h1>
				<p className="mt-2 text-[#4B3F72]">
					Enter your credentials to continue
				</p>
				</div>

				{statusMessage && (
				<div
					className={`mb-4 p-3 rounded-md ${
					statusMessage.type === "success"
						? "bg-green-100 text-green-700"
						: statusMessage.type === "warning"
						? "bg-yellow-100 text-yellow-700"
						: statusMessage.type === "error"
						? "bg-red-100 text-red-700"
						: "bg-blue-100 text-blue-700"
					}`}
				>
					{statusMessage.text}
				</div>
				)}

				{!statusMessage && errors.form && (
				<div className="mb-4 p-3 rounded-md bg-red-100 text-red-700">
					{errors.form}
				</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label
					htmlFor="email"
					className="block text-[#1F2041] font-medium mb-2"
					>
					Email Address
					</label>
					<input
					type="email"
					id="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
					className={`w-full px-4 py-2 border ${
						errors.email ? "border-red-500" : "border-[#4B3F72]/30"
					} rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E24AA] text-[#1F2041]`}
					placeholder="Enter your email"
					required
					/>
					{errors.email && (
					<p className="mt-1 text-sm text-red-600">{errors.email}</p>
					)}
				</div>

				<div>
					<label
					htmlFor="password"
					className="block text-[#1F2041] font-medium mb-2"
					>
					Password
					</label>
					<input
					type="password"
					id="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
					className={`w-full px-4 py-2 border ${
						errors.password ? "border-red-500" : "border-[#4B3F72]/30"
					} rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E24AA] text-[#1F2041]`}
					placeholder="Enter your password"
					required
					/>
					{errors.password && (
					<p className="mt-1 text-sm text-red-600">{errors.password}</p>
					)}
				</div>

				<div>
					<button
					type="submit"
					className="w-full rounded-lg bg-[#8E24AA] py-3 font-bold text-white shadow-md transition-all duration-300 hover:bg-[#4B3F72] hover:cursor-pointer"
					disabled={isLoading}
					>
					{isLoading ? (
						<div role="status" className="flex justify-center">
						<svg
							aria-hidden="true"
							className="inline w-6 h-6 text-white/50 animate-spin fill-white"
							viewBox="0 0 100 101"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
							d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
							fill="currentColor"
							/>
							<path
							d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
							fill="currentFill"
							/>
						</svg>
						<span className="sr-only">Loading...</span>
						</div>
					) : (
						<span>Let's Go!</span>
					)}
					</button>
				</div>
				</form>

				<div className="mt-8 text-center">
				<p className="text-[#1F2041]">
					Don&apos;t have an account?{" "}
					<Link
					href="/register"
					className="font-semibold text-[#8E24AA] hover:text-[#4B3F72] transition-all duration-200"
					>
					Sign up now
					</Link>
				</p>
				</div>

				<div className="mt-8 pt-6 border-t border-gray-200">
				<button
					onClick={() => router.push("/")}
					className="cursor-pointer w-full flex items-center justify-center text-[#1F2041] hover:text-[#8E24AA] transition-all duration-200"
				>
					<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-5 w-5 mr-2"
					viewBox="0 0 20 20"
					fill="currentColor"
					>
					<path
						fillRule="evenodd"
						d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
						clipRule="evenodd"
					/>
					</svg>
					Back to Home
				</button>
				</div>
			</div>
		</div>
	</div>
    );
}
