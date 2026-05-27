/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Subject, createMockWebIntegration } from './mocks';
import { MOCK_CMS_INFO } from '../../mocks';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { createMockSigninOAuthNativeIntegration } from '../mocks';

// Flips passkey feature flags on for the passkey-enabled story variants.
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

export default {
  title: 'Pages/Signin/SigninPasswordlessCode',
  component: Subject,
  decorators: [withLocalization],
} as Meta;

export const DefaultSignin = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject email="user@example.com" expirationMinutes={5} isSignup={false} />
  </AppContext.Provider>
);

export const DefaultSignup = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject
      email="newuser@example.com"
      expirationMinutes={5}
      isSignup={true}
    />
  </AppContext.Provider>
);

export const WithCmsInfo = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject
      email="user@example.com"
      expirationMinutes={5}
      integration={createMockWebIntegration(MOCK_CMS_INFO)}
      isSignup={false}
    />
  </AppContext.Provider>
);

export const ShortExpiration = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject email="user@example.com" expirationMinutes={1} isSignup={false} />
  </AppContext.Provider>
);

export const LongExpiration = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject email="user@example.com" expirationMinutes={15} isSignup={false} />
  </AppContext.Provider>
);

export const LongEmailAddress = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject
      email="verylongemailaddress.with.multiple.dots@subdomain.example.com"
      expirationMinutes={5}
      isSignup={false}
    />
  </AppContext.Provider>
);

export const SignedIntoFirefoxDesktop = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject
      email="user@example.com"
      expirationMinutes={5}
      integration={createMockSigninOAuthNativeIntegration({ isSync: true })}
      isSignedIntoFirefox={true}
      isSignup={false}
    />
  </AppContext.Provider>
);

export const WithSendError = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject
      email="user@example.com"
      expirationMinutes={5}
      isSignup={false}
      sendError={{
        errno: 999,
        message: 'Something went wrong sending the code',
      }}
    />
  </AppContext.Provider>
);

// Passkey button stacks beneath the OTP form with an "or" separator.
export const DefaultSigninWithPasskey = () => (
  <AppContext.Provider value={passkeyEnabledContext()}>
    <Subject email="user@example.com" expirationMinutes={5} isSignup={false} />
  </AppContext.Provider>
);

// Signup flow: passkey button hidden (brand-new account has no passkey).
export const DefaultSignupWithPasskey = () => (
  <AppContext.Provider value={passkeyEnabledContext()}>
    <Subject
      email="newuser@example.com"
      expirationMinutes={5}
      isSignup={true}
    />
  </AppContext.Provider>
);

// Passkey + CMS info: branded layout variant.
export const WithCmsInfoAndPasskey = () => (
  <AppContext.Provider value={passkeyEnabledContext()}>
    <Subject
      email="user@example.com"
      expirationMinutes={5}
      integration={createMockWebIntegration(MOCK_CMS_INFO)}
      isSignup={false}
    />
  </AppContext.Provider>
);

// Passkey + send error: OTP error banner coexists with the passkey block.
export const WithSendErrorAndPasskey = () => (
  <AppContext.Provider value={passkeyEnabledContext()}>
    <Subject
      email="user@example.com"
      expirationMinutes={5}
      isSignup={false}
      sendError={{
        errno: 999,
        message: 'Something went wrong sending the code',
      }}
    />
  </AppContext.Provider>
);
