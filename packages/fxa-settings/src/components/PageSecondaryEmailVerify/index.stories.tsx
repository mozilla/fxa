/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { PageSecondaryEmailVerify, VERIFY_SECONDARY_EMAIL_MUTATION } from '.';
import { AppLayout } from '../AppLayout';
import { MockedCache } from '../../models/_mocks';
import { GraphQLError } from 'graphql';
import { WindowLocation, LocationProvider } from '@reach/router';

const mocks = [
  {
    request: {
      query: VERIFY_SECONDARY_EMAIL_MUTATION,
      variables: { input: { email: 'johndope@example.com', code: '1234' } },
    },
    result: {
      data: {
        sendSessionVerificationCode: {
          clientMutationId: null,
        },
      },
    },
  },
  {
    request: {
      query: VERIFY_SECONDARY_EMAIL_MUTATION,
      variables: { input: { email: 'johndope@example.com', code: '4444' } },
    },
    result: {
      errors: [new GraphQLError('invalid code')],
    },
  },
];

const mockLocation = ({
  state: { email: 'johndope@example.com' },
} as unknown) as WindowLocation;

storiesOf('Pages|SecondaryEmailVerify', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('valid: 1234, invalid: 4444', () => {
    return (
      <MockedCache {...{ mocks }}>
        <AppLayout>
          <PageSecondaryEmailVerify location={mockLocation} />
        </AppLayout>
      </MockedCache>
    );
  });
