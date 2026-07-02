/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { FlowState } from './types';

export type RouteDecision =
  | { to: string }
  | { stay: true }
  | { delegate: true };

const ROUTES: Partial<Record<FlowState, string>> = {
  'identifying.index': '/signin',
  'verifying.emailTokenCode': '/signin_token_code',
  'verifying.totp': '/signin_totp_code',
  'verifying.recoveryChoice': '/signin_recovery_choice',
  'verifying.recoveryCode': '/signin_recovery_code',
  'verifying.recoveryPhone': '/signin_recovery_phone',
  'verifying.unblock': '/signin_unblock',
  'finalizing.handoff': '/settings',
  'terminal.serviceUnavailable': '/', // renders ServiceUnavailable via error boundary
};

export function routeFor(state: FlowState): RouteDecision {
  if (state === 'delegated.legacy') return { delegate: true };
  const to = ROUTES[state];
  if (to) return { to };
  // bootstrapping / checkingAccountStatus / signinDecider / awaitSigninResult / cachedSignin / unblockGate
  // are transient compute states with no route of their own.
  return { stay: true };
}
