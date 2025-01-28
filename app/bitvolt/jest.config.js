/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['<rootDir>/src/**/*.(ts|tsx)', '!<rootDir>/**/index.(ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.css$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.svg$': 'jest-transform-stub',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
