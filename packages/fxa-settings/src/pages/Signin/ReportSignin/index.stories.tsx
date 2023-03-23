/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ReportSignin, { ReportSigninProps } from '.';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { BLOCKED_SIGNIN_SUPPORT_URL } from '../../../constants';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/Signin/ReportSignin',
  component: ReportSignin,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props: ReportSigninProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <ReportSignin {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({});

export const WithSupportLink = storyWithProps({
  showSupportLink: BLOCKED_SIGNIN_SUPPORT_URL,
});
