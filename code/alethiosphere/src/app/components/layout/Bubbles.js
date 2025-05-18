import React from 'react';

const BubblesBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-[#19647E]/20 animate-pulse"></div>
        
        <div
            className="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-[#FFC857]/20 animate-pulse"
            style={{ animationDelay: "1s" }}
        ></div>
        <div
            className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-[#1F2041]/10 animate-pulse"
            style={{ animationDelay: "2s" }}
        ></div>
        <div
            className="absolute top-1/6 right-1/2 w-32 h-32 rounded-full bg-[#FFC857]/20 animate-pulse"
            style={{ animationDelay: "1s" }}
        ></div>
        <div
            className="absolute top-2/3 right-1/2 w-16 h-16 rounded-full bg-[#1F2041]/10 animate-pulse"
            style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-[#4B3F72]/30 animate-bounce"></div>
        <div
            className="absolute bottom-10 left-20 w-28 h-28 rounded-full bg-[#FFC857]/30 animate-bounce"
            style={{ animationDelay: "1.5s" }}
        ></div>
        <div
            className="absolute top-1/4 left-1/3 w-12 h-12 rounded-full bg-[#8E24AA]/40 animate-pulse"
            style={{ animationDelay: "2.5s" }}
        ></div>
        <div
            className="absolute bottom-1/3 right-1/5 w-14 h-14 rounded-full bg-[#19647E]/30 animate-bounce"
            style={{ animationDelay: "3s" }}
        ></div>
    </div>
    );
};

export default BubblesBackground;