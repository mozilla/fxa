/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { assert } from 'chai';
import 'mocha';
import sinon from 'sinon';
import { Logger } from 'mozlog';
import { createServer } from '../../lib/server';
import { userLookupFnContainerToken } from '../../lib/constants';
import { AuthenticationError } from 'apollo-server';
import Config from '../../config';

const sandbox = sinon.createSandbox();

const userFetchFn = sandbox.stub();
Container.set(userLookupFnContainerToken, userFetchFn);

// tslint:disable-next-line: no-empty
const mockLogger = ({ info: () => {} } as unknown) as Logger;

describe('createServer', () => {
  describe('the default context', async () => {
    const server = await createServer(Config.getProperties(), mockLogger);

    beforeEach(() => {
      sandbox.resetBehavior();
      sandbox.resetHistory();
    });

    it.skip('should throw an AuthenticationError when user is not found', async () => {
      userFetchFn.returns(null);
      try {
        await (server as any).context({ req: { headers: {} } });
        assert.fail('Should have thrown an exception');
      } catch (e) {
        assert.instanceOf(e, AuthenticationError);
      }
    });

    it.skip('should return a user and the bearer token', async () => {
      userFetchFn.returns({ userId: '9001xyz', email: 'testo@example.com' });
      try {
        const context = await (server as any).context({
          req: { headers: { authorization: 'Bearer lolcatz' } },
        });
        assert.deepEqual(context.authUser, { userId: '9001xyz', email: 'testo@example.com' });
        assert.equal(context.token, 'Bearer lolcatz');
      } catch (e) {
        assert.fail('Should have thrown an exception');
      }
    });
  });
});
