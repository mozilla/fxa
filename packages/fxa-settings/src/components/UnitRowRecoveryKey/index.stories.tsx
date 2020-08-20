/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { MockedCache } from '../../models/_mocks';
import UnitRowRecoveryKey from '.';
import { SEND_SESSION_VERIFICATION_CODE_MUTATION } from '../ModalVerifySession';

const mocks = [
  {
    request: {
      query: SEND_SESSION_VERIFICATION_CODE_MUTATION,
      variables: { input: {} },
    },
    result: {
      data: {
        sendSessionVerificationCode: {
          clientMutationId: null,
        },
      },
    },
  },
];

storiesOf('Components|UnitRowRecoveryKey', module)
  .add('with recovery key', () => (
    <MockedCache>
      <UnitRowRecoveryKey />
    </MockedCache>
  ))
  .add('no recovery key', () => (
    <MockedCache account={{ recoveryKey: false }}>
      <UnitRowRecoveryKey />
    </MockedCache>
  ))
  .add('with recovery key and unverified session', () => (
    <MockedCache verified={false}>
      <UnitRowRecoveryKey />
    </MockedCache>
  ));
