import axios from 'axios';
import * as HttpsProxyAgent from 'https-proxy-agent';

type HttpsProxyAgentInstance = InstanceType<typeof HttpsProxyAgent.HttpsProxyAgent>;

export abstract class BaseTranslator {
  protected readonly apiKey: string;
  protected readonly agent: HttpsProxyAgentInstance;
  protected readonly timeout: number;

  protected constructor(apiKey: string, agent: HttpsProxyAgentInstance, timeout: number) {
    this.apiKey = apiKey;
    this.agent = agent;
    this.timeout = timeout;
  }

  protected async makeRequest(url: string, data: any): Promise<any> {
    try {
      const response = await axios.post(
        url,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          httpsAgent: this.agent,
          timeout: this.timeout
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        console.log("status: " + JSON.stringify(error.response.status, null, 2));
        console.log("body: " + JSON.stringify(error.response.data, null, 2));
        console.log(JSON.stringify(error.response.headers, null, 2));
      } else {
        console.log('[Error]', error.message);
      }
      throw error;
    }
  }

  public abstract translate(text: string): Promise<string>;
}
