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

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));
const cancelSetupHandler = jest.fn();
const verifyTotpHandler = jest.fn();
const successSetupHandler = jest.fn();
const props = {
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
