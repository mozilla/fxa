/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState, useEffect, useRef } from 'react';
import { sessionToken } from '../../cache';
import { useAuthClient } from '../../../models';

const featureEligibilityCache = new Map<string, boolean>();

/**
 * Checks if a feature is available based on user location.
 * @param feature The feature that we are checking
 * @returns { eligible:boolean }
 */
export function useGeoEligibilityCheck(feature: string): {
  eligible: boolean;
  loading: boolean;
} {
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const authClient = useAuthClient();
  const hasChecked = useRef<string | null>(null);

  useEffect(() => {
    if (featureEligibilityCache.has(feature)) {
      setEligible(featureEligibilityCache.get(feature)!);
      setLoading(false);
      return;
    }

    if (hasChecked.current !== feature) {
      hasChecked.current = feature;

      authClient
        .geoEligibilityCheck(sessionToken()!, feature)
        .then(({ eligible }) => {
          featureEligibilityCache.set(feature, eligible);
          setEligible(eligible);
        })
        .catch((err) => {
          console.error('geoEligibilityCheck failed', err);
          setEligible(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [feature, authClient]);

  return { eligible, loading };
}
