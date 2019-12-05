import { useCallback, useState, useEffect, useRef, ChangeEvent } from 'react';

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

type useBooleanStateResult = [boolean, () => void, () => void];
export function useBooleanState(
  defaultState: boolean = false
): useBooleanStateResult {
  const [state, setState] = useState(defaultState);
  const setTrue = useCallback(() => setState(true), [setState]);
  const setFalse = useCallback(() => setState(false), [setState]);
  return [state, setTrue, setFalse];
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

/**
 * Effect hook to react to clicks outside of a given DOM node.
 *
 * @param onClickOutside {Function} a function to be called when a click occurs outside the given node
 * @return {React.RefObject} when used as a ref prop, the given node and children are considered inside
 * @example
 *   // This function will be called for clicks on elements outside of dialogInsideRef
 *   const onClickoutside => () => window.alert("Clicked outside!")
 *   const dialogInsideRef = useClickOutsideEffect<HTMLDivElement>(onClickOutside);
 *   return (
 *     <div ref={dialogInsideRef}>
 *       <p>Some dialog message</p>
 *     </div>
 *   );
 */
export function useClickOutsideEffect<T>(onClickOutside: Function) {
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
    return () => document.body.removeEventListener('click', onBodyClick);
  }, [onClickOutside]);

  return insideEl;
}

export type PromiseStateInitial = {
  pending: undefined;
  error: undefined;
  result: undefined;
};

export type PromiseStatePending = {
  pending: true;
  error: undefined;
  result: undefined;
};

export type PromiseStateRejected<E> = {
  pending: false;
  error: E;
  result: undefined;
};

export type PromiseStateResolved<T> = {
  pending: false;
  error: undefined;
  result: T;
};

export type PromiseState<T = any, E = any> =
  | PromiseStateInitial
  | PromiseStatePending
  | PromiseStateRejected<E>
  | PromiseStateResolved<T>;

export const initialPromiseState = () => ({
  pending: undefined,
  error: undefined,
  result: undefined,
});

/**
 * Hook which helps manage tracking a pending promise through to resolved
 * success or rejected error states. Supports multiple executions / retries.
 *
 * @param factory {Function} function that should return a promise
 * @param executeImmediately when true, the factory function will be called immediately
 * @return [ { pending, error, result }, execute, reset ]
 * @example
 * const [thingState, thingExecute, thingReset] = usePromise<string, string>(
 *   async (doError = false) => {
 *     await wait(1000);
 *     if (doError) {
 *       throw 'ERROR';
 *     }
 *     return 'SUCCESS';
 *   },
 *   true
 * );
 */
export function useAwait<
  TFactoryArgs extends Array<any>,
  TResult = any,
  TError = any
>(
  factory: (...args: TFactoryArgs) => Promise<TResult>,
  {
    // An initial state can optionally be supplied - e.g. for storybook
    initialState = undefined as
      | undefined
      | PromiseState<TResult | undefined, TError>,
    // Default is to immediately execute the promise factory
    executeImmediately = true,
    // Default is to squelch errors because we surface them via UI state change
    rethrowError = false,
  } = {}
): [
  PromiseState<TResult | undefined, TError>,
  (...args: TFactoryArgs) => Promise<TResult | undefined>,
  () => void
] {
  const [state, setState] = useState<PromiseState<TResult | undefined, TError>>(
    initialState || initialPromiseState()
  );

  const promise = useRef<Promise<TResult | undefined> | undefined>();

  const reset = useCallback(() => {
    setState(initialPromiseState());
    promise.current = undefined;
  }, [setState, promise]);

  const execute = useCallback(
    async (...args: TFactoryArgs) => {
      // Avoid re-executing promise if there's already one in flight.
      if (typeof promise.current !== 'undefined') {
        return;
      }

      setState({ pending: true, error: undefined, result: undefined });
      promise.current = factory(...args);

      try {
        const result = await promise.current;
        setState({ pending: false, error: undefined, result });
        promise.current = undefined;
        return result;
      } catch (error) {
        setState({ pending: false, error, result: undefined });
        promise.current = undefined;
        if (rethrowError) {
          throw error;
        }
      }
    },
    [factory, setState, rethrowError]
  );

  useEffect(
    () => {
      if (executeImmediately) {
        // HACK: if we're executing immediately, then the factory function
        // can't take any params. There's probably a better type annotation
        // to assert this.
        (execute as () => void)();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return [state, execute, reset];
}
