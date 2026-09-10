/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useRef, useState } from 'react';
import { useAuthClient } from '../../../models';
import { createPasskeyWrapFlow } from './creation';
import type {
  CreatePasskeyWrapArgs,
  CreatePasskeyWrapResult,
  PasskeyWrapCreationFailureReason,
  PasskeyWrapFlow,
  UsePasskeyWrapCreationResult,
} from './interfaces';

/**
 * React state around `createPasskeyWrapFlow`. Held envelopes live in the
 * flow's shared store, so a remount picks up where the last instance left off.
 *
 * TODO: FXA-13151 wires the first caller (the passwordless Sync opt-in) and is
 * where the remaining API questions get settled: whether the session token
 * behind proof eviction should be injected rather than read globally, and
 * whether callers read `failure` state or the returned union.
 */
export function usePasskeyWrapCreation(): UsePasskeyWrapCreationResult {
  const authClient = useAuthClient();
  // Created once: `inFlight` is per instance, so a fresh flow on a re-render
  // would forget the call still running.
  const flowRef = useRef<PasskeyWrapFlow | undefined>(undefined);
  if (!flowRef.current) {
    flowRef.current = createPasskeyWrapFlow(authClient);
  }
  const flow = flowRef.current;

  const [isLoading, setIsLoading] = useState(false);
  const [failure, setFailure] = useState<
    PasskeyWrapCreationFailureReason | undefined
  >();

  const createWrap = useCallback(
    async (args: CreatePasskeyWrapArgs): Promise<CreatePasskeyWrapResult> => {
      // Answered by the flow without touching state, which belongs to the
      // call still running.
      if (flow.inFlight) {
        return flow.createWrap(args);
      }
      setFailure(undefined);
      setIsLoading(true);
      try {
        const result = await flow.createWrap(args);
        if (!result.ok) {
          setFailure(result.failure);
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [flow]
  );

  return { createWrap, isLoading, failure };
}
