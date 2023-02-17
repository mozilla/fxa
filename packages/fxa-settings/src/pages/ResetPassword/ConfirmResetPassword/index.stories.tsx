/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmResetPassword from '.';
import {
  LocationProvider,
  createHistory,
  createMemorySource,
} from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_EMAIL, MOCK_PASSWORD_FORGOT_TOKEN } from './mocks';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/ResetPassword/ConfirmResetPassword',
  component: ConfirmResetPassword,
  decorators: [withLocalization],
} as Meta;

const source = createMemorySource('/fake-memories');
const history = createHistory(source);
history.location.state = {
  email: MOCK_EMAIL,
  passwordForgotToken: MOCK_PASSWORD_FORGOT_TOKEN,
};

const storyWithProps = ({ ...props }) => {
  const story = () => (
    <LocationProvider history={history}>
      <ConfirmResetPassword {...props} />
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({});
