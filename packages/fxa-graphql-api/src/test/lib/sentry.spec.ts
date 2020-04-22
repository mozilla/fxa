/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { ValidationError } from 'apollo-server';
import { assert } from 'chai';
import { GraphQLError } from 'graphql';
import 'mocha';
import { Logger } from 'mozlog';
import proxyquire from 'proxyquire';
import sinon, { SinonSpy } from 'sinon';
import { stubInterface } from 'ts-sinon';

const sandbox = sinon.createSandbox();

describe('sentry', () => {
  let logger: Logger;
  let mockCaptureException: any;
  let mockScope: any;
  let reportGraphQLError: any;

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
    mockScope = { setContext: sinon.stub() };
    const mockCapture = (func: any) => {
      func(mockScope);
    };
    mockCaptureException = sinon.stub();
    reportGraphQLError = proxyquire('../../lib/sentry.ts', {
      '@sentry/node': { withScope: mockCapture, captureException: mockCaptureException }
    }).reportGraphQLError;
    logger = stubInterface<Logger>();
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('captures an error', async () => {
    reportGraphQLError(false, logger, err);
    const errResult = mockCaptureException.args[0][0];
    assert.equal(errResult.message, 'boom');
    const logSpy = (logger.error as unknown) as SinonSpy;
    assert.isTrue(
      (logger.error as SinonSpy).calledOnceWith('graphql', {
        error: 'boom',
        path: 'resolver.field'
      })
    );
    assert.isTrue(mockScope.setContext.calledOnceWith('graphql', { path: 'resolver.field' }));
  });

  it('skips error capture in debug mode', () => {
    const result = reportGraphQLError(true, logger, err);
    assert.equal(result, err);
    assert.isTrue((logger.error as SinonSpy).notCalled);
  });

  it('changes error capture on validation bugs', () => {
    const validationErr = new ValidationError('Bad form');
    const result = reportGraphQLError(false, logger, validationErr);
    const logSpy = (logger.error as unknown) as SinonSpy;
    assert.notEqual(result, err);
    assert.equal(result.message, 'Request error');
    assert.isTrue(logSpy.notCalled);
  });
});
