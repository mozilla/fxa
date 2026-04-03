/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import * as lib from './lib';
import { SearchResultIdentity } from './lib';
import { AppError, ERRNO } from '@fxa/accounts/errors';

describe('Recorded Future credentials search and reset script lib', () => {
  const payload = { domain: 'login.example.com', limit: 10 };
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('credentials search function', () => {
    let client: { POST: sinon.SinonStub };

    beforeEach(() => {
      client = { POST: sandbox.stub() };
    });

    it('returns the data on success', async () => {
      const data = { next_offset: 'letsgoooo' };
      client.POST.resolves({ data });
      const searchFn = lib.createCredentialsSearchFn(client as any);
      const res = await searchFn(payload);

      sinon.assert.calledOnceWithExactly(
        client.POST,
        '/identity/credentials/search',
        { body: payload }
      );
      expect(res).toEqual(data);
    });

    it('throws the API returned error', async () => {
      const error = 'oops';
      client.POST.resolves({ error });
      const searchFn = lib.createCredentialsSearchFn(client as any);

      try {
        await searchFn(payload);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.message).toContain('oops');
      }
    });
  });

  describe('fetch all credentials search results function', () => {
    let client: { POST: sinon.SinonStub };

    beforeEach(() => {
      client = { POST: sandbox.stub() };
    });

    it('fetches all the paginated results', async () => {
      const firstResponse = {
        identities: ['foo', 'wibble'],
        count: payload.limit,
        next_offset: 'MOAR',
      };
      const secondResponse = {
        identities: ['quux', 'bar'],
        count: payload.limit - 1,
        next_offset: 'MISLEADING_MOAR',
      };
      client.POST.onFirstCall()
        .resolves({ data: firstResponse })
        .onSecondCall()
        .resolves({ data: secondResponse });
      const searchFn = lib.createCredentialsSearchFn(client as any);

      const res = await lib.fetchAllCredentialSearchResults(searchFn, payload);

      sinon.assert.calledTwice(client.POST);
      sinon.assert.calledWith(client.POST, '/identity/credentials/search', {
        body: payload,
      });
      sinon.assert.calledWith(client.POST, '/identity/credentials/search', {
        body: { ...payload, offset: firstResponse.next_offset },
      });
      expect(res).toEqual([
        ...firstResponse.identities,
        ...secondResponse.identities,
      ] as unknown as SearchResultIdentity[]);
    });
  });

  describe('find account function', () => {
    it('returns an existing account', async () => {
      const accountFn = sandbox.stub().resolves({ uid: '9001' });
      const findAccount = lib.createFindAccountFn(accountFn);
      const acct = await findAccount('quux@example.gg');

      sinon.assert.calledOnceWithExactly(accountFn, 'quux@example.gg');
      expect(acct).toEqual({ uid: '9001' } as any);
    });

    it('returns undefined when no account found', async () => {
      const accountFn = sandbox.stub().throws(AppError.unknownAccount());
      const findAccount = lib.createFindAccountFn(accountFn);

      const res = await findAccount('quux@example.gg');
      sinon.assert.calledOnceWithExactly(accountFn, 'quux@example.gg');
      expect(res).toBeUndefined();
    });

    it('re-throws errors', async () => {
      const accountFn = sandbox.stub().throws(AppError.invalidRequestBody());
      const findAccount = lib.createFindAccountFn(accountFn);

      try {
        await findAccount('quux@example.gg');
        throw new Error('should have thrown');
      } catch (err: any) {
        sinon.assert.calledOnceWithExactly(accountFn, 'quux@example.gg');
        expect(err.errno).toBe(ERRNO.INVALID_JSON);
      }
    });
  });

  describe('has totp 2fa function', () => {
    it('returns true when TOTP token exists', async () => {
      const totpTokenFn = sandbox.stub().resolves();
      const hasTotpToken = lib.createHasTotp2faFn(totpTokenFn);
      const res = await hasTotpToken({ uid: '9001' } as any);

      sinon.assert.calledOnceWithExactly(totpTokenFn, '9001');
      expect(res).toBe(true);
    });

    it('returns false when TOTP token not found', async () => {
      const totpTokenFn = sandbox.stub().rejects(AppError.totpTokenNotFound());
      const hasTotpToken = lib.createHasTotp2faFn(totpTokenFn);
      const res = await hasTotpToken({ uid: '9001' } as any);

      sinon.assert.calledOnceWithExactly(totpTokenFn, '9001');
      expect(res).toBe(false);
    });

    it('re-throws errors', async () => {
      const totpTokenFn = sandbox.stub().rejects(AppError.invalidRequestBody());
      const hasTotpToken = lib.createHasTotp2faFn(totpTokenFn);

      try {
        await hasTotpToken({ uid: '9001' } as any);
        throw new Error('should have thrown');
      } catch (err: any) {
        sinon.assert.calledOnceWithExactly(totpTokenFn, '9001');
        expect(err.errno).toBe(ERRNO.INVALID_JSON);
      }
    });
  });

  describe('credentials lookup function', () => {
    let client: { POST: sinon.SinonStub };

    beforeEach(() => {
      client = { POST: sandbox.stub() };
    });

    it('returns leaked credentials with cleartext password', async () => {
      const expected = [
        {
          subject: 'a@b.com',
          exposed_secret: {
            details: { clear_text_value: 'abc' },
            type: 'clear',
          },
        },
        {
          subject: 'fizz@bar.gg',
          exposed_secret: {
            details: { clear_text_value: 'buzz' },
            type: 'clear',
          },
        },
      ];
      const filtered = [
        {
          subject: 'a@b.com',
          exposed_secret: {
            details: { clear_text_value: 'abc' },
            type: 'clear',
          },
        },
        {
          subject: 'x@y.com',
          exposed_secret: {
            type: 'hash',
          },
        },
      ];
      client.POST.resolves({
        data: {
          identities: [
            { credentials: [expected[0], filtered[0]] },
            { credentials: [expected[1]] },
            { credentials: [filtered[1]] },
          ],
        },
      });
      const lookupFn = lib.createCredentialsLookupFn(client as any);
      const subjects = [
        { login: 'a@b.com', domain: 'quux.io' },
        { login: 'x@y.com', domain: 'quux.io' },
        { login: 'fizz@bar.gg', domain: 'quux.io' },
      ];
      const res = await lookupFn(subjects, {
        first_downloaded_gte: '2025-04-15',
      });
      sinon.assert.calledOnceWithExactly(
        client.POST,
        '/identity/credentials/lookup',
        {
          body: {
            subjects_login: subjects,
            filter: { first_downloaded_gte: '2025-04-15' },
          },
        }
      );
      expect(res).toEqual(expected);
    });

    it('limits the subjects login in API call', async () => {
      client.POST.resolves({ data: { identities: [] } });
      const lookupFn = lib.createCredentialsLookupFn(client as any);
      const subjects = Array(555);
      await lookupFn(subjects, {
        first_downloaded_gte: '2025-04-15',
      });

      sinon.assert.calledTwice(client.POST);
    });
  });

  describe('verify password function', () => {
    it('checks the leaked password', async () => {
      const getCredentials = sandbox.stub().resolves({ authPW: 'wibble' });
      const checkPassword = sandbox.stub().resolves({ match: false });
      const verifyHashStub = sandbox.stub().resolves('quux');
      const Password = class {
        async verifyHash() {
          return verifyHashStub();
        }
      };
      const verifyPassword = lib.createVerifyPasswordFn(
        Password as any,
        checkPassword,
        getCredentials
      );
      const leakCredentials = {
        subject: 'fizz@bar.gg',
        exposed_secret: {
          details: { clear_text_value: 'buzz' },
          type: 'clear',
        },
      };
      const acct = {
        uid: '9001',
        authSalt: 'pepper',
        verifierVersion: 1,
      };
      const res = await verifyPassword(leakCredentials, acct as any);

      sinon.assert.calledOnceWithExactly(getCredentials, acct, 'buzz');
      sinon.assert.calledOnce(verifyHashStub);
      sinon.assert.calledOnceWithExactly(checkPassword, '9001', 'quux');
      expect(res).toBe(false);
    });
  });
});
