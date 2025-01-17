/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { mockSession, renderWithRouter } from '../../../models/mocks';
import { Account, AppContext, Session } from '../../../models';
import { ModalVerifySession } from '.';
import { AuthUiErrors } from 'fxa-settings/src/lib/auth-errors/auth-errors';

const account = {
  primaryEmail: {
    email: 'jgruen@mozilla.com',
  },
} as unknown as Account;

const session = mockSession(false);

window.console.error = jest.fn();

afterAll(() => {
  (window.console.error as jest.Mock).mockReset();
});

describe('ModalVerifySession', () => {
  it('renders', async () => {
    const onDismiss = jest.fn();
    const onError = jest.fn();
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('modal-verify-session')).toBeInTheDocument();
    expect(
      screen.getByTestId('modal-verify-session-cancel')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('modal-verify-session-submit')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('modal-verify-session-desc').textContent
    ).toContain(account.primaryEmail.email);
    expect(screen.getByTestId('modal-verify-session-submit')).toBeDisabled();
  });

  it('renders error messages', async () => {
    const error: any = new Error('invalid code');
    error.errno = AuthUiErrors.INVALID_EXPIRED_OTP_CODE.errno;
    const session = {
      sendVerificationCode: jest.fn().mockResolvedValue(true),
      verifySession: jest.fn().mockRejectedValue(error),
      isSessionVerified: jest.fn().mockResolvedValue(false),
    } as unknown as Session;
    const onDismiss = jest.fn();
    const onError = jest.fn();
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </AppContext.Provider>
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

    expect(screen.getByTestId('tooltip').textContent).toContain(
      AuthUiErrors.INVALID_EXPIRED_OTP_CODE.message
    );
  });

  it('bubbles other errors', async () => {
    const error = new Error('network error');
    const session = {
      sendVerificationCode: jest.fn().mockResolvedValue(true),
      verifySession: jest.fn().mockRejectedValue(error),
      isSessionVerified: jest.fn().mockResolvedValue(false),
    } as unknown as Session;
    const onDismiss = jest.fn();
    const onError = jest.fn();
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </AppContext.Provider>
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

    expect(onError).toBeCalledWith(error);
  });
});
