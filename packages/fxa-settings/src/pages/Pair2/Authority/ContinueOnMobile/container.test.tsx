/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import * as Sentry from '@sentry/browser';
import ContinueOnMobileContainer from './container';
import {
  MOCK_NON_PAIRING_INTEGRATION,
  MockAuthorityIntegration,
  emitState,
  mockAuthorityIntegration,
} from './mocks';
import { AuthorityState, Integration } from '../../../../models';
import { navigateWithQuery } from '../../../../lib/utilities';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../../lib/utilities', () => ({
  ...jest.requireActual('../../../../lib/utilities'),
  navigateWithQuery: jest.fn(),
}));

// This is a passive waiting screen: the authority sits here while the
// supplicant works through the flow on its phone, so everything the container
// does is a reaction to the integration's state or to Cancel.
describe('Pair2/Authority/ContinueOnMobile container', () => {
  let integration: MockAuthorityIntegration;
  let captureException: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    integration = mockAuthorityIntegration();
    captureException = jest
      .spyOn(Sentry, 'captureException')
      .mockImplementation(() => '');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderContainer = (i: Integration = integration) =>
    renderWithLocalizationProvider(
      <MemoryRouter>
        <ContinueOnMobileContainer integration={i} />
      </MemoryRouter>
    );

  it('renders the ContinueOnMobile page', () => {
    renderContainer();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Continue on your mobile device'
    );
  });

  it('navigates to the approve-sign-in screen once the supplicant asks for authorization', async () => {
    renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    emitState(integration, AuthorityState.WaitingForAuthority);

    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/authority/approve_signin',
      {},
      true
    );
  });

  // The pairing request is dead in this state — cancelled or timed out — so the
  // authority must never be asked to approve a sign-in for it.
  it('navigates to the cancel screen when pairing fails', async () => {
    renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    emitState(integration, AuthorityState.Failed);

    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/authority/timeout_and_cancel',
      {},
      true
    );
  });

  it.each([
    AuthorityState.Connecting,
    AuthorityState.WaitingForMetadata,
    AuthorityState.WaitingForAuthorizations,
  ])('stays on the page in the %s state', async (state) => {
    renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    emitState(integration, state);

    expect(navigateWithQuery).not.toHaveBeenCalled();
  });

  describe('cancel', () => {
    const clickCancel = async () => {
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
    };

    it('closes the channel before leaving for the cancel screen', async () => {
      renderContainer();

      await clickCancel();

      await waitFor(() => expect(integration.destroy).toHaveBeenCalled());
      expect(mockNavigate).toHaveBeenCalledWith(
        '/pair/authority/timeout_and_cancel',
        { state: { reason: 'canceled' } }
      );
    });

    // The user asked to stop, so a channel that will not close cleanly cannot
    // keep them on a screen that is waiting on a pairing they cancelled.
    it('still leaves for the cancel screen when the channel cannot be closed', async () => {
      const err = new Error('channel server unreachable');
      integration.destroy.mockRejectedValue(err);
      renderContainer();

      await clickCancel();

      await waitFor(() => expect(captureException).toHaveBeenCalledWith(err));
      expect(mockNavigate).toHaveBeenCalledWith(
        '/pair/authority/timeout_and_cancel',
        { state: { reason: 'canceled' } }
      );
    });
  });

  // The channel outlives this page, but the handler must not. The integration
  // lasts the whole session, so a state change arriving after the user has
  // left pairing would otherwise pull them back into the flow.
  it('stops routing state changes once unmounted', async () => {
    const { unmount } = renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    unmount();

    expect(integration.onStateChange).toBeNull();
    emitState(integration, AuthorityState.WaitingForAuthority);
    expect(navigateWithQuery).not.toHaveBeenCalled();
  });

  it('throws when handed an integration that is not the pairing authority', () => {
    expect(() => renderContainer(MOCK_NON_PAIRING_INTEGRATION)).toThrow(
      'Invalid integration. Expecting instance of PairingAuthorityIntegration.'
    );
  });
});
