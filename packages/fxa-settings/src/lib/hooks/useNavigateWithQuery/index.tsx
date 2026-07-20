/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useNavigate, useLocation } from 'react-router';
import type { NavigateOptions } from 'react-router';
import { useCallback, useRef } from 'react';
import { navigateWithQueryHelper } from '../../utilities';

export function useNavigateWithQuery() {
  const location = useLocation();
  const navigate = useNavigate();

  // Keep refs so the returned callback is stable across renders
  const locationRef = useRef(location);
  locationRef.current = location;
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  return useCallback(
    (to: string, options?: NavigateOptions, includeHash: boolean = true) => {
      return navigateWithQueryHelper(
        locationRef.current,
        navigateRef.current,
        to,
        options,
        includeHash
      );
    },
    []
  );
}
