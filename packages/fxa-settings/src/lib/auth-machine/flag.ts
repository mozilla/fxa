/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Resolves whether the auth state machine is enabled. An explicit
 * `?authStateMachine=true|false` URL query param always wins (a force on/off
 * switch for rollout and debugging); otherwise the config feature flag decides.
 */
export function isAuthStateMachineEnabled(
  search: string | undefined,
  configEnabled: boolean
): boolean {
  const raw = new URLSearchParams(search || '').get('authStateMachine');
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return configEnabled;
}
