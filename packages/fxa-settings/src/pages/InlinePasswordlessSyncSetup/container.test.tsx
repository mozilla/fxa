/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import InlinePasswordlessSyncSetupContainer from './container';
import { usePasskeyWrapCreation } from '../../lib/passkeys/wrap';
import {
  SensitiveData,
  SensitiveDataClient,
} from '../../lib/sensitive-data-client';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

const mockSensitiveDataClient = new SensitiveDataClient();
jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useSensitiveDataClient: () => mockSensitiveDataClient,
}));

jest.mock('../../lib/passkeys/wrap', () => ({
  usePasskeyWrapCreation: jest.fn(),
}));

const mockCreateWrap = jest.fn();
const SETTINGS_NAV = (localizedErrorFromLocationState?: string) => [
  '/settings',
  { state: { localizedErrorFromLocationState }, replace: true },
];

const wrapData = () => ({
  credentialId: 'Y3JlZGVudGlhbA',
  mfaToken: 'mfa-token',
  prfOut: new Uint8Array(32).fill(9),
  kB: new Uint8Array(32).fill(7),
});

const render = () =>
  renderWithLocalizationProvider(
    <MemoryRouter initialEntries={['/inline_passwordless_sync_setup']}>
      <InlinePasswordlessSyncSetupContainer />
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockSensitiveDataClient.setDataType(
    SensitiveData.Key.PasskeyWrap,
    wrapData()
  );
  (usePasskeyWrapCreation as jest.Mock).mockReturnValue({
    createWrap: mockCreateWrap,
    isLoading: false,
  });
  mockCreateWrap.mockResolvedValue({ ok: true, created: true });
});

describe('InlinePasswordlessSyncSetupContainer', () => {
  it('renders the offer when the ceremony and password step left wrap material', () => {
    render();

    expect(
      screen.getByRole('button', { name: 'Enable passkey' })
    ).toBeInTheDocument();
  });

  it('continues to Settings without rendering when the material is gone', async () => {
    mockSensitiveDataClient.setDataType(
      SensitiveData.Key.PasskeyWrap,
      undefined
    );
    render();

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV())
    );
    expect(
      screen.queryByRole('button', { name: 'Enable passkey' })
    ).not.toBeInTheDocument();
  });

  it('continues to Settings when only kB is missing', async () => {
    mockSensitiveDataClient.setDataType(SensitiveData.Key.PasskeyWrap, {
      ...wrapData(),
      kB: undefined,
    });
    render();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    expect(
      mockSensitiveDataClient.getDataType(SensitiveData.Key.PasskeyWrap)
    ).toBeUndefined();
  });

  it('clears the material and continues on "Not now"', async () => {
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole('button', { name: 'Not now' }));

    expect(mockCreateWrap).not.toHaveBeenCalled();
    expect(
      mockSensitiveDataClient.getDataType(SensitiveData.Key.PasskeyWrap)
    ).toBeUndefined();
    expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV());
  });

  it('stores the wrap from the held material, clears it, and lands in Settings with the banner', async () => {
    const user = userEvent.setup();
    const held = mockSensitiveDataClient.getDataType(
      SensitiveData.Key.PasskeyWrap
    )!;
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/settings', {
        state: { passkeySyncEnabled: true },
        replace: true,
      })
    );
    expect(mockCreateWrap).toHaveBeenCalledWith({
      credentialId: held.credentialId,
      mfaToken: held.mfaToken,
      prfOut: held.prfOut,
      kB: held.kB,
    });
    expect(held.kB!.every((b) => b === 0)).toBe(true);
    expect(held.prfOut.every((b) => b === 0)).toBe(true);
    expect(
      mockSensitiveDataClient.getDataType(SensitiveData.Key.PasskeyWrap)
    ).toBeUndefined();
  });

  it.each([
    ['throttled', 'You’ve tried too many times. Please try again later.'],
    ['prf_unsupported', 'This passkey can’t be used to skip the password.'],
    ['platform_crypto', 'This passkey can’t be used to skip the password.'],
    ['passkey_not_found', 'This passkey can’t be used to skip the password.'],
    [
      'wrap_conflict',
      'Couldn’t enable this passkey for Sync. You can try again the next time you sign in.',
    ],
    [
      'unexpected',
      'Couldn’t enable this passkey for Sync. You can try again the next time you sign in.',
    ],
  ])(
    'continues to Settings carrying the %s failure copy',
    async (failure, copy) => {
      const user = userEvent.setup();
      mockCreateWrap.mockResolvedValue({ ok: false, failure });
      render();

      await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV(copy))
      );
      expect(
        mockSensitiveDataClient.getDataType(SensitiveData.Key.PasskeyWrap)
      ).toBeUndefined();
    }
  );

  it('shows the loading state while the wrap is being stored', () => {
    (usePasskeyWrapCreation as jest.Mock).mockReturnValue({
      createWrap: mockCreateWrap,
      isLoading: true,
    });
    render();

    expect(screen.getByRole('button', { name: 'Enabling…' })).toBeDisabled();
  });
});
