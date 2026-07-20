/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useReducer } from 'react';

/**
 * A lightweight reactive variable that replaces Apollo's makeVar/useReactiveVar.
 * Holds a value and notifies subscribers when it changes.
 */
export interface ReactiveVar<T> {
  (): T;
  (newValue: T): T;
  subscribe(listener: () => void): () => void;
}

export function makeVar<T>(initialValue: T): ReactiveVar<T> {
  let value = initialValue;
  const listeners = new Set<() => void>();

  function variable(newValue?: T): T {
    if (arguments.length > 0) {
      value = newValue as T;
      listeners.forEach((l) => l());
    }
    return value;
  }

  variable.subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return variable as ReactiveVar<T>;
}

export function useReactiveVar<T>(rv: ReactiveVar<T>): T {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  useEffect(() => rv.subscribe(forceUpdate), [rv]);
  return rv();
}
