/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Ready, { ReadyProps } from '.';
import AppLayout from '../../components/AppLayout';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';

export default {
  title: 'components/Ready',
  component: Ready,
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
  <ReadyWithLayout viewName="signin-confirmed" />
);

export const ResetPasswordConfirmForLoggedOutUser = () => (
  <ReadyWithLayout isSignedIn={false} viewName="reset-password-confirmed" />
);

export const ResetPasswordConfirmedWithRelyingParty = () => (
  <ReadyWithLayout
    serviceName={MozServices.FirefoxSync}
    viewName="reset-password-confirmed"
  />
);

export const WithRelyingPartyNoContinueAction = () => (
  <ReadyWithLayout
    serviceName={MozServices.FirefoxSync}
    viewName="signin-confirmed"
  />
);

export const WithRelyingPartyAndContinueAction = () => (
  <ReadyWithLayout
    serviceName={MozServices.FirefoxSync}
    viewName="reset-password-confirmed"
    continueHandler={() => {
      console.log('Arbitrary action');
    }}
  />
);

export const IsSync = () => (
  <ReadyWithLayout
    viewName="reset-password-with-recovery-key-verified"
    isSync
  />
);

export const WithErrorMessage = () => (
  <ReadyWithLayout
    viewName="reset-password-with-recovery-key-verified"
    isSync
    errorMessage="But something else went wrong"
  />
);
