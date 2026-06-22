/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Both constants use default exports, so import them accordingly.
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';

export const FUNNEL_STATES = [
  'bootstrapping.resolving',
  'bootstrapping.awaitFxaStatus',
  'identifying.index',
  'identifying.checkingAccountStatus',
  'authenticating.signinDecider',
  'authenticating.cachedSignin',
  'authenticating.passwordSignin',
  'authenticating.awaitSigninResult',
  'authenticating.unblockGate',
  'verifying.router',
  'verifying.emailTokenCode',
  'verifying.totp',
  'verifying.recoveryChoice',
  'verifying.recoveryCode',
  'verifying.recoveryPhone',
  'verifying.unblock',
  'finalizing.handoff', // hand off to the (not-yet-built) session machine / settings
  'terminal.serviceUnavailable',
  'delegated.legacy', // out-of-slice: hand control back to legacy navigation
] as const;

export type FlowState = (typeof FUNNEL_STATES)[number];

export function isFunnelState(s: string): s is FlowState {
  return (FUNNEL_STATES as readonly string[]).includes(s);
}

/** The demoted Account + Reliant "regions": a flat bag of facts the guards read. */
export interface AuthContext {
  // identity
  email?: string;
  uid?: string;
  sessionToken?: string;
  // verification facts (Account region)
  emailVerified: boolean;
  sessionVerified: boolean;
  verificationMethod?: VerificationMethods;
  verificationReason?: VerificationReasons;
  /** LIVE checkTotpTokenExists — distinct from verificationMethod. Guards prefer this. */
  accountHasTotp: boolean;
  hasRecoveryPhone: boolean;
  // credential / capability facts
  hasPassword: boolean;
  hasLinkedAccount: boolean;
  hasCachedSession: boolean;
  passwordlessSupported: boolean;
  // Reliant capabilities (frozen post-clientInfo)
  isOAuth: boolean;
  isOAuthWeb: boolean;
  isOAuthNative: boolean;
  isSync: boolean;
  isWebChannelIntegration: boolean;
  supportsKeysOptionalLogin: boolean;
  requiresKeys: boolean;
  wantsKeysIfPasswordEntered: boolean;
  wantsLogin: boolean;
  clientInfoLoadFailed: boolean;
  // scratch (survives reload; cosmetic only)
  skipPasswordlessRedirect?: boolean;
  isSessionAALUpgrade?: boolean;
}

export type AuthEvent =
  | { type: 'INTEGRATION_RESOLVED' }
  | { type: 'SERVICE_UNAVAILABLE' }
  | { type: 'SUBMIT_EMAIL'; email: string }
  | { type: 'ACCOUNT_STATUS'; exists: boolean }
  | { type: 'SUBMIT_PASSWORD'; password: string }
  | {
      type: 'CACHED_RESULT';
      emailVerified: boolean;
      sessionVerified: boolean;
      verificationMethod?: VerificationMethods;
      verificationReason?: VerificationReasons;
    }
  | {
      type: 'SIGNIN_OK';
      emailVerified: boolean;
      sessionVerified: boolean;
      verificationMethod?: VerificationMethods;
      verificationReason?: VerificationReasons;
    }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'REQUEST_BLOCKED'; canUnblock: boolean }
  | { type: 'THROTTLED'; canUnblock: boolean }
  | { type: 'UNBLOCK_CODE_SENT' }
  | {
      type: 'UNBLOCK_OK';
      emailVerified: boolean;
      sessionVerified: boolean;
      verificationMethod?: VerificationMethods;
      verificationReason?: VerificationReasons;
    }
  | { type: 'CODE_OK' } // token-code / totp / recovery success
  | { type: 'CHOOSE_RECOVERY_CODE' }
  | { type: 'CHOOSE_RECOVERY_PHONE' }
  | { type: 'TROUBLE' };

export type Effect =
  | { kind: 'RESOLVE_INTEGRATION' }
  | { kind: 'CHECK_ACCOUNT_STATUS'; email: string }
  | { kind: 'BEGIN_SIGNIN'; password: string; unblockCode?: string }
  | { kind: 'CACHED_SIGNIN' }
  | { kind: 'SEND_UNBLOCK_EMAIL' }
  | { kind: 'UPGRADE_CREDENTIALS' } // fired alongside SIGNIN_OK when canUpgradeCredentials
  | { kind: 'DELEGATE_LEGACY'; reason: string };

export interface ReducerResult {
  state: FlowState;
  effects: Effect[];
}
