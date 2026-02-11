/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';

import { encode } from '@fxa/vendored/incremental-encoder';

import readPasswords from './lib/read-passwords';

const inputFilename: string = process.argv[2];
const outputFilename: string = process.argv[3];
const numberOfPasswords: number = parseInt(process.argv[4]);
const minLength: number = parseInt(process.argv[5]) || 8;

if (!inputFilename || !outputFilename || !numberOfPasswords) {
  console.error(
    `Usage: node ${path.basename(
      process.argv[1]
    )} <input filename> <output filename> <number of passwords> [<min length>]`
  ); //eslint-disable-line no-console
  process.exit(1);
}

const passwords: string[] = readPasswords(
  inputFilename,
  minLength,
  numberOfPasswords
);
const encodedPasswords: string[] = encode(passwords);

/*eslint-disable no-console*/
const output = `/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export default \`${encodedPasswords.join('\n')}\`;

`;

fs.writeFileSync(outputFilename, output, { encoding: 'utf8' });
