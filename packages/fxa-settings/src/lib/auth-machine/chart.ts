/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { funnelReducer } from './funnel';
import {
  FUNNEL_STATES,
  type AuthContext,
  type AuthEvent,
  type FlowState,
} from './types';

// One representative event per type, enough to exercise every edge in the funnel.
const PROBE_EVENTS: AuthEvent[] = [
  { type: 'INTEGRATION_RESOLVED' },
  { type: 'SERVICE_UNAVAILABLE' },
  { type: 'SUBMIT_EMAIL', email: 'a@example.com' },
  { type: 'ACCOUNT_STATUS', exists: true },
  { type: 'ACCOUNT_STATUS', exists: false },
  { type: 'SUBMIT_PASSWORD', password: 'x' },
  { type: 'SIGNIN_OK', emailVerified: true, sessionVerified: false },
  { type: 'CACHED_RESULT', emailVerified: true, sessionVerified: true },
  { type: 'REQUEST_BLOCKED', canUnblock: true },
  { type: 'UNBLOCK_CODE_SENT' },
  { type: 'UNBLOCK_OK', emailVerified: true, sessionVerified: false },
  { type: 'CODE_OK' },
  { type: 'TROUBLE' },
  { type: 'CHOOSE_RECOVERY_PHONE' },
  { type: 'CHOOSE_RECOVERY_CODE' },
  { type: 'SESSION_EXPIRED' },
];

// A neutral context exercising the default branches.
const PROBE_CTX = {
  hasPassword: true,
  emailVerified: true,
  sessionVerified: false,
  accountHasTotp: false,
  hasRecoveryPhone: false,
  hasLinkedAccount: false,
  hasCachedSession: false,
  passwordlessSupported: false,
  isOAuth: false,
  isOAuthWeb: false,
  isOAuthNative: false,
  isSync: false,
  isWebChannelIntegration: false,
  supportsKeysOptionalLogin: false,
  requiresKeys: false,
  wantsKeysIfPasswordEntered: false,
  wantsLogin: false,
  clientInfoLoadFailed: false,
} as unknown as AuthContext;

export function transitionTableToMermaid(): string {
  const edges = new Set<string>();
  for (const from of FUNNEL_STATES) {
    for (const ev of PROBE_EVENTS) {
      const { state: to } = funnelReducer(from as FlowState, ev, PROBE_CTX);
      if (to !== from) edges.add(`  ${from} --> ${to}: ${ev.type}`);
    }
  }
  return ['stateDiagram-v2', ...Array.from(edges).sort()].join('\n');
}
