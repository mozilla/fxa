/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, renderHook } from '@testing-library/react';
import * as Sentry from '@sentry/browser';
import { getDefault } from '../../lib/config';
import { navigateWithQuery } from '../../lib/utilities';
import { usePairingIdleTimeout } from './usePairingIdleTimeout';

jest.mock('../../lib/utilities', () => ({
  ...jest.requireActual('../../lib/utilities'),
  navigateWithQuery: jest.fn(),
}));

const TIMEOUT_PATH = '/pair/supplicant/timeout_and_cancel';
const TIMEOUT_MS = getDefault().pairing.qrTimeoutMinutes * 60 * 1000;

describe('usePairingIdleTimeout', () => {
  let integration: { destroy: jest.Mock<Promise<void>, []> };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    integration = { destroy: jest.fn().mockResolvedValue(undefined) };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const advance = (ms: number) => act(() => jest.advanceTimersByTimeAsync(ms));

  it('does nothing before the timeout', async () => {
    renderHook(() => usePairingIdleTimeout(integration, TIMEOUT_PATH));

    await advance(TIMEOUT_MS - 1);

    expect(integration.destroy).not.toHaveBeenCalled();
    expect(navigateWithQuery).not.toHaveBeenCalled();
  });

  it('closes the channel once the page has idled for the timeout', async () => {
    renderHook(() => usePairingIdleTimeout(integration, TIMEOUT_PATH));

    await advance(TIMEOUT_MS);

    expect(integration.destroy).toHaveBeenCalledTimes(1);
  });

  it('leaves for the timeout screen with the timeout reason', async () => {
    renderHook(() => usePairingIdleTimeout(integration, TIMEOUT_PATH));

    await advance(TIMEOUT_MS);

    expect(navigateWithQuery).toHaveBeenCalledWith(
      TIMEOUT_PATH,
      { state: { reason: 'timeout' } },
      true
    );
  });

  it('still leaves when the channel cannot be closed', async () => {
    const captureException = jest
      .spyOn(Sentry, 'captureException')
      .mockImplementation(() => '');
    const err = new Error('channel already gone');
    integration.destroy.mockRejectedValue(err);
    renderHook(() => usePairingIdleTimeout(integration, TIMEOUT_PATH));

    await advance(TIMEOUT_MS);

    expect(captureException).toHaveBeenCalledWith(err);
    expect(navigateWithQuery).toHaveBeenCalledWith(
      TIMEOUT_PATH,
      { state: { reason: 'timeout' } },
      true
    );
  });

  it('does not fire after the page is left', async () => {
    const { unmount } = renderHook(() =>
      usePairingIdleTimeout(integration, TIMEOUT_PATH)
    );

    unmount();
    await advance(TIMEOUT_MS);

    expect(integration.destroy).not.toHaveBeenCalled();
    expect(navigateWithQuery).not.toHaveBeenCalled();
  });
});
