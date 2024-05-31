/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { logPageViewEvent, logViewEvent } from '../../../lib/metrics';
import GleanMetrics from '../../../lib/glean';
import { viewName } from '.';
import {
  MOCK_RECOVERY_KEY,
  MOCK_RESET_TOKEN,
  MOCK_RECOVERY_KEY_ID,
  MOCK_KB,
  mockCompleteResetPasswordParams,
  paramsWithMissingToken,
  paramsWithMissingCode,
  paramsWithMissingEmail,
  getSubject,
  createMockWebIntegration,
  createMockOAuthIntegration,
} from './mocks';
import { REACT_ENTRYPOINT } from '../../../constants';
import { Account } from '../../../models';
import { typeByLabelText } from '../../../lib/test-utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { MOCK_ACCOUNT, renderWithRouter } from '../../../models/mocks';
import { MozServices } from '../../../lib/types';
import { MOCK_SERVICE } from '../../mocks';

jest.mock('../../../lib/metrics', () => ({
  logPageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));
jest.mock('../../../lib/glean', () => ({
  passwordReset: {
    recoveryKeyView: jest.fn(),
    recoveryKeySubmit: jest.fn(),
  },
}));
const mockNavigate = jest.fn();

const mockSearchParams = {
  email: mockCompleteResetPasswordParams.email,
  emailToHashWith: mockCompleteResetPasswordParams.emailToHashWith,
  token: mockCompleteResetPasswordParams.token,
  code: mockCompleteResetPasswordParams.code,
  uid: mockCompleteResetPasswordParams.uid,
};

const search = new URLSearchParams(mockSearchParams);

const mockLocation = () => {
  return {
    pathname: `/account_recovery_confirm_key`,
    search,
  };
};

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation(),
}));

jest.mock('fxa-auth-client/lib/recoveryKey', () => ({
  decryptRecoveryKeyData: jest.fn(() => ({
    kB: MOCK_KB,
  })),
}));

const accountWithValidResetToken = {
  resetPasswordStatus: jest.fn().mockResolvedValue(true),
  getRecoveryKeyBundle: jest.fn().mockResolvedValue({
    recoveryData: 'mockRecoveryData',
    recoveryKeyId: MOCK_RECOVERY_KEY_ID,
  }),
  passwordForgotVerifyCode: jest.fn().mockResolvedValue(MOCK_RESET_TOKEN),
} as unknown as Account;

const renderSubject = ({
  account = accountWithValidResetToken,
  params = mockCompleteResetPasswordParams,
  integration = createMockWebIntegration(),
} = {}) => {
  const { Subject, history, appCtx } = getSubject(account, params, integration);
  return renderWithRouter(<Subject />, { history }, appCtx);
};

describe('PageAccountRecoveryConfirmKey', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected when the link is valid', async () => {
    renderSubject();
    // testAllL10n(screen, bundle);

    await screen.findByRole('heading', {
      level: 1,
      name: 'Reset password with account recovery key to continue to account settings',
    });

    screen.getByText(
      'Please enter the one time use account recovery key you stored in a safe place to regain access to your Mozilla account.'
    );
    screen.getByTestId('warning-message-container');
    screen.getByLabelText('Enter account recovery key');
    screen.getByRole('button', { name: 'Confirm account recovery key' });
    screen.getByRole('link', {
      name: 'Don’t have an account recovery key?',
    });
  });

  describe('serviceName', () => {
    it('renders the default', async () => {
      renderSubject();
      await screen.findByText(`to continue to ${MozServices.Default}`);
    });

    it('renders non-default', async () => {
      renderSubject({ integration: createMockOAuthIntegration() });
      await screen.findByText(`to continue to ${MOCK_SERVICE}`);
    });
  });

  it('renders the component as expected when provided with an expired link', async () => {
    const accountWithTokenError = {
      resetPasswordStatus: jest.fn().mockResolvedValue(false),
      passwordForgotVerifyCode: jest.fn().mockImplementation(() => {
        throw AuthUiErrors.INVALID_TOKEN;
      }),
    } as unknown as Account;
    renderSubject({ account: accountWithTokenError });

    await screen.findByRole('heading', {
      name: 'Reset password link expired',
    });
  });

  describe('renders the component as expected when provided with a damaged link', () => {
    let mockConsoleWarn: jest.SpyInstance;

    beforeEach(() => {
      // We expect that model bindings will warn us about missing / incorrect values.
      // We don't want these warnings to effect test output since they are expected, so we
      // will mock the function, and make sure it's called.
      mockConsoleWarn = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      (GleanMetrics.passwordReset.recoveryKeyView as jest.Mock).mockReset();
    });

    afterEach(() => {
      mockConsoleWarn.mockRestore();
    });

    it('with missing token', async () => {
      renderSubject({ params: paramsWithMissingToken });

      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
      screen.getByText(
        'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
      );
      expect(mockConsoleWarn).toBeCalled();
      expect(GleanMetrics.passwordReset.recoveryKeyView).not.toHaveBeenCalled();
    });
    it('with missing code', async () => {
      renderSubject({ params: paramsWithMissingCode });

      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
      expect(mockConsoleWarn).toBeCalled();
      expect(GleanMetrics.passwordReset.recoveryKeyView).not.toHaveBeenCalled();
    });
    it('with missing email', async () => {
      renderSubject({ params: paramsWithMissingEmail });

      await screen.findByRole('heading', {
        name: 'Reset password link damaged',
      });
      expect(mockConsoleWarn).toBeCalled();
      expect(GleanMetrics.passwordReset.recoveryKeyView).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('does not allow submission with an empty input', async () => {
      renderSubject();
      const submitButton = await screen.findByRole('button', {
        name: 'Confirm account recovery key',
      });
      expect(submitButton).toBeDisabled();

      // adding text in the field enables the submit button
      await typeByLabelText('Enter account recovery key')('a');
      expect(
        screen.getByRole('button', {
          name: 'Confirm account recovery key',
        })
      ).not.toBeDisabled();
    });

    it('with less than 32 characters', async () => {
      renderSubject();
      const submitButton = await screen.findByRole('button', {
        name: 'Confirm account recovery key',
      });
      await typeByLabelText('Enter account recovery key')(
        MOCK_RECOVERY_KEY.slice(0, -1)
      );
      fireEvent.click(submitButton);
      await screen.findByText('Invalid account recovery key');
      expect(
        accountWithValidResetToken.getRecoveryKeyBundle
      ).not.toHaveBeenCalled();

      // clears the error onchange
      await typeByLabelText('Enter account recovery key')('');
      expect(
        screen.queryByText('Invalid account recovery key')
      ).not.toBeInTheDocument();
    });

    it('displays an error and does not submit with more than 32 characters', async () => {
      renderSubject({ account: accountWithValidResetToken });
      const submitButton = await screen.findByRole('button', {
        name: 'Confirm account recovery key',
      });
      await typeByLabelText('Enter account recovery key')(
        `${MOCK_RECOVERY_KEY}V`
      );
      fireEvent.click(submitButton);
      await screen.findByText('Invalid account recovery key');
      expect(
        accountWithValidResetToken.getRecoveryKeyBundle
      ).not.toHaveBeenCalled();
    });

    it('displays an error and does not submit with invalid Crockford base32', async () => {
      renderSubject();
      const submitButton = await screen.findByRole('button', {
        name: 'Confirm account recovery key',
      });
      await typeByLabelText('Enter account recovery key')(
        `${MOCK_RECOVERY_KEY}L`.slice(1)
      );
      fireEvent.click(submitButton);
      await screen.findByText('Invalid account recovery key');
      expect(
        accountWithValidResetToken.getRecoveryKeyBundle
      ).not.toHaveBeenCalled();
    });
  });

  it('submits successfully with spaces in recovery key', async () => {
    renderSubject();
    const submitButton = await screen.findByRole('button', {
      name: 'Confirm account recovery key',
    });
    await typeByLabelText('Enter account recovery key')(
      MOCK_RECOVERY_KEY.replace(/(.{4})/g, '$1 ')
    );

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        accountWithValidResetToken.getRecoveryKeyBundle
      ).toHaveBeenCalledWith(
        MOCK_RESET_TOKEN,
        MOCK_RECOVERY_KEY,
        MOCK_ACCOUNT.uid
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        `/account_recovery_reset_password?${search}`,
        {
          state: {
            accountResetToken: MOCK_RESET_TOKEN,
            recoveryKeyId: MOCK_RECOVERY_KEY_ID,
            kB: MOCK_KB,
          },
        }
      );
    });
  });

  it('submits successfully after invalid recovery key submission', async () => {
    const accountWithKeyInvalidOnce = {
      resetPasswordStatus: jest.fn().mockResolvedValue(true),
      passwordForgotVerifyCode: jest.fn().mockResolvedValue(MOCK_RESET_TOKEN),
      getRecoveryKeyBundle: jest
        .fn()
        .mockImplementationOnce(() => {
          return Promise.reject(AuthUiErrors.INVALID_RECOVERY_KEY);
        })
        .mockResolvedValue({
          recoveryData: 'mockRecoveryData',
          recoveryKeyId: MOCK_RECOVERY_KEY_ID,
        }),
    } as unknown as Account;

    renderSubject({ account: accountWithKeyInvalidOnce });
    await screen.findByRole('heading', {
      level: 1,
      name: 'Reset password with account recovery key to continue to account settings',
    });
    await typeByLabelText('Enter account recovery key')(MOCK_RECOVERY_KEY);
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm account recovery key' })
    );
    await screen.findByText('Invalid account recovery key');

    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm account recovery key' })
    );

    // only ever calls `passwordForgotVerifyCode` once despite number of submissions
    await waitFor(() =>
      expect(
        accountWithKeyInvalidOnce.passwordForgotVerifyCode
      ).toHaveBeenCalledTimes(1)
    );
    expect(
      accountWithKeyInvalidOnce.passwordForgotVerifyCode
    ).toHaveBeenCalledWith(
      mockCompleteResetPasswordParams.token,
      mockCompleteResetPasswordParams.code,
      true
    );
    expect(
      accountWithKeyInvalidOnce.getRecoveryKeyBundle
    ).toHaveBeenCalledTimes(2);
    expect(accountWithKeyInvalidOnce.getRecoveryKeyBundle).toHaveBeenCalledWith(
      MOCK_RESET_TOKEN,
      MOCK_RECOVERY_KEY,
      mockCompleteResetPasswordParams.uid
    );
  });

  describe('emits metrics events', () => {
    beforeEach(() => {
      (GleanMetrics.passwordReset.recoveryKeyView as jest.Mock).mockReset();
      (GleanMetrics.passwordReset.recoveryKeySubmit as jest.Mock).mockReset();
    });
    afterEach(() => jest.clearAllMocks());
    it('on engage, submit, success', async () => {
      renderSubject();
      const submitButton = await screen.findByRole('button', {
        name: 'Confirm account recovery key',
      });

      expect(logPageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
      expect(
        GleanMetrics.passwordReset.recoveryKeyView as jest.Mock
      ).toHaveBeenCalledTimes(1);

      await typeByLabelText('Enter account recovery key')(MOCK_RECOVERY_KEY);

      expect(logViewEvent).toHaveBeenCalledWith(
        'flow',
        `${viewName}.engage`,
        REACT_ENTRYPOINT
      );

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(logViewEvent).toHaveBeenCalledWith(
          'flow',
          `${viewName}.submit`,
          REACT_ENTRYPOINT
        );

        expect(logViewEvent).toHaveBeenCalledWith(
          'flow',
          `${viewName}.success`,
          REACT_ENTRYPOINT
        );

        expect(
          GleanMetrics.passwordReset.recoveryKeySubmit as jest.Mock
        ).toHaveBeenCalledTimes(1);
      });
    });

    it('on error and lost recovery key click', async () => {
      const accountWithInvalidKey = {
        resetPasswordStatus: jest.fn().mockResolvedValue(true),
        getRecoveryKeyBundle: jest.fn().mockRejectedValue(new Error('Boop')),
      } as unknown as Account;
      renderSubject({ account: accountWithInvalidKey });

      const submitButton = await screen.findByRole('button', {
        name: 'Confirm account recovery key',
      });

      await typeByLabelText('Enter account recovery key')('zzz');
      fireEvent.click(submitButton);

      await screen.findByText('Invalid account recovery key');
      expect(logViewEvent).toHaveBeenCalledWith(
        'flow',
        `${viewName}.fail`,
        REACT_ENTRYPOINT
      );

      fireEvent.click(
        screen.getByRole('link', {
          name: 'Don’t have an account recovery key?',
        })
      );

      expect(logViewEvent).toHaveBeenCalledWith(
        'flow',
        `lost-recovery-key.${viewName}`,
        REACT_ENTRYPOINT
      );
    });
  });
});
