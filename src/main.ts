import {App, Modal, Notice, Plugin, PluginSettingTab, Setting,} from "obsidian";

import {OpenAITranslator, KimiTranslator, CozeTranslator, DeepSeekTranslator} from './translator';
import {BaseTranslator} from "./BaseTranslator";
import * as HttpsProxyAgentPkg from 'https-proxy-agent';
const HttpsProxyAgent = HttpsProxyAgentPkg.HttpsProxyAgent;
import { PluginSettings, PROVIDERS, Provider } from './types';

interface TranslatorSettings {
  provider: string;
  apiKeys: {
    [key: string]: string;
  };
  proxyAddress?: string;
}

interface AwesomeEnglishTeacherSettings {
  translatorSettings: TranslatorSettings;
}

const DEFAULT_SETTINGS: AwesomeEnglishTeacherSettings = {
  translatorSettings: {
    provider: 'DeepSeek',
    apiKeys: {
      OpenAI: '',
      DeepSeek: '',
      Kimi: '',
      Coze: ''
    },
    proxyAddress: ''
  }
};

export default class AwesomeEnglishTeacher extends Plugin {
  settings: PluginSettings;
  translator: BaseTranslator;
  commands: any[];

  async onload() {
    console.log("===============> loading plugin");
    await this.loadSettings();
    this.reloadTranslator();

    this.commands = [];

    this.addRibbonIcon("dice", "Sample Plugin", () => {
      new Notice("This is a notice!");
    });
    this.addStatusBarItem().setText("Status Bar Text");

    const translateCommand = {
      id: 'Translate-selected-text',
      name: 'Translate selected text',
      hotkeys: [
        {
          modifiers: ['Mod'],
          key: 'u',
        },
      ],
      checkCallback: (checking: boolean) => {
        return this.replaceText(checking, 'translate the sentence to english: ');
      },
    };
    this.addCommand(translateCommand);
    this.commands.push(translateCommand);

    this.addCommand({
      id: 'Refine selected text',
      name: 'Refine selected text',
      hotkeys: [
        {
          modifiers: ['Mod'],
          key: 'y',
        },
      ],

      checkCallback: (checking: boolean) => {
        return this.replaceText(checking, 'refine the sentence to more native-like: ');
      }
    })

    this.addSettingTab(new AwesomeEnglishTeacherSettingTab(this.app, this));

    /*
    this.registerDomEvent(document, "click", (evt: MouseEvent) => {
      console.log("click", evt);
    });

    this.registerInterval(
      window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
    );
     */
  }

  private replaceText(checking: boolean, prefix: string | undefined = undefined) {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (activeLeaf) {
      // @ts-ignore
      const editor = activeLeaf.view.sourceMode.cmEditor;
      let selectedText = editor.getSelection();
      if (selectedText) {
        if (!checking) {
          selectedText = prefix ? `${prefix}${selectedText}` : selectedText;
          this.doTranslate(selectedText)
            .then((result) => {
              editor.replaceSelection(result);
              console.log(`[mentor] [${this.translator}] ${selectedText} -> ${result}`);
            });
        }
        return true;
      }
    }
    return false;
  }

  async doTranslate(text: string): Promise<string> {
    try {
      console.log(this.translator)
      return await this.translator.translate(text);
    } catch (error) {
      alert(`Translation failed: ${error.message}`);
      return text;
    }
  }

  onunload() {
    console.log("<=============== unloading plugin");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  reloadTranslator() {
    const currentProvider = this.settings.currentProvider;
    const settings = this.settings.providers[currentProvider];
    const proxyAgent = settings.proxyAddress ? 
      new HttpsProxyAgent(settings.proxyAddress) : null;

    switch (currentProvider) {
      case "OpenAI":
        this.translator = new OpenAITranslator(settings.apiKey, proxyAgent);
        break;
      case "Kimi":
        this.translator = new KimiTranslator(settings.apiKey, proxyAgent);
        break;
      case "DeepSeek":
        this.translator = new DeepSeekTranslator(settings.apiKey, proxyAgent);
        break;
      case "Coze":
        this.translator = new CozeTranslator(settings.apiKey, proxyAgent);
        break;
      default:
        this.translator = new DeepSeekTranslator(settings.apiKey, proxyAgent);
    }
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: AwesomeEnglishTeacher;

  constructor(app: App, plugin: AwesomeEnglishTeacher) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let {containerEl} = this;
    containerEl.empty();
    containerEl.createEl("h1", {text: "Awesome English Mentor - Settings"});

    new Setting(containerEl)
      .setName("Select translator")
      .setDesc("Select translator for the plugin")
      .addDropdown((dropdown) => {
        dropdown.addOption('DeepSeek', 'DeepSeek');
        dropdown.addOption('kimi', 'Kimi');
        dropdown.addOption('coze', 'Coze');
        dropdown.setValue(this.plugin.settings.translatorSettings.provider)
        dropdown.onChange(async (value) => {
          this.plugin.settings.translatorSettings.provider = value;
          await this.plugin.saveSettings();
          this.plugin.reloadTranslator();
          this.display();
        });
      });

    new Setting(containerEl)
      .setName("Proxy Address")
      .setDesc("HTTP proxy address (optional)")
      .addText(text => text
        .setPlaceholder("e.g. http://127.0.0.1:7890")
        .setValue(this.plugin.settings.translatorSettings.proxyAddress)
        .onChange(async (value) => {
          this.plugin.settings.translatorSettings.proxyAddress = value;
          await this.plugin.saveSettings();
          this.plugin.reloadTranslator();
        }));

    const currentProvider = this.plugin.settings.translatorSettings.provider;
    new Setting(containerEl)
      .setName("API Key")
      .setDesc(`API Key for ${currentProvider}`)
      .addText(text => text
        .setPlaceholder("Enter API Key")
        .setValue(this.plugin.settings.translatorSettings.apiKeys[currentProvider])
        .onChange(async (value) => {
          this.plugin.settings.translatorSettings.apiKeys[currentProvider] = value;
          await this.plugin.saveSettings();
          this.plugin.reloadTranslator();
        }));
  }
}

class AwesomeEnglishTeacherSettingTab extends PluginSettingTab {

  plugin: AwesomeEnglishTeacher;

  constructor(app: App, plugin: AwesomeEnglishTeacher) {
    super(app, plugin);
    this.plugin = plugin;
  }

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