// Empty declaration to allow for css imports
declare module "*.css" {}

declare module 'obsidian' {
  export class App {
    workspace: {
      activeLeaf: any;
    };
  }
  
  export class Plugin {
    app: App;
    constructor(app: App, manifest: any);
    addCommand(command: any): void;
    addRibbonIcon(icon: string, title: string, callback: () => void): void;
    addSettingTab(tab: any): void;
    addStatusBarItem(): { setText: (text: string) => void };
    loadData(): Promise<any>;
    saveData(data: any): Promise<void>;
  }

  export class PluginSettingTab {
    constructor(app: App, plugin: Plugin);
    containerEl: HTMLElement;
  }

  export class Setting {
    constructor(containerEl: HTMLElement);
    setName(name: string): this;
    setDesc(desc: string): this;
    addText(cb: (text: any) => void): this;
    addDropdown(cb: (dropdown: any) => void): this;
  }

  export class Modal {
    constructor(app: App);
    contentEl: HTMLElement;
  }

  export class Notice {
    constructor(message: string);
  }
}
