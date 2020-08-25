/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { FlowSecondaryEmailAdd, CREATE_SECONDARY_EMAIL_MUTATION } from '.';
import { MockedCache, mockEmail } from '../../models/_mocks';
import { GraphQLError } from 'graphql';

const mockGqlError = (email: string) => ({
  request: {
    query: CREATE_SECONDARY_EMAIL_MUTATION,
    variables: { input: { email } },
  },
  result: {
    errors: [new GraphQLError('Email Address already added')],
  },
});

storiesOf('Components|FlowSecondaryEmailAdd', module)
  .add('Default empty', () => (
    <MockedCache>
      <FlowSecondaryEmailAdd />
    </MockedCache>
  ))
  .add('No secondary email set, primary email verified', () => {
    const mocks = [mockGqlError('johndope2@example.com')];
    return (
      <MockedCache {...{ mocks }}>
        <FlowSecondaryEmailAdd />
      </MockedCache>
    );
  })
  .add(
    'secondary can not match primary error, primary email unverified',
    () => {
      const mocks = [mockGqlError('johndope@example.com')];
      return (
        <MockedCache {...{ mocks }}>
          <FlowSecondaryEmailAdd />
        </MockedCache>
      );
    }
  )
  .add(
    'secondary matching secondary already added, primary email verified',
    () => {
      const emails = [
        mockEmail('johndope@example.com'),
        mockEmail('johndope@example.com', false, true),
      ];
      const mocks = [mockGqlError('johndope2@example.com')];
      return (
        <MockedCache account={{ emails }} {...{ mocks }}>
          <FlowSecondaryEmailAdd />
        </MockedCache>
      );
    }
  );
