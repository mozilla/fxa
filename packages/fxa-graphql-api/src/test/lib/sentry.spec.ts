/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'reflect-metadata';

import 'mocha';

import { assert } from 'chai';
import { GraphQLError } from 'graphql';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const sandbox = sinon.createSandbox();

describe('sentry', () => {
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
      '@sentry/node': {
        withScope: mockCapture,
        captureException: mockCaptureException,
      },
    }).reportGraphQLError;
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('captures an error', async () => {
    reportGraphQLError(err);
    const errResult = mockCaptureException.args[0][0];
    assert.equal(errResult.message, 'boom');
    assert.isTrue(
      mockScope.setContext.calledOnceWith('graphql', { path: 'resolver.field' })
    );
  });
});
