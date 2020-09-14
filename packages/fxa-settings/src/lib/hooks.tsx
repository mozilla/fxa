/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import {
  useMutation as useApolloMutation,
  DocumentNode,
  MutationHookOptions,
  ApolloError,
} from '@apollo/client';
import sentry from 'fxa-shared/lib/sentry';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { AlertBarType } from '../components/AlertBar';

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

export function useMutation(
  mutation: DocumentNode,
  options: MutationHookOptions<any, Record<string, any>> | undefined = {}
) {
  const { onError } = options;

  options.onError = (error) => {
    console.error(error);

    if (error.networkError) {
      sentry.captureException(error);
    }

    if (onError) {
      try {
        onError(error);
      } catch (error) {
        sentry.captureException(error);
      }
    }
  };

  return useApolloMutation(mutation, options);
}

export function useAlertBar({
  defaultVisible = false,
  defaultType = 'success',
  defaultContent,
}: {
  defaultVisible?: boolean;
  defaultType?: AlertBarType;
  defaultContent?: ReactNode;
} = {}) {
  const [visible, show, hide] = useBooleanState(defaultVisible);
  const [type, setType] = useState<AlertBarType>(defaultType);
  const [content, setContent] = useState<ReactNode | null>(defaultContent);

  const success = useCallback(
    (message: ReactNode) => {
      setContent(message);
      setType('success');
      show();
    },
    [setContent, setType, show]
  );

  const error = useCallback(
    (message: ReactNode, error?: ApolloError) => {
      setContent(error?.graphQLErrors?.length ? error.message : message);
      setType('error');
      show();
    },
    [setContent, setType, show]
  );

  const info = useCallback(
    (message: ReactNode) => {
      setContent(message);
      setType('info');
      show();
    },
    [setContent, setType, show]
  );

  return {
    visible,
    show,
    hide,
    type,
    setType,
    content,
    setContent,
    success,
    error,
    info,
  };
}
