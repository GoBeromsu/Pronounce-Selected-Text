import { Notice, Plugin } from "obsidian";

export default class PronounceSelectedTextPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: "pronounce-selected-text",
			name: "Pronounce selected text",
			editorCheckCallback: (editor) => this.pronounceSelectedText(editor),
			hotkeys: [],
		});
	}

	pronounceSelectedText(editor: any) {
		const selection = editor.getSelection();
		if (!selection || selection.toString().trim() === "") {
			new Notice("No text selected");
			return;
		}
		const utterance = new SpeechSynthesisUtterance(selection);

		const voices = speechSynthesis.getVoices();
		const britishVoice = voices.find((voice) => voice.lang === "en-GB");
		if (britishVoice) {
			utterance.voice = britishVoice;
		} else {
			new Notice("British English voice not found");
			utterance.voice = null;
		}
		speechSynthesis.speak(utterance);
	}

	onunload() {}
}
