/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const { assert } = require('chai');
const constants = require('../../lib/constants');
describe('constants', () => {
  it('constants exports DATABASE_NAME fxa', () => {
    constants.DATABASE_NAME = 'test';
    assert.equal(constants.DATABASE_NAME, 'fxa');
  });
});
