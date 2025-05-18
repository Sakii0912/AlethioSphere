// useTranscript.js
import { useState, useEffect } from "react";
import { createTranscriptSession, addMessageToTranscript } from "@/app/utils/transcript-manager";
import { apiCall } from "@/app/utils/client-jwt";

export default function useTranscript({ userId, isGuestMode }) {
	const [transcript, setTranscript] = useState([]);
	const [transcriptId, setTranscriptId] = useState(null);

	useEffect(() => {
		if (isGuestMode)
			return;

		const initializeTranscript = async () => {
			try {
				const newTranscriptId = await createTranscriptSession(userId);
				setTranscriptId(newTranscriptId);
				console.log("Created new transcript session with ID:", newTranscriptId);
			} catch (error) {
				console.error("Failed to create transcript session:", error);
			}
		};

		if (userId) {
			initializeTranscript();
		}
	}, [userId, isGuestMode]);

	const generateResponse = async (userMessage) => {
		try {
			const res = await apiCall("/api/generate_response", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					conversation: transcript,
					userMessage,
					isGuest: isGuestMode
				}),
			}, isGuestMode);

			return res.response;
		} catch (error) {
			console.error(error);
			return "I'm reflecting on what you shared—could you elaborate?";
		}
	};

	const addUserMessageAndGenerateResponse = async (userText, onAiResponseGenerated) => {
		const userMessage = { text: userText, sender: "user" };

		setTranscript(prev => [...prev, userMessage]);

		if (transcriptId && !isGuestMode) {
			try {
				await addMessageToTranscript(transcriptId, userMessage);
			} catch (error) {
				console.error("Failed to save user message to transcript:", error);
			}
		}

		const aiResponse = await generateResponse(userText);
		if (onAiResponseGenerated) {
			await onAiResponseGenerated(aiResponse);
		}

		const aiMessage = { text: aiResponse, sender: "ai" };

		setTranscript(prev => [...prev, aiMessage]);

		if (transcriptId && !isGuestMode) {
			try {
				await addMessageToTranscript(transcriptId, aiMessage);
			} catch (error) {
				console.error("Failed to save AI message to transcript:", error);
			}
		}
	};

	return {
		transcript,
		transcriptId,
		addUserMessageAndGenerateResponse
	};
}