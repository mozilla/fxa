/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';

import * as lib from '../../../scripts/recorded-future/lib';
import { SearchResultIdentity } from '../../../scripts/recorded-future/lib';
import AppError, { ERRNO } from '../../../lib/error';

describe('Recorded Future credentials search and reset script lib', () => {
  const payload = { domain: 'login.example.com', limit: 10 };
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('credentials search function', () => {
    let client;

    beforeEach(() => {
      client = { POST: sandbox.stub() };
    });

    it('returns the data on success', async () => {
      const data = { next_offset: 'letsgoooo' };
      client.POST.resolves({ data });
      const searchFn = lib.createCredentialsSearchFn(client);
      const res = await searchFn(payload);

      sinon.assert.calledOnceWithExactly(
        client.POST,
        '/identity/credentials/search',
        { body: payload }
      );
      assert.deepEqual(res, data);
    });

    it('throws the API returned error', async () => {
      const error = 'oops';
      client.POST.resolves({ error });
      const searchFn = lib.createCredentialsSearchFn(client);

      try {
        await searchFn(payload);
        assert.fail('An error should have been thrown');
      } catch (err) {
        assert.isTrue(err.message.includes('oops'));
      }
    });
  });

  describe('fetch all results function', () => {
    let client;

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
      const searchFn = lib.createCredentialsSearchFn(client);

      const res = await lib.fetchAllCredentialResults(searchFn, payload);

      sinon.assert.calledTwice(client.POST);
      sinon.assert.calledWith(client.POST, '/identity/credentials/search', {
        body: payload,
      });
      sinon.assert.calledWith(client.POST, '/identity/credentials/search', {
        body: { ...payload, offset: firstResponse.next_offset },
      });
      assert.deepEqual(res, [
        ...firstResponse.identities,
        ...secondResponse.identities,
      ] as unknown as SearchResultIdentity[]);
    });
  });

  describe('email address login filter', () => {
    it('matches strings resembling email addresses', () => {
      assert.isTrue(
        lib.isLoginAnEmailAddress({ login: 'a@q.co', domain: 'example.com' })
      );
      assert.isTrue(
        lib.isLoginAnEmailAddress({ login: 'a+b@z.q', domain: 'example.com' })
      );
      assert.isTrue(
        lib.isLoginAnEmailAddress({
          login: 'a.b@z.q.co.gg',
          domain: 'example.com',
        })
      );
      assert.isFalse(
        lib.isLoginAnEmailAddress({ login: 'a.co.gg', domain: 'example.com' })
      );
      assert.isFalse(
        lib.isLoginAnEmailAddress({ login: 'quux', domain: 'example.com' })
      );
      assert.isFalse(
        lib.isLoginAnEmailAddress({ login: 'a+/', domain: 'example.com' })
      );
    });
  });

  describe('find account function', () => {
    it('returns an existing account', async () => {
      const accountFn = sandbox.stub().resolves({ uid: '9001' });
      const findAccount = lib.createFindAccountFn(accountFn);
      const acct = await findAccount('quux@example.gg');

      sinon.assert.calledOnceWithExactly(accountFn, 'quux@example.gg');
      assert.deepEqual(acct, { uid: '9001' } as any);
    });

    it('returns undefined when no account found', async () => {
      const accountFn = sandbox.stub().throws(AppError.unknownAccount());
      const findAccount = lib.createFindAccountFn(accountFn);

      const res = await findAccount('quux@example.gg');
      sinon.assert.calledOnceWithExactly(accountFn, 'quux@example.gg');
      assert.equal(res, undefined);
    });

    it('re-throws errors', async () => {
      const accountFn = sandbox.stub().throws(AppError.invalidRequestBody());
      const findAccount = lib.createFindAccountFn(accountFn);

      try {
        await findAccount('quux@example.gg');
        assert.fail('An error should have been thrown');
      } catch (err) {
        sinon.assert.calledOnceWithExactly(accountFn, 'quux@example.gg');
        assert.equal(err.errno, ERRNO.INVALID_JSON);
      }
    });
  });

  describe('has totp 2fa function', () => {
    it('returns true when TOTP token exists', async () => {
      const totpTokenFn = sandbox.stub().resolves();
      const hasTotpToken = lib.createHasTotp2faFn(totpTokenFn);
      const res = await hasTotpToken({ uid: '9001' } as any);

      sinon.assert.calledOnceWithExactly(totpTokenFn, '9001');
      assert.isTrue(res);
    });

    it('returns false when TOTP token not found', async () => {
      const totpTokenFn = sandbox.stub().rejects(AppError.totpTokenNotFound());
      const hasTotpToken = lib.createHasTotp2faFn(totpTokenFn);
      const res = await hasTotpToken({ uid: '9001' } as any);

      sinon.assert.calledOnceWithExactly(totpTokenFn, '9001');
      assert.isFalse(res);
    });

    it('re-throws errors', async () => {
      const totpTokenFn = sandbox.stub().rejects(AppError.invalidRequestBody());
      const hasTotpToken = lib.createHasTotp2faFn(totpTokenFn);

      try {
        await hasTotpToken({ uid: '9001' } as any);
        assert.fail('An error should have been thrown');
      } catch (err) {
        sinon.assert.calledOnceWithExactly(totpTokenFn, '9001');
        assert.equal(err.errno, ERRNO.INVALID_JSON);
      }
    });
  });
});
