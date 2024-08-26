/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import InlineRecoverySetup from '.';
import { MozServices } from '../../lib/types';
import { renderWithRouter } from '../../models/mocks';
import { MOCK_RECOVERY_CODES, MOCK_SERVICE_NAME } from './mocks';
import { MOCK_EMAIL } from '../mocks';
import GleanMetrics from '../../lib/glean';
import { OAUTH_ERRORS, OAuthError } from '../../lib/oauth';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));
jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      twoStepAuthCodesView: jest.fn(),
      twoStepAuthEnterCodeView: jest.fn(),
    },
  },
}));
const cancelSetupHandler = jest.fn();
const verifyTotpHandler = jest.fn();
const successSetupHandler = jest.fn();
const props = {
  oAuthError: undefined,
  recoveryCodes: MOCK_RECOVERY_CODES,
  cancelSetupHandler: cancelSetupHandler,
  verifyTotpHandler: verifyTotpHandler,
  successfulSetupHandler: successSetupHandler,
};

describe('InlineRecoverySetup', () => {
  let user: UserEvent;

  beforeAll(async () => {
    global.URL.createObjectURL = jest.fn();
  });

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders default content as expected', () => {
    renderWithRouter(<InlineRecoverySetup {...props} email={MOCK_EMAIL} />);
    screen.getByRole('heading', {
      name: `Save backup authentication codes to continue to ${MozServices.Default}`,
    });
    screen.getByText(
      'Store these one-time use codes in a safe place for when you don’t have your mobile device.'
    );
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument();
    expect(screen.getByTestId('databutton-download')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();

    expect(GleanMetrics.accountPref.twoStepAuthCodesView).toBeCalled();
  });

  it('renders as expected with a custom service name', () => {
    renderWithRouter(
      <InlineRecoverySetup
        serviceName={MOCK_SERVICE_NAME}
        email={MOCK_EMAIL}
        {...props}
      />
    );
    screen.getByRole('heading', {
      name: `Save backup authentication codes to continue to ${MOCK_SERVICE_NAME}`,
    });
  });

  it('renders "showConfirmation" content as expected', async () => {
    renderWithRouter(<InlineRecoverySetup email={MOCK_EMAIL} {...props} />);

    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Continue' }))
    );

    screen.getByRole('heading', {
      name: `Confirm backup authentication code to continue to ${MozServices.Default}`,
    });
    screen.queryByLabelText('Document that contains hidden text.');
    screen.getByLabelText('Backup authentication code');
    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('button', { name: 'Back' });
    screen.getByRole('button', { name: 'Cancel setup' });
    expect(GleanMetrics.accountPref.twoStepAuthEnterCodeView).toBeCalled();
  });

  it('renders "showConfirmation" content as expected with a custom service name', async () => {
    renderWithRouter(
      <InlineRecoverySetup
        email={MOCK_EMAIL}
        serviceName={MOCK_SERVICE_NAME}
        {...props}
      />
    );
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Continue' }))
    );
    screen.getByRole('heading', {
      name: `Confirm backup authentication code to continue to ${MOCK_SERVICE_NAME}`,
    });
  });

  it('shows an error on incorrect recovery code submission', async () => {
    renderWithRouter(
      <InlineRecoverySetup
        email={MOCK_EMAIL}
        serviceName={MOCK_SERVICE_NAME}
        {...props}
      />
    );
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Continue' }))
    );
    await act(
      async () =>
        await user.type(
          screen.getByLabelText('Backup authentication code'),
          'chargingelephant'
        )
    );
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Confirm' }))
    );
    await screen.findByText('Incorrect backup authentication code');
  });

  it('shows an error when oAuthError is passed', async () => {
    renderWithRouter(
      <InlineRecoverySetup
        {...props}
        email={MOCK_EMAIL}
        oAuthError={new OAuthError('TRY_AGAIN')}
      />
    );
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Continue' }))
    );
    await waitFor(() => {
      screen.getByText(OAUTH_ERRORS.TRY_AGAIN.message);
    });
  });

  it('calls the successful setup callback on correct recovery code', async () => {
    const verifyTotpHandler = jest.fn().mockResolvedValue(true);
    const successfulSetupHandler = jest.fn();
    renderWithRouter(
      <InlineRecoverySetup
        serviceName={MOCK_SERVICE_NAME}
        email={MOCK_EMAIL}
        {...props}
        {...{ verifyTotpHandler, successfulSetupHandler }}
      />
    );
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Continue' }))
    );
    await act(
      async () =>
        await user.type(
          screen.getByLabelText('Backup authentication code'),
          MOCK_RECOVERY_CODES[0]
        )
    );
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Confirm' }))
    );

    await waitFor(() => {
      expect(verifyTotpHandler).toHaveBeenCalled();
      expect(successfulSetupHandler).toHaveBeenCalled();
    });
  });

  it('shows an error when failed to verify totp', async () => {
    const verifyTotpHandler = jest.fn().mockResolvedValue(false);
    const successfulSetupHandler = jest.fn();
    renderWithRouter(
      <InlineRecoverySetup
        email={MOCK_EMAIL}
        serviceName={MOCK_SERVICE_NAME}
        {...props}
        {...{ verifyTotpHandler, successfulSetupHandler }}
      />
    );
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Continue' }))
    );
    await act(
      async () =>
        await user.type(
          screen.getByLabelText('Backup authentication code'),
          MOCK_RECOVERY_CODES[0]
        )
    );
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Confirm' }))
    );
    expect(verifyTotpHandler).toHaveBeenCalled();
    expect(successfulSetupHandler).not.toHaveBeenCalled();
    await screen.findByText(
      'There was a problem confirming your backup authentication code'
    );
  });
});
