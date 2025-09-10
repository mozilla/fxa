/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useState } from 'react';
import { useAccount, useSession } from '../../../models';
import { TotpInfo } from '../../types';

export const useTotpSetup = () => {
  const account = useAccount();
  const session = useSession();

  const [totpInfo, setTotpInfo] = useState<TotpInfo | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!session.verified) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchTotp = async () => {
      setError(null);
      try {
        const result = await account.createTotp();
        if (!cancelled) setTotpInfo(result);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTotp();

    return () => {
      cancelled = true;
    };
  }, [account, session.verified]);

  return {
    totpInfo,
    loading,
    error,
  };
};
