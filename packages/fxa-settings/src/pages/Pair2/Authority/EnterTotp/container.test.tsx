/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import EnterTotpContainer from './container';
import {
  MOCK_NON_PAIRING_INTEGRATION,
  MockAuthorityIntegration,
  mockAuthorityIntegration,
} from '../ContinueOnMobile/mocks';
import { Integration } from '../../../../models';
import { AppContext } from '../../../../models/contexts/AppContext';
import { mockAppContext } from '../../../../models/mocks';
import { navigateWithQuery } from '../../../../lib/utilities';

jest.mock('../../../../lib/utilities', () => ({
  ...jest.requireActual('../../../../lib/utilities'),
  navigateWithQuery: jest.fn(),
}));

jest.mock('../../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const MOCK_SESSION_TOKEN = 'a'.repeat(64);
jest.mock('../../../../lib/account-storage', () => ({
  getBasicAccountData: jest.fn(),
  recordTotpVerified: jest.fn(),
}));
const { getBasicAccountData: mockGetBasicAccountData } = jest.requireMock(
  '../../../../lib/account-storage'
);

// The desktop's TOTP prompt sits between entering the flow and the QR. A
// verified code goes forward to scan_qr, which then opens the channel.
describe('Pair2/Authority/EnterTotp container', () => {
  let integration: MockAuthorityIntegration;
  let verifyTotpCode: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    integration = mockAuthorityIntegration();
    verifyTotpCode = jest.fn().mockResolvedValue({ success: true });
    mockGetBasicAccountData.mockReturnValue({
      sessionToken: MOCK_SESSION_TOKEN,
    });
  });

  const renderContainer = (i: Integration = integration) => {
    const appCtx = mockAppContext();
    Object.assign(appCtx.authClient as object, { verifyTotpCode });
    return renderWithLocalizationProvider(
      <AppContext.Provider value={appCtx}>
        <MemoryRouter initialEntries={['/pair/authority/totp']}>
          <EnterTotpContainer integration={i} />
        </MemoryRouter>
      </AppContext.Provider>
    );
  };

  const submitCode = async (code: string) => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Enter 6-digit code'), code);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
  };

  it('asks for the authentication code to continue to Firefox Sync', () => {
    renderContainer();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Enter authentication code to continue to Firefox Sync'
    );
    screen.getByLabelText('Enter 6-digit code');
  });

  it('verifies the code against the pairing service', async () => {
    renderContainer();

    await submitCode('123456');

    await waitFor(() =>
      expect(verifyTotpCode).toHaveBeenCalledWith(
        MOCK_SESSION_TOKEN,
        '123456',
        { service: 'pair' }
      )
    );
  });

  it('returns to the QR screen once the code is verified', async () => {
    renderContainer();

    await submitCode('123456');

    await waitFor(() =>
      expect(navigateWithQuery).toHaveBeenCalledWith(
        '/pair/authority/scan_qr',
        {
          replace: true,
          state: { totpComplete: true },
        }
      )
    );
  });

  it('stays put and shows the error when the code is rejected', async () => {
    verifyTotpCode.mockResolvedValue({ success: false });
    renderContainer();

    await submitCode('000000');

    await screen.findByText('Invalid authentication code');
    expect(navigateWithQuery).not.toHaveBeenCalled();
  });

  it('throws when handed an integration that is not the pairing authority', () => {
    expect(() => renderContainer(MOCK_NON_PAIRING_INTEGRATION)).toThrow(
      'Invalid integration type.'
    );
  });
});
