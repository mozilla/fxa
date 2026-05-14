/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization } from 'fxa-react/lib/storybooks';
import AppLayout from '../AppLayout';
import AlternativeAuthOptions from '.';
import { PasskeyErrorBannerFixture, Subject } from './mocks';

export default {
  title: 'Components/AlternativeAuthOptions',
  component: AlternativeAuthOptions,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <AppLayout>
    <Subject />
  </AppLayout>
);

export const Standalone = () => (
  <AppLayout>
    <Subject isStandalone />
  </AppLayout>
);

export const WithPasskeySignIn = () => (
  <AppLayout>
    <Subject
      showPasskeySignin
      passkeySignIn={{ onClick: action('passkey-sign-in-clicked') }}
    />
  </AppLayout>
);

export const WithPasskeySignInLoading = () => (
  <AppLayout>
    <Subject
      showPasskeySignin
      passkeySignIn={{
        onClick: action('passkey-sign-in-clicked'),
        isLoading: true,
      }}
    />
  </AppLayout>
);

export const WithPasskeyError = () => (
  <AppLayout>
    <Subject
      showPasskeySignin
      passkeySignIn={{ onClick: action('passkey-sign-in-clicked') }}
      errorBanner={<PasskeyErrorBannerFixture />}
    />
  </AppLayout>
);

export const PasskeyOnly = () => (
  <AppLayout>
    <Subject
      showThirdPartyAuth={false}
      showPasskeySignin
      passkeySignIn={{ onClick: action('passkey-sign-in-clicked') }}
    />
  </AppLayout>
);

export const StandaloneWithPasskey = () => (
  <AppLayout>
    <Subject
      isStandalone
      showPasskeySignin
      passkeySignIn={{ onClick: action('passkey-sign-in-clicked') }}
    />
  </AppLayout>
);
