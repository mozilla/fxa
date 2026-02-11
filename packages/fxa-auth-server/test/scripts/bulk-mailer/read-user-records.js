/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const path = require('path');
const readUserRecords = require('../../../scripts/bulk-mailer/read-user-records');

describe('read-user-records', () => {
  it('throws if user records file not found', () => {
    return readUserRecords('not-found.json').then(assert.fail, (err) => {
      assert.ok(/Cannot find module/.test(err.message));
    });
  });

  it('throws if user records file is empty', () => {
    return readUserRecords(
      path.resolve(__dirname, './fixtures/empty.json')
    ).then(assert.fail, (err) => {
      assert.include(err.message, 'Unexpected end of JSON input');
    });
  });

  it('throws if user records array is empty', () => {
    return readUserRecords(
      path.resolve(__dirname, './fixtures/empty-array.json')
    ).then(assert.fail, (err) => {
      assert.equal(err.message, 'No records found');
    });
  });

  it('returns the records otherwise', () => {
    return readUserRecords(
      path.resolve(__dirname, './fixtures/good-input.json')
    ).then((records) => {
      assert.lengthOf(records, 2);
    });
  });
});
