npm test test/translator.test.ts

> obsidian-plugin_english-teacher@0.0.1 test
> jest test/translator.test.ts

  console.log
    [Error] There is no suitable adapter to dispatch the request since :
    - adapter xhr is not supported by the environment
    - adapter http is not available in the build
    - adapter fetch is not supported by the environment

      at DeepSeekTranslator.makeRequest (src/BaseTranslator.ts:38:17)

(node:34443) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 FAIL  test/translator.test.ts
  Translators
    ✕ DeepSeek translate (71 ms)

  ● Translators › DeepSeek translate

    AxiosError: There is no suitable adapter to dispatch the request since :
    - adapter xhr is not supported by the environment
    - adapter http is not available in the build
    - adapter fetch is not supported by the environment

      17 |   protected async makeRequest(url: string, data: any): Promise<any> {
      18 |     try {
    > 19 |       const response = await axios.post(
         |                                    ^
      20 |         url,
      21 |         data,
      22 |         {

      at Object.getAdapter (node_modules/axios/lib/adapters/adapters.js:70:13)
      at Axios.dispatchRequest (node_modules/axios/lib/core/dispatchRequest.js:49:28)
      at Axios._request (node_modules/axios/lib/core/Axios.js:178:33)
      at Axios.request (node_modules/axios/lib/core/Axios.js:40:25)
      at Axios.httpMethod [as post] (node_modules/axios/lib/core/Axios.js:217:19)
      at Function.wrap (node_modules/axios/lib/helpers/bind.js:5:15)
      at DeepSeekTranslator.makeRequest (src/BaseTranslator.ts:19:36)
      at DeepSeekTranslator.translate (src/translator.ts:55:33)
      at Object.<anonymous> (test/translator.test.ts:19:45)
      at Axios.request (node_modules/axios/lib/core/Axios.js:45:41)
      at DeepSeekTranslator.makeRequest (src/BaseTranslator.ts:19:24)
      at DeepSeekTranslator.translate (src/translator.ts:55:22)
      at Object.<anonymous> (test/translator.test.ts:19:20)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        2.253 sdeclare global {
  var document: any;
  var window: any;
  var console: any;
}

// Mock document for jsdom environment
if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({
      setText: () => {},
      empty: () => {},
      createEl: () => ({})
    })
  };
}

// Mock window.alert
if (typeof window === 'undefined') {
  global.window = {
    alert: jest.fn()
  };
}

// Mock console methods if needed
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn()
};

export {}; 