/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signup from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';
import { withLocalization } from 'fxa-react/lib/storybooks';
import {
  createMockSignupOAuthIntegration,
  createMockSignupSyncDesktopIntegration,
  createMockSignupWebIntegration,
  mockBeginSignupHandler,
  signupQueryParams,
} from './mocks';
import { SignupProps } from './interfaces';
import { SignupQueryParams } from '../../models/pages/signup';
import { mockUrlQueryData } from '../../models/mocks';

export default {
  title: 'Pages/Signup',
  component: Signup,
  decorators: [withLocalization],
} as Meta;

const urlQueryData = mockUrlQueryData(signupQueryParams);
const queryParamModel = new SignupQueryParams(urlQueryData);

const storyWithProps = (props?: Partial<SignupProps>) => {
  const story = () => (
    <LocationProvider>
      <Signup
        {...{
          integration: createMockSignupWebIntegration(),
          queryParamModel,
          beginSignupHandler: mockBeginSignupHandler,
          ...props,
        }}
      />
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps();

export const CantChangeEmail = storyWithProps({
  integration: createMockSignupOAuthIntegration(),
});

export const ClientIsPocket = storyWithProps({
  integration: createMockSignupOAuthIntegration(MozServices.Pocket),
});

export const ChooseWhatToSyncIsEnabled = storyWithProps({
  integration: createMockSignupSyncDesktopIntegration(),
});
