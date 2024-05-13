/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { Account, AccountProps } from './index';
import { BounceSubType, BounceType } from 'fxa-admin-server/src/graphql';
import {
  AdminPanelEnv,
  AdminPanelGroup,
  AdminPanelGuard,
} from 'fxa-shared/guards';
import { IClientConfig } from '../../../../interfaces';
import { mockConfigBuilder } from '../../../lib/config';

const mockGuard = new AdminPanelGuard(AdminPanelEnv.Prod);
const mockGroup = mockGuard.getGroup(AdminPanelGroup.SupportAgentProd);

export const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: mockGroup,
  },
});

jest.mock('../../../hooks/UserContext.ts', () => ({
  useUserContext: () => {
    const ctx = {
      guard: mockGuard,
      user: mockConfig.user,
      setUser: () => {},
    };
    return ctx;
  },
}));

let accountResponse: AccountProps = {
  uid: 'ca1c61239f2448b2af618f0b50226cde',
  email: 'hey@happy.com',
  emailVerified: true,
  locale: 'en-US',
  emails: [
    {
      email: 'hey@happy.com',
      isVerified: true,
      isPrimary: true,
      createdAt: 1589467100316,
    },
  ],
  createdAt: 1589467100316,
  disabledAt: null,
  lockedAt: null,
  verifierSetAt: 1589467100316,
  emailBounces: [
    {
      bounceSubType: BounceSubType.NoEmail,
      bounceType: BounceType.Permanent,
      createdAt: 556061927,
      diagnosticCode: '',
      email: 'bloop@mozilla.com',
      templateName: 'subscriptionsPaymentProviderCancelled',
    },
  ],
  onCleared() {},
  query: 'hey@happy.com',
  totp: [
    {
      verified: true,
      enabled: true,
      createdAt: 1589467100316,
    },
  ],
  recoveryKeys: [
    {
      createdAt: 1589467100316,
      verifiedAt: 1589467100316,
      enabled: true,
    },
  ],
  attachedClients: [],
  securityEvents: [],
};

it('renders without imploding', () => {
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );

  expect(getByTestId('account-section')).toBeInTheDocument();
});

it('displays the account', async () => {
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );

  expect(getByTestId('account-section')).toBeInTheDocument();
  expect(getByTestId('sign-up-email')).toHaveTextContent(accountResponse.email);
  expect(getByTestId('primary-verified')).toHaveTextContent('Yes');
  expect(getByTestId('primary-email')).toHaveTextContent(
    accountResponse.emails![0].email
  );
  expect(getByTestId('account-uid')).toHaveTextContent(accountResponse.uid);
  expect(getByTestId('account-created-at')).toHaveTextContent(
    accountResponse.createdAt.toString()
  );

  expect(getByTestId('account-locale')).toHaveTextContent(
    accountResponse.locale!
  );
});

it('displays when account is disabled', async () => {
  const disabledAccount = {
    ...accountResponse,
    disabledAt: accountResponse.createdAt + 1000 * 60 * 60,
  };
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...disabledAccount} />
    </MockedProvider>
  );

  expect(getByTestId('account-disabled-at')).toHaveTextContent(
    (disabledAccount.disabledAt || '').toString()
  );
});

it('displays when account is locked', async () => {
  const lockedAccount = {
    ...accountResponse,
    lockedAt: accountResponse.createdAt + 1000 * 60 * 60,
  };
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...lockedAccount} />
    </MockedProvider>
  );

  expect(getByTestId('account-locked-at')).toHaveTextContent(
    (lockedAccount.lockedAt || '').toString()
  );
});

it('displays when account password is not set', async () => {
  const lockedAccount = {
    ...accountResponse,
    verifierSetAt: 0,
  };
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...lockedAccount} />
    </MockedProvider>
  );

  expect(getByTestId('account-password-set')).toHaveTextContent('No');
});

it('displays when account password is set', async () => {
  const lockedAccount = {
    ...accountResponse,
    verifierSetAt: 1589467100316,
  };
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...lockedAccount} />
    </MockedProvider>
  );

  expect(getByTestId('account-password-set')).toHaveTextContent('Yes');
});

it('displays the unconfirmed account', async () => {
  accountResponse.emails![0].isVerified = false;
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );
  expect(getByTestId('primary-verified')).toHaveTextContent('No');
});

it('displays the bounce type description', async () => {
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );
  expect(getByTestId('bounce-description')).toBeInTheDocument();
});

it('displays the totp status', async () => {
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );
  expect(getByTestId('totp-created-at')).toBeInTheDocument();
  expect(getByTestId('totp-verified')).toBeInTheDocument();
  expect(getByTestId('totp-enabled')).toBeInTheDocument();
});

it('displays the account recovery key status', async () => {
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );
  expect(getByTestId('recovery-keys-created-at')).toBeInTheDocument();
  expect(getByTestId('recovery-keys-verified')).toBeInTheDocument();
  expect(getByTestId('recovery-keys-enabled')).toBeInTheDocument();
});

it('displays secondary emails', async () => {
  accountResponse.emails!.push({
    email: 'ohdeceiver@gmail.com',
    isVerified: false,
    isPrimary: false,
    createdAt: 1589467100316,
  });

  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );

  expect(getByTestId('secondary-section')).toBeInTheDocument();
  expect(getByTestId('secondary-email')).toHaveTextContent(
    'ohdeceiver@gmail.com'
  );
  expect(getByTestId('secondary-verified')).toHaveTextContent('No');
});

it('displays the locale', async () => {
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );
  expect(getByTestId('account-locale')).toHaveTextContent('en-US');
  expect(getByTestId('edit-account-locale')).toBeInTheDocument();
});

it('displays send password reset', async () => {
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );
  expect(getByTestId('password-reset-button')).toBeInTheDocument();
});

it('displays key-stretch-version', async () => {
  const lockedAccount = {
    ...accountResponse,
    verifierSetAt: 0,
  };
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...lockedAccount} />
    </MockedProvider>
  );

  expect(getByTestId('key-stretch-version')).toBeInTheDocument();
});
