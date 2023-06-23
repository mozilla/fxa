/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Ready, { ReadyProps } from '.';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';
import { AppLayout } from '../AppLayout';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Ready',
  component: Ready,
  decorators: [withLocalization],
} as Meta;

const ReadyWithLayout = ({
  continueHandler,
  isSignedIn,
  serviceName,
  viewName,
  isSync,
  errorMessage,
}: ReadyProps) => {
  return (
    <AppLayout>
      <Ready
        {...{
          viewName,
          continueHandler,
          isSignedIn,
          serviceName,
          isSync,
          errorMessage,
        }}
      />
    </AppLayout>
  );
};

export const SigninConfirmedOrSigninVerified = () => (
  <ReadyWithLayout viewName="signin-confirmed" isSignedIn />
);

export const ResetPasswordConfirmForLoggedOutUser = () => (
  <ReadyWithLayout isSignedIn={false} viewName="reset-password-confirmed" />
);

export const ResetPasswordConfirmedWithRelyingParty = () => (
  <ReadyWithLayout
    isSignedIn
    serviceName={MozServices.FirefoxSync}
    viewName="reset-password-confirmed"
  />
);

export const WithRelyingPartyNoContinueAction = () => (
  <ReadyWithLayout
    isSignedIn
    serviceName={MozServices.FirefoxSync}
    viewName="signin-confirmed"
  />
);

export const WithRelyingPartyAndContinueAction = () => (
  <ReadyWithLayout
    isSignedIn
    serviceName={MozServices.FirefoxSync}
    viewName="reset-password-confirmed"
    continueHandler={() => {
      console.log('Arbitrary action');
    }}
  />
);

export const IsSync = () => (
  <ReadyWithLayout
    isSignedIn
    viewName="reset-password-with-recovery-key-verified"
    isSync
  />
);

export const WithErrorMessage = () => (
  <ReadyWithLayout
    isSignedIn
    viewName="reset-password-with-recovery-key-verified"
    isSync
    errorMessage="But something else went wrong"
  />
);
