/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createContext, useContext } from 'react';
import { useAsync } from 'react-async-hook';
import { useAccount, useSession } from '../../../models';
import { TotpInfo } from '../../types';

export const TotpSetupContext = createContext<
  | {
      totpInfo: TotpInfo;
      loading: boolean;
      error: Error | null;
    }
  | undefined
>(undefined);

export const useTotpSetup = () => {
  const account = useAccount();
  const session = useSession();

  const { result, loading, error } = useAsync(async () => {
    if (session.verified) {
      // recovery codes are not created by default
      return await account.createTotp(true);
    }
    return undefined;
  }, [account, session.verified]);

  const mock = useContext(TotpSetupContext);
  if (mock) return mock;

  return {
    totpInfo: result,
    loading,
    error,
  };
};
