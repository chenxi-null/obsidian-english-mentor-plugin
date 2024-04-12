module.exports = {
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/test/custom-environment.js',
  moduleNameMapper: {
    '^obsidian$': '<rootDir>/test/__mocks__/obsidian.js'
  }
};
