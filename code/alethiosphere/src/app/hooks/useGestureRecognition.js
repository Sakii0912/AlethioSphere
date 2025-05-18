import { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";

export default function useGestureRecognition({
	                                              videoRef,
	                                              isVideoOn = true,
	                                              gestureCooldown = 10000,
	                                              onGestureDetected
                                              }) {

	const [isInitialized, setIsInitialized] = useState(false);
	const [isDetecting, setIsDetecting] = useState(false);
	const handposeModelRef = useRef(null); // stores handpose model
	const detectionIntervalRef = useRef(null);
	const lastGestureTimeRef = useRef(0);
	const gestureCooldownRef = useRef(gestureCooldown);

	useEffect(() => {
		gestureCooldownRef.current = gestureCooldown;
	}, [gestureCooldown]);

	useEffect(() => {
		initializeGestureDetection();

		return () => {
			stopDetection();
		};
	}, []);

	useEffect(() => {
		if (isVideoOn && isInitialized && videoRef.current?.srcObject) {
			startDetection();
		} else {
			stopDetection();
		}
	}, [isVideoOn, isInitialized, videoRef.current?.srcObject]);

	const initializeGestureDetection = async () => {
		if (isInitialized) return;

		try {
			await tf.ready();

			console.log("Loading handpose model...");
			handposeModelRef.current = await handpose.load();
			console.log("Handpose model loaded!");

			await ensureFingerpose();

			setIsInitialized(true);

			if (isVideoOn && videoRef.current?.srcObject) {
				startDetection();
			}
		} catch (error) {
			console.error("Error initializing gesture detector:", error);
		}
	};

	const ensureFingerpose = () => {
		return new Promise((resolve) => {
			if (window.fp) {
				resolve(true);
				return;
			}

			const script = document.createElement('script');
			script.src = 'https://unpkg.com/fingerpose@0.1.0/dist/fingerpose.js';
			script.async = true;
			script.onload = () => {
				console.log("Fingerpose library loaded");
				resolve(true);
			};
			document.body.appendChild(script);
		});
	};

	const startDetection = () => {
		if (!isInitialized || !handposeModelRef.current) {
			console.log("Gesture recognizer not initialized");
			return false;
		}

		stopDetection(); // stops any existing detection
		
		// 500 ms
		detectionIntervalRef.current = setInterval(async () => {
			await detectGestures();
		}, 500);

		setIsDetecting(true);
		console.log("Gesture detection started");
		return true;
	};

	const stopDetection = () => {
		if (detectionIntervalRef.current) {
			clearInterval(detectionIntervalRef.current);
			detectionIntervalRef.current = null;
			setIsDetecting(false);
			console.log("Gesture detection stopped");
		}
	};

	const createThumbsUpGesture = () => {
		const { GestureDescription, Finger, FingerCurl, FingerDirection } = window.fp;
		const thumbsUp = new GestureDescription('thumbs_up');

		thumbsUp.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
		thumbsUp.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
		thumbsUp.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.5);
		thumbsUp.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.5);

		for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
			thumbsUp.addCurl(finger, FingerCurl.FullCurl, 1.0);
		}

		return thumbsUp;
	};

	const createThumbsDownGesture = () => {
		const { GestureDescription, Finger, FingerCurl, FingerDirection } = window.fp;
		const thumbsDown = new GestureDescription('thumbs_down');

		thumbsDown.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
		thumbsDown.addDirection(Finger.Thumb, FingerDirection.VerticalDown, 1.0);
		thumbsDown.addDirection(Finger.Thumb, FingerDirection.DiagonalDownLeft, 0.5);
		thumbsDown.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 0.5);

		for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
			thumbsDown.addCurl(finger, FingerCurl.FullCurl, 1.0);
		}

		return thumbsDown;
	};


	const detectGestures = async () => {
		if (!handposeModelRef.current || !videoRef.current || !videoRef.current.srcObject) {
			return;
		}

		try {
			const hands = await handposeModelRef.current.estimateHands(videoRef.current);

			if (hands.length > 0) {
				if (!window.fp) {
					console.warn("Fingerpose library not loaded yet");
					return;
				}

				const { GestureEstimator } = window.fp;
				const gestureEstimator = new GestureEstimator([
					createThumbsUpGesture(),
					createThumbsDownGesture()
				]);

				const gesture = gestureEstimator.estimate(hands[0].landmarks, 7.5);

				if (gesture.gestures && gesture.gestures.length > 0) {
					const bestGesture = gesture.gestures.reduce((prev, curr) =>
						(prev.score > curr.score) ? prev : curr
					);

					if (bestGesture.score > 3) {
						const currentTime = Date.now();
						if (currentTime - lastGestureTimeRef.current > gestureCooldownRef.current) {
							console.log(`Detected gesture: ${bestGesture.name} with score ${bestGesture.score}`);

							if (typeof onGestureDetected === 'function') {
								onGestureDetected(bestGesture.name);
								lastGestureTimeRef.current = currentTime;
							}
						}
					}
				}
			}
		} catch (error) {
			console.error("Error detecting gestures:", error);
		}
	};

	const handleGestureMessage = async (message, recognitionInstance, isMuted) => {
		try {
			console.log(`Handling gesture message: ${message}`);

			// temporarily stop speech recognition if gesture is detected
			if (recognitionInstance && !isMuted) {
				try {
					recognitionInstance.stop();
				} catch (e) {
					console.error("Error stopping speech recognition for gesture:", e);
				}
			}

			// restart speech recognition after delay
			setTimeout(() => {
				if (recognitionInstance && !isMuted) {
					try {
						recognitionInstance.start();
					} catch (e) {
						console.error("Error restarting speech recognition after gesture:", e);
					}
				}
			}, 500);

			return true;
		} catch (error) {
			console.error("Error handling gesture message:", error);
			return false;
		}
	};

	return {
		isInitialized,
		isDetecting,
		startDetection,
		stopDetection,
		handleGestureMessage
	};
}