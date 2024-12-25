/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
