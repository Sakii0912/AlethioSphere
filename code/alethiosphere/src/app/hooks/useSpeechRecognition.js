import { useState, useEffect, useRef } from "react";
import { addMessageToTranscript } from "@/app/utils/transcript-manager";


export default function useSpeechRecognition({
	language = "en",
	transcriptId,
	onSpeechRecognized,
	muted = false
	}) 
	{
	// Speech recognition state
	const [recognitionInstance, setRecognitionInstance] = useState(null);
	const recognitionActiveRef = useRef(false);
	const isMutedRef = useRef(muted);

	// Update muted ref when prop changes
	useEffect(() => {
		isMutedRef.current = muted;
	}, [muted]);

	// initialise speech recognition
	useEffect(() => {
		// only need to initialise if webkit is available and not already initialised
		if ("webkitSpeechRecognition" in window && !recognitionInstance) {
			const recognition = new window.webkitSpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = false;
			recognition.lang = language;
			recognition.onresult = async (event) => {
				const lastResult = event.results[event.results.length - 1];
				if (lastResult.isFinal) {
					const recognizedText = lastResult[0].transcript;
					console.log("Speech recognized:", recognizedText);

					// Create message object for user's speech
					const userMessage = { text: recognizedText, sender: "user" };

					// saving user message to database if transcript
					if (transcriptId) {
						try {
							await addMessageToTranscript(transcriptId, userMessage);
						} catch (error) {
							console.error("Failed to save user message to transcript:", error);
						}
					}

					// call callback with the recognised text
					if (onSpeechRecognized) {
						onSpeechRecognized(recognizedText, userMessage);
					}
				}
			};

			recognition.onstart = () => {
				console.log("Speech recognition started");
				recognitionActiveRef.current = true;
			};

			recognition.onend = () => {
				console.log("Speech recognition ended");
				recognitionActiveRef.current = false;

				// only restart if not muted
				if (!isMutedRef.current) {
					try {
						// add small delay to avoid immediate restart
						setTimeout(() => {
							if (!isMutedRef.current && !recognitionActiveRef.current) {
								recognition.start();
								console.log("Speech recognition restarted after ending");
							}
						}, 300);
					} catch (e) {
						console.error("Failed to restart speech recognition:", e);
					}
				}
			};

			recognition.onerror = (event) => {
				console.error("Speech recognition error:", event.error);
				recognitionActiveRef.current = false;
			};

			setRecognitionInstance(recognition);

			// start recognition immediately if not muted
			if (!muted) {
				try {
					recognition.start();
				} catch (e) {
					console.error("Failed to start initial speech recognition:", e);
				}
			}
		}

		// Cleanup function
		return () => {
			if (recognitionInstance && recognitionActiveRef.current) {
				try {
					recognitionInstance.stop();
					recognitionActiveRef.current = false;
				} catch (e) {
					console.error("Error stopping speech recognition on unmount:", e);
				}
			}
		};
	}, [language, transcriptId, onSpeechRecognized, muted]);

	// uodate recognition when lang changes
	useEffect(() => {
		if (recognitionInstance) {
			// stop current recognition
			try {
				if (recognitionActiveRef.current) {
					recognitionInstance.stop();
					recognitionActiveRef.current = false;
				}
			} catch (e) {
				console.error("Error stopping recognition on language change:", e);
			}

			// update language
			recognitionInstance.lang = language;

			// restart if not muted
			if (!muted) {
				try {
					setTimeout(() => {
						recognitionInstance.start();
					}, 300);
				} catch (e) {
					console.error("Error restarting recognition after language change:", e);
				}
			}
		}
	}, [language, muted]);

	// toggle speech recognition (mute/unmute)
	const toggleRecognition = (shouldMute) => {
		const newMutedState = shouldMute !== undefined ? shouldMute : !isMutedRef.current;
		isMutedRef.current = newMutedState;

		if (newMutedState) {
			// Muting
			if (recognitionInstance && recognitionActiveRef.current) {
				try {
					console.log("Muting - stopping speech recognition");
					recognitionInstance.stop();
				} catch (e) {
					console.error("Error stopping speech recognition on mute:", e);
				}
			}
		} else {
			// Unmuting
			if (recognitionInstance && !recognitionActiveRef.current) {
				try {
					console.log("Unmuting - starting speech recognition");
					recognitionInstance.start();
				} catch (e) {
					console.error("Error starting speech recognition on unmute:", e);
				}
			}
		}

		return newMutedState;
	};

	return {
		recognitionInstance,
		isRecognitionActive: recognitionActiveRef.current,
		toggleRecognition
	};
}