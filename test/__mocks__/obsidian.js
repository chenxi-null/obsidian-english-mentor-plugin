module.exports = {
  App: class {},
  Plugin: class {
    constructor(app, manifest) {
      this.app = app;
      this.manifest = manifest;
    }
    addCommand(command) {
      if (!this.commands) {
        this.commands = [];
      }
      this.commands.push(command);
    }
    addRibbonIcon() { return { addEventListener: () => {} }; }
    addSettingTab() {}
    addStatusBarItem() { return { setText: () => {} }; }
    loadData() { return Promise.resolve({}); }
    saveData() { return Promise.resolve(); }
    registerEvent() {}
    registerInterval() {}
  },
  PluginSettingTab: class {
    constructor() {
      this.containerEl = document.createElement('div');
    }
  },
  Setting: class {
    constructor(containerEl) {}
    setName() { return this; }
    setDesc() { return this; }
    addText() { return this; }
    addDropdown() { return this; }
  },
  Modal: class {
    constructor(app) {
      this.contentEl = document.createElement('div');
    }
  },
  Notice: class {}
}; 