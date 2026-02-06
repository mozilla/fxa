/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

const config = require('../../config').default.getProperties();
const mocks = require('../../test/mocks');
const log = mocks.mockLog();

describe('Token', () => {
  describe('NODE_ENV=dev', () => {
    let Token: any;
    beforeAll(() => {
      config.isProduction = false;
      Token = require('./token')(log, config);
    });

    it('Token constructor was exported', () => {
      expect(typeof Token).toBe('function');
      expect(Token.name).toBe('Token');
      expect(Token.length).toBe(2);
    });

    it('Token constructor has expected factory methods', () => {
      expect(typeof Token.createNewToken).toBe('function');
      expect(Token.createNewToken.length).toBe(2);
      expect(typeof Token.createTokenFromHexData).toBe('function');
      expect(Token.createTokenFromHexData.length).toBe(3);
    });

    it('Token constructor sets createdAt', () => {
      const now = Date.now() - 1;
      const token = new Token({}, { createdAt: now });
      expect(token.createdAt).toBe(now);
    });

    it('Token constructor defaults createdAt to zero if not given a value', () => {
      const token = new Token({}, {});
      expect(token.createdAt).toBe(0);
    });

    it('Token.createNewToken defaults createdAt to the current time', () => {
      const now = Date.now();
      return Token.createNewToken(Token, {}).then((token: any) => {
        expect(token.createdAt >= now && token.createdAt <= Date.now()).toBeTruthy();
      });
    });

    it('Token.createNewToken ignores an override for createdAt', () => {
      const now = Date.now() - 1;
      return Token.createNewToken(Token, { createdAt: now }).then((token: any) => {
        expect(token.createdAt).not.toBe(now);
      });
    });

    it('Token.createNewToken ignores a negative value for createdAt', () => {
      const now = Date.now();
      const notNow = -now;
      return Token.createNewToken(Token, { createdAt: notNow }).then(
        (token: any) => {
          expect(token.createdAt >= now && token.createdAt <= Date.now()).toBeTruthy();
        }
      );
    });

    it('Token.createNewToken ignores a createdAt timestamp in the future', () => {
      const now = Date.now();
      const notNow = Date.now() + 1000;
      return Token.createNewToken(Token, { createdAt: notNow }).then(
        (token: any) => {
          expect(token.createdAt >= now && token.createdAt <= Date.now()).toBeTruthy();
        }
      );
    });

    it('Token.createTokenFromHexData accepts a value for createdAt', () => {
      const now = Date.now() - 20;
      return Token.createTokenFromHexData(Token, 'ABCD', {
        createdAt: now,
      }).then((token: any) => {
        expect(token.createdAt).toBe(now);
      });
    });

    it('Token.createTokenFromHexData defaults to zero if not given a value for createdAt', () => {
      return Token.createTokenFromHexData(Token, 'ABCD', {
        other: 'data',
      }).then((token: any) => {
        expect(token.createdAt).toBe(0);
      });
    });
  });

  describe('NODE_ENV=prod', () => {
    let Token: any;
    beforeAll(() => {
      config.isProduction = true;
      Token = require('./token')(log, config);
    });

    it('Token.createNewToken defaults createdAt to the current time', () => {
      const now = Date.now();
      return Token.createNewToken(Token, {}).then((token: any) => {
        expect(token.createdAt >= now && token.createdAt <= Date.now()).toBeTruthy();
      });
    });

    it('Token.createNewToken does not accept an override for createdAt', () => {
      const now = Date.now() - 1;
      return Token.createNewToken(Token, { createdAt: now }).then((token: any) => {
        expect(token.createdAt > now && token.createdAt <= Date.now()).toBeTruthy();
      });
    });

    it('Token.createTokenFromHexData accepts a value for createdAt', () => {
      const now = Date.now() - 20;
      return Token.createTokenFromHexData(Token, 'ABCD', {
        createdAt: now,
      }).then((token: any) => {
        expect(token.createdAt).toBe(now);
      });
    });

    it('Token.createTokenFromHexData defaults to zero if not given a value for createdAt', () => {
      return Token.createTokenFromHexData(Token, 'ABCD', {
        other: 'data',
      }).then((token: any) => {
        expect(token.createdAt).toBe(0);
      });
    });
  });
});
