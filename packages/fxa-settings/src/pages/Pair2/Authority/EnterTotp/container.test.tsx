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
  emitState,
  mockAuthorityIntegration,
} from '../ContinueOnMobile/mocks';
import { AuthorityState, Integration } from '../../../../models';
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
}));
const { getBasicAccountData: mockGetBasicAccountData } = jest.requireMock(
  '../../../../lib/account-storage'
);

// The desktop's TOTP re-prompt sits between the phone confirming and the
// approval screen. It owns two transitions: a verified code goes forward to
// approve_signin, and the pairing dying underneath it goes to the dead-end.
describe('Pair2/Authority/EnterTotp container', () => {
  let integration: MockAuthorityIntegration & { hasChannel: jest.Mock };
  let verifyTotpCode: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    integration = mockAuthorityIntegration({
      hasChannel: jest.fn().mockReturnValue(true),
    }) as MockAuthorityIntegration & { hasChannel: jest.Mock };
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

  // The approval screen uses the timestamp to re-prompt if the user lingers
  // there past the re-prompt window.
  it('returns to the approval screen with the verification time once the code is verified', async () => {
    const MOCK_NOW = 1_700_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW);
    renderContainer();

    await submitCode('123456');

    await waitFor(() =>
      expect(navigateWithQuery).toHaveBeenCalledWith(
        '/pair/authority/approve_signin',
        {
          replace: true,
          state: { totpComplete: true, totpVerifiedAt: MOCK_NOW },
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

  // The phone can cancel while the user is still typing; without this the
  // authority would verify a code for a pairing that no longer exists.
  it('navigates to the cancel screen when the flow fails', () => {
    renderContainer();

    emitState(integration, AuthorityState.Failed);

    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/authority/timeout_and_cancel',
      {},
      true
    );
  });

  // The cancel screen destroys the channel, so a code that finishes verifying
  // after the failure must not route back to approve_signin.
  it('ignores a code verified after the flow has failed', async () => {
    let finishVerify!: (value: { success: boolean }) => void;
    verifyTotpCode.mockReturnValue(
      new Promise((resolve) => {
        finishVerify = resolve;
      })
    );
    renderContainer();
    await submitCode('123456');
    await waitFor(() => expect(verifyTotpCode).toHaveBeenCalled());

    emitState(integration, AuthorityState.Failed);
    finishVerify({ success: true });
    await waitFor(() => expect(navigateWithQuery).toHaveBeenCalledTimes(1));

    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/authority/timeout_and_cancel',
      {},
      true
    );
  });

  it('stops routing state changes once unmounted', async () => {
    const { unmount } = renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    unmount();

    expect(integration.onStateChange).toBeNull();
    emitState(integration, AuthorityState.Failed);
    expect(navigateWithQuery).not.toHaveBeenCalled();
  });

  it('throws when handed an integration that is not the pairing authority', () => {
    expect(() => renderContainer(MOCK_NON_PAIRING_INTEGRATION)).toThrow(
      'Invalid integration type.'
    );
  });

  it('throws before the pairing channel exists', () => {
    integration.hasChannel.mockReturnValue(false);

    expect(() => renderContainer()).toThrow('Pairing channel missing!');
  });
});
