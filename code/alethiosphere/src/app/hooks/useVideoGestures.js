import { useState, useEffect, useRef } from "react";
import useGestureRecognition from "@/app/hooks/useGestureRecognition";


export default function useVideoGestures({ videoRef, onGestureMessage }) {
	const [userStream, setUserStream] = useState(null);
	const [isVideoOn, setIsVideoOn] = useState(true);

	const { handleGestureMessage } = useGestureRecognition({
		videoRef,
		isVideoOn,
		onGestureDetected: handleGestureDetected
	});

	// start video streamn
	useEffect(() => {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then((stream) => {
					if (videoRef.current) {
						videoRef.current.srcObject = stream;
						setUserStream(stream);
					}
				})
				.catch((error) => {
					console.error("Error accessing the camera or microphone:", error);
				});
		}

		return () => {
			if (userStream) {
				userStream.getTracks().forEach(track => track.stop());
			}
		};
	}, []);

	async function handleGestureDetected(gestureName) {
		if (gestureName === "thumbs_up") {
			console.log("👍 Thumbs up detected! - Sending 'I am happy today'");
			onGestureMessage("<thumbs up>");
		} else if (gestureName === "thumbs_down") {
			console.log("👎 Thumbs down detected! - Sending 'I am sad today'");
			onGestureMessage("<thumbs down>");
		}
	}

	const toggleVideo = () => {
		if (userStream) {
			if (isVideoOn) {
				// stop camera when turning off
				userStream.getVideoTracks().forEach(track => {
					track.stop();
				});
			} else {
				// restart camera when turning on
				navigator.mediaDevices
					.getUserMedia({ video: true })
					.then((stream) => {
						const audioTracks = userStream.getAudioTracks();
						// creates a new stream with the existing audio tracks and the new video track
						const newStream = new MediaStream([...audioTracks, ...stream.getVideoTracks()]);
						if (videoRef.current) {
							videoRef.current.srcObject = newStream;
							setUserStream(newStream);
						}
					})
					.catch((error) => {
						console.error("Error accessing the camera:", error);
					});
			}
			setIsVideoOn(!isVideoOn);
		}
	};

	return {
		userStream,
		isVideoOn,
		toggleVideo
	};
}