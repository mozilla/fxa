/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const { assert } = require('chai');

describe('error', () => {
  it('error module', () => {
    const error = require('../../lib/error');
    assert.isFunction(error);

    const duplicate = error.duplicate();
    assert.isObject(duplicate);
    assert(duplicate instanceof error, 'is an instance of error');
    assert.equal(duplicate.code, 409);
    assert.equal(duplicate.errno, 101);
    assert.equal(duplicate.message, 'Record already exists');
    assert.equal(duplicate.error, 'Conflict');
    assert.equal(duplicate.toString(), 'Error: Record already exists');

    const notFound = error.notFound();
    assert.isObject(notFound);
    assert(notFound instanceof error, 'is an instance of error');
    assert.equal(notFound.code, 404);
    assert.equal(notFound.errno, 116);
    assert.equal(notFound.message, 'Not Found');
    assert.equal(notFound.error, 'Not Found');
    assert.equal(notFound.toString(), 'Error: Not Found');

    const err = new Error('Something broke.');
    err.code = 'ER_QUERY_INTERRUPTED';
    err.errno = 1317;
    const wrap = error.wrap(err);
    assert.isObject(wrap);
    assert(wrap instanceof error, 'is an instance of error');
    assert.equal(wrap.code, 500);
    assert.equal(wrap.errno, 1317);
    assert.equal(wrap.message, 'ER_QUERY_INTERRUPTED');
    assert.equal(wrap.error, 'Internal Server Error');
    assert.equal(wrap.toString(), 'Error: ER_QUERY_INTERRUPTED');
  });
});
