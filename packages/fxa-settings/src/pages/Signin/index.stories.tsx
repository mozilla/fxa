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

const storyWithProps = ({
  ...props // overrides
}: Partial<SigninProps> & { supportsKeysOptionalLogin?: boolean } = {}) => {
  const story = () => <Subject {...props} />;
  return story;
};

export const SignInToSettingsWithPassword = storyWithProps();
export const SignInToSettingsWithPasswordAccountLockedError = storyWithProps({
  beginSigninHandler: () => {
    return Promise.resolve({
      error: AuthUiErrors.ACCOUNT_RESET as BeginSigninError,
    });
  },
});

export const SignInToRelyingPartyWithPassword = storyWithProps({
  serviceName: MOCK_SERVICE,
});

export const SignInToSettingsWithCachedCredentials = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
});
export const SignInToRelyingPartyWithCachedCredentials = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
  serviceName: MOCK_SERVICE,
});

export const SignInToSyncWithCachedCredentials = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
  integration: createMockSigninOAuthIntegration({ wantsKeys: true }),
});

export const HasLinkedAccountAndNoPassword = storyWithProps({
  hasLinkedAccount: true,
  hasPassword: false,
});

// UX could be improved, see FXA-8278
export const NoLinkedAccountAndNoPassword = storyWithProps({
  hasPassword: false,
});

export const SignInToSync = storyWithProps({
  serviceName: MozServices.FirefoxSync,
  hasLinkedAccount: true,
  hasPassword: true,
  integration: createMockSigninOAuthNativeSyncIntegration(),
});

export const SignInToSyncNoPassword = storyWithProps({
  serviceName: MozServices.FirefoxSync,
  hasLinkedAccount: true,
  hasPassword: false,
  integration: createMockSigninOAuthNativeSyncIntegration(),
});

export const SignInWithCms = storyWithProps({
  integration: createMockSigninOAuthIntegration({
    cmsInfo: MOCK_CMS_INFO,
  }),
});

export const SignInWithCmsSplitLayout = storyWithProps({
  integration: createMockSigninOAuthIntegration({
    cmsInfo: {
      ...MOCK_CMS_INFO,
      SigninPage: {
        ...MOCK_CMS_INFO.SigninPage!,
        splitLayout: true,
      },
    },
  }),
});

export const SignInWithCmsCachedCredentials = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
  integration: createMockSigninOAuthIntegration({
    wantsKeys: false,
    cmsInfo: MOCK_CMS_INFO,
  }),
});

export const SignInWithCmsCachedCredentialsSplitLayout = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
  integration: createMockSigninOAuthIntegration({
    wantsKeys: false,
    cmsInfo: {
      ...MOCK_CMS_INFO,
      SigninPage: {
        ...MOCK_CMS_INFO.SigninPage!,
        splitLayout: true,
      },
    },
  }),
});

export const SignInWithCmsCachedPage = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
  integration: createMockSigninOAuthIntegration({
    wantsKeys: false,
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
});

export const SignInRelayNoPasswordlessSupport = storyWithProps({
  integration: createMockSigninOAuthNativeIntegration({
    service: OAuthNativeServices.Relay,
    isSync: false,
  }),
  supportsKeysOptionalLogin: false,
});

export const SignInRelayWithPasswordlessSupport = storyWithProps({
  integration: createMockSigninOAuthNativeIntegration({
    service: OAuthNativeServices.Relay,
    isSync: false,
  }),
  supportsKeysOptionalLogin: true,
});

export const CachedSignInRelayWithPasswordlessSupport = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
  integration: createMockSigninOAuthNativeIntegration({
    service: OAuthNativeServices.Relay,
    isSync: false,
  }),
  supportsKeysOptionalLogin: true,
});

export const CachedSignInSmartWindowWithPasswordlessSupport = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
  integration: createMockSigninOAuthNativeIntegration({
    service: OAuthNativeServices.SmartWindow,
    isSync: false,
  }),
  supportsKeysOptionalLogin: true,
});

export const SignInSmartWindowWithPasswordlessSupport = storyWithProps({
  integration: createMockSigninOAuthNativeIntegration({
    service: OAuthNativeServices.SmartWindow,
    isSync: false,
  }),
  supportsKeysOptionalLogin: true,
});
