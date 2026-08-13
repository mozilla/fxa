/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('assert');
const astUtils = require('../lib/util/ast');

function callOf(name, property) {
  const identifier = { type: 'Identifier', name, range: [0, 10] };
  const callee = property
    ? {
        type: 'MemberExpression',
        object: identifier,
        property: { name: property },
      }
    : identifier;

  return { type: 'CallExpression', callee };
}

describe('util/ast', () => {
  describe('isTestCase', () => {
    it('matches a call expression named it', () => {
      assert.strictEqual(astUtils.isTestCase(callOf('it')), true);
    });

    it('matches it.only', () => {
      assert.strictEqual(astUtils.isTestCase(callOf('it', 'only')), true);
    });

    it('rejects a call expression with an unknown name', () => {
      assert.strictEqual(astUtils.isTestCase(callOf('notATest')), false);
    });

    it('rejects a node that is not a call expression', () => {
      assert.strictEqual(
        astUtils.isTestCase({ type: 'Identifier', name: 'it' }),
        false
      );
    });

    it('rejects a missing node', () => {
      assert.strictEqual(astUtils.isTestCase(null), false);
    });
  });

  describe('isDescribe', () => {
    it('matches describe', () => {
      assert.strictEqual(astUtils.isDescribe(callOf('describe'), []), true);
    });

    it('matches an additional suite name', () => {
      assert.strictEqual(
        astUtils.isDescribe(callOf('mySuite'), ['mySuite']),
        true
      );
    });

    it('rejects a call expression with an unknown name', () => {
      assert.strictEqual(astUtils.isDescribe(callOf('notASuite'), []), false);
    });

    it('rejects a node that is not a call expression', () => {
      assert.strictEqual(
        astUtils.isDescribe({ type: 'Identifier', name: 'describe' }, []),
        false
      );
    });

    it('rejects a callee with no name when no suite names are given', () => {
      const node = callOf('describe');
      node.callee = { type: 'CallExpression' };

      assert.strictEqual(astUtils.isDescribe(node), false);
    });
  });

  describe('isHookCall', () => {
    it('matches beforeEach', () => {
      assert.strictEqual(astUtils.isHookCall(callOf('beforeEach')), true);
    });

    it('rejects a hook name that is not called', () => {
      assert.strictEqual(
        astUtils.isHookCall({ type: 'Identifier', name: 'beforeEach' }),
        false
      );
    });
  });

  describe('isMochaFunctionCall', () => {
    // The scope shape mirrors the parts of an ESLint scope that findReference reads.
    function scopeWith(defs) {
      return {
        references: [
          { identifier: { range: [100, 110] }, resolved: { defs: [] } },
          { identifier: { range: [0, 10] }, resolved: { defs } },
        ],
      };
    }

    it('matches a test case that is not shadowed', () => {
      assert.strictEqual(
        astUtils.isMochaFunctionCall(callOf('it'), scopeWith([])),
        true
      );
    });

    it('rejects a test case whose name is shadowed', () => {
      assert.strictEqual(
        astUtils.isMochaFunctionCall(
          callOf('it'),
          scopeWith([{ type: 'Variable' }])
        ),
        false
      );
    });
  });
});
