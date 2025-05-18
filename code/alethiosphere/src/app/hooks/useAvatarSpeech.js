import { useState, useEffect } from "react";

export default function useAvatarSpeech() {
	const [animationKey, setAnimationKey] = useState(null);
	const [filesCleared, setFilesCleared] = useState(false);

	useEffect(() => {
		clearPreviousFiles();
	}, []);

	const clearPreviousFiles = async () => {
		// clears audio + lipsync 
		try {
			const response = await fetch("/api/clear_audio_files", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			if (response.ok) {
				console.log("Previous audio and lipsync files cleared successfully");
				setFilesCleared(true);
				return true;
			} else {
				console.error("Failed to clear previous audio and lipsync files");
				setFilesCleared(true); 
				return false;
			}
		} catch (error) {
			console.error("Error clearing audio files:", error);
			setFilesCleared(true); 
			return false;
		}
	};

	const generateSpeech = async (aiResponse) => {
		// returns promise of true or false depending on success of audio generation and lipsync generation
		try {
			console.log("Generating speech for response:", aiResponse.substring(0, 30) + "...");

			const audioResponse = await fetch("/api/generate_audio_file", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: aiResponse })
			});

			if (!audioResponse.ok) {
				throw new Error("Error while generating audio");
			}

			const lipsyncResponse = await fetch("/api/generate_lipsync_json", {
				method: "GET"
			});

			const lipsyncData = await lipsyncResponse.json();

			if (lipsyncData.success) {
				console.log("Speech generated successfully, triggering avatar animation");

				setAnimationKey(Date.now());

				return true;
			} else {
				console.error("Failed to generate lipsync:", lipsyncData.error || "Unknown error");
				return false;
			}
		} catch (error) {
			console.error("Speech error:", error);
			return false;
		}
	};

	return {
		animationKey,
		filesCleared,
		generateSpeech
	};
}