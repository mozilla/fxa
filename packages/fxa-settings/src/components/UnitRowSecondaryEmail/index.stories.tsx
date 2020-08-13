/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { UnitRowSecondaryEmail, RESEND_SECONDARY_EMAIL_CODE_MUTATION } from '.';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';
import { MockedCache, MOCK_ACCOUNT } from '../../models/_mocks';
import { GET_INITIAL_STATE } from '../App';

// every unverified email with a functioning "Resend verification"
// button must have a mock object created per mutation attempt.
const createMock = (email: string) => ({
  request: {
    query: RESEND_SECONDARY_EMAIL_CODE_MUTATION,
    variables: { input: { email } },
  },
  result: {
    data: {
      resendSecondaryEmailCode: {
        clientMutationId: null,
      },
    },
  },
});

storiesOf('Components|UnitRowSecondaryEmail', module)
  .add('No secondary email set, primary email verified', () => (
    <MockedCache>
      <AlertBarRootAndContextProvider>
        <UnitRowSecondaryEmail />
      </AlertBarRootAndContextProvider>
    </MockedCache>
  ))
  .add('No secondary email set, primary email unverified', () => {
    const primaryEmail = {
      email: 'johndope@example.com',
      isPrimary: true,
      verified: false,
    };
    return (
      <MockedCache account={{ primaryEmail, emails: [primaryEmail] }}>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    );
  })
  .add('One secondary email set, unverified', () => {
    const emails = [
      {
        email: 'johndope@example.com',
        isPrimary: true,
        verified: true,
      },
      {
        email: 'johndope2@example.com',
        isPrimary: false,
        verified: false,
      },
    ];
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: GET_INITIAL_STATE,
      data: {
        account: { ...MOCK_ACCOUNT, emails },
        session: { verified: true },
      },
    });
    const mocks = [createMock('johndope2@example.com')];
    return (
      <MockedProvider {...{ mocks, cache }}>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedProvider>
    );
  })
  .add('One secondary email set, verified', () => {
    const emails = [
      {
        email: 'johndope@example.com',
        isPrimary: true,
        verified: true,
      },
      {
        email: 'johndope2@example.com',
        isPrimary: false,
        verified: true,
      },
    ];
    return (
      <MockedCache account={{ emails }}>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    );
  })
  .add('Multiple secondary emails set, all verified', () => {
    const emails = [
      {
        email: 'johndope@example.com',
        isPrimary: true,
        verified: true,
      },
      {
        email: 'johndope2@example.com',
        isPrimary: false,
        verified: true,
      },
      {
        email: 'johndope3@example.com',
        isPrimary: false,
        verified: true,
      },
      {
        email: 'johndope4@example.com',
        isPrimary: false,
        verified: true,
      },
    ];
    return (
      <MockedCache account={{ emails }}>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    );
  })
  .add('Multiple secondary emails set, one unverified', () => {
    const emails = [
      {
        email: 'johndope@example.com',
        isPrimary: true,
        verified: true,
      },
      {
        email: 'johndope2@example.com',
        isPrimary: false,
        verified: true,
      },
      {
        email: 'johndope3@example.com',
        isPrimary: false,
        verified: false,
      },
      {
        email: 'johndope4@example.com',
        isPrimary: false,
        verified: true,
      },
    ];
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: GET_INITIAL_STATE,
      data: {
        account: { ...MOCK_ACCOUNT, emails },
        session: { verified: true },
      },
    });
    const mocks = [createMock('johndope3@example.com')];
    return (
      <MockedProvider {...{ mocks, cache }}>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedProvider>
    );
  })
  .add('Multiple secondary emails set, multiple unverified', () => {
    const emails = [
      {
        email: 'johndope@example.com',
        isPrimary: true,
        verified: true,
      },
      {
        email: 'johndope2@example.com',
        isPrimary: false,
        verified: true,
      },
      {
        email: 'johndope3@example.com',
        isPrimary: false,
        verified: false,
      },
      {
        email: 'johndope4@example.com',
        isPrimary: false,
        verified: false,
      },
    ];
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: GET_INITIAL_STATE,
      data: {
        account: { ...MOCK_ACCOUNT, emails },
        session: { verified: true },
      },
    });
    const mocks = [
      createMock('johndope3@example.com'),
      createMock('johndope4@example.com'),
    ];
    return (
      <MockedProvider {...{ mocks, cache }}>
        <AlertBarRootAndContextProvider>
          <UnitRowSecondaryEmail />
        </AlertBarRootAndContextProvider>
      </MockedProvider>
    );
  });
