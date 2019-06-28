/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import RecoveryCode from 'models/recovery-code';

describe('models/recovery-code', function() {
  let recoveryCode;
  const opts = {
    code: '00110001',
  };

  beforeEach(function() {
    recoveryCode = new RecoveryCode(opts);
  });

  describe('create', function() {
    it('correctly sets model properties', function() {
      assert.deepEqual(recoveryCode.attributes, opts);
    });
  });
});
