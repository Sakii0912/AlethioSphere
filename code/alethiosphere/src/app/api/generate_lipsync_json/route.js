import fs from "fs";
import path from "path";

import {generateLipSyncFromAudio} from "@/lib/lipsync"

export async function GET(req) {

	const inputAudioPath = path.join(process.cwd(), "public", "audio", "audio.wav");
	const outputJsonPath = path.join(process.cwd(), "public", "data", "lipSync.json");

	try {
		const audioContent = await fs.promises.readFile(inputAudioPath);

		console.time("Lip sync generation");
		const lipSyncData = generateLipSyncFromAudio(audioContent);
		console.timeEnd("Lip sync generation");

		await fs.promises.writeFile(outputJsonPath, JSON.stringify(lipSyncData));
		console.log("Lip sync generated.");

		return new Response(JSON.stringify({success: true}), {status: 200});
	} catch (error) {
		console.error("Error:", error);
		return new Response(JSON.stringify({success: false, error: error.message}), {status: 500});
	}
}
