/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Ready from '.';
import { ViewNameType } from '.';
import AppLayout from '../../components/AppLayout';
import { Meta } from '@storybook/react';

export default {
  title: 'components/Ready',
  component: Ready,
} as Meta;

type ReadyWithLayoutPropsType = {
  continueHandler?: Function;
  isSignedIn?: boolean;
  serviceName?: string;
  viewName: ViewNameType;
};

const ReadyWithLayout = ({
  continueHandler,
  isSignedIn,
  serviceName,
  viewName,
}: ReadyWithLayoutPropsType) => {
  return (
    <AppLayout>
      <Ready {...{ continueHandler, isSignedIn, serviceName, viewName }} />
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
    serviceName="Example Service"
    viewName="reset-password-confirmed"
  />
);

export const WithRelyingPartyNoContinueAction = () => (
  <ReadyWithLayout serviceName="Example Service" viewName="signin-confirmed" />
);

export const WithRelyingPartyAndContinueAction = () => (
  <ReadyWithLayout
    serviceName={'Example Service'}
    viewName="reset-password-confirmed"
    continueHandler={() => {
      console.log('Arbitrary action');
    }}
  />
);
