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
type RendererMethods<T> = Exclude<
  Extract<keyof T, `render${string}`>,
  'renderEmail' //explicitly exclude base method so we don't try to test it with this helper
>;

/**
 * Basic wrapper to render the email with provided parameters and snapshot the output.
 *
 * A bit complex on the type inference, but it allows us to have strongly typed
 * parameters for each render method.
 * @param func
 * @param templateValues
 * @param layoutTemplateValues
 */
const renderAndSnapshotEmail = async <
  T extends RendererMethods<FxaEmailRenderer>,
>(
  func: T,
  templateValues: Parameters<FxaEmailRenderer[T]>[0],
  layoutTemplateValues: Parameters<FxaEmailRenderer[T]>[1]
) => {
  const fxaEmailRenderer = new FxaEmailRenderer(new NodeRendererBindings());
  const renderMethod = fxaEmailRenderer[func].bind(fxaEmailRenderer) as (
    templateValues: Parameters<FxaEmailRenderer[T]>[0],
    layoutTemplateValues: Parameters<FxaEmailRenderer[T]>[1]
  ) => ReturnType<FxaEmailRenderer[T]>;

  const email = await renderMethod(templateValues, layoutTemplateValues);

  expect(email).toBeDefined();
  expect(email.html).toMatchSnapshot('matches full email snapshot');
};

const mockLink = 'http://localhost:3030/mock-link';
const mockLinkOneClick = 'http://localhost:3030/mock-one-click-link';
const mockLinkSupport = 'http://localhost:3030/mock-support-link';
const mockLinkReset = 'http://localhost:3030/mock-reset-link';
const mockLinkPasswordChange =
  'http://localhost:3030/mock-password-change-link';
const mockLinkRevokeAccountRecovery =
  'http://localhost:3030/mock-revoke-account-recovery-link';

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
  describe('renderAdminResetAccounts', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderAdminResetAccounts',
        {
          status: [{ locator: 'device1', status: 'active' }],
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderCadReminderFirst', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderCadReminderFirst',
        {
          link: mockLink,
          oneClickLink: mockLinkOneClick,
          productName: 'Firefox',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderCadReminderSecond', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderCadReminderSecond',
        {
          link: mockLink,
          oneClickLink: mockLinkOneClick,
          productName: 'Firefox',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderInactiveAccountFinalWarning', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderInactiveAccountFinalWarning',
        { deletionDate: 'January 1, 2025', link: mockLink },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderInactiveAccountFirstWarning', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderInactiveAccountFirstWarning',
        { deletionDate: 'January 1, 2025', link: mockLink },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderInactiveAccountSecondWarning', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderInactiveAccountSecondWarning',
        { deletionDate: 'January 1, 2025', link: mockLink },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderLowRecoveryCodes', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderLowRecoveryCodes',
        { link: mockLink, numberRemaining: 3 },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderNewDeviceLogin', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderNewDeviceLogin',
        {
          clientName: 'Sync',
          link: mockLink,
          date: 'Jan 1, 2024',
          time: '12:00 PM',
          location: mockLocation,
          device: mockDevice,
          passwordChangeLink: mockLinkSupport,
          mozillaSupportUrl: mockLinkSupport,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderNewDeviceLoginStrapi', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderNewDeviceLoginStrapi',
        {
          clientName: 'Sync',
          link: mockLink,
          date: 'Jan 1, 2024',
          time: '12:00 PM',
          location: mockLocation,
          device: mockDevice,
          passwordChangeLink: mockLinkSupport,
          mozillaSupportUrl: mockLinkSupport,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPasswordChanged', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPasswordChanged',
        {
          date: 'Jan 1, 2024',
          time: '12:00 PM',
          device: mockDevice,
          location: mockLocation,
          resetLink: mockLinkReset,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPasswordChangeRequired', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPasswordChangeRequired',
        { link: mockLink },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPasswordForgotOtp', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPasswordForgotOtp',
        {
          code: '8675309',
          date: 'Jan 1, 2024',
          time: '12:00 PM',
          device: mockDevice,
          location: mockLocation,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPasswordReset', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPasswordReset',
        {
          date: 'Jan 1, 2024',
          time: '12:00 PM',
          resetLink: mockLinkReset,
          device: mockDevice,
          location: mockLocation,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPasswordResetAccountRecovery',
        {
          date: 'Jan 1, 2024',
          time: '12:00 PM',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          passwordChangeLink: mockLinkPasswordChange,
          productName: 'Sync',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPasswordResetRecoveryPhone', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPasswordResetRecoveryPhone',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          resetLink: mockLinkReset,
          twoFactorSettingsLink: mockLinkSupport,
          time: '12:00 PM',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPasswordResetWithRecoveryKeyPrompt', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPasswordResetWithRecoveryKeyPrompt',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          passwordChangeLink: mockLinkPasswordChange,
          productName: 'Sync',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostAddAccountRecovery', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostAddAccountRecovery',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          passwordChangeLink: mockLinkPasswordChange,
          revokeAccountRecoveryLink: mockLinkRevokeAccountRecovery,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostAddLinkedAccount', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostAddLinkedAccount',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          passwordChangeLink: mockLinkPasswordChange,
          providerName: 'Google',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostAddRecoveryPhone', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostAddRecoveryPhone',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          maskedLastFourPhoneNumber: '•••• •••• 1234',
          resetLink: mockLinkReset,
          twoFactorSupportLink: mockLinkSupport,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostAddTwoStepAuthentication', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostAddTwoStepAuthentication',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          twoFactorSupportLink: mockLinkSupport,
          passwordChangeLink: mockLinkPasswordChange,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostChangeAccountRecovery', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostChangeAccountRecovery',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          passwordChangeLink: mockLinkPasswordChange,
          revokeAccountRecoveryLink: mockLinkRevokeAccountRecovery,
          supportLink: mockLinkSupport,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostChangePrimary', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostChangePrimary',
        {
          email: mockEmail,
          link: mockLink,
          passwordChangeLink: mockLinkPasswordChange,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostChangeRecoveryPhone', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostChangeRecoveryPhone',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          resetLink: mockLinkReset,
          time: '12:00 PM',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostChangeTwoStepAuthentication', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostChangeTwoStepAuthentication',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          passwordChangeLink: mockLinkPasswordChange,
          twoFactorSupportLink: mockLinkSupport,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostConsumeRecoveryCode', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostConsumeRecoveryCode',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          resetLink: mockLinkReset,
          twoFactorSettingsLink: mockLinkSupport,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostNewRecoveryCodes', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostNewRecoveryCodes',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          passwordChangeLink: mockLinkPasswordChange,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostRemoveAccountRecovery', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostRemoveAccountRecovery',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          passwordChangeLink: mockLinkPasswordChange,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostRemoveRecoveryPhone', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostRemoveRecoveryPhone',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          resetLink: mockLinkReset,
          time: '12:00 PM',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostRemoveSecondary', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostRemoveSecondary',
        {
          link: mockLink,
          secondaryEmail: mockEmail,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostRemoveTwoStepAuthentication', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostRemoveTwoStepAuthentication',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          passwordChangeLink: mockLinkPasswordChange,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostSigninRecoveryCode', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostSigninRecoveryCode',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          resetLink: mockLinkReset,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostSigninRecoveryPhone', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostSigninRecoveryPhone',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          resetLink: mockLinkReset,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostVerify', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostVerify',
        {
          link: mockLink,
          desktopLink: mockLink,
          onDesktopOrTabletDevice: true,
          productName: 'Firefox',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderPostVerifySecondary', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderPostVerifySecondary',
        {
          link: mockLink,
          secondaryEmail: mockEmail,
          passwordChangeLink: mockLinkPasswordChange,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderRecovery', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderRecovery',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderUnblockCode', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderUnblockCode',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          time: '12:00 PM',
          unblockCode: 'ABC123',
          reportSignInLink: mockLink,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderVerificationReminderFinal', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderVerificationReminderFinal',
        {
          link: mockLink,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderVerificationReminderFirst', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderVerificationReminderFirst',
        {
          link: mockLink,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderVerificationReminderSecond', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderVerificationReminderSecond',
        {
          link: mockLink,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderVerify', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderVerify',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          sync: false,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderVerifyAccountChange', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderVerifyAccountChange',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          time: '12:00 PM',
          code: '123456',
          expirationTime: 15,
          passwordChangeLink: mockLinkPasswordChange,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderVerifyLogin', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderVerifyLogin',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          clientName: 'Firefox Sync',
          passwordChangeLink: mockLinkPasswordChange,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderVerifyLoginCode', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderVerifyLoginCode',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          time: '12:00 PM',
          code: '654321',
          passwordChangeLink: mockLinkPasswordChange,
          serviceName: 'Firefox Sync',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderVerifyPrimary', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderVerifyPrimary',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          link: mockLink,
          time: '12:00 PM',
          sync: true,
          passwordChangeLink: mockLinkPasswordChange,
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderVerifySecondaryCode', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderVerifySecondaryCode',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          time: '12:00 PM',
          email: mockEmail,
          code: '789012',
        },
        defaultLayoutTemplateValues
      );
    });
  });

  describe('renderVerifyShortCode', () => {
    it('should render and snapshot email', async () => {
      await renderAndSnapshotEmail(
        'renderVerifyShortCode',
        {
          date: 'Jan 1, 2024',
          device: mockDevice,
          location: mockLocation,
          code: '345678',
        },
        defaultLayoutTemplateValues
      );
    });
  });
});
