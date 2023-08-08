/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signup from '.';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';
import { withLocalization } from 'fxa-react/lib/storybooks';
import {
  createMockSignupOAuthIntegration,
  createMockSignupSyncDesktopIntegration,
  createMockSignupWebIntegration,
  mockBeginSignupHandler,
} from './mocks';
import { SignupProps } from './interfaces';
import { MOCK_EMAIL } from '../mocks';
import { SignupQueryParams } from '../../models/pages/signup';

export default {
  title: 'Pages/Signup',
  component: Signup,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props?: Partial<SignupProps>) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <Signup
          {...{
            integration: createMockSignupWebIntegration(),
            // TODO: Tweak this when useValidatedQueryParams is implemented with class-validator
            queryParams: { email: MOCK_EMAIL } as SignupQueryParams,
            beginSignupHandler: mockBeginSignupHandler,
            ...props,
          }}
        />
      </AppLayout>
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
