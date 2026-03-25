/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render } from '@testing-library/react';
import { Account, AccountProps } from './index';
import { GuardEnv, AdminPanelGroup, AdminPanelGuard } from '@fxa/shared/guards';
import { IClientConfig } from '../../../../interfaces';
import { mockConfigBuilder } from '../../../lib/config';

const mockGuard = new AdminPanelGuard(GuardEnv.Prod);
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

jest.mock('../../../lib/api', () => ({
  adminApi: {
    editLocale: jest.fn(),
    unlinkAccount: jest.fn(),
    clearEmailBounce: jest.fn(),
    recordSecurityEvent: jest.fn().mockResolvedValue(true),
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
  disabledAt: undefined,
  lockedAt: undefined,
  verifierSetAt: 1589467100316,
  emailBounces: [
    {
      bounceSubType: 'NoEmail',
      bounceType: 'Permanent',
      createdAt: 556061927,
      diagnosticCode: '',
      email: 'bloop@mozilla.com',
      templateName: 'subscriptionsPaymentProviderCancelled',
    },
  ],
  carts: [],
  onCleared() {},
  query: 'hey@happy.com',
  totp: [
    {
      verified: true,
      enabled: true,
      createdAt: 1589467100316,
    },
  ],
  backupCodes: [
    {
      hasBackupCodes: true,
      count: 3,
    },
  ],
  recoveryPhone: [
    {
      exists: true,
      lastFourDigits: '7890',
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
  subscriptions: [],
  linkedAccounts: [],
  accountEvents: [],
  passkeys: [],
};

it('renders without imploding', () => {
  const { getByTestId } = render(<Account {...accountResponse} />);

  expect(getByTestId('account-section')).toBeInTheDocument();
});

it('displays the account', async () => {
  const { getByTestId } = render(<Account {...accountResponse} />);

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
  const { getByTestId } = render(<Account {...disabledAccount} />);

  expect(getByTestId('account-disabled-at')).toHaveTextContent(
    (disabledAccount.disabledAt || '').toString()
  );
});

it('displays when account is locked', async () => {
  const lockedAccount = {
    ...accountResponse,
    lockedAt: accountResponse.createdAt + 1000 * 60 * 60,
  };
  const { getByTestId } = render(<Account {...lockedAccount} />);

  expect(getByTestId('account-locked-at')).toHaveTextContent(
    (lockedAccount.lockedAt || '').toString()
  );
});

it('displays when account password is not set', async () => {
  const lockedAccount = {
    ...accountResponse,
    verifierSetAt: 0,
  };
  const { getByTestId } = render(<Account {...lockedAccount} />);

  expect(getByTestId('account-password-set')).toHaveTextContent('No');
});

it('displays when account password is set', async () => {
  const lockedAccount = {
    ...accountResponse,
    verifierSetAt: 1589467100316,
  };
  const { getByTestId } = render(<Account {...lockedAccount} />);

  expect(getByTestId('account-password-set')).toHaveTextContent('Yes');
});

it('displays the unconfirmed account', async () => {
  accountResponse.emails![0].isVerified = false;
  const { getByTestId } = render(<Account {...accountResponse} />);
  expect(getByTestId('primary-verified')).toHaveTextContent('No');
});

it('displays the bounce type description', async () => {
  const { getByTestId } = render(<Account {...accountResponse} />);
  expect(getByTestId('bounce-description')).toBeInTheDocument();
});

it('displays the totp status', async () => {
  const { getByTestId } = render(<Account {...accountResponse} />);
  expect(getByTestId('totp-created-at')).toBeInTheDocument();
  expect(getByTestId('totp-verified')).toBeInTheDocument();
  expect(getByTestId('totp-enabled')).toBeInTheDocument();
});

it('displays the backup codes status', async () => {
  const { getByRole, getByTestId, getByText } = render(
    <Account {...accountResponse} />
  );
  expect(
    getByRole('heading', { name: /2fa recovery methods/i })
  ).toBeInTheDocument();
  expect(getByText('Backup codes')).toBeInTheDocument();
  expect(getByTestId('backup-codes-exists')).toBeInTheDocument();
  expect(getByTestId('backup-codes-count')).toBeInTheDocument();
});

it('displays the recovery phone status', async () => {
  const { getByRole, getByTestId, getByText } = render(
    <Account {...accountResponse} />
  );
  expect(
    getByRole('heading', { name: /2fa recovery methods/i })
  ).toBeInTheDocument();
  expect(getByText('Recovery phone')).toBeInTheDocument();
  expect(getByTestId('recovery-phone-exists')).toBeInTheDocument();
  expect(getByTestId('recovery-phone-number')).toBeInTheDocument();
});

it('displays the account recovery key status', async () => {
  const { getByTestId } = render(<Account {...accountResponse} />);
  expect(getByTestId('recovery-keys-created-at')).toBeInTheDocument();
  expect(getByTestId('recovery-keys-verified')).toBeInTheDocument();
  expect(getByTestId('recovery-keys-enabled')).toBeInTheDocument();
});

it('shows "no passkeys" message when passkeys list is empty', () => {
  const { getByTestId } = render(<Account {...accountResponse} />);
  expect(getByTestId('passkeys-none')).toBeInTheDocument();
});

it('displays passkeys with authenticator name', () => {
  const withPasskeys = {
    ...accountResponse,
    passkeys: [
      {
        name: 'iPhone Face ID',
        createdAt: 1589467100316,
        lastUsedAt: null,
        aaguid: '00000000-0000-0000-0000-000000000000',
        authenticatorName: undefined,
        backupState: true,
        prfEnabled: false,
      },
      {
        name: 'YubiKey 5',
        createdAt: 1589467200000,
        lastUsedAt: 1700000000000,
        aaguid: 'fa2b99dc-9e39-4257-8f92-4a30d23c4118',
        authenticatorName: 'YubiKey 5 Series with NFC',
        backupState: false,
        prfEnabled: true,
      },
    ],
  };
  const { getAllByTestId } = render(<Account {...withPasskeys} />);

  const authenticators = getAllByTestId('passkey-authenticator-name');
  expect(authenticators[0]).toHaveTextContent('Unknown');
  expect(authenticators[1]).toHaveTextContent('YubiKey 5 Series with NFC');
});

it('displays passkeys with never-used date', () => {
  const withPasskey = {
    ...accountResponse,
    passkeys: [
      {
        name: 'iPhone Face ID',
        createdAt: 1589467100316,
        lastUsedAt: null,
        aaguid: '00000000-0000-0000-0000-000000000000',
        authenticatorName: undefined,
        backupState: true,
        prfEnabled: false,
      },
    ],
  };
  const { getByTestId } = render(<Account {...withPasskey} />);

  expect(getByTestId('passkey-last-used-at')).toHaveTextContent('Never');
});

it('displays passkeys with last-used date', () => {
  const withPasskey = {
    ...accountResponse,
    passkeys: [
      {
        name: 'YubiKey 5',
        createdAt: 1589467200000,
        lastUsedAt: 1700000000000,
        aaguid: 'fa2b99dc-9e39-4257-8f92-4a30d23c4118',
        authenticatorName: 'YubiKey 5 Series with NFC',
        backupState: false,
        prfEnabled: true,
      },
    ],
  };
  const { getByTestId } = render(<Account {...withPasskey} />);

  expect(getByTestId('passkey-last-used-at')).toHaveTextContent('2023-11');
});

it('displays secondary emails', async () => {
  accountResponse.emails!.push({
    email: 'ohdeceiver@gmail.com',
    isVerified: false,
    isPrimary: false,
    createdAt: 1589467100316,
  });

  const { getByTestId } = render(<Account {...accountResponse} />);

  expect(getByTestId('secondary-section')).toBeInTheDocument();
  expect(getByTestId('secondary-email')).toHaveTextContent(
    'ohdeceiver@gmail.com'
  );
  expect(getByTestId('secondary-verified')).toHaveTextContent('No');
});

it('displays the locale', async () => {
  const { getByTestId } = render(<Account {...accountResponse} />);
  expect(getByTestId('account-locale')).toHaveTextContent('en-US');
  expect(getByTestId('edit-account-locale')).toBeInTheDocument();
});

it('displays key-stretch-version', async () => {
  const lockedAccount = {
    ...accountResponse,
    verifierSetAt: 0,
  };
  const { getByTestId } = render(<Account {...lockedAccount} />);

  expect(getByTestId('key-stretch-version')).toBeInTheDocument();
});
