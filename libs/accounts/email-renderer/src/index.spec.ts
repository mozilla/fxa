/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NodeRendererBindings } from './renderer/bindings-node';
import { FxaEmailRenderer, defineRenderTest } from './renderer';
import * as FxaLayouts from './layouts/fxa';

const mockDefaultLayoutTemplateValues: FxaLayouts.TemplateData = {
  logoAltText: 'mock-logo-alt-text',
  logoUrl: 'https://mozilla.org/mock-logo-url',
  logoWidth: '100px',
  privacyUrl: 'https://mozilla.org/mock-privacy-url',
  supportUrl: 'https://mozilla.org/mock-support-url',
  unsubscribeUrl: 'https://mozilla.org/mock-unsubscribe-url',
  sync: false,
};

// Extract all render method names (methods starting with "render" but excluding "renderEmail")
type RenderMethodNames<T> = {
  [K in keyof T]: K extends `render${string}`
    ? K extends 'renderEmail'
      ? never
      : T[K] extends (...args: any[]) => any
        ? K
        : never
    : never;
}[keyof T];

// Test case for a specific render method
type RenderTestCase<T, K extends keyof T> = {
  name: string;
  templateValues: T[K] extends (...args: infer P) => any ? P[0] : never;
  layoutTemplateValues: T[K] extends (...args: infer P) => any ? P[1] : never;
};

// All render methods must have test cases (required, not optional)
type RenderTests<T> = {
  [K in RenderMethodNames<T>]: RenderTestCase<T, K>[];
};

const foo = [
  defineRenderTest('renderInactiveAccountFinalWarning', [{name: 'happy path', templateValues: {deletionDate: '', link: ''}, layoutTemplateValues: mockDefaultLayoutTemplateValues}])
]

// Common mock data helpers
const mockDevice = {
  uaBrowser: 'Firefox',
  uaOSVersion: '100',
  uaOS: 'Windows',
};

const mockLocation = {
  stateCode: 'CA',
  country: 'USA',
  city: 'San Francisco',
};

const mockDate = '2025-01-01';
const mockTime = '12:00:00';
const mockLink = 'https://mozilla.org/mock-link';

// All render methods must have test cases.
// When a new render method is added to FxaEmailRenderer, TypeScript will error here
// until a corresponding test case is added.
// If you need to test more than the "happy path", add a new test case with a different name
// to the corresponding test case array. This will pass the properties to the render
const testCases: RenderTests<FxaEmailRenderer> = {
  renderFoo: [{
    name: 'happy path',
    templateValues: {
      status: [{locator: '', status: ''}],
    },
    layoutTemplateValues: mockDefaultLayoutTemplateValues,
  },
  {
    name: 'status failure',
    templateValues: {
      status: [{locator: 'foo@mozilla.com', status: 'Failure'}],
    },
    layoutTemplateValues: mockDefaultLayoutTemplateValues,
  }],
  renderAdminResetAccounts: [
    {
      name: 'happy path',
      templateValues: {
        status: [{ locator: 'foo@mozilla.com', status: 'Success' }],
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderCadReminderFirst: [
    {
      name: 'happy path',
      templateValues: {
        link: 'https://mozilla.org/mock-link',
        oneClickLink: 'https://mozilla.org/mock-one-click-link',
        productName: 'Firefox',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderCadReminderSecond: [
    {
      name: 'happy path',
      templateValues: {
        link: 'https://mozilla.org/mock-link',
        oneClickLink: 'https://mozilla.org/mock-one-click-link',
        productName: 'Firefox',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderInactiveAccountFinalWarning: [
    {
      name: 'happy path',
      templateValues: {
        deletionDate: '2025-01-01',
        link: 'https://mozilla.org/mock-link',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderInactiveAccountFirstWarning: [
    {
      name: 'happy path',
      templateValues: {
        deletionDate: '2025-01-01',
        link: 'https://mozilla.org/mock-link',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderInactiveAccountSecondWarning: [
    {
      name: 'happy path',
      templateValues: {
        deletionDate: '2025-01-01',
        link: 'https://mozilla.org/mock-link',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderLowRecoveryCodes: [
    {
      name: 'happy path',
      templateValues: {
        link: 'https://mozilla.org/mock-link',
        numberRemaining: 1,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderNewDeviceLogin: [
    {
      name: 'happy path',
      templateValues: {
        link: 'https://mozilla.org/mock-link',
        device: {
          uaBrowser: 'Firefox',
          uaOSVersion: '100',
          uaOS: 'Windows',
        },
        location: {
          stateCode: 'CA',
          country: 'USA',
          city: 'San Francisco',
        },
        date: '2025-01-01',
        time: '12:00:00',
        clientName: 'Firefox',
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        mozillaSupportUrl: 'https://mozilla.org/mock-support-url',
        showBannerWarning: false,
        cmsRpClientId: '00f00f',
        cmsRpFromName: 'Testo Inc.',
        entrypoint: 'quux',
        subject: 'New Login',
        headline: 'You logged into Product!',
        description: 'It appears you logged in.',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPasswordChanged: [
    {
      name: 'happy path',
      templateValues: {
        time: '12:00:00',
        date: '2025-01-01',
        device: {
          uaBrowser: 'Firefox',
          uaOSVersion: '100',
          uaOS: 'Windows',
        },
        location: {
          stateCode: 'CA',
          country: 'USA',
          city: 'San Francisco',
        },
        resetLink: 'https://mozilla.org/mock-reset-link',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPasswordChangeRequired: [
    {
      name: 'happy path',
      templateValues: {
        link: 'https://mozilla.org/mock-link',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPasswordForgotOtp: [
    {
      name: 'happy path',
      templateValues: {
        code: '123456',
        time: '12:00:00',
        device: {
          uaBrowser: 'Firefox',
          uaOSVersion: '100',
          uaOS: 'Windows',
        },
        location: {
          stateCode: 'CA',
          country: 'USA',
          city: 'San Francisco',
        },
        date: '2025-01-01',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPasswordReset: [
    {
      name: 'happy path',
      templateValues: {
        resetLink: mockLink,
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPasswordResetAccountRecovery: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        productName: 'Firefox',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPasswordResetRecoveryPhone: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        resetLink: 'https://mozilla.org/mock-reset-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
        twoFactorSettingsLink: 'https://mozilla.org/mock-2fa-settings-link',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPasswordResetWithRecoveryKeyPrompt: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        productName: 'Firefox',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostAddAccountRecovery: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        revokeAccountRecoveryLink: 'https://mozilla.org/mock-revoke-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostAddLinkedAccount: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
        providerName: 'Google',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostAddRecoveryPhone: [
    {
      name: 'happy path',
      templateValues: {
        maskedLastFourPhoneNumber: '1234',
        link: mockLink,
        resetLink: 'https://mozilla.org/mock-reset-link',
        twoFactorSupportLink: 'https://mozilla.org/mock-2fa-support-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostAddTwoStepAuthentication: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        twoFactorSupportLink: 'https://mozilla.org/mock-2fa-support-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostChangeAccountRecovery: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        revokeAccountRecoveryLink: 'https://mozilla.org/mock-revoke-link',
        supportLink: 'https://mozilla.org/mock-support-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostChangePrimary: [
    {
      name: 'happy path',
      templateValues: {
        email: 'newemail@example.com',
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostChangeRecoveryPhone: [
    {
      name: 'happy path',
      templateValues: {
        resetLink: 'https://mozilla.org/mock-reset-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostChangeTwoStepAuthentication: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        twoFactorSupportLink: 'https://mozilla.org/mock-2fa-support-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostConsumeRecoveryCode: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        resetLink: 'https://mozilla.org/mock-reset-link',
        twoFactorSettingsLink: 'https://mozilla.org/mock-2fa-settings-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostNewRecoveryCodes: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostRemoveAccountRecovery: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostRemoveRecoveryPhone: [
    {
      name: 'happy path',
      templateValues: {
        resetLink: 'https://mozilla.org/mock-reset-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostRemoveSecondary: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        secondaryEmail: 'secondary@example.com',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostRemoveTwoStepAuthentication: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostSigninRecoveryCode: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        resetLink: 'https://mozilla.org/mock-reset-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostSigninRecoveryPhone: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        resetLink: 'https://mozilla.org/mock-reset-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostVerify: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        desktopLink: 'https://mozilla.org/mock-desktop-link',
        onDesktopOrTabletDevice: true,
        productName: 'Firefox',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderPostVerifySecondary: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        secondaryEmail: 'secondary@example.com',
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderRecovery: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderUnblockCode: [
    {
      name: 'happy path',
      templateValues: {
        unblockCode: 'ABCD1234',
        reportSignInLink: 'https://mozilla.org/mock-report-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderVerificationReminderFinal: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderVerificationReminderFirst: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderVerificationReminderSecond: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderVerify: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        sync: false,
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderVerifyAccountChange: [
    {
      name: 'happy path',
      templateValues: {
        code: '123456',
        expirationTime: 5,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderVerifyLogin: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        clientName: 'Firefox',
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderVerifyLoginCode: [
    {
      name: 'happy path',
      templateValues: {
        code: '123456',
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        serviceName: 'Firefox',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderVerifyPrimary: [
    {
      name: 'happy path',
      templateValues: {
        link: mockLink,
        sync: false,
        passwordChangeLink: 'https://mozilla.org/mock-password-change-link',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderVerifySecondaryCode: [
    {
      name: 'happy path',
      templateValues: {
        email: 'secondary@example.com',
        code: '123456',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
  renderVerifyShortCode: [
    {
      name: 'happy path',
      templateValues: {
        code: '123456',
        time: mockTime,
        device: mockDevice,
        location: mockLocation,
        date: mockDate,
      },
      layoutTemplateValues: mockDefaultLayoutTemplateValues,
    },
  ],
};

describe.each(
  Object.entries(testCases) as Array<
    [
      RenderMethodNames<FxaEmailRenderer>, // method name
      RenderTestCase<FxaEmailRenderer, RenderMethodNames<FxaEmailRenderer>>[], // test cases
    ]
  >
)('%s', (renderMethodName, cases) => {
  it.each(cases)(
    '$name',
    async ({ templateValues, layoutTemplateValues }) => {
      const r = new FxaEmailRenderer(new NodeRendererBindings());
      const renderMethod = r[renderMethodName];
      // need to use .call to maintain the correct `this` context
      const email = await renderMethod.call(
        r,
        templateValues,
        layoutTemplateValues
      );

      expect(email).toBeDefined();
      // Use method name in snapshot name for better organization
      // snapshot of various parts of the rendered email
      expect(email.subject).toMatchSnapshot('matches subject');

      // full email body is too large and unwieldy for snapshot testing
      // if you need to debug the output, this can be useful, but don't commit
      // the full email snapshot
      // expect(email).toMatchSnapshot(snapshotName + ' - full email');

      expect(email.language).toMatchSnapshot('matches language');
      expect(email.preview).toMatchSnapshot('matches preview');
      // we can also target properties of the email body using the
      // templateValues provided
      for (const [key, value] of Object.entries(templateValues)) {
        // check if object or string
        // if string, try to find element with that in it (not sure if it'll be a div, span, etc)
        if (typeof value === 'string') {
          expect(email.html).toContain(value);
          // get element containing the string value
          const el = email.html.match(new RegExp(`>([^<>]*${value}[^<>]*)<`));
          expect(el).toMatchSnapshot(`${key} element contains expected value`);

        } else if (typeof value === 'object' && value !== null) {
          // for objects, we can do more specific checks based on known keys
          // noop for now
          console.log(`Skipping detailed checks for object key: ${key}`);
        }
      }
    }
  );
});
