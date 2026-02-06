/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  TemplateData,
  EmailLinkBuilder,
  NodeRendererBindings,
  WithFxaLayouts,
  recovery,
  passwordForgotOtp,
  postVerifySecondary,
  postChangePrimary,
  postAddLinkedAccount,
  newDeviceLogin,
  postAddTwoStepAuthentication,
  postChangeTwoStepAuthentication,
  postRemoveTwoStepAuthentication,
  postNewRecoveryCodes,
  postConsumeRecoveryCode,
  lowRecoveryCodes,
  postSigninRecoveryCode,
  postAddRecoveryPhone,
  postChangeRecoveryPhone,
  postRemoveRecoveryPhone,
  passwordResetRecoveryPhone,
  postSigninRecoveryPhone,
  postAddAccountRecovery,
  postChangeAccountRecovery,
  postRemoveAccountRecovery,
  passwordResetAccountRecovery,
  passwordResetWithRecoveryKeyPrompt,
  postRemoveSecondary,
  RenderedTemplate,
  RecoveryLinkQueryParams,
  postVerify,
  verifyLoginCode,
  verifyShortCode,
  verify,
  verifyLogin,
  unblockCode,
  passwordChanged,
  passwordChangeRequired,
  passwordReset,
  verifyPrimary,
  verifySecondaryCode,
  verifyAccountChange,
  inactiveAccountFirstWarning,
  inactiveAccountSecondWarning,
  inactiveAccountFinalWarning,
  verificationReminderFirst,
  verificationReminderSecond,
  verificationReminderFinal,
  cadReminderFirst,
  cadReminderSecond,
} from '@fxa/accounts/email-renderer';

import { EmailSender } from '@fxa/accounts/email-sender';
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
    cmsRpFromName?: string;
    to: string;
    cc?: string[];
  };

/**
 * Some links are required on the underlying types, but shouldn't be
 * the responsibility of the caller to provide. Use this to wrap templateValues
 * and layoutTemplateValues types to omit those fields.
 *
 * Additional properties can be omitted by specifying them as the second generic parameter K.
 */
type OmitCommonLinks<T, K extends keyof T = never> = Omit<
  T,
  | 'supportUrl'
  | 'privacyUrl'
  | 'link'
  | 'passwordChangeLink'
  | 'revokeAccountRecoveryLink'
  | 'mozillaSupportUrl'
  | 'twoFactorSupportLink'
  | 'twoFactorSettingsLink'
  | 'resetLink'
  | 'desktopLink'
  | 'reportSignInLink'
  | 'unsubscribeUrl'
  | 'oneClickLink'
  | K
>;

export class FxaMailer extends FxaEmailRenderer {
  constructor(
    private emailSender: EmailSender,
    private linkBuilder: EmailLinkBuilder,
    private mailerConfig: ConfigType['smtp'],
    bindings: NodeRendererBindings
  ) {
    super(bindings);
  }

  /**
   * Feature flag esque method that signals if the template is supported by the new mailer. Used to easily
   * fall back to old email code if necessary.
   * @param templateName The name of the template to check on.
   * @returns True if the email can be sent, and false if the template is included in the SMTP_FXA_MAILER_DISABLE_SEND list.
   */
  canSend(templateName: string) {
    if (this.mailerConfig.fxaMailerDisableSend.includes(templateName)) {
      return false;
    }
    return true;
  }

  async sendRecoveryEmail(
    opts: EmailSenderOpts &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<recovery.TemplateData> &
      OmitCommonLinks<WithFxaLayouts<recovery.TemplateData>> &
      RecoveryLinkQueryParams
  ) {
    const { template, version } = recovery;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      link: this.linkBuilder.buildRecoveryLink(template, metricsEnabled, opts),
    };

    const headers = this.buildHeaders(
      { template, version },
      {
        'X-Link': links.link,
        'X-Recovery-Code': opts.code,
      },
      opts
    );
    const rendered = await this.renderRecovery({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
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
    const { template, version } = passwordForgotOtp;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'x-password-forgot-otp': opts.code },
      opts
    );
    const rendered = await this.renderPasswordForgotOtp({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostVerifySecondaryEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postVerifySecondary.TemplateData>
  ) {
    const { template, version } = postVerifySecondary;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        {
          email: opts.to,
          uid: opts.uid,
        }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostVerifySecondary({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostChangePrimaryEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postChangePrimary.TemplateData>
  ) {
    const { template, version } = postChangePrimary;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostChangePrimary({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostRemoveSecondaryEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postRemoveSecondary.TemplateData>
  ) {
    const { template, version } = postRemoveSecondary;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostRemoveSecondary({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostAddLinkedAccountEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postAddLinkedAccount.TemplateData>
  ) {
    const { template, version } = postAddLinkedAccount;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      {
        'X-Link': links.passwordChangeLink,
        'X-Linked-Account-Provider-Id': opts.providerName,
      },
      opts
    );
    const rendered = await this.renderPostAddLinkedAccount({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendNewDeviceLoginEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<newDeviceLogin.TemplateData>
  ) {
    const { template, version } = newDeviceLogin;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      mozillaSupportUrl: this.linkBuilder.buildMozillaSupportUrl(),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.passwordChangeLink },
      opts
    );
    const rendered = await this.renderNewDeviceLogin({
      ...opts,
      ...links,
    });

    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostAddTwoStepAuthenticationEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postAddTwoStepAuthentication.TemplateData>
  ) {
    const { template, version } = postAddTwoStepAuthentication;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      twoFactorSupportLink: this.linkBuilder.buildTwoFactorSupportLink(),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostAddTwoStepAuthentication({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostChangeTwoStepAuthenticationEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postChangeTwoStepAuthentication.TemplateData>
  ) {
    const { template, version } = postChangeTwoStepAuthentication;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      twoFactorSupportLink: this.linkBuilder.buildTwoFactorSupportLink(),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostChangeTwoStepAuthentication({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostRemoveTwoStepAuthenticationEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postRemoveTwoStepAuthentication.TemplateData>
  ) {
    const { template, version } = postRemoveTwoStepAuthentication;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostRemoveTwoStepAuthentication({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostNewRecoveryCodesEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postNewRecoveryCodes.TemplateData>
  ) {
    const { template, version } = postNewRecoveryCodes;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildPostNewRecoveryCodesLink(
        template,
        metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostNewRecoveryCodes({
      ...opts,
      ...links,
    });
    return this.emailSender.send({
      to: opts.to,
      cc: opts.cc,
      from: this.mailerConfig.sender,
      headers,
      ...rendered,
    });
  }

  async sendPostConsumeRecoveryCodeEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postConsumeRecoveryCode.TemplateData>
  ) {
    const { template, version } = postConsumeRecoveryCode;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      twoFactorSettingsLink: this.linkBuilder.buildTwoFactorSettignsLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
      resetLink: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostConsumeRecoveryCode({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendLowRecoveryCodesEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<lowRecoveryCodes.TemplateData>
  ) {
    const { template, version } = lowRecoveryCodes;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      link: this.linkBuilder.buildLowRecoveryCodesLink(
        template,
        metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
      resetLink: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderLowRecoveryCodes({
      ...opts,
      ...links,
    });
    return this.emailSender.send({
      to: opts.to,
      cc: opts.cc,
      from: this.mailerConfig.sender,
      headers,
      ...rendered,
    });
  }

  async sendPostSigninRecoveryCodeEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postSigninRecoveryCode.TemplateData>
  ) {
    const { template, version } = postSigninRecoveryCode;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      resetLink: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostSigninRecoveryCode({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostAddRecoveryPhoneEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postAddRecoveryPhone.TemplateData>
  ) {
    const { template, version } = postAddRecoveryPhone;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      twoFactorSupportLink: this.linkBuilder.buildTwoFactorSupportLink(),
      resetLink: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostAddRecoveryPhone({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostChangeRecoveryPhoneEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postChangeRecoveryPhone.TemplateData>
  ) {
    const { template, version } = postChangeRecoveryPhone;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      resetLink: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.resetLink },
      opts
    );
    const rendered = await this.renderPostChangeRecoveryPhone({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostRemoveRecoveryPhoneEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postRemoveRecoveryPhone.TemplateData>
  ) {
    const { template, version } = postRemoveRecoveryPhone;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      resetLink: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
      link: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostRemoveRecoveryPhone({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPasswordResetRecoveryPhoneEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<passwordResetRecoveryPhone.TemplateData>
  ) {
    const { template, version } = passwordResetRecoveryPhone;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      resetLink: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
      twoFactorSettingsLink: this.linkBuilder.buildTwoFactorSettignsLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPasswordResetRecoveryPhone({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostSigninRecoveryPhoneEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postSigninRecoveryPhone.TemplateData>
  ) {
    const { template, version } = postSigninRecoveryPhone;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      resetLink: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostSigninRecoveryPhone({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostAddAccountRecoveryEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postAddAccountRecovery.TemplateData>
  ) {
    const { template, version } = postAddAccountRecovery;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      revokeAccountRecoveryLink:
        this.linkBuilder.buildRevokeAccountRecoveryLink(
          template,
          metricsEnabled
        ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        {
          email: opts.to,
          uid: opts.uid,
        }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostAddAccountRecovery({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostChangeAccountRecoveryEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postChangeAccountRecovery.TemplateData>
  ) {
    const { template, version } = postChangeAccountRecovery;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      revokeAccountRecoveryLink:
        this.linkBuilder.buildRevokeAccountRecoveryLink(
          template,
          metricsEnabled
        ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostChangeAccountRecovery({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostRemoveAccountRecoveryEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postRemoveAccountRecovery.TemplateData>
  ) {
    const { template, version } = postRemoveAccountRecovery;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      revokeAccountRecoveryLink:
        this.linkBuilder.buildRevokeAccountRecoveryLink(
          template,
          metricsEnabled
        ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostRemoveAccountRecovery({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPasswordResetAccountRecoveryEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<passwordResetAccountRecovery.TemplateData>
  ) {
    const { template, version } = passwordResetAccountRecovery;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeRequiredLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPasswordResetAccountRecovery({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPasswordResetWithRecoveryKeyPromptEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<passwordResetWithRecoveryKeyPrompt.TemplateData>
  ) {
    const { template, version } = passwordResetWithRecoveryKeyPrompt;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeRequiredLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        opts.metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPasswordResetWithRecoveryKeyPrompt({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPostVerifyEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<postVerify.TemplateData>
  ) {
    const { template, version } = postVerify;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeRequiredLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      desktopLink: this.linkBuilder.buildDesktopLink(),
      link: this.linkBuilder.buildCadLink(template, opts.metricsEnabled),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPostVerify({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendVerifyLoginCodeEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<verifyLoginCode.TemplateData> & {
        redirectTo?: string;
        resume?: string;
      }
  ) {
    const { template, version } = verifyLoginCode;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeRequiredLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildVerifyLoginLink(template, metricsEnabled, {
        code: opts.code,
        uid: opts.uid,
        service: opts.serviceName,
        redirectTo: opts.redirectTo,
        resume: opts.resume,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Signin-Verify-Code': opts.code },
      opts
    );
    const rendered = await this.renderVerifyLoginCode({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendVerifyShortCodeEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<verifyShortCode.TemplateData>
  ) {
    const { template, version } = verifyShortCode;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeRequiredLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildVerifyShortCodeLink(
        template,
        metricsEnabled,
        {
          uid: opts.uid,
          email: opts.to,
        }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Verify-Short-Code': opts.code },
      opts
    );
    const rendered = await this.renderVerifyShortCode({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendVerifyEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<verify.TemplateData> & {
        code: string;
        service?: string;
        redirectTo?: string;
        resume?: string;
      }
  ) {
    const { template, version } = verify;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildVerifyEmailLink(template, metricsEnabled, {
        code: opts.code,
        uid: opts.uid,
        service: opts.service,
        redirectTo: opts.redirectTo,
        resume: opts.resume,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link, 'X-Verify-Code': opts.code },
      opts
    );
    const rendered = await this.renderVerify({
      ...opts,
      ...links,
    });
    return await this.sendEmail(opts, headers, rendered);
  }

  async sendVerifyLoginEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<verifyLogin.TemplateData> & {
        code: string;
        service?: string;
        redirectTo?: string;
        resume?: string;
      }
  ) {
    const { template, version } = verifyLogin;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildVerifyLoginLink(template, metricsEnabled, {
        code: opts.code,
        uid: opts.uid,
        service: opts.service,
        redirectTo: opts.redirectTo,
        resume: opts.resume,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link, 'X-Verify-Code': opts.code },
      opts
    );
    const rendered = await this.renderVerifyLogin({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendUnblockCodeEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<unblockCode.TemplateData> & {
        unblockCode: string;
      }
  ) {
    const { template, version } = unblockCode;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
      reportSignInLink: this.linkBuilder.buildReportSignInLink(
        template,
        metricsEnabled,
        { uid: opts.uid, unblockCode: opts.unblockCode }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      {
        'X-Unblock-Code': opts.unblockCode,
        'X-Report-SignIn-Link': links.reportSignInLink,
      },
      opts
    );
    const rendered = await this.renderUnblockCode({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPasswordChangedEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<passwordChanged.TemplateData>
  ) {
    const { template, version } = passwordChanged;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      resetLink: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.resetLink },
      opts
    );
    const rendered = await this.renderPasswordChanged({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPasswordChangeRequiredEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<passwordChangeRequired.TemplateData>
  ) {
    const { template, version } = passwordChangeRequired;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      link: this.linkBuilder.buildPasswordChangeRequiredLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link },
      opts
    );
    const rendered = await this.renderPasswordChangeRequired({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendPasswordResetEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<passwordReset.TemplateData>
  ) {
    const { template, version } = passwordReset;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      resetLink: this.linkBuilder.buildResetLink(template, metricsEnabled, {
        email: opts.to,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.resetLink },
      opts
    );
    const rendered = await this.renderPasswordReset({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendVerifyPrimaryEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<verifyPrimary.TemplateData> & {
        code: string;
        service?: string;
        redirectTo?: string;
        resume?: string;
      }
  ) {
    const { template, version } = verifyPrimary;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
      link: this.linkBuilder.buildVerifyEmailLink(template, metricsEnabled, {
        code: opts.code,
        uid: opts.uid,
        service: opts.service,
        redirectTo: opts.redirectTo,
        resume: opts.resume,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Link': links.link, 'X-Verify-Code': opts.code },
      opts
    );
    const rendered = await this.renderVerifyPrimary({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  /**
   * Email sent to secondary email for verification. Uses `opts.email` as the `to` address
   * @param opts
   * @returns
   */
  async sendVerifySecondaryCodeEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<verifySecondaryCode.TemplateData> & {
        code: string;
        service?: string;
        redirectTo?: string;
        resume?: string;
      }
  ) {
    // We assume that the inbound options.to is the primary account email
    // however, the .email property is the secondary email to send to
    const { template, version } = verifySecondaryCode;
    const { metricsEnabled, to: primaryEmail, email: secondaryEmail } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: primaryEmail }
      ),
      link: this.linkBuilder.buildVerifyEmailLink(template, metricsEnabled, {
        code: opts.code,
        uid: opts.uid,
        service: opts.service,
        redirectTo: opts.redirectTo,
        resume: opts.resume,
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Verify-Code': opts.code },
      opts
    );
    const rendered = await this.renderVerifySecondaryCode({
      ...opts,
      ...links,
    });
    // explicitly override the `to` to ensure we send to the right email
    return this.sendEmail({ ...opts, to: secondaryEmail }, headers, rendered);
  }

  async sendVerifyAccountChangeEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<verifyAccountChange.TemplateData> & {
        code: string;
        service?: string;
        redirectTo?: string;
        resume?: string;
      }
  ) {
    const { template, version } = verifyAccountChange;
    const { metricsEnabled } = opts;
    const links = {
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      passwordChangeLink: this.linkBuilder.buildPasswordChangeLink(
        template,
        metricsEnabled,
        { email: opts.to }
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      { 'X-Account-Change-Verify-Code': opts.code },
      opts
    );
    const rendered = await this.renderVerifyAccountChange({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  // inactive account email reminders
  async sendInactiveAccountFirstWarningEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<inactiveAccountFirstWarning.TemplateData>
  ) {
    const { template, version } = inactiveAccountFirstWarning;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      unsubscribeUrl: this.mailerConfig.unsubscribeUrl,
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders({ template, version }, {}, opts);
    const rendered = await this.renderInactiveAccountFirstWarning({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendInactiveAccountSecondWarningEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<inactiveAccountSecondWarning.TemplateData>
  ) {
    const { template, version } = inactiveAccountSecondWarning;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      unsubscribeUrl: this.mailerConfig.unsubscribeUrl,
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders({ template, version }, {}, opts);
    const rendered = await this.renderInactiveAccountSecondWarning({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendInactiveAccountFinalWarningEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<inactiveAccountFinalWarning.TemplateData>
  ) {
    const { template, version } = inactiveAccountFinalWarning;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      unsubscribeUrl: this.mailerConfig.unsubscribeUrl,
      link: this.linkBuilder.buildAccountSettingsLink(
        template,
        metricsEnabled,
        { email: opts.to, uid: opts.uid }
      ),
    };
    const headers = this.buildHeaders({ template, version }, {}, opts);
    const rendered = await this.renderInactiveAccountFinalWarning({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  // verification reminder emails
  async sendVerificationReminderFirstEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<verificationReminderFirst.TemplateData> & {
        email: string;
        code: string;
      }
  ) {
    const { template, version } = verificationReminderFirst;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      link: this.linkBuilder.buildVerifyEmailLink(template, metricsEnabled, {
        code: opts.code,
        uid: opts.uid,
        reminder: 'first',
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      {
        'X-Link': links.link,
        'X-Verify-Code': opts.code,
      },
      opts
    );
    const rendered = await this.renderVerificationReminderFirst({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendVerificationReminderSecondEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<verificationReminderSecond.TemplateData> & {
        email: string;
        code: string;
      }
  ) {
    const { template, version } = verificationReminderSecond;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      link: this.linkBuilder.buildVerifyEmailLink(template, metricsEnabled, {
        code: opts.code,
        uid: opts.uid,
        reminder: 'second',
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      {
        'X-Link': links.link,
        'X-Verify-Code': opts.code,
      },
      opts
    );
    const rendered = await this.renderVerificationReminderSecond({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendVerificationReminderFinalEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<verificationReminderFinal.TemplateData> & {
        email: string;
        code: string;
      }
  ) {
    const { template, version } = verificationReminderFinal;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      link: this.linkBuilder.buildVerifyEmailLink(template, metricsEnabled, {
        code: opts.code,
        uid: opts.uid,
        reminder: 'final',
      }),
    };
    const headers = this.buildHeaders(
      { template, version },
      {
        'X-Link': links.link,
        'X-Verify-Code': opts.code,
      },
      opts
    );
    const rendered = await this.renderVerificationReminderFinal({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendCadReminderFirstEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<cadReminderFirst.TemplateData>
  ) {
    const { template, version } = cadReminderFirst;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      link: this.linkBuilder.buildCadLink(template, metricsEnabled),
      oneClickLink: this.linkBuilder.buildCadLink(
        template,
        metricsEnabled,
        true
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      {
        'X-Link': links.link,
      },
      opts
    );
    const rendered = await this.renderCadReminderFirst({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  async sendCadReminderSecondEmail(
    opts: EmailSenderOpts &
      EmailFlowParams &
      OmitCommonLinks<TemplateData> &
      OmitCommonLinks<cadReminderSecond.TemplateData>
  ) {
    const { template, version } = cadReminderSecond;
    const { metricsEnabled } = opts;
    const links = {
      privacyUrl: this.linkBuilder.buildPrivacyLink(template, metricsEnabled),
      supportUrl: this.linkBuilder.buildSupportLink(template, metricsEnabled),
      link: this.linkBuilder.buildCadLink(template, metricsEnabled),
      oneClickLink: this.linkBuilder.buildCadLink(
        template,
        metricsEnabled,
        true
      ),
    };
    const headers = this.buildHeaders(
      { template, version },
      {
        'X-Link': links.link,
      },
      opts
    );
    const rendered = await this.renderCadReminderSecond({
      ...opts,
      ...links,
    });
    return this.sendEmail(opts, headers, rendered);
  }

  private buildHeaders(
    template: { template: string; version: number },
    headers: Record<string, string>,
    opts: {
      acceptLanguage: string;
      service?: string;
      deviceId?: string;
      flowId?: string;
      flowBeginTime?: number;
      uid?: string;
    }
  ) {
    return this.emailSender.buildHeaders({
      context: {
        ...opts,
        serverName: SERVER,
        language: opts.acceptLanguage,
      },
      headers,
      template: {
        name: template.template,
        version: template.version,
      },
    });
  }

  private async sendEmail(
    opts: { to: string; cc?: string[]; cmsRpFromName?: string },
    headers: Record<string, string>,
    rendered: RenderedTemplate
  ) {
    const { cmsRpFromName, to, cc } = opts;
    // Extract just the email address from the sender config (e.g., "Name <email@example.com>" -> "email@example.com")
    const senderEmail =
      this.mailerConfig.sender.indexOf('<') >= 0
        ? this.mailerConfig.sender.substring(
            this.mailerConfig.sender.indexOf('<') + 1,
            this.mailerConfig.sender.indexOf('>')
          )
        : this.mailerConfig.sender;
    const from = cmsRpFromName
      ? `${cmsRpFromName} <${senderEmail}>`
      : this.mailerConfig.sender;

    return this.emailSender.send({
      to,
      cc,
      from,
      headers,
      ...rendered,
    });
  }
}
