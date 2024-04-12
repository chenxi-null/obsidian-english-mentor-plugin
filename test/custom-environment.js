const JSDOMEnvironment = require('jest-environment-jsdom').default;

class CustomEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup();
    
    // Disable CORS restrictions
    this.global.XMLHttpRequest = undefined; // Force axios to use node-fetch instead of XHR
    this.global.fetch = require('node-fetch'); // Use node-fetch which doesn't have CORS restrictions
  }
}

module.exports = CustomEnvironment; 