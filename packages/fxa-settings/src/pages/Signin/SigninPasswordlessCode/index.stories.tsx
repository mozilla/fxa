/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Subject, createMockWebIntegration, createOAuthNativeIntegration } from './mocks';
import { MOCK_CMS_INFO } from '../../mocks';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';

export default {
  title: 'Pages/Signin/SigninPasswordlessCode',
  component: Subject,
  decorators: [withLocalization],
} as Meta;

export const DefaultSignin = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject
      email="user@example.com"
      expirationMinutes={5}
      isSignup={false}
    />
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

export const WithSyncIntegration = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject
      email="syncuser@example.com"
      expirationMinutes={5}
      integration={createOAuthNativeIntegration(true)}
      isSignup={false}
    />
  </AppContext.Provider>
);

export const WithSyncAndCms = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject
      email="syncuser@example.com"
      expirationMinutes={5}
      integration={createOAuthNativeIntegration(true, MOCK_CMS_INFO)}
      isSignup={false}
    />
  </AppContext.Provider>
);

export const WithWebIntegration = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject
      email="webuser@example.com"
      expirationMinutes={5}
      integration={createMockWebIntegration()}
      isSignup={false}
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
    <Subject
      email="user@example.com"
      expirationMinutes={1}
      isSignup={false}
    />
  </AppContext.Provider>
);

export const LongExpiration = () => (
  <AppContext.Provider value={mockAppContext()}>
    <Subject
      email="user@example.com"
      expirationMinutes={15}
      isSignup={false}
    />
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