/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ReportSignin from '.';
import { MemoryRouter } from 'react-router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Signin/ReportSignin',
  component: ReportSignin,
  decorators: [withLocalization],
} as Meta;

const submitReport = () => {};

export const Default = () => (
  <MemoryRouter>
    <ReportSignin {...{ submitReport }} />
  </MemoryRouter>
);

export const WithErrorBanner = () => {
  const errorMessage = 'Error message appears here';
  return (
    <MemoryRouter>
      <ReportSignin {...{ errorMessage, submitReport }} />
    </MemoryRouter>
  );
};
