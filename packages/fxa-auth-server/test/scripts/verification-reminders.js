/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const cp = require('child_process');
const Promise = require(`${ROOT_DIR}/lib/promise`);
const path = require('path');

cp.execAsync = Promise.promisify(cp.exec);

const cwd = path.resolve(__dirname, ROOT_DIR);

describe('scripts/verification-reminders:', () => {
  it('does not fail', () => {
    return cp.execAsync('node scripts/verification-reminders', { cwd });
  });
});
