'use client';

import BubblesBackground from '@/app/components/layout/Bubbles';
import { TopBar } from "@/app/components/layout/TopBar";
import { apiCall, getCurrentUser, isAuthenticated } from '@/app/utils/client-jwt';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function PreviousSessions() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalSessions, setTotalSessions] = useState(0);

	const [searchTerm, setSearchTerm] = useState('');
	const [dateRange, setDateRange] = useState({ start: '', end: '' });
	const [sortField, setSortField] = useState('startTime');
	const [sortDirection, setSortDirection] = useState('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const fetchSessions = useCallback(async () => {
		setLoading(true);
		try {
			const queryParams = new URLSearchParams();

			queryParams.append('limit', itemsPerPage.toString());
			queryParams.append('page', currentPage.toString());

			queryParams.append('sort', `${sortField}:${sortDirection}`);

			queryParams.append('user_id', user.id)

			if (searchTerm) {
				const sanitizedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				queryParams.append('title_regex', sanitizedSearch);
				queryParams.append('summary_regex', sanitizedSearch);
			}

			if (dateRange.start) {
				queryParams.append('startTime_gte', new Date(dateRange.start).toISOString());
			}
			if (dateRange.end) {
				const endDate = new Date(dateRange.end);
				endDate.setDate(endDate.getDate() + 1);
				queryParams.append('startTime_lt', endDate.toISOString());
			}

			queryParams.append('fields', '_id,startTime,lastUpdated');

			const data = await apiCall(`/api/db/transcripts?${queryParams.toString()}`, {
				method: 'GET'
			});

			const count = data.pagination.total;

			setSessions(data.data || []);
			setTotalSessions(count || 0);
		} catch (err) {
			console.error('Error fetching sessions:', err);
			setError(err.message || 'Failed to fetch sessions');
		} finally {
			setLoading(false);
		}
	}, [itemsPerPage, sortField, sortDirection, searchTerm, dateRange.start, dateRange.end, currentPage, user]);

	useEffect(() => {
		if (!isAuthenticated()) {
			router.push('/login');
			return;
		}

		const currentUser = getCurrentUser();
		setUser(currentUser);
		console.log(currentUser.id);
	}, [router]);

	useEffect(() => {
		if (user) {
			fetchSessions();
		}
	}, [user, fetchSessions]);

	const handleSearch = (e) => {
		e.preventDefault();
		setCurrentPage(1);
		fetchSessions();
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		});
	};

	const getTimeDifference = (startTime, endTime) => {
		const start = new Date(startTime);
		const end = new Date(endTime);
		const diffInSeconds = Math.floor((end - start) / 1000);
		const minutes = Math.floor(diffInSeconds / 60);
		const seconds = diffInSeconds % 60;
		return `${minutes} min ${seconds} sec`;
	}

	const handleClearFilters = () => {
		setSearchTerm('');
		setDateRange({ start: '', end: '' });
		setCurrentPage(1);
		fetchSessions();
	};

	const handleDeleteSession = async (sessionId) => {
		if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
			return;
		}
		try {
			setLoading(true);
			await apiCall(`/api/db/transcripts/${sessionId}`, { method: 'DELETE' });
			setSessions((prevSessions) => prevSessions.filter((session) => session._id !== sessionId));
			setTotalSessions((prevTotal) => prevTotal - 1);
			alert('Session deleted successfully.');
		} catch (err) {
			console.error('Error deleting session:', err);
			alert('Failed to delete session. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const totalPages = Math.max(1, Math.ceil(totalSessions / itemsPerPage));

	const renderPagination = () => {
		const pageNumbers = [];
		const maxPageButtons = 5;

		if (totalSessions === 0) {
			return null;
		}

		let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
		let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

		if (endPage - startPage + 1 < maxPageButtons) {
			startPage = Math.max(1, endPage - maxPageButtons + 1);
		}

		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i);
		}

		return (
			<div className="flex items-center space-x-2">
				<button
					onClick={() => setCurrentPage(1)}
					disabled={currentPage === 1 || loading}
					className={`w-10 h-10 flex items-center justify-center rounded-lg ${
						currentPage === 1 || loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#233855] text-white hover:bg-[#192A43]'
					} transition duration-300`}
					aria-label="First page"
				>
					«
				</button>
				<button
					onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1 || loading}
					className={`w-10 h-10 flex items-center justify-center rounded-lg ${
						currentPage === 1 || loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#233855] text-white hover:bg-[#192A43]'
					} transition duration-300`}
					aria-label="Previous page"
				>
					‹
				</button>

				{pageNumbers.map(number => (
					<button
						key={number}
						onClick={() => setCurrentPage(number)}
						disabled={loading}
						className={`w-10 h-10 flex items-center justify-center rounded-lg ${
							currentPage === number
								? 'bg-[#E5A134] text-[#453823] font-bold'
								: 'bg-[#233855] text-white hover:bg-[#192A43]'
						} transition duration-300`}
					>
						{number}
					</button>
				))}

				<button
					onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages || loading}
					className={`w-10 h-10 flex items-center justify-center rounded-lg ${
						currentPage === totalPages || loading
							? 'bg-gray-200 text-gray-500 cursor-not-allowed'
							: 'bg-[#233855] text-white hover:bg-[#192A43]'
					} transition duration-300`}
					aria-label="Next page"
				>
					›
				</button>
				<button
					onClick={() => setCurrentPage(totalPages)}
					disabled={currentPage === totalPages || loading}
					className={`w-10 h-10 flex items-center justify-center rounded-lg ${
						currentPage === totalPages || loading
							? 'bg-gray-200 text-gray-500 cursor-not-allowed'
							: 'bg-[#233855] text-white hover:bg-[#192A43]'
					} transition duration-300`}
					aria-label="Last page"
				>
					»
				</button>
			</div>
		);
	};

	const SessionSkeleton = () => (
		<div className="bg-[#A1EDE4]/40 rounded-lg shadow-lg animate-pulse overflow-hidden">
			<div className="md:hidden bg-[#233855]/70 h-12 w-full"></div>
			<div className="p-4 md:flex items-center">
				<div className="md:w-1/2 mb-3 md:mb-0">
					<div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
					<div className="h-4 bg-gray-300 rounded w-full"></div>
				</div>
				<div className="md:w-1/4 mb-3 md:mb-0">
					<div className="h-4 bg-gray-300 rounded w-2/3"></div>
				</div>
				<div className="md:w-1/4 flex justify-end md:justify-center">
					<div className="h-10 bg-gray-300 rounded w-20"></div>
				</div>
			</div>
		</div>
	);

	if (!user) {
		return (
			<div className="min-h-screen bg-[#8E24AA] flex justify-center items-center">
				<div className="animate-pulse text-[#FFC857] text-xl">Loading...</div>
			</div>
		);
	}

	return (
		<div className="font-['Geist_Mono'] min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#1F2041] relative overflow-hidden">

			<BubblesBackground />
			<TopBar name={user.name} />

			<div className="container mx-auto px-4 py-12 relative z-10">
				<div className="text-center mb-12">
					<h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
						<span className="text-[#FFC857]">Your Journal</span>{' '}
						<span className="text-[#1F2041]">Sessions</span>
					</h1>
					<p className="text-2xl md:text-4xl text-[#1F2041]/90 mt-4 tracking-normal">
						Review and revisit your previous conversations
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-12">
					<div className="bg-[#1F2041]/30 backdrop-blur-sm border-2 border-[#FFC857] p-6 rounded-lg shadow-lg text-center">
						<div className="text-4xl text-[#FFC857] font-bold">{totalSessions}</div>
						<div className="text-white/90">Total Sessions</div>
					</div>
					{/* <div className="bg-[#1F2041]/30 backdrop-blur-sm border-2 border-[#FFC857] p-6 rounded-lg shadow-lg text-center">
						<div className="text-4xl text-[#FFC857] font-bold">
							{sessions.reduce((total, session) => total + (Math.round(session.duration / 60) || 0), 0)}
						</div>
						<div className="text-white/90">Total Minutes</div>
					</div> */}
				</div>

				<div className="bg-[#1F2041]/30 backdrop-blur-sm border-2 border-[#FFC857] rounded-lg mb-12 shadow-lg overflow-hidden">
					<div
						className="bg-[#1F2041] text-[#FFC857] p-4 flex justify-between items-center cursor-pointer md:cursor-default"
						onClick={() => setIsFilterOpen(!isFilterOpen)}
					>
						<h2 className="font-bold text-lg tracking-wide">Search & Filters</h2>
						<button className="md:hidden">
							{isFilterOpen ? '▲' : '▼'}
						</button>
					</div>

					<div className={`p-6 ${isFilterOpen ? 'block' : 'hidden md:block'} transition-all duration-300`}>
						<form onSubmit={handleSearch} className="space-y-6">
							<div className="grid md:grid-cols-2 gap-6">
								<div className="grid grid-cols-2 gap-4 md:col-span-2">
									<div>
										<label htmlFor="startDate" className="block text-[#FFC857] font-medium mb-2">From Date</label>
										<input
											id="startDate"
											type="date"
											value={dateRange.start}
											onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
											className="w-full px-4 py-3 rounded-lg border border-[#4B3F72] bg-[#1F2041] text-[#FFC857] focus:outline-none focus:ring-2 focus:ring-[#FFC857]"
										/>
									</div>
									<div>
										<label htmlFor="endDate" className="block text-[#FFC857] font-medium mb-2">To Date</label>
										<input
											id="endDate"
											type="date"
											value={dateRange.end}
											onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
											className="w-full px-4 py-3 rounded-lg border border-[#4B3F72] bg-[#1F2041] text-[#FFC857] focus:outline-none focus:ring-2 focus:ring-[#FFC857]"
										/>
									</div>
								</div>
							</div>

							<div className="flex justify-between items-center flex-wrap gap-6">
								<div className="flex gap-4">
									<button
										type="submit"
										disabled={loading}
										className={`${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FFC857] hover:bg-[#E5A134]'} text-[#1F2041] font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#8E24AA] transition duration-300`}
									>
										{loading ? 'Searching...' : 'Search'}
									</button>
									<button
										type="button"
										onClick={handleClearFilters}
										disabled={loading}
										className={`${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#1F2041] hover:bg-[#1F2041]/80'} text-[#FFC857] font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#8E24AA] transition duration-300`}
									>
										Clear Filters
									</button>
								</div>

								<div className="flex items-center space-x-4">
									<div className="flex items-center space-x-2">
										<label htmlFor="sortBy" className="text-[#FFC857] font-medium">Sort by:</label>
										<select
											id="sortBy"
											value={sortField}
											onChange={(e) => {
												setSortField(e.target.value);
												setCurrentPage(1);
											}}
											disabled={loading}
											className={`px-4 py-3 rounded-lg border border-[#4B3F72] ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#1F2041]'} text-[#FFC857] focus:outline-none focus:ring-2 focus:ring-[#4B3F72]`}
										>
											<option value="startTime">Date</option>
											<option value="title">Title</option>
											<option value="duration">Duration</option>
										</select>
									</div>

									<div className="flex items-center space-x-2">
										<label htmlFor="sortDir" className="text-[#FFC857] font-medium">Order:</label>
										<select
											id="sortDir"
											value={sortDirection}
											onChange={(e) => setSortDirection(e.target.value)}
											disabled={loading}
											className={`px-4 py-3 rounded-lg border border-[#4B3F72] ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#1F2041]'} text-[#FFC857] focus:outline-none focus:ring-2 focus:ring-[#FFC857]`}
										>
											<option value="desc">Newest first</option>
											<option value="asc">Oldest first</option>
										</select>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>

				<div className="flex justify-between items-center mb-4 flex-wrap gap-4">
					<div className="text-[#FFC857] font-medium">
						{loading ? 'Loading...' :
							totalSessions > 0 ?
								`Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, totalSessions)} of ${totalSessions} sessions` :
								'No sessions found'
						}
					</div>

					<div className="flex items-center space-x-2">
						<label className="text-[#000000] font-medium">Show:</label>
						<select
							value={itemsPerPage}
							onChange={(e) => {
								setItemsPerPage(Number(e.target.value));
								setCurrentPage(1);
							}}
							disabled={loading}
							className={`px-3 py-2 text-[#000000] rounded-lg border border-[#25BEAC] focus:outline-none focus:ring-2 focus:ring-[#E5A134] ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-white'}`}
						>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={20}>20</option>
							<option value={50}>50</option>
						</select>
						<span className="text-[#000000]">per page</span>
					</div>
				</div>

				{loading ? (
					<div className="space-y-4">
						{[...Array(Math.min(itemsPerPage, 5))].map((_, i) => (
							<SessionSkeleton key={i} />
						))}
					</div>
				) : error ? (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
						<p className="font-bold">Error loading sessions</p>
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
				) : sessions.length === 0 ? (
					<div className="bg-[#1F2041]/30 p-8 rounded-lg text-center">
						<h3 className="text-2xl font-bold text-[#FFC857] mb-2">No journal sessions found</h3>
						<p className="text-white/90">Try adjusting your search filters or start a new conversation.</p>
					</div>
				) : (
					<div className="space-y-4">
						{sessions.map((session) => (
							<div key={session._id} className="bg-[#1F2041]/30 p-6 rounded-lg shadow-lg border-l-4 border-[#FFC857]">
								<div className="flex justify-between items-center">
									<div>
										<h3 className="text-xl font-bold text-[#FFC857]">{formatDate(session.startTime) || 'Untitled Session'}</h3>
										<p className="text-white/70 text-sm mt-1">
											{getTimeDifference(session.startTime, session.lastUpdated)}
										</p>
									</div>
									<div className="flex space-x-4">
										<Link
											href={`/sessions/${session._id}`}
											className="bg-[#FFC857] hover:bg-[#E5A134] text-[#1F2041] font-bold py-2 px-4 rounded-lg transition duration-300"
										>
											View
										</Link>
										<button
											onClick={() => handleDeleteSession(session._id)}
											className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						))}

						<div className="flex justify-between items-center mt-8 flex-wrap gap-4">
							<div className="text-[#FFC857]">
								{totalSessions > 0 && (
									<span>
                    					Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                  					</span>
								)}
							</div>
							{totalPages > 1 && renderPagination()}
						</div>
					</div>
				)}
			</div>
			<footer className="bg-[#1F2041] text-white p-6 mt-12 relative z-10">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-sm tracking-wider">AlethioSphere - Your AI companion for personal journaling</p>
                    <button>
                        <a href="/disclaimer" className="text-gray-300 hover:text-[#FFC857] transition-colors mx-2 text-sm tracking-wider">Disclaimer</a>
                    </button>
                </div>
            </footer>
		</div>
	);
}
