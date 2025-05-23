/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import PageRecoveryPhoneSetup, { RecoveryPhoneSetupReason } from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Meta } from '@storybook/react';
import SettingsLayout from '../SettingsLayout';
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
import { Account, AppContext } from '../../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

export default {
  title: 'Pages/Settings/RecoveryPhoneSetup',
  component: PageRecoveryPhoneSetup,
  decorators: [withLocalization],
} as Meta;

export const AddWithSuccess = () => (
  <LocationProvider>
    <SettingsLayout>
      <AppContext.Provider
        value={mockAppContext({
          account: {
            ...MOCK_ACCOUNT,
            addRecoveryPhone: () => {},
            confirmRecoveryPhone: () => {},
          } as unknown as Account,
        })}
      >
        <PageRecoveryPhoneSetup />
      </AppContext.Provider>
    </SettingsLayout>
  </LocationProvider>
);

export const ChangeWithSuccess = () => {
  const locationWithState = {
    pathname: '/settings/recovery-phone/setup',
    search: '',
    hash: '',
    state: {
      reason: RecoveryPhoneSetupReason.replace,
    },
    key: 'storybook-mock',
  };

  // 2. Use Reach Router's memory source and history
  const source = createMemorySource(locationWithState.pathname);
  const history = createHistory(source);

  // 3. Replace history.location with mocked location containing `state`
  history.navigate(locationWithState.pathname, {
    state: locationWithState.state,
  });
  return (
    <LocationProvider {...{ history }}>
      <SettingsLayout>
        <AppContext.Provider
          value={mockAppContext({
            account: {
              ...MOCK_ACCOUNT,
              addRecoveryPhone: () => {},
              confirmRecoveryPhone: () => {},
            } as unknown as Account,
          })}
        >
          <PageRecoveryPhoneSetup />
        </AppContext.Provider>
      </SettingsLayout>
    </LocationProvider>
  );
};

export const WithErrorOnAdd = () => (
  <LocationProvider>
    <SettingsLayout>
      <AppContext.Provider
        value={mockAppContext({
          account: {
            ...MOCK_ACCOUNT,
            addRecoveryPhone: () => {
              throw AuthUiErrors.BACKEND_SERVICE_FAILURE;
            },
            confirmRecoveryPhone: () => {},
          } as unknown as Account,
        })}
      >
        <PageRecoveryPhoneSetup />
      </AppContext.Provider>
    </SettingsLayout>
  </LocationProvider>
);

export const WithErrorOnConfirmSetup = () => (
  <LocationProvider>
    <SettingsLayout>
      <AppContext.Provider
        value={mockAppContext({
          account: {
            ...MOCK_ACCOUNT,
            addRecoveryPhone: () => {},
            confirmRecoveryPhone: () => {
              throw AuthUiErrors.INVALID_OTP_CODE;
            },
          } as unknown as Account,
        })}
      >
        <PageRecoveryPhoneSetup />
      </AppContext.Provider>
    </SettingsLayout>
  </LocationProvider>
);

export const WithErrorOnConfirmChange = () => (
  <LocationProvider>
    <SettingsLayout>
      <AppContext.Provider
        value={mockAppContext({
          account: {
            ...MOCK_ACCOUNT,
            addRecoveryPhone: () => {},
            confirmRecoveryPhone: () => {
              throw AuthUiErrors.INVALID_OTP_CODE;
            },
          } as unknown as Account,
        })}
      >
        <PageRecoveryPhoneSetup />
      </AppContext.Provider>
    </SettingsLayout>
  </LocationProvider>
);
