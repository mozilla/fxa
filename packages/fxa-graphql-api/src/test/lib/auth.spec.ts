/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'reflect-metadata';

import { Container } from 'typedi';
import { assert } from 'chai';
import 'mocha';
import sinon from 'sinon';
import { ApolloError, AuthenticationError } from 'apollo-server';

import { fxAccountClientToken } from '../../lib/constants';
import { SessionTokenAuth } from '../../lib/auth';

const sandbox = sinon.createSandbox();

const fxAccountClient = { sessionStatus: sandbox.stub() };

describe('SessionTokenAuth', () => {
  Container.set(fxAccountClientToken, fxAccountClient);
  const sessionAuth = Container.get(SessionTokenAuth);

  beforeEach(() => {
    sandbox.resetBehavior();
    sandbox.resetHistory();
  });

  describe('getSessionStatus', async () => {
    it('looks up user successfully', async () => {
      fxAccountClient.sessionStatus.resolves({
        uid: '9001xyz',
        state: 'unverified',
      });
      const result = await sessionAuth.getSessionStatus('token');
      assert.equal(result.uid, '9001xyz');
    });

    it('throws an AuthenticationError when the authClient returns a 400 or 401 error code', async () => {
      const err: any = new Error('boom');
      err.code = 401;
      fxAccountClient.sessionStatus.rejects(err);
      try {
        await sessionAuth.getSessionStatus('token');
        assert.fail('getSessionStatus should have thrown');
      } catch (e) {
        assert.instanceOf(e, AuthenticationError);
      }
    });

    it('throws an ApolloError when the authClient throws any other error', async () => {
      const err: any = new Error('boom');
      err.code = 500;
      fxAccountClient.sessionStatus.rejects(err);
      try {
        await sessionAuth.getSessionStatus('token');
        assert.fail('getSessionStatus should have thrown');
      } catch (e) {
        assert.instanceOf(e, ApolloError);
      }
    });
  });
});
