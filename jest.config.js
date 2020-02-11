module.exports = {
  automock: false,
  // projects: ['<rootDir>/packages/*'],
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,mjs}',
  ],
  setupFiles: [
    './config/polyfills.js',
    './config/jest/setup.js',
  ],
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  testMatch: [
    '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,mjs}',
    '<rootDir>/tests/**/?(*.)(spec|test).{js,jsx,mjs}',
  ],
  testEnvironment: 'jest-environment-jsdom-global',
  testURL: 'http://localhost',
  transform: {
    '^.+\\.(js|jsx|mjs)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|mjs|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$',
    '[/\\\\]packages[/\\\\](.*)[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$',
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
  },
  moduleFileExtensions: [
    'web.js',
    'mjs',
    'js',
    'json',
    'web.jsx',
    'jsx',
    'node',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
