/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useRef, useState } from 'react';
import { useAccount } from '../../../models';
import { TotpInfo } from '../../types';
import { useMfaErrorHandler } from '../useMfaErrorHandler';

export const useTotpSetup = () => {
  const account = useAccount();
  const handleMfaError = useMfaErrorHandler();

  const [totpInfo, setTotpInfo] = useState<TotpInfo | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Deduplicate the API call across React strict-mode double-fires.
  // createTotpWithJwt is a server-side mutation — a second call creates a
  // NEW token, silently invalidating the first. The ref stores the in-flight
  // promise so both effect runs share one API call.
  const inflightRef = useRef<Promise<TotpInfo> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchTotp = async () => {
      setError(null);
      try {
        if (!inflightRef.current) {
          inflightRef.current = account.createTotpWithJwt();
        }
        const result = await inflightRef.current;
        if (!cancelled) setTotpInfo(result);
      } catch (err) {
        inflightRef.current = null; // allow retry on remount
        const errorHandled = handleMfaError(err);
        if (errorHandled) {
          return;
        }
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTotp();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    totpInfo,
    loading,
    error,
  };
};
