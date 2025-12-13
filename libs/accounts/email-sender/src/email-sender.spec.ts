/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailSender, type MailerConfig, type Email } from './email-sender';
import type { Bounces } from './bounces';
import type { StatsD } from 'hot-shots';
import type { ILogger } from '@fxa/shared/log';
import { AppError } from '../../errors/src';

jest.mock('nodemailer');
jest.mock('@aws-sdk/client-ses');
jest.mock('@sentry/node');

// additional imports after Jest has mocked modules
import * as Sentry from '@sentry/node';
import nodemailer from 'nodemailer';

const defaultMockEmail: Email = {
  to: 'recipient@example.com',
  from: 'sender@example.com',
  template: 'test-template',
  version: 1,
  subject: 'Test Subject',
  preview: 'Test preview',
  html: '<p>Test HTML</p>',
  text: 'Test text',
  headers: {},
};

/**
 * Creates a partial mock of nodemailer.Transporter with only the methods we need for testing.
 * Maintains strong typing and avoids using 'any', or double casting `as unknown as <type>`.
 */
function createMockTransporter(
  overrides: Partial<Pick<nodemailer.Transporter, 'sendMail'>> = {}
): jest.Mocked<nodemailer.Transporter> {
  return {
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      message: 'Email sent',
      response: '250 OK',
    }),
    ...overrides,
  } as jest.Mocked<nodemailer.Transporter>;
}

describe('EmailSender', () => {
  let emailSender: EmailSender;
  let mockBounces: jest.Mocked<Bounces>;
  let mockStatsd: jest.Mocked<StatsD>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockTransport: jest.Mocked<nodemailer.Transporter>;
  let mockNodemailer: jest.Mocked<typeof nodemailer>;
  let config: MailerConfig;
  let mockSentryCaptureException: jest.SpyInstance;

  beforeEach(() => {
    mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

    mockSentryCaptureException = jest
      .spyOn(Sentry, 'captureException')
      .mockImplementation(() => undefined as any);

    mockBounces = {
      check: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockStatsd = {
      increment: jest.fn(),
      timing: jest.fn(),
      gauge: jest.fn(),
    } as any;

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    mockTransport = createMockTransporter();

    mockNodemailer.createTransport.mockReturnValue(mockTransport);

    config = {
      host: 'localhost',
      port: 1025,
      secure: false,
      pool: false,
      maxConnections: 1,
      maxMessages: 1,
      sendingRate: 1,
      connectionTimeout: 1000,
      greetingTimeout: 1000,
      socketTimeout: 1000,
      dnsTimeout: 1000,
      user: 'test',
      password: 'test',
      sender: 'test@example.com',
    };

    emailSender = new EmailSender(config, mockBounces, mockStatsd, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('send', () => {
    it('email successfully', async () => {
      const result = await emailSender.send({
        ...defaultMockEmail,
        cc: ['cc@mozilla.com'],
      });

      expect(result.sent).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockBounces.check).toHaveBeenCalledWith(
        defaultMockEmail.to,
        defaultMockEmail.template
      );
      expect(mockTransport.sendMail).toHaveBeenCalled();
    });

    it('handles when bounce check fails', async () => {
      mockBounces.check.mockRejectedValueOnce(
        AppError.emailBouncedHard(100_000_000_000) // arbitrary timestamp, but static to make testing easier
      );

      const result = await emailSender.send(defaultMockEmail);

      expect(result.sent).toBe(false);
      expect(result.message).toBe('Has bounce errors!');
      expect(mockBounces.check).toHaveBeenCalledWith(
        defaultMockEmail.to,
        defaultMockEmail.template
      );
      expect(mockStatsd.increment).toHaveBeenCalledWith('email.bounce.limit', {
        template: defaultMockEmail.template,
        error: 134, // BOUNCE_HARD errno since we use it above
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'email.bounce.limit',
        expect.objectContaining({ errno: 134, to: defaultMockEmail.to })
      );
      // sendMail should NOT be called when bounces fail
      expect(mockTransport.sendMail).not.toHaveBeenCalled();
    });

    it('falls back to ses when no username/password provided', async () => {
      config = {
        ...config,
        user: undefined,
        password: undefined,
        sesConfigurationSet: 'test-config-set',
      };
      emailSender = new EmailSender(
        config,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      // Verify constructor called createTransport with SES configuration
      expect(mockNodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          SES: expect.objectContaining({
            ses: expect.any(Object),
          }),
          sendingRate: 5,
          maxConnections: 10,
        })
      );

      const result = await emailSender.send(defaultMockEmail);
      expect(result.sent).toBe(true);
      expect(mockTransport.sendMail).toHaveBeenCalled();
    });
    it('sets X-Mailer header to empty string', async () => {
      await emailSender.send(defaultMockEmail);

      expect(mockTransport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Mailer': '',
          }),
        })
      );
    });
  });
  describe('sendMail error handling', () => {
    it('throws error when sendMail fails', async () => {
      const error = new Error('SMTP connection failed');
      mockTransport.sendMail.mockRejectedValueOnce(error);

      await expect(emailSender.send(defaultMockEmail)).rejects.toThrow(
        'SMTP connection failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'mailer.send.error',
        expect.objectContaining({
          err: 'SMTP connection failed',
          to: defaultMockEmail.to,
          template: defaultMockEmail.template,
        })
      );
      expect(mockSentryCaptureException).toHaveBeenCalledWith(error);
    });

    it('logs app error with errno when sendMail fails with AppError', async () => {
      const appError = AppError.emailBouncedHard(100_000_000_000);
      mockTransport.sendMail.mockRejectedValueOnce(appError);

      await expect(emailSender.send(defaultMockEmail)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'mailer.send.error',
        expect.objectContaining({
          code: appError.code,
          errno: appError.errno,
          to: defaultMockEmail.to,
          template: defaultMockEmail.template,
        })
      );
      expect(mockSentryCaptureException).toHaveBeenCalledWith(appError);
    });
  });
  describe('buildHeaders', () => {
    it('builds basic headers without SES configuration', async () => {
      const headers = await emailSender.buildHeaders({
        template: {
          name: 'test-template',
          version: 1,
        },
        context: {
          serverName: 'test-server',
          language: 'en',
        },
        headers: {
          'X-Custom-Header': 'CustomValue',
        },
      });

      expect(headers).toEqual({
        'Content-Language': 'en',
        'X-Template-Name': 'test-template',
        'X-Template-Version': '1',
        'X-Custom-Header': 'CustomValue',
      });
    });

    it('builds headers with optional context fields', async () => {
      const headers = await emailSender.buildHeaders({
        template: {
          name: 'test-template',
          version: 2,
        },
        context: {
          serverName: 'test-server',
          language: 'fr',
          deviceId: 'device-123',
          flowId: 'flow-456',
          flowBeginTime: 1234567890,
          service: 'sync',
          uid: 'user-789',
        },
        headers: {},
      });

      expect(headers).toEqual({
        'Content-Language': 'fr',
        'X-Template-Name': 'test-template',
        'X-Template-Version': '2',
        'X-Device-Id': 'device-123',
        'X-Flow-Id': 'flow-456',
        'X-Flow-Begin-Time': '1234567890',
        'X-Service-Id': 'sync',
        'X-Uid': 'user-789',
      });
    });

    it('builds headers with SES configuration set', async () => {
      const emailSenderWithSesConfig = new EmailSender(
        {
          ...config,
          user: undefined,
          password: undefined,
          sesConfigurationSet: 'custom-config-set',
        },
        mockBounces,
        mockStatsd,
        mockLogger
      );

      const headers = await emailSenderWithSesConfig.buildHeaders({
        template: {
          name: 'verify',
          version: 1,
        },
        context: {
          serverName: 'auth-server',
          language: 'en',
        },
        headers: {},
      });

      expect(headers['X-SES-CONFIGURATION-SET']).toBe('custom-config-set');
      expect(headers['X-SES-MESSAGE-TAGS']).toBe(
        'messageType=fxa-verify, app=fxa, service=auth-server, ses:feedback-id-a=fxa-verify'
      );
    });

    it('builds headers with SES and CMS RP client info', async () => {
      const emailSenderWithSesConfig = new EmailSender(
        {
          ...config,
          user: undefined,
          password: undefined,
          sesConfigurationSet: 'custom-config-set',
        },
        mockBounces,
        mockStatsd,
        mockLogger
      );

      const headers = await emailSenderWithSesConfig.buildHeaders({
        template: {
          name: 'verify',
          version: 1,
          metricsName: 'verify-metrics',
        },
        context: {
          serverName: 'auth-server',
          language: 'en',
          cmsRpClientId: 'cms-client-123',
          entrypoint: 'entrypoint-abc',
        },
        headers: {},
      });

      expect(headers['X-SES-MESSAGE-TAGS']).toContain(
        'messageType=fxa-verify-metrics'
      );
      expect(headers['X-SES-MESSAGE-TAGS']).toContain(
        'cmsRp=cms-client-123-entrypoint-abc'
      );
    });
  });
});
