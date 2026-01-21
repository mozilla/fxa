/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useState } from 'react';
import { useAccount } from '../../../models';
import { TotpInfo } from '../../types';
import { useMfaErrorHandler } from '../../../components/Settings/MfaGuard';

export const useTotpReplace = () => {
  const account = useAccount();
  const handleMfaError = useMfaErrorHandler();

  const [totpInfo, setTotpInfo] = useState<TotpInfo | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        // MfaGuard has already ensured we have a valid JWT for the '2fa' scope.
        // The session.verified check was removed as it's a different concept
        // (email verification) from MFA JWT verification.
        const result = await account.startReplaceTotpWithJwt();
        if (!cancelled) setTotpInfo(result);
      } catch (err) {
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
