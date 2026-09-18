/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StrictMode, useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import { ERRNO } from '@fxa/accounts/errors';
import InlinePasswordlessSyncSetupContainer from './container';
import { SensitiveDataClient } from '../../lib/sensitive-data-client';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

const mockSensitiveDataClient = new SensitiveDataClient();
const mockAlertBar = { success: jest.fn(), error: jest.fn() };
jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useSensitiveDataClient: () => mockSensitiveDataClient,
  useAuthClient: () => ({}),
  useAlertBar: () => mockAlertBar,
}));

const mockCreateWrap = jest.fn();
jest.mock('../../lib/passkeys/wrap/creation', () => ({
  createPasskeyWrap: (...args: unknown[]) => mockCreateWrap(args[1]),
}));

jest.mock('../../lib/cache', () => ({
  ...jest.requireActual('../../lib/cache'),
  sessionToken: () => 'session-token',
}));

const mockCaptureException = jest.fn();
jest.mock('@sentry/browser', () => ({
  ...jest.requireActual('@sentry/browser'),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

const SETTINGS_NAV = ['/settings', { replace: true }] as const;

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

const render = (
  Wrapper: React.ComponentType<React.PropsWithChildren> = Passthrough
) =>
  renderWithLocalizationProvider(
    <Wrapper>
      <MemoryRouter initialEntries={['/inline_passwordless_sync_setup']}>
        <Harness />
      </MemoryRouter>
    </Wrapper>
  );
const Passthrough = ({ children }: React.PropsWithChildren) => <>{children}</>;

beforeEach(() => {
  jest.clearAllMocks();
  mockSensitiveDataClient.PasskeyWrapData = wrapData();
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
    mockSensitiveDataClient.PasskeyWrapData = undefined;
    render();

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
    );
    expect(
      screen.queryByRole('button', { name: 'Enable passkey' })
    ).not.toBeInTheDocument();
  });

  it('continues to Settings when only kB is missing', async () => {
    mockSensitiveDataClient.PasskeyWrapData = {
      ...wrapData(),
      kB: undefined,
    };
    render();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    expect(mockSensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('clears the material and continues on "Not now"', async () => {
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole('button', { name: 'Not now' }));

    expect(mockCreateWrap).not.toHaveBeenCalled();
    expect(mockSensitiveDataClient.PasskeyWrapData).toBeUndefined();
    expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV);
  });

  it('stores the wrap from the held material, clears it, and lands in Settings with the banner', async () => {
    const user = userEvent.setup();
    const held = mockSensitiveDataClient.PasskeyWrapData!;
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
    );
    expect(mockAlertBar.success).toHaveBeenCalledWith(
      'This passkey is set up for password-free sign-in.'
    );
    expect(mockAlertBar.error).not.toHaveBeenCalled();
    expect(mockCreateWrap).toHaveBeenCalledWith({
      credentialId: held.credentialId,
      mfaToken: held.mfaToken,
      sessionToken: 'session-token',
      prfOut: held.prfOut,
      kB: held.kB,
    });
    expect(held.kB!.every((b) => b === 0)).toBe(true);
    expect(held.prfOut.every((b) => b === 0)).toBe(true);
    expect(mockSensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  const serverError = (errno: number) =>
    Object.assign(new Error('nope'), { errno });
  const PASSKEY_UNUSABLE = 'This passkey can’t be used to skip the password.';
  const GENERIC =
    'Couldn’t set up this passkey for password-free sign-in. You can try again the next time you sign in.';

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
    ['unexpected', { error: serverError(ERRNO.UNEXPECTED_ERROR) }, GENERIC],
  ])(
    'continues to Settings carrying the %s failure copy',
    async (_label, outcome, copy) => {
      const user = userEvent.setup();
      mockCreateWrap.mockResolvedValue({ ok: false, ...outcome });
      render();

      await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
      );
      expect(mockAlertBar.error).toHaveBeenCalledWith(copy);
      expect(mockAlertBar.success).not.toHaveBeenCalled();
      expect(mockSensitiveDataClient.PasskeyWrapData).toBeUndefined();
    }
  );

  it('treats a differing wrap already stored for the passkey as success', async () => {
    const user = userEvent.setup();
    mockCreateWrap.mockResolvedValue({
      ok: false,
      error: serverError(ERRNO.PASSKEY_WRAP_CONFLICT),
    });
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
    );
    expect(mockAlertBar.success).toHaveBeenCalled();
    expect(mockAlertBar.error).not.toHaveBeenCalled();
  });

  it('navigates once on success even when the page re-renders before Settings mounts', async () => {
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
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
      expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
    );
    expect(mockAlertBar.error).toHaveBeenCalledWith(
      'Couldn’t set up this passkey for password-free sign-in. You can try again the next time you sign in.'
    );
    expect(mockCaptureException).toHaveBeenCalledWith(thrown);
  });

  it('does nothing once the user has left during the store', async () => {
    const user = userEvent.setup();
    let finish!: (value: unknown) => void;
    mockCreateWrap.mockReturnValue(
      new Promise((resolve) => (finish = resolve))
    );
    const { unmount } = render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));
    unmount();
    finish({ ok: true, created: true });
    await Promise.resolve();

    expect(mockAlertBar.success).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('zeroes and clears the material when the page unmounts without a choice', async () => {
    const held = wrapData();
    mockSensitiveDataClient.PasskeyWrapData = held;
    const { unmount } = render();

    unmount();
    await Promise.resolve();

    expect(held.kB).toEqual(new Uint8Array(32));
    expect(held.prfOut).toEqual(new Uint8Array(32));
    expect(mockSensitiveDataClient.PasskeyWrapData).toBeUndefined();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('keeps the material through a StrictMode remount', async () => {
    render(StrictMode);
    await Promise.resolve();

    expect(mockSensitiveDataClient.PasskeyWrapData).toEqual(wrapData());
    expect(
      screen.getByRole('button', { name: 'Enable passkey' })
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
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
