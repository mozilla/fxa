/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SigninCached from '.';
import { Meta, StoryObj } from '@storybook/react';
import {
  Subject,
  SubjectProps,
  createMockSigninOAuthIntegration,
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninOAuthNativeIntegration,
  MOCK_CMS_INFO,
  MOCK_SWITCHABLE_ACCOUNTS,
  MOCK_MANY_SWITCHABLE_ACCOUNTS,
} from '../../mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MOCK_SERVICE, MOCK_SESSION_TOKEN } from '../../../mocks';
import { MozServices } from '../../../../lib/types';
import { OAuthNativeServices } from '@fxa/accounts/oauth';

/** Split from Pages/Signin so the cached and password paths browse separately. */
const meta: Meta<typeof SigninCached> = {
  title: 'Pages/Signin/Cached',
  component: SigninCached,
  decorators: [withLocalization],
};
export default meta;

type Story = StoryObj<SubjectProps>;

const story = (props: SubjectProps = {}): Story => ({
  render: () => <Subject {...props} />,
});

export const AccountHasPasswordSettings: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
  }),
  name: 'Account has password > Settings',
};

export const AccountHasPasswordRelyingParty: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MOCK_SERVICE,
    hasPassword: false,
    integration: createMockSigninOAuthIntegration({
      service: MOCK_SERVICE,
    }),
  }),
  name: 'Passwordless account > Relying Party',
};

export const SyncBrowserService: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    integration: createMockSigninOAuthNativeSyncIntegration(),
  }),
  name: 'Sync browser service > Account has password',
};

export const SyncBrowserServicePasswordlessAccount: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MozServices.FirefoxSync,
    hasLinkedAccount: true,
    hasPassword: false,
    integration: createMockSigninOAuthNativeSyncIntegration(),
  }),
  name: 'Sync browser service > Passwordless account (user will be taken to Set Password page)',
};

export const NonSyncBrowserServiceWithoutPasswordlessCapability: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MozServices.SmartWindow,
    integration: createMockSigninOAuthNativeIntegration({
      service: OAuthNativeServices.SmartWindow,
      isSync: false,
    }),
    supportsKeysOptionalLogin: false,
  }),
  name: 'Non-Sync browser service > Browser does not have Sync keys optional capability',
};

export const NonSyncBrowserServiceWithPasswordlessCapabilitySignedIntoDesktop: Story =
  {
    ...story({
      sessionToken: MOCK_SESSION_TOKEN,
      serviceName: MozServices.SmartWindow,
      integration: createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.SmartWindow,
        isSync: false,
      }),
      supportsKeysOptionalLogin: true,
      isSignedIntoFirefox: true,
    }),
    name: 'Non-Sync browser service > Browser has Sync keys optional capability > Account is signed into Firefox Desktop',
  };

export const NonSyncBrowserServiceWithPasswordlessCapabilityNotSignedIntoDesktop: Story =
  {
    ...story({
      sessionToken: MOCK_SESSION_TOKEN,
      serviceName: MozServices.SmartWindow,
      hasLinkedAccount: true,
      hasPassword: false,
      integration: createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.SmartWindow,
        isSync: false,
      }),
      supportsKeysOptionalLogin: true,
    }),
    name: 'Non-Sync browser service > Browser has Sync keys optional capability > Account is not signed into Firefox Desktop',
  };

export const NonSyncBrowserServiceMobileAuthorizationFlow: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MozServices.MozillaVPN,
    integration: createMockSigninOAuthNativeIntegration({
      service: OAuthNativeServices.Vpn,
      isSync: false,
      isMobile: true,
    }),
    supportsKeysOptionalLogin: false,
    isSignedIntoFirefox: true,
  }),
  name: 'Non-Sync browser service > Browser does not have keys optional capability > Account is signed into Firefox Mobile',
};

export const NonSyncBrowserServiceMobileNotSignedIn: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MozServices.MozillaVPN,
    integration: createMockSigninOAuthNativeIntegration({
      service: OAuthNativeServices.Vpn,
      isSync: false,
      isMobile: true,
    }),
    supportsKeysOptionalLogin: false,
    isSignedIntoFirefox: false,
  }),
  name: 'Non-Sync browser service > Browser does not have keys optional capability > Account is not signed into Firefox Mobile',
};

export const CmsSplitLayout: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    integration: createMockSigninOAuthIntegration({
      cmsInfo: {
        ...MOCK_CMS_INFO,
        SigninPage: {
          ...MOCK_CMS_INFO.SigninPage!,
          splitLayout: true,
        },
      },
    }),
  }),
  name: 'CMS > Split layout',
};

export const CmsCachedPage: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    integration: createMockSigninOAuthIntegration({
      cmsInfo: {
        ...MOCK_CMS_INFO,
        SigninCachedPage: {
          headline: 'Welcome back',
          description: 'Continue to your Mozilla account',
          primaryButtonText: 'Continue',
          pageTitle: 'Welcome back',
        },
      },
    }),
  }),
  name: 'CMS > Regular layout',
};

export const SignedIntoFirefoxMobileWithService: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    isSignedIntoFirefox: true,
    integration: createMockSigninOAuthNativeIntegration({
      service: OAuthNativeServices.Vpn,
      isSync: false,
    }),
  }),
  name: 'Signed into Firefox + Firefox client + service > "Use a different account" link hidden',
};

export const CmsNoCachedPageConfig: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    integration: createMockSigninOAuthIntegration({
      cmsInfo: {
        ...MOCK_CMS_INFO,
        SigninCachedPage: undefined,
        SigninPage: {
          headline: 'CMS override',
          description: 'just for you!',
          primaryButtonText: 'Click me',
          pageTitle: 'I am a title',
        },
      },
    }),
  }),
  name: 'CMS > Regular layout > No SigninCachedPage config',
};

// Cached re-auth (SigninCached) hides the passkey button regardless of flags.
export const WithPasskeyFlagOn: Story = {
  ...story({
    passkeyEnabled: true,
    sessionToken: MOCK_SESSION_TOKEN,
  }),
  name: 'Passkey enabled > passkey button correctly hidden (SigninCached path)',
};

/**
 * The account switcher replaces the "Use a different account" link once the
 * flag is on and localStorage holds more than one account.
 */
export const AccountSwitcherOneAccount: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    accountSwitcherEnabled: true,
    storedAccounts: [MOCK_SWITCHABLE_ACCOUNTS[0]],
  }),
  name: 'Account switcher > Only one stored account > falls back to the plain link',
};

export const AccountSwitcherTwoOtherAccounts: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    accountSwitcherEnabled: true,
    storedAccounts: MOCK_SWITCHABLE_ACCOUNTS,
  }),
  name: 'Account switcher > Two other accounts (one needs to sign in again)',
};

export const AccountSwitcherSyncBadge: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    accountSwitcherEnabled: true,
    storedAccounts: MOCK_SWITCHABLE_ACCOUNTS,
    firefoxSignedInUid: 'uid-work',
  }),
  name: 'Account switcher > One account is signed in to this browser',
};

export const AccountSwitcherCapped: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    accountSwitcherEnabled: true,
    storedAccounts: MOCK_MANY_SWITCHABLE_ACCOUNTS,
  }),
  name: 'Account switcher > More accounts than the limit (capped at 3)',
};
