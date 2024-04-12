export class AwesomeEnglishTeacherSettingTab extends PluginSettingTab {
  display(): void {
    const {containerEl} = this;
    containerEl.empty();
    containerEl.createEl("h2", {text: "English Teacher Settings"});

    const currentProvider = this.plugin.settings.currentProvider as Provider;
    const currentSettings = this.plugin.settings.providers[currentProvider];

    new Setting(containerEl)
      .setName("Provider Profile")
      .setDesc("Select your AI provider")
      .addDropdown((dropdown) => {
        PROVIDERS.forEach(provider => {
          dropdown.addOption(provider, provider);
        });
        dropdown
          .setValue(currentProvider)
          .onChange(async (value) => {
            this.plugin.settings.currentProvider = value as Provider;
            await this.plugin.saveSettings();
            this.plugin.reloadTranslators();
            // Refresh the settings display to update fields
            this.display();
          });
      });

    new Setting(containerEl)
      .setName("API Key")
      .setDesc(this.getApiKeyDescription())
      .addText((text) =>
        text
          .setPlaceholder(this.getApiKeyPlaceholder())
          .setValue(currentSettings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.providers[currentProvider].apiKey = value;
            await this.plugin.saveSettings();
            this.plugin.reloadTranslators();
          })
      );

    new Setting(containerEl)
      .setName("Proxy Address")
      .setDesc("Enter the proxy address (optional)")
      .addText((text) =>
        text
          .setPlaceholder("http://127.0.0.1:7890")
          .setValue(currentSettings.proxyAddress)
          .onChange(async (value) => {
            this.plugin.settings.providers[currentProvider].proxyAddress = value;
            await this.plugin.saveSettings();
            this.plugin.reloadTranslators();
          })
      );
  }

  private getApiKeyDescription(): string {
    switch (this.plugin.settings.currentProvider) {
      case "OpenAI":
        return "Enter your OpenAI API key (starts with 'sk-')";
      case "Kimi":
        return "Enter your Moonshot/Kimi API key";
      case "DeepSeek":
        return "Enter your DeepSeek API key";
      case "Coze":
        return "Enter your Coze API key (starts with 'pat_')";
      default:
        return "Enter your API key";
    }
  }

  private getApiKeyPlaceholder(): string {
    switch (this.plugin.settings.currentProvider) {
      case "OpenAI":
        return "sk-...";
      case "Kimi":
        return "sk-...";
      case "DeepSeek":
        return "sk-...";
      case "Coze":
        return "pat_...";
      default:
        return "Enter API key";
    }
  }
} 