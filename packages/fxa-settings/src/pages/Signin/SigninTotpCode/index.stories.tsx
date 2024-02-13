/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SigninTotpCode from '.';
import { Meta } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { MozServices } from '../../../lib/types';
import { withLocalization } from 'fxa-react/lib/storybooks';
import {
  AuthUiError,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';

export default {
  title: 'Pages/Signin/SigninTotpCode',
  component: SigninTotpCode,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props: {
  handleNavigation: () => void;
  submitTotpCode: () => Promise<{ status: boolean; error?: AuthUiError }>;
  serviceName: MozServices;
}) => {
  const story = () => (
    <LocationProvider>
      <SigninTotpCode {...props} />
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({
  handleNavigation: () => {},
  submitTotpCode: async () => ({
    status: true,
  }),
  serviceName: MozServices.Default,
});

export const WithRelyingParty = storyWithProps({
  handleNavigation: () => {},
  submitTotpCode: async () => ({
    status: true,
  }),
  serviceName: MozServices.MozillaVPN,
});

export const WithIncorrectCode = storyWithProps({
  handleNavigation: () => {},
  submitTotpCode: async () => ({
    status: false,
  }),
  serviceName: MozServices.MozillaVPN,
});

export const WithErrorState = storyWithProps({
  handleNavigation: () => {},
  submitTotpCode: async () => ({
    status: false,
    error: AuthUiErrors.UNEXPECTED_ERROR,
  }),
  serviceName: MozServices.MozillaVPN,
});
