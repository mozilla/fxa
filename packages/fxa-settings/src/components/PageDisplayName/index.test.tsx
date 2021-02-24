/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, screen } from '@testing-library/react';
import PageDisplayName, { UPDATE_DISPLAY_NAME_MUTATION } from '.';
import {
  createCache,
  MockedCache,
  MOCK_ACCOUNT,
  renderWithRouter,
} from '../../models/_mocks';
import { AuthContext, createAuthClient } from '../../lib/auth';
import { alertTextExternal } from '../../lib/cache';
import { HomePath } from '../../constants';
import { GraphQLError } from 'graphql';
import { MockedProvider } from '@apollo/client/testing';
import { Account, GET_ACCOUNT } from '../../models';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';

const client = createAuthClient('none');
const mocks = [
  {
    request: {
      query: UPDATE_DISPLAY_NAME_MUTATION,
      variables: { input: { displayName: 'John Hope' } },
    },
    result: {
      data: {},
    },
  },
  {
    request: {
      query: UPDATE_DISPLAY_NAME_MUTATION,
      variables: { input: { displayName: 'John Nope' } },
    },
    error: new Error('NO CAN DO'),
  },
  {
    request: {
      query: UPDATE_DISPLAY_NAME_MUTATION,
      variables: { input: { displayName: 'Jane Nope' } },
    },
    result: {
      errors: [new GraphQLError('STILL NO')],
    },
  },
];

jest.mock('../../lib/cache', () => ({
  alertTextExternal: jest.fn(),
}));

const inputDisplayName = async (newName: string) => {
  await act(async () => {
    fireEvent.input(screen.getByTestId('input-field'), {
      target: { value: newName },
    });
  });
};
const submitDisplayName = async (newName: string) => {
  await inputDisplayName(newName);
  await act(async () => {
    fireEvent.click(screen.getByTestId('submit-display-name'));
  });
};

it('renders', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageDisplayName />
      </MockedCache>
    </AuthContext.Provider>
  );
  expect(screen.getByTestId('flow-container')).toBeInTheDocument();
  expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
  expect(screen.getByTestId('input-field')).toBeInTheDocument();
  expect(screen.getByTestId('submit-display-name')).toBeInTheDocument();
});

it('updates the disabled state of the save button', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageDisplayName />
      </MockedCache>
    </AuthContext.Provider>
  );

  // initial value
  expect(screen.getByTestId('submit-display-name')).toBeDisabled();

  // empty value allowed
  await inputDisplayName('');
  expect(screen.getByTestId('submit-display-name')).not.toBeDisabled();

  // new value
  await inputDisplayName('testo');
  expect(screen.getByTestId('submit-display-name')).not.toBeDisabled();

  // original value
  await inputDisplayName(MOCK_ACCOUNT.displayName!);
  expect(screen.getByTestId('submit-display-name')).toBeDisabled();
});

it('navigates back to settings home and shows a success message on a successful update', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache mocks={mocks}>
        <PageDisplayName />
      </MockedCache>
    </AuthContext.Provider>
  );
  await submitDisplayName('John Hope');
  expect(window.location.pathname).toBe(HomePath);
  expect(alertTextExternal).toHaveBeenCalledTimes(1);
  expect(alertTextExternal).toHaveBeenCalledWith('Display name updated.');
});

it('updates the cache', async () => {
  const cache = createCache();
  const spy = jest.spyOn(cache, 'modify');
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedProvider cache={cache} mocks={mocks}>
        <PageDisplayName />
      </MockedProvider>
    </AuthContext.Provider>
  );
  await submitDisplayName('John Hope');
  expect(spy).toBeCalledTimes(1);
  const { account } = cache.readQuery<{ account: Account }>({
    query: GET_ACCOUNT,
  })!;
  expect(account.displayName).toBe('John Hope');
});

it('displays a general error in the alert bar', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache mocks={mocks}>
        <AlertBarRootAndContextProvider>
          <PageDisplayName />
        </AlertBarRootAndContextProvider>
      </MockedCache>
    </AuthContext.Provider>
  );
  // suppress the console output
  let consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementationOnce(() => {});
  await submitDisplayName('John Nope');
  expect(screen.getByTestId('alert-bar')).toBeInTheDocument();
  consoleErrorSpy.mockRestore();
});

it('displays the GraphQL error', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache mocks={mocks}>
        <PageDisplayName />
      </MockedCache>
    </AuthContext.Provider>
  );
  // suppress the console output
  let consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementationOnce(() => {});
  await submitDisplayName('Jane Nope');
  expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  consoleErrorSpy.mockRestore();
});
