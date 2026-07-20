/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { AuthLogger } from '../../types';

const {
  fetchRpCmsData,
  getOptionalCmsEmailConfig,
  notifyAttachedServicesForAccountSession,
} = require('./account');

describe('fetchRpCmsData', () => {
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
    jest.clearAllMocks();
  });

  it('returns an RP CMS config', async () => {
    const rpCmsConfig = {
      shared: {},
    };
    const mockCmsManager = {
      fetchCMSData: jest.fn().mockResolvedValue({
        relyingParties: [rpCmsConfig],
      }),
    };

    const actual = await fetchRpCmsData(mockRequest, mockCmsManager);
    expect(mockCmsManager.fetchCMSData).toHaveBeenCalledTimes(1);
    expect(mockCmsManager.fetchCMSData).toHaveBeenCalledWith(
      mockRequest.app.metricsContext.clientId,
      mockRequest.app.metricsContext.entrypoint
    );
    expect(actual).toEqual(rpCmsConfig);
  });

  it('returns null when no matching RP found in CMS', async () => {
    const mockCmsManager = {
      fetchCMSData: jest.fn().mockResolvedValue({
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
      fetchCMSData: jest.fn().mockResolvedValue({
        relyingParties: [rpCmsConfig],
      }),
    };

    const actual = await fetchRpCmsData(mockRequest, mockCmsManager);
    expect(mockCmsManager.fetchCMSData).toHaveBeenCalledTimes(1);
    expect(mockCmsManager.fetchCMSData).toHaveBeenCalledWith(
      mockRequest.app.metricsContext.clientId,
      'default'
    );
    expect(actual).toEqual(rpCmsConfig);
  });

  it('logs an error', async () => {
    const err = new Error('No can do');
    const mockCmsManager = {
      fetchCMSData: jest.fn().mockRejectedValue(err),
    };
    const mockLogger = { error: jest.fn() };
    const actual = await fetchRpCmsData(
      mockRequest,
      mockCmsManager,
      mockLogger
    );
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith('cms.getConfig.error', {
      error: err,
    });
    expect(actual).toBeNull();
  });
});

describe('getOptionalCmsEmailConfig', () => {
  const mockRequest = {
    app: {
      metricsContext: {
        clientId: '00f00f',
        entrypoint: 'entree',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns original email options when no CMS config is available', async () => {
    const emailOptions = {
      acceptLanguage: 'en-US',
      code: '123456',
      timeZone: 'America/Los_Angeles',
    };

    const mockCmsManager = {
      fetchCMSData: jest.fn().mockResolvedValue({
        relyingParties: [],
      }),
    };

    const mockLog = { error: jest.fn() };

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
      fetchCMSData: jest.fn().mockResolvedValue({
        relyingParties: [rpCmsConfig],
      }),
    };

    const mockLog = { error: jest.fn() };

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
      fetchCMSData: jest.fn().mockResolvedValue({
        relyingParties: [rpCmsConfig],
      }),
    };

    const mockLog = { error: jest.fn() };

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
      fetchCMSData: jest.fn().mockRejectedValue(new Error('CMS Error')),
    };

    const mockLog = { error: jest.fn() };

    const result = await getOptionalCmsEmailConfig(emailOptions, {
      request: mockRequest,
      cmsManager: mockCmsManager,
      log: mockLog,
      emailTemplate: 'VerifyLoginCodeEmail',
    });

    expect(result).toEqual(emailOptions);
    expect(mockLog.error).toHaveBeenCalledTimes(1);
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
      fetchCMSData: jest.fn().mockResolvedValue({
        relyingParties: [rpCmsConfig],
      }),
    };

    const mockLog = { error: jest.fn() };

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

describe('notifyAttachedServicesForAccountSession', () => {
  const uid = 'f9416ce3703e4916a4cd6b1e665a3f1a';
  const CURRENT_PRIMARY_EMAIL = 'current-primary@example.com';

  const request = {
    app: { geo: { location: { country: 'United States', countryCode: 'US' } } },
    headers: { 'user-agent': 'test-agent' },
  };

  // The account carries only the current primary email — the helper no longer
  // accepts a bare `email`, so a stale signup address can't be passed.
  const account = {
    uid,
    primaryEmail: { email: CURRENT_PRIMARY_EMAIL },
    locale: 'en',
  };

  let log: jest.Mocked<Pick<AuthLogger, 'notifyAttachedServices'>>;

  beforeEach(() => {
    log = { notifyAttachedServices: jest.fn().mockResolvedValue(undefined) };
  });

  it('sends the login notification with the current primary email', async () => {
    await notifyAttachedServicesForAccountSession({
      log,
      request,
      account,
      service: 'sync',
      deviceCount: 2,
      isNewAccount: false,
      emailVerified: true,
      profileChanged: false,
    });

    expect(log.notifyAttachedServices).toHaveBeenCalledWith('login', request, {
      country: 'United States',
      countryCode: 'US',
      deviceCount: 2,
      email: CURRENT_PRIMARY_EMAIL,
      service: 'sync',
      uid,
      userAgent: 'test-agent',
    });
  });

  it('sends the verified notification with the current primary email for a new verified account', async () => {
    await notifyAttachedServicesForAccountSession({
      log,
      request,
      account,
      service: 'sync',
      deviceCount: 1,
      isNewAccount: true,
      emailVerified: true,
      profileChanged: false,
    });

    expect(log.notifyAttachedServices).toHaveBeenCalledWith(
      'verified',
      request,
      {
        country: 'United States',
        countryCode: 'US',
        email: CURRENT_PRIMARY_EMAIL,
        locale: 'en',
        service: 'sync',
        uid,
        userAgent: 'test-agent',
      }
    );
  });
});
