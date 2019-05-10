import { useCallback, useState, ChangeEvent } from 'react';

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
