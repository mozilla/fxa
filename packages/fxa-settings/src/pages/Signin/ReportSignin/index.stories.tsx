/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ReportSignin from '.';

export default {
  title: 'Pages/Signin/ReportSignin',
  component: ReportSignin,
  decorators: [withLocalization],
} as Meta;

const submitReport = () => {};

export const Default = () => (
  <LocationProvider>
    <ReportSignin {...{ submitReport }} />
  </LocationProvider>
);

export const WithErrorBanner = () => {
  const errorMessage = 'Error message appears here';
  return (
    <LocationProvider>
      <ReportSignin {...{ errorMessage, submitReport }} />
    </LocationProvider>
  );
};
