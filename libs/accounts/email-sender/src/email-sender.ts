/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SES } from '@aws-sdk/client-ses';
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

  /** Optional user name.  If not supplied, we fallback to local SES config. */
  user?: string;
  /** Optional password. If not supplied, we fallback to local SES config. */
  password?: string;
  sesConfigurationSet?: string;
  sender: string;
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
    // Determine auth credentials
    const auth = (() => {
      // If the user name and password are set use this
      if (config.user && config.password) {
        return {
          auth: {
            user: config.user,
            pass: config.password,
          },
        };
      }

      // Otherwise fallback to the SES configuration
      const ses = new SES({
        // The key apiVersion is no longer supported in v3, and can be removed.
        // @deprecated The client uses the "latest" apiVersion.
        apiVersion: '2010-12-01',
      });
      return {
        SES: { ses },
        sendingRate: 5,
        maxConnections: 10,
      };
    })();

    // Build node mailer options
    const options = {
      host: config.host,
      secure: config.secure,
      ignoreTLS: !config.secure,
      port: config.port,
      pool: config.pool,
      maxConnections: config.maxConnections,
      maxMessages: config.maxMessages,
      connectionTimeout: config.connectionTimeout,
      greetingTimeout: config.greetingTimeout,
      socketTimeout: config.socketTimeout,
      dnsTimeout: config.dnsTimeout,
      sendingRate: this.config.sendingRate,
      ...auth,
    };
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

  private async sendMail(email: Email): Promise<{
    sent: boolean;
    message?: string;
    messageId?: string;
    response?: string;
  }> {
    try {
      // Make sure X-Mailer: '' is set in headers. This used to be done by setting
      // xMailer to false in the options below.
      email.headers['X-Mailer'] = '';

      const info = await this.emailClient.sendMail({
        from: email.from,
        to: email.to,
        cc: email.cc,
        subject: email.subject,
        text: email.text,
        html: email.html,
        headers: email.headers,

        // Legacy auth-server implmentation provided these, but they are not valid nodemailer options...
        // preview: email.preview,
        // xMailer: false,
      });
      this.log.debug('mailer.send', {
        status: info.message,
        id: info.messageId,
        to: email.to,
      });

      this.log.debug('mailer.send.1', {
        email: email.to,
        template: email.template,
        headers: Object.keys(email.headers).join(','),
      });

      // Relay email payload and send status back to calling code.
      return {
        sent: true,
        message: info?.message,
        messageId: info?.messageId,
        response: info?.response,
      };
    } catch (err) {
      // Make sure error is logged & captured
      if (isAppError(err)) {
        this.log.error('mailer.send.error', {
          err: err.message,
          code: err.code,
          errno: err.errno,
          to: email.to,
          template: email.template,
        });
      } else {
        this.log.error('mailer.send.error', {
          err: err.message,
          to: email.to,
          template: email.template,
        });
      }

      // Being paranoid and capturing error manually...
      Sentry.captureException(err);

      // Throw error back to calling code.
      throw err;
    }
  }
}
