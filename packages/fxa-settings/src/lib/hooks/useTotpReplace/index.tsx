/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useRef, useState } from 'react';
import { useAccount } from '../../../models';
import { TotpInfo } from '../../types';
import { useMfaErrorHandler } from '../useMfaErrorHandler';

export const useTotpReplace = () => {
  const account = useAccount();
  const handleMfaError = useMfaErrorHandler();

  const [totpInfo, setTotpInfo] = useState<TotpInfo | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Ensure effect re-run cannot issue a second request
  // and silently invalidate the first secret.
  const inflightRef = useRef<Promise<TotpInfo> | null>(null);

  useEffect(() => {
    // User must have existing TOTP to replace it
    if (!account.totp.verified) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchTotp = async () => {
      setError(null);
      try {
        if (!inflightRef.current) {
          inflightRef.current = account.startReplaceTotpWithJwt();
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
  }, [account, handleMfaError]);

  return {
    totpInfo,
    loading,
    error,
  };
};
