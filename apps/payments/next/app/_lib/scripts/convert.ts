#!/usr/bin/env node -r esbuild-register
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * This is a temporary script to convert l10n strings to match the format that
 * will be used in Payments Next
 *
 * For unchanged strings copied from SP2.5 to SP3.0, the l10n team will attempt
 * to run a script to copy the existing translations from the SP2.5 id’s to the
 * new SP3.0 ids. To help with this effort, when copying a string ID, the
 * SubPlat team should pre-fix the string ID with ‘next-’. Example below
 *
 * SP2.5 string: coupon-promo-code-applied
 * SP3.0 string: next-coupon-promo-code-applied
 */
import path from 'path';
import { stat, readFile, writeFile, readdir } from 'fs/promises';

// These directories will be skipped since they do not have a payments.ftl file
// The "en" directory should also be skipped, since l10n-merge populates en/payments.ftl
// with latest ftl files sourced from the FxA repo.
const skipDir = [
  'en',
  'templates',
  'ar',
  'bn',
  'bs',
  'gd',
  'hy-AM',
  'km',
  'ms',
  'my',
  'ne-NP',
];

function getFullPath(directory: string) {
  const filename = './payments.ftl';
  return path.resolve(directory, filename);
}

async function getFile(directory: string) {
  const fullPath = getFullPath(directory);
  return readFile(fullPath, { encoding: 'utf8' });
}

async function setFile(directory: string, contents: string) {
  const fullPath = getFullPath(directory);
  return writeFile(fullPath, contents, { encoding: 'utf8' });
}

function convertContents(content: string) {
  const brokenUp = content.split('\n');
  const modifiedContent: string[] = [];
  for (const line of brokenUp) {
    let newLine = line;
    if (/^[a-zA-Z]+$/.test(line.charAt(0))) {
      if (line.split('-')[0] !== 'next') {
        newLine = `next-${line}`;
      }
    }
    modifiedContent.push(newLine);
  }

  return modifiedContent.join('\n');
}

async function convertToNext(directory: string) {
  try {
    const contents = await getFile(directory);
    const modifiedContents = convertContents(contents);
    await setFile(directory, modifiedContents);
  } catch (error) {
    console.error(error);
  }
}

async function* directoryGen(baseDir: string) {
  const files = await readdir(baseDir);

  for (const file of files) {
    if (skipDir.includes(file)) {
      continue;
    }
    const fullPath = path.resolve(baseDir, file);
    const fileStat = await stat(fullPath);
    if (fileStat.isDirectory()) {
      yield fullPath;
    }
  }
}

async function init() {
  const baseDir = path.resolve(__dirname, '../../../public/locales');

  for await (const dir of directoryGen(baseDir)) {
    await convertToNext(dir);
  }

  return 0;
}

if (require.main === module) {
  init()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .then((result) => process.exit(result));
}
