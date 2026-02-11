/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailRenderer } from './email-renderer';

import * as FxaLayouts from '../layouts/fxa';
import * as AdminResetAccounts from '../templates/adminResetAccounts';
import * as CadReminderFirst from '../templates/cadReminderFirst';
import * as CadReminderSecond from '../templates/cadReminderSecond';
import * as InactiveAccountFinalWarning from '../templates/inactiveAccountFinalWarning';
import * as InactiveAccountFirstWarning from '../templates/inactiveAccountFirstWarning';
import * as InactiveAccountSecondWarning from '../templates/inactiveAccountSecondWarning';
import * as LowRecoveryCodes from '../templates/lowRecoveryCodes';
import * as NewDeviceLogin from '../templates/newDeviceLogin';
import * as PasswordChanged from '../templates/passwordChanged';
import * as PasswordChangeRequired from '../templates/passwordChangeRequired';
import * as PasswordForgotOtp from '../templates/passwordForgotOtp';
import * as PasswordlessSigninOtp from '../templates/passwordlessSigninOtp';
import * as PasswordlessSignupOtp from '../templates/passwordlessSignupOtp';
import * as PasswordReset from '../templates/passwordReset';
import * as PasswordResetAccountRecovery from '../templates/passwordResetAccountRecovery';
import * as PasswordResetRecoveryPhone from '../templates/passwordResetRecoveryPhone';
import * as PasswordResetWithRecoveryKeyPrompt from '../templates/passwordResetWithRecoveryKeyPrompt';
import * as PostAddAccountRecovery from '../templates/postAddAccountRecovery';
import * as PostAddLinkedAccount from '../templates/postAddLinkedAccount';
import * as PostAddRecoveryPhone from '../templates/postAddRecoveryPhone';
import * as PostAddTwoStepAuthentication from '../templates/postAddTwoStepAuthentication';
import * as PostChangeAccountRecovery from '../templates/postChangeAccountRecovery';
import * as PostChangePrimary from '../templates/postChangePrimary';
import * as PostChangeRecoveryPhone from '../templates/postChangeRecoveryPhone';
import * as PostChangeTwoStepAuthentication from '../templates/postChangeTwoStepAuthentication';
import * as PostConsumeRecoveryCode from '../templates/postConsumeRecoveryCode';
import * as PostNewRecoveryCodes from '../templates/postNewRecoveryCodes';
import * as PostRemoveAccountRecovery from '../templates/postRemoveAccountRecovery';
import * as PostRemoveRecoveryPhone from '../templates/postRemoveRecoveryPhone';
import * as PostRemoveSecondary from '../templates/postRemoveSecondary';
import * as PostRemoveTwoStepAuthentication from '../templates/postRemoveTwoStepAuthentication';
import * as PostSigninRecoveryCode from '../templates/postSigninRecoveryCode';
import * as PostSigninRecoveryPhone from '../templates/postSigninRecoveryPhone';
import * as PostVerify from '../templates/postVerify';
import * as PostVerifySecondary from '../templates/postVerifySecondary';
import * as Recovery from '../templates/recovery';
import * as UnblockCode from '../templates/unblockCode';
import * as VerificationReminderFinal from '../templates/verificationReminderFinal';
import * as VerificationReminderFirst from '../templates/verificationReminderFirst';
import * as VerificationReminderSecond from '../templates/verificationReminderSecond';
import * as Verify from '../templates/verify';
import * as VerifyAccountChange from '../templates/verifyAccountChange';
import * as VerifyLogin from '../templates/verifyLogin';
import * as VerifyLoginCode from '../templates/verifyLoginCode';
import * as VerifyPrimary from '../templates/verifyPrimary';
import * as VerifySecondaryCode from '../templates/verifySecondaryCode';
import * as VerifyShortCode from '../templates/verifyShortCode';

export type WithFxaLayouts<T> = T & FxaLayouts.TemplateData;

export class FxaEmailRenderer extends EmailRenderer {
  renderAdminResetAccounts(
    opts: WithFxaLayouts<AdminResetAccounts.TemplateData>
  ) {
    return this.renderEmail({
      template: AdminResetAccounts.template,
      version: AdminResetAccounts.version,
      layout: AdminResetAccounts.layout,
      includes: AdminResetAccounts.includes,
      ...opts,
    });
  }

  async renderCadReminderFirst(
    opts: WithFxaLayouts<CadReminderFirst.TemplateData>
  ) {
    return this.renderEmail({
      template: CadReminderFirst.template,
      version: CadReminderFirst.version,
      layout: CadReminderFirst.layout,
      includes: CadReminderFirst.includes,
      ...opts,
    });
  }

  async renderCadReminderSecond(
    opts: WithFxaLayouts<CadReminderSecond.TemplateData>
  ) {
    return this.renderEmail({
      template: CadReminderSecond.template,
      version: CadReminderSecond.version,
      layout: CadReminderSecond.layout,
      includes: CadReminderSecond.includes,
      ...opts,
    });
  }

  async renderInactiveAccountFinalWarning(
    opts: WithFxaLayouts<InactiveAccountFinalWarning.TemplateData>
  ) {
    return this.renderEmail({
      template: InactiveAccountFinalWarning.template,
      version: InactiveAccountFinalWarning.version,
      layout: InactiveAccountFinalWarning.layout,
      includes: InactiveAccountFinalWarning.includes,
      ...opts,
    });
  }

  async renderInactiveAccountFirstWarning(
    opts: WithFxaLayouts<InactiveAccountFirstWarning.TemplateData>
  ) {
    return this.renderEmail({
      template: InactiveAccountFirstWarning.template,
      version: InactiveAccountFirstWarning.version,
      layout: InactiveAccountFirstWarning.layout,
      includes: InactiveAccountFirstWarning.includes,
      ...opts,
    });
  }

  async renderInactiveAccountSecondWarning(
    opts: WithFxaLayouts<InactiveAccountSecondWarning.TemplateData>
  ) {
    return this.renderEmail({
      template: InactiveAccountSecondWarning.template,
      version: InactiveAccountSecondWarning.version,
      layout: InactiveAccountSecondWarning.layout,
      includes: InactiveAccountSecondWarning.includes,
      ...opts,
    });
  }

  async renderLowRecoveryCodes(
    opts: WithFxaLayouts<LowRecoveryCodes.TemplateData>
  ) {
    return this.renderEmail({
      template: LowRecoveryCodes.template,
      version: LowRecoveryCodes.version,
      layout: LowRecoveryCodes.layout,
      includes: LowRecoveryCodes.getIncludes(opts),
      ...opts,
    });
  }

  async renderNewDeviceLogin(
    opts: WithFxaLayouts<NewDeviceLogin.TemplateData>
  ) {
    return this.renderEmail({
      template: NewDeviceLogin.template,
      version: NewDeviceLogin.version,
      layout: NewDeviceLogin.layout,
      includes: NewDeviceLogin.getIncludes(opts),
      ...opts,
    });
  }

  renderNewDeviceLoginStrapi(
    opts: WithFxaLayouts<NewDeviceLogin.TemplateData>
  ) {
    return this.renderEmail({
      template: NewDeviceLogin.template,
      version: NewDeviceLogin.version,
      layout: NewDeviceLogin.layout,
      includes: NewDeviceLogin.getIncludes(opts),
      ...opts,
      target: 'strapi',
    });
  }

  async renderPasswordChanged(
    opts: WithFxaLayouts<PasswordChanged.TemplateData>
  ) {
    return this.renderEmail({
      template: PasswordChanged.template,
      version: PasswordChanged.version,
      layout: PasswordChanged.layout,
      includes: PasswordChanged.includes,
      ...opts,
    });
  }

  async renderPasswordChangeRequired(
    opts: WithFxaLayouts<PasswordChangeRequired.TemplateData>
  ) {
    return this.renderEmail({
      template: PasswordChangeRequired.template,
      version: PasswordChangeRequired.version,
      layout: PasswordChangeRequired.layout,
      includes: PasswordChangeRequired.includes,
      ...opts,
    });
  }

  async renderPasswordForgotOtp(
    opts: WithFxaLayouts<PasswordForgotOtp.TemplateData>
  ) {
    return this.renderEmail({
      template: PasswordForgotOtp.template,
      version: PasswordForgotOtp.version,
      layout: PasswordForgotOtp.layout,
      includes: PasswordForgotOtp.includes,
      ...opts,
    });
  }

  async renderPasswordlessSigninOtp(
    opts: WithFxaLayouts<PasswordlessSigninOtp.TemplateData>
  ) {
    return this.renderEmail({
      template: PasswordlessSigninOtp.template,
      version: PasswordlessSigninOtp.version,
      layout: PasswordlessSigninOtp.layout,
      includes: PasswordlessSigninOtp.includes,
      ...opts,
    });
  }

  async renderPasswordlessSignupOtp(
    opts: WithFxaLayouts<PasswordlessSignupOtp.TemplateData>
  ) {
    return this.renderEmail({
      template: PasswordlessSignupOtp.template,
      version: PasswordlessSignupOtp.version,
      layout: PasswordlessSignupOtp.layout,
      includes: PasswordlessSignupOtp.includes,
      ...opts,
    });
  }

  async renderPasswordReset(opts: WithFxaLayouts<PasswordReset.TemplateData>) {
    return this.renderEmail({
      template: PasswordReset.template,
      version: PasswordReset.version,
      layout: PasswordReset.layout,
      includes: PasswordReset.includes,
      ...opts,
    });
  }

  async renderPasswordResetAccountRecovery(
    opts: WithFxaLayouts<PasswordResetAccountRecovery.TemplateData>
  ) {
    return this.renderEmail({
      template: PasswordResetAccountRecovery.template,
      version: PasswordResetAccountRecovery.version,
      layout: PasswordResetAccountRecovery.layout,
      includes: PasswordResetAccountRecovery.includes,
      ...opts,
    });
  }

  async renderPasswordResetRecoveryPhone(
    opts: WithFxaLayouts<PasswordResetRecoveryPhone.TemplateData>
  ) {
    return this.renderEmail({
      template: PasswordResetRecoveryPhone.template,
      version: PasswordResetRecoveryPhone.version,
      layout: PasswordResetRecoveryPhone.layout,
      includes: PasswordResetRecoveryPhone.includes,
      ...opts,
    });
  }

  async renderPasswordResetWithRecoveryKeyPrompt(
    opts: WithFxaLayouts<PasswordResetWithRecoveryKeyPrompt.TemplateData>
  ) {
    return this.renderEmail({
      template: PasswordResetWithRecoveryKeyPrompt.template,
      version: PasswordResetWithRecoveryKeyPrompt.version,
      layout: PasswordResetWithRecoveryKeyPrompt.layout,
      includes: PasswordResetWithRecoveryKeyPrompt.includes,
      ...opts,
    });
  }

  async renderPostAddAccountRecovery(
    opts: WithFxaLayouts<PostAddAccountRecovery.TemplateData>
  ) {
    return this.renderEmail({
      template: PostAddAccountRecovery.template,
      version: PostAddAccountRecovery.version,
      layout: PostAddAccountRecovery.layout,
      includes: PostAddAccountRecovery.includes,
      ...opts,
    });
  }

  async renderPostAddLinkedAccount(
    opts: WithFxaLayouts<PostAddLinkedAccount.TemplateData>
  ) {
    return this.renderEmail({
      template: PostAddLinkedAccount.template,
      version: PostAddLinkedAccount.version,
      layout: PostAddLinkedAccount.layout,
      includes: PostAddLinkedAccount.includes,
      ...opts,
    });
  }

  async renderPostAddRecoveryPhone(
    opts: WithFxaLayouts<PostAddRecoveryPhone.TemplateData>
  ) {
    return this.renderEmail({
      template: PostAddRecoveryPhone.template,
      version: PostAddRecoveryPhone.version,
      layout: PostAddRecoveryPhone.layout,
      includes: PostAddRecoveryPhone.includes,
      ...opts,
    });
  }

  async renderPostAddTwoStepAuthentication(
    opts: WithFxaLayouts<PostAddTwoStepAuthentication.TemplateData>
  ) {
    return this.renderEmail({
      template: PostAddTwoStepAuthentication.template,
      version: PostAddTwoStepAuthentication.version,
      layout: PostAddTwoStepAuthentication.layout,
      includes: PostAddTwoStepAuthentication.includes,
      ...opts,
    });
  }

  async renderPostChangeAccountRecovery(
    opts: WithFxaLayouts<PostChangeAccountRecovery.TemplateData>
  ) {
    return this.renderEmail({
      template: PostChangeAccountRecovery.template,
      version: PostChangeAccountRecovery.version,
      layout: PostChangeAccountRecovery.layout,
      includes: PostChangeAccountRecovery.includes,
      ...opts,
    });
  }

  async renderPostChangePrimary(
    opts: WithFxaLayouts<PostChangePrimary.TemplateData>
  ) {
    return this.renderEmail({
      template: PostChangePrimary.template,
      version: PostChangePrimary.version,
      layout: PostChangePrimary.layout,
      includes: PostChangePrimary.includes,
      ...opts,
    });
  }

  async renderPostChangeRecoveryPhone(
    opts: WithFxaLayouts<PostChangeRecoveryPhone.TemplateData>
  ) {
    return this.renderEmail({
      template: PostChangeRecoveryPhone.template,
      version: PostChangeRecoveryPhone.version,
      layout: PostChangeRecoveryPhone.layout,
      includes: PostChangeRecoveryPhone.includes,
      ...opts,
    });
  }

  async renderPostChangeTwoStepAuthentication(
    opts: WithFxaLayouts<PostChangeTwoStepAuthentication.TemplateData>
  ) {
    return this.renderEmail({
      template: PostChangeTwoStepAuthentication.template,
      version: PostChangeTwoStepAuthentication.version,
      layout: PostChangeTwoStepAuthentication.layout,
      includes: PostChangeTwoStepAuthentication.includes,
      ...opts,
    });
  }

  async renderPostConsumeRecoveryCode(
    opts: WithFxaLayouts<PostConsumeRecoveryCode.TemplateData>
  ) {
    return this.renderEmail({
      template: PostConsumeRecoveryCode.template,
      version: PostConsumeRecoveryCode.version,
      layout: PostConsumeRecoveryCode.layout,
      includes: PostConsumeRecoveryCode.includes,
      ...opts,
    });
  }

  async renderPostNewRecoveryCodes(
    opts: WithFxaLayouts<PostNewRecoveryCodes.TemplateData>
  ) {
    return this.renderEmail({
      template: PostNewRecoveryCodes.template,
      version: PostNewRecoveryCodes.version,
      layout: PostNewRecoveryCodes.layout,
      includes: PostNewRecoveryCodes.includes,
      ...opts,
    });
  }

  async renderPostRemoveAccountRecovery(
    opts: WithFxaLayouts<PostRemoveAccountRecovery.TemplateData>
  ) {
    return this.renderEmail({
      template: PostRemoveAccountRecovery.template,
      version: PostRemoveAccountRecovery.version,
      layout: PostRemoveAccountRecovery.layout,
      includes: PostRemoveAccountRecovery.includes,
      ...opts,
    });
  }

  async renderPostRemoveRecoveryPhone(
    opts: WithFxaLayouts<PostRemoveRecoveryPhone.TemplateData>
  ) {
    return this.renderEmail({
      template: PostRemoveRecoveryPhone.template,
      version: PostRemoveRecoveryPhone.version,
      layout: PostRemoveRecoveryPhone.layout,
      includes: PostRemoveRecoveryPhone.includes,
      ...opts,
    });
  }

  async renderPostRemoveSecondary(
    opts: WithFxaLayouts<PostRemoveSecondary.TemplateData>
  ) {
    return this.renderEmail({
      template: PostRemoveSecondary.template,
      version: PostRemoveSecondary.version,
      layout: PostRemoveSecondary.layout,
      includes: PostRemoveSecondary.includes,
      ...opts,
    });
  }

  async renderPostRemoveTwoStepAuthentication(
    opts: WithFxaLayouts<PostRemoveTwoStepAuthentication.TemplateData>
  ) {
    return this.renderEmail({
      template: PostRemoveTwoStepAuthentication.template,
      version: PostRemoveTwoStepAuthentication.version,
      layout: PostRemoveTwoStepAuthentication.layout,
      includes: PostRemoveTwoStepAuthentication.includes,
      ...opts,
    });
  }

  async renderPostSigninRecoveryCode(
    opts: WithFxaLayouts<PostSigninRecoveryCode.TemplateData>
  ) {
    return this.renderEmail({
      template: PostSigninRecoveryCode.template,
      version: PostSigninRecoveryCode.version,
      layout: PostSigninRecoveryCode.layout,
      includes: PostSigninRecoveryCode.includes,
      ...opts,
    });
  }

  async renderPostSigninRecoveryPhone(
    opts: WithFxaLayouts<PostSigninRecoveryPhone.TemplateData>
  ) {
    return this.renderEmail({
      template: PostSigninRecoveryPhone.template,
      version: PostSigninRecoveryPhone.version,
      layout: PostSigninRecoveryPhone.layout,
      includes: PostSigninRecoveryPhone.includes,
      ...opts,
    });
  }

  async renderPostVerify(opts: WithFxaLayouts<PostVerify.TemplateData>) {
    return this.renderEmail({
      template: PostVerify.template,
      version: PostVerify.version,
      layout: PostVerify.layout,
      includes: PostVerify.includes,
      ...opts,
    });
  }

  async renderPostVerifySecondary(
    opts: WithFxaLayouts<PostVerifySecondary.TemplateData>
  ) {
    return this.renderEmail({
      template: PostVerifySecondary.template,
      version: PostVerifySecondary.version,
      layout: PostVerifySecondary.layout,
      includes: PostVerifySecondary.includes,
      ...opts,
    });
  }

  async renderRecovery(opts: WithFxaLayouts<Recovery.TemplateData>) {
    return this.renderEmail({
      template: Recovery.template,
      version: Recovery.version,
      layout: Recovery.layout,
      includes: Recovery.includes,
      ...opts,
    });
  }

  async renderUnblockCode(opts: WithFxaLayouts<UnblockCode.TemplateData>) {
    return this.renderEmail({
      template: UnblockCode.template,
      version: UnblockCode.version,
      layout: UnblockCode.layout,
      includes: UnblockCode.includes,
      ...opts,
    });
  }

  async renderVerificationReminderFinal(
    opts: WithFxaLayouts<VerificationReminderFinal.TemplateData>
  ) {
    return this.renderEmail({
      template: VerificationReminderFinal.template,
      version: VerificationReminderFinal.version,
      layout: VerificationReminderFinal.layout,
      includes: VerificationReminderFinal.includes,
      ...opts,
    });
  }

  async renderVerificationReminderFirst(
    opts: WithFxaLayouts<VerificationReminderFirst.TemplateData>
  ) {
    return this.renderEmail({
      template: VerificationReminderFirst.template,
      version: VerificationReminderFirst.version,
      layout: VerificationReminderFirst.layout,
      includes: VerificationReminderFirst.includes,
      ...opts,
    });
  }

  async renderVerificationReminderSecond(
    opts: WithFxaLayouts<VerificationReminderSecond.TemplateData>
  ) {
    return this.renderEmail({
      template: VerificationReminderSecond.template,
      version: VerificationReminderSecond.version,
      layout: VerificationReminderSecond.layout,
      includes: VerificationReminderSecond.includes,
      ...opts,
    });
  }

  async renderVerify(opts: WithFxaLayouts<Verify.TemplateData>) {
    return this.renderEmail({
      template: Verify.template,
      version: Verify.version,
      layout: Verify.layout,
      includes: Verify.includes,
      ...opts,
    });
  }

  async renderVerifyAccountChange(
    opts: WithFxaLayouts<VerifyAccountChange.TemplateData>
  ) {
    return this.renderEmail({
      template: VerifyAccountChange.template,
      version: VerifyAccountChange.version,
      layout: VerifyAccountChange.layout,
      includes: VerifyAccountChange.includes,
      ...opts,
    });
  }

  async renderVerifyLogin(opts: WithFxaLayouts<VerifyLogin.TemplateData>) {
    return this.renderEmail({
      template: VerifyLogin.template,
      version: VerifyLogin.version,
      layout: VerifyLogin.layout,
      includes: VerifyLogin.includes,
      ...opts,
    });
  }

  async renderVerifyLoginCode(
    opts: WithFxaLayouts<VerifyLoginCode.TemplateData>
  ) {
    return this.renderEmail({
      template: VerifyLoginCode.template,
      version: VerifyLoginCode.version,
      layout: VerifyLoginCode.layout,
      includes: VerifyLoginCode.includes,
      ...opts,
    });
  }

  async renderVerifyPrimary(opts: WithFxaLayouts<VerifyPrimary.TemplateData>) {
    return this.renderEmail({
      template: VerifyPrimary.template,
      version: VerifyPrimary.version,
      layout: VerifyPrimary.layout,
      includes: VerifyPrimary.includes,
      ...opts,
    });
  }

  async renderVerifySecondaryCode(
    opts: WithFxaLayouts<VerifySecondaryCode.TemplateData>
  ) {
    return this.renderEmail({
      template: VerifySecondaryCode.template,
      version: VerifySecondaryCode.version,
      layout: VerifySecondaryCode.layout,
      includes: VerifySecondaryCode.includes,
      ...opts,
    });
  }

  async renderVerifyShortCode(
    opts: WithFxaLayouts<VerifyShortCode.TemplateData>
  ) {
    return this.renderEmail({
      template: VerifyShortCode.template,
      version: VerifyShortCode.version,
      layout: VerifyShortCode.layout,
      includes: VerifyShortCode.includes,
      ...opts,
    });
  }
}
