#!/usr/bin/env node -r esbuild-register
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * This is a temporary script to create the payments-next.ftl file for each locale
 * by reusing existing translations from the payments.ftl files for each locale.
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

/**
 * Global variables
 */
let nextFtlIdMap = new Map<string, number>();
let templatePaymentsNextFtl = '';
const convertReport: string[] = [];

/**
 * Helper functions
 */
const isNextFtlId = (id: string) => id.startsWith('next-');

const isFtlIdSuffix = (id: string) => id.trim().startsWith('.');

const getFtlId = (line: string) => line.split('=')[0].trim();

const getFtlValue = (line: string) => line.split('=')[1].trim();

const createFtlIdSuffixKey = (id: string, suffix: string) => `${id}${suffix}`;

function getFullPath(directory: string, isNext = false) {
  const filename = isNext ? './payments-next.ftl' : './payments.ftl';
  return path.resolve(directory, filename);
}

async function getPaymentsFile(directory: string) {
  const fullPath = getFullPath(directory, false);
  return readFile(fullPath, { encoding: 'utf8' });
}

async function setPaymentsNextFile(directory: string, contents: string) {
  const fullPath = getFullPath(directory, true);
  return writeFile(fullPath, contents, { encoding: 'utf8' });
}

function identifyLineType(line: string) {
  if (line.startsWith('##')) {
    return 'sectionHeader';
  } else if (line.startsWith('next-')) {
    if (nextFtlIdMap.has(getFtlId(line))) {
      return 'validIdField';
    } else {
      return 'invalidIdField';
    }
  } else if (line.startsWith('# ')) {
    return 'idFieldPrefix';
  } else if (isFtlIdSuffix(line)) {
    return 'idFieldSuffix';
  } else if (line === '') {
    return 'space';
  } else {
    return 'other';
  }
}

function getMapKey(currentLine: string, currentFtlId?: string) {
  if (isNextFtlId(currentLine)) {
    return getFtlId(currentLine);
  } else if (isFtlIdSuffix(currentLine) && currentFtlId) {
    return createFtlIdSuffixKey(currentFtlId, getFtlId(currentLine));
  } else {
    return null;
  }
}

/**
 * Functions to modify the value while writing to the new payments-next.ftl file
 */
function setEmptyLine(validIdLine: string): string | null {
  const id = validIdLine.split('=')[0];

  return `${id}=`;
}

function setLocaleValue(
  validIdLine: string,
  valueMap?: Map<string, string | null>,
  currentId?: string
): string | null {
  const id = getMapKey(validIdLine, currentId);

  if (!valueMap || !id) {
    return null;
  }

  const value = valueMap.get(id);
  const rawFtlId = validIdLine.split('=')[0];

  if (value === undefined || value === null) {
    return null;
  } else {
    return `${rawFtlId}= ${value}`;
  }
}

type PreviousLineType = 'section' | 'validIdField';

function createPaymentsNextFtl(
  paymentsFtlContent: string,
  modifyValidIdLine: (
    line: string,
    valueMap?: Map<string, string | null>,
    currentValidId?: string
  ) => string | null,
  localeMap?: Map<string, string | null>
) {
  const paymentsNextContent: string[] = [];
  let sectionHeaderBuffer: string[] = [];
  let currentWriteBuffer: string[] = [];
  let prefixWriteBuffer: string[] = [];
  let previousLineType: PreviousLineType | null = null;
  let currentValidId: string | undefined = undefined;

  // This for-loop walks through the payments ftl content line by line and only writes the lines
  // that are valid and should be included in the new ftl file.
  // Valid lines include
  // 1. Section headers (if that section has at least 1 valid id field)
  // 2. Valid id fields that start with `next-`
  // 3. Prefix, or comment lines, for Valid id fields
  // 4. Suffix lines for valid id fields
  //
  // All other lines should be excluded from the new ftl file
  //
  // This for loop makes use of various buffers to store lines in a section
  // and only writes the buffers to the new ftl file string when a new section
  // is encountered, and the values in the buffer are valid.
  for (const line of paymentsFtlContent.split('\n')) {
    const lineType = identifyLineType(line);

    // Write buffers to output
    if (lineType === 'sectionHeader' && previousLineType !== 'section') {
      if (currentWriteBuffer.length) {
        paymentsNextContent.push(...sectionHeaderBuffer);
        paymentsNextContent.push(...currentWriteBuffer);
      }
      sectionHeaderBuffer = [];
      currentWriteBuffer = [];
    }

    // Write to buffers
    switch (lineType) {
      case 'sectionHeader':
        if (
          previousLineType !== 'section' &&
          paymentsNextContent[paymentsNextContent.length - 1] !== ''
        ) {
          sectionHeaderBuffer.push('');
        }
        sectionHeaderBuffer.push(line);
        previousLineType = 'section';
        break;
      case 'validIdField':
        const modifiedLine = modifyValidIdLine(line, localeMap);
        if (modifiedLine !== null) {
          if (prefixWriteBuffer.length) {
            currentWriteBuffer.push(...prefixWriteBuffer);
          }
          currentWriteBuffer.push(modifiedLine);
        } else {
          convertReport.push(`${getFtlId(line)} - Missing value`);
        }
        break;
      case 'idFieldPrefix':
        prefixWriteBuffer.push(line);
        break;
      case 'idFieldSuffix':
        if (previousLineType === 'validIdField') {
          const modifiedLine = modifyValidIdLine(
            line,
            localeMap,
            currentValidId
          );
          if (modifiedLine !== null) {
            currentWriteBuffer.push(modifiedLine);
          }
        }
        break;
      case 'space':
        if (previousLineType === 'section') {
          sectionHeaderBuffer.push(line);
        }
        if (previousLineType === 'validIdField') {
          currentWriteBuffer.push(line);
        }
        break;
    }

    // Reset values
    switch (lineType) {
      case 'sectionHeader':
        previousLineType = 'section';
        break;
      case 'validIdField':
        const validIdHasValue = !!modifyValidIdLine(line, localeMap);
        if (validIdHasValue) {
          currentValidId = getFtlId(line);
          previousLineType = 'validIdField';
        } else {
          currentValidId = '';
          previousLineType = null;
        }
        prefixWriteBuffer = [];
        break;
      case 'other':
      case 'invalidIdField':
        previousLineType = null;
        currentValidId = undefined;
        prefixWriteBuffer = [];
        break;
    }
  }

  // Write the last section
  if (currentWriteBuffer.length) {
    paymentsNextContent.push(...sectionHeaderBuffer);
    paymentsNextContent.push(...currentWriteBuffer);
  }

  return paymentsNextContent.join('\n');
}

function addLocaleReport(directory: string) {
  convertReport.push('');
  convertReport.push('------------------------------------------------');
  convertReport.push(directory);
  convertReport.push('------------------------------------------------');
}

async function convertLocaleToNext(directory: string) {
  try {
    // create map for locale
    const localeIdMap = await populateValidFtlIdMap(directory);
    addLocaleReport(directory);
    const paymentsNextFtlContent = createPaymentsNextFtl(
      templatePaymentsNextFtl,
      setLocaleValue,
      localeIdMap
    );
    await setPaymentsNextFile(directory, paymentsNextFtlContent);
  } catch (error) {
    console.error(error);
  }
}

async function* localeDirectoryGen(baseDir: string) {
  const files = await readdir(baseDir);

  for (const file of files) {
    // Temporary to only test on en-CA
    //if (file !== 'de') continue;

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

async function populateValidFtlIdMap(dir: string) {
  const idMap = new Map<string, string | null>();
  let currentId = '';

  // Create a new map copying the keys from nextFtlIdMap
  // and setting the value to null.
  // Note: If a locales payments.ftl file does not have a value for that
  // id, the value will remain null.
  for (const [key] of nextFtlIdMap) {
    idMap.set(key, null);
  }

  // Fetch the current locale's payments.ftl file
  const paymentsFtlContentEn = await getPaymentsFile(dir);

  // Populate idMap with the values from the locale's payments.ftl file
  for (const line of paymentsFtlContentEn.split('\n')) {
    const id = getMapKey(line, currentId);
    if (id && idMap.has(id)) {
      idMap.set(id, getFtlValue(line));
    }

    if (isNextFtlId(line)) {
      currentId = getFtlId(line);
    } else {
      currentId = '';
    }
  }

  return idMap;
}

async function populateNextFtlIdMap(baseDir: string) {
  const idMap = new Map<string, number>();
  const paymentsFtlContentEn = await getPaymentsFile(`${baseDir}/en`);

  let currentId = '';
  for (const line of paymentsFtlContentEn.split('\n')) {
    const id = getMapKey(line, currentId);
    if (id) {
      // Note, the value of this Map are only used to identify duplicate strings
      // and are not used anywhere else in this program.
      const currentValue = idMap.get(id);
      if (currentValue) {
        idMap.set(id, currentValue + 1);
      } else {
        idMap.set(id, 1);
      }
    }
    if (isNextFtlId(line)) {
      currentId = getFtlId(line);
    } else {
      currentId = '';
    }
  }

  return idMap;
}

async function createTemplatePaymentsNextFtl(baseDir: string) {
  const fullPath = baseDir + '/en';
  const paymentsFtlContentEn = await getPaymentsFile(fullPath);
  return createPaymentsNextFtl(paymentsFtlContentEn, setEmptyLine);
}

async function init() {
  const baseDir = path.resolve(__dirname, '../../../public/locales');

  // Create template map and template file from en/payments.ftl
  // Note: en/payments.ftl is a concatenation of all ftl files used in SP3.0
  nextFtlIdMap = await populateNextFtlIdMap(baseDir);
  templatePaymentsNextFtl = await createTemplatePaymentsNextFtl(baseDir);

  // Create payments-next.ftl for each locale in `public/locales`
  for await (const dir of localeDirectoryGen(baseDir)) {
    await convertLocaleToNext(dir);
  }

  await writeFile(
    path.resolve(__dirname, 'report.txt'),
    convertReport.join('\n'),
    { encoding: 'utf8' }
  );

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
