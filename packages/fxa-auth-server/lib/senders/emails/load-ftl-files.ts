/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

const getAllFiles = function (dirPath: string) {
  const files = readdirSync(dirPath);

  let arrayOfFiles: string[] = [];

  files.forEach(function (file) {
    if (statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file);
    } else {
      if (path.join(dirPath, file).includes('.ftl')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
};

export function loadFtlFiles(dirPath: string): Record<string, string> {
  const ftlMap: Record<string, string> = {};
  const ftlArr = getAllFiles(dirPath);

  ftlArr.forEach((file) => {
    const splitPath = path.parse(file).dir.split('/');
    const indexLocale = splitPath[splitPath.length - 1];
    try {
      ftlMap[`${indexLocale}`]
        ? (ftlMap[`${indexLocale}`] += readFileSync(file, 'utf8'))
        : (ftlMap[`${indexLocale}`] = readFileSync(file, 'utf8'));
    } catch (e) {
      ftlMap[`${indexLocale}`]
        ? (ftlMap[`${indexLocale}`] += '')
        : (ftlMap[`${indexLocale}`] = '');
    }
  });

  return ftlMap;
}
