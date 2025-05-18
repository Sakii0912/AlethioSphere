'use client';

import BubblesBackground from '@/app/components/layout/Bubbles';
import { TopBar } from "@/app/components/layout/TopBar";
import { getCurrentUser, isAuthenticated } from '@/app/utils/client-jwt';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const formatDate = (dateString, format = 'full') => {
	if (!dateString) return 'N/A';
	const date = new Date(dateString);
	if (format === 'date-only') {
		return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		});
	}
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
};

const formatDuration = (minutes) => {
	if (!minutes) return 'N/A';
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins}m`;
};

const InfoCard = ({ title, children }) => (
	<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
		<h3 className="text-xl font-bold text-[#1F2041] mb-4">{title}</h3>
		<div className="space-y-2">
		{children}
		</div>
	</div>
);

const InfoItem = ({ label, value }) => (
	<p className="text-gray-700 flex justify-between items-center">
		<span className="font-medium">{label}:</span>
		<span className="ml-2">{value}</span>
	</p>
);

const StatCard = ({ label, value }) => (
	<div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200 hover:shadow-md transition-all">
		<p className="text-sm text-gray-500">{label}</p>
		<p className="text-lg font-bold text-[#1F2041]">{value}</p>
	</div>
);

const ProfileCard = ({ profile, user, onEdit }) => (
	<div className="bg-white shadow-xl rounded-lg overflow-hidden mb-10 backdrop-blur-sm bg-opacity-20">
		<div className="bg-[#671b7c] h-32 flex items-end justify-between p-6">
		<div className="flex items-center">
			<div className="bg-[#FFC857] rounded-full h-20 w-20 border-4 border-white flex items-center justify-center text-[#1F2041] font-bold text-2xl">
			{user?.name?.charAt(0) || "A"}
			</div>
			<div className="ml-4 text-white">
			<h2 className="text-2xl font-bold">{profile?.name}</h2>
			<p className="text-white/80">
				Member since {formatDate(profile?.createdAt, "date-only")}
			</p>
			</div>
		</div>
		<button
			onClick={onEdit}
			className="cursor-pointer bg-[#1F2041] text-white px-4 py-2 rounded-lg hover:bg-[#4B3F72] transition-all"
		>
			Edit Profile
		</button>
		</div>

		<div className="p-6">
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-1 gap-6">
			<InfoCard title="Personal Information">
				<InfoItem label="Name" value={profile?.name} />
				<InfoItem label="Email" value={profile?.email} />
			</InfoCard>
			</div>
		</div>
		</div>
	</div>
);

const ProfileForm = ({ formData, setFormData, onSubmit, onCancel }) => {
	const [errors, setErrors] = useState({});
	const [hasChanges, setHasChanges] = useState(false);

	// Track changes to form data
	useEffect(() => {
		setHasChanges(true);
	}, [formData]);

	const validate = () => {
		const newErrors = {};
		if (!formData.name.trim()) newErrors.name = "Name is required";
		if (!formData.email.trim()) newErrors.email = "Email is required";
		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
		newErrors.email = "Valid email is required";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Form submitted with data:", formData);
		if (validate()) onSubmit(e);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		if (name.includes('.')) {
		const [parent, child] = name.split('.');
		setFormData({
			...formData,
			[parent]: {
			...formData[parent],
			[child]: value
			}
		});
		} else {
		setFormData({
			...formData,
			[name]: value
		});
		}
	};

	const handleCancel = () => {
		if (hasChanges) {
			const confirmCancel = window.confirm(
				"Are you sure you want to cancel? Any unsaved changes will be lost."
			);
			if (confirmCancel) {
				onCancel();
			}
		} else {
			onCancel();
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
			<label className="block text-[#1F2041] font-medium mb-2">Name</label>
			<input
				type="text"
				name="name"
				value={formData.name}
				onChange={handleInputChange}
				className={`w-full px-4 py-2 border ${
				errors.name ? "border-red-500" : "border-gray-300"
				} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E24AA]`}
			/>
			{errors.name && (
				<p className="text-red-500 text-sm mt-1">{errors.name}</p>
			)}
			</div>
			<div>
			<label className="block text-[#1F2041] font-medium mb-2">Email</label>
			<input
				type="email"
				name="email"
				value={formData.email}
				onChange={handleInputChange}
				className={`w-full px-4 py-2 border ${
				errors.email ? "border-red-500" : "border-gray-300"
				} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E24AA]`}
			/>
			{errors.email && (
				<p className="text-red-500 text-sm mt-1">{errors.email}</p>
			)}
			</div>
		</div>

		<div className="mt-8 flex justify-end space-x-4">
			<button
			type="button"
			onClick={handleCancel}
			className="cursor-pointer px-4 py-2 border border-[#1F2041] text-[#1F2041] rounded-lg hover:bg-gray-100"
			>
			Cancel
			</button>
			<button
			type="submit"
			className="cursor-pointer px-4 py-2 bg-[#1F2041] text-white rounded-lg hover:bg-[#4B3F72]"
			>
			Save Changes
			</button>
		</div>
		</form>
	);
};

export default function ProfilePage() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		email: ''
	});
	const [initialFormData, setInitialFormData] = useState({
		name: '',
		email: ''
	});
	const [error, setError] = useState(null);

	useEffect(() => {
		const checkAuth = async () => {
		try {
			if (!isAuthenticated()) {
			router.push('/login');
			return;
			}

			const currentUser = getCurrentUser();
			setUser(currentUser);

			await fetchProfileData(currentUser.id);
		} catch (err) {
			setError('Failed to authenticate or load profile');
			setLoading(false);
		}
		};

		checkAuth();
	}, [router]);

	const fetchProfileData = async (userId) => {
		try {
		setLoading(true);
		const response = await fetch(`/api/db/users/${userId}?fields=name,email,createdAt,updatedAt,age,stats`, {
			headers: {
			'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch profile data: ${response.status}`);
		}

		const profileData = await response.json();
		setProfile(profileData.data || profileData);

		const newFormData = {
			name: profileData.data?.name || profileData.name || '',
			email: profileData.data?.email || profileData.email || '',
			bio: profileData.data?.bio || profileData.bio || '',
		};

		setFormData(newFormData);
		setInitialFormData(newFormData); // Save initial values for comparison
		} catch (error) {
		console.error('Error fetching profile data:', error);
		setError('Failed to load profile data');
		} finally {
		setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
		const response = await fetch(`/api/db/users/${user.id}`, {
			method: 'PATCH',
			headers: {
			'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData)
		});

		if (!response.ok) {
			throw new Error(`Failed to update profile: ${response.status}`);
		}

		const result = await response.json();
		setProfile(result.data || result);
		setEditing(false);

		console.log('Profile updated successfully');
		} catch (error) {
		console.error('Error updating profile:', error);
		}
	};

	const handleCancelEdit = () => {
		setFormData({ ...initialFormData });
		setEditing(false);
	};

	if (loading) {
		return (
		<div className="min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#4B3F72] flex justify-center items-center">
			<div className="text-center">
			<div className="w-16 h-16 border-4 border-[#FFC857] border-t-transparent rounded-full animate-spin mx-auto"></div>
			<p className="text-white mt-4 text-xl">Loading your profile...</p>
			</div>
		</div>
		);
	}

	if (error) {
		return (
		<div className="min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#4B3F72] flex justify-center items-center">
			<div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
			<h2 className="text-2xl font-bold text-[#1F2041] mb-4">Something went wrong</h2>
			<p className="text-gray-700 mb-6">{error}</p>
			<div className="flex justify-between">
				<button
				onClick={() => router.push('/')}
				className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
				>
				Go Home
				</button>
				<button
				onClick={() => fetchProfileData(user.id)}
				className="px-4 py-2 bg-[#1F2041] text-white rounded-lg"
				>
				Try Again
				</button>
			</div>
			</div>
		</div>
		);
	}

	return (
		<div className="font-['Geist_Mono'] min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#4B3F72]">
		<TopBar name={user?.name} />
		<BubblesBackground />
		<div className="container mx-auto px-4 py-12">
			<div className="max-w-4xl mx-auto">
			<h1 className="text-4xl text-[#FFC857] md:text-5xl font-bold mb-8 text-center drop-shadow-md">
				Your Profile
			</h1>

			<div className="transition-all duration-300 text-[#1F2041]">
				{editing ? (
				<div className="bg-white shadow-xl rounded-lg overflow-hidden mb-10 p-6">
					<h2 className="text-2xl font-bold text-[#1F2041] mb-6">
					Edit Your Profile
					</h2>
					<ProfileForm
					formData={formData}
					setFormData={setFormData}
					onSubmit={handleSubmit}
					onCancel={handleCancelEdit}
					/>
				</div>
				) : (
				<ProfileCard
					profile={profile}
					user={user}
					onEdit={() => setEditing(true)}
				/>
				)}
			</div>

				<div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-10">
					<button
					onClick={() => router.push("/session-history")}
					className="cursor-pointer bg-[#1F2041] hover:bg-[#373763] text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#8E24AA]/50 transition duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 shadow-lg"
					>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
						fillRule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
						clipRule="evenodd"
						/>
					</svg>
					View Session History
					</button>
				</div>
			</div>
		</div>

		<footer className="bg-[#1F2041] text-white p-6 mt-12 relative z-10">
			<div className="max-w-7xl mx-auto text-center">
				<p className="text-sm tracking-wider">
					AlethioSphere - Your AI companion for personal journaling
				</p>
				<button>
					<a
					href="/disclaimer"
					className="text-gray-300 hover:text-[#FFC857] transition-colors mx-2 text-sm tracking-wider"
					>
					Disclaimer
					</a>
				</button>
			</div>
		</footer>
		</div>
	);
}
