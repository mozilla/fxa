/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import { ERRNO } from '@fxa/accounts/errors';
import InlinePasswordlessSyncSetupContainer from './container';
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
  useAuthClient: () => ({}),
}));

const mockCreateWrap = jest.fn();
jest.mock('../../lib/passkeys/wrap/creation', () => ({
  createPasskeyWrap: (...args: unknown[]) => mockCreateWrap(args[1]),
}));

const mockCaptureException = jest.fn();
jest.mock('@sentry/browser', () => ({
  ...jest.requireActual('@sentry/browser'),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

const SETTINGS_NAV = (
  state: {
    passkeySyncEnabled?: boolean;
    localizedErrorFromLocationState?: string;
  } = {}
) => ['/settings', { state, replace: true }];

const wrapData = () => ({
  uid: '11111111222222223333333344444444',
  credentialId: 'Y3JlZGVudGlhbA',
  mfaToken: 'mfa-token',
  prfOut: new Uint8Array(32).fill(9),
  kB: new Uint8Array(32).fill(7),
});

// The re-render button stands in for any parent update landing while the
// Settings chunk is still loading.
const Harness = () => {
  const [, bump] = useState(0);
  return (
    <>
      <button onClick={() => bump((n) => n + 1)}>re-render</button>
      <InlinePasswordlessSyncSetupContainer />
    </>
  );
};

const render = () =>
  renderWithLocalizationProvider(
    <MemoryRouter initialEntries={['/inline_passwordless_sync_setup']}>
      <Harness />
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockSensitiveDataClient.setDataType(
    SensitiveData.Key.PasskeyWrap,
    wrapData()
  );
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
      expect(mockNavigate).toHaveBeenCalledWith(
        ...SETTINGS_NAV({ passkeySyncEnabled: true })
      )
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

  const serverError = (errno: number) =>
    Object.assign(new Error('nope'), { errno });
  const PASSKEY_UNUSABLE = 'This passkey can’t be used to skip the password.';
  const GENERIC =
    'Couldn’t enable this passkey for Sync. You can try again the next time you sign in.';

  it.each<[string, Record<string, unknown>, string]>([
    [
      'throttled',
      { error: serverError(ERRNO.THROTTLED) },
      'You’ve tried too many times. Please try again later.',
    ],
    ['prf_unsupported', { failure: 'prf_unsupported' }, PASSKEY_UNUSABLE],
    ['platform_crypto', { failure: 'platform_crypto' }, PASSKEY_UNUSABLE],
    ['proof_malformed', { failure: 'proof_malformed' }, GENERIC],
    ['key_unusable', { failure: 'key_unusable' }, GENERIC],
    [
      'passkey_not_found',
      { error: serverError(ERRNO.PASSKEY_NOT_FOUND) },
      PASSKEY_UNUSABLE,
    ],
    [
      'wrap_conflict',
      { error: serverError(ERRNO.PASSKEY_WRAP_CONFLICT) },
      GENERIC,
    ],
    ['unexpected', { error: serverError(ERRNO.UNEXPECTED_ERROR) }, GENERIC],
  ])(
    'continues to Settings carrying the %s failure copy',
    async (_label, outcome, copy) => {
      const user = userEvent.setup();
      mockCreateWrap.mockResolvedValue({ ok: false, ...outcome });
      render();

      await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(
          ...SETTINGS_NAV({ localizedErrorFromLocationState: copy })
        )
      );
      expect(
        mockSensitiveDataClient.getDataType(SensitiveData.Key.PasskeyWrap)
      ).toBeUndefined();
    }
  );

  it('navigates once on success even when the page re-renders before Settings mounts', async () => {
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        ...SETTINGS_NAV({ passkeySyncEnabled: true })
      )
    );
    await user.click(screen.getByRole('button', { name: 're-render' }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('continues to Settings with the generic copy when the wrap call throws', async () => {
    const user = userEvent.setup();
    const thrown = new Error('boom');
    mockCreateWrap.mockRejectedValue(thrown);
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        ...SETTINGS_NAV({
          localizedErrorFromLocationState:
            'Couldn’t enable this passkey for Sync. You can try again the next time you sign in.',
        })
      )
    );
    expect(mockCaptureException).toHaveBeenCalledWith(thrown);
  });

  it('shows the loading state while the wrap is being stored', async () => {
    const user = userEvent.setup();
    mockCreateWrap.mockReturnValue(new Promise(() => {}));
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    expect(screen.getByRole('button', { name: 'Enabling…' })).toBeDisabled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
