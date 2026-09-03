/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import * as Sentry from '@sentry/browser';
import ApproveSignInContainer from './container';
import { MOCK_METADATA_WITH_DEVICE_NAME } from '../../../../components/DeviceInfoBlock/mocks';
import { RemoteMetadata } from '../../../../lib/types';
import {
  Integration,
  PairingSupplicantIntegration,
  SupplicantState,
} from '../../../../models';
import { navigateWithQuery } from '../../../../lib/utilities';

jest.mock('../../../../lib/utilities', () => ({
  ...jest.requireActual('../../../../lib/utilities'),
  navigateWithQuery: jest.fn(),
}));

type MockSupplicantIntegration = PairingSupplicantIntegration & {
  destroy: jest.Mock;
};

/**
 * A `PairingSupplicantIntegration` with the cancel surface stubbed. Built from
 * the real prototype because the container narrows on `instanceof` before it
 * touches any of it.
 */
function mockSupplicantIntegration({
  remoteMetadata = MOCK_METADATA_WITH_DEVICE_NAME as RemoteMetadata | null,
} = {}): MockSupplicantIntegration {
  const integration = Object.create(
    PairingSupplicantIntegration.prototype
  ) as MockSupplicantIntegration;

  // `remoteMetadata` is a getter on the prototype, so it cannot be assigned.
  Object.defineProperty(integration, 'remoteMetadata', {
    get: () => remoteMetadata,
  });

  return Object.assign(integration, {
    destroy: jest.fn().mockResolvedValue(undefined),
    onStateChange: null,
  });
}

const emitState = (
  integration: MockSupplicantIntegration,
  state: SupplicantState
) => (integration as PairingSupplicantIntegration).onStateChange?.(state);

// The supplicant waits here while the authority approves on the other device,
// so everything this container does is a reaction to the channel's state or to
// Cancel.
describe('Pair2/Supplicant/ApproveSignIn container', () => {
  let integration: MockSupplicantIntegration;
  let captureException: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    integration = mockSupplicantIntegration();
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
        <ApproveSignInContainer integration={i} />
      </MemoryRouter>
    );

  it('navigates to the success screen once pairing completes', () => {
    renderContainer();

    emitState(integration, SupplicantState.Complete);

    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/supplicant/sync_success',
      {},
      true
    );
  });

  it('navigates to the cancel screen when the flow fails', () => {
    renderContainer();

    emitState(integration, SupplicantState.Failed);

    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/supplicant/timeout_and_cancel',
      {},
      true
    );
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
      expect(navigateWithQuery).toHaveBeenCalledWith(
        '/pair/supplicant/timeout_and_cancel',
        { state: { reason: 'canceled' } },
        true
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
      expect(navigateWithQuery).toHaveBeenCalledWith(
        '/pair/supplicant/timeout_and_cancel',
        { state: { reason: 'canceled' } },
        true
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
    emitState(integration, SupplicantState.Complete);
    expect(navigateWithQuery).not.toHaveBeenCalled();
  });

  it('throws when handed an integration that is not the pairing supplicant', () => {
    expect(() => renderContainer({} as Integration)).toThrow(
      'Invalid integration. Expecting instance of PairingSupplicantIntegration'
    );
  });

  // Without the metadata there is no device for the user to recognise, so the
  // screen cannot ask them to approve anything.
  it('throws before the authority metadata has arrived', () => {
    integration = mockSupplicantIntegration({ remoteMetadata: null });

    expect(() => renderContainer()).toThrow(
      'Invalid integration state. Remote meta data should be populated.'
    );
  });
});
