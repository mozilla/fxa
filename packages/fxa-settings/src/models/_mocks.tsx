/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { InMemoryCache, ApolloClient, ApolloProvider } from '@apollo/client';
import { Account } from '.';
import { GET_INITIAL_STATE } from '../components/App';
import { deepMerge } from '../lib/utilities';
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
import { render } from '@testing-library/react';

const MOCK_ACCOUNT: Account = {
  uid: 'abc123',
  displayName: 'John Dope',
  avatarUrl: 'http://avatars.com/y2k',
  accountCreated: 123456789,
  passwordCreated: 123456789,
  recoveryKey: true,
  attachedClients: [],
  subscriptions: [],
  primaryEmail: {
    email: 'johndope@example.com',
    isPrimary: true,
    verified: true,
  },
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

export interface MockedProps {
  account?: Hash<any>;
  verified?: boolean;
  childProps?: object;
  children?: React.ReactElement;
}
export interface MockedState {
  client: ApolloClient<any>;
}

/**
 * Create an InMemoryCache using MOCK_ACCOUNT and optional overrides
 */
export function createCache({
  account = {},
  verified = true,
}: MockedProps = {}) {
  const cache = new InMemoryCache();
  cache.writeQuery({
    query: GET_INITIAL_STATE,
    data: {
      account: deepMerge({}, MOCK_ACCOUNT, account),
      session: {
        verified,
      },
    },
  });
  return cache;
}

/**
 * MockedCache is a sugary sweet version of MockedProvider.
 *
 * By default it uses values from MOCK_ACCOUNT but can be overwritten via props
 * `account` and `verified`.
 *
 * Example:
 * ```
 * <MockedCache account={{displayName: 'Marceline'}}>
 *   <CoolComponent/>
 * </MockedCache>
 * ```
 *
 * If you need more knobs use MockedProvider instead.
 *
 * Using:
 * ```
 * <MockedCache>
 *  <CoolComponent/>
 * </MockedCache>
 * ```
 *
 * is equivalent to:
 * ```
 * const cache = new InMemoryCache()
 * cache.writeQuery({
 *   query: GET_INITIAL_STATE,
 *   data: {
 *     account: MOCK_ACCOUNT,
 *     session: { verified: true }
 *   }
 * })
 * <MockedProvider cache={cache}>
 *   <CoolComponent/>
 * </MockedProvider>
 * ```
 */
export class MockedCache extends React.Component<MockedProps, MockedState> {
  constructor(props: MockedProps) {
    super(props);
    this.state = {
      client: new ApolloClient({ cache: createCache(props) }),
    };
  }

  render() {
    const { children, childProps } = this.props;
    return children ? (
      <ApolloProvider client={this.state.client}>
        {React.cloneElement(React.Children.only(children), { ...childProps })}
      </ApolloProvider>
    ) : null;
  }

  componentWillUnmount() {
    this.state.client.stop();
  }
}

export function renderWithRouter(
  ui: any,
  { route = '/', history = createHistory(createMemorySource(route)) } = {}
) {
  return {
    ...render(<LocationProvider {...{ history }}>{ui}</LocationProvider>),
    history,
  };
}
