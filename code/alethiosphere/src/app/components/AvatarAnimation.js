import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AvatarAnimation = ({ width = 800, height = 800, id }) => {
	const mountRef = useRef(null);
	const audioRef = useRef(null);
	const timeoutRef = useRef(null);
	const initRef = useRef(false);

	let scene, camera, renderer, mouthPlane, leftEyePlane, rightEyePlane;
	let mouthMap = {
		"A": "/images/avatar/Mouth_Open.png",
		"B": "/images/avatar/Mouth_Closed.png",
		"C": "/images/avatar/Mouth_Half.png",
		"D": "/images/avatar/Mouth_Ee.png",
	};
	
	let mouthMaterial, mouthTexture;
	let blinkInterval;

	const cleanupAnimation = () => {
		console.log("Cleaning up previous animation");
		
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		
		// stop playing audio
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.src = '';
			audioRef.current = null;
		}
	};

	useEffect(() => {
		const cleanAndLoadFreshAssets = async () => {
			cleanupAnimation();
			await loadFreshAssets();
		}
		if (initRef.current) {
			cleanAndLoadFreshAssets();
			return;
		}

		initRef.current = true;

		const init = () => {
			scene = new THREE.Scene();
			camera = new THREE.OrthographicCamera(-640, 640, 640, -640, 0.1, 1000);
			camera.position.z = 5;

			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
			renderer.setSize(width, height);
			
			// sRGB for proper color rendering
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			
			mountRef.current.appendChild(renderer.domElement);

			// load Face Texture
			const textureLoader = new THREE.TextureLoader();

			const loadTextureWithCorrectEncoding = (path) => {
				const texture = textureLoader.load(path);
				texture.colorSpace = THREE.SRGBColorSpace;
				return texture;
			};

			let faceTexture = loadTextureWithCorrectEncoding("/images/avatar/head_base.png");
			let faceMaterial = new THREE.MeshBasicMaterial({ map: faceTexture, transparent: true });
			let faceGeometry = new THREE.PlaneGeometry(1280, 1280);
			let faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
			scene.add(faceMesh);

			mouthTexture = loadTextureWithCorrectEncoding(mouthMap["B"]);
			mouthMaterial = new THREE.MeshBasicMaterial({ map: mouthTexture, transparent: true });
			let mouthGeometry = new THREE.PlaneGeometry(1280, 1280);
			mouthPlane = new THREE.Mesh(mouthGeometry, mouthMaterial);
			mouthPlane.position.z = 1; // ensure mouth is rendered on top
			scene.add(mouthPlane);

			let leftEyeTexture = loadTextureWithCorrectEncoding("/images/avatar/Eye_L_Open.png");
			let rightEyeTexture = loadTextureWithCorrectEncoding("/images/avatar/Eye_R_Open.png");

			let leftEyeMaterial = new THREE.MeshBasicMaterial({ map: leftEyeTexture, transparent: true });
			let rightEyeMaterial = new THREE.MeshBasicMaterial({ map: rightEyeTexture, transparent: true });

			let eyeGeometry = new THREE.PlaneGeometry(1280, 1280);
			leftEyePlane = new THREE.Mesh(eyeGeometry, leftEyeMaterial);
			rightEyePlane = new THREE.Mesh(eyeGeometry, rightEyeMaterial);

			// bring eyes in front of face
			leftEyePlane.position.z = 1; 
			rightEyePlane.position.z = 1; 

			scene.add(leftEyePlane);
			scene.add(rightEyePlane);

			animate();
		};

		const blinkEyes = () => {
			const textureLoader = new THREE.TextureLoader();

			let leftEyePath = "/images/avatar/Eye_L_Closed.png";
			let rightEyePath = "/images/avatar/Eye_R_Closed.png";

			const loadTextureWithCorrectEncoding = (path, callback) => {
				textureLoader.load(path, function(texture) {
					texture.colorSpace = THREE.SRGBColorSpace;
					callback(texture);
				});
			};

			loadTextureWithCorrectEncoding(leftEyePath, function (texture) {
				if (leftEyePlane) {
					leftEyePlane.material.map = texture;
					leftEyePlane.material.needsUpdate = true;
				}
			});

			loadTextureWithCorrectEncoding(rightEyePath, function (texture) {
				if (rightEyePlane) {
					rightEyePlane.material.map = texture;
					rightEyePlane.material.needsUpdate = true;
				}
			});

			setTimeout(() => {
				let leftEyeOpen = "/images/avatar/Eye_L_Open.png";
				let rightEyeOpen = "/images/avatar/Eye_R_Open.png";

				loadTextureWithCorrectEncoding(leftEyeOpen, function (texture) {
					if (leftEyePlane) {
						leftEyePlane.material.map = texture;
						leftEyePlane.material.needsUpdate = true;
					}
				});

				loadTextureWithCorrectEncoding(rightEyeOpen, function (texture) {
					if (rightEyePlane) {
						rightEyePlane.material.map = texture;
						rightEyePlane.material.needsUpdate = true;
					}
				});
			}, 100); // 100 ms blink
		};

		let animationFrameId;

		const animate = () => {
			if (!mountRef.current) return;
			animationFrameId = requestAnimationFrame(animate);
			renderer.render(scene, camera);
		};

		const setMouthShape = (shape) => {
			if (!mouthPlane || !mouthMap[shape]) return;
			
			const textureLoader = new THREE.TextureLoader();
			textureLoader.load(mouthMap[shape || "B"], function (texture) {
				texture.colorSpace = THREE.SRGBColorSpace;
				
				if (mouthPlane) {
					mouthPlane.material.map = texture;
					mouthPlane.material.needsUpdate = true;
				}
			});
		};

		const lipSync = (lipSyncDataArray) => {
			if (!lipSyncDataArray || lipSyncDataArray.length === 0) return;

			const processCue = (cueIndex) => {
				if (cueIndex >= lipSyncDataArray.length) {
					// reset mouth shape at the end
					setMouthShape("B");
					return;
				}

				const cue = lipSyncDataArray[cueIndex];
				const mouthShape = cue.value;
				const duration = (cue.end - cue.start) * 1000; // convert to milliseconds

				setMouthShape(mouthShape);

				// schedule the next cue
				timeoutRef.current = setTimeout(() => {
					processCue(cueIndex + 1);
				}, duration);
			};

			processCue(0);
		};

		const loadFreshAssets = async () => {
			const timestamp = new Date().getTime(); // prevents caching
			try {
				const response = await fetch(`/data/lipSync.json?t=${timestamp}`);

				if (!response.ok) {
					if (response.status === 404) {
						console.error("Lip sync data not found");
						return;
					}
					throw new Error(`Failed to load lip sync data: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				console.log("Loaded fresh lip sync data at", timestamp);
				if (data === {})
					return;

				const audio = new Audio(`/audio/audio.wav?t=${timestamp}`);
				audioRef.current = audio;

				const audioLoaded = new Promise((resolve, reject) => {
					audio.onloadeddata = () => {
						console.log("Audio loaded, ready to play");
						resolve();
					};

					audio.onerror = (e) => {
						if (!e.isTrusted) {
							console.error("Audio loading error:", e);
							reject(new Error("Failed to load audio"));
						}
					};
				});

				audio.onplay = () => {
					console.log("Audio started playing");
					if (data.mouthCues) {
						lipSync(data.mouthCues);
					} else {
						console.warn("No mouth cues available in lip sync data");
					}
				};

				audio.onended = () => {
					console.log("Audio finished");
					setMouthShape("B"); // reset mouth shape when audio finishes
				};

				await audioLoaded;

				try {
					await audio.play();
				} catch (playError) {
					console.warn("Audio autoplay blocked, waiting for user interaction:", playError);

					// if autoplay is blocked, wait for user interaction
					const playOnClick = async () => {
						try {
							await audio.play();
						} catch (retryError) {
							console.error("Play error after click:", retryError);
						}
					};

					document.body.addEventListener('click', playOnClick, { once: true });
				}
			} catch (error) {
				console.error("Error in lip sync and audio process:", error);
				setMouthShape("B"); // mouth shape is reset on error
			}
		};

		init();
		blinkInterval = setInterval(blinkEyes, 4000);
		
		setTimeout(loadFreshAssets, 100);

		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			clearInterval(blinkInterval);
			cleanupAnimation();

			if (renderer) {
				renderer.dispose();
				if (mountRef.current) {
					while (mountRef.current.firstChild) {
						mountRef.current.removeChild(mountRef.current.firstChild);
					}
				}
			}

			if (mouthMaterial) mouthMaterial.dispose();
			if (mouthTexture) mouthTexture.dispose();

			if (scene) scene.clear();

		};
	}, [width, height, id]); // add id to dependencies to force remount when id changes

	return <div ref={mountRef} style={{ width: `${width}px`, height: `${height}px` }} />;
};

export default AvatarAnimation;