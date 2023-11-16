/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmSignupCode from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Subject } from './mocks';
import { Account, AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

export default {
  title: 'Pages/Signup/ConfirmSignupCode',
  component: ConfirmSignupCode,
  decorators: [withLocalization],
} as Meta;

const accountWithSuccess = {
  verifySession: () => alert('success!'),
  sendVerificationCode: () => Promise.resolve(true),
} as unknown as Account;

const accountWithErrors = {
  verifySession: () => Promise.reject(AuthUiErrors.INVALID_EXPIRED_SIGNUP_CODE),
  sendVerificationCode: () => Promise.reject(AuthUiErrors.UNEXPECTED_ERROR),
} as unknown as Account;

export const WithSuccess = () => (
  <AppContext.Provider value={mockAppContext({ account: accountWithSuccess })}>
    <Subject />
  </AppContext.Provider>
);

export const WithErrors = () => (
  <AppContext.Provider value={mockAppContext({ account: accountWithErrors })}>
    <Subject />
  </AppContext.Provider>
);

// no story is needed for integrations (e.g., Sync, OAuth) as these do not change the UI of this page
