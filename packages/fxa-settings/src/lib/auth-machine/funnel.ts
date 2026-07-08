/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { guards } from './guards';
import VerificationReasons from '../../constants/verification-reasons';
import type {
  AuthContext,
  AuthEvent,
  Effect,
  FlowState,
  ReducerResult,
} from './types';

const delegate = (reason: string): ReducerResult => ({
  state: 'delegated.legacy',
  effects: [{ kind: 'DELEGATE_LEGACY', reason }],
});
const go = (state: FlowState, effects: Effect[] = []): ReducerResult => ({
  state,
  effects,
});

// States that auto-advance when entered: they route solely on guards or
// re-apply the triggering event to pick a sub-state. funnelReducer re-reduces
// with the same event until it exits this set.
const PASSTHROUGH_STATES = new Set<FlowState>([
  'authenticating.signinDecider',
  'verifying.router',
]);

/** Public reducer: reduce once, then auto-advance through passthrough states. */
export function funnelReducer(
  state: FlowState,
  event: AuthEvent,
  ctx: AuthContext
): ReducerResult {
  let result = reduceOnce(state, event, ctx);
  const effects: Effect[] = [...result.effects];

  while (PASSTHROUGH_STATES.has(result.state)) {
    const next = reduceOnce(result.state, event, ctx);
    effects.push(...next.effects);
    if (next.state === result.state) break; // safety: prevent infinite loop
    result = next;
  }

  return { state: result.state, effects };
}

function reduceOnce(
  state: FlowState,
  event: AuthEvent,
  ctx: AuthContext
): ReducerResult {
  switch (state) {
    case 'bootstrapping.resolving':
      if (event.type === 'SERVICE_UNAVAILABLE')
        return go('terminal.serviceUnavailable');
      if (event.type === 'INTEGRATION_RESOLVED') return go('identifying.index');
      return go(state);

    case 'identifying.index':
      if (event.type === 'SUBMIT_EMAIL')
        return go('identifying.checkingAccountStatus', [
          { kind: 'CHECK_ACCOUNT_STATUS', email: event.email },
        ]);
      return go(state);

    case 'identifying.checkingAccountStatus':
      if (event.type === 'ACCOUNT_STATUS')
        return event.exists
          ? go('authenticating.signinDecider')
          : delegate('signup-out-of-slice');
      return go(state);

    case 'authenticating.signinDecider': {
      if (guards.shouldRedirectToPasswordless(ctx))
        return delegate('passwordless-out-of-slice');
      if (guards.showCached(ctx))
        return go('authenticating.cachedSignin', [{ kind: 'CACHED_SIGNIN' }]);
      if (guards.showAlternativeAuth(ctx))
        return delegate('third-party-out-of-slice');
      return go('authenticating.passwordSignin');
    }

    default:
      return funnelReducerPart2(state, event, ctx); // Task 5 extends this
  }
}

export function funnelReducerPart2(
  state: FlowState,
  event: AuthEvent,
  ctx: AuthContext
): ReducerResult {
  switch (state) {
    case 'authenticating.passwordSignin':
      if (event.type === 'SUBMIT_PASSWORD')
        return go('authenticating.awaitSigninResult', [
          { kind: 'BEGIN_SIGNIN', password: event.password },
        ]);
      return go(state);

    case 'authenticating.cachedSignin':
      if (event.type === 'SESSION_EXPIRED')
        return go('authenticating.signinDecider'); // ctx.hasCachedSession flipped by hook
      if (event.type === 'CACHED_RESULT') return go('verifying.router'); // no upgrade: cached has no password
      return go(state);

    case 'authenticating.awaitSigninResult': {
      if (event.type === 'REQUEST_BLOCKED' || event.type === 'THROTTLED')
        return event.canUnblock
          ? go('authenticating.unblockGate', [{ kind: 'SEND_UNBLOCK_EMAIL' }])
          : go(state); // hard block: banner only, no unblock path
      if (event.type === 'SIGNIN_OK') {
        const effects: Effect[] = guards.canUpgradeCredentials(ctx)
          ? [{ kind: 'UPGRADE_CREDENTIALS' }]
          : [];
        return go('verifying.router', effects);
      }
      return go(state);
    }

    case 'authenticating.unblockGate':
      if (event.type === 'UNBLOCK_CODE_SENT') return go('verifying.unblock');
      return go(state);

    default:
      return funnelReducerPart3(state, event, ctx); // Task 6 extends this
  }
}

function routeAfterVerify(
  ctx: AuthContext,
  ev: {
    emailVerified: boolean;
    sessionVerified: boolean;
    verificationMethod?: AuthContext['verificationMethod'];
    verificationReason?: AuthContext['verificationReason'];
  }
): FlowState {
  // Fully verified (email AND session): nothing left to confirm, hand off.
  // A verified session on an unverified-email account must still confirm signup
  // (legacy isFullyVerified requires both), so don't finalize on session alone.
  if (ev.emailVerified && ev.sessionVerified) return 'finalizing.handoff';
  const merged: AuthContext = {
    ...ctx,
    emailVerified: ev.emailVerified,
    verificationMethod: ev.verificationMethod,
  };
  if (guards.needsTotp(merged)) return 'verifying.totp'; // R-18 safety net: live fact wins
  // Legacy routes SIGN_UP to confirm_signup_code regardless of emailVerified.
  if (
    !ev.emailVerified ||
    ev.verificationReason === VerificationReasons.SIGN_UP
  )
    return 'delegated.legacy'; // confirm_signup_code is a later slice
  return 'verifying.emailTokenCode';
}

export function funnelReducerPart3(
  state: FlowState,
  event: AuthEvent,
  ctx: AuthContext
): ReducerResult {
  switch (state) {
    case 'verifying.router':
      if (
        event.type === 'SIGNIN_OK' ||
        event.type === 'UNBLOCK_OK' ||
        event.type === 'CACHED_RESULT'
      )
        return go(routeAfterVerify(ctx, event));
      return go(state);

    case 'verifying.unblock':
      if (event.type === 'UNBLOCK_OK') return go('verifying.router');
      if (event.type === 'REQUEST_BLOCKED' || event.type === 'THROTTLED')
        return event.canUnblock
          ? go('authenticating.unblockGate', [{ kind: 'SEND_UNBLOCK_EMAIL' }])
          : go(state);
      return go(state);

    case 'verifying.totp':
    case 'verifying.emailTokenCode':
    case 'verifying.recoveryCode':
    case 'verifying.recoveryPhone':
      if (event.type === 'CODE_OK') return go('finalizing.handoff');
      if (event.type === 'TROUBLE') return go('verifying.recoveryChoice');
      return go(state);

    case 'verifying.recoveryChoice':
      if (event.type === 'CHOOSE_RECOVERY_PHONE')
        return go('verifying.recoveryPhone');
      if (event.type === 'CHOOSE_RECOVERY_CODE')
        return go('verifying.recoveryCode');
      return go(state);

    default:
      return go(state); // terminal / delegated / finalizing are inert
  }
}
