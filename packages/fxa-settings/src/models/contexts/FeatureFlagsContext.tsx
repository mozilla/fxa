/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  createAuthServerLoader,
  featureFlag,
  loadFeatureFlags,
} from '@fxa/shared/feature-flags';
import config from '../../lib/config';

export const FeatureFlagsContext = createContext<{ loaded: boolean }>({
  loaded: false,
});

/**
 * Whether a flag is on.
 *
 * Returns false until the flag list arrives, and false forever if the request
 * fails or the provider is absent, so a flag must always gate the new
 * behaviour rather than suppress the existing one.
 */
export function useFeatureFlag(name: string): boolean {
  const { loaded } = useContext(FeatureFlagsContext);
  return loaded && featureFlag(name);
}

/**
 * Fetches the enabled flags once on mount and holds them for the session.
 *
 * Rendering is not blocked on the request: children paint immediately with
 * every flag off and re-render once the list lands. A flag guarding
 * above-the-fold content will therefore pop in.
 */
export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadFeatureFlags(createAuthServerLoader(config.servers.auth.url))
      .then(() => {
        if (active) setLoaded(true);
      })
      .catch(() => {
        // Flags stay off. Nothing here is load-bearing enough to surface.
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ loaded }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}
