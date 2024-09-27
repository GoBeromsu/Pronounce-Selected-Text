import { Notice, Plugin, PluginSettingTab, Setting } from "obsidian";

interface PronounceSelectedTextSettings {
	defaultRate: number;
	selectedVoice: string;
}

const DEFAULT_SETTINGS: PronounceSelectedTextSettings = {
	defaultRate: 1,
	selectedVoice: "",
};

export default class PronounceSelectedTextPlugin extends Plugin {
	settings: PronounceSelectedTextSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "pronounce-selected-text",
			name: "Pronounce selected text",
			editorCheckCallback: (checking: boolean, editor: any) => {
				const selection = editor.getSelection();
				if (checking) {
					return !!selection && selection.trim() !== "";
				}
				this.pronounceSelectedText(editor);
			},
		});

		this.addSettingTab(new PronounceSelectedTextSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	pronounceSelectedText(editor: any) {
		const selection = editor.getSelection();
		if (!selection || selection.trim() === "") {
			new Notice("No text selected");
			return;
		}

		const utterance = new SpeechSynthesisUtterance(selection);
		utterance.rate = this.settings.defaultRate;

		const voices = speechSynthesis.getVoices();
		const selectedVoice = voices.find(
			(voice) => voice.name === this.settings.selectedVoice
		);
		if (selectedVoice) {
			utterance.voice = selectedVoice;
		}

		speechSynthesis.speak(utterance);
	}

	onunload() {}
}

class PronounceSelectedTextSettingTab extends PluginSettingTab {
	plugin: PronounceSelectedTextPlugin;

	constructor(app: App, plugin: PronounceSelectedTextPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Voice")
			.setDesc("Select the voice for pronunciation")
			.addDropdown((dropdown) => {
				const voices = speechSynthesis.getVoices();
				const voiceOptions = Object.fromEntries(
					voices.map((voice) => [
						voice.name,
						`${voice.name} (${voice.lang})`,
					])
				);
				dropdown
					.addOptions(voiceOptions)
					.setValue(this.plugin.settings.selectedVoice)
					.onChange(async (value) => {
						this.plugin.settings.selectedVoice = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Speech rate")
			.setDesc("Set the default speech rate")
			.addSlider((slider) =>
				slider
					.setLimits(0.5, 2, 0.1)
					.setValue(this.plugin.settings.defaultRate)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.defaultRate = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
