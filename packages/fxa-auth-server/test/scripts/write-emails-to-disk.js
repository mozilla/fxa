/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');
const templateNames = require('../../lib/senders/templates/_versions');
const OUTPUT_DIRECTORY =
  require('../../scripts/write-emails-to-disk').OUTPUT_DIRECTORY;

const cwd = path.resolve(__dirname, ROOT_DIR);

describe('scripts/write-emails-to-disk:', () => {
  before(() => {
    cp.execSync('node scripts/write-emails-to-disk', { cwd });
  });

  for (const template in templateNames) {
    // Ignore sms templates for now
    if (template.includes('sms')) {
      return;
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
