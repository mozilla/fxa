/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signin from '.';
import { MozServices } from '../../lib/types';
import { Meta } from '@storybook/react';
import {
  Subject,
  createMockSigninOAuthIntegration,
  createMockSigninSyncIntegration,
} from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { SigninProps } from './interfaces';
import { MOCK_SERVICE, MOCK_SESSION_TOKEN } from '../mocks';

export default {
  title: 'Pages/Signin',
  component: Signin,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = ({
  ...props // overrides
}: Partial<SigninProps> = {}) => {
  const story = () => <Subject {...props} />;
  return story;
};

export const SignInToSettingsWithPassword = storyWithProps();
export const SignInToRelyingPartyWithPassword = storyWithProps({
  serviceName: MOCK_SERVICE,
});

export const SignInToPocketWithPassword = storyWithProps({
  serviceName: MozServices.Pocket,
  integration: createMockSigninOAuthIntegration(),
});

export const SignInToSettingsWithCachedCredentials = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
});
export const SignInToRelyingPartyWithCachedCredentials = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
  serviceName: MOCK_SERVICE,
});

export const SignInToPocketWithCachedCredentials = storyWithProps({
  sessionToken: MOCK_SESSION_TOKEN,
  serviceName: MozServices.Pocket,
  integration: createMockSigninOAuthIntegration(),
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

export const NoThirdPartyAuthBecauseSyncWithPassword = storyWithProps({
  hasLinkedAccount: true,
  hasPassword: true,
  integration: createMockSigninSyncIntegration(),
});
