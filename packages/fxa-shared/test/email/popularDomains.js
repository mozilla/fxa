/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

describe('email/popularDomains:', () => {
  let popularDomains;

  before(() => {
    popularDomains = require('../../email/popularDomains.json');
  });

  it('returns an array of 20 domains', () => {
    assert.isArray(popularDomains);
    assert.lengthOf(popularDomains, 20);
  });

  it('includes some well-known domains', () => {
    assert.isAtLeast(popularDomains.indexOf('gmail.com'), 0);
    assert.isAtLeast(popularDomains.indexOf('hotmail.com'), 0);
    assert.isAtLeast(popularDomains.indexOf('yahoo.com'), 0);
  });
});
