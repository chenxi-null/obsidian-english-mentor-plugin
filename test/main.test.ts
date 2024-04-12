import { App, Plugin } from 'obsidian';
import AwesomeEnglishTeacher from '../src/main';
import { BaseTranslator } from '../src/BaseTranslator';
import { TEST_CONFIG } from './test-config';

// Mock Obsidian's App and Plugin
const mockApp = {
  workspace: {
    activeLeaf: {
      view: {
        sourceMode: {
          cmEditor: {
            getSelection: jest.fn(),
            replaceSelection: jest.fn()
          }
        }
      }
    }
  }
} as unknown as App;

describe('AwesomeEnglishTeacher', () => {
  let plugin: AwesomeEnglishTeacher;

  beforeEach(async () => {
    plugin = new AwesomeEnglishTeacher(mockApp, {});
    
    // Override loadData to return our test settings
    plugin.loadData = async () => ({
      translatorSettings: {
        provider: 'DeepSeek',
        apiKeys: {
          OpenAI: TEST_CONFIG.translators.OpenAI.apiKey,
          DeepSeek: TEST_CONFIG.translators.DeepSeek.apiKey,
          Kimi: TEST_CONFIG.translators.Kimi.apiKey,
          Coze: TEST_CONFIG.translators.Coze.apiKey
        },
        proxyAddress: TEST_CONFIG.translators.DeepSeek.proxyAddress || undefined
      }
    });
    
    await plugin.loadSettings();
    await plugin.onload(); // This will initialize commands array
  });

  describe('Settings Management', () => {
    it('should load test settings', () => {
      expect(plugin.settings.translatorSettings.provider).toBe('DeepSeek');
      expect(plugin.settings.translatorSettings.apiKeys.DeepSeek)
        .toBe(TEST_CONFIG.translators.DeepSeek.apiKey);
    });

    it('should update settings and reload translator', async () => {
      plugin.settings.translatorSettings.provider = 'OpenAI';
      plugin.settings.translatorSettings.proxyAddress = 
        TEST_CONFIG.translators.OpenAI.proxyAddress || undefined;
      await plugin.saveSettings();
      plugin.reloadTranslator();

      expect(plugin.translator.constructor.name).toBe('OpenAITranslator');
    });

    it('should update proxy settings', async () => {
      plugin.settings.translatorSettings.proxyAddress = 'http://localhost:8080';
      await plugin.saveSettings();
      plugin.reloadTranslator();

      // You might need to modify this based on how you want to verify proxy settings
      expect(plugin.translator).toBeDefined();
    });
  });

  describe('Translation Operations', () => {
    beforeEach(() => {
      plugin.translator = {
        translate: jest.fn().mockResolvedValue('translated text')
      } as unknown as BaseTranslator;
    });

    it('should translate selected text', async () => {
      const result = await plugin.doTranslate('test text');
      expect(plugin.translator.translate).toHaveBeenCalledWith('test text');
      expect(result).toBe('translated text');
    });

    it('should handle translation errors', async () => {
      const mockError = new Error('Translation failed');
      (plugin.translator.translate as jest.Mock).mockRejectedValue(mockError);
      
      const consoleSpy = jest.spyOn(console, 'log');
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

      const result = await plugin.doTranslate('test text');

      expect(alertMock).toHaveBeenCalledWith('Translation failed: Translation failed');
      expect(result).toBe('test text');
      
      alertMock.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Editor Integration', () => {
    beforeEach(async () => {
      // Ensure commands are initialized
      if (!plugin.commands) {
        await plugin.onload();
      }
    });

    it('should handle text selection', () => {
      const mockEditor = mockApp.workspace.activeLeaf.view.sourceMode.cmEditor;
      mockEditor.getSelection.mockReturnValue('test text');
      
      expect(plugin.commands).toBeDefined();
      expect(plugin.commands.length).toBeGreaterThan(0);
      const result = plugin.commands[0].checkCallback(false);
      
      expect(result).toBe(true);
      expect(mockEditor.getSelection).toHaveBeenCalled();
    });

    it('should handle no text selection', () => {
      const mockEditor = mockApp.workspace.activeLeaf.view.sourceMode.cmEditor;
      mockEditor.getSelection.mockReturnValue('');
      
      expect(plugin.commands).toBeDefined();
      expect(plugin.commands.length).toBeGreaterThan(0);
      const result = plugin.commands[0].checkCallback(false);
      
      expect(result).toBe(false);
    });
  });
}); 