import {BaseTranslator} from './BaseTranslator';
import * as HttpsProxyAgent from 'https-proxy-agent';

export class OpenAITranslator extends BaseTranslator {
  constructor(apiKey: string, agent: any = null) {
    const timeout = 3000;
    super(apiKey, agent, timeout);
  }

  public async translate(text: string): Promise<string> {
    const data = {
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "system",
          "content": "You're a well-versed English mentor, proficient in metamorphosing phrases into eloquent English." +
            "You will be provided with statements, and your task is to convert them to English." +
            "Rules: just output the result; lowercase first letter; use the original punctuation of the sentence. "
        },
        {
          "role": "user",
          "content": text
        }
      ]
    };

    const response = await this.makeRequest('https://api.openai.com/v1/chat/completions', data);

    return response.choices[0].message.content;
  }
}

export class DeepSeekTranslator extends BaseTranslator {
  constructor(apiKey: string, agent: any = null) {
    const timeout = 15_000;
    super(apiKey, agent, timeout);
  }

  public async translate(text: string): Promise<string> {
    const data = {
      "model": "deepseek-chat",
      "messages": [
        {
          "role": "system",
          "content": "You're a well-versed English mentor, proficient in metamorphosing phrases into eloquent English."
        },
        {
          "role": "user",
          "content": "把下列句子翻译成英文, 直接输出结果, 不要输出和翻译内容无关的信息，比如自我介绍之类的, 待翻译文本如下：" + text
        }
      ],
      "stream": false
    }

    const response = await this.makeRequest('https://api.deepseek.com/chat/completions', data);

    let content = response.choices[0].message.content;

    return content;
  }
}

export class KimiTranslator extends BaseTranslator {
  constructor(apiKey: string, agent: any = null) {
    const timeout = 15_000;
    super(apiKey, agent, timeout);
  }

  public async translate(text: string): Promise<string> {
    const data = {
      "model": "moonshot-v1-8k",
      "messages": [
        {
          "role": "system",
          "content": "You're a well-versed English mentor, proficient in metamorphosing phrases into eloquent English."
        },
        {
          "role": "user",
          "content": "把下列句子翻译成英文, 直接输出结果, 不要输出和翻译内容无关的信息，比如自我介绍之类的, 待翻译文本如下：" + text
        }
      ]
    };

    const response = await this.makeRequest('https://api.moonshot.cn/v1/chat/completions', data);

    let content = response.choices[0].message.content;
    // your additional logic...

    return content;
  }
}


export class CozeTranslator extends BaseTranslator {
  constructor(apiKey: string, agent: any = null) {
    const timeout = 15_000;
    super(apiKey, agent, timeout);
  }

  public async translate(text: string): Promise<string> {
    const data = {
      "conversation_id": "123",
      "bot_id": "7314871103539871752",
      "user": "123333333",
      "query": text,
      "stream": false
    }

    const response = await this.makeRequest('https://api.coze.com/open_api/v2/chat', data);
    return response.messages[0].content;
  }
}
