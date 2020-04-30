/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { Request, Response } from 'express';
import { assert } from 'chai';
import 'mocha';
import sinon from 'sinon';

import { loggerContainerToken, configContainerToken } from '../../../lib/constants';

const sandbox = sinon.createSandbox();
// tslint:disable-next-line: no-empty
const mockLogger = { debug: sandbox.stub() };
Container.set(loggerContainerToken, mockLogger);
const mockConfig = {
  get: (k: string): string | number => {
    const fakeConfigs: { [key: string]: string | number } = {
      authHeader: 'authorization',
      'oauth.accessToken.hexLength': 64,
    };
    return fakeConfigs[k];
  },
};
Container.set(configContainerToken, mockConfig);

import { getTokenId, oauthBearerTokenValidator } from '../../../lib/oauth';
import { AppConfig } from '../../../config';

describe('oauthBearerTokenValidator', () => {
  const sendStub = sandbox.stub();
  const statusStub = sandbox.stub().returns({ send: sendStub });
  const res = ({ status: statusStub } as unknown) as Response;
  const nextFunc = sandbox.stub();

  beforeEach(() => {
    sandbox.resetHistory();
  });

  it('should 401 when the authorization header is missing', () => {
    const req = { headers: {} } as Request;
    oauthBearerTokenValidator(req, res, nextFunc);

    sinon.assert.calledOnceWithExactly(statusStub, 401);
    sinon.assert.calledOnce(sendStub);
    sinon.assert.calledOnce(mockLogger.debug);
    assert.isFalse(nextFunc.called);
  });

  it('should 401 when the authorization header is empty', () => {
    const req = ({ headers: { authorization: '' } } as unknown) as Request;
    oauthBearerTokenValidator(req, res, nextFunc);

    sinon.assert.calledOnceWithExactly(statusStub, 401);
    sinon.assert.calledOnce(sendStub);
    sinon.assert.calledOnce(mockLogger.debug);
    assert.isFalse(nextFunc.called);
  });

  it('should 401 when the token is not in the correct format', () => {
    const req = ({ headers: { authorization: 'this is no HEX!' } } as unknown) as Request;
    oauthBearerTokenValidator(req, res, nextFunc);

    sinon.assert.calledOnceWithExactly(statusStub, 401);
    sinon.assert.calledOnce(sendStub);
    sinon.assert.calledOnce(mockLogger.debug);
    assert.isFalse(nextFunc.called);
  });

  it('should call next() when validation is successful', () => {
    const req = ({
      headers: {
        authorization: 'Bearer fc8d07fbbe179b7d75e73172884158053a357692f491cf678540558744f2e4a5',
      },
    } as unknown) as Request;
    oauthBearerTokenValidator(req, res, nextFunc);

    assert.isFalse(statusStub.called);
    assert.isFalse(sendStub.called);
    assert.isTrue(nextFunc.called);
  });
});

describe('getTokenId', () => {
  it('should return the hex string of a SHA-256 hash', () => {
    const expected = 'bfc1e6a89fd9ecca18d8da13cb2676b623cfd4d8c694e07018cbd90bc11097e2';
    const actual = getTokenId('fc8d07fbbe179b7d75e73172884158053a357692f491cf678540558744f2e4a5');
    assert.equal(actual, expected);
  });
});
