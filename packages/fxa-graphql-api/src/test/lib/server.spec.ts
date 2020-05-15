/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'reflect-metadata';

import { Container } from 'typedi';
import { assert } from 'chai';
import 'mocha';
import sinon from 'sinon';
import { Logger } from 'mozlog';
import { AuthenticationError } from 'apollo-server';

import { createServer } from '../../lib/server';
import { fxAccountClientToken } from '../../lib/constants';
import { SessionTokenAuth } from '../../lib/auth';
import Config from '../../config';

const sandbox = sinon.createSandbox();

const sessionAuth = { lookupUserId: sandbox.stub() };

const mockLogger = ({ info: () => {} } as unknown) as Logger;

describe('createServer', () => {
  describe('the default context', async () => {
    // This won't actually be used, but must be set to create the server
    Container.set(fxAccountClientToken, {});

    // Set our new auth stub
    Container.set(SessionTokenAuth, sessionAuth);
    const server = await createServer(Config.getProperties(), mockLogger);

    beforeEach(() => {
      sandbox.resetBehavior();
      sandbox.resetHistory();
    });

    it('should throw an AuthenticationError when auth server has auth error', async () => {
      sessionAuth.lookupUserId.rejects(new AuthenticationError('Invalid token'));
      try {
        await (server as any).context({ req: { headers: {} } });
        assert.fail('Should have thrown an exception');
      } catch (e) {
        assert.instanceOf(e, AuthenticationError);
      }
    });

    it('should return a user and the bearer token', async () => {
      sessionAuth.lookupUserId.resolves('9001xyz');
      try {
        const context = await (server as any).context({
          req: { headers: { authorization: 'lolcatz' } },
        });
        assert.equal(context.authUser, '9001xyz');
        assert.equal(context.token, 'lolcatz');
      } catch (e) {
        assert.fail('Should not have thrown an exception: ' + e);
      }
    });
  });
});
