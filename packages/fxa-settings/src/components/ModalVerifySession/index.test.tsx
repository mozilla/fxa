/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import {
  MockedCache,
  MOCK_ACCOUNT,
  renderWithRouter,
} from '../../models/_mocks';
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
      variables: { input: { code: '445566' } },
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
      variables: { input: { code: '123456' } },
    },
    result: {
      errors: [new GraphQLError('invalid code')],
    },
  },
  {
    request: {
      query: VERIFY_SESSION_MUTATION,
      variables: { input: { code: '654321' } },
    },
    error: networkError,
  },
];

window.console.error = jest.fn();

afterAll(() => {
  (window.console.error as jest.Mock).mockReset();
});

describe('ModalVerifySession', () => {
  it('renders', async () => {
    const onDismiss = jest.fn();
    const onError = jest.fn();
    renderWithRouter(
      <MockedCache verified={false} mocks={happyMocks}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </MockedCache>
    );

    expect(screen.getByTestId('modal-verify-session')).toBeInTheDocument();
    expect(
      screen.getByTestId('modal-verify-session-cancel')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('modal-verify-session-submit')
    ).toBeInTheDocument();
    expect(screen.getByTestId('modal-desc').textContent).toContain(
      MOCK_ACCOUNT.primaryEmail.email
    );
    expect(screen.getByTestId('modal-verify-session-submit')).toBeDisabled();
  });

  it('calls onCompleted on success', async () => {
    const onDismiss = jest.fn();
    const onError = jest.fn();
    const onCompleted = jest.fn();
    renderWithRouter(
      <MockedCache verified={false} mocks={happyMocks}>
        <ModalVerifySession {...{ onDismiss, onError, onCompleted }} />
      </MockedCache>
    );

    await act(async () => {
      fireEvent.input(screen.getByTestId('verification-code-input-field'), {
        target: { value: '445566' },
      });
    });
    expect(screen.getByTestId('modal-verify-session-submit')).toBeEnabled();
    await act(async () => {
      fireEvent.click(screen.getByTestId('modal-verify-session-submit'));
    });

    expect(onCompleted).toBeCalled();
  });

  it('renders error messages', async () => {
    const onDismiss = jest.fn();
    const onError = jest.fn();
    renderWithRouter(
      <MockedCache verified={false} mocks={sadMocks}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </MockedCache>
    );

    await act(async () => {
      fireEvent.input(screen.getByTestId('verification-code-input-field'), {
        target: { value: '123456' },
      });
    });
    expect(screen.getByTestId('modal-verify-session-submit')).toBeEnabled();
    await act(async () => {
      fireEvent.click(screen.getByTestId('modal-verify-session-submit'));
    });

    expect(screen.getByTestId('tooltip').textContent).toContain('invalid code');
  });

  it('bubbles other errors', async () => {
    const onDismiss = jest.fn();
    const onError = jest.fn();
    renderWithRouter(
      <MockedCache verified={false} mocks={sadMocks}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </MockedCache>
    );

    await act(async () => {
      fireEvent.input(screen.getByTestId('verification-code-input-field'), {
        target: { value: '654321' },
      });
    });
    expect(screen.getByTestId('modal-verify-session-submit')).toBeEnabled();
    await act(async () => {
      fireEvent.click(screen.getByTestId('modal-verify-session-submit'));
    });

    expect(onError).toBeCalledWith(networkError);
  });
});
