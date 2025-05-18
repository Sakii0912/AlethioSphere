'use client';

import BubblesBackground from '@/app/components/layout/Bubbles';
import { TopBar } from "@/app/components/layout/TopBar";
import { apiCall, getCurrentUser, isAuthenticated } from '@/app/utils/client-jwt';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SessionDetails() {
	const router = useRouter();
	const { id } = useParams();
	const [user, setUser] = useState(null);
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!isAuthenticated()) {
			router.push('/login');
			return;
		}

		const currentUser = getCurrentUser();
		setUser(currentUser);
	}, [router]);

	useEffect(() => {
		const fetchSessionDetails = async () => {
			setLoading(true);
			try {
				const data = await apiCall(`/api/db/transcripts/${id}`, { method: 'GET' });
				setSession(data.data);
				console.log(data.data);
			} catch (err) {
				console.error('Error fetching session details:', err);
				setError(err.message || 'Failed to fetch session details');
			} finally {
				setLoading(false);
			}
		};

		if (user) {
			fetchSessionDetails();
		}
	}, [user, id]);

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString('en-UK', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		});
	};

	const formatDownloadDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString('en-UK', {
			month: '2-digit',
			day: '2-digit',
			year: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}).replace(/,/g, '').replace(/\//g, '-');
	}

	const getDuration = (startTime, endTime) => {
		const start = new Date(startTime);
		const end = new Date(endTime);
		const duration = Math.abs(end - start);
		const minutes = Math.floor((duration % 3600000) / 60000);
		const seconds = Math.floor((duration % 60000) / 1000);
		return `${minutes}m ${seconds}s`;
	}

	const handleDownloadTranscript = () => {
		if (!session || !session.messages) {
			alert('Transcript is not available for this session.');
			return;
		}

		try {
			const confirmDownload = window.confirm('Do you want to download this transcript?');
			if (!confirmDownload) {
				return; 
			}
			
			const formattedMessages = session.messages.map((entry) => {
				const sender = entry.sender === 'ai' ? 'Alethia' : 'You';
				return `${sender}: ${entry.text}`;
			}).join('\n');
			const blob = new Blob([formattedMessages], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `session-transcript-${formatDownloadDate(session.startTime)}.txt`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error('Error downloading transcript:', err);
			alert('An error occurred while downloading the transcript. Please try again.');
		}
	};

	if (!user) {
		return (
			<div className="min-h-screen bg-[#8E24AA] flex justify-center items-center">
				<div className="animate-pulse text-[#FFC857] text-xl">Loading...</div>
			</div>
		);
	}

	const handleDeleteSession = async (sessionId) => {
		const confirmDelete = window.confirm('Are you sure you want to delete this session? This action cannot be undone.');
		if (!confirmDelete) {
			return; 
		}

		try {
			setLoading(true);
			await apiCall(`/api/db/transcripts/${sessionId}`, { method: 'DELETE' });
			alert('Session deleted successfully.');
			router.push('/session-history');
		} catch (err) {
			console.error('Error deleting session:', err);
			alert('Failed to delete session. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="font-['Geist_Mono'] min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#1F2041] relative overflow-hidden">
			<BubblesBackground />

			<TopBar name={user.name} />

			<div className="container mx-auto px-4 py-12 relative z-10">
				<div className="text-center mb-12">
					<h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
						<span className="text-[#FFC857]">Session</span>{' '}
						<span className="text-[#1F2041]">Details</span>
					</h1>
					<p className="text-2xl md:text-4xl text-[#1F2041]/90 mt-4 tracking-normal">
						Explore the details of your journal session
					</p>
				</div>

				{loading ? (
					<div className="text-center text-[#FFC857] text-xl animate-pulse">Loading session details...</div>
				) : error ? (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
						<p className="font-bold">Error loading session</p>
						<p>{error}</p>
						{error.includes('Authentication') && (
							<button
								onClick={() => router.push('/login')}
								className="mt-2 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
							>
								Return to Login
							</button>
						)}
					</div>
				) : (
					<div className="bg-[#1F2041]/30 p-8 rounded-lg shadow-lg border-l-4 border-[#FFC857]">
						<p className="text-white/70 text-lg mb-4">
							<strong>Start Time:</strong> {formatDate(session.startTime)}
						</p>
						<p className="text-white/70 text-lg mb-4">
							<strong>Last Updated:</strong> {formatDate(session.lastUpdated)}
						</p>
						<p className="text-white/70 text-lg mb-4">
							<strong>Duration:</strong> {getDuration(session.startTime, session.lastUpdated)}
						</p>
						<div className="text-white/90 text-lg">
							<strong>Transcript:</strong>
							{Array.isArray(session.messages) ? (
								<ul className="mt-2 whitespace-pre-wrap">
									{session.messages.map((entry, index) => (
										<li key={index}><span className={"italic text-[#FFC857]"}>{(entry.sender === "ai") ? "Alethia" : "You"}</span>: {entry.text}</li>
									))}
								</ul>
							) : (
								<p className="mt-2 whitespace-pre-wrap">No transcript available.</p>
							)}
						</div>
						<div className="flex justify-between items-center mt-6">
							<div className="flex space-x-4">
								<button
									onClick={handleDownloadTranscript}
									className="bg-[#FFC857] hover:bg-[#E5A134] text-[#1F2041] font-bold py-2 px-4 rounded-lg transition duration-300"
								>
									Download Transcript
								</button>
								<button
									onClick={() => handleDeleteSession(session._id)}
									className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
								>
									Delete Session
								</button>
							</div>
							<button
								onClick={() => router.push('/session-history')}
								className="bg-[#1F2041] hover:bg-[#1F2041]/80 text-[#FFC857] font-bold py-2 px-4 rounded-lg transition duration-300"
							>
								Back to Session History
							</button>
						</div>
					</div>
				)}
			</div>
			<footer className="bg-[#1F2041] text-white p-6 mt-12 relative z-10">
				<div className="max-w-7xl mx-auto text-center">
					<p className="text-sm tracking-wider">AlethioSphere - Your AI companion for personal journaling</p>
					<a href="/disclaimer" className="text-gray-300 hover:text-[#FFC857] transition-colors mx-2 text-sm tracking-wider">Disclaimer</a>
				</div>
			</footer>
		</div>
	);
}
