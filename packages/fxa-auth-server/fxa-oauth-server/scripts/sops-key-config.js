#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/sops-key-config.js [extract|insert] path/to/encrypted/config.yaml

 This script can be used to manage OpenID key configuration in a config file encrypted
 via SOPS [1], like we use for production deploys.

 When `extract` is specified, this will extract the OpenID `key`, `newKey` and `oldKey`
 config entries from the specified SOPS-encrypted config file, and write them into the
 files specified by `keyFile`, `newKeyFile` and `oldKeyFile` where they can be operated
 on locally.

 When `insert` is specified, this will write the contents of `keyFile`, `newKeyFile` and
 `oldKeyFile` into the specified SOPS-encrypted config file, where they can be committed
 to the production config store.

 [1] https://github.com/mozilla/sops

 */

//eslint-disable no-console

const fs = require('fs');
const assert = require('assert');
const config = require('../lib/config');
const yaml = require('js-yaml');
const { execFileSync } = require('child_process');

const SOPS_ITEM_KEY = 'fxa_oauth::oauth_openid_key';
const SOPS_ITEM_NEWKEY = 'fxa_oauth::oauth_openid_new_key';
const SOPS_ITEM_OLDKEY = 'fxa_oauth::oauth_openid_old_key';

function main(cb) {
  cb = cb || (() => {});

  const mode = process.argv[2];
  assert(
    mode === 'extract' || mode === 'insert',
    'Please specify either "extract" or "insert" as command-line argument'
  );

  const configFile = process.argv[3];
  assert(
    configFile,
    'Please specify SOPS config file as command-line argument'
  );

  const keyFilePath = config.get('openid.keyFile');
  const newKeyFilePath = config.get('openid.newKeyFile');
  const oldKeyFilePath = config.get('openid.oldKeyFile');

  assert(keyFilePath, 'openid.keyFile not specified');
  assert(newKeyFilePath, 'openid.newKeyFile not specified');
  assert(oldKeyFilePath, 'openid.oldKeyFile not specified');

  // Load the encrypted yaml so we can check which keys exist.
  const encryptedConfig = yaml.safeLoad(fs.readFileSync(configFile));

  if (mode === 'extract') {
    extractFileFromSOPS(
      configFile,
      encryptedConfig,
      SOPS_ITEM_KEY,
      keyFilePath
    );
    extractFileFromSOPS(
      configFile,
      encryptedConfig,
      SOPS_ITEM_NEWKEY,
      newKeyFilePath
    );
    extractFileFromSOPS(
      configFile,
      encryptedConfig,
      SOPS_ITEM_OLDKEY,
      oldKeyFilePath
    );
  } else if (mode === 'insert') {
    insertFileIntoSOPS(configFile, SOPS_ITEM_KEY, keyFilePath);
    insertFileIntoSOPS(configFile, SOPS_ITEM_NEWKEY, newKeyFilePath);
    insertFileIntoSOPS(configFile, SOPS_ITEM_OLDKEY, oldKeyFilePath);
  } else {
    assert(
      false,
      'Eh? Did we somehow mess up checking `mode` argument above??'
    );
  }
}

function extractFileFromSOPS(
  configFile,
  encryptedConfig,
  itemPath,
  outputFilePath
) {
  if (dottedLookup(encryptedConfig, itemPath)) {
    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(extractValueFromSOPS(configFile, itemPath))
    );
    console.log(`Item ${itemPath} extracted to ${outputFilePath}.`);
  } else if (fs.existsSync(outputFilePath)) {
    fs.unlinkSync(outputFilePath);
    console.log(`Item ${itemPath} does not exist, deleted ${outputFilePath}.`);
  } else {
    console.log(`Item ${itemPath} does not exist.`);
  }
}

function extractValueFromSOPS(configFile, itemPath) {
  const treePath = dottedPathToTreePath(itemPath);
  const output = execFileSync('sops', [
    '-d',
    '--extract',
    treePath,
    configFile,
  ]);
  return yaml.safeLoad(output);
}

function insertFileIntoSOPS(configFile, itemPath, inputFilePath) {
  if (fs.existsSync(inputFilePath)) {
    const value = JSON.parse(fs.readFileSync(inputFilePath));
    insertValueIntoSOPS(configFile, itemPath, value);
    console.log(`Item ${itemPath} updated from ${inputFilePath}`);
  } else {
    // I don't see a specific option to tell SOPS to delete an item,
    // so instead we explicitly set it to `null`.
    insertValueIntoSOPS(configFile, itemPath, null);
    console.log(`Item ${itemPath} cleared.`);
  }
}

function insertValueIntoSOPS(configFile, itemPath, value) {
  const treePath = dottedPathToTreePath(itemPath);
  const setValue = JSON.stringify(value);
  execFileSync('sops', ['--set', treePath + ' ' + setValue, configFile]);
}

// Walk an object to return a nested property.
// `dottedLookup(obj, "a.b.c") === obj.a.b.c`
function dottedLookup(obj, path) {
  const bits = path.split('.');
  while (bits.length > 0 && obj !== undefined) {
    obj = obj[bits.shift()];
  }
  return obj;
}

// Turns a simple dotted name like 'x.y.z' into the tree path
// syntax required by SOPS, like '["x"]["y"]["z"]'.
function dottedPathToTreePath(path) {
  return path
    .split('.')
    .map(bit => {
      return JSON.stringify([bit]);
    })
    .join('');
}

module.exports = main;

if (require.main === module) {
  main();
}
