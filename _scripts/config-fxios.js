#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const fs = require('fs');

const iosPath = process.env.FIREFOX_IOS_HOME;
if (!iosPath) {
  throw new Error('FIREFOX_IOS_HOME is not set');
}

// This matches lines containing `FxAConfig(` with a `server: server` param.
// We want to change this so `FxAConfig` is called with our `contentUrl`.
const regex = /FxAConfig\([^)]*server: server[^)]*\)/g;
const replaceFrom = /\bserver: server\b/;
const replaceTo = 'contentUrl: "http://localhost:3030"';

function replace() {
  const filePath = path.join(
    iosPath,
    'firefox-ios',
    'RustFxA',
    'RustFirefoxAccounts.swift'
  );
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const match = fileContent.match(regex);

  if (match) {
    const replaced = match[0].replace(replaceFrom, replaceTo);
    fileContent = fileContent.replace(match[0], replaced);

    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(
      '✅ Successfully updated the firefox-ios FxAConfig to use localhost.'
    );
  } else {
    if (fileContent.includes(replaceTo)) {
      console.log(
        'The firefox-ios FxAConfig was already updated to use localhost.'
      );
    } else {
      throw new Error(
        `Did not find the \`server\` parameter in any \`FxAConfig\` call to replace. Check ${filePath} - the code on the firefox-ios side may have changed.`
      );
    }
  }
}

replace();
