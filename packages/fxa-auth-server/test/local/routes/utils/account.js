/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');

const { fetchRpCmsData } = require('../../../../lib/routes/utils/account');

describe('fetchRpCmsData', () => {
  const sandbox = sinon.createSandbox();
  const mockRequest = {
    app: {
      metricsContext: {
        service: '00f00f',
        entrypoint: 'entree',
      },
    },
  };

  beforeEach(() => {
    sandbox.reset();
  });

  it('returns an RP CMS config', async () => {
    const rpCmsConfig = {
      shared: {},
    };
    const mockCmsManager = {
      fetchCMSData: sandbox.stub().resolves({
        relyingParties: [rpCmsConfig],
      }),
    };

    const actual = await fetchRpCmsData(mockRequest, mockCmsManager);
    sinon.assert.calledOnceWithExactly(
      mockCmsManager.fetchCMSData,
      mockRequest.app.metricsContext.service,
      mockRequest.app.metricsContext.entrypoint
    );
    assert.deepEqual(actual, rpCmsConfig);
  });

  it('returns null when no matching RP found in CMS', async () => {
    const mockCmsManager = {
      fetchCMSData: sandbox.stub().resolves({
        relyingParties: [],
      }),
    };

    const actual = await fetchRpCmsData(mockRequest, mockCmsManager);
    assert.equal(actual, null);
  });

  it('returns null there is no client id in metrics context', async () => {
    const mockRequest = {
      app: {
        metricsContext: {
          entrypoint: 'entree',
        },
      },
    };
    const actual = await fetchRpCmsData(mockRequest);
    assert.equal(actual, null);
  });

  it('returns null there is no entrypoint in metrics context', async () => {
    const mockRequest = {
      app: {
        metricsContext: {
          service: '00f00f',
        },
      },
    };
    const actual = await fetchRpCmsData(mockRequest);
    assert.equal(actual, null);
  });

  it('logs an error', async () => {
    const err = new Error('No can do');
    const mockCmsManager = {
      fetchCMSData: sandbox.stub().rejects(err),
    };
    const mockLogger = { error: sandbox.stub() };
    const actual = await fetchRpCmsData(
      mockRequest,
      mockCmsManager,
      mockLogger
    );
    sinon.assert.calledOnceWithExactly(
      mockLogger.error,
      'cms.getConfig.error',
      { error: err }
    );
    assert.equal(actual, null);
  });
});
