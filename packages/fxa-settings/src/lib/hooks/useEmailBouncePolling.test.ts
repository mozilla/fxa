/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, renderHook } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import {
  POLL_INTERVAL,
  POLL_TIMEOUT,
  useEmailBouncePolling,
} from './useEmailBouncePolling';

const EMAIL = 'test@example.com';
const OTHER_EMAIL = 'other@example.com';
// The initial check plus one per tick until the deadline. Pinned rather than
// derived, so a schedule change has to face the server's budget of 100
// requests per IP per 15 minutes.
const EXPECTED_POLL_COUNT = 60;

describe('useEmailBouncePolling', () => {
  let emailBounceStatus: jest.Mock;
  let authClient: AuthClient;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    emailBounceStatus = jest.fn().mockResolvedValue({ hasHardBounce: false });
    authClient = { emailBounceStatus } as unknown as AuthClient;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Fake timers do not settle promises, so each advance runs inside act() to
  // let the pending requests resolve. Pass 0 to only settle.
  async function advanceTimers(ms: number) {
    await act(async () => {
      jest.advanceTimersByTime(ms);
    });
  }

  function callsFor(email: string) {
    return emailBounceStatus.mock.calls.filter(([arg]) => arg === email).length;
  }

  function render(email: string | undefined) {
    return renderHook(
      ({ email }: { email: string | undefined }) =>
        useEmailBouncePolling(email, authClient),
      { initialProps: { email } }
    );
  }

  it('does not poll without an email', async () => {
    render(undefined);
    await advanceTimers(POLL_TIMEOUT);
    expect(emailBounceStatus).not.toHaveBeenCalled();
  });

  it('stops polling once the timeout has elapsed', async () => {
    render(EMAIL);
    await advanceTimers(POLL_TIMEOUT);
    expect(emailBounceStatus).toHaveBeenCalledTimes(EXPECTED_POLL_COUNT);

    await advanceTimers(POLL_TIMEOUT);
    expect(emailBounceStatus).toHaveBeenCalledTimes(EXPECTED_POLL_COUNT);
  });

  it('stops on elapsed time rather than on a tick count', async () => {
    render(EMAIL);
    await advanceTimers(0);

    // A backgrounded tab throttles the interval, so the clock passes the
    // deadline after far fewer than EXPECTED_POLL_COUNT ticks.
    jest.setSystemTime(Date.now() + POLL_TIMEOUT);
    await advanceTimers(POLL_INTERVAL * 2);
    expect(emailBounceStatus).toHaveBeenCalledTimes(1);
  });

  it.each([
    { code: 429, errno: 114 },
    { code: 500, errno: 999 },
  ])('stops polling when the request fails with a $code', async (error) => {
    emailBounceStatus.mockRejectedValue(error);
    render(EMAIL);
    await advanceTimers(0);

    await advanceTimers(POLL_INTERVAL * 3);
    expect(emailBounceStatus).toHaveBeenCalledTimes(1);
  });

  it('keeps polling when the request fails without a status code', async () => {
    emailBounceStatus.mockRejectedValue(new Error('Network error'));
    render(EMAIL);
    await advanceTimers(0);

    await advanceTimers(POLL_INTERVAL * 3);
    expect(emailBounceStatus).toHaveBeenCalledTimes(4);
  });

  it('reports and stops polling once a hard bounce is found', async () => {
    emailBounceStatus.mockResolvedValue({ hasHardBounce: true });
    const { result } = render(EMAIL);
    await advanceTimers(0);

    expect(result.current).toBe(true);
    await advanceTimers(POLL_INTERVAL * 3);
    expect(emailBounceStatus).toHaveBeenCalledTimes(1);
  });

  it('keeps polling when a stale check from an earlier email fails', async () => {
    let rejectStale!: (error: unknown) => void;
    emailBounceStatus.mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectStale = reject;
      })
    );
    const { rerender } = render(EMAIL);
    await advanceTimers(0);
    rerender({ email: OTHER_EMAIL });

    // The 4xx belongs to the run that just ended, so it must not stop this one.
    await act(async () => {
      rejectStale({ code: 429, errno: 114 });
    });
    await advanceTimers(POLL_INTERVAL * 2);

    expect(callsFor(OTHER_EMAIL)).toBe(3);
  });

  it('stops reporting a bounce once the email changes', async () => {
    emailBounceStatus.mockResolvedValue({ hasHardBounce: true });
    const { result, rerender } = render(EMAIL);
    await advanceTimers(0);
    expect(result.current).toBe(true);

    rerender({ email: OTHER_EMAIL });
    expect(result.current).toBe(false);
  });

  it('ignores a bounce that resolves after the email changed', async () => {
    let resolveStale!: (result: { hasHardBounce: boolean }) => void;
    emailBounceStatus.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveStale = resolve;
      })
    );
    const { result, rerender } = render(EMAIL);
    rerender({ email: OTHER_EMAIL });

    // The first email's check lands after the hook moved on to the second.
    await act(async () => {
      resolveStale({ hasHardBounce: true });
    });
    expect(result.current).toBe(false);
  });
});
