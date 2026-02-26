/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signin from '.';
import { Meta } from '@storybook/react';
import {
  Subject,
  createMockSigninOAuthIntegration,
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninOAuthNativeIntegration,
  MOCK_CMS_INFO,
} from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { SigninProps } from './interfaces';
import { MOCK_SERVICE, MOCK_SESSION_TOKEN } from '../mocks';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { BeginSigninError } from '../../lib/error-utils';
import { MozServices } from '../../lib/types';
import { OAuthNativeServices } from '../../models';

export default {
  title: 'Pages/Signin',
  component: Signin,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (
  props: Partial<SigninProps> & { supportsKeysOptionalLogin?: boolean } = {},
  storyName?: string
) => {
  const story = () => <Subject {...props} />;
  if (storyName) story.storyName = storyName;
  return story;
};

export const NonCachedAccountHasPasswordSettingsOrRP = storyWithProps(
  {},
  'Non-Cached > Account has password > Settings or Relying Party'
);

export const NonCachedAccountHasPasswordSettingsAccountLockedError =
  storyWithProps(
    {
      beginSigninHandler: () => {
        return Promise.resolve({
          error: AuthUiErrors.ACCOUNT_RESET as BeginSigninError,
        });
      },
    },
    'Non-Cached > Account has password > Settings, account locked error (click sign in)'
  );

export const NonCachedPasswordlessAccountSettingsOrRelyingParty =
  storyWithProps(
    {
      hasLinkedAccount: true,
      hasPassword: false,
    },
    'Non-Cached > Passwordless account > Settings or Relying Party'
  );

export const NonCachedSyncBrowserServiceAccountHasPassword = storyWithProps(
  {
    serviceName: MozServices.FirefoxSync,
    hasLinkedAccount: true,
    hasPassword: true,
    integration: createMockSigninOAuthNativeSyncIntegration(),
  },
  'Non-Cached > Sync browser service > Account has password'
);

export const NonCachedSyncBrowserServicePasswordlessAccount = storyWithProps(
  {
    serviceName: MozServices.FirefoxSync,
    hasLinkedAccount: true,
    hasPassword: false,
    integration: createMockSigninOAuthNativeSyncIntegration(),
  },
  'Non-Cached > Sync browser service > Passwordless account (user will be taken to Set Password page)'
);

export const NonCachedNonSyncBrowserServiceBrowserHasPasswordlessCapability =
  storyWithProps(
    {
      serviceName: MozServices.SmartWindow,
      integration: createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.SmartWindow,
        isSync: false,
      }),
      supportsKeysOptionalLogin: true,
    },
    'Non-Cached > Non-Sync browser service > Browser has Sync keys optional capability'
  );

export const NonCachedNonSyncBrowserServiceBrowserDoesNotHavePasswordlessCapability =
  storyWithProps(
    {
      serviceName: MozServices.Relay,
      integration: createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.Relay,
        isSync: false,
      }),
      supportsKeysOptionalLogin: false,
    },
    'Non-Cached > Non-Sync browser service > Browser does not have Sync keys optional capability'
  );

export const CachedAccountHasPasswordSettings = storyWithProps(
  {
    sessionToken: MOCK_SESSION_TOKEN,
  },
  'Cached > Account has password > Settings'
);

export const CachedAccountHasPasswordRelyingParty = storyWithProps(
  {
    sessionToken: MOCK_SESSION_TOKEN,
    serviceName: MOCK_SERVICE,
    hasPassword: false,
    integration: createMockSigninOAuthIntegration({
      service: MOCK_SERVICE,
    }),
  },
  'Cached > Passwordless account > Relying Party'
);
export const CachedSyncBrowserService = storyWithProps(
  {
    sessionToken: MOCK_SESSION_TOKEN,
    integration: createMockSigninOAuthNativeSyncIntegration(),
  },
  'Cached > Sync browser service'
);
export const CachedNonSyncBrowserServiceWithoutPasswordlessCapability =
  storyWithProps(
    {
      sessionToken: MOCK_SESSION_TOKEN,
      serviceName: MozServices.SmartWindow,
      integration: createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.SmartWindow,
        isSync: false,
      }),
      supportsKeysOptionalLogin: false,
    },
    'Cached > Non-Sync browser service > Browser does not have Sync keys optional capability'
  );
export const CachedNonSyncBrowserServiceWithPasswordlessCapabilitySignedIntoDesktop =
  storyWithProps(
    {
      sessionToken: MOCK_SESSION_TOKEN,
      serviceName: MozServices.SmartWindow,
      integration: createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.SmartWindow,
        isSync: false,
      }),
      supportsKeysOptionalLogin: true,
      isSignedIntoFirefoxDesktop: true,
    },
    'Cached > Non-Sync browser service > Browser has Sync keys optional capability > Account is signed into Firefox Desktop'
  );
export const CachedNonSyncBrowserServiceWithPasswordlessCapabilityNotSignedIntoDesktop =
  storyWithProps(
    {
      sessionToken: MOCK_SESSION_TOKEN,
      serviceName: MozServices.SmartWindow,
      hasLinkedAccount: true,
      hasPassword: false,
      integration: createMockSigninOAuthNativeIntegration({
        service: OAuthNativeServices.SmartWindow,
        isSync: false,
      }),
      supportsKeysOptionalLogin: true,
    },
    'Cached > Non-Sync browser service > Browser has Sync keys optional capability > Account is not signed into Firefox Desktop'
  );

export const CmsNonCachedDefault = storyWithProps(
  {
    integration: createMockSigninOAuthIntegration({
      cmsInfo: MOCK_CMS_INFO,
    }),
  },
  'CMS > Regular layout > Non-Cached'
);
export const CmsNonCachedSplitLayout = storyWithProps(
  {
    integration: createMockSigninOAuthIntegration({
      cmsInfo: {
        ...MOCK_CMS_INFO,
        SigninPage: {
          ...MOCK_CMS_INFO.SigninPage!,
          splitLayout: true,
        },
      },
    }),
  },
  'CMS > Split layout > Non-Cached'
);
export const CmsCachedSplitLayout = storyWithProps(
  {
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
  },
  'CMS > Split layout > Cached'
);
export const CmsCachedCachedPage = storyWithProps(
  {
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
  },
  'CMS > Regular layout > Cached'
);
