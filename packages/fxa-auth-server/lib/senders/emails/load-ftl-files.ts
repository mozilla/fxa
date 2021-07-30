/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

const getAllFiles = function (dirPath: string, arrayOfFiles: Array<any>) {
  const files = readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (path.join(dirPath, file).includes('.ftl')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
};

export function loadFtlFiles(dirPath: string) {
  const ftlMap2: Record<any, any> = {};
  const fileArr: Array<any> = [];
  const ftlArr: Array<any> = getAllFiles(dirPath, fileArr);

  ftlArr.forEach((file) => {
    const indexLocale = path.parse(file).name;
    try {
      ftlMap2[`${indexLocale}`]
        ? (ftlMap2[`${indexLocale}`] += readFileSync(file, 'utf8'))
        : (ftlMap2[`${indexLocale}`] = readFileSync(file, 'utf8'));
    } catch (e) {
      ftlMap2[`${indexLocale}`]
        ? (ftlMap2[`${indexLocale}`] += '')
        : (ftlMap2[`${indexLocale}`] = '');
    }
  });
  return ftlMap2;
}
