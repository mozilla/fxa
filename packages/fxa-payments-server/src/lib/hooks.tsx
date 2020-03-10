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
  }, [mediaQuery]);

  return matches;
}
