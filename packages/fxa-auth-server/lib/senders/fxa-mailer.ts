/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EmailLinkBuilder,
  NodeRendererBindings,
  WithFxaLayouts,
  recovery,
  passwordForgotOtp,
} from '@fxa/accounts/email-renderer';

import { EmailSender } from '@fxa/accounts/email-sender';
import { FxaEmailRenderer } from '@fxa/accounts/email-renderer';
import { ConfigType } from '../../config';

const SERVER = 'fxa-auth-server';

type EmailSenderOpts = {
  acceptLanguage: string;
  to: string;
  cc?: string[];
  timeZone?: string;
};

type EmailFlowParams = {
  deviceId?: string;
  flowId?: string;
  flowBeginTime?: number;
};

/**
 * Some links are required on the underlying types, but shouldn't be
 * the responsibility of the caller to provide. Use this to wrap templateValues
 * and layoutTemplateValues types to omit those fields.
 */
type OmitCommonLinks<T> = Omit<T, 'supportUrl' | 'privacyUrl' | 'link'>;

export class FxaMailer extends FxaEmailRenderer {
  constructor(
    private emailSender: EmailSender,
    private linkBuilder: EmailLinkBuilder,
    private mailerConfig: ConfigType['smtp'],
    bindings: NodeRendererBindings
  ) {
    super(bindings);
  }

  async sendRecoveryEmail(
    opts: EmailSenderOpts &
      EmailFlowParams & {
        uid: string;
        token: string;
        code: string;
        emailToHashWith?: string;
        service?: string;
        redirectTo?: string;
        resume?: string;
      } & OmitCommonLinks<WithFxaLayouts<recovery.TemplateData>>
  ) {
    const { template: name, version } = recovery;

    const link = new URL(this.linkBuilder.urls.initiatePasswordReset);

    this.linkBuilder.buildLinkWithQueryParamsAndUTM(link, name, {
      uid: opts.uid,
      token: opts.token,
      code: opts.code,
      email: opts.to,
    });

    if (opts.service) {
      link.searchParams.set('service', opts.service);
    }
    if (opts.redirectTo) {
      link.searchParams.set('redirectTo', opts.redirectTo);
    }
    if (opts.resume) {
      link.searchParams.set('resume', opts.resume);
    }
    if (opts.emailToHashWith) {
      link.searchParams.set('emailToHashWith', opts.emailToHashWith);
    }

    const { privacyUrl, supportUrl } = this.linkBuilder.buildCommonLinks(name);

    const rendered = await this.renderRecovery({
      ...opts,
      link: link.toString(),
      supportUrl,
      privacyUrl,
    });

    const headers = this.emailSender.buildHeaders({
      context: { ...opts, serverName: SERVER, language: opts.acceptLanguage },
      headers: {
        'X-Link': link.toString(),
        'X-Recovery-Code': opts.code,
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

  /**
   * Renders and sends the password forgot OTP email.
   * @param opts
   * @returns
   */
  async sendPasswordForgotOtpEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<WithFxaLayouts<passwordForgotOtp.TemplateData>>
  ) {
    const { template: name, version } = passwordForgotOtp;

    const { privacyUrl, supportUrl } = this.linkBuilder.buildCommonLinks(name);

    const rendered = await this.renderPasswordForgotOtp({
      ...opts,
      supportUrl,
      privacyUrl,
    });

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
