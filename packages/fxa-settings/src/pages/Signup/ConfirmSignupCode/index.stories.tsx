/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ConfirmSignupCode from '.';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { Account, AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { createMockIntegrationWithCms } from '../../mocks';
import { createMockOAuthNativeIntegration, Subject } from './mocks';

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
  verifySession: () => Promise.reject(AuthUiErrors.INVALID_EXPIRED_OTP_CODE),
  sendVerificationCode: () => Promise.reject(AuthUiErrors.UNEXPECTED_ERROR),
} as unknown as Account;

export const WithSuccess = () => (
  <AppContext.Provider value={mockAppContext({ account: accountWithSuccess })}>
    <Subject />
  </AppContext.Provider>
);
export const WithSuccessSync = () => (
  <AppContext.Provider value={mockAppContext({ account: accountWithSuccess })}>
    <Subject integration={createMockOAuthNativeIntegration()} />
  </AppContext.Provider>
);

export const WithErrors = () => (
  <AppContext.Provider value={mockAppContext({ account: accountWithErrors })}>
    <Subject />
  </AppContext.Provider>
);

export const OAuthDesktopServiceRelay = () => (
  <AppContext.Provider value={mockAppContext({ account: accountWithSuccess })}>
    <Subject integration={createMockOAuthNativeIntegration(false)} />
  </AppContext.Provider>
);

export const WithSuccessCms = () => (
  <AppContext.Provider value={mockAppContext({ account: accountWithSuccess })}>
    <Subject integration={createMockIntegrationWithCms()} />
  </AppContext.Provider>
);
