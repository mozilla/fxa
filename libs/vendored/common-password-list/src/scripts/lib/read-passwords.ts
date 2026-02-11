/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import fs from 'fs';

const readPasswords = (
  inputFilename: string,
  minLength: number,
  maxCount: number
): string[] => {
  const data: string = fs.readFileSync(inputFilename, 'utf8');

  const passwords: string[] = filterPasswords(
    data.split('\n'),
    minLength,
    maxCount
  );
  return passwords
    .map((password) => password.trim())
    .filter((password) => !!password.length);
};

function filterPasswords(
  passwords: string[],
  minLength: number,
  maxCount: number
): string[] {
  const set: Set<string> = new Set();

  for (let i = 0; set.size < maxCount && passwords[i]; ++i) {
    const password: string = passwords[i].toLowerCase();
    if (password.length >= minLength && !set.has(password)) {
      set.add(password);
    }
  }

  return Array.from(set).sort();
}

export default readPasswords;
