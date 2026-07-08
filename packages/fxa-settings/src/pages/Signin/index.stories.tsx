/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Signin from '.';
import { Meta, StoryObj } from '@storybook/react';
import {
  Subject,
  SubjectProps,
  createMockSigninOAuthIntegration,
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninOAuthNativeIntegration,
  MOCK_CMS_INFO,
} from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MOCK_SERVICE, MOCK_SESSION_TOKEN } from '../mocks';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { BeginSigninError } from '../../lib/error-utils';
import { MozServices } from '../../lib/types';
import { OAuthNativeServices } from '@fxa/accounts/oauth';

const meta: Meta<typeof Signin> = {
  title: 'Pages/Signin',
  component: Signin,
  decorators: [withLocalization],
};
export default meta;

type Story = StoryObj<SubjectProps>;

const story = (props: SubjectProps = {}): Story => ({
  render: () => <Subject {...props} />,
});

export const NonCachedAccountHasPasswordSettingsOrRP: Story = {
  ...story(),
  name: 'Non-Cached > Account has password > Settings or Relying Party',
};

export const NonCachedAccountHasPasswordSettingsAccountLockedError: Story = {
  ...story({
    beginSigninHandler: () =>
      Promise.resolve({
        error: AuthUiErrors.ACCOUNT_RESET as BeginSigninError,
      }),
  }),
  name: 'Non-Cached > Account has password > Settings, account locked error (enter a password and click sign in)',
};

export const NonCachedPasswordlessAccountSettingsOrRelyingParty: Story = {
  ...story({
    hasLinkedAccount: true,
    hasPassword: false,
  }),
  name: 'Non-Cached > Passwordless account > Settings or Relying Party',
};

export const NonCachedSyncBrowserServiceAccountHasPassword: Story = {
  ...story({
    serviceName: MozServices.FirefoxSync,
    hasLinkedAccount: true,
    hasPassword: true,
    integration: createMockSigninOAuthNativeSyncIntegration(),
  }),
  name: 'Non-Cached > Sync browser service > Account has password',
};

export const NonCachedSyncBrowserServicePasswordlessAccount: Story = {
  ...story({
    serviceName: MozServices.FirefoxSync,
    hasLinkedAccount: true,
    hasPassword: false,
    integration: createMockSigninOAuthNativeSyncIntegration(),
  }),
  name: 'Non-Cached > Sync browser service > Passwordless account (user will be taken to Set Password page)',
};

export const NonCachedNonSyncBrowserServiceBrowserHasPasswordlessCapability: Story =
  {
    ...story({
      serviceName: MozServices.SmartWindow,
      integration: createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.SmartWindow,
        isSync: false,
      }),
      browserSupportsKeysOptional: true,
    }),
    name: 'Non-Cached > Non-Sync browser service > Browser has Sync keys optional capability',
  };

export const NonCachedNonSyncBrowserServiceBrowserDoesNotHavePasswordlessCapability: Story =
  {
    ...story({
      serviceName: MozServices.Relay,
      integration: createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.Relay,
        isSync: false,
      }),
      browserSupportsKeysOptional: false,
    }),
    name: 'Non-Cached > Non-Sync browser service > Browser does not have Sync keys optional capability',
  };

export const CachedAccountHasPasswordSettings: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
  }),
  name: 'Cached > Account has password > Settings',
};

export const CachedAccountHasPasswordRelyingParty: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MOCK_SERVICE,
    hasPassword: false,
    integration: createMockSigninOAuthIntegration({
      service: MOCK_SERVICE,
    }),
  }),
  name: 'Cached > Passwordless account > Relying Party',
};

export const CachedSyncBrowserService: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    integration: createMockSigninOAuthNativeSyncIntegration(),
  }),
  name: 'Cached > Sync browser service > Account has password',
};

export const CachedSyncBrowserServicePasswordlessAccount: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MozServices.FirefoxSync,
    hasLinkedAccount: true,
    hasPassword: false,
    integration: createMockSigninOAuthNativeSyncIntegration(),
  }),
  name: 'Cached > Sync browser service > Passwordless account (user will be taken to Set Password page)',
};

export const CachedNonSyncBrowserServiceWithoutPasswordlessCapability: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MozServices.SmartWindow,
    integration: createMockSigninOAuthNativeIntegration({
      service: OAuthNativeServices.SmartWindow,
      isSync: false,
    }),
    browserSupportsKeysOptional: false,
  }),
  name: 'Cached > Non-Sync browser service > Browser does not have Sync keys optional capability',
};

export const CachedNonSyncBrowserServiceWithPasswordlessCapabilitySignedIntoDesktop: Story =
  {
    ...story({
      sessionToken: MOCK_SESSION_TOKEN,
      serviceName: MozServices.SmartWindow,
      integration: createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.SmartWindow,
        isSync: false,
      }),
      browserSupportsKeysOptional: true,
      isSignedIntoFirefox: true,
    }),
    name: 'Cached > Non-Sync browser service > Browser has Sync keys optional capability > Account is signed into Firefox Desktop',
  };

export const CachedNonSyncBrowserServiceWithPasswordlessCapabilityNotSignedIntoDesktop: Story =
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
      browserSupportsKeysOptional: true,
    }),
    name: 'Cached > Non-Sync browser service > Browser has Sync keys optional capability > Account is not signed into Firefox Desktop',
  };

export const CachedNonSyncBrowserServiceMobileAuthorizationFlow: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MozServices.MozillaVPN,
    integration: createMockSigninOAuthNativeIntegration({
      service: OAuthNativeServices.Vpn,
      isSync: false,
      isMobile: true,
    }),
    browserSupportsKeysOptional: false,
    isSignedIntoFirefox: true,
  }),
  name: 'Cached > Non-Sync browser service > Browser does not have keys optional capability > Account is signed into Firefox Mobile',
};

export const CachedNonSyncBrowserServiceMobileNotSignedIn: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MozServices.MozillaVPN,
    integration: createMockSigninOAuthNativeIntegration({
      service: OAuthNativeServices.Vpn,
      isSync: false,
      isMobile: true,
    }),
    browserSupportsKeysOptional: false,
    isSignedIntoFirefox: false,
  }),
  name: 'Cached > Non-Sync browser service > Browser does not have keys optional capability > Account is not signed into Firefox Mobile',
};

export const CmsNonCachedDefault: Story = {
  ...story({
    integration: createMockSigninOAuthIntegration({
      cmsInfo: MOCK_CMS_INFO,
    }),
  }),
  name: 'CMS > Regular layout > Non-Cached',
};

export const CmsNonCachedSplitLayout: Story = {
  ...story({
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
  name: 'CMS > Split layout > Non-Cached',
};

export const CmsCachedSplitLayout: Story = {
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
  name: 'CMS > Split layout > Cached',
};

export const CmsCachedCachedPage: Story = {
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
  name: 'CMS > Regular layout > Cached',
};

export const CachedSignedIntoFirefoxMobileWithService: Story = {
  ...story({
    sessionToken: MOCK_SESSION_TOKEN,
    isSignedIntoFirefox: true,
    integration: createMockSigninOAuthNativeIntegration({
      service: OAuthNativeServices.Vpn,
      isSync: false,
    }),
  }),
  name: 'Cached > Signed into Firefox + Firefox client + service > "Use a different account" link hidden',
};

export const CmsCachedNoCachedPageConfig: Story = {
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
  name: 'CMS > Regular layout > Cached > No SigninCachedPage config',
};

// Passkey button alongside third-party providers, alternative to password entry.
export const NonCachedAccountHasPasswordWithPasskey: Story = {
  ...story({ passkeyEnabled: true }),
  name: 'Passkey enabled > Non-Cached > Account has password',
};

// Sync passkey signin routes to /signin_passkey_fallback for key derivation.
export const NonCachedSyncWithPasskey: Story = {
  ...story({
    passkeyEnabled: true,
    serviceName: MozServices.FirefoxSync,
    hasLinkedAccount: true,
    hasPassword: true,
    integration: createMockSigninOAuthNativeSyncIntegration(),
  }),
  name: 'Passkey enabled > Non-Cached > Sync browser service > Account has password',
};

// SigninDecider routes linked-passwordless users to SigninAlternativeAuthOptions.
export const NonCachedPasswordlessWithPasskey: Story = {
  ...story({
    passkeyEnabled: true,
    hasLinkedAccount: true,
    hasPassword: false,
  }),
  name: 'Passkey enabled > Non-Cached > Passwordless account (routes through SigninAlternativeAuthOptions)',
};

// Cached re-auth (SigninCached) hides the passkey button regardless of flags.
export const CachedWithPasskeyFlagOn: Story = {
  ...story({
    passkeyEnabled: true,
    sessionToken: MOCK_SESSION_TOKEN,
  }),
  name: 'Passkey enabled > Cached > passkey button correctly hidden (SigninCached path)',
};
