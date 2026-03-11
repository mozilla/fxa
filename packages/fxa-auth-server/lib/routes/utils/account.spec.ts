/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Migrated from test/local/routes/utils/account.js (Mocha → Jest).
 */

import sinon from 'sinon';

const { fetchRpCmsData, getOptionalCmsEmailConfig } = require('./account');

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
    expect(actual).toEqual(rpCmsConfig);
  });

  it('returns null when no matching RP found in CMS', async () => {
    const mockCmsManager = {
      fetchCMSData: sandbox.stub().resolves({
        relyingParties: [],
      }),
    };

    const actual = await fetchRpCmsData(mockRequest, mockCmsManager);
    expect(actual).toBeNull();
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
    expect(actual).toBeNull();
  });

  it('uses default entrypoint when entrypoint is missing from metrics context', async () => {
    const mockRequest = {
      app: {
        metricsContext: {
          clientId: '00f00f',
        },
      },
    };
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
      'default'
    );
    expect(actual).toEqual(rpCmsConfig);
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
    expect(actual).toBeNull();
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

    expect(result).toEqual(emailOptions);
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
        emailLogoAltText: 'Test App Logo',
        emailLogoWidth: '280px',
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

    expect(result).toEqual({
      ...emailOptions,
      target: 'strapi',
      cmsRpClientId: 'testclient123456',
      cmsRpFromName: 'Test App',
      entrypoint: 'entree',
      emailLogoUrl: 'https://example.com/logo.png',
      emailLogoAltText: 'Test App Logo',
      emailLogoWidth: '280px',
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
        emailLogoAltText: 'Test App Logo',
        emailLogoWidth: '280px',
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

    expect(result).toEqual(emailOptions);
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

    expect(result).toEqual(emailOptions);
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
        emailLogoAltText: 'Test App Logo',
        emailLogoWidth: '280px',
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

    expect(result).toEqual({
      ...emailOptions,
      target: 'strapi',
      cmsRpClientId: 'testclient123456',
      cmsRpFromName: 'Test App',
      entrypoint: 'entree',
      emailLogoUrl: 'https://example.com/logo.png',
      emailLogoAltText: 'Test App Logo',
      emailLogoWidth: '280px',
      subject: 'Short Code Subject',
      template: 'short-code-template',
    });
  });
});
