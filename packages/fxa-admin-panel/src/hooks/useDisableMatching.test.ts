/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, renderHook } from '@testing-library/react';
import type { DisableMatchingJob } from 'fxa-admin-server/src/types';
import {
  describeJob,
  MAX_POLL_FAILURES,
  POLL_MS,
  useDisableMatching,
} from './useDisableMatching';

const job = (overrides: Partial<DisableMatchingJob>): DisableMatchingJob => ({
  status: 'running',
  scanned: 0,
  total: 0,
  disabled: 0,
  ...overrides,
});

describe('describeJob', () => {
  it('has no description when there is no recent scan', () => {
    expect(describeJob(job({ status: 'idle' }))).toBeNull();
  });

  it.each([
    {
      name: 'a scan that has not reported progress yet',
      input: job({}),
      expected:
        'Scanning accounts… 0% done, 0 matching accounts disabled so far.',
    },
    {
      name: 'a scan in progress, rounding the percentage down',
      input: job({ scanned: 2_999, total: 3_000, disabled: 1 }),
      expected:
        'Scanning accounts… 99% done, 1 matching account disabled so far.',
    },
    {
      name: 'a finished scan that disabled one account',
      input: job({ status: 'done', disabled: 1 }),
      expected: 'Disabled 1 matching account.',
    },
    {
      name: 'a finished scan that disabled several accounts',
      input: job({ status: 'done', disabled: 3 }),
      expected: 'Disabled 3 matching accounts.',
    },
    {
      name: 'a scan that stopped early',
      input: job({ status: 'failed', disabled: 2 }),
      expected:
        'The scan stopped before it finished, after disabling 2 matching accounts. Run it again to cover the rest.',
    },
  ])('describes $name', ({ input, expected }) => {
    expect(describeJob(input)).toBe(expected);
  });
});

describe('useDisableMatching', () => {
  let start: jest.MockedFunction<Parameters<typeof useDisableMatching>[0]>;
  let getJob: jest.MockedFunction<Parameters<typeof useDisableMatching>[1]>;

  const poll = () =>
    act(async () => {
      jest.advanceTimersByTime(POLL_MS);
    });
  // Lets the promises that are already resolved run their continuations.
  const settle = () => act(async () => {});

  beforeEach(() => {
    jest.useFakeTimers();
    start = jest.fn();
    // The first call is the on-mount check for a scan that is already running.
    getJob = jest.fn().mockResolvedValueOnce(job({ status: 'idle' }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('has no status when no scan is running on mount', async () => {
    const { result } = renderHook(() => useDisableMatching(start, getJob));
    await settle();

    expect(getJob).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBeNull();
    expect(result.current.running).toBe(false);
  });

  it('follows a scan that is already running on mount', async () => {
    getJob = jest
      .fn()
      .mockResolvedValueOnce(job({ scanned: 1, total: 4 }))
      .mockResolvedValueOnce(job({ status: 'done', disabled: 2 }));
    const { result } = renderHook(() => useDisableMatching(start, getJob));
    await settle();
    expect(result.current.running).toBe(true);
    expect(result.current.status).toBe(
      'Scanning accounts… 25% done, 0 matching accounts disabled so far.'
    );

    await poll();

    expect(result.current.status).toBe('Disabled 2 matching accounts.');
    expect(result.current.running).toBe(false);
  });

  it('ignores a failure of the on-mount check', async () => {
    getJob = jest.fn().mockRejectedValueOnce(new Error('API error 502'));
    const { result } = renderHook(() => useDisableMatching(start, getJob));
    await settle();

    expect(result.current.status).toBeNull();
    expect(result.current.running).toBe(false);
  });

  it('ignores a start while it follows a scan found on mount', async () => {
    getJob = jest.fn().mockResolvedValue(job({}));
    const { result } = renderHook(() => useDisableMatching(start, getJob));
    await settle();

    await act(() => result.current.disableMatching(['evil.com']));

    expect(start).not.toHaveBeenCalled();
  });

  it('ignores a second start while the first scan runs', async () => {
    start.mockResolvedValue(job({}));
    const { result } = renderHook(() => useDisableMatching(start, getJob));
    await settle();

    act(() => {
      void result.current.disableMatching(['evil.com']);
    });
    await act(() => result.current.disableMatching(['spam.net']));

    expect(start).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledWith(['evil.com']);
  });

  it('reports a start it skipped beside the running status', async () => {
    getJob = jest.fn().mockResolvedValue(job({}));
    const { result } = renderHook(() => useDisableMatching(start, getJob));
    await settle();

    await act(() => result.current.disableMatching(['spam.net']));

    expect(result.current.status).toContain(
      'Not scanned for spam.net: another scan was running.'
    );
    expect(result.current.status).toContain('Scanning accounts…');
  });

  it('shows the result without polling when the job is already done', async () => {
    start.mockResolvedValue(job({ status: 'done', disabled: 3 }));
    const { result } = renderHook(() => useDisableMatching(start, getJob));

    await act(() => result.current.disableMatching(['evil.com']));

    expect(start).toHaveBeenCalledWith(['evil.com']);
    expect(result.current.status).toBe('Disabled 3 matching accounts.');
    expect(getJob).toHaveBeenCalledTimes(1);
  });

  it('polls a running job every two seconds until it is done', async () => {
    start.mockResolvedValue(
      job({ scanned: 5_000, total: 10_000, disabled: 1 })
    );
    getJob
      .mockResolvedValueOnce(
        job({ scanned: 9_000, total: 10_000, disabled: 2 })
      )
      .mockResolvedValueOnce(job({ status: 'done', disabled: 2 }));
    const { result } = renderHook(() => useDisableMatching(start, getJob));

    act(() => {
      void result.current.disableMatching(['evil.com']);
    });
    await settle();
    expect(result.current.status).toBe(
      'Scanning accounts… 50% done, 1 matching account disabled so far.'
    );

    await poll();
    expect(result.current.status).toBe(
      'Scanning accounts… 90% done, 2 matching accounts disabled so far.'
    );

    await poll();
    expect(result.current.status).toBe('Disabled 2 matching accounts.');
    expect(getJob).toHaveBeenCalledTimes(3);
  });

  it('shows a scan that failed', async () => {
    start.mockResolvedValue(job({}));
    getJob.mockResolvedValue(job({ status: 'failed', disabled: 4 }));
    const { result } = renderHook(() => useDisableMatching(start, getJob));

    act(() => {
      void result.current.disableMatching(['evil.com']);
    });
    await settle();
    await poll();

    expect(result.current.status).toBe(
      'The scan stopped before it finished, after disabling 4 matching accounts. Run it again to cover the rest.'
    );
  });

  it('shows the error when the scan cannot start', async () => {
    start.mockRejectedValue(new Error('API error 409'));
    const { result } = renderHook(() => useDisableMatching(start, getJob));

    await act(() => result.current.disableMatching(['evil.com']));

    expect(result.current.status).toBe('Error: API error 409');
  });

  it('keeps following the scan after a failed status poll', async () => {
    start.mockResolvedValue(job({}));
    getJob
      .mockRejectedValueOnce(new Error('API error 502'))
      .mockRejectedValueOnce(new Error('API error 502'))
      .mockResolvedValueOnce(job({ status: 'done', disabled: 1 }));
    const { result } = renderHook(() => useDisableMatching(start, getJob));

    act(() => {
      void result.current.disableMatching(['evil.com']);
    });
    await settle();
    await poll();
    await poll();
    expect(result.current.status).toBe(
      'Scanning accounts… 0% done, 0 matching accounts disabled so far.'
    );

    await poll();
    expect(result.current.status).toBe('Disabled 1 matching account.');
  });

  it('shows the error after MAX_POLL_FAILURES failed status polls in a row', async () => {
    start.mockResolvedValue(job({}));
    getJob.mockRejectedValue(new Error('API error 502'));
    const { result } = renderHook(() => useDisableMatching(start, getJob));

    act(() => {
      void result.current.disableMatching(['evil.com']);
    });
    await settle();
    for (let i = 0; i < MAX_POLL_FAILURES; i++) {
      await poll();
    }

    expect(result.current.status).toBe('Error: API error 502');
    expect(result.current.running).toBe(false);
    // One on-mount check, then the failed polls.
    expect(getJob).toHaveBeenCalledTimes(1 + MAX_POLL_FAILURES);
  });

  it('reports running from the start request until the scan ends', async () => {
    start.mockResolvedValue(job({}));
    getJob.mockResolvedValue(job({ status: 'done' }));
    const { result } = renderHook(() => useDisableMatching(start, getJob));
    expect(result.current.running).toBe(false);

    act(() => {
      void result.current.disableMatching(['evil.com']);
    });
    expect(result.current.running).toBe(true);
    await settle();
    await poll();

    expect(result.current.running).toBe(false);
  });

  it('stops reporting running when the scan cannot start', async () => {
    start.mockRejectedValue(new Error('API error 409'));
    const { result } = renderHook(() => useDisableMatching(start, getJob));

    await act(() => result.current.disableMatching(['evil.com']));

    expect(result.current.running).toBe(false);
  });

  it('stops polling once the page is gone', async () => {
    start.mockResolvedValue(job({}));
    const { result, unmount } = renderHook(() =>
      useDisableMatching(start, getJob)
    );

    act(() => {
      void result.current.disableMatching(['evil.com']);
    });
    await settle();
    unmount();
    await poll();

    // Only the on-mount check.
    expect(getJob).toHaveBeenCalledTimes(1);
  });
});
