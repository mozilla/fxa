/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const dbUtils = require('../../lib/db/util');
const { assert } = require('chai');
const P = require('bluebird');

describe('utils', () => {
  it('createHashScrypt', () => {
    const input = 'somethingcool';
    return dbUtils.createHashScrypt(input).then((result) => {
      assert.ok(result.hash, 'hash exists');
      assert.ok(result.salt, 'salt exists');
      assert.lengthOf(result.hash, 32);
      assert.lengthOf(result.salt, 32);
    });
  });

  describe('compareHashScrypt', () => {
    const inputA = 'thing1',
      inputB = 'thing2';
    let resultA, resultB;

    before(() => {
      return P.all([
        dbUtils.createHashScrypt(inputA),
        dbUtils.createHashScrypt(inputB),
      ]).spread((hashA, hashB) => {
        resultA = hashA;
        resultB = hashB;
      });
    });

    it('should fail for different input', () => {
      return dbUtils
        .compareHashScrypt(inputA, resultB.hash, resultB.salt)
        .then((result) => {
          assert.isFalse(result);
          return dbUtils.compareHashScrypt(inputB, resultA.hash, resultA.salt);
        })
        .then((result) => {
          assert.isFalse(result);
        });
    });

    it('should succeed for same input', () => {
      return dbUtils
        .compareHashScrypt(inputA, resultA.hash, resultA.salt)
        .then((result) => {
          assert.isTrue(result);
        });
    });
  });

  describe('generateRecoveryCodes', () => {
    const codeLength = 10,
      codeCount = 5;
    let codes;
    before(() => {
      return dbUtils
        .generateRecoveryCodes(codeCount, codeLength)
        .then((result) => (codes = result));
    });

    it('should generate correct count of codes', () => {
      assert.lengthOf(codes, codeCount);
    });

    it('should generate correct length of code', () => {
      codes.forEach((code) => {
        assert.lengthOf(code, codeLength);
      });
    });

    it('should generate code in keyspace', () => {
      const reg = /[a-z0-9]/;
      codes.forEach((code) => {
        assert.match(code, reg);
      });
    });
  });

  describe('aggregateNameValuePairs', () => {
    const ONE = Buffer.from('one');
    const TWO = Buffer.from('two');
    const THREE = Buffer.from('three');

    it('should correctly handle an empty result set', () => {
      assert.deepEqual(
        dbUtils.aggregateNameValuePairs([], 'id', 'name', 'value', 'result'),
        []
      );
    });

    it('should aggregate based on id', () => {
      assert.deepEqual(
        dbUtils.aggregateNameValuePairs(
          [
            { id: ONE, name: 'name1', value: 'value1' },
            { id: ONE, name: 'name2', value: 'value2' },
            { id: TWO, name: 'name1', value: 'value1' },
          ],
          'id',
          'name',
          'value',
          'result'
        ),
        [
          { id: ONE, result: { name1: 'value1', name2: 'value2' } },
          { id: TWO, result: { name1: 'value1' } },
        ]
      );
    });

    it('should allow custom column names', () => {
      assert.deepEqual(
        dbUtils.aggregateNameValuePairs(
          [
            { MyID: ONE, TheName: 'name1', ItsValue: 'value1' },
            { MyID: ONE, TheName: 'name2', ItsValue: 'value2' },
            { MyID: TWO, TheName: 'name1', ItsValue: 'value1' },
          ],
          'MyID',
          'TheName',
          'ItsValue',
          'AggregateResult'
        ),
        [
          { MyID: ONE, AggregateResult: { name1: 'value1', name2: 'value2' } },
          { MyID: TWO, AggregateResult: { name1: 'value1' } },
        ]
      );
    });

    it('should aggregate NULL name/value pairs as an empty object', () => {
      assert.deepEqual(
        dbUtils.aggregateNameValuePairs(
          [
            { id: ONE, name: 'name1', value: 'value1' },
            { id: ONE, name: 'name2', value: 'value2' },
            { id: TWO, name: null, value: null },
            { id: THREE, name: 'name1', value: 'value1' },
          ],
          'id',
          'name',
          'value',
          'result'
        ),
        [
          { id: ONE, result: { name1: 'value1', name2: 'value2' } },
          { id: TWO, result: {} },
          { id: THREE, result: { name1: 'value1' } },
        ]
      );
    });

    it('should copy across additional columns unaggregated', () => {
      assert.deepEqual(
        dbUtils.aggregateNameValuePairs(
          [
            { id: ONE, extra: 'value', name: 'name1', value: 'value1' },
            { id: ONE, extra: 'value', name: 'name2', value: 'value2' },
            { id: TWO, extra: 'another-value', name: 'name1', value: 'value1' },
          ],
          'id',
          'name',
          'value',
          'result'
        ),
        [
          {
            id: ONE,
            extra: 'value',
            result: { name1: 'value1', name2: 'value2' },
          },
          { id: TWO, extra: 'another-value', result: { name1: 'value1' } },
        ]
      );
    });

    it('should correct handle null ids from outer joins', () => {
      // Test NULL in multiple different positions.
      assert.deepEqual(
        dbUtils.aggregateNameValuePairs(
          [
            { uid: ONE, deviceId: TWO, name: 'name1', value: 'value1' },
            { uid: ONE, deviceId: TWO, name: 'name2', value: 'value2' },
            { uid: ONE, deviceId: THREE, name: 'name1', value: 'value1' },
            { uid: ONE, deviceId: null, name: null, value: null },
          ],
          'deviceId',
          'name',
          'value',
          'result'
        ),
        [
          {
            uid: ONE,
            deviceId: TWO,
            result: { name1: 'value1', name2: 'value2' },
          },
          { uid: ONE, deviceId: THREE, result: { name1: 'value1' } },
          { uid: ONE, deviceId: null, result: null },
        ]
      );
      assert.deepEqual(
        dbUtils.aggregateNameValuePairs(
          [
            { uid: ONE, deviceId: TWO, name: 'name1', value: 'value1' },
            { uid: ONE, deviceId: TWO, name: 'name2', value: 'value2' },
            { uid: ONE, deviceId: null, name: null, value: null },
            { uid: ONE, deviceId: THREE, name: 'name1', value: 'value1' },
          ],
          'deviceId',
          'name',
          'value',
          'result'
        ),
        [
          {
            uid: ONE,
            deviceId: TWO,
            result: { name1: 'value1', name2: 'value2' },
          },
          { uid: ONE, deviceId: null, result: null },
          { uid: ONE, deviceId: THREE, result: { name1: 'value1' } },
        ]
      );
      assert.deepEqual(
        dbUtils.aggregateNameValuePairs(
          [
            { uid: ONE, deviceId: null, name: null, value: null },
            { uid: ONE, deviceId: TWO, name: 'name1', value: 'value1' },
            { uid: ONE, deviceId: TWO, name: 'name2', value: 'value2' },
            { uid: ONE, deviceId: THREE, name: 'name1', value: 'value1' },
          ],
          'deviceId',
          'name',
          'value',
          'result'
        ),
        [
          { uid: ONE, deviceId: null, result: null },
          {
            uid: ONE,
            deviceId: TWO,
            result: { name1: 'value1', name2: 'value2' },
          },
          { uid: ONE, deviceId: THREE, result: { name1: 'value1' } },
        ]
      );
      assert.deepEqual(
        dbUtils.aggregateNameValuePairs(
          [
            { uid: ONE, deviceId: null, name: null, value: null },
            { uid: ONE, deviceId: TWO, name: 'name1', value: 'value1' },
            { uid: ONE, deviceId: TWO, name: 'name2', value: 'value2' },
            { uid: ONE, deviceId: null, name: null, value: null },
            { uid: ONE, deviceId: null, name: null, value: null },
            { uid: ONE, deviceId: THREE, name: 'name1', value: 'value1' },
            { uid: ONE, deviceId: null, name: null, value: null },
            { uid: ONE, deviceId: null, name: null, value: null },
          ],
          'deviceId',
          'name',
          'value',
          'result'
        ),
        [
          { uid: ONE, deviceId: null, result: null },
          {
            uid: ONE,
            deviceId: TWO,
            result: { name1: 'value1', name2: 'value2' },
          },
          { uid: ONE, deviceId: null, result: null },
          { uid: ONE, deviceId: null, result: null },
          { uid: ONE, deviceId: THREE, result: { name1: 'value1' } },
          { uid: ONE, deviceId: null, result: null },
          { uid: ONE, deviceId: null, result: null },
        ]
      );
    });
  });
});
