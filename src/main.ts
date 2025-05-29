import {App, Modal, Notice, Plugin, PluginSettingTab, Setting,} from "obsidian";

import {OpenAITranslator, KimiTranslator, CozeTranslator, DeepSeekTranslator} from './translator';
import {BaseTranslator} from "./BaseTranslator";
import * as HttpsProxyAgentPkg from 'https-proxy-agent';
const HttpsProxyAgent = HttpsProxyAgentPkg.HttpsProxyAgent;
import { PluginSettings, PROVIDERS, Provider } from './types';

const DEFAULT_SETTINGS: PluginSettings = {
  currentProvider: 'DeepSeek',
  providers: {
    OpenAI: {
      apiKey: '',
      proxyAddress: ''
    },
    DeepSeek: {
      apiKey: '',
      proxyAddress: ''
    },
    Kimi: {
      apiKey: '',
      proxyAddress: ''
    },
    Coze: {
      apiKey: '',
      proxyAddress: ''
    }
  }
};

export default class AwesomeEnglishTeacher extends Plugin {
  settings: PluginSettings;
  translator: BaseTranslator;
  commands: any[];

  async onload() {
    console.log("===============> loading plugin");
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
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
          // Capture the original selection position before async operation
          const selectionStart = editor.getCursor('from');
          const selectionEnd = editor.getCursor('to');
          const originalText = selectedText;
          
          selectedText = prefix ? `${prefix}${selectedText}` : selectedText;
          this.doTranslate(selectedText)
            .then((result) => {
              // Restore the original selection position
              editor.setSelection(selectionStart, selectionEnd);
              // Replace the text at the original position
              editor.replaceSelection(result);
              console.log(`[mentor] [${this.translator}] ${originalText} -> ${result}`);
            })
            .catch((error) => {
              console.error('Translation error:', error);
              // Restore selection and show original text if translation fails
              editor.setSelection(selectionStart, selectionEnd);
              editor.replaceSelection(originalText);
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
    const loadedData = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...loadedData,
      providers: {
        ...DEFAULT_SETTINGS.providers,
        ...(loadedData?.providers || {})
      }
    };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  reloadTranslator() {
    const currentProvider = this.settings.currentProvider;
    const settings = this.settings.providers[currentProvider];
    if (!settings) {
      console.warn(`No settings found for provider ${currentProvider}, using defaults`);
      return;
    }
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
            this.plugin.reloadTranslator();
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
            this.plugin.reloadTranslator();
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
            this.plugin.reloadTranslator();
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