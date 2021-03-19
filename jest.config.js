module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  roots: [
    '<rootDir>/test'
  ],
  testRegex: 'test/(.+)\\.test\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    "^.+\\.(css|less)$": "./styleMock.js"
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@type': require('path').resolve(__dirname, './index.d.ts'),
    'xgraph.compiler': require('path').resolve(__dirname, './index.ts')
  },
  transformIgnorePatterns: []
};
