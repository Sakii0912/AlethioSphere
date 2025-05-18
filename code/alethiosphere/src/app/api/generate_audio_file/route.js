import path from "path";
import fs from "fs";
import LanguageDetect from "languagedetect";
import textToSpeech from "@google-cloud/text-to-speech";

const languageDetect = new LanguageDetect();
languageDetect.setLanguageType('iso2');

const credentials = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), "google-credentials.json"), "utf8")
);
const client = new textToSpeech.TextToSpeechClient({ credentials });

const getMostProbableLanguage = async (text) => {

	const allowed_languages = ["en", "fr", "hi", "de", "it", "ru"];

	const lang = languageDetect.detect(text, 1)[0][0];

	if (lang && allowed_languages.includes(lang))
		return lang;
	else
		return "en-US";
}

export async function POST(req) {
	const data = await req.json();
	const text = data.text;

	if (!text || text.trim() === "") {
		return new Response(JSON.stringify({ success: false, error: "Text required" }), { status: 400 });
	}

	const outputAudioPath = path.join(process.cwd(), "public", "audio", "audio.wav");

	const lang = await getMostProbableLanguage(text);

	try {
		const response = await client.synthesizeSpeech({
			input: { text },
			voice: { languageCode: lang, ssmlGender: "FEMALE" },
			audioConfig: { audioEncoding: "LINEAR16" },
		});

		if (!response[0] || !response[0].audioContent) {
			throw new Error("No audio content returned from TTS API");
		}


		await fs.promises.writeFile(outputAudioPath, response[0].audioContent);
		console.log("TTS audio saved.");

		return new Response(JSON.stringify({success: true}), {status: 200});

	} catch (error) {
		console.error("Error:", error);
		return new Response(JSON.stringify({success: false, error: error.message}), {status: 500});
	}
}