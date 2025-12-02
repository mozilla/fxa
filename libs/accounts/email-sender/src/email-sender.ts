/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Bounces } from './bounces';
import { StatsD } from 'hot-shots';
import { ILogger } from '@fxa/shared/log';
import * as nodemailer from 'nodemailer';
import { isAppError } from '@fxa/accounts/errors';
import * as Sentry from '@sentry/node';

/**
 * Config required for the mailer
 */
export type MailerConfig = {
  /** SMTP Host */
  host: string;
  /** The SMTP server port */
  port: number;
  /** If host is 'secured' ie uses TLS */
  secure: boolean;
  /** Can connections be pooled */
  pool: boolean;
  /** Max number of connections */
  maxConnections: number;
  /** Max messages that can be outstanding */
  maxMessages: number;
  /** Max rate at which messages can be sent. */
  sendingRate: number;
  /** Connectiong timeout for smtp server. */
  connectionTimeout: number;
  /** Greeting time out for smtp server. */
  greetingTimeout: number;
  /** Socket timeout for smtp server connection. */
  socketTimeout: number;
  /** DNS timeout for smtp server connection. */
  dnsTimeout: number;

  /** Optional user name for SMTP authentication. */
  user?: string;
  /** Optional password for SMTP authentication. */
  password?: string;
  /** Optional flag to ignore STARTTLS even if the server advertises it. */
  ignoreTLS?: boolean;
  /** Optional flag to require STARTTLS even if the server does not advertise it. */
  requireTLS?: boolean;
  sesConfigurationSet?: string;
  sender: string;
  retry: {
    /** Maximum number of attempts for sending an email IF it fails. 1 means 1 additional attempt after the initial failure. */
    maxAttempts: number;
    /** Number of milliseconds to exponentially back off when retrying sending an email. */
    backOffMs: number;
    /** Jitter factor (0-1) to add randomness to backoff timing. 0 = no jitter, 1 = up to 100% jitter. */
    jitter: number;
    /** Maximum delay in milliseconds to cap the backoff at. */
    maxDelayMs: number;
  };
};

/**
 * Represents an email that can be sent out
 */
export type Email = {
  /** Email recipient */
  to: string;
  /** Optional cc recipeents */
  cc?: string[];
  /** Email sender */
  from: string;
  /** Name of template used to render email */
  template: string;
  /** The version of the template used to render email */
  version: number;
  /** Subject of email */
  subject: string;
  /** Preview text of email */
  preview: string;
  /** HTML content of email */
  html: string;
  /** Text content of email */
  text: string;
  /** Email headers */
  headers: Record<string, string>;
};

type SmtpTransportOptions = nodemailer.TransportOptions & {
  host: string;
  port: number;
  secure: boolean;
  pool: boolean;
  maxConnections: number;
  maxMessages: number;
  connectionTimeout: number;
  greetingTimeout: number;
  socketTimeout: number;
  dnsTimeout: number;
  sendingRate: number;
  ignoreTLS?: boolean;
  requireTLS?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
};

/**
 * Sends an email to end end user.
 */
export class EmailSender {
  private readonly emailClient: nodemailer.Transporter;

  constructor(
    private readonly config: MailerConfig,
    private readonly bounces: Bounces,
    private readonly statsd: StatsD,
    private readonly log: ILogger
  ) {
    // Build SMTP-only nodemailer options
    const options: SmtpTransportOptions = {
      host: config.host,
      secure: config.secure,
      port: config.port,
      pool: config.pool,
      maxConnections: config.maxConnections,
      maxMessages: config.maxMessages,
      connectionTimeout: config.connectionTimeout,
      greetingTimeout: config.greetingTimeout,
      socketTimeout: config.socketTimeout,
      dnsTimeout: config.dnsTimeout,
      sendingRate: config.sendingRate,
    };

    if (config.user && config.password) {
      options.auth = {
        user: config.user,
        pass: config.password,
      };
    }

    if (typeof config.ignoreTLS === 'boolean') {
      options.ignoreTLS = config.ignoreTLS;
    }

    if (typeof config.requireTLS === 'boolean') {
      options.requireTLS = config.requireTLS;
    }

    this.emailClient = nodemailer.createTransport(options);
  }

  /**
   * Builds standard email headers
   */
  async buildHeaders({
    template,
    context,
    headers,
  }: {
    template: {
      name: string;
      version: number;
      metricsName?: string;
    };
    context: {
      serverName: string;
      language: string;
      deviceId?: string;
      flowId?: string;
      flowBeginTime?: number;
      service?: string;
      uid?: string;
      entrypoint?: string;
      cmsRpClientId?: string;
    };
    headers: Record<string, string>;
  }) {
    const optionalHeader = (key: string, value?: string | number) => {
      if (value) {
        return { [key]: value.toString() };
      }
      return {};
    };

    headers = {
      'Content-Language': context.language,
      'X-Template-Name': template.name,
      'X-Template-Version': template.version.toString(),
      ...headers,
      ...optionalHeader('X-Device-Id', context.deviceId),
      ...optionalHeader('X-Flow-Id', context.flowId),
      ...optionalHeader('X-Flow-Begin-Time', context.flowBeginTime),
      ...optionalHeader('X-Service-Id', context.service),
      ...optionalHeader('X-Uid', context.uid),
    };

    if (this.config.sesConfigurationSet) {
      const sesHeaders = [
        `messageType=fxa-${template.metricsName || template.name}`,
        'app=fxa',
        `service=${context.serverName}`,
        `ses:feedback-id-a=fxa-${template.name}`,
      ];
      if (context.cmsRpClientId && context.entrypoint) {
        sesHeaders.push(`cmsRp=${context.cmsRpClientId}-${context.entrypoint}`);
      }

      // Note on SES Event Publishing: The X-SES-CONFIGURATION-SET and
      // X-SES-MESSAGE-TAGS email headers will be stripped by SES from the
      // actual outgoing email messages.
      headers['X-SES-CONFIGURATION-SET'] = this.config.sesConfigurationSet;
      headers['X-SES-MESSAGE-TAGS'] = sesHeaders.join(', ');
    }

    return headers;
  }

  /**
   * Send out an email.
   * @param email Email to send
   * @returns
   */
  async send(email: Email) {
    // Always check for email bounces. Don't send if there bounce errors
    if (await this.hasBounceErrors(email)) {
      return {
        sent: false,
        message: 'Has bounce errors!',
      };
    }
    return await this.sendMail(email);
  }

  /**
   * Calculates the backoff delay with exponential increase, jitter, and max cap.
   * @param attempt The current attempt number (0-indexed)
   * @returns The delay in milliseconds to wait before the next retry
   */
  calculateBackoffDelay(attempt: number): number {
    const { backOffMs, jitter, maxDelayMs } = this.config.retry;

    const exponential = backOffMs * Math.pow(2, attempt);
    const withJitter = exponential * (1 + Math.random() * jitter);

    return Math.min(withJitter, maxDelayMs);
  }

  private async hasBounceErrors({
    to,
    template,
  }: Pick<Email, 'to' | 'template'>) {
    // Check for email bounce first. If the bounce limit error is hit, don't
    // keep don't send email!
    try {
      await this.bounces.check(to, template);
    } catch (err) {
      const tags = { template: template, error: err.errno };
      this.statsd.increment('email.bounce.limit', tags);
      this.log.error('email.bounce.limit', {
        err: err.message,
        errno: err.errno,
        to,
        template,
      });
      return true;
    }

    return false;
  }

  private async sendMail(
    email: Email,
    attempt = 0
  ): Promise<{
    sent: boolean;
    messageId?: string;
    response?: string;
    message?: string;
  }> {
    const { maxAttempts, backOffMs } = this.config.retry;
    const isRetry = attempt > 0;
    const isFinalAttempt = attempt >= maxAttempts;

    try {
      // Make sure X-Mailer: '' is set in headers. This used to be done by setting
      // xMailer to false in the options below.
      email.headers['X-Mailer'] = '';

      const sendMailPayload = {
        from: email.from,
        to: email.to,
        cc: email.cc,
        subject: email.subject,
        text: email.text,
        html: email.html,
        headers: email.headers,

        // Legacy auth-server implementation provided these, but they are not valid nodemailer options...
        // preview: email.preview,
        // xMailer: false,
      };

      const info: nodemailer.SentMessageInfo =
        await this.emailClient.sendMail(sendMailPayload);

      this.log.debug('mailer.send', {
        status: info.response,
        id: info.messageId,
        to: email.to,
        isRetry,
        retryAttempt: attempt,
      });

      this.log.debug('mailer.send.1', {
        email: email.to,
        template: email.template,
        headers: Object.keys(email.headers).join(','),
        isRetry,
        retryAttempt: attempt,
      });

      const result: {
        sent: boolean;
        messageId?: string;
        response?: string;
        message?: string;
      } = {
        sent: true,
        messageId: info?.messageId,
        response: info?.response,
      };

      if (info?.message) {
        result.message = info.message;
      }

      // Relay email payload and send status back to calling code.
      return result;
    } catch (err) {
      // retry if configured
      if (!isFinalAttempt && backOffMs > 0) {
        this.statsd.increment('email.send.retry', {
          template: email.template,
        });

        const backoffDelay = this.calculateBackoffDelay(attempt);

        this.log.warn('mailer.send.retry', {
          err: err.message,
          to: email.to,
          template: email.template,
          retryAttempt: attempt,
          nextAttempt: attempt + 1,
          backoffMs: Math.round(backoffDelay),
        });

        // Wait for backoff period, then retry
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        return this.sendMail(email, ++attempt);
      }

      // This is the final failure - log and capture to Sentry
      if (isAppError(err)) {
        this.log.error('mailer.send.error', {
          err: err.message,
          code: err.code,
          errno: err.errno,
          to: email.to,
          template: email.template,
          isRetry,
          retryAttempt: attempt,
        });
      } else {
        this.log.error('mailer.send.error', {
          err: err.message,
          to: email.to,
          template: email.template,
          isRetry,
          retryAttempt: attempt,
        });
      }

      // Only capture to Sentry on final failure
      Sentry.captureException(err);

      if (isRetry) {
        this.statsd.increment('email.send.retry.failure', {
          template: email.template,
        });
      }

      // Throw error back to calling code.
      throw err;
    }
  }
}
