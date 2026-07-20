/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailSender, type MailerConfig, type Email } from './email-sender';
import type { Bounces } from './bounces';
import type { StatsD } from 'hot-shots';
import type { ILogger } from '@fxa/shared/log';
import { AppError } from '../../errors/src';

jest.mock('nodemailer');
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

  const defaultResponse = {
    sent: true,
    message: 'Email sent',
    messageId: 'test-message-id',
    response: '250 OK',
  };

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
      retry: {
        maxAttempts: 1,
        backOffMs: 1,
        jitter: 0.0,
        maxDelayMs: 10_000,
      },
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

      expect(mockBounces.check).toHaveBeenCalledWith(
        defaultMockEmail.to,
        defaultMockEmail.template
      );
      expect(mockTransport.sendMail).toHaveBeenCalled();
      expect(result).toEqual(defaultResponse);
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

    it('uses SMTP without auth when no username/password provided', async () => {
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

      expect(mockNodemailer.createTransport).toHaveBeenLastCalledWith(
        expect.objectContaining({
          host: config.host,
          port: config.port,
          secure: config.secure,
          sendingRate: config.sendingRate,
        })
      );
      expect(mockNodemailer.createTransport).toHaveBeenLastCalledWith(
        expect.not.objectContaining({
          SES: expect.anything(),
          auth: expect.anything(),
        })
      );

      const result = await emailSender.send(defaultMockEmail);
      expect(result).toEqual(defaultResponse);
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

    it('does not retry if maxAttempts is 0', async () => {
      config = {
        ...config,
        retry: {
          maxAttempts: 0,
          backOffMs: 100,
          jitter: 0,
          maxDelayMs: 10_000,
        },
      };

      emailSender = new EmailSender(
        config,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      mockTransport.sendMail.mockRejectedValueOnce(
        new Error('Temporary error')
      );

      await expect(emailSender.send(defaultMockEmail, true)).rejects.toThrow(
        'Temporary error'
      );

      // Should only attempt once (no retries)
      expect(mockTransport.sendMail).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).not.toHaveBeenCalledWith(
        'email.send.retry',
        expect.anything()
      );
    });

    it('does not retry if backOffMs is 0', async () => {
      config = {
        ...config,
        retry: {
          maxAttempts: 3,
          backOffMs: 0,
          jitter: 0,
          maxDelayMs: 10_000,
        },
      };

      emailSender = new EmailSender(
        config,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      mockTransport.sendMail.mockRejectedValueOnce(
        new Error('Temporary error')
      );

      await expect(emailSender.send(defaultMockEmail, true)).rejects.toThrow(
        'Temporary error'
      );

      // Should only attempt once (no retries)
      expect(mockTransport.sendMail).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).not.toHaveBeenCalledWith(
        'email.send.retry',
        expect.anything()
      );
    });
  });
  describe('sendMail error handling', () => {
    it('throws error when sendMail fails without retry', async () => {
      config = {
        ...config,
        retry: {
          maxAttempts: 0,
          backOffMs: 100,
          jitter: 0,
          maxDelayMs: 10_000,
        },
      };

      emailSender = new EmailSender(
        config,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      const error = new Error('SMTP connection failed');
      mockTransport.sendMail.mockRejectedValueOnce(error);

      await expect(emailSender.send(defaultMockEmail, true)).rejects.toThrow(
        'SMTP connection failed'
      );

      expect(mockTransport.sendMail).toHaveBeenCalledTimes(1);
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
      config = {
        ...config,
        retry: {
          maxAttempts: 0,
          backOffMs: 100,
          jitter: 0,
          maxDelayMs: 10_000,
        },
      };

      emailSender = new EmailSender(
        config,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      const appError = AppError.emailBouncedHard(100_000_000_000);
      mockTransport.sendMail.mockRejectedValueOnce(appError);

      await expect(emailSender.send(defaultMockEmail, true)).rejects.toThrow();

      expect(mockTransport.sendMail).toHaveBeenCalledTimes(1);
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

    it('logs SMTP error details including rejected recipients', async () => {
      config = {
        ...config,
        retry: {
          maxAttempts: 0,
          backOffMs: 100,
          jitter: 0,
          maxDelayMs: 10_000,
        },
      };

      emailSender = new EmailSender(
        config,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      const smtpError = Object.assign(new Error('Invalid RCPT TO'), {
        response: '501 Invalid RCPT TO address provided',
        responseCode: 501,
        rejected: ['bad@example.com'],
        accepted: ['good@example.com'],
      });

      const emailWithCc = {
        ...defaultMockEmail,
        cc: ['cc@example.com'],
      };

      mockTransport.sendMail.mockRejectedValueOnce(smtpError);

      await expect(emailSender.send(emailWithCc, true)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'mailer.send.error',
        expect.objectContaining({
          smtpResponse: '501 Invalid RCPT TO address provided',
          smtpResponseCode: 501,
          rejectedRecipients: ['bad@example.com'],
          acceptedRecipients: ['good@example.com'],
          cc: ['cc@example.com'],
        })
      );
    });
  });
  describe('buildHeaders', () => {
    it('builds basic headers without SES configuration', async () => {
      const headers = emailSender.buildHeaders({
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
      const headers = emailSender.buildHeaders({
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
  describe('retry with recursive sendMail', () => {
    let configWithRetry: MailerConfig;

    beforeEach(() => {
      configWithRetry = {
        ...config,
        retry: {
          maxAttempts: 3,
          backOffMs: 100,
          jitter: 0.0,
          maxDelayMs: 10_000,
        },
      };
    });

    it('retries twice before succeeding', async () => {
      const mockTransportResponse = {
        messageId: 'test-message-id',
        message: 'It worked!',
        response: '250 OK',
      };

      mockTransport.sendMail
        .mockRejectedValueOnce(new Error('Temporary SMTP error 1'))
        .mockRejectedValueOnce(new Error('Temporary SMTP error 2'))
        .mockResolvedValueOnce(mockTransportResponse);

      emailSender = new EmailSender(
        configWithRetry,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      const result = await emailSender.send(defaultMockEmail);

      expect(mockTransport.sendMail).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        sent: true,
        message: mockTransportResponse.message,
        messageId: mockTransportResponse.messageId,
        response: mockTransportResponse.response,
      });
    });
    it('retries with exponential backoff', async () => {
      const sleepDurations: number[] = [];
      const mockTransportResponse = {
        messageId: 'test-message-id',
        message: 'It worked!',
        response: '250 OK',
      };

      jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
        sleepDurations.push(delay as number);
        (fn as () => void)();
        return null as any;
      });

      // new config for larger dataset to fully see exponential backoff
      configWithRetry = {
        ...configWithRetry,
        retry: {
          maxAttempts: 5,
          backOffMs: 10,
          jitter: 0.0,
          maxDelayMs: 10_000,
        },
      };

      mockTransport.sendMail
        .mockRejectedValueOnce(new Error('Temporary SMTP error 1'))
        .mockRejectedValueOnce(new Error('Temporary SMTP error 2'))
        .mockRejectedValueOnce(new Error('Temporary SMTP error 3'))
        .mockRejectedValueOnce(new Error('Temporary SMTP error 4'))
        .mockResolvedValueOnce(mockTransportResponse);

      emailSender = new EmailSender(
        configWithRetry,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      const result = await emailSender.send(defaultMockEmail);

      expect(result).toEqual({
        sent: true,
        message: mockTransportResponse.message,
        messageId: mockTransportResponse.messageId,
        response: mockTransportResponse.response,
      });
      expect(mockTransport.sendMail).toHaveBeenCalledTimes(5);
      // this is the part we care about since we're spying on setTimeout above.
      // and so, the first 4 loops will set a delay, but our 5th attempt will succeed without a delay.
      expect(sleepDurations).toEqual([10, 20, 40, 80]);
    });
    it('throws error if all attempts fail', async () => {
      const error = new Error('Temporary SMTP error');

      mockTransport.sendMail.mockRejectedValue(error);

      emailSender = new EmailSender(
        configWithRetry,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      await expect(emailSender.send(defaultMockEmail, true)).rejects.toThrow(
        'Temporary SMTP error'
      );

      expect(mockTransport.sendMail).toHaveBeenCalledTimes(4);

      // statsd for retries
      expect(mockStatsd.increment).toHaveBeenCalledWith('email.send.retry', {
        template: defaultMockEmail.template,
      });

      // statsd for final failure
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'email.send.retry.failure',
        {
          template: defaultMockEmail.template,
        }
      );
      expect(mockStatsd.increment).toHaveBeenCalledTimes(4);

      // Make sure issue is still sent to sentry
      expect(mockSentryCaptureException).toHaveBeenCalledWith(error);
    });

    it('suppresses error with directive', async () => {
      const error = new Error('Temporary SMTP error');

      mockTransport.sendMail.mockRejectedValue(error);

      emailSender = new EmailSender(
        configWithRetry,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      // Shouldn't error...
      await emailSender.send(defaultMockEmail, false);

      // But should capture
      expect(mockSentryCaptureException).toHaveBeenCalledWith(error);
    });
  });
  describe('calculateBackoffDelay', () => {
    it('calculates exponential backoff without jitter', () => {
      config = {
        ...config,
        retry: {
          maxAttempts: 3,
          backOffMs: 100,
          jitter: 0,
          maxDelayMs: 10_000,
        },
      };

      emailSender = new EmailSender(
        config,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      // attempt 0: 100 * 2^0 = 100
      expect(emailSender.calculateBackoffDelay(0)).toBe(100);
      // attempt 1: 100 * 2^1 = 200
      expect(emailSender.calculateBackoffDelay(1)).toBe(200);
      // attempt 2: 100 * 2^2 = 400
      expect(emailSender.calculateBackoffDelay(2)).toBe(400);
      // attempt 3: 100 * 2^3 = 800
      expect(emailSender.calculateBackoffDelay(3)).toBe(800);
    });

    it('calculates exponential backoff with jitter', () => {
      config = {
        ...config,
        retry: {
          maxAttempts: 3,
          backOffMs: 100,
          jitter: 0.5,
          maxDelayMs: 10_000,
        },
      };

      emailSender = new EmailSender(
        config,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      // Mock Math.random to return 0.5 for deterministic testing
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      // With jitter 0.5 and random() = 0.5:
      // attempt 0: 100 * (1 + 0.5 * 0.5) = 100 * 1.25 = 125
      expect(emailSender.calculateBackoffDelay(0)).toBe(125);
      // attempt 1: 200 * (1 + 0.5 * 0.5) = 200 * 1.25 = 250
      expect(emailSender.calculateBackoffDelay(1)).toBe(250);

      (Math.random as jest.Mock).mockRestore();
    });

    it('caps backoff at maxDelayMs', () => {
      config = {
        ...config,
        retry: {
          maxAttempts: 10,
          backOffMs: 100,
          jitter: 0,
          maxDelayMs: 500,
        },
      };

      emailSender = new EmailSender(
        config,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      // attempt 0: 100 * 2^0 = 100 (under cap)
      expect(emailSender.calculateBackoffDelay(0)).toBe(100);
      // attempt 3: 100 * 2^3 = 800, but capped at 500
      expect(emailSender.calculateBackoffDelay(3)).toBe(500);
      // attempt 5: 100 * 2^5 = 3200, but capped at 500
      expect(emailSender.calculateBackoffDelay(5)).toBe(500);
    });

    it('applies jitter after capping at maxDelayMs', () => {
      config = {
        ...config,
        retry: {
          maxAttempts: 10,
          backOffMs: 100,
          jitter: 0.2,
          maxDelayMs: 300,
        },
      };

      emailSender = new EmailSender(
        config,
        mockBounces,
        mockStatsd,
        mockLogger
      );

      // Mock Math.random to return 0.75 for deterministic testing
      jest.spyOn(Math, 'random').mockReturnValue(0.75);

      // attempt 5: 100 * 2^5 = 3200, capped at 300, then jitter applied
      // 300 * (1 + 0.2 * 0.75) = 300 * 1.15 = 345
      expect(emailSender.calculateBackoffDelay(5)).toBe(300);

      (Math.random as jest.Mock).mockRestore();
    });
  });
});
