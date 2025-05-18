export function generateLipSyncFromAudio(audioContent) {
	const buffer = Buffer.from(audioContent);

	// LINEAR16 encoding used GoogleTTS (16-bit PCM, mono, 24kHz)
	const bytesPerSample = 2; // 16-bit = 2 bytes per sample
	const channels = 1; 
	const sampleRate = 24000; // 24kHz for Google TTS

	// the -44 accounts for 44-byte WAV header
	const dataLength = buffer.length - 44;
	const audioLengthSeconds = dataLength / (bytesPerSample * channels * sampleRate);

	console.log(`Audio length: ${audioLengthSeconds.toFixed(2)} seconds`);
	console.log(`Buffer size: ${buffer.length} bytes`);

	const framesPerSecond = 24;
	const totalFrames = Math.ceil(audioLengthSeconds * framesPerSecond);
	const frameDuration = 1 / framesPerSecond;

	console.log(`Generating ${totalFrames} lip sync frames`);

	// collect all energy values to determine thresholds
	const energyValues = [];
	const samplesPerFrame = Math.floor((buffer.length - 44) / totalFrames);

	for (let i = 0; i < totalFrames; i++) {
		const startByte = 44 + (i * samplesPerFrame);
		const endByte = Math.min(startByte + samplesPerFrame, buffer.length);

		let energy = 0;
		for (let j = startByte; j < endByte; j += 2) {
			if (j + 1 < endByte) {
				// convert two bytes to a 16-bit sample
				const sample = buffer[j] | (buffer[j + 1] << 8);
				energy += Math.abs(sample);
			}
		}

		const frameSize = (endByte - startByte) / 2; // number of 16-bit samples
		energy = frameSize > 0 ? energy / frameSize : 0;
		energyValues.push(energy);
	}

	// sort energy values
	const sortedEnergy = [...energyValues].sort((a, b) => a - b);

	// adaptive thresholds
	const silenceThreshold = sortedEnergy[Math.floor(sortedEnergy.length * 0.25)]; 
	const lowThreshold = sortedEnergy[Math.floor(sortedEnergy.length * 0.5)];    
	const mediumThreshold = sortedEnergy[Math.floor(sortedEnergy.length * 0.75)];  

	console.log(`Energy thresholds: silence=${silenceThreshold}, low=${lowThreshold}, medium=${mediumThreshold}`);

	const lipSyncData = [];

	// assign mouth shapes based on adaptive thresholds
	for (let i = 0; i < totalFrames; i++) {
		const energy = energyValues[i];

		let mouthShape;
		if (energy < silenceThreshold) {
			mouthShape = "B"; // closed
		} else if (energy < lowThreshold) {
			mouthShape = "C"; // half-open 
		} else if (energy < mediumThreshold) {
			mouthShape = "A"; // open 
		} else {
			mouthShape = "D"; // ee
		}

		// improving realism 
		if (i > 0 && i < totalFrames - 1) {
			const prevEnergy = energyValues[i-1];
			const nextEnergy = energyValues[i+1];

			// energy spike followed by decrease often indicates plosive sounds for example p, b, t, d
			if (energy > prevEnergy * 1.5 && energy > nextEnergy * 1.5) {
				mouthShape = "D"; // ee shape
			}

			if (Math.abs(energy - prevEnergy) < energy * 0.1 &&
				Math.abs(energy - nextEnergy) < energy * 0.1) {
				// randomized variety
				if (i % 3 === 0 && mouthShape === "A") {
					mouthShape = "D"; // ee
				} else if (i % 5 === 0 && mouthShape === "A") {
					mouthShape = "C"; // half-open
				}
			}
		}

		lipSyncData.push({
			start: i * frameDuration,
			end: (i + 1) * frameDuration,
			value: mouthShape
		});
	}

	// if surrounded by two frames of the same shape, conform
	for (let i = 1; i < lipSyncData.length - 1; i++) {
		const prev = lipSyncData[i - 1];
		const current = lipSyncData[i];
		const next = lipSyncData[i + 1];

		if (prev.value === next.value && current.value !== prev.value) {
			current.value = prev.value;
		}
	}

	let shapeCounts = {A: 0, B: 0, C: 0, D: 0};
	lipSyncData.forEach(frame => shapeCounts[frame.value]++);
	console.log("Initial mouth shape distribution:", shapeCounts);

	// forcing minimum counts 
	const targetMinimum = Math.max(2, Math.floor(totalFrames * 0.05)); // 5% of frames or 2 frames

	for (const shape of ["A", "C", "D"]) {
		if (shapeCounts[shape] < targetMinimum) {
			console.log(`Adding more "${shape}" shapes to meet minimum`);
			let added = 0;
			for (let i = 5; i < lipSyncData.length - 5 && added < targetMinimum; i += 4) {
				if (lipSyncData[i].value !== shape &&
					lipSyncData[i-1].value !== shape &&
					lipSyncData[i+1].value !== shape) {
					lipSyncData[i].value = shape;
					added++;
				}
			}
		}
	}

	// start and end with closed mouth
	if (lipSyncData.length > 0) {
		lipSyncData[0].value = "B";
		lipSyncData[lipSyncData.length - 1].value = "B";
	}

	shapeCounts = {A: 0, B: 0, C: 0, D: 0};
	lipSyncData.forEach(frame => shapeCounts[frame.value]++);
	console.log("Final mouth shape distribution:", shapeCounts);

	return { mouthCues: lipSyncData };
}