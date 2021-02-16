/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// See https://github.com/reach/router/issues/242 for a dicussion

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import React, { useCallback, useLayoutEffect } from 'react';

export const ScrollToTop = (
  props: React.PropsWithChildren<RouteComponentProps>
) => {
  const navigate = useNavigate();
  const { href, state } = useLocation();

  const updateState = useCallback(async () => {
    await navigate(href, {
      state: { ...(state as any), scrolled: true },
      replace: true,
    });
    window.scrollTo(0, 0);
  }, [href, state, navigate]);

  useLayoutEffect(() => {
    // If there's a hash, let the browser scroll to the id.
    const url = new URL(href);
    const hasHash = !!url.hash;

    if (
      !hasHash &&
      !(state as typeof state & { scrolled?: boolean })?.scrolled
    ) {
      updateState();
    }
  }, [href, state, updateState]);

  return <>{props.children}</>;
};
