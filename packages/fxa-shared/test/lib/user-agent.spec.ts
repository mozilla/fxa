/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';

import * as lib from '@fxa/shared/user-agent';
import safeUserAgent, * as shim from '../../lib/user-agent';

describe('lib/user-agent shim', () => {
  it('re-exports the default object from @fxa/shared/user-agent', () => {
    assert.strictEqual(safeUserAgent, lib.userAgent);
    assert.isFunction(safeUserAgent.safeName);
    assert.isFunction(safeUserAgent.safeVersion);
  });

  it('re-exports the named functions', () => {
    assert.strictEqual(shim.parseToScalars, lib.parseToScalars);
    assert.strictEqual(shim.platformFromOS, lib.platformFromOS);
  });
});
