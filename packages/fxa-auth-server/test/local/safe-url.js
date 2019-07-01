/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const mocks = require('../mocks');

const SOME_DISALLOWED_GRAPHEMES = [
  '\t',
  '\n',
  '\r',
  ' ',
  '"',
  '&',
  "'",
  '/',
  ':',
  ';',
  '=',
  '?',
  '@',
  '\\',
  '~',
  'ß',
  'π',
  '💩',
];

describe('require:', () => {
  let log, SafeUrl;

  beforeEach(() => {
    log = mocks.mockLog();
    SafeUrl = require('../../lib/safe-url')(log);
  });

  it('returned the expected interface', () => {
    assert.equal(typeof SafeUrl, 'function');
    assert.equal(SafeUrl.length, 2);
  });

  describe('instantiate:', () => {
    let safeUrl;

    beforeEach(() => {
      safeUrl = new SafeUrl('/foo/:bar', 'baz');
    });

    it('returned the expected interface', () => {
      assert.equal(typeof safeUrl.render, 'function');
      assert.equal(safeUrl.render.length, 0);
    });

    it('interpolates correctly', () => {
      assert.equal(safeUrl.render({ bar: 'wibble' }), '/foo/wibble');
    });

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0);
    });

    it('logs an error and throws when param is missing', () => {
      let threw = false;
      try {
        safeUrl.render({});
      } catch (err) {
        threw = true;
        assert.equal(err.output.payload.op, 'safeUrl.params.mismatch');
        assert.deepEqual(err.output.payload.data, {
          expected: ['bar'],
          keys: [],
        });
      }
      assert.equal(threw, true);
      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0], 'safeUrl.params.mismatch');
      assert.deepEqual(log.error.args[0][1], {
        keys: [],
        expected: ['bar'],
        caller: 'baz',
      });
    });

    it('logs an error and throws when param has wrong key', () => {
      assert.throws(() => safeUrl.render({ qux: 'wibble' }));
      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0], 'safeUrl.params.unexpected');
      assert.deepEqual(log.error.args[0][1], {
        key: 'qux',
        expected: ['bar'],
        caller: 'baz',
      });
    });

    it('logs an error and throws when param is empty string', () => {
      let threw = false;
      try {
        safeUrl.render({ bar: '' });
      } catch (err) {
        threw = true;
        assert.equal(err.output.payload.op, 'safeUrl.bad');
        assert.deepEqual(err.output.payload.data, {
          location: 'paramVal',
          key: 'bar',
          value: '',
        });
      }
      assert.equal(threw, true);
      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0], 'safeUrl.bad');
      assert.deepEqual(log.error.args[0][1], {
        location: 'paramVal',
        key: 'bar',
        value: '',
        caller: 'baz',
      });
    });

    it('logs an error and throws when param is object', () => {
      assert.throws(() => safeUrl.render({ bar: {} }));
      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0], 'safeUrl.bad');
      assert.deepEqual(log.error.args[0][1], {
        location: 'paramVal',
        key: 'bar',
        value: {},
        caller: 'baz',
      });
    });

    SOME_DISALLOWED_GRAPHEMES.forEach(grapheme => {
      it(`logs an error and throws when param contains ${grapheme}`, () => {
        assert.throws(() => safeUrl.render({ bar: `wibble${grapheme}` }));
        assert.equal(log.error.callCount, 1);
        assert.equal(log.error.args[0][0], 'safeUrl.unsafe');
        assert.deepEqual(log.error.args[0][1], {
          location: 'paramVal',
          key: 'bar',
          value: `wibble${grapheme}`,
          caller: 'baz',
        });
      });
    });

    it('logs an error and throws for bad query keys', () => {
      let threw = false;
      try {
        safeUrl.render({ bar: 'baz' }, { '💩': 'bar' });
      } catch (err) {
        threw = true;
        assert.equal(err.output.payload.op, 'safeUrl.unsafe');
        assert.deepEqual(err.output.payload.data, {
          location: 'queryKey',
          key: '💩',
          value: '💩',
        });
      }
      assert.equal(threw, true);
      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0], 'safeUrl.unsafe');
      assert.deepEqual(log.error.args[0][1], {
        location: 'queryKey',
        key: '💩',
        value: '💩',
        caller: 'baz',
      });
    });

    it('logs an error and throws for bad query values', () => {
      assert.throws(() => safeUrl.render({ bar: 'baz' }, { bar: '💩' }));
      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0], 'safeUrl.unsafe');
      assert.deepEqual(log.error.args[0][1], {
        location: 'queryVal',
        key: 'bar',
        value: '💩',
        caller: 'baz',
      });
    });
  });

  describe('instantiate with two params', () => {
    let safeUrl;

    beforeEach(() => {
      safeUrl = new SafeUrl('/foo/:bar/:baz');
    });

    it('interpolates correctly', () => {
      assert.equal(
        safeUrl.render({ bar: 'wibble', baz: 'blee' }),
        '/foo/wibble/blee'
      );
    });
  });
});
