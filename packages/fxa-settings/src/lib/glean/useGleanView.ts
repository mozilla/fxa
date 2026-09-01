/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useRef } from 'react';

/**
 * Records a Glean view event once per mount, or once `enabled` first turns
 * true for views that are gated on something the page has to resolve first.
 *
 * Every event costs two pings, and Glean stops draining its upload queue past
 * 40 pings a minute, so a view event sent twice per mount brings the throttle
 * forward and delays later events.
 */
export function useGleanView(record: () => void, enabled = true) {
  const recorded = useRef(false);

  useEffect(() => {
    if (!enabled || recorded.current) return;
    recorded.current = true;
    record();
    // `record` is re-created each render by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
