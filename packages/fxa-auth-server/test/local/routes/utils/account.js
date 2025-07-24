/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');

const { fetchRpCmsData, getOptionalCmsEmailConfig } = require('../../../../lib/routes/utils/account');

describe('fetchRpCmsData', () => {
  const sandbox = sinon.createSandbox();
  const mockRequest = {
    app: {
      metricsContext: {
        clientId: '00f00f',
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
      mockRequest.app.metricsContext.clientId,
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
          clientId: '00f00f',
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

describe('getOptionalCmsEmailConfig', () => {
  const sandbox = sinon.createSandbox();
  const mockRequest = {
    app: {
      metricsContext: {
        clientId: '00f00f',
        entrypoint: 'entree',
      },
    },
  };

  beforeEach(() => {
    sandbox.reset();
  });

  it('returns original email options when no CMS config is available', async () => {
    const emailOptions = {
      acceptLanguage: 'en-US',
      code: '123456',
      timeZone: 'America/Los_Angeles',
    };

    const mockCmsManager = {
      fetchCMSData: sandbox.stub().resolves({
        relyingParties: [],
      }),
    };

    const mockLog = { error: sandbox.stub() };

    const result = await getOptionalCmsEmailConfig(emailOptions, {
      request: mockRequest,
      cmsManager: mockCmsManager,
      log: mockLog,
      emailTemplate: 'VerifyLoginCodeEmail',
    });

    assert.deepEqual(result, emailOptions);
  });

  it('returns enhanced email options when CMS config is available', async () => {
    const emailOptions = {
      acceptLanguage: 'en-US',
      code: '123456',
      timeZone: 'America/Los_Angeles',
    };

    const rpCmsConfig = {
      clientId: 'testclient123456',
      shared: {
        emailFromName: 'Test App',
        emailLogoUrl: 'https://example.com/logo.png',
        logoAltText: 'Test App Logo',
      },
      VerifyLoginCodeEmail: {
        subject: 'Custom Subject',
        template: 'custom-template',
      },
    };

    const mockCmsManager = {
      fetchCMSData: sandbox.stub().resolves({
        relyingParties: [rpCmsConfig],
      }),
    };

    const mockLog = { error: sandbox.stub() };

    const result = await getOptionalCmsEmailConfig(emailOptions, {
      request: mockRequest,
      cmsManager: mockCmsManager,
      log: mockLog,
      emailTemplate: 'VerifyLoginCodeEmail',
    });

    assert.deepEqual(result, {
      ...emailOptions,
      target: 'strapi',
      cmsRpClientId: 'testclient123456',
      cmsRpFromName: 'Test App',
      entrypoint: 'entree',
      logoUrl: 'https://example.com/logo.png',
      logoAltText: 'Test App Logo',
      subject: 'Custom Subject',
      template: 'custom-template',
    });
  });

  it('returns original email options when CMS config does not have the specific email template', async () => {
    const emailOptions = {
      acceptLanguage: 'en-US',
      code: '123456',
      timeZone: 'America/Los_Angeles',
    };

    const rpCmsConfig = {
      clientId: 'testclient123456',
      shared: {
        emailFromName: 'Test App',
        emailLogoUrl: 'https://example.com/logo.png',
        logoAltText: 'Test App Logo',
      },
      // No VerifyLoginCodeEmail template
    };

    const mockCmsManager = {
      fetchCMSData: sandbox.stub().resolves({
        relyingParties: [rpCmsConfig],
      }),
    };

    const mockLog = { error: sandbox.stub() };

    const result = await getOptionalCmsEmailConfig(emailOptions, {
      request: mockRequest,
      cmsManager: mockCmsManager,
      log: mockLog,
      emailTemplate: 'VerifyLoginCodeEmail',
    });

    assert.deepEqual(result, emailOptions);
  });

  it('handles CMS fetch errors gracefully', async () => {
    const emailOptions = {
      acceptLanguage: 'en-US',
      code: '123456',
      timeZone: 'America/Los_Angeles',
    };

    const mockCmsManager = {
      fetchCMSData: sandbox.stub().rejects(new Error('CMS Error')),
    };

    const mockLog = { error: sandbox.stub() };

    const result = await getOptionalCmsEmailConfig(emailOptions, {
      request: mockRequest,
      cmsManager: mockCmsManager,
      log: mockLog,
      emailTemplate: 'VerifyLoginCodeEmail',
    });

    assert.deepEqual(result, emailOptions);
    sinon.assert.calledOnce(mockLog.error);
  });

  it('works with different email templates', async () => {
    const emailOptions = {
      acceptLanguage: 'en-US',
      code: '123456',
      timeZone: 'America/Los_Angeles',
    };

    const rpCmsConfig = {
      clientId: 'testclient123456',
      shared: {
        emailFromName: 'Test App',
        emailLogoUrl: 'https://example.com/logo.png',
        logoAltText: 'Test App Logo',
      },
      VerifyShortCodeEmail: {
        subject: 'Short Code Subject',
        template: 'short-code-template',
      },
    };

    const mockCmsManager = {
      fetchCMSData: sandbox.stub().resolves({
        relyingParties: [rpCmsConfig],
      }),
    };

    const mockLog = { error: sandbox.stub() };

    const result = await getOptionalCmsEmailConfig(emailOptions, {
      request: mockRequest,
      cmsManager: mockCmsManager,
      log: mockLog,
      emailTemplate: 'VerifyShortCodeEmail',
    });

    assert.deepEqual(result, {
      ...emailOptions,
      target: 'strapi',
      cmsRpClientId: 'testclient123456',
      cmsRpFromName: 'Test App',
      entrypoint: 'entree',
      logoUrl: 'https://example.com/logo.png',
      logoAltText: 'Test App Logo',
      subject: 'Short Code Subject',
      template: 'short-code-template',
    });
  });
});
