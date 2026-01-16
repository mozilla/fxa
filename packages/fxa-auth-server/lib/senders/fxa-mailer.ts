/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as renderer from '@fxa/accounts/email-renderer';
import * as sender from '@fxa/accounts/email-sender';

import { FxaEmailRenderer } from '@fxa/accounts/email-renderer';
import { ConfigType } from '../../config';

const SERVER = 'fxa-auth-server';

type AccountOpts = {
  uid: string;
  metricsEnabled: boolean;
  acceptLanguage: string;
  timeZone: string;
};

type EmailFlowParams = {
  deviceId?: string;
  flowId?: string;
  flowBeginTime?: number;
};

type EmailSenderOpts = AccountOpts &
  EmailFlowParams & {
    to: string;
    cc?: string[];
  };

/**
 * Some links are required on the underlying types, but shouldn't be
 * the responsibility of the caller to provide. Use this to wrap templateValues
 * and layoutTemplateValues types to omit those fields.
 */
type OmitCommonLinks<T> = Omit<T, 'supportUrl' | 'privacyUrl' | 'link'>;

export class FxaMailer extends FxaEmailRenderer {
  constructor(
    private emailSender: sender.EmailSender,
    private linkBuilder: renderer.EmailLinkBuilder,
    private mailerConfig: ConfigType['smtp'],
    bindings: renderer.NodeRendererBindings
  ) {
    super(bindings);
  }

  async sendRecoveryEmail(
    opts: EmailSenderOpts &
      OmitCommonLinks<renderer.TemplateData> &
      OmitCommonLinks<renderer.recovery.TemplateData> & {
        token: string;
        code: string;
        emailToHashWith?: string;
        service?: string;
        redirectTo?: string;
        resume?: string;
      }
  ) {
    const { template: name, version } = renderer.recovery;

    // Build links for template
    const initiatePasswordResetLink =
      this.linkBuilder.buildInitiatePasswordResetLink(
        {
          uid: opts.uid,
          token: opts.token,
          code: opts.code,
          email: opts.to,
          service: opts.service,
          redirectTo: opts.redirectTo,
          resume: opts.resume,
          emailToHashWith: opts.emailToHashWith,
        },
        opts.metricsEnabled
      );
    const links = this.linkBuilder.buildCommonLinks(name, opts.metricsEnabled);

    const rendered = await this.renderRecovery(
      {
        ...opts,
        link: initiatePasswordResetLink,
        supportUrl: links.supportUrl,
      },
      {
        ...opts,
        privacyUrl: links.privacyUrl,
      }
    );

    const headers = this.emailSender.buildHeaders({
      context: { ...opts, serverName: SERVER, language: opts.acceptLanguage },
      headers: {
        'X-Link': initiatePasswordResetLink,
        'X-Recovery-Code': opts.code,
      },
      template: {
        name,
        version,
      },
    });

    // Send email
    return this.emailSender.send({
      to: opts.to,
      cc: opts.cc,
      from: this.mailerConfig.sender,
      headers,
      ...rendered,
    });
  }

  /**
   * Renders and sends the password forgot OTP email.
   * @param opts
   * @returns
   */
  async sendPasswordForgotOtpEmail(
    opts: EmailSenderOpts &
      OmitCommonLinks<renderer.TemplateData> &
      OmitCommonLinks<renderer.passwordForgotOtp.TemplateData>
  ) {
    const { template: name, version } = renderer.passwordForgotOtp;

    const { privacyUrl, supportUrl } = this.linkBuilder.buildCommonLinks(
      name,
      opts.metricsEnabled
    );

    const rendered = await this.renderPasswordForgotOtp(
      { ...opts, supportUrl },
      { ...opts, privacyUrl }
    );

    const headers = this.emailSender.buildHeaders({
      context: { ...opts, serverName: SERVER, language: opts.acceptLanguage },
      headers: {
        'x-password-forgot-otp': opts.code,
      },
      template: {
        name,
        version,
      },
    });

    return this.emailSender.send({
      to: opts.to,
      cc: opts.cc,
      from: this.mailerConfig.sender,
      headers,
      ...rendered,
    });
  }
}
