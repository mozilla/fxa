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

export function describeJob(job: DisableMatchingJob): string {
  switch (job.status) {
    case 'running': {
      const percent = job.total
        ? Math.floor((job.scanned / job.total) * 100)
        : 0;
      return `Scanning accounts… ${percent}% done, ${accounts(job.disabled)} disabled so far.`;
    }
    case 'failed':
      return `The scan stopped before it finished, after disabling ${accounts(job.disabled)}. Run it again to cover the rest.`;
    case 'done':
      return job.errors
        ? `Disabled ${accounts(job.disabled)}. ${job.errors} more could not be disabled; run it again to retry.`
        : `Disabled ${accounts(job.disabled)}.`;
  }
}

/**
 * Starts a disable-matching scan and polls it to the end. The server runs the
 * scan in the background, so the request that starts it returns straight away.
 */
export function useDisableMatching(
  start: (values: string[]) => Promise<DisableMatchingJob>,
  getJob: (id: string) => Promise<DisableMatchingJob>
): {
  status: string | null;
  /** true from the start request until the scan ends; the server runs one scan at a time */
  running: boolean;
  disableMatching: (values: string[]) => Promise<void>;
} {
  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const disableMatching = async (values: string[]) => {
    setStatus(null);
    setRunning(true);
    try {
      let job = await start(values);
      let failures = 0;
      while (job.status === 'running') {
        setStatus(describeJob(job));
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
        if (!mounted.current) {
          return;
        }
        try {
          job = await getJob(job.id);
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
      setRunning(false);
    }
  };

  return { status, running, disableMatching };
}
