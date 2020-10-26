/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GraphQLError } from 'graphql';
import { CREATE_TOTP_MUTATION, VERIFY_TOTP_MUTATION } from '.';

export const CREATE_TOTP_MOCK = [
  {
    request: {
      query: CREATE_TOTP_MUTATION,
      variables: { input: {} },
    },
    result: {
      data: {
        createTotp: {
          clientMutationId: null,
          qrCodeUrl:
            'data:image/png;base64,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',
          secret: 'JFXE6ULUGM4U4WDHOFVFIRDPKZITATSK',
          recoveryCodes: ['3594s0tbsq', '0zrg82sdzm', 'wx88yxenfc'],
          __typename: 'CreateTotpPayload',
        },
      },
    },
  },
];

export const VERIFY_TOTP_MOCK = [
  {
    request: {
      query: VERIFY_TOTP_MUTATION,
      variables: { input: { code: '001980' } },
    },
    result: {
      data: { verifyTotp: { success: true } },
    },
  },
  {
    request: {
      query: VERIFY_TOTP_MUTATION,
      variables: { input: { code: '999911' } },
    },
    error: new Error('Oops'),
  },
  {
    request: {
      query: VERIFY_TOTP_MUTATION,
      variables: { input: { code: '009001' } },
    },
    result: {
      errors: [new GraphQLError('Some sort of server error!')],
    },
  },
];
