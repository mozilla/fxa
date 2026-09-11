/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useState } from 'react';
import { useAuthClient } from '../../../models';
import {
  createPasskeyWrap,
  type CreatePasskeyWrapArgs,
  type CreatePasskeyWrapResult,
} from './creation';

/**
 * `createPasskeyWrap` with a loading flag. The result comes back from the
 * promise; TODO: FXA-13151 wires the first caller and decides whether any of
 * it also needs to be state.
 */
export function usePasskeyWrapCreation() {
  const authClient = useAuthClient();
  const [isLoading, setIsLoading] = useState(false);

  const createWrap = useCallback(
    async (args: CreatePasskeyWrapArgs): Promise<CreatePasskeyWrapResult> => {
      setIsLoading(true);
      try {
        return await createPasskeyWrap(authClient, args);
      } finally {
        setIsLoading(false);
      }
    },
    [authClient]
  );

  return { createWrap, isLoading };
}
