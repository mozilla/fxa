/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { Account, AccountProps } from './index';

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
  sessionTokens: [
    {
      tokenId: 'abcd1234',
      tokenData: 'abcd1234',
      uid: 'ca1c61239f2448b2af618f0b50226cde',
      createdAt: 1589467100316,
      uaBrowser: 'Chrome',
      uaBrowserVersion: '89.0.4389',
      uaOS: 'Mac OS X',
      uaOSVersion: '11.2.1',
      uaDeviceType: 'Mac',
      lastAccessTime: 1589467100316,
    },
    {
      tokenId: 'abcd1235',
      tokenData: 'abcd1235',
      uid: 'ca1c61239f2448b2af618f0b50226cdf',
      createdAt: 1589467100317,
      uaBrowser: 'Chrome',
      uaBrowserVersion: '89.0.4390',
      uaOS: 'Mac OS X',
      uaOSVersion: '11.2.2',
      uaDeviceType: null,
      lastAccessTime: 1589467100317,
    }
  ],
  attachedClients: [
    {
      clientId: 'abcd1234',
      deviceId: 'abcd1234',
      sessionTokenId: 'abcd1234',
      refreshTokenId: 'abcd1234',
      isCurrentSession: true,
      deviceType: 'desktop',
      name: 'device 1',
      scope: [],
      location: null,
      userAgent: 'Chrome',
      os: 'Linux',
      createdTime: Date.now() - 180e3,
      createdTimeFormatted: 'a few minutes ago',
      lastAccessTime: Date.now() - 5e3,
      lastAccessTimeFormatted: 'a few sedconds ago',
      approximateLastAccessTime: Date.now() - 5e3,
      approximateLastAccessTimeFormatted: 'a few sedconds ago',
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

it('displays the session token status', async () => {
  const { findAllByTestId } = render(
    <MockedProvider>
      <Account {...accountResponse} />
    </MockedProvider>
  );

  expect(await findAllByTestId('session-token-accessed-at')).toHaveLength(2);
  expect(await findAllByTestId('session-token-browser')).toHaveLength(2);
  expect(await findAllByTestId('session-token-operating-system')).toHaveLength(2);
  expect(await findAllByTestId('session-token-device')).toHaveLength(2);
  await findAllByTestId('session-token-device').then((session) => {
    // checks that the uaDeviceType value is returned if not null
    expect(session[0]).toHaveTextContent('Mac');

    // checks that 'Desktop' is returned if uaDeviceType value is null
    expect(session[1]).toHaveTextContent('Desktop');
  });
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
