/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import InlineTotpSetup from '.';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { MozServices } from '../../lib/types';
import { MOCK_TOTP_TOKEN } from './mocks';

const cancelSetupHandler = jest.fn();
const verifyCodeHandler = jest.fn();
const mockProps = {
  totp: MOCK_TOTP_TOKEN,
  serviceName: MozServices.Addons,
  cancelSetupHandler,
  verifyCodeHandler,
};

describe('InlineTotpSetup', () => {
  let user: UserEvent;

  const clickContinue = async () => {
    await user.click(await screen.findByRole('button', { name: 'Continue' }));
  };

  beforeAll(async () => {
    global.URL.createObjectURL = jest.fn();
  });

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders the intro as expected', () => {
    renderWithLocalizationProvider(<InlineTotpSetup {...mockProps} />);

    screen.getByRole('heading', {
      name: 'Two-step authentication',
    });
    expect(
      screen.getByText('Set up two-step authentication')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Add-ons requires you to set up two-step authentication to keep your account safe.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
  });

  it('renders step 1 as expected, showing the QR code by default', async () => {
    renderWithLocalizationProvider(<InlineTotpSetup {...mockProps} />);
    await clickContinue();
    expect(
      await screen.findByRole('progressbar', {
        name: 'Step 1 of 4.',
      })
    ).toBeInTheDocument();
    expect(await screen.findByText(/Scan this QR code/)).toBeInTheDocument();
  });

  it('can go back to intro from step 1', async () => {
    renderWithLocalizationProvider(<InlineTotpSetup {...mockProps} />);
    await clickContinue();
    expect(
      await screen.findByText('Connect to your authenticator app')
    ).toBeInTheDocument();
    user.click(screen.getByRole('button', { name: 'Back' }));
    expect(
      await screen.findByText('Set up two-step authentication')
    ).toBeInTheDocument();
  });

  it('calls verifyCodeHandler on code submission', async () => {
    renderWithLocalizationProvider(<InlineTotpSetup {...mockProps} />);
    await clickContinue();
    await user.type(
      await screen.findByLabelText('Enter 6-digit code'),
      '123456'
    );
    await clickContinue();
    expect(verifyCodeHandler).toHaveBeenCalledWith('123456');
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

    await clickContinue();
    await user.type(
      await screen.findByLabelText('Enter 6-digit code'),
      '000000'
    );
    await clickContinue();
    expect(verifyCodeHandler).toHaveBeenCalledWith('000000');
    expect(
      await screen.findByText(/Invalid or expired code/)
    ).toBeInTheDocument();
  });
});
