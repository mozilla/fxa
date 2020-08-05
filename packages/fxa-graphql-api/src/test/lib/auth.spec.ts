/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'reflect-metadata';

import { Container } from 'typedi';
import { assert } from 'chai';
import 'mocha';
import sinon from 'sinon';
import { AuthenticationError } from 'apollo-server';

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

    it('throws when the authClient throws', async () => {
      fxAccountClient.sessionStatus.rejects(new Error('boom'));
      try {
        await sessionAuth.getSessionStatus('token');
        assert.fail('getSessionStatus should have thrown');
      } catch (e) {
        assert.instanceOf(e, AuthenticationError);
      }
    });
  });
});
