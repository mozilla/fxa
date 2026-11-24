/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useRef, useState } from 'react';
import type { DisableMatchingJob } from 'fxa-admin-server/src/types';

export const POLL_MS = 2000;
/** The scan runs on regardless of a failed poll, so one bad response should not end the follow. */
export const MAX_POLL_FAILURES = 3;

const accounts = (n: number) =>
  `${n} matching ${n === 1 ? 'account' : 'accounts'}`;

export function describeJob(job: DisableMatchingJob): string | null {
  switch (job.status) {
    case 'idle':
      return null;
    case 'running': {
      const percent = job.total
        ? Math.floor((job.scanned / job.total) * 100)
        : 0;
      return `Scanning accounts… ${percent}% done, ${accounts(job.disabled)} disabled so far.`;
    }
    case 'failed':
      return `The scan stopped before it finished, after disabling ${accounts(job.disabled)}. Run it again to cover the rest.`;
    case 'done':
      return `Disabled ${accounts(job.disabled)}.`;
  }
}

/**
 * Starts a disable-matching scan and polls it to the end. The server runs the
 * scan in the background, so the request that starts it returns straight away.
 * On load it follows a scan that is already running, e.g. from another tab.
 */
export function useDisableMatching(
  start: (values: string[]) => Promise<DisableMatchingJob>,
  getJob: () => Promise<DisableMatchingJob>
): {
  status: string | null;
  /** true from the start request until the scan ends; the server runs one scan at a time */
  running: boolean;
  disableMatching: (values: string[]) => Promise<void>;
} {
  const [status, setStatus] = useState<string | null>(null);
  /** Kept beside the polled status, which would overwrite it. */
  const [skipped, setSkipped] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const mounted = useRef(true);
  // A ref, not `running`, so two calls in the same render cannot both start.
  const busy = useRef(false);

  const follow = async (first: () => Promise<DisableMatchingJob>) => {
    if (busy.current) {
      return;
    }
    busy.current = true;
    setRunning(true);
    try {
      let job = await first();
      let failures = 0;
      while (job.status === 'running') {
        setStatus(describeJob(job));
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
        if (!mounted.current) {
          return;
        }
        try {
          job = await getJob();
          failures = 0;
        } catch (e) {
          if (++failures === MAX_POLL_FAILURES) {
            throw e;
          }
        }
      }
      setStatus(describeJob(job));
    } catch (e) {
      setStatus(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      busy.current = false;
      if (mounted.current) {
        setRunning(false);
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    getJob()
      .then((job) => {
        if (mounted.current && job.status === 'running') {
          void follow(async () => job);
        }
      })
      // Best effort: the page works without the last scan's status.
      .catch(() => {});
    return () => {
      mounted.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const disableMatching = (values: string[]) => {
    if (busy.current) {
      setSkipped(
        `Not scanned for ${values.join(', ')}: another scan was running. Run it again when this one finishes.`
      );
      return Promise.resolve();
    }
    setStatus(null);
    setSkipped(null);
    return follow(() => start(values));
  };

  return {
    status: [status, skipped].filter(Boolean).join(' ') || null,
    running,
    disableMatching,
  };
}
