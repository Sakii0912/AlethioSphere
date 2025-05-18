import { Geist, Geist_Mono } from "next/font/google";

import "@/app/globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = {
	title: "AlethioSphere",
	description: "",
};

export default function RootLayout({ children }) {
	return (
		<div>
			<div className="flex-1">{children}</div>
		</div>
	);
}
