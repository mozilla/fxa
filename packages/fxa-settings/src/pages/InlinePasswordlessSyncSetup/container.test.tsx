/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
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
const mockAuthClient = {};
jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useSensitiveDataClient: () => mockSensitiveDataClient,
  useAuthClient: () => mockAuthClient,
  useAlertBar: () => mockAlertBar,
}));

const mockCreateWrap = jest.fn();
const mockRetryStore = jest.fn();
jest.mock('../../lib/passkeys/wrap/creation', () => ({
  createPasskeyWrap: (...args: unknown[]) => mockCreateWrap(...args),
  retryPasskeyWrapStore: (...args: unknown[]) =>
    mockRetryStore(args[1], args[2]),
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

const render = () =>
  renderWithLocalizationProvider(
    <MemoryRouter initialEntries={['/inline_passwordless_sync_setup']}>
      <Harness />
    </MemoryRouter>
  );

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
  });

  it('continues on "Not now" without storing anything', async () => {
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole('button', { name: 'Not now' }));

    expect(mockCreateWrap).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV);
  });

  it('stores the wrap from the held material and lands in Settings with the banner', async () => {
    const user = userEvent.setup();
    const held = mockSensitiveDataClient.PasskeyWrapData!;
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
    );
    expect(mockAlertBar.success).toHaveBeenCalledWith(
      'This passkey is ready for sync sign-in'
    );
    expect(mockAlertBar.error).not.toHaveBeenCalled();
    expect(mockCreateWrap).toHaveBeenCalledWith(mockAuthClient, {
      credentialId: held.credentialId,
      mfaToken: held.mfaToken,
      sessionToken: 'session-token',
      prfOut: new Uint8Array(32).fill(9),
      kB: new Uint8Array(32).fill(7),
    });
  });

  it('seals over copies, so a clear landing mid-seal cannot zero them', async () => {
    const user = userEvent.setup();
    const held = mockSensitiveDataClient.PasskeyWrapData!;
    let sealed: { prfOut: Uint8Array; kB: Uint8Array } | undefined;
    mockCreateWrap.mockImplementation(
      async (
        _authClient: unknown,
        args: { prfOut: Uint8Array; kB: Uint8Array }
      ) => {
        // Stands in for the route cleanup arriving while sealing awaits
        // key generation, before it has read either buffer.
        mockSensitiveDataClient.clearPasskeyWrapData();
        sealed = { prfOut: args.prfOut, kB: args.kB };
        return { ok: true, created: true };
      }
    );
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    expect(sealed?.prfOut).toEqual(new Uint8Array(32).fill(9));
    expect(sealed?.kB).toEqual(new Uint8Array(32).fill(7));
    expect(held.prfOut).toEqual(new Uint8Array(32));
    expect(held.kB).toEqual(new Uint8Array(32));
  });

  const serverError = (errno: number) =>
    Object.assign(new Error('nope'), { errno });
  const GENERIC =
    'Something went wrong, you’ll still need to enter your password next time';

  it.each<[string, Record<string, unknown>, string]>([
    ['prf_unsupported', { failure: 'prf_unsupported' }, GENERIC],
    ['platform_crypto', { failure: 'platform_crypto' }, GENERIC],
    ['proof_malformed', { failure: 'proof_malformed' }, GENERIC],
    ['key_unusable', { failure: 'key_unusable' }, GENERIC],
    [
      'passkey_not_found',
      { error: serverError(ERRNO.PASSKEY_NOT_FOUND) },
      GENERIC,
    ],
    [
      'feature_not_enabled',
      { error: serverError(ERRNO.FEATURE_NOT_ENABLED) },
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
        expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
      );
      expect(mockAlertBar.error).toHaveBeenCalledWith(copy);
      expect(mockAlertBar.success).not.toHaveBeenCalled();
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
    // The route cleanup lands once /settings commits, with this page still
    // mounted behind the Suspense fallback.
    mockSensitiveDataClient.clearPasskeyWrapData();
    await user.click(screen.getByRole('button', { name: 're-render' }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('seals once when two clicks land in the same tick, before the button disables', async () => {
    mockCreateWrap.mockResolvedValue({ ok: true, created: true });
    render();
    const button = screen.getByRole('button', { name: 'Enable passkey' });

    // Raw clicks inside one act(): fireEvent/userEvent each flush a render
    // between them, which disables the button and hides the guard.
    await act(async () => {
      button.click();
      button.click();
    });

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
    );
    expect(mockCreateWrap).toHaveBeenCalledTimes(1);
  });

  it('continues to Settings with the generic copy when the wrap call throws', async () => {
    const user = userEvent.setup();
    const thrown = Object.assign(new Error('boom'), { errno: 999 });
    mockCreateWrap.mockRejectedValue(thrown);
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
    );
    expect(mockAlertBar.error).toHaveBeenCalledWith(GENERIC);
    // Scrubbed: a backend error body may carry identifiers.
    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('passkey-wrap-store error'),
      { tags: { errno: '999' } }
    );
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
  });

  it('shows the loading state while the wrap is being stored', async () => {
    const user = userEvent.setup();
    mockCreateWrap.mockReturnValue(new Promise(() => {}));
    render();

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    expect(screen.getByRole('button', { name: 'Enabling…' })).toBeDisabled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  describe('dismissed confirmation prompt', () => {
    const envelope = {
      pkR: Uint8Array.of(1),
      prfWrappedSkR: Uint8Array.of(2),
      keyWrapIv: Uint8Array.of(3),
      hpkeEncapsulatedSecret: Uint8Array.of(4),
      hpkeSealedKb: Uint8Array.of(5),
    };
    const dismiss = () =>
      mockCreateWrap.mockResolvedValue({
        ok: false,
        retryable: true,
        envelope,
      });
    const clickEnable = (user: ReturnType<typeof userEvent.setup>) =>
      user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    it('keeps the offer up with a banner instead of leaving', async () => {
      const user = userEvent.setup();
      dismiss();
      render();

      await clickEnable(user);

      expect(
        await screen.findByText('Passkey confirmation didn’t finish')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Confirm with your passkey to skip the password next time.'
        )
      ).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockAlertBar.error).not.toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: 'Enable passkey' })
      ).toBeEnabled();
    });

    it('keeps a rate-limited attempt on the page, wearing the throttle message', async () => {
      const user = userEvent.setup();
      mockCreateWrap.mockResolvedValue({
        ok: false,
        retryable: true,
        envelope,
        error: Object.assign(new Error('nope'), { errno: ERRNO.THROTTLED }),
      });
      render();

      await clickEnable(user);

      expect(
        await screen.findByText(
          'You’ve tried too many times. Please try again later.'
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Passkey confirmation didn’t finish')
      ).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockAlertBar.error).not.toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: 'Enable passkey' })
      ).toBeEnabled();
    });

    it('zeroes the key material the envelope was sealed from', async () => {
      const user = userEvent.setup();
      dismiss();
      const held = mockSensitiveDataClient.PasskeyWrapData!;
      render();

      await clickEnable(user);
      await screen.findByText('Passkey confirmation didn’t finish');

      expect(held.kB).toEqual(new Uint8Array(32));
      expect(held.prfOut).toEqual(new Uint8Array(32));
    });

    it('holds the banner when the retry prompt is dismissed again', async () => {
      const user = userEvent.setup();
      dismiss();
      mockRetryStore.mockResolvedValue({
        ok: false,
        retryable: true,
        envelope,
      });
      render();

      await clickEnable(user);
      await screen.findByText('Passkey confirmation didn’t finish');
      await clickEnable(user);

      expect(mockRetryStore).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText('Passkey confirmation didn’t finish')
      ).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: 'Enable passkey' })
      ).toBeEnabled();
    });

    it('resubmits the sealed envelope rather than resealing', async () => {
      const user = userEvent.setup();
      dismiss();
      mockRetryStore.mockResolvedValue({ ok: true, created: true });
      const held = mockSensitiveDataClient.PasskeyWrapData!;
      render();

      await clickEnable(user);
      await screen.findByText('Passkey confirmation didn’t finish');
      await clickEnable(user);

      expect(mockRetryStore).toHaveBeenCalledWith(
        { credentialId: held.credentialId, sessionToken: 'session-token' },
        envelope
      );
      expect(mockCreateWrap).toHaveBeenCalledTimes(1);
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
      );
      expect(mockAlertBar.success).toHaveBeenCalled();
    });

    it('carries the failure copy to Settings when the retry fails outright', async () => {
      const user = userEvent.setup();
      dismiss();
      mockRetryStore.mockResolvedValue({
        ok: false,
        error: serverError(ERRNO.PASSKEY_NOT_FOUND),
      });
      render();

      await clickEnable(user);
      await screen.findByText('Passkey confirmation didn’t finish');
      await clickEnable(user);

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(...SETTINGS_NAV)
      );
      expect(mockAlertBar.error).toHaveBeenCalledWith(GENERIC);
    });
  });
});
