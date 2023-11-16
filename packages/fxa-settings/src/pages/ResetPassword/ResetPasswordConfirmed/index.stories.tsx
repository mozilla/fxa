/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPasswordConfirmed from '.';
import { MozServices } from '../../../lib/types';
import { Meta } from '@storybook/react';
import { renderStoryWithHistory } from '../../../lib/storybook-utils';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { ResetPasswordConfirmedProps } from './interfaces';

export default {
  title: 'Pages/ResetPassword/ResetPasswordConfirmed',
  component: ResetPasswordConfirmed,
  decorators: [withLocalization],
} as Meta;

function renderStory(
  incomingProps: Partial<ResetPasswordConfirmedProps> = {},
  queryParams: string
) {
  const defaultProps: ResetPasswordConfirmedProps = {
    isSignedIn: true,
    serviceName: MozServices.Default,
  };

  const props: ResetPasswordConfirmedProps = {
    ...defaultProps,
    ...incomingProps,
  };

  return renderStoryWithHistory(
    <ResetPasswordConfirmed {...props} />,
    '/reset_password_verified',
    undefined,
    queryParams
  );
}

export const DefaultSignedIn = () => renderStory({ isSignedIn: true }, ``);

export const DefaultIsSync = () =>
  renderStory(
    { isSignedIn: true, serviceName: MozServices.FirefoxSync },
    'service=sync'
  );

export const DefaultSignedOut = () =>
  renderStory({ isSignedIn: false }, 'service=');

export const WithRelyingPartyNoContinueAction = () =>
  renderStory({ isSignedIn: true }, `service=${MozServices.MozillaVPN}`);

export const WithRelyingPartyAndContinueAction = () =>
  renderStory(
    {
      isSignedIn: true,
      continueHandler: () => {
        console.log('Arbitrary action');
      },
    },
    `service=`
  );
