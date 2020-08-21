/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, wait, screen, fireEvent } from '@testing-library/react';
import { MockedCache, MOCK_ACCOUNT } from '../../models/_mocks';
import {
  ModalVerifySession,
  SEND_SESSION_VERIFICATION_CODE_MUTATION,
  VERIFY_SESSION_MUTATION,
} from '.';
import { GraphQLError } from 'graphql';

const happyMocks = [
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
  {
    request: {
      query: VERIFY_SESSION_MUTATION,
      variables: { input: { code: '55556666' } },
    },
    result: {
      data: {
        verifySession: {
          clientMutationId: null,
        },
      },
    },
  },
];

const networkError = new Error('network error');
const sadMocks = [
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
  {
    request: {
      query: VERIFY_SESSION_MUTATION,
      variables: { input: { code: '12345678' } },
    },
    result: {
      errors: [new GraphQLError('invalid code')],
    },
  },
  {
    request: {
      query: VERIFY_SESSION_MUTATION,
      variables: { input: { code: '87654321' } },
    },
    error: networkError,
  },
];

describe('ModalVerifySession', () => {
  it('renders', async () => {
    const onDismiss = jest.fn();
    const onError = jest.fn();
    render(
      <MockedCache mocks={happyMocks}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </MockedCache>
    );

    await wait();

    expect(screen.getByTestId('modal-verify-session')).toBeInTheDocument();
    expect(screen.getByTestId('input-container')).toBeInTheDocument();
    expect(
      screen.getByTestId('modal-verify-session-cancel')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('modal-verify-session-submit')
    ).toBeInTheDocument();
    expect(screen.getByTestId('modal-desc').textContent).toContain(
      MOCK_ACCOUNT.primaryEmail.email
    );
  });

  it('calls onCompleted on success', async () => {
    const onDismiss = jest.fn();
    const onError = jest.fn();
    const onCompleted = jest.fn();
    render(
      <MockedCache mocks={happyMocks}>
        <ModalVerifySession {...{ onDismiss, onError, onCompleted }} />
      </MockedCache>
    );

    await wait();

    fireEvent.change(screen.getByTestId('input-field'), {
      target: { value: '55556666' },
    });
    screen.getByTestId('modal-verify-session-submit').click();

    await wait();

    expect(onCompleted).toBeCalled();
  });

  it('renders error messages', async () => {
    const onDismiss = jest.fn();
    const onError = jest.fn();
    render(
      <MockedCache mocks={sadMocks}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </MockedCache>
    );

    await wait();

    fireEvent.change(screen.getByTestId('input-field'), {
      target: { value: '12345678' },
    });
    screen.getByTestId('modal-verify-session-submit').click();

    await wait();

    expect(screen.getByTestId('error-tooltip').textContent).toContain(
      'invalid code'
    );
  });

  it('bubbles other errors', async () => {
    const onDismiss = jest.fn();
    const onError = jest.fn();
    render(
      <MockedCache mocks={sadMocks}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </MockedCache>
    );

    await wait();

    fireEvent.change(screen.getByTestId('input-field'), {
      target: { value: '87654321' },
    });
    screen.getByTestId('modal-verify-session-submit').click();

    await wait();

    expect(onError).toBeCalledWith(networkError);
  });
});
