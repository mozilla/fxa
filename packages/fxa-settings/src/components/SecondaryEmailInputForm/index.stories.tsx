/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { SecondaryEmailInputForm, CREATE_SECONDARY_EMAIL_MUTATION } from '.';
import { MockedCache, MOCK_ACCOUNT, mockEmail } from '../../models/_mocks';
import { GET_INITIAL_STATE } from '../App';

const mockGqlError = (email: string) => ({
  request: {
    query: CREATE_SECONDARY_EMAIL_MUTATION,
    variables: { input: { email } },
  },
  error: new Error('Email Address already added'),
});

storiesOf('Components|SecondaryEmailInputForm', module)
  .add('Default empty', () => (
    <MockedCache>
      <SecondaryEmailInputForm />
    </MockedCache>
  ))
  .add('No secondary email set, primary email verified', () => {
    const primaryEmail = mockEmail('johndope@example.com');
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: GET_INITIAL_STATE,
      data: {
        account: { ...MOCK_ACCOUNT, emails: [primaryEmail] },
        session: { verified: true },
      },
    });
    const mocks = [mockGqlError('johndope2@example.com')];
    return (
      <MockedProvider {...{ mocks, cache }}>
        <SecondaryEmailInputForm />
      </MockedProvider>
    );
  })
  .add(
    'secondary can not match primary error, primary email unverified',
    () => {
      const primaryEmail = mockEmail('johndope@example.com');
      const cache = new InMemoryCache();
      cache.writeQuery({
        query: GET_INITIAL_STATE,
        data: {
          account: { ...MOCK_ACCOUNT, emails: [primaryEmail] },
          session: { verified: true },
        },
      });
      const mocks = [mockGqlError('johndope@example.com')];
      return (
        <MockedProvider {...{ mocks, cache }}>
          <SecondaryEmailInputForm />
        </MockedProvider>
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
      const cache = new InMemoryCache();
      cache.writeQuery({
        query: GET_INITIAL_STATE,
        data: {
          account: { ...MOCK_ACCOUNT, emails },
          session: { verified: true },
        },
      });
      const mocks = [mockGqlError('johndope2@example.com')];
      return (
        <MockedProvider {...{ mocks, cache }}>
          <SecondaryEmailInputForm />
        </MockedProvider>
      );
    }
  );
