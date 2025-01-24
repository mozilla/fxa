/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { useEffect, useRef } from 'react';

export function useClickOutsideEffect<T>(
  onClickOutside: (...args: any[]) => void
) {
  const insideEl = useRef<T>(null);

  useEffect(() => {
    const onBodyClick = (ev: MouseEvent) => {
      if (
        insideEl.current instanceof HTMLElement &&
        ev.target instanceof HTMLElement &&
        !insideEl.current.contains(ev.target)
      ) {
        onClickOutside();
      }
    };
    document.body.addEventListener('click', onBodyClick);
    return () => document.body?.removeEventListener('click', onBodyClick);
  }, [onClickOutside]);

  return insideEl;
}
