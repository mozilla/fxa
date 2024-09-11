/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';

describe('require:', () => {
  let time;

  beforeEach(() => {
    time = require('../../lib/time');
  });

  it('returned the expected interface', () => {
    assert.equal(typeof time.startOfMinute, 'function');
    assert.equal(time.startOfMinute.length, 1);
  });

  describe('start of minute:', () => {
    let date;

    beforeEach(() => {
      date = new Date('2018-10-10T10:10Z');
    });

    it('returns the correct time', () => {
      assert.equal(time.startOfMinute(date), '2018-10-10T10:10:00Z');
    });
  });

  describe('end of minute:', () => {
    let date;

    beforeEach(() => {
      date = new Date('2018-10-10T10:10:59.999Z');
    });

    it('returns the correct time', () => {
      assert.equal(time.startOfMinute(date), '2018-10-10T10:10:00Z');
    });
  });

  describe('with padding:', () => {
    let date;

    beforeEach(() => {
      date = new Date('2018-09-09T09:09Z');
    });

    it('returns the correct time', () => {
      assert.equal(time.startOfMinute(date), '2018-09-09T09:09:00Z');
    });
  });

  describe('non-UTC timezone:', () => {
    let date;

    beforeEach(() => {
      date = new Date('2018-01-01T00:00+01:00');
    });

    it('returns the correct time', () => {
      assert.equal(time.startOfMinute(date), '2017-12-31T23:00:00Z');
    });
  });
});
