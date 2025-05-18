'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/app/utils/client-jwt';
import BubblesBackground from '@/app/components/layout/Bubbles';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one number';
        } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one special character (!@#$%^&*)';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            if (!result.success) {
                if (result.errors) {
                    setErrors(result.errors);
                } else if (result.userExists) {
                    setErrors({ email: 'User with this email already exists' });
                } else if (result.message) {
                    setErrors({ form: result.message });
                } else {
                    setErrors({ form: 'Registration failed. Please try again.' });
                }
                return;
            }

            setSuccessMessage('Registration successful! Redirecting to login...');

            setTimeout(() => {
                router.push('/login?registered=true');
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ form: 'An unexpected error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
		<div className="font-['Geist_Mono'] min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#1F2041] flex items-center justify-center p-6 relative overflow-hidden">
			<BubblesBackground />

			<div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-md p-8 relative z-10">
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold text-[#1F2041]">
				Create Account
				</h2>
				<p className="text-[#4B3F72] mt-2">
				Join AlethioSphere and start your journaling journey
				</p>
			</div>

			{successMessage && (
				<div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
				{successMessage}
				</div>
			)}

			{errors.form && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
				{errors.form}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
				<label
					htmlFor="name"
					className="block text-[#1F2041] font-medium mb-2"
				>
					Full Name
				</label>
				<input
					type="text"
					id="name"
					name="name"
					value={formData.name}
					onChange={handleChange}
					className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-[#4B3F72]/30'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E24AA] text-[#1F2041]`}
					placeholder="Enter your name"
				/>
				{errors.name && (
					<p className="mt-1 text-sm text-red-600">{errors.name}</p>
				)}
				</div>

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
					className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-[#4B3F72]/30'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E24AA] text-[#1F2041]`}
					placeholder="Enter your email"
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
					className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-[#4B3F72]/30'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E24AA] text-[#1F2041]`}
					placeholder="Create a password"
				/>
				{errors.password && (
					<p className="mt-1 text-sm text-red-600">{errors.password}</p>
				)}
				{/* Password requirements info */}
				<div className="mt-2 text-xs text-gray-600">
					<p>Password must:</p>
					<ul className="list-disc pl-5 mt-1">
					<li className={formData.password.length >= 6 ? "text-green-600" : ""}>Be at least 6 characters long</li>
					<li className={/(?=.*[a-z])/.test(formData.password) ? "text-green-600" : ""}>Include at least one lowercase letter</li>
					<li className={/(?=.*[A-Z])/.test(formData.password) ? "text-green-600" : ""}>Include at least one uppercase letter</li>
					<li className={/(?=.*\d)/.test(formData.password) ? "text-green-600" : ""}>Include at least one number</li>
					<li className={/(?=.*[!@#$%^&*])/.test(formData.password) ? "text-green-600" : ""}>Include at least one special character (!@#$%^&*)</li>
					</ul>
				</div>
				</div>

				<div>
				<label
					htmlFor="confirmPassword"
					className="block text-[#1F2041] font-medium mb-2"
				>
					Confirm Password
				</label>
				<input
					type="password"
					id="confirmPassword"
					name="confirmPassword"
					value={formData.confirmPassword}
					onChange={handleChange}
					className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-[#4B3F72]/30'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E24AA] text-[#1F2041]`}
					placeholder="Confirm your password"
				/>
				{errors.confirmPassword && (
					<p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
				)}
				</div>

				<button
				type="submit"
				className="cursor-pointer w-full bg-[#8E24AA] text-white py-3 px-6 rounded-lg hover:bg-[#7d1899] transition-all duration-300 shadow-lg font-bold"
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
					<span>Sign Up</span>
				)}
				</button>
			</form>
			
			<p className="mt-8 text-center text-[#4B3F72]">
				Already have an account?{" "}
				<Link
				href="/login"
				className="text-[#189195] hover:underline font-medium"
				>
				Log in
				</Link>
			</p>
			</div>
		</div>
    );
}