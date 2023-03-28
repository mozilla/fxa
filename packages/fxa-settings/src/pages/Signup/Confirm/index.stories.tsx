/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Confirm from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { mockAppContext } from '../../../models/mocks';
import { withLocalization } from '../../../../.storybook/decorators';
import { Account, AppContext } from 'fxa-settings/src/models';
import {
  MOCK_PROFILE_WITH_RESEND_ERROR,
  MOCK_PROFILE_WITH_RESEND_SUCCESS,
  MOCK_SESSION_TOKEN,
  MOCK_UNVERIFIED_SESSION,
} from './mocks';

export default {
  title: 'Pages/Signup/Confirm',
  component: Confirm,
  decorators: [withLocalization],
} as Meta;

const storyWithContext = (account: Account) => {
  const story = () => (
    <LocationProvider>
      <AppContext.Provider
        value={mockAppContext({ account, session: MOCK_UNVERIFIED_SESSION })}
      >
        <Confirm sessionTokenId={MOCK_SESSION_TOKEN} />
      </AppContext.Provider>
    </LocationProvider>
  );
  return story;
};

export const WithSuccessOnResend = storyWithContext(
  MOCK_PROFILE_WITH_RESEND_SUCCESS
);

export const WithErrorOnResend = storyWithContext(
  MOCK_PROFILE_WITH_RESEND_ERROR
);
