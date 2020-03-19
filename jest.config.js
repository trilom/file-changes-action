module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  testRunner: 'jest-circus/runner',
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
  collectCoverage: false,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 80,
      lines: 75,
      statements: 75
    }
  }
}
