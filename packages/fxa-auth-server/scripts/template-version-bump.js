#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Checks git status for template changes and bumps version numbers
// accordingly. Note that deletions do not cause version numbers to
// be deleted, to ensure that we have sane metrics in the cases where
// a deleted template is reinstated by some later commit or only one
// format of a template is deleted.

'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const TEMPLATE_DIR = 'lib/senders/templates';
const VERSIONS_FILE = '_versions.json';
const IGNORE = new Set([
  VERSIONS_FILE,
  '_pending.txt',
  'index.js',
  'README.md',
]);
const DEDUP = {};

const templates = require(`../${TEMPLATE_DIR}`);
const versions = require(`../${TEMPLATE_DIR}/${VERSIONS_FILE}`);

const stagedTemplates = cp
  .execSync('git status --porcelain', { cwd: ROOT_DIR, encoding: 'utf8' })
  .split('\n')
  .filter(line =>
    line.match(`^[AM]. packages/fxa-auth-server/${TEMPLATE_DIR}/\\w+`)
  )
  .map(line => {
    const parts = line.split(' ');
    return parts[2] || parts[1];
  })
  .map(templatePath => templatePath.split('/')[5])
  .filter(fileName => !IGNORE.has(fileName))
  .map(fileName =>
    templates.generateTemplateName(
      fileName.substr(0, fileName.lastIndexOf('.'))
    )
  )
  .filter(templateName => {
    if (DEDUP[templateName]) {
      return false;
    }

    DEDUP[templateName] = true;
    return true;
  });

if (stagedTemplates.length === 0) {
  if (process.argc === 2 || process.argv[2] !== '--silent') {
    console.log('I see no work. Did you remember to `git add` your changes?');
  }
} else {
  stagedTemplates.forEach(templateName => {
    const version = versions[templateName];
    if (version) {
      const type = typeof version;
      if (type !== 'number' || isNaN(version)) {
        console.log(
          `Bad version "${version}" {${type}} for template "${templateName}"`
        );
        process.exit(1);
      }
      versions[templateName] = version + 1;
    } else {
      versions[templateName] = 1;
    }
  });

  fs.writeFileSync(
    path.join(`${ROOT_DIR}/${TEMPLATE_DIR}/${VERSIONS_FILE}`),
    JSON.stringify(versions, null, '  ')
  );
}
