/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable, Provider } from '@nestjs/common';
import { Bounces, EmailSender } from '@fxa/accounts/email-sender';
import {
  EmailLinkBuilder,
  FxaEmailRenderer,
  NodeRendererBindings,
} from '@fxa/accounts/email-renderer';
import { AppConfig } from '../config';
import { Account } from 'fxa-shared/db/models/auth';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { StatsD } from 'hot-shots';
import { MozLoggerService } from '@fxa/shared/mozlog';

@Injectable()
export class EmailService {
  private get smtpConfig() {
    return this.configService.get('smtp') as AppConfig['smtp'];
  }

  private get linksConfig() {
    return this.configService.get('links') as AppConfig['links'];
  }

  constructor(
    private configService: ConfigService<AppConfig>,
    private readonly mailer: EmailSender,
    private readonly renderer: FxaEmailRenderer,
    private readonly linkBuilder: EmailLinkBuilder
  ) {}

  public async sendPasswordResetNotification(
    notifyEmail: string,
    status: Array<{ locator: string; status: string }>
  ) {
    const emailContent = await this.renderer.renderAdminResetAccounts(
      { status },
      this.getLayoutData()
    );

    const headers = await this.mailer.buildHeaders({
      template: {
        name: emailContent.template,
        version: emailContent.version,
      },
      context: {
        language: 'en',
        serverName: 'fxa-admin-server',
      },
      headers: {},
    });

    await this.mailer.send({
      to: notifyEmail,
      from: this.smtpConfig.sender,
      subject: emailContent.subject,
      preview: emailContent.preview,
      text: emailContent.text,
      template: emailContent.template,
      version: emailContent.version,
      html: emailContent.html,
      headers,
    });
  }

  public async sendPasswordChangeRequired(account: Account) {
    const smtpConfig = this.smtpConfig;
    const linksConfig = this.linksConfig;

    // Render the email
    const link = this.linkBuilder.buildPasswordChangeRequiredLink({
      url: linksConfig.initiatePasswordResetUrl,
      email: account.primaryEmail?.email || account.email,
    });

    const emailContent = await this.renderer.renderPasswordChangeRequired(
      { link },
      this.getLayoutData()
    );

    // Send the emails
    const headers = await this.mailer.buildHeaders({
      template: {
        name: emailContent.template,
        version: emailContent.version,
      },
      context: {
        uid: account.uid,
        language: account.locale,
        serverName: 'fxa-admin-server',
      },
      headers: {},
    });

    // Loop over account emails and send out emails
    const promises = [];
    for (const email of account.emails || []) {
      promises.push(
        this.mailer.send({
          to: email.email,
          from: smtpConfig.sender,
          subject: emailContent.subject,
          preview: emailContent.preview,
          text: emailContent.text,
          template: emailContent.template,
          version: emailContent.version,
          html: emailContent.html,
          headers,
        })
      );
    }
    // Run email in parallel so if one fails it doesn't stop
    // the other from failing...
    await Promise.all(promises);
  }

  private getLayoutData() {
    const linksConfig = this.linksConfig;
    return {
      sync: false,
      iosUrl: linksConfig.iosUrl,
      androidUrl: linksConfig.androidUrl,
      unsubscribeUrl: linksConfig.unsubscribeUrl,
      privacyUrl: linksConfig.privacyUrl,
      supportUrl: linksConfig.supportUrl,
    };
  }
}

export const EmailLinkBuilderFactory: Provider = {
  provide: EmailLinkBuilder,
  useFactory: async () => {
    return new EmailLinkBuilder();
  },
};

export const FxaEmailRendererFactory: Provider = {
  provide: FxaEmailRenderer,
  useFactory: async () => {
    const bindings = new NodeRendererBindings();
    return new FxaEmailRenderer(bindings);
  },
};

export const BouncesFactory: Provider = {
  provide: Bounces,
  useFactory: async (config: ConfigService<AppConfig>, db: DatabaseService) => {
    const bounceConfig = config.get('bounces') as AppConfig['bounces'];
    const bounces = new Bounces(bounceConfig, db);
    return bounces;
  },
  inject: [ConfigService, DatabaseService],
};

export const EmailSenderFactory: Provider = {
  provide: EmailSender,
  useFactory: async (
    config: ConfigService<AppConfig>,
    bounces: Bounces,
    statsd: StatsD,
    log: MozLoggerService
  ) => {
    // The actual email Sender
    const smtpConfig = config.get('smtp') as AppConfig['smtp'];
    const sender = new EmailSender(smtpConfig, bounces, statsd, log);
    return sender;
  },
  inject: [ConfigService, Bounces, 'METRICS', MozLoggerService],
};
