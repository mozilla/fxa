/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import * as Sentry from '@sentry/browser';
import ApproveSignInContainer from './container';
import { MOCK_EMAIL } from './mocks';
import { MOCK_METADATA_WITH_DEVICE_NAME } from '../../../../components/DeviceInfoBlock/mocks';
import { RemoteMetadata } from '../../../../lib/types';
import {
  AuthorityState,
  Integration,
  PairingAuthorityIntegration,
  useAccount,
} from '../../../../models';
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

jest.mock('../../../../models', () => ({
  ...jest.requireActual('../../../../models'),
  useAccount: jest.fn(),
}));

type MockAuthorityIntegration = PairingAuthorityIntegration & {
  authorize: jest.Mock;
  hasChannel: jest.Mock;
};

/**
 * A `PairingAuthorityIntegration` with the approve surface stubbed. Built from
 * the real prototype because the container narrows on `instanceof` before it
 * touches any of it.
 */
function mockAuthorityIntegration({
  remoteMetadata = MOCK_METADATA_WITH_DEVICE_NAME as RemoteMetadata | null,
} = {}): MockAuthorityIntegration {
  const integration = Object.create(
    PairingAuthorityIntegration.prototype
  ) as MockAuthorityIntegration;

  // `remoteMetadata` is a getter on the prototype, so it cannot be assigned.
  Object.defineProperty(integration, 'remoteMetadata', {
    get: () => remoteMetadata,
  });

  return Object.assign(integration, {
    authorize: jest.fn().mockResolvedValue(undefined),
    hasChannel: jest.fn().mockReturnValue(true),
    onStateChange: null,
  });
}

const emitState = (
  integration: MockAuthorityIntegration,
  state: AuthorityState
) => (integration as PairingAuthorityIntegration).onStateChange?.(state);

// Approving is the point of no return: it makes Firefox mint an OAuth code with
// the account's Sync keys wrapped inside. So this container's job is to fire
// that exactly once, and to make sure a failure lands somewhere the user can
// see rather than disappearing into an unhandled rejection.
describe('Pair2/Authority/ApproveSignIn container', () => {
  let integration: MockAuthorityIntegration;
  let captureException: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    integration = mockAuthorityIntegration();
    (useAccount as jest.Mock).mockReturnValue({ email: MOCK_EMAIL });
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

  const clickApprove = async () => {
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: 'Yes, approve sign-in' })
    );
  };

  it('renders the approval screen for the device that scanned the code', () => {
    renderContainer();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Approve sign-in?'
    );
    screen.getByText(MOCK_EMAIL);
  });

  it('waits for the device details before rendering the approval', () => {
    integration = mockAuthorityIntegration({ remoteMetadata: null });

    renderContainer();

    expect(
      screen.queryByRole('heading', { level: 1, name: 'Approve sign-in?' })
    ).not.toBeInTheDocument();
  });

  it('authorizes when the user approves', async () => {
    renderContainer();

    await clickApprove();

    expect(integration.authorize).toHaveBeenCalledTimes(1);
  });

  // Two codes would be minted, and the second `pair:auth:authorize` would go
  // out after the flow had already completed.
  it('authorizes once even if approve is clicked twice', async () => {
    integration.authorize.mockReturnValue(new Promise(() => {}));
    renderContainer();

    await clickApprove();
    await clickApprove();

    expect(integration.authorize).toHaveBeenCalledTimes(1);
  });

  it('navigates to the success screen once pairing completes', () => {
    renderContainer();

    emitState(integration, AuthorityState.Complete);

    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/authority/sync_success',
      {},
      true
    );
  });

  // `authorize()` routes the failures it expects through `fail()`. Without a
  // Failed case the user would sit on this screen with no feedback.
  it('navigates to the cancel screen when the flow fails', () => {
    renderContainer();

    emitState(integration, AuthorityState.Failed);

    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/authority/timeout_and_cancel',
      {},
      true
    );
  });

  it('reports and leaves the screen when authorize rejects outright', async () => {
    const err = new Error('web channel exploded');
    integration.authorize.mockRejectedValue(err);
    renderContainer();

    await clickApprove();

    await waitFor(() => expect(captureException).toHaveBeenCalledWith(err));
    expect(navigateWithQuery).toHaveBeenCalledWith(
      '/pair/authority/timeout_and_cancel',
      {},
      true
    );
  });

  it('offers the change-password recovery path', async () => {
    const user = userEvent.setup();
    renderContainer();

    await user.click(
      screen.getByRole('button', { name: 'Change your password' })
    );

    expect(mockNavigate).toHaveBeenCalledWith('/settings/change_password');
  });

  // The channel outlives this page, but the handler must not. The integration
  // lasts the whole session, so a state change arriving after the user has
  // left pairing would otherwise pull them back into the flow.
  it('stops routing state changes once unmounted', async () => {
    const { unmount } = renderContainer();
    await waitFor(() => expect(integration.onStateChange).toBeTruthy());

    unmount();

    expect(integration.onStateChange).toBeNull();
    emitState(integration, AuthorityState.Complete);
    expect(navigateWithQuery).not.toHaveBeenCalled();
  });

  it('throws when handed an integration that is not the pairing authority', () => {
    expect(() => renderContainer({} as Integration)).toThrow(
      'Invalid integration type.'
    );
  });

  it('throws before the pairing channel exists', () => {
    integration.hasChannel.mockReturnValue(false);

    expect(() => renderContainer()).toThrow('Pairing channel missing!');
  });
});
