'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BubblesBackground from './components/layout/Bubbles';

export default function Landing() {
		const router = useRouter();
		const [isOpen, setIsOpen] = useState(false);
		const [scrolled, setScrolled] = useState(false);

		useEffect(() => {
				const handleScroll = () => {
						if (window.scrollY > 50) {
								setScrolled(true);
						} else {
								setScrolled(false);
						}
				};
				window.addEventListener('scroll', handleScroll);
				return () => window.removeEventListener('scroll', handleScroll);
		}, []);

		const handleGetStarted = () => {
				router.push('/login');
		}
		const handleTryItOut = () => {
				router.push('/chat?user=guest'); 
		}

	return (
		<div className="font-['Geist_Mono']">
			<nav
				className={`${
					scrolled ? "bg-[#8E24AA]/90 backdrop-blur-md" : "bg-[#7d1899]"
				} transition-all duration-300 shadow-md fixed w-full z-50`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex-shrink-0 flex items-center">
							<span className="text-[#1F2041] text-xl font-bold">
								AlethioSphere
							</span>
						</div>

						<div className="md:hidden">
							<button
								onClick={() => setIsOpen(!isOpen)}
								className="text-[#1F2041] hover:text-[#FFC857] focus:outline-none"
							>
								<svg
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									{isOpen ? (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									) : (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 12h16M4 18h16"
										/>
									)}
								</svg>
							</button>
						</div>

						<div className="hidden md:block">
							<div className="ml-10 flex items-baseline space-x-4">
								<a
									href="#features"
									className="text-[#1F2041] hover:bg-[#ffcf57] hover:text-white px-3 py-2 rounded-md font-medium transition-all duration-200"
								>
									Features
								</a>
								<a
									href="#faq"
									className="text-[#1F2041] hover:bg-[#ffcf57] hover:text-white px-3 py-2 rounded-md font-medium transition-all duration-200"
								>
									FAQ
								</a>
								<button
									onClick={handleGetStarted}
									className="cursor-pointer bg-[#1F2041] text-white hover:bg-[#4B3F72] px-3 py-2 rounded-md font-medium transition-all duration-200"
								>
									Login
								</button>
							</div>
						</div>
					</div>
				</div>

				{isOpen && (
					<div className="md:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#8E24AA] shadow-inner">
							<a
								href="#features"
								className="text-[#1F2041] hover:bg-[#ffcf57] hover:text-white block px-3 py-2 rounded-md font-medium"
								onClick={() => setIsOpen(false)}
							>
								Features
							</a>
							<a
								href="#faq"
								className="text-[#1F2041] hover:bg-[#ffcf57] hover:text-white block px-3 py-2 rounded-md font-medium"
								onClick={() => setIsOpen(false)}
							>
								FAQ
							</a>
							<button
								className="w-full text-left bg-[#1F2041] text-white hover:bg-[#4B3F72] px-3 py-2 rounded-md font-medium"
								onClick={() => {
									setIsOpen(false);
									handleGetStarted();
								}}
							>
								Login
							</button>
						</div>
					</div>
				)}
			</nav>

			<div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#4B3F72] p-6 pt-20 relative overflow-hidden">
				<BubblesBackground />

				<div className="md:w-1/2 text-center md:text-left mb-6 md:mb-0 p-6 z-10">
					<div className="space-y-2 mb-4">
						<p className="inline-block bg-[#ED647E]/20 text-[#1F2041] px-3 py-1 rounded-full font-medium text-sm">
							Made for students, by students
						</p>
					</div>
					<h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-[#1F2041] mb-4 md:mb-6 tracking-tight">
						Welcome to <span className="text-[#FFC857]">AlethioSphere!</span>
					</h1>
					<p className="text-xl md:text-2xl text-[#1F2041] mb-6 md:mb-10">
						Your AI companion for personal journaling and mental clarity!
					</p>
					<div className="flex flex-col md:flex-row gap-4">
						<button
							className="cursor-pointer bg-[#1F2041] text-white py-3 px-6 rounded-lg hover:bg-[#4B3F72] transition-all duration-300 shadow-lg flex items-center justify-center"
							onClick={handleGetStarted}
						>
							Get Started
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 ml-2"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
						<button
							className="cursor-pointer bg-transparent border-2 border-[#1F2041] text-[#1F2041] py-3 px-6 rounded-lg hover:bg-[#1F2041] hover:text-white transition-all duration-300"
							onClick={handleTryItOut}
						>
							Try it out
						</button>
					</div>

					<div className="mt-8 flex flex-col sm:flex-row items-center">
						<div className="flex -space-x-2 mr-4">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className={`w-8 h-8 rounded-full bg-[#FFC857] border-2 border-white flex items-center justify-center text-xs text-[#1F2041] font-bold`}
								>
									{String.fromCharCode(64 + i)}
								</div>
							))}
						</div>
						<p className="text-sm mt-2 sm:mt-0">
							<span className="font-bold">500+</span> students already
							journaling
						</p>
					</div>
				</div>

				<div className="md:w-2/3 flex justify-center items-center z-10">
					<div className="relative bg-[#1F2041] p-2 rounded-lg shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-300 group">
						<Image
							src="/images/landing_page_avatar.jpg"
							alt="AI Avatar"
							width={400}
							height={500}
							className="rounded-lg group-hover:scale-105 transition-all duration-300"
							style={{ objectFit: "cover" }}
						/>
						<div className="absolute -bottom-4 -right-4 bg-[#FFC857] text-[#1F2041] py-2 px-4 rounded-lg shadow-md text-sm font-bold group-hover:scale-110 transition-all duration-300">
							Your Journaling Companion
						</div>

						<div className="absolute -top-5 -left-7 bg-white p-3 rounded-lg shadow-md max-w-[180px] transform -rotate-6 opacity-0 group-hover:opacity-100 transition-all duration-500">
							<p className="text-[#1F2041] text-sm">
								Hey! Do you want to talk about your day?
							</p>
							<div className="absolute -bottom-2 left-5 w-4 h-4 bg-white transform rotate-45"></div>
						</div>
					</div>
				</div>
			</div>

			<div
				id="features"
				className="min-h-screen bg-gradient-to-b from-[#4B3F72] to-[#1F2041] text-white p-8 md:p-16 flex flex-col justify-baseline"
			>
				<h2 className="text-[#FFC857] text-4xl md:text-6xl font-bold mb-4 text-center md:text-left">
					Talk To Alethia - Your Virtual Companion
				</h2>
				<p className="text-lg text-[#f0dbaf]/80 mb-10 max-w-3xl">
					Perfect for busy college schedules and late-night thoughts when
					everyone else is asleep
				</p>

				<div className="grid md:grid-cols-2 gap-10 mt-10">
					<div>
						<p className="text-xl md:text-2xl mb-8 leading-relaxed">
							Ever felt like you wanted someone to dump your emotions? Meet
							Alethia, a virtual companion who will accompany you in your
							journaling habits. Whether it be seeking emotional clarity with
							regards to anxiety, stress and mental health, or just a simple
							conversation to take your mind off things on a normal way,
							Alethia can help you.
						</p>
						<button
							onClick={handleTryItOut}
							className="cursor-pointer mt-4 bg-[#FFC857] text-[#1F2041] py-3 px-6 rounded-lg hover:bg-[#FFC857]/80 transition-all duration-300 font-bold shadow-lg"
						>
							Start Journaling Now
						</button>
					</div>
					<div className="bg-[#19657e5c] p-6 rounded-lg shadow-lg backdrop-blur-sm">
						<h3 className="text-2xl font-bold mb-4 text-[#FFC857]">
							Key Features
						</h3>
						<ul className="space-y-4">
							<li className="flex items-start">
								<span className="mr-2 text-[#FFC857] font-bold">•</span>
								<span>
									Personal AI companion that listens to your thoughts
								</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 text-[#FFC857] font-bold">•</span>
								<span>Safe space to express emotions and reflect</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 text-[#FFC857] font-bold">•</span>
								<span>Meaningful conversation to help process feelings</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 text-[#FFC857] font-bold">•</span>
								<span>Available anytime you need someone to talk to</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
					{[
						{ title: "Private & Secure", desc: "Your thoughts stay private" },
						{ title: "24/7 Available", desc: "Journal anytime, anywhere" },
						{ title: "Stress Relief", desc: "Reduce exam anxiety" },
						{ title: "Personal", desc: "No one to judge you" },
					].map((item, i) => (
						<div
							key={i}
							className="bg-[#19657e5c] p-6 rounded-lg backdrop-blur-sm hover:bg-[#19657e5c] transition-all duration-300"
						>
							<div className="text-4xl mb-3">{item.icon}</div>
							<h3 className="text-xl font-bold text-[#FFC857]">
								{item.title}
							</h3>
							<p className="text-sm text-[#f0dbaf]">{item.desc}</p>
						</div>
					))}
				</div>
			</div>
			<div id="faq" className="bg-gradient-to-b from-[#1F2041] to-[#7d1899] p-8 md:p-16">
				<h2 className="text-3xl md:text-4xl font-bold text-[#FFC857] mb-10 text-center">
					Frequently Asked Questions
				</h2>

				<div className="max-w-3xl mx-auto space-y-6">
					{[
						{
							q: "Is my journal data private?",
							a: "Absolutely. Your journal entries are encrypted and never shared with anyone. Your privacy is our top priority.",
						},
						{
							q: "Can I use AlethioSphere for free?",
							a: "Yes! All the features of this application are free to use.",
						},
						{
							q: "How is this different from just writing in a notes app?",
							a: "AlethioSphere responds to your thoughts with meaningful conversation, helping you process emotions and gain clarity.",
						},
						{
							q: "Will this replace therapy?",
							a: "No. While AlethioSphere can help with daily emotional processing, it's not a replacement for professional mental health services.",
						},
					].map((item, i) => (
						<div
							key={i}
							className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
						>
							<h3
								className="text-xl font-bold text-[#1F2041] mb-2 cursor-pointer flex justify-between items-center"
								onClick={() =>
									document
										.getElementById(`faq-${i}`)
										.classList.toggle("hidden")
								}
							>
								{item.q}
								<span className="text-[#8E24AA] transform transition-transform duration-300">
									&#x25BC;
								</span>
							</h3>
							<p id={`faq-${i}`} className="text-[#1F2041]/80 hidden">
								{item.a}
							</p>
						</div>
					))}
				</div>

				<div className="mt-16 text-center">
					<h3 className="text-2xl font-bold text-[#1F2041] mb-4">
						Ready to start journaling?
					</h3>
					<button
						onClick={handleTryItOut}
						className="cursor-pointer bg-[#1F2041] text-white py-3 px-6 rounded-lg hover:bg-[#16162b] transition-all duration-300 font-bold shadow-lg"
					>
						Try It for Free
					</button>
				</div>
			</div>

			<footer className="bg-gradient-to-b from-[#7d1899] to-[#1F2041] text-white p-10">
				<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
					<div className="md:col-span-2">
						<div className="flex items-center mb-4">
							<h3 className="text-[#FFC857] text-2xl font-bold">
								AlethioSphere
							</h3>
						</div>
						<p className="text-gray-300 mb-4">
							Your AI companion for personal journaling and emotional
							wellbeing.
						</p>
					</div>
					<div>
						<h3 className="text-[#FFC857] text-xl font-bold mb-4">
							Resources
						</h3>
						<ul className="space-y-2">
							<li>
								<a
									href="#"
									className="text-gray-300 hover:text-white transition-colors"
								>
									Blog
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-gray-300 hover:text-white transition-colors"
								>
									Help Center
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-gray-300 hover:text-white transition-colors"
								>
									Student Discount
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-gray-300 hover:text-white transition-colors"
								>
									Mental Health Resources
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-[#FFC857] text-xl font-bold mb-4">Connect</h3>
						<ul className="space-y-2">
							<li>
								<a
									href="#"
									className="text-gray-300 hover:text-white transition-colors"
								>
									Email Us
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-gray-300 hover:text-white transition-colors"
								>
									Support
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-gray-300 hover:text-white transition-colors"
								>
									About Us
								</a>
							</li>
							<li>
								<div className="flex space-x-4 mt-4">
									<a
										href="#"
										className="text-gray-300 hover:text-white transition-colors"
									>
										<svg
											className="w-6 h-6"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
										</svg>
									</a>
									<a
										href="#"
										className="text-gray-300 hover:text-white transition-colors"
									>
										<svg
											className="w-6 h-6"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
										</svg>
									</a>
									<a
										href="#"
										className="text-gray-300 hover:text-white transition-colors"
									>
										<svg
											className="w-6 h-6"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"></path>
										</svg>
									</a>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</footer>
		</div>
	);
}
