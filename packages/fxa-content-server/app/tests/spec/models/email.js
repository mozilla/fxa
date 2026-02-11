/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Email from 'models/email';

describe('models/email', function () {
  let email;
  const emailOpts = {
    email: 'some@email.com',
    isPrimary: false,
    verified: false,
  };

  beforeEach(function () {
    email = new Email(emailOpts);
  });

  describe('create', function () {
    it('correctly sets model properties', function () {
      assert.deepEqual(email.attributes, emailOpts);
    });
  });
});
