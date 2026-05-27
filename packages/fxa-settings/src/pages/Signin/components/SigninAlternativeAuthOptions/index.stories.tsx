/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

import SigninAlternativeAuthOptions from '.';
import { AppContext } from '../../../../models';
import { mockAppContext } from '../../../../models/mocks';
import {
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninWebIntegration,
} from '../../mocks';
import {
  MOCK_AVATAR_NON_DEFAULT,
  MOCK_EMAIL,
  mockFinishOAuthFlowHandler,
} from '../../../mocks';
import { MozServices } from '../../../../lib/types';

// Renders for linked-passwordless users: only path forward is alt auth.

const passkeyEnabledContext = () => {
  const ctx = mockAppContext();
  if (ctx.config) {
    ctx.config.featureFlags = {
      ...ctx.config.featureFlags,
      passkeysEnabled: true,
      passkeyAuthenticationEnabled: true,
    };
  }
  return ctx;
};

type SubjectProps = Partial<
  React.ComponentProps<typeof SigninAlternativeAuthOptions>
> & {
  passkeyEnabled?: boolean;
};

const Subject = ({
  integration = createMockSigninWebIntegration(),
  email = MOCK_EMAIL,
  serviceName = MozServices.Default,
  hasLinkedAccount = true,
  hasPassword = false,
  avatarData = { account: { avatar: MOCK_AVATAR_NON_DEFAULT } },
  avatarLoading = false,
  finishOAuthFlowHandler = mockFinishOAuthFlowHandler,
  passkeyEnabled = false,
  ...props
}: SubjectProps) => (
  <LocationProvider>
    <AppContext.Provider
      value={passkeyEnabled ? passkeyEnabledContext() : mockAppContext()}
    >
      <SigninAlternativeAuthOptions
        {...{
          integration,
          email,
          serviceName,
          hasLinkedAccount,
          hasPassword,
          avatarData,
          avatarLoading,
          finishOAuthFlowHandler,
          ...props,
        }}
      />
    </AppContext.Provider>
  </LocationProvider>
);

export default {
  title: 'Pages/Signin/SigninAlternativeAuthOptions',
  component: SigninAlternativeAuthOptions,
  decorators: [withLocalization],
} as Meta;

// Passkey flags off: only third-party providers render.
export const Default = () => <Subject />;

// Sync variant: merge gate runs after third-party / passkey signin.
export const Sync = () => (
  <Subject
    serviceName={MozServices.FirefoxSync}
    integration={createMockSigninOAuthNativeSyncIntegration()}
  />
);

// Firefox Desktop hides the "Use a different account" link (no merge support).
export const SignedIntoFirefoxDesktop = () => (
  <Subject
    integration={createMockSigninOAuthNativeSyncIntegration()}
    isSignedIntoFirefox={true}
  />
);

// Success banner carried over from a previous page (e.g. password reset).
export const WithSuccessBanner = () => (
  <Subject
    localizedSuccessBannerHeading="Password updated"
    localizedSuccessBannerDescription="You can now sign in with your new password."
  />
);

// Error carried over from a previous page (e.g. session expired).
export const WithErrorBanner = () => (
  <Subject localizedErrorFromLocationState="Your sign-in session has expired." />
);

// Passkey enabled: third-party providers + passkey button stack together.
export const WithPasskeyEnabled = () => <Subject passkeyEnabled={true} />;

// Passkey + Sync: ceremony routes to /signin_passkey_fallback for the password gate.
export const WithPasskeyEnabledSync = () => (
  <Subject
    passkeyEnabled={true}
    serviceName={MozServices.FirefoxSync}
    integration={createMockSigninOAuthNativeSyncIntegration()}
  />
);

// Passkey + carried-over error: error banner coexists with the alt-auth block.
export const WithPasskeyEnabledAndErrorBanner = () => (
  <Subject
    passkeyEnabled={true}
    localizedErrorFromLocationState="Your sign-in session has expired."
  />
);
