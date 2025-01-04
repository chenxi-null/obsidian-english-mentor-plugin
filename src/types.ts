export type Provider = 'OpenAI' | 'DeepSeek' | 'Kimi' | 'Coze';

export const PROVIDERS = ['OpenAI', 'DeepSeek', 'Kimi', 'Coze'] as const;

export interface ProviderSettings {
  apiKey: string;
  proxyAddress: string;
}

export interface PluginSettings {
  currentProvider: Provider;
  providers: {
    [key in Provider]: ProviderSettings;
  };
}

export const DEFAULT_SETTINGS: PluginSettings = {
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