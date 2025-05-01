/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// See https://github.com/reach/router/issues/242 for a discussion

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import React, { useCallback, useLayoutEffect } from 'react';

export const ScrollToTop = (
  props: React.PropsWithChildren<RouteComponentProps>
) => {
  const navigateWithQuery = useNavigateWithQuery();
  const { href, state } = useLocation();

  const updateState = useCallback(async () => {
    await navigateWithQuery(href, {
      state: { ...(state as any), scrolled: true },
      replace: true,
    });
    window.scrollTo(0, 0);
  }, [href, state, navigateWithQuery]);

  useLayoutEffect(() => {
    // If there's a hash, let the browser scroll to the id.
    const url = new URL(href);
    const hasHash = !!url.hash;

    // Hack alert: if the URL contains a hash, we have to manually navigate
    // to it, because reach router can't handle hashes (see reach router
    // issue 32) 🙄
    if (hasHash) {
      const hashTokens = url.hash.split('?');
      const el = document.querySelector(hashTokens[0]);
      if (el) el.scrollIntoView();
    } else if (
      !hasHash &&
      !(state as typeof state & { scrolled?: boolean })?.scrolled
    ) {
      updateState();
    }
  }, [href, state, updateState]);

  return <>{props.children}</>;
};
