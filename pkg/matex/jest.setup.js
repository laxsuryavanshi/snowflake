/* eslint-disable @typescript-eslint/no-require-imports */

require('@testing-library/jest-dom');

// polyfills
const { TextDecoder, TextEncoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
