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

export class FxaEmailRenderer extends EmailRenderer {
  renderAdminResetAccounts(
    templateValues: AdminResetAccounts.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: AdminResetAccounts.template,
      version: AdminResetAccounts.version,
      layout: AdminResetAccounts.layout,
      includes: AdminResetAccounts.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderCadReminderFirst(
    templateValues: CadReminderFirst.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: CadReminderFirst.template,
      version: CadReminderFirst.version,
      layout: CadReminderFirst.layout,
      includes: CadReminderFirst.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderCadReminderSecond(
    templateValues: CadReminderSecond.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: CadReminderSecond.template,
      version: CadReminderSecond.version,
      layout: CadReminderSecond.layout,
      includes: CadReminderSecond.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderInactiveAccountFinalWarning(
    templateValues: InactiveAccountFinalWarning.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: InactiveAccountFinalWarning.template,
      version: InactiveAccountFinalWarning.version,
      layout: InactiveAccountFinalWarning.layout,
      includes: InactiveAccountFinalWarning.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderInactiveAccountFirstWarning(
    templateValues: InactiveAccountFirstWarning.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: InactiveAccountFirstWarning.template,
      version: InactiveAccountFirstWarning.version,
      layout: InactiveAccountFirstWarning.layout,
      includes: InactiveAccountFirstWarning.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderInactiveAccountSecondWarning(
    templateValues: InactiveAccountSecondWarning.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: InactiveAccountSecondWarning.template,
      version: InactiveAccountSecondWarning.version,
      layout: InactiveAccountSecondWarning.layout,
      includes: InactiveAccountSecondWarning.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderLowRecoveryCodes(
    templateValues: LowRecoveryCodes.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: LowRecoveryCodes.template,
      version: LowRecoveryCodes.version,
      layout: LowRecoveryCodes.layout,
      includes: LowRecoveryCodes.getIncludes(templateValues),
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderNewDeviceLogin(
    templateValues: NewDeviceLogin.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: NewDeviceLogin.template,
      version: NewDeviceLogin.version,
      layout: NewDeviceLogin.layout,
      includes: NewDeviceLogin.getIncludes(templateValues),
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPasswordChanged(
    templateValues: PasswordChanged.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PasswordChanged.template,
      version: PasswordChanged.version,
      layout: PasswordChanged.layout,
      includes: PasswordChanged.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPasswordChangeRequired(
    templateValues: PasswordChangeRequired.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PasswordChangeRequired.template,
      version: PasswordChangeRequired.version,
      layout: PasswordChangeRequired.layout,
      includes: PasswordChangeRequired.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPasswordForgotOtp(
    templateValues: PasswordForgotOtp.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PasswordForgotOtp.template,
      version: PasswordForgotOtp.version,
      layout: PasswordForgotOtp.layout,
      includes: PasswordForgotOtp.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPasswordReset(
    templateValues: PasswordReset.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PasswordReset.template,
      version: PasswordReset.version,
      layout: PasswordReset.layout,
      includes: PasswordReset.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPasswordResetAccountRecovery(
    templateValues: PasswordResetAccountRecovery.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PasswordResetAccountRecovery.template,
      version: PasswordResetAccountRecovery.version,
      layout: PasswordResetAccountRecovery.layout,
      includes: PasswordResetAccountRecovery.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPasswordResetRecoveryPhone(
    templateValues: PasswordResetRecoveryPhone.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PasswordResetRecoveryPhone.template,
      version: PasswordResetRecoveryPhone.version,
      layout: PasswordResetRecoveryPhone.layout,
      includes: PasswordResetRecoveryPhone.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPasswordResetWithRecoveryKeyPrompt(
    templateValues: PasswordResetWithRecoveryKeyPrompt.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PasswordResetWithRecoveryKeyPrompt.template,
      version: PasswordResetWithRecoveryKeyPrompt.version,
      layout: PasswordResetWithRecoveryKeyPrompt.layout,
      includes: PasswordResetWithRecoveryKeyPrompt.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostAddAccountRecovery(
    templateValues: PostAddAccountRecovery.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostAddAccountRecovery.template,
      version: PostAddAccountRecovery.version,
      layout: PostAddAccountRecovery.layout,
      includes: PostAddAccountRecovery.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostAddLinkedAccount(
    templateValues: PostAddLinkedAccount.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostAddLinkedAccount.template,
      version: PostAddLinkedAccount.version,
      layout: PostAddLinkedAccount.layout,
      includes: PostAddLinkedAccount.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostAddRecoveryPhone(
    templateValues: PostAddRecoveryPhone.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostAddRecoveryPhone.template,
      version: PostAddRecoveryPhone.version,
      layout: PostAddRecoveryPhone.layout,
      includes: PostAddRecoveryPhone.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostAddTwoStepAuthentication(
    templateValues: PostAddTwoStepAuthentication.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostAddTwoStepAuthentication.template,
      version: PostAddTwoStepAuthentication.version,
      layout: PostAddTwoStepAuthentication.layout,
      includes: PostAddTwoStepAuthentication.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostChangeAccountRecovery(
    templateValues: PostChangeAccountRecovery.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostChangeAccountRecovery.template,
      version: PostChangeAccountRecovery.version,
      layout: PostChangeAccountRecovery.layout,
      includes: PostChangeAccountRecovery.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostChangePrimary(
    templateValues: PostChangePrimary.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostChangePrimary.template,
      version: PostChangePrimary.version,
      layout: PostChangePrimary.layout,
      includes: PostChangePrimary.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostChangeRecoveryPhone(
    templateValues: PostChangeRecoveryPhone.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostChangeRecoveryPhone.template,
      version: PostChangeRecoveryPhone.version,
      layout: PostChangeRecoveryPhone.layout,
      includes: PostChangeRecoveryPhone.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostChangeTwoStepAuthentication(
    templateValues: PostChangeTwoStepAuthentication.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostChangeTwoStepAuthentication.template,
      version: PostChangeTwoStepAuthentication.version,
      layout: PostChangeTwoStepAuthentication.layout,
      includes: PostChangeTwoStepAuthentication.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostConsumeRecoveryCode(
    templateValues: PostConsumeRecoveryCode.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostConsumeRecoveryCode.template,
      version: PostConsumeRecoveryCode.version,
      layout: PostConsumeRecoveryCode.layout,
      includes: PostConsumeRecoveryCode.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostNewRecoveryCodes(
    templateValues: PostNewRecoveryCodes.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostNewRecoveryCodes.template,
      version: PostNewRecoveryCodes.version,
      layout: PostNewRecoveryCodes.layout,
      includes: PostNewRecoveryCodes.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostRemoveAccountRecovery(
    templateValues: PostRemoveAccountRecovery.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostRemoveAccountRecovery.template,
      version: PostRemoveAccountRecovery.version,
      layout: PostRemoveAccountRecovery.layout,
      includes: PostRemoveAccountRecovery.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostRemoveRecoveryPhone(
    templateValues: PostRemoveRecoveryPhone.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostRemoveRecoveryPhone.template,
      version: PostRemoveRecoveryPhone.version,
      layout: PostRemoveRecoveryPhone.layout,
      includes: PostRemoveRecoveryPhone.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostRemoveSecondary(
    templateValues: PostRemoveSecondary.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostRemoveSecondary.template,
      version: PostRemoveSecondary.version,
      layout: PostRemoveSecondary.layout,
      includes: PostRemoveSecondary.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostRemoveTwoStepAuthentication(
    templateValues: PostRemoveTwoStepAuthentication.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostRemoveTwoStepAuthentication.template,
      version: PostRemoveTwoStepAuthentication.version,
      layout: PostRemoveTwoStepAuthentication.layout,
      includes: PostRemoveTwoStepAuthentication.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostSigninRecoveryCode(
    templateValues: PostSigninRecoveryCode.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostSigninRecoveryCode.template,
      version: PostSigninRecoveryCode.version,
      layout: PostSigninRecoveryCode.layout,
      includes: PostSigninRecoveryCode.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostSigninRecoveryPhone(
    templateValues: PostSigninRecoveryPhone.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostSigninRecoveryPhone.template,
      version: PostSigninRecoveryPhone.version,
      layout: PostSigninRecoveryPhone.layout,
      includes: PostSigninRecoveryPhone.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostVerify(
    templateValues: PostVerify.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostVerify.template,
      version: PostVerify.version,
      layout: PostVerify.layout,
      includes: PostVerify.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderPostVerifySecondary(
    templateValues: PostVerifySecondary.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: PostVerifySecondary.template,
      version: PostVerifySecondary.version,
      layout: PostVerifySecondary.layout,
      includes: PostVerifySecondary.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderRecovery(
    templateValues: Recovery.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: Recovery.template,
      version: Recovery.version,
      layout: Recovery.layout,
      includes: Recovery.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderUnblockCode(
    templateValues: UnblockCode.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: UnblockCode.template,
      version: UnblockCode.version,
      layout: UnblockCode.layout,
      includes: UnblockCode.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderVerificationReminderFinal(
    templateValues: VerificationReminderFinal.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: VerificationReminderFinal.template,
      version: VerificationReminderFinal.version,
      layout: VerificationReminderFinal.layout,
      includes: VerificationReminderFinal.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderVerificationReminderFirst(
    templateValues: VerificationReminderFirst.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: VerificationReminderFirst.template,
      version: VerificationReminderFirst.version,
      layout: VerificationReminderFirst.layout,
      includes: VerificationReminderFirst.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderVerificationReminderSecond(
    templateValues: VerificationReminderSecond.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: VerificationReminderSecond.template,
      version: VerificationReminderSecond.version,
      layout: VerificationReminderSecond.layout,
      includes: VerificationReminderSecond.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderVerify(
    templateValues: Verify.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: Verify.template,
      version: Verify.version,
      layout: Verify.layout,
      includes: Verify.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderVerifyAccountChange(
    templateValues: VerifyAccountChange.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: VerifyAccountChange.template,
      version: VerifyAccountChange.version,
      layout: VerifyAccountChange.layout,
      includes: VerifyAccountChange.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderVerifyLogin(
    templateValues: VerifyLogin.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: VerifyLogin.template,
      version: VerifyLogin.version,
      layout: VerifyLogin.layout,
      includes: VerifyLogin.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderVerifyLoginCode(
    templateValues: VerifyLoginCode.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: VerifyLoginCode.template,
      version: VerifyLoginCode.version,
      layout: VerifyLoginCode.layout,
      includes: VerifyLoginCode.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderVerifyPrimary(
    templateValues: VerifyPrimary.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: VerifyPrimary.template,
      version: VerifyPrimary.version,
      layout: VerifyPrimary.layout,
      includes: VerifyPrimary.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderVerifySecondaryCode(
    templateValues: VerifySecondaryCode.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: VerifySecondaryCode.template,
      version: VerifySecondaryCode.version,
      layout: VerifySecondaryCode.layout,
      includes: VerifySecondaryCode.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderVerifyShortCode(
    templateValues: VerifyShortCode.TemplateData,
    layoutTemplateValues: FxaLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: VerifyShortCode.template,
      version: VerifyShortCode.version,
      layout: VerifyShortCode.layout,
      includes: VerifyShortCode.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }
}
