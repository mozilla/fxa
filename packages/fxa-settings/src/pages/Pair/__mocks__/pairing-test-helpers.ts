/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Shared SupplicantState values for pairing test mocks.
 * Must stay in sync with the real SupplicantState enum in
 * models/integrations/pairing-supplicant-integration.ts.
 */
export const MOCK_SUPPLICANT_STATE = {
  Connecting: 'connecting',
  WaitingForMetadata: 'waiting_for_metadata',
  WaitingForAuthorizations: 'waiting_for_authorizations',
  WaitingForAuthority: 'waiting_for_authority',
  WaitingForSupplicant: 'waiting_for_supplicant',
  SendingResult: 'sending_result',
  Complete: 'complete',
  Failed: 'failed',
} as const;
