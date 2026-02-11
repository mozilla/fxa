/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import path from 'path';

import readPasswords from './lib/read-passwords';

const inputFilename: string = process.argv[2];
if (!inputFilename) {
  console.error('usage: node analyze.js <input filename>'); //eslint-disable-line
  process.exit(1);
}

const fileToAnalyzePath: string = path.join(__dirname, inputFilename);

const passwords: string[] = readPasswords(fileToAnalyzePath, 0, Infinity);

let shortestWord = '';
const minLength: number = passwords.reduce(
  (accumulator: number, password: string) => {
    if (password.length < accumulator) {
      shortestWord = password;
      return password.length;
    }
    return accumulator;
  },
  Infinity
);

let longestWord = '';
const maxLength: number = passwords.reduce(
  (accumulator: number, password: string) => {
    if (password.length > accumulator) {
      longestWord = password;
      return password.length;
    }
    return accumulator;
  },
  0
);

console.log(
  'total: %d, min length %d (%s), max length: %d (%s)', //eslint-disable-line
  passwords.length,
  minLength,
  shortestWord,
  maxLength,
  longestWord
);
