/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NodeRendererBindings } from './bindings-node';
import { FxaEmailRenderer } from './fxa-email-renderer';

/**
 * For now, these tests are for some coverage of our email templates.
 *
 * We plan to push these tests down into Storybook snapshots in the future,
 * but that requires an update to Storybook for snapshot support.
 */

/**
 * Type helper to get all render methods on FxaEmailRenderer
 */
const mockLink = 'http://localhost:3030/mock-link';
const mockLinkOneClick = 'http://localhost:3030/mock-one-click-link';
const mockLinkSupport = 'http://localhost:3030/mock-support-link';
const mockLinkReset = 'http://localhost:3030/mock-reset-link';
const mockLinkPasswordChange =
  'http://localhost:3030/mock-password-change-link';
const mockLinkRevokeAccountRecovery =
  'http://localhost:3030/mock-revoke-account-recovery-link';
const mockCssPath = '';

const mockEmail = 'mock-email@mozilla.com';

const mockDevice = {
  uaBrowser: 'Firefox',
  uaOSVersion: '100',
  uaOS: 'Windows',
};

const mockLocation = { city: 'San Francisco', stateCode: 'CA', country: 'US' };

const defaultLayoutTemplateValues = {
  privacyUrl: 'http://localhost:3030/privacy',
  supportUrl: 'http://localhost:3030/support',
  sync: false,
  logoAltText: 'Firefox Logo',
  logoUrl: 'http://localhost:3030/logo.png',
  logoWidth: '100px',
  unsubscribeUrl: 'http://localhost:3030/unsubscribe',
};

describe('FxA Email Renderer', () => {
  let renderer: FxaEmailRenderer;

  beforeEach(() => {
    renderer = new FxaEmailRenderer(new NodeRendererBindings());
  });

  it('should render renderAdminResetAccounts', async () => {
    const email = await renderer.renderAdminResetAccounts({
      status: [{ locator: 'device1', status: 'active' }],
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderCadReminderFirst', async () => {
    const email = await renderer.renderCadReminderFirst({
      link: mockLink,
      oneClickLink: mockLinkOneClick,
      productName: 'Firefox',
      cssPath: mockCssPath,
      hideDeviceLink: false,
      onDesktopOrTabletDevice: false,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderCadReminderSecond', async () => {
    const email = await renderer.renderCadReminderSecond({
      link: mockLink,
      oneClickLink: mockLinkOneClick,
      productName: 'Firefox',
      cssPath: mockCssPath,
      hideDeviceLink: false,
      onDesktopOrTabletDevice: false,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderInactiveAccountFinalWarning', async () => {
    const email = await renderer.renderInactiveAccountFinalWarning({
      deletionDate: 'January 1, 2025',
      link: mockLink,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderInactiveAccountFirstWarning', async () => {
    const email = await renderer.renderInactiveAccountFirstWarning({
      deletionDate: 'January 1, 2025',
      link: mockLink,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderInactiveAccountSecondWarning', async () => {
    const email = await renderer.renderInactiveAccountSecondWarning({
      deletionDate: 'January 1, 2025',
      link: mockLink,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderLowRecoveryCodes', async () => {
    const email = await renderer.renderLowRecoveryCodes({
      link: mockLink,
      numberRemaining: 3,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderNewDeviceLogin', async () => {
    const email = await renderer.renderNewDeviceLogin({
      clientName: 'Sync',
      link: mockLink,
      date: 'Jan 1, 2024',
      time: '12:00 PM',
      location: mockLocation,
      device: mockDevice,
      passwordChangeLink: mockLinkSupport,
      mozillaSupportUrl: mockLinkSupport,
      showBannerWarning: false,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderNewDeviceLoginStrapi', async () => {
    const email = await renderer.renderNewDeviceLoginStrapi({
      clientName: 'Sync',
      link: mockLink,
      date: 'Jan 1, 2024',
      time: '12:00 PM',
      location: mockLocation,
      device: mockDevice,
      passwordChangeLink: mockLinkSupport,
      mozillaSupportUrl: mockLinkSupport,
      showBannerWarning: false,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPasswordChanged', async () => {
    const email = await renderer.renderPasswordChanged({
      date: 'Jan 1, 2024',
      time: '12:00 PM',
      device: mockDevice,
      location: mockLocation,
      resetLink: mockLinkReset,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPasswordChangeRequired', async () => {
    const email = await renderer.renderPasswordChangeRequired({
      link: mockLink,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPasswordForgotOtp', async () => {
    const email = await renderer.renderPasswordForgotOtp({
      code: '8675309',
      date: 'Jan 1, 2024',
      time: '12:00 PM',
      device: mockDevice,
      location: mockLocation,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPasswordReset', async () => {
    const email = await renderer.renderPasswordReset({
      date: 'Jan 1, 2024',
      time: '12:00 PM',
      resetLink: mockLinkReset,
      device: mockDevice,
      location: mockLocation,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPasswordResetAccountRecovery', async () => {
    const email = await renderer.renderPasswordResetAccountRecovery({
      date: 'Jan 1, 2024',
      time: '12:00 PM',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      passwordChangeLink: mockLinkPasswordChange,
      productName: 'Sync',
      cssPath: mockCssPath,
      hideDeviceLink: false,
      onDesktopOrTabletDevice: false,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPasswordResetRecoveryPhone', async () => {
    const email = await renderer.renderPasswordResetRecoveryPhone({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      resetLink: mockLinkReset,
      twoFactorSettingsLink: mockLinkSupport,
      time: '12:00 PM',
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPasswordResetWithRecoveryKeyPrompt', async () => {
    const email = await renderer.renderPasswordResetWithRecoveryKeyPrompt({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      passwordChangeLink: mockLinkPasswordChange,
      productName: 'Sync',
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostAddAccountRecovery', async () => {
    const email = await renderer.renderPostAddAccountRecovery({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      passwordChangeLink: mockLinkPasswordChange,
      revokeAccountRecoveryLink: mockLinkRevokeAccountRecovery,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostAddLinkedAccount', async () => {
    const email = await renderer.renderPostAddLinkedAccount({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      passwordChangeLink: mockLinkPasswordChange,
      providerName: 'Google',
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostAddRecoveryPhone', async () => {
    const email = await renderer.renderPostAddRecoveryPhone({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      maskedLastFourPhoneNumber: '•••• •••• 1234',
      resetLink: mockLinkReset,
      twoFactorSupportLink: mockLinkSupport,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostAddTwoStepAuthentication', async () => {
    const email = await renderer.renderPostAddTwoStepAuthentication({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      twoFactorSupportLink: mockLinkSupport,
      passwordChangeLink: mockLinkPasswordChange,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostChangeAccountRecovery', async () => {
    const email = await renderer.renderPostChangeAccountRecovery({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      passwordChangeLink: mockLinkPasswordChange,
      revokeAccountRecoveryLink: mockLinkRevokeAccountRecovery,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostChangePrimary', async () => {
    const email = await renderer.renderPostChangePrimary({
      email: mockEmail,
      link: mockLink,
      passwordChangeLink: mockLinkPasswordChange,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostChangeRecoveryPhone', async () => {
    const email = await renderer.renderPostChangeRecoveryPhone({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      resetLink: mockLinkReset,
      time: '12:00 PM',
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostChangeTwoStepAuthentication', async () => {
    const email = await renderer.renderPostChangeTwoStepAuthentication({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      passwordChangeLink: mockLinkPasswordChange,
      twoFactorSupportLink: mockLinkSupport,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostConsumeRecoveryCode', async () => {
    const email = await renderer.renderPostConsumeRecoveryCode({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      resetLink: mockLinkReset,
      twoFactorSettingsLink: mockLinkSupport,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostNewRecoveryCodes', async () => {
    const email = await renderer.renderPostNewRecoveryCodes({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      passwordChangeLink: mockLinkPasswordChange,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostRemoveAccountRecovery', async () => {
    const email = await renderer.renderPostRemoveAccountRecovery({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      passwordChangeLink: mockLinkPasswordChange,
      revokeAccountRecoveryLink: mockLinkRevokeAccountRecovery,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostRemoveRecoveryPhone', async () => {
    const email = await renderer.renderPostRemoveRecoveryPhone({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      resetLink: mockLinkReset,
      time: '12:00 PM',
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostRemoveSecondary', async () => {
    const email = await renderer.renderPostRemoveSecondary({
      link: mockLink,
      secondaryEmail: mockEmail,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostRemoveTwoStepAuthentication', async () => {
    const email = await renderer.renderPostRemoveTwoStepAuthentication({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      passwordChangeLink: mockLinkPasswordChange,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostSigninRecoveryCode', async () => {
    const email = await renderer.renderPostSigninRecoveryCode({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      resetLink: mockLinkReset,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostSigninRecoveryPhone', async () => {
    const email = await renderer.renderPostSigninRecoveryPhone({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      resetLink: mockLinkReset,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostVerify', async () => {
    const email = await renderer.renderPostVerify({
      link: mockLink,
      desktopLink: mockLink,
      onDesktopOrTabletDevice: true,
      productName: 'Firefox',
      cssPath: mockCssPath,
      hideDeviceLink: false,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderPostVerifySecondary', async () => {
    const email = await renderer.renderPostVerifySecondary({
      link: mockLink,
      secondaryEmail: mockEmail,
      passwordChangeLink: mockLinkPasswordChange,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderRecovery', async () => {
    const email = await renderer.renderRecovery({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderUnblockCode', async () => {
    const email = await renderer.renderUnblockCode({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      time: '12:00 PM',
      unblockCode: 'ABC123',
      reportSignInLink: mockLink,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderVerificationReminderFinal', async () => {
    const email = await renderer.renderVerificationReminderFinal({
      link: mockLink,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderVerificationReminderFirst', async () => {
    const email = await renderer.renderVerificationReminderFirst({
      link: mockLink,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderVerificationReminderSecond', async () => {
    const email = await renderer.renderVerificationReminderSecond({
      link: mockLink,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderVerify', async () => {
    const email = await renderer.renderVerify({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderVerifyAccountChange', async () => {
    const email = await renderer.renderVerifyAccountChange({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      time: '12:00 PM',
      code: '123456',
      expirationTime: 15,
      passwordChangeLink: mockLinkPasswordChange,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderVerifyLogin', async () => {
    const email = await renderer.renderVerifyLogin({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      clientName: 'Firefox Sync',
      passwordChangeLink: mockLinkPasswordChange,
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderVerifyLoginCode', async () => {
    const email = await renderer.renderVerifyLoginCode({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      time: '12:00 PM',
      code: '654321',
      passwordChangeLink: mockLinkPasswordChange,
      serviceName: 'Firefox Sync',
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderVerifyPrimary', async () => {
    const email = await renderer.renderVerifyPrimary({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      link: mockLink,
      time: '12:00 PM',
      passwordChangeLink: mockLinkPasswordChange,
      ...defaultLayoutTemplateValues,
      sync: true,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderVerifySecondaryCode', async () => {
    const email = await renderer.renderVerifySecondaryCode({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      time: '12:00 PM',
      email: mockEmail,
      code: '789012',
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });

  it('should render renderVerifyShortCode', async () => {
    const email = await renderer.renderVerifyShortCode({
      date: 'Jan 1, 2024',
      device: mockDevice,
      location: mockLocation,
      code: '345678',
      ...defaultLayoutTemplateValues,
    });
    expect(email).toBeDefined();
    expect(email.html).toMatchSnapshot('matches full email snapshot');
  });
});
