'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { isAuthenticated, getCurrentUser } from '@/app/utils/client-jwt';
import { TopBar } from "@/app/components/layout/TopBar"
import { useRouter } from 'next/navigation';
import BubblesBackground from '@/app/components/layout/Bubbles';

export default function HomepageContent() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [quote, setQuote] = useState("The journey of a thousand miles begins with a single step.");

    const quotes = [
        "The journey of a thousand miles begins with a single step.",
        "Write hard and clear about what hurts.",
        "In the journal I do not just express myself more openly than I could to any person; I create myself.",
        "Journal writing is a voyage to the interior.",
        "Keep a diary, and someday it'll keep you.",
    ];

    useEffect(() => {
        // check user auth
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        // get current user
        const currentUser = getCurrentUser();
        setUser(currentUser);

        // set random quote
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
    }, [router]);

    const handleStartConversation = () => {
        router.push('/chat');
    };

    const handleViewPreviousSessions = () => {
        router.push('/session-history');
    };

    if (!user) {
        return <div className="min-h-screen bg-[#8E24AA] flex justify-center items-center font-sans">
            <div className="animate-pulse text-[#1F2041] text-xl">Loading...</div>
        </div>;
    }

    return (
        <div className="font-['Geist_Mono'] min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#1F2041] relative overflow-hidden">
            <BubblesBackground/>
            <TopBar name={user.name}/>

            <div className="container mx-auto px-4 py-12 flex flex-col items-center relative z-10">
                {/* welcome section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                        <span className="text-[#1F2041]">Welcome Back,</span>{' '}
                        <span className="text-[#FFC857] tracking-tight">{user?.name?.split(' ')[0] || 'Friend'}!</span>
                    </h1>
                    <p className="text-2xl md:text-4xl text-[#1F2041]/90 mt-4 tracking-normal">
                        I'm here for anything you want to tell me!
                    </p>
                </div>

                {/* quote box */}
                <div className="bg-[#1F2041]/30 backdrop-blur-sm border-2 border-[#FFC857] p-8 rounded-lg mb-12 w-full max-w-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 relative">
                    <div className="absolute -top-4 -left-4 bg-[#FFC857] text-[#1F2041] py-1 px-3 rounded-lg shadow-md text-sm font-bold tracking-wider">
                        Today's Inspiration
                    </div>
                    <h2 className="text-2xl text-[#FFC857] text-center font-semibold mb-2 tracking-tight">
                        Quote of the Day
                    </h2>
                    <p className="text-white text-lg italic text-center tracking-wide">
                        "{quote}"
                    </p>
                </div>

                {/* buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-2xl">
                    <button
                        onClick={handleStartConversation}
                        className="bg-[#FFC857] hover:bg-[#E5A134] text-[#1F2041] font-bold py-4 px-8 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#8E24AA] transition duration-300 flex-1 transform hover:-translate-y-1 shadow-lg tracking-wider"
                    >
                        Start a new conversation
                    </button>
                    <button
                        onClick={handleViewPreviousSessions}
                        className="bg-[#1F2041] hover:bg-[#1F2041]/80 text-[#FFC857] font-bold py-4 px-8 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#8E24AA] transition duration-300 flex-1 transform hover:-translate-y-1 shadow-lg tracking-wider"
                    >
                        View Previous sessions
                    </button>
                </div>

                {/* good alethia pts */}
                <div className="mt-20 w-full max-w-4xl">
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#FFC857] tracking-tight">How Alethia Can Help You Today</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-[#1F2041]/30 backdrop-filter backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-[#FFC857]/30">
                            <h3 className="text-xl font-bold mb-3 text-[#FFC857] tracking-tight">Process Emotions</h3>
                            <p className="text-white/90 tracking-wide">Talk through complex feelings and gain emotional clarity with supportive conversation.</p>
                        </div>
                        <div className="bg-[#1F2041]/30 backdrop-filter backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-[#FFC857]/30">
                            <h3 className="text-xl font-bold mb-3 text-[#FFC857] tracking-tight">Daily Reflection</h3>
                            <p className="text-white/90 tracking-wide">Build a habit of daily journaling to promote mindfulness and personal growth.</p>
                        </div>
                        <div className="bg-[#1F2041]/30 backdrop-filter backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-[#FFC857]/30">
                            <h3 className="text-xl font-bold mb-3 text-[#FFC857] tracking-tight">Meaningful Conversation</h3>
                            <p className="text-white/90 tracking-wide">Engage in thoughtful dialog that helps you process your thoughts and experiences.</p>
                        </div>
                    </div>
                </div>
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
