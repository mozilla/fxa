/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, wait, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MockedCache, renderWithRouter } from '../../models/_mocks';
import { PageSecondaryEmailVerify, VERIFY_SECONDARY_EMAIL_MUTATION } from '.';
import { GraphQLError } from 'graphql';
import { WindowLocation } from '@reach/router';

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

window.console.error = jest.fn();

afterAll(() => {
  (window.console.error as jest.Mock).mockReset();
});

describe('PageSecondaryEmailVerify', () => {
  it('renders as expected', () => {
    renderWithRouter(
      <MockedCache>
        <PageSecondaryEmailVerify location={mockLocation} />
      </MockedCache>
    );

    expect(
      screen.getByTestId('secondary-email-verify-form')
    ).toBeInTheDocument();
  });

  it('renders error messages', async () => {
    renderWithRouter(
      <MockedCache mocks={mocks}>
        <PageSecondaryEmailVerify location={mockLocation} />
      </MockedCache>
    );

    await wait();

    fireEvent.change(screen.getByTestId('input-field'), {
      target: { value: '4444' },
    });

    act(() => screen.getByTestId('secondary-email-verify-submit').click());

    await wait();

    expect(screen.getByTestId('tooltip').textContent).toContain('invalid code');
  });

  it('navigates to settings on success', async () => {
    const { history } = renderWithRouter(
      <MockedCache mocks={mocks}>
        <PageSecondaryEmailVerify location={mockLocation} />
      </MockedCache>
    );

    await wait();

    fireEvent.change(screen.getByTestId('input-field'), {
      target: { value: '1234' },
    });

    act(() => screen.getByTestId('secondary-email-verify-submit').click());

    await wait();

    expect(history.location.pathname).toEqual('/beta/settings');
  });
});
