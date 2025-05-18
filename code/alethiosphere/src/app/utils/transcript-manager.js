// transcript-management.js

import {apiCall} from "@/app/utils/client-jwt";

export async function createTranscriptSession(user_id, isGuest=false) {
	try {
		const response = await apiCall("/api/db/transcripts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: [],
				startTime: new Date().toISOString(),
				lastUpdated: new Date().toISOString(),
				user_id: user_id,
			}),
		}, isGuest);
		return response.data._id; // Return the ID of the created transcript
	} catch (error) {
		console.error("Error creating transcript session:", error);
		throw error;
	}
}

export async function updateTranscript(transcriptId, messages) {
	try {
		const response = await apiCall(`/api/db/transcripts/${transcriptId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages,
				lastUpdated: new Date().toISOString()
			}),
		});

		const data = await response.json();
		return data.data;
	} catch (error) {
		console.error("Error updating transcript:", error);
		throw error;
	}
}

export async function addMessageToTranscript(transcriptId, message) {
	try {
		const response = await apiCall(`/api/db/transcripts/${transcriptId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				$push: {
					"messages": message
				},
				$set: {
					"lastUpdated": new Date().toISOString()
				}
			}),
		});

		return response.data;
	} catch (error) {
		console.error("Error adding message to transcript:", error);
		throw error;
	}
}

export async function getTranscript(transcriptId) {
	try {
		const response = await apiCall(`/api/db/transcripts/${transcriptId}`, {
			method: "GET"
		});

		const data = await response.json();
		return data.data;
	} catch (error) {
		console.error("Error retrieving transcript:", error);
		throw error;
	}
}