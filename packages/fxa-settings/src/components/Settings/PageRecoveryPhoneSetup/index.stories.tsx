/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import PageRecoveryPhoneSetup from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Meta } from '@storybook/react';
import SettingsLayout from '../SettingsLayout';
import { MemoryRouter } from 'react-router';
import { Account, AppContext } from '../../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { RecoveryPhoneSetupReason } from '../../../lib/types';
import { MfaContext } from '../MfaGuard';

export default {
  title: 'Pages/Settings/RecoveryPhoneSetup',
  component: PageRecoveryPhoneSetup,
  decorators: [withLocalization],
} as Meta;

export const AddWithSuccess = () => (
  <MemoryRouter>
    <SettingsLayout>
      <AppContext.Provider
        value={mockAppContext({
          account: {
            ...MOCK_ACCOUNT,
            addRecoveryPhone: () => {},
            confirmRecoveryPhoneWithJwt: () => {},
          } as unknown as Account,
        })}
      >
        <MfaContext.Provider value="2fa">
          <PageRecoveryPhoneSetup />
        </MfaContext.Provider>
      </AppContext.Provider>
    </SettingsLayout>
  </MemoryRouter>
);

export const ChangeWithSuccess = () => {
  const locationWithState = {
    pathname: '/settings/recovery-phone/setup',
    search: '',
    hash: '',
    state: {
      reason: RecoveryPhoneSetupReason.change,
    },
    key: 'storybook-mock',
  };

  return (
    <MemoryRouter initialEntries={[{ pathname: locationWithState.pathname, state: locationWithState.state }]}>
      <SettingsLayout>
        <AppContext.Provider
          value={mockAppContext({
            account: {
              ...MOCK_ACCOUNT,
              addRecoveryPhone: () => {},
              confirmRecoveryPhoneWithJwt: () => {},
            } as unknown as Account,
          })}
        >
          <MfaContext.Provider value="2fa">
            <PageRecoveryPhoneSetup />
          </MfaContext.Provider>
        </AppContext.Provider>
      </SettingsLayout>
    </MemoryRouter>
  );
};

export const WithErrorOnAdd = () => (
  <MemoryRouter>
    <SettingsLayout>
      <AppContext.Provider
        value={mockAppContext({
          account: {
            ...MOCK_ACCOUNT,
            addRecoveryPhone: () => {
              throw AuthUiErrors.BACKEND_SERVICE_FAILURE;
            },
            confirmRecoveryPhoneWithJwt: () => {},
          } as unknown as Account,
        })}
      >
        <MfaContext.Provider value="2fa">
          <PageRecoveryPhoneSetup />
        </MfaContext.Provider>
      </AppContext.Provider>
    </SettingsLayout>
  </MemoryRouter>
);

export const WithErrorOnConfirmSetup = () => (
  <MemoryRouter>
    <SettingsLayout>
      <AppContext.Provider
        value={mockAppContext({
          account: {
            ...MOCK_ACCOUNT,
            addRecoveryPhone: () => {},
            confirmRecoveryPhoneWithJwt: () => {
              throw AuthUiErrors.INVALID_OTP_CODE;
            },
          } as unknown as Account,
        })}
      >
        <MfaContext.Provider value="2fa">
          <PageRecoveryPhoneSetup />
        </MfaContext.Provider>
      </AppContext.Provider>
    </SettingsLayout>
  </MemoryRouter>
);

export const WithErrorOnConfirmChange = () => (
  <MemoryRouter>
    <SettingsLayout>
      <AppContext.Provider
        value={mockAppContext({
          account: {
            ...MOCK_ACCOUNT,
            addRecoveryPhone: () => {},
            confirmRecoveryPhoneWithJwt: () => {
              throw AuthUiErrors.INVALID_OTP_CODE;
            },
          } as unknown as Account,
        })}
      >
        <MfaContext.Provider value="2fa">
          <PageRecoveryPhoneSetup />
        </MfaContext.Provider>
      </AppContext.Provider>
    </SettingsLayout>
  </MemoryRouter>
);
