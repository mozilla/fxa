/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';

import * as lib from '@fxa/shared/metrics/amplitude';
import amplitude, * as shim from '../../metrics/amplitude';

describe('metrics/amplitude shim', () => {
  it('re-exports the default object from @fxa/shared/metrics/amplitude', () => {
    assert.strictEqual(amplitude, lib.default);
    assert.isFunction(amplitude.validate);
  });

  it('re-exports the named amplitude object', () => {
    assert.strictEqual(shim.amplitude, lib.amplitude);
  });
});
