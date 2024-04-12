import { OpenAITranslator, KimiTranslator, CozeTranslator, DeepSeekTranslator } from '../src/translator';
import { TEST_CONFIG } from './test-config';

describe('Translators', () => {
  let deepSeekTranslator: DeepSeekTranslator;
  let kimiTranslator: KimiTranslator;
  let cozeTranslator: CozeTranslator;
  let openAITranslator: OpenAITranslator;

  beforeEach(() => {
    const config = TEST_CONFIG.translators;
    deepSeekTranslator = new DeepSeekTranslator(config.DeepSeek.apiKey, config.DeepSeek.proxyAddress);
    kimiTranslator = new KimiTranslator(config.Kimi.apiKey, config.Kimi.proxyAddress);
    cozeTranslator = new CozeTranslator(config.Coze.apiKey, config.Coze.proxyAddress);
    openAITranslator = new OpenAITranslator(config.OpenAI.apiKey, config.OpenAI.proxyAddress);
  });

  it('DeepSeek translate', async () => {
    const result = await deepSeekTranslator.translate("苟利国家生死以，岂因祸福避趋之");
    console.log(result)
    expect(result.toLowerCase()).toMatch(/country|nation/);
  });

})
