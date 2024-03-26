/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, screen } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import InlineTotpSetup from '.';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { MozServices } from '../../lib/types';
import { MOCK_EMAIL, MOCK_TOTP_TOKEN } from './mocks';

const cancelSetupHandler = jest.fn();
const verifyCodeHandler = jest.fn();
const mockProps = {
  totp: MOCK_TOTP_TOKEN,
  email: MOCK_EMAIL,
  cancelSetupHandler,
  verifyCodeHandler,
};

describe('InlineTotpSetup', () => {
  let user: UserEvent;

  beforeAll(async () => {
    global.URL.createObjectURL = jest.fn();
  });

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders default as expected', () => {
    renderWithLocalizationProvider(<InlineTotpSetup {...mockProps} />);
    screen.getByRole('heading', {
      name: `Enable two-step authentication to continue to ${MozServices.Default}`,
    });
    expect(
      screen.getByLabelText('A device with a hidden 6-digit code.')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel setup' })
    ).toBeInTheDocument();
  });

  it('renders intro view as expected with custom service name', () => {
    renderWithLocalizationProvider(
      <InlineTotpSetup
        {...{ ...mockProps, serviceName: MozServices.Monitor }}
      />
    );
    screen.getByRole('heading', {
      name: `Enable two-step authentication to continue to ${MozServices.Monitor}`,
    });
    expect(
      screen.getByLabelText('A device with a hidden 6-digit code.')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel setup' })
    ).toBeInTheDocument();
  });

  it('renders QR code by default when a user clicks "Continue"', async () => {
    renderWithLocalizationProvider(<InlineTotpSetup {...mockProps} />);
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Continue' }))
    );
    await screen.findByAltText(
      `Use the code ${MOCK_TOTP_TOKEN.secret} to set up two-step authentication in supported applications.`
    );
  });

  it('toggles from QR code to manual secret code view when user clicks "Can\'t scan code"', async () => {
    renderWithLocalizationProvider(<InlineTotpSetup {...mockProps} />);
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Continue' }))
    );
    await screen.findByAltText(
      `Use the code ${MOCK_TOTP_TOKEN.secret} to set up two-step authentication in supported applications.`
    );

    const changeToManualModeButton = screen.getByRole('button', {
      name: 'Can’t scan code?',
    });
    await act(async () => await user.click(changeToManualModeButton));
    await screen.findByRole('button', { name: 'Scan QR code instead?' });
  });

  it('toggles from secret code to QR code view when user clicks "Scan QR code instead?', async () => {
    renderWithLocalizationProvider(<InlineTotpSetup {...mockProps} />);
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Continue' }))
    );
    await screen.findByAltText(
      `Use the code ${MOCK_TOTP_TOKEN.secret} to set up two-step authentication in supported applications.`
    );
    const changeToManualModeButton = screen.getByRole('button', {
      name: 'Can’t scan code?',
    });
    await act(async () => await user.click(changeToManualModeButton));
    await screen.findByRole('button', { name: 'Scan QR code instead?' });
    await act(
      async () =>
        await user.click(
          screen.getByRole('button', { name: 'Scan QR code instead?' })
        )
    );
    await screen.findByAltText(
      `Use the code ${MOCK_TOTP_TOKEN.secret} to set up two-step authentication in supported applications.`
    );
  });

  it('shows error on incorrect totp submission', async () => {
    const verifyCodeHandler = jest
      .fn()
      .mockRejectedValue(AuthUiErrors.INVALID_TOTP_CODE);
    renderWithLocalizationProvider(
      <InlineTotpSetup
        {...{
          ...mockProps,
          verifyCodeHandler,
        }}
      />
    );
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Continue' }))
    );
    await act(
      async () =>
        await user.type(screen.getByLabelText('Authentication code'), '000000')
    );
    await act(
      async () =>
        await user.click(screen.getByRole('button', { name: 'Ready' }))
    );
    await screen.findByText('Invalid two-step authentication code');
    expect(verifyCodeHandler).toBeCalledWith('000000');
  });
});
