/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useRef } from 'react';
import sentryMetrics from 'fxa-shared/lib/sentry';
import { useMutation, DocumentNode, MutationHookOptions } from '@apollo/client';

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

// TODO - Iron out how we want to handle mutation errors (FXA-2450)
// We must have an `onError` option in mutations to allow tests to pass
// but providing one prevents an error from actually throwing so we need
// to manually report it to Sentry.
// See https://github.com/apollographql/react-apollo/issues/2614
export function useHandledMutation(
  mutation: DocumentNode,
  options: MutationHookOptions<any, Record<string, any>> | undefined = {}
) {
  const customOnError = options.onError;
  options.onError = (error) => {
    if (customOnError) {
      try {
        customOnError(error);
      } catch (error) {
        sentryMetrics.captureException(error);
      }
    } else {
      console.error(error);
      sentryMetrics.captureException(error);
    }
  };

  return useMutation(mutation, options);
}
