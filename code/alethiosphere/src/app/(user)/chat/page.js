"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, isAuthenticated } from "@/app/utils/client-jwt";
import { TopBar } from "@/app/components/layout/TopBar";
import AvatarAnimation from "@/app/components/AvatarAnimation";
import BubblesBackground from "@/app/components/layout/Bubbles";

import useSpeechRecognition from "@/app/hooks/useSpeechRecognition";
import useTranscript from "@/app/hooks/useTranscript";
import useAvatarSpeech from "@/app/hooks/useAvatarSpeech";
import useVideoGestures from "@/app/hooks/useVideoGestures";

export default function ChatPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const isGuestMode = searchParams.get('user') === 'guest';

	const videoRef = useRef(null);
	const transcriptContainerRef = useRef(null);

	// current states
	const [isMuted, setIsMuted] = useState(false);
	const [currentSentence, setCurrentSentence] = useState("");
	const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState("en");

	// initialize custom hooks
	const { animationKey, filesCleared, generateSpeech } = useAvatarSpeech();

	const { transcript, transcriptId, addUserMessageAndGenerateResponse } = useTranscript({
		userId: getCurrentUser()?.id,
		isGuestMode
	});

	// hook forwards gesture messages to handleGestureMessage
	const { isVideoOn, toggleVideo } = useVideoGestures({
		videoRef,
		onGestureMessage: handleGestureMessage
	});

	const { toggleRecognition } = useSpeechRecognition({
		language: selectedLanguage,
		transcriptId,
		onSpeechRecognized: handleSpeechRecognized,
		muted: isMuted
	});

	// check authentication
	useEffect(() => {
		// allow access for guests or auth
		// Allow access if in guest mode or if authenticated
		console.log("Guest mode:", isGuestMode);
		if (!isGuestMode && !isAuthenticated()) {
			router.push('/login?auth_required=true');
		}
	}, [router, isGuestMode]);

	// auto scroll transcript
	useEffect(() => {
		if (transcriptContainerRef.current) {
			transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
		}
	}, [transcript]);

	// speech recognition results handler
	async function handleSpeechRecognized(recognizedText) {
		await addUserMessageAndGenerateResponse(recognizedText, generateSpeech);
	}

	// gesture recognition messages handler also now adds it to transcipt
	async function handleGestureMessage(gestureText) {
		await addUserMessageAndGenerateResponse(gestureText, generateSpeech);
	}

	// toggle microphone mute
	const toggleMute = () => {
		const newMutedState = toggleRecognition();
		setIsMuted(newMutedState);
	};

	// handle text input changes
	const handleInputChange = (e) => {
		setCurrentSentence(e.target.value);
	};

	// handle text input submission
	const handleInputKeyPress = async (e) => {
		if (e.key === "Enter" && currentSentence.trim() !== "") {
			const userText = currentSentence.trim();
			setCurrentSentence("");

			await addUserMessageAndGenerateResponse(userText, generateSpeech);
		}
	};

	// lang selector
	const LanguageSelector = () => {
		const languages = [
			{ code: "en", name: "English" },
			{ code: "fr", name: "Français" },
			{ code: "de", name: "Deutsch" }
		];

		return (
			<div className="relative">
				<select
					value={selectedLanguage}
					onChange={(e) => setSelectedLanguage(e.target.value)}
					className="appearance-none bg-[#4B3F72] text-white px-3 py-1.5 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC857] cursor-pointer"
				>
					{languages.map((lang) => (
						<option key={lang.code} value={lang.code}>
							{lang.name}
						</option>
					))}
				</select>
				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#1F2041] font-['Geist_Mono'] relative overflow-hidden">
			{filesCleared ? (
				<>
					{!isGuestMode && <TopBar />}
					{/* Guest Mode Banner - show when in guest mode */}
					{isGuestMode && (
						<div className="bg-[#FFC857] text-[#1F2041] py-2 px-4 text-center font-bold">
							<p>
								You are using Alethia in guest mode.
								<a href="/register" className="underline ml-2 hover:text-[#4B3F72]">
									Sign up for a full account
								</a>
								{" "}or,
								<a href="/login" className="underline ml-2 hover:text-[#4B3F72]">
									login to an existing account
								</a>
							</p>
						</div>
					)}
					{/* Background Bubbles */}
					<BubblesBackground />
					{/* Main Chat Interface */}
					<div className="container mx-auto px-4 py-4 mt-4 relative z-10">
						<div className="flex flex-col md:flex-row gap-6">
							<div
								className={`${
									isTranscriptVisible ? "md:w-1/2" : "md:w-full"
								} sm:w-full transition-all duration-300`}
							>
								<div className="bg-[#4B3F72] rounded-lg shadow-xl overflow-hidden mb-6">
									<div className="p-5 bg-[#1F2041] text-white flex justify-between items-center">
										<div>
											<h2 className="text-2xl font-bold">Alethia</h2>
											<p className="text-sm opacity-80">
												Your personal journaling companion
											</p>
										</div>
										<div className="flex items-center space-x-3">
											<LanguageSelector/>
											<button
												onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
												className="cursor-pointer px-3 py-1.5 bg-[#FFC857] hover:bg-[#E6B54D] rounded-md text-[#1F2041] text-sm transition-all duration-300"
											>
												{isTranscriptVisible ? "Hide Transcript" : "Show Transcript"}
											</button>
										</div>
									</div>

									{/* Main Video Container */}
									<div
										id="avatar"
										className={`relative flex items-center justify-center ${
											isTranscriptVisible ? "aspect-video" : "aspect-video"
										} w-full max-h-[500px]`}
									>
										{
											<AvatarAnimation
												key={animationKey}
												width="500"
												height="500"
												id={animationKey}
											/>
										}

										{/* User Video Feed with Controls */}
										<div className="absolute bottom-4 right-4">
											<div
												className="w-32 h-32 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-white relative">
												{isVideoOn ? (
													<video
														ref={videoRef}
														className="w-full h-full object-cover transform scale-x-[-1]"
														autoPlay
														muted // Always mute the video element
														playsInline // Add playsInline for better mobile support
													/>
												) : (
													<div
														className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-12 w-12 opacity-60"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
															/>
														</svg>
													</div>
												)}

												{/* Video Controls Overlay */}
												<div
													className="absolute bottom-0 left-0 right-0 flex justify-center space-x-1 p-1 bg-black/50">
													{/* Microphone Toggle Button */}
													<button
														onClick={toggleMute}
														className={`cursor-pointer p-1 rounded-full ${
															isMuted ? "bg-red-500" : "bg-green-500"
														} hover:opacity-80 transition-opacity`}
														title={
															isMuted ? "Unmute microphone" : "Mute microphone"
														}
													>
														{isMuted ? (
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4 text-white"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
																/>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M3 3l18 18"
																/>
															</svg>
														) : (
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4 text-white"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
																/>
															</svg>
														)}
													</button>

													{/* Camera Toggle Button */}
													<button
														onClick={toggleVideo}
														className={`cursor-pointer p-1 rounded-full ${
															isVideoOn ? "bg-green-500" : "bg-red-500"
														} hover:opacity-80 transition-opacity`}
														title={isVideoOn ? "Turn off camera" : "Turn on camera"}
													>
														{isVideoOn ? (
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4 text-white"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
																/>
															</svg>
														) : (
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4 text-white"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
																/>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M3 3l18 18"
																/>
															</svg>
														)}
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Right Section - Transcript & Input */}
							{isTranscriptVisible && (
								<div className="md:w-1/2 sm:w-full transition-all duration-300">
									<div
										className="bg-white rounded-lg shadow-xl overflow-hidden h-[calc(100vh-12rem)] flex flex-col justify-between">
										<div className="p-4 bg-[#1F2041] text-white">
											<h2 className="text-xl font-bold">Conversation Transcript</h2>
											{transcriptId && (
												<p className="text-xs opacity-70">
													Session ID: {transcriptId}
												</p>
											)}
										</div>

										{/* Transcript Area - add ref here */}
										<div
											ref={transcriptContainerRef}
											className="h-[calc(100%-8rem)] overflow-y-scroll p-4"
										>
											{transcript.length === 0 ? (
												<div className="flex flex-col items-center justify-center h-auto text-gray-400 text-center">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-12 w-12 mb-3"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
														/>
													</svg>
													<p>Your conversation will appear here.</p>
													<p className="text-sm mt-2">
														Start by typing a message below.
													</p>
												</div>
											) : (
												<div className="space-y-4">
													{transcript.map((message, index) => (
														<div
															key={index}
															className={`flex ${
																message.sender === "user"
																	? "justify-end"
																	: "justify-start"
															}`}
														>
															<div
																className={`max-w-3/4 p-4 rounded-lg shadow-md text-sm font-medium leading-relaxed ${
																	message.sender === "user"
																		? "bg-[#FFC857] text-[#1F2041] rounded-tr-none"
																		: "bg-[#1F2041] text-white rounded-tl-none"
																}`}
															>
																{message.text}
															</div>
														</div>
													))}
												</div>
											)}
										</div>
										{/* Input Area */}
										<div className="p-4 border-t">
											<div className="flex">
												<input
													type="text"
													value={currentSentence}
													onChange={handleInputChange}
													onKeyUp={handleInputKeyPress}
													className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC857] text-[#1F2041]"
													placeholder="Type your message..."
												/>
											</div>
											<p className="mt-2 text-xs text-gray-500 text-center">
												Press Enter to send
											</p>
										</div>
									</div>
								</div>
							)}
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
				</>
			) : (
				<div className="flex items-center justify-center h-screen">
					<div className="text-white text-center">
						<div className="w-16 h-16 border-t-4 border-b-4 border-[#FFC857] rounded-full animate-spin mx-auto mb-4"></div>
						<p className="text-xl font-medium">Loading Alethia...</p>
					</div>
				</div>
			)}
		</div>
	);
}
