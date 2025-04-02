/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useRef } from 'react';
import { useConfig } from '../models';

// Focus on the element that triggered some action after the first
// argument changes from `false` to `true` unless a `triggerException`
// is also provided.
export function useFocusOnTriggeringElementOnClose(
  revealed: boolean | undefined,
  triggerElement: React.RefObject<HTMLButtonElement>,
  triggerException?: boolean
) {
  const prevRevealedRef = useRef(revealed);
  const prevRevealed = prevRevealedRef.current;

  useEffect(() => {
    if (revealed !== undefined) {
      prevRevealedRef.current = revealed;
    }
    if (
      triggerElement.current &&
      prevRevealed === true &&
      revealed === false &&
      !triggerException
    ) {
      triggerElement.current.focus();
    }
  }, [revealed, triggerElement, prevRevealed, triggerException]);
}

// Run a function on 'Escape' keydown.
export function useEscKeydownEffect(onEscKeydown: Function) {
  useEffect(() => {
    const handler = ({ key }: KeyboardEvent) => {
      if (key === 'Escape') {
        onEscKeydown();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onEscKeydown]);
}

// Direct focus to this element on first render for tabbing or screenreaders.
export function useChangeFocusEffect() {
  const elToFocus = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elToFocus.current) {
      elToFocus.current.focus();
    }
  }, []);

  return elToFocus;
}

/*
 * Temporary helper to check that emailFirstRoutes feature flag is on
 * and (if not 100% rolled out) that the user is in the React experiment.
 */
export function useCheckReactEmailFirst() {
  const config = useConfig();
  return config.showReactApp.emailFirstRoutes === true;
}
