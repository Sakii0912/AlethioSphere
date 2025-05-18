"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/app/components/layout/TopBar";
import { isAuthenticated, getCurrentUser } from "@/app/utils/client-jwt";
import BubblesBackground from "@/app/components/layout/Bubbles";

export default function Disclaimer() {
	const router = useRouter();
	const [user, setUser] = useState(null);

	useEffect(() => {
		if (!isAuthenticated()) {
		router.push("/login");
		return;
		}
		const currentUser = getCurrentUser();
		setUser(currentUser);
	}, [router]);

  	return (
		<div className="font-['Geist_Mono'] min-h-screen bg-gradient-to-b from-[#8E24AA] to-[#1F2041] relative overflow-hidden">
		{/* Background Bubbles */}
		<BubblesBackground />
		<TopBar name={user?.name} />

		<main className="container mx-auto px-4 py-12 relative z-10">
			<div className="max-w-3xl mx-auto">
			<h1 className="text-5xl font-bold mb-12 text-center">
				<span className="text-[#FFC857]">Disclaimer</span>
			</h1>

			<section className="mb-8">
				<div className="bg-[#1F2041]/30 backdrop-blur-sm border-2 border-[#FFC857] p-8 rounded-lg shadow-xl">
				<h2 className="text-2xl font-bold mb-4 text-[#FFC857] tracking-tight">
					Understanding Our Service
				</h2>
				<ul className="space-y-4 text-white/90">
					<li className="flex items-start">
					<span className="text-[#FFC857] mr-2">•</span>
					<span>
						<strong>Not a medical service:</strong> This AI assistant
						provides general information and support but cannot diagnose
						conditions or recommend treatments.
					</span>
					</li>
					<li className="flex items-start">
					<span className="text-[#FFC857] mr-2">•</span>
					<span>
						<strong>Supplemental support only:</strong> Our service is
						designed to complement, not replace, professional mental
						healthcare.
					</span>
					</li>
					<li className="flex items-start">
					<span className="text-[#FFC857] mr-2">•</span>
					<span>
						<strong>Not for emergencies:</strong> In crisis situations,
						please use the emergency contacts provided below.
					</span>
					</li>
				</ul>
				</div>
			</section>

			<section className="mb-8">
				<div className="bg-[#1F2041]/30 backdrop-blur-sm border-2 border-[#FFC857] p-8 rounded-lg shadow-xl">
				<h2 className="text-2xl font-bold mb-4 text-[#FFC857] tracking-tight">
					Immediate Help Resources
				</h2>
				<p className="text-white/90 mb-6">
					If you or someone you know is in distress, please contact these
					professional services immediately:
				</p>
				<ul className="space-y-4 text-white/90">
					<li className="flex items-start">
					<span className="text-[#FFC857] mr-2">•</span>
					<span>
						<strong>National Suicide Prevention Helpline:</strong>{" "}
						9152987821 (24/7)
					</span>
					</li>
					<li className="flex items-start">
					<span className="text-[#FFC857] mr-2">•</span>
					<span>
						<strong>iCALL Psychosocial Helpline:</strong> 022-25521111
						(Mon-Sat, 8am-10pm)
					</span>
					</li>
					<li className="flex items-start">
					<span className="text-[#FFC857] mr-2">•</span>
					<span>
						<strong>Emergency Services:</strong> Dial 112 or visit your
						nearest hospital
					</span>
					</li>
				</ul>
				</div>
			</section>

			<section className="mb-12">
				<div className="bg-[#1F2041]/30 backdrop-blur-sm border-2 border-[#FFC857] p-8 rounded-lg shadow-xl">
				<h2 className="text-2xl font-bold mb-4 text-[#FFC857] tracking-tight">
					Your Privacy & Data Security
				</h2>
				<div className="space-y-4 text-white/90">
					<p>
					We prioritize your confidentiality with standard
					encryption and strict access controls. However, please note:
					</p>
					<ul className="space-y-3 pl-5">
					<li className="flex items-start">
						<span className="text-[#FFC857] mr-2">•</span>
						Conversations are processed by AI to improve our services
					</li>
					<li className="flex items-start">
						<span className="text-[#FFC857] mr-2">•</span>
						We don't share personal data with third parties without
						consent
					</li>
					<li className="flex items-start">
						<span className="text-[#FFC857] mr-2">•</span>
						You can request data deletion at any time through your
						account settings
					</li>
					</ul>
				</div>
				</div>
			</section>
			</div>
		</main>
		</div>
	);
}
