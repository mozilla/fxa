/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MockedResponse } from '@apollo/client/testing';
import { GET_ACCOUNT, AccountData } from './gql';

export const MOCK_ACCOUNT: AccountData = {
  uid: 'abc123',
  displayName: 'John Dope',
  avatarUrl: 'http://avatars.com/y2k',
  accountCreated: 123456789,
  passwordCreated: 123456789,
  recoveryKey: true,
  attachedClients: [],
  subscriptions: [],
  emails: [
    {
      email: 'johndope@example.com',
      isPrimary: true,
      verified: true,
    },
  ],
  totp: {
    exists: true,
    verified: true,
  },
};

export const MOCK_GET_ACCOUNT: MockedResponse = {
  request: {
    query: GET_ACCOUNT,
  },
  result: {
    data: {
      account: {
        ...MOCK_ACCOUNT,
      },
    },
  },
};
