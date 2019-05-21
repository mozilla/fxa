import { useCallback, useState, useEffect, useRef, ChangeEvent } from 'react';

export function useVoidCallback(fn: Function): () => void {
  return useCallback(() => void(fn()), [ fn ]);
}

type useBooleanStateResult = [ boolean, (ev: any) => void, (ev: any) => void ];
export function useBooleanState(defaultState: boolean = false): useBooleanStateResult {
  const [ state, setState ] = useState(defaultState);
  const setTrue = useCallback(() => setState(true), [ setState ]);
  const setFalse = useCallback(() => setState(false), [ setState ]);
  return [ state, setTrue, setFalse ];
}

type useCheckboxStateResult = [ boolean, (ev: ChangeEvent<HTMLInputElement>) => void ];
export function useCheckboxState(defaultState: boolean = false): useCheckboxStateResult {
  const [ state, setState ] = useState(false);
  const onChanged = useCallback(ev => setState(ev.target.checked), [ setState ]);
  return [ state, onChanged ];
}

export function useClickOutsideEffect<T>(onClickOutside: Function) {
  const insideEl = useRef<T>(null);

  useEffect(() => {
    const onBodyClick = (ev: MouseEvent) => {
      if (
        insideEl.current instanceof HTMLElement
        && ev.target instanceof HTMLElement
        && ! insideEl.current.contains(ev.target)
      ) {
        onClickOutside();
      }
    };
    document.body.addEventListener('click', onBodyClick);
    return () => document.body.removeEventListener('click', onBodyClick);
  }, [ onClickOutside ]);

  return insideEl;
}