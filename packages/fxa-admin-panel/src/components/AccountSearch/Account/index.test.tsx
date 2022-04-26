/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { Account, AccountProps } from './index';
import { AdminPanelGroup, guard } from 'fxa-shared/guards';
import { IClientConfig } from '../../../../interfaces';
import { mockConfigBuilder } from '../../../lib/config';

export const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: guard.getGroup(AdminPanelGroup.SupportAgentProd),
  },
});

jest.mock('../../../hooks/UserContext.ts', () => ({
  useUserContext: () => {
    const ctx = {
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
  emailBounces: [],
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
  attachedClients: [
    // The following values are based on a real response with modified ID values.
    {
      clientId: null,
      createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
      createdTimeFormatted: '1 hour ago',
      deviceId: 'xxxxxxxx-did-1',
      deviceType: 'desktop',
      lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
      lastAccessTimeFormatted: '5 seconds ago',
      location: {
        city: null,
        country: null,
        state: null,
        stateCode: null,
      },
      name: "UserX's Nightly on machine-xyz",
      os: 'Mac OS X',
      userAgent: 'Chrome 89',
      sessionTokenId: 'xxxxxxxx-stid-1',
      refreshTokenId: null,
    },
    {
      clientId: 'xxxxxxxx-clid-1',
      createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
      createdTimeFormatted: '1 hour ago',
      deviceId: null,
      deviceType: null,
      lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
      lastAccessTimeFormatted: '5 seconds ago',
      location: {
        city: null,
        country: null,
        state: null,
        stateCode: null,
      },
      name: 'Pocket',
      os: null,
      userAgent: '',
      sessionTokenId: null,
      refreshTokenId: null,
    },
    {
      clientId: 'xxxxxxxx-mzvpn-1',
      createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
      createdTimeFormatted: '1 hour ago',
      deviceId: null,
      deviceType: null,
      lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
      lastAccessTimeFormatted: '5 seconds ago',
      location: {
        city: null,
        country: null,
        state: null,
        stateCode: null,
      },
      name: 'Mozilla VPN',
      os: null,
      userAgent: '',
      sessionTokenId: null,
      refreshTokenId: 'xxxxxxxx-rtid-1',
    },
    {
      clientId: null,
      createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
      createdTimeFormatted: '1 hour ago',
      deviceId: null,
      deviceType: null,
      lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
      lastAccessTimeFormatted: '5 seconds ago',
      location: {
        city: null,
        country: null,
        state: null,
        stateCode: null,
      },
      name: 'Firefox 97, Ubuntu',
      os: 'Ubuntu',
      userAgent: 'Firefox 97',
      sessionTokenId: 'xxxxxxxx-stid-2',
      refreshTokenId: null,
    },
    {
      clientId: null,
      createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
      createdTimeFormatted: '1 hour ago',
      deviceId: null,
      deviceType: null,
      lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
      lastAccessTimeFormatted: '5 seconds ago',
      location: {
        city: null,
        country: null,
        state: null,
        stateCode: null,
      },
      name: 'Mobile Safari 15, iPhone',
      os: 'iOS',
      userAgent: 'Mobile Safari 15',
      sessionTokenId: 'xxxxxxxx-stid-3',
      refreshTokenId: null,
    },
  ],
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
  expect(getByTestId('verified-status')).toHaveTextContent('verified');
  expect(getByTestId('email-label')).toHaveTextContent(
    accountResponse.emails![0].email
  );
  expect(getByTestId('uid-label')).toHaveTextContent(accountResponse.uid);
  expect(getByTestId('createdat-label')).toHaveTextContent(
    accountResponse.createdAt.toString()
  );
});

it('displays the unverified account', async () => {
  accountResponse.emails![0].isVerified = false;
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );
  expect(getByTestId('verified-status')).toHaveTextContent('not verified');
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

it('displays the recovery key status', async () => {
  const { getByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );
  expect(getByTestId('recovery-keys-created-at')).toBeInTheDocument();
  expect(getByTestId('recovery-keys-verified')).toBeInTheDocument();
  expect(getByTestId('recovery-keys-enabled')).toBeInTheDocument();
});

it('displays the attached clients', async () => {
  const { findAllByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );

  const fields: Record<string, HTMLElement[]> = {
    clientFields: await findAllByTestId('attached-clients-client'),
    deviceTypeFields: await findAllByTestId('attached-clients-device-type'),
    userAgentFields: await findAllByTestId('attached-clients-user-agent'),
    osFields: await findAllByTestId('attached-clients-os'),
    createdAtFields: await findAllByTestId('attached-clients-created-at'),
    lastAccessFields: await findAllByTestId(
      'attached-clients-last-accessed-at'
    ),
    locationFields: await findAllByTestId('attached-clients-location'),
    clientIdFields: await findAllByTestId('attached-clients-client-id'),
    deviceIdFields: await findAllByTestId('attached-clients-device-id'),
    sessionTokenIdFields: await findAllByTestId(
      'attached-clients-session-token-id'
    ),
    freshreshTokenIdFields: await findAllByTestId(
      'attached-clients-refresh-token-id'
    ),
  };

  // Make sure all data is rendered
  Object.values(fields).forEach((x) => expect(x).toHaveLength(5));

  // Make sure fields have some sort of content
  Object.values(fields)
    .flatMap((x) => x)
    .forEach((x) => expect(x).toHaveTextContent(/N\/A|\w{3,}/));

  // Make sure device types are mobile, desktop.
  fields.deviceTypeFields.forEach((type) =>
    expect(type).toHaveTextContent(/mobile|desktop|unknown/gi)
  );
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
  expect(getByTestId('secondary-verified')).toHaveTextContent('not verified');
});
