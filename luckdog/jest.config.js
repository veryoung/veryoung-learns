module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx)'],
  transform: {
    // '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // 支持源代码中相同的 @ -> src 别名
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  transformIgnorePatterns: ['/node_modules/(?!(@tencent|@hippy))'],
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  reporters: ['default', '@tencent/dwt-reporter'],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // 是否开启覆盖率
  collectCoverage: true,
  // 覆盖率的文件来源
  // collectCoverageFrom: ['src/**/*.{js,jsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageProvider: 'v8',
  testRunner: '@tencent/dwt-runner/runner',
};
