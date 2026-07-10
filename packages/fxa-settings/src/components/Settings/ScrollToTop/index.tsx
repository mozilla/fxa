/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useLocation } from 'react-router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import React, { useCallback, useLayoutEffect } from 'react';

export const ScrollToTop = ({ children }: React.PropsWithChildren) => {
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation();
  const href = location.pathname + location.search + location.hash;
  const state = location.state as Record<string, any> | null;

  const updateState = useCallback(() => {
    navigateWithQuery(href, {
      state: { ...state, scrolled: true },
      replace: true,
    });
    window.scrollTo(0, 0);
  }, [href, state, navigateWithQuery]);

  useLayoutEffect(() => {
    const hasHash = !!location.hash;

    if (hasHash) {
      const hashTokens = location.hash.split('?');
      const el = document.querySelector(hashTokens[0]);
      if (el) el.scrollIntoView();
    } else if (!hasHash && !state?.scrolled) {
      updateState();
    }
  }, [href, state, updateState, location.hash]);

  return <>{children}</>;
};
