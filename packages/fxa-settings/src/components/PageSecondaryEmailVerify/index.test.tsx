/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MockedCache, renderWithRouter } from '../../models/_mocks';
import { alertTextExternal } from '../../lib/cache';
import { PageSecondaryEmailVerify, VERIFY_SECONDARY_EMAIL_MUTATION } from '.';
import { GraphQLError } from 'graphql';
import { WindowLocation } from '@reach/router';

jest.mock('../../lib/cache', () => ({
  alertTextExternal: jest.fn(),
}));

const mocks = [
  {
    request: {
      query: VERIFY_SECONDARY_EMAIL_MUTATION,
      variables: { input: { email: 'johndope@example.com', code: '123456' } },
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
      variables: { input: { email: 'johndope@example.com', code: '666666' } },
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

    await act(async () => {
      fireEvent.input(screen.getByTestId('verification-code-input-field'), {
        target: { value: '666666' },
      });
    });

    await act(async () =>
      screen.getByTestId('secondary-email-verify-submit').click()
    );

    expect(screen.getByTestId('tooltip').textContent).toContain('invalid code');
  });

  it('navigates to settings and shows a message on success', async () => {
    const { history } = renderWithRouter(
      <MockedCache mocks={mocks}>
        <PageSecondaryEmailVerify location={mockLocation} />
      </MockedCache>
    );

    await act(async () => {
      fireEvent.input(screen.getByTestId('verification-code-input-field'), {
        target: { value: '123456' },
      });
    });

    await act(async () =>
      screen.getByTestId('secondary-email-verify-submit').click()
    );

    expect(history.location.pathname).toEqual('/beta/settings#secondary-email');
    expect(alertTextExternal).toHaveBeenCalledTimes(1);
    expect(alertTextExternal).toHaveBeenCalledWith(
      'johndope@example.com successfully added.'
    );
  });
});
