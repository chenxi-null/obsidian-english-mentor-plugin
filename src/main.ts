import {App, Modal, Notice, Plugin, PluginSettingTab, Setting,} from "obsidian";

import {OpenAITranslator, KimiTranslator, CozeTranslator, DeepSeekTranslator} from './translator';
import {BaseTranslator} from "./BaseTranslator";
import * as HttpsProxyAgentPkg from 'https-proxy-agent';
const HttpsProxyAgent = HttpsProxyAgentPkg.HttpsProxyAgent;

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
  settings: AwesomeEnglishTeacherSettings;
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

    this.addSettingTab(new SampleSettingTab(this.app, this));

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
    const settings = this.settings.translatorSettings;
    const proxyAgent = settings.proxyAddress ? 
      new HttpsProxyAgent(settings.proxyAddress) : null;
    const apiKey = settings.apiKeys[settings.provider];

    switch (settings.provider) {
      case "OpenAI":
        this.translator = new OpenAITranslator(apiKey, proxyAgent);
        break;
      case "Kimi":
        this.translator = new KimiTranslator(apiKey, proxyAgent);
        break;
      case "DeepSeek":
        this.translator = new DeepSeekTranslator(apiKey, proxyAgent);
        break;
      case "Coze":
        this.translator = new CozeTranslator(apiKey, proxyAgent);
        break;
      default:
        this.translator = new DeepSeekTranslator(apiKey, proxyAgent);
    }
  }
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let {contentEl} = this;
    contentEl.setText("Woah!");
  }

  onClose() {
    let {contentEl} = this;
    contentEl.empty();
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
        });
      });

    new Setting(containerEl)
      .setName("Proxy Address")
      .setDesc("HTTP proxy address (optional)")
      .addText(text => text
        .setPlaceholder("http://127.0.0.1:7890")
        .setValue(this.plugin.settings.translatorSettings.proxyAddress)
        .onChange(async (value) => {
          this.plugin.settings.translatorSettings.proxyAddress = value;
          await this.plugin.saveSettings();
          this.plugin.reloadTranslator();
        }));

    // Add API key settings for each provider
    ['OpenAI', 'DeepSeek', 'Kimi', 'Coze'].forEach(provider => {
      new Setting(containerEl)
        .setName(`${provider} API Key`)
        .setDesc(`API Key for ${provider}`)
        .addText(text => text
          .setPlaceholder("Enter API Key")
          .setValue(this.plugin.settings.translatorSettings.apiKeys[provider])
          .onChange(async (value) => {
            this.plugin.settings.translatorSettings.apiKeys[provider] = value;
            await this.plugin.saveSettings();
            this.plugin.reloadTranslator();
          }));
    });
  }
}
