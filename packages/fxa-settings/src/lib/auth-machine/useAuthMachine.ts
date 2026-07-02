/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useReducer, useRef } from 'react';
import { funnelReducer } from './funnel';
import { runEffect, type EffectDeps } from './effects';
import { routeFor } from './route-adapter';
import type { AuthContext, AuthEvent, FlowState } from './types';

interface Params {
  initial: FlowState;
  ctx: AuthContext;
  deps: EffectDeps;
  navigate: (to: string) => void;
  delegate: () => void;
}

export function useAuthMachine({
  initial,
  ctx,
  deps,
  navigate,
  delegate,
}: Params) {
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  // stateRef tracks the authoritative current state for chained reductions.
  // useReducer state is for rendering only and may lag behind async operations.
  const stateRef = useRef<FlowState>(initial);

  const [renderState, rawDispatch] = useReducer(
    (_s: FlowState, next: FlowState) => next,
    initial
  );

  const send = useCallback(
    async function send(event: AuthEvent): Promise<void> {
      const { state: nextState, effects } = funnelReducer(
        stateRef.current,
        event,
        ctxRef.current
      );

      stateRef.current = nextState;
      rawDispatch(nextState);

      const decision = routeFor(nextState);
      if ('to' in decision) navigate(decision.to);
      else if ('delegate' in decision) delegate();

      for (const effect of effects) {
        const next = await runEffect(effect, deps);
        if (next) await send(next);
      }
    },
    [deps, navigate, delegate]
  );

  return { state: renderState, send };
}
