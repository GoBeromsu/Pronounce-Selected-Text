import {
	Notice,
	Plugin
} from "obsidian";

export default class BritishPronunciationPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: "pronounce-slected-text",
			name: "Pronounce Selected text",
			editorCallback: (editor) => this.pronouncSelectedText(editor),
			hotkeys: [],
		});
	}
	pronouncSelectedText(editor: any) {
		const selection = editor.getSelection();
		if (!selection || selection.toString().trim() === "") {
			new Notice("no text selected");
			return;
		}
		const utterance = new SpeechSynthesisUtterance(selection);

		const voices = speechSynthesis.getVoices();
		const britishVoice = voices.find((voice) => voice.lang === "en-GB");
		utterance.voice = britishVoice || null;
		speechSynthesis.speak(utterance);
	}

	onunload() {}
}
