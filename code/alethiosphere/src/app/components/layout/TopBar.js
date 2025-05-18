'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { logout } from "@/app/utils/client-jwt";

export function TopBar({name, onLogout}) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Added for mobile menu toggle
  const [menuOpen, setMenuOpen] = useState(false); // Added for dropdown menu control
  const router = useRouter(); // Initialize router

  // Add scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout click
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {      
		localStorage.removeItem('authToken');
      	logout();
      	router.push('/');
    }
  };

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-container')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="font-['Geist_Mono']">
      <nav
        className={`${
          scrolled ? "bg-[#8E24AA]/90 backdrop-blur-md" : "bg-[#7d1899]"
        } transition-all duration-300 shadow-lg w-full z-50 fixed`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/home"
                className="text-[#FFC857] px-5 py-2 rounded-md transition-all duration-200 flex items-center font-extrabold text-2xl hover:bg-[#511362]/80 hover:shadow-md hover:-translate-y-0.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                AlethioSphere
              </Link>
              <div className="relative menu-container">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="cursor-pointer bg-[#1F2041] text-white px-4 py-2 rounded-md font-medium transition-all duration-200 hover:bg-[#4B3F72] hover:shadow-md hover:-translate-y-0.5"
                >
                  Where To Go?
                </button>
                {menuOpen && (
                  <div className="absolute bg-[#1F2041] text-white rounded-md shadow-lg mt-2 w-48">
                    <Link
                      href="/chat"
                      className="block px-4 py-2 hover:bg-[#4B3F72] transition-all duration-200 border border-[#4B3F72] rounded-md"
                      onClick={() => setMenuOpen(false)}
                    >
                      Talk To Alethia!
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-[#4B3F72] transition-all duration-200 border border-[#4B3F72] rounded-md"
                      onClick={() => setMenuOpen(false)}
                    >
                      View Your Profile
                    </Link>
                    <Link
                      href="/session-history"
                      className="block px-4 py-2 hover:bg-[#4B3F72] transition-all duration-200 border border-[#4B3F72] rounded-md"
                      onClick={() => setMenuOpen(false)}
                    >
                      View Your Sessions!
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer text-white hover:text-[#FFC857] focus:outline-none"
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

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-white">
                Hello, <span className="font-medium">{name || "there"}</span>!
              </span>
              <button
                onClick={handleLogout}
                className="cursor-pointer bg-[#FFC857] text-[#1F2041] px-4 py-2 rounded-md font-bold transition-all duration-200 hover:bg-[#FFC857]/80 hover:shadow-md hover:-translate-y-0.5 flex items-center"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-[#8E24AA] shadow-inner">
            <div className="px-4 py-3 space-y-2">
              <Link
                href="/chat"
                className="block text-white bg-[#1F2041] hover:bg-[#4B3F72] px-4 py-2 rounded-md font-medium transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Talk To Alethia!
              </Link>
              <Link
                href="/profile"
                className="block text-white bg-[#1F2041] hover:bg-[#4B3F72] px-4 py-2 rounded-md font-medium transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="cursor-pointer block w-full text-left bg-[#FFC857] text-[#1F2041] px-4 py-2 rounded-md font-bold transition-all duration-200 hover:bg-[#FFC857]/80"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* This div creates space below the fixed navbar */}
      <div className="h-16"></div>
    </div>
  );
}
