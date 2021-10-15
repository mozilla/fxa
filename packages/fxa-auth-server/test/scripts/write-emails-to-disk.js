/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');
const templateNames = require('../../lib/senders/templates/_versions.json');
const OUTPUT_DIRECTORY =
  require('../../scripts/write-emails-to-disk').OUTPUT_DIRECTORY;

const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: {
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
  },
  stdio: 'ignore',
};

describe('scripts/write-emails-to-disk:', () => {
  before(() => {
    cp.execSync(
      'node -r esbuild-register scripts/write-emails-to-disk',
      execOptions
    );
  });

  for (const template of Object.keys(templateNames)) {
    // Ignore sms templates for now
    if (template.includes('sms')) {
      continue;
    }

    // Ignore templates with the plural form because they break
    // the naming convention.
    if (template.includes('subscriptions')) {
      continue;
    }

    it(`writes ${template} email html`, async () => {
      assert.equal(
        fs.existsSync(path.join(OUTPUT_DIRECTORY, `${template}.html`)),
        true
      );
    });

    it(`writes ${template} email txt`, async () => {
      assert.equal(
        fs.existsSync(path.join(OUTPUT_DIRECTORY, `${template}.txt`)),
        true
      );
    });
  }
});
