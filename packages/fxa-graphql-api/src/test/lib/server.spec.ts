/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';
import 'reflect-metadata';

import { AuthenticationError, ValidationError } from 'apollo-server';
import { assert } from 'chai';
import { GraphQLError } from 'graphql';
import { Logger } from 'mozlog';
import proxyquire from 'proxyquire';
import sinon, { SinonSpy } from 'sinon';
import { stubInterface } from 'ts-sinon';
import { Container } from 'typedi';

import Config from '../../config';
import { SessionTokenAuth } from '../../lib/auth';
import { fxAccountClientToken } from '../../lib/constants';
import { createServer } from '../../lib/server';

const sandbox = sinon.createSandbox();

const sessionAuth = { lookupUserId: sandbox.stub() };

const mockLogger = ({ info: () => {} } as unknown) as Logger;

describe('formatError', () => {
  const mockReportGraphQLError = sandbox.stub();
  const serverModule = proxyquire('../../lib/server.ts', {
    './sentry': { reportGraphQLError: mockReportGraphQLError },
  });
  const formatError = serverModule.formatError;
  let logger: Logger;

  const originalError = new Error('boom');
  const err = new GraphQLError(
    'Internal server error',
    undefined,
    undefined,
    undefined,
    ['resolver', 'field'],
    originalError
  );

  beforeEach(async () => {
    logger = stubInterface<Logger>();
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('captures an error', async () => {
    formatError(false, logger, err);
    sinon.assert.calledOnceWithExactly(logger.error as SinonSpy, 'graphql', {
      error: 'boom',
      path: 'resolver.field',
    });
    sinon.assert.calledOnce(mockReportGraphQLError);
  });

  it('skips error capture in debug mode', () => {
    const result = formatError(true, logger, err);
    assert.equal(result, err);
    sinon.assert.notCalled(logger.error as SinonSpy);
  });

  it('changes error capture on validation bugs', () => {
    const validationErr = new ValidationError('Bad form');
    const result = formatError(false, logger, validationErr);
    assert.notEqual(result, err);
    assert.equal(result.message, 'Request error');
    sinon.assert.notCalled(logger.error as SinonSpy);
  });
});

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
      sessionAuth.lookupUserId.rejects(
        new AuthenticationError('Invalid token')
      );
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
