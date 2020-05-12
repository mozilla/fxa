/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useState, useEffect, useRef, ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useCallbackOnce(cb: Function, deps: any[]) {
  const called = useRef(false);
  return useCallback(
    () => {
      if (!called.current) {
        cb();
        called.current = true;
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [called, cb, ...deps]
  );
}

type useCheckboxStateResult = [
  boolean,
  (ev: ChangeEvent<HTMLInputElement>) => void
];
export function useCheckboxState(
  defaultState: boolean = false
): useCheckboxStateResult {
  const [state, setState] = useState(defaultState);
  const onChanged = useCallback(ev => setState(ev.target.checked), [setState]);
  return [state, onChanged];
}

export function useNonce(generateNonce = uuidv4): [string, () => void] {
  const [nonce, setNonce] = useState(generateNonce());
  const refreshNonce = () => setNonce(generateNonce());
  return [nonce, refreshNonce];
}

export function useMatchMedia(mediaQuery: string, matchMedia: Function) {
  const [matches, setMatches] = useState(matchMedia(mediaQuery).matches);

  useEffect(() => {
    const updateMatches = (event: { matches: Array<string> }) => {
      setMatches(event.matches);
    };

    const mediaQueryList = matchMedia(mediaQuery);
    setMatches(mediaQueryList.matches);
    mediaQueryList.addListener(updateMatches);

    return () => mediaQueryList.removeListener(updateMatches);
  }, [mediaQuery, matchMedia]);

  return matches;
}
