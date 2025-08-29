/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState, useEffect, useRef } from 'react';
import { accountCache } from '../../cache';
import { useAuthClient } from '../../../models';

const featureEligibilityCache = new Map<string, boolean>();

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
      setEligible(featureEligibilityCache.get(feature) || false);
      setLoading(false);
      return;
    }

    if (hasChecked.current !== feature) {
      hasChecked.current = feature;

      authClient
        .geoEligibilityCheck(
          accountCache.getCurrentAccount()?.sessionToken || '',
          feature
        )
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
