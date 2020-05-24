/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const config = require('../../../config').getProperties();
const random = require('../../../lib/crypto/random');
const hkdf = require('../../../lib/crypto/hkdf');
const mocks = require('../../mocks');
const P = require('../../../lib/promise');
const sinon = require('sinon');

const Bundle = {
  bundle: sinon.spy(),
  unbundle: sinon.spy(),
};
const log = mocks.mockLog();
const modulePath = '../../../lib/tokens/token';

describe('Token', () => {
  describe('NODE_ENV=dev', () => {
    let Token;
    before(() => {
      config.isProduction = false;
      Token = require(modulePath)(log, config, random, P, hkdf, Bundle, null);
    });

    it('Token constructor was exported', () => {
      assert.equal(typeof Token, 'function', 'Token is function');
      assert.equal(Token.name, 'Token', 'function is called Token');
      assert.equal(Token.length, 2, 'function expects two arguments');
    });

    it('Token constructor has expected factory methods', () => {
      assert.equal(
        typeof Token.createNewToken,
        'function',
        'Token.createNewToken is function'
      );
      assert.equal(
        Token.createNewToken.length,
        2,
        'function expects two arguments'
      );
      assert.equal(
        typeof Token.createTokenFromHexData,
        'function',
        'Token.createTokenFromHexData is function'
      );
      assert.equal(
        Token.createTokenFromHexData.length,
        3,
        'function expects three arguments'
      );
    });

    it('Token constructor sets createdAt', () => {
      const now = Date.now() - 1;
      const token = new Token({}, { createdAt: now });

      assert.equal(token.createdAt, now, 'token.createdAt is correct');
    });

    it('Token constructor defaults createdAt to zero if not given a value', () => {
      const token = new Token({}, {});
      assert.equal(token.createdAt, 0, 'token.createdAt is correct');
    });

    it('Token.createNewToken defaults createdAt to the current time', () => {
      const now = Date.now();
      return Token.createNewToken(Token, {}).then((token) => {
        assert.ok(
          token.createdAt >= now && token.createdAt <= Date.now(),
          'token.createdAt seems correct'
        );
      });
    });

    it('Token.createNewToken ignores an override for createdAt', () => {
      const now = Date.now() - 1;
      return Token.createNewToken(Token, { createdAt: now }).then((token) => {
        assert.notEqual(token.createdAt, now, 'token.createdAt is new');
      });
    });

    it('Token.createNewToken ignores a negative value for createdAt', () => {
      const now = Date.now();
      const notNow = -now;
      return Token.createNewToken(Token, { createdAt: notNow }).then(
        (token) => {
          assert.ok(
            token.createdAt >= now && token.createdAt <= Date.now(),
            'token.createdAt seems correct'
          );
        }
      );
    });

    it('Token.createNewToken ignores a createdAt timestamp in the future', () => {
      const now = Date.now();
      const notNow = Date.now() + 1000;
      return Token.createNewToken(Token, { createdAt: notNow }).then(
        (token) => {
          assert.ok(
            token.createdAt >= now && token.createdAt <= Date.now(),
            'token.createdAt seems correct'
          );
        }
      );
    });

    it('Token.createTokenFromHexData accepts a value for createdAt', () => {
      const now = Date.now() - 20;
      return Token.createTokenFromHexData(Token, 'ABCD', {
        createdAt: now,
      }).then((token) => {
        assert.equal(token.createdAt, now, 'token.createdAt is correct');
      });
    });

    it('Token.createTokenFromHexData defaults to zero if not given a value for createdAt', () => {
      return Token.createTokenFromHexData(Token, 'ABCD', {
        other: 'data',
      }).then((token) => {
        assert.equal(token.createdAt, 0, 'token.createdAt is correct');
      });
    });
  });

  describe('NODE_ENV=prod', () => {
    let Token;
    before(() => {
      config.isProduction = true;
      Token = require(modulePath)(log, config, random, P, hkdf, Bundle, null);
    });

    it('Token.createNewToken defaults createdAt to the current time', () => {
      const now = Date.now();
      return Token.createNewToken(Token, {}).then((token) => {
        assert.ok(
          token.createdAt >= now && token.createdAt <= Date.now(),
          'token.createdAt seems correct'
        );
      });
    });

    it('Token.createNewToken does not accept an override for createdAt', () => {
      const now = Date.now() - 1;
      return Token.createNewToken(Token, { createdAt: now }).then((token) => {
        assert.ok(
          token.createdAt > now && token.createdAt <= Date.now(),
          'token.createdAt seems correct'
        );
      });
    });

    it('Token.createTokenFromHexData accepts a value for createdAt', () => {
      const now = Date.now() - 20;
      return Token.createTokenFromHexData(Token, 'ABCD', {
        createdAt: now,
      }).then((token) => {
        assert.equal(token.createdAt, now, 'token.createdAt is correct');
      });
    });

    it('Token.createTokenFromHexData defaults to zero if not given a value for createdAt', () => {
      return Token.createTokenFromHexData(Token, 'ABCD', {
        other: 'data',
      }).then((token) => {
        assert.equal(token.createdAt, 0, 'token.createdAt is correct');
      });
    });
  });
});
