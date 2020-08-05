/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { InMemoryCache } from '@apollo/client';
import '@testing-library/jest-dom/extend-expect';
import { render, act, wait, screen } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { VerifiedSessionGuard, GET_SESSION } from '.';

const verifiedCache = new InMemoryCache();
verifiedCache.writeQuery({
  query: GET_SESSION,
  data: {
    session: {
      verified: true,
    },
  },
});

const unverifiedCache = new InMemoryCache();
unverifiedCache.writeQuery({
  query: GET_SESSION,
  data: {
    session: {
      verified: false,
    },
  },
});

it('renders the content when verified', async () => {
  render(
    <MockedProvider addTypename={false} cache={verifiedCache}>
      <VerifiedSessionGuard guard={<div data-testid="guard">oops</div>}>
        <div data-testid="children">Content</div>
      </VerifiedSessionGuard>
    </MockedProvider>
  );

  await wait();

  expect(screen.getByTestId('children')).toBeInTheDocument();
});

it('renders the guard when unverified', async () => {
  async () => {
    render(
      <MockedProvider addTypename={false} cache={unverifiedCache}>
        <VerifiedSessionGuard guard={<div data-testid="guard">oops</div>}>
          <div>Content</div>
        </VerifiedSessionGuard>
      </MockedProvider>
    );

    await wait();

    expect(screen.getByTestId('guard')).toBeInTheDocument();
  };
});

it('renders the guard when loading fails', async () => {
  // don't pollute the test output with console logs
  const consoleError = console.error;
  console.error = () => {};
  render(
    <MockedProvider>
      <VerifiedSessionGuard guard={<div data-testid="guard">oops</div>}>
        <div>Content</div>
      </VerifiedSessionGuard>
    </MockedProvider>
  );

  await wait();

  expect(screen.getByTestId('guard')).toBeInTheDocument();
  console.error = consoleError;
});
