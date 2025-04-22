import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// You might also need other globals depending on what your code and tests use,
// although TextEncoder and TextDecoder are common ones for fetch.
// For example, if you use URL or URLSearchParams:
// if (typeof global.URL === 'undefined') {
//   global.URL = URL; // URL is a global in Node.js
// }
// if (typeof global.URLSearchParams === 'undefined') {
//   global.URLSearchParams = URLSearchParams; // URLSearchParams is a global in Node.js
// }

// If you are in a JSDOM environment provided by a test runner,
// some of these might already be present, but explicitly ensuring they are
// available on `global` is a robust way to handle it.

console.log('Test setup file executed: TextEncoder and TextDecoder globals ensured.');
