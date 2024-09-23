/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

import cp from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(cp.exec);

const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
};

describe('#integration - scripts/prune-oauth-authorization-codes:', () => {
  it('does not fail with no argument', function () {
    this.timeout(15000);
    return execAsync(
      'node -r esbuild-register scripts/prune-oauth-authorization-codes',
      execOptions
    );
  });

  it('does not fail with an argument', function () {
    this.timeout(15000);
    return execAsync(
      'node -r esbuild-register scripts/prune-oauth-authorization-codes --ttl 600000',
      execOptions
    );
  });
});
