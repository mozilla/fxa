/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthUiErrors } from 'fxa-settings/src/lib/auth-errors/auth-errors';
import 'mutationobserver-shim';
import { ModalVerifySession } from '.';
import { Account, AppContext, Session } from '../../../models';
import { mockSession, renderWithRouter } from '../../../models/mocks';

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

  it('sends verification code on mount', async () => {
    const onDismiss = jest.fn();
    const onError = jest.fn();
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(session.sendVerificationCode).toHaveBeenCalled();
    });
  });

  it('does not send verification code if already verified', async () => {
    const session = mockSession(true);
    const onDismiss = jest.fn();
    const onError = jest.fn();
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <ModalVerifySession {...{ onDismiss, onError }} />
      </AppContext.Provider>
    );
    await waitFor(() => {
      expect(session.sendVerificationCode).not.toHaveBeenCalled();
    });
  });

  it('renders error messages', async () => {
    const user = userEvent.setup();
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

    await user.type(
      screen.getByTestId('verification-code-input-field'),
      '123456'
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-verify-session-submit')).toBeEnabled();
    });

    await user.click(screen.getByTestId('modal-verify-session-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('tooltip').textContent).toContain(
        AuthUiErrors.INVALID_EXPIRED_OTP_CODE.message
      );
    });
  });

  it('bubbles other errors', async () => {
    const user = userEvent.setup();
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

    await user.type(
      screen.getByTestId('verification-code-input-field'),
      '654321'
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-verify-session-submit')).toBeEnabled();
    });

    await user.click(screen.getByTestId('modal-verify-session-submit'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });
});
