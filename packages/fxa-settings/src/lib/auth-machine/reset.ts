/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Destinations the reset-password post-OTP step can route to. */
export type ResetOtpRoute =
  | '/confirm_totp_reset_password'
  | '/account_recovery_confirm_key'
  | '/complete_reset_password';

export interface ResetOtpFacts {
  totpExists?: boolean;
  /** undefined when the recovery-key status check failed (treated as "no key"). */
  recoveryKeyExists?: boolean;
}

/**
 * Decides where the reset-password flow goes after the email OTP is verified.
 * Behaviorally identical to the legacy ConfirmResetPassword branch: a recovery
 * key wins; otherwise TOTP (only when we positively know there is no recovery
 * key) gates a TOTP check; otherwise go straight to the reset form.
 */
export function routeAfterResetOtp(facts: ResetOtpFacts): ResetOtpRoute {
  const { totpExists, recoveryKeyExists } = facts;
  if (totpExists && recoveryKeyExists === false) {
    return '/confirm_totp_reset_password';
  }
  if (recoveryKeyExists === true) {
    return '/account_recovery_confirm_key';
  }
  return '/complete_reset_password';
}

/** Destinations the reset-password completion step can hand off to. */
export type ResetCompleteRoute =
  | '/reset_password_verified'
  | '/settings'
  | '/signin';

export interface ResetCompleteFacts {
  sessionVerified: boolean;
  /** OAuth web RP only: isOAuth AND not Sync AND not Firefox-non-sync. */
  isOAuthWeb: boolean;
}

/**
 * Decides where the reset-password flow hands off after the password is reset
 * (the no-recovery-key path). Behaviorally identical to the legacy
 * CompleteResetPassword branch: an unverified session goes to sign-in for 2FA;
 * a verified OAuth web session goes to the RP confirmation page; everything else
 * (web, Sync) lands in settings.
 */
export function routeAfterResetComplete(
  facts: ResetCompleteFacts
): ResetCompleteRoute {
  if (!facts.sessionVerified) {
    return '/signin';
  }
  return facts.isOAuthWeb ? '/reset_password_verified' : '/settings';
}

/** The action the reset-password recovery-choice step should take. */
export type RecoveryChoiceAction =
  | 'redirect-reset'
  | 'handle-data-error'
  | 'wait'
  | 'backup-codes'
  | 'auto-send-phone'
  | 'show-choice';

export interface RecoveryChoiceFacts {
  hasToken: boolean;
  hasDataFetchError: boolean;
  loading: boolean;
  hasPhone: boolean;
  autoSendAttempted: boolean;
  numBackupCodes: number;
}

/**
 * Decides what the reset-password recovery-choice step does, in the legacy
 * priority order: no token sends back to reset; a data-fetch error defers to
 * the caller's error handler; while still loading nothing happens; with no
 * phone the user goes to backup codes; a phone-only account auto-sends an SMS
 * once; otherwise the choice UI is shown. The actual side effects (SMS send,
 * the data-error sub-routing) stay with the caller; this only picks the action.
 */
export function decideRecoveryChoice(
  facts: RecoveryChoiceFacts
): RecoveryChoiceAction {
  if (!facts.hasToken) return 'redirect-reset';
  if (facts.hasDataFetchError) return 'handle-data-error';
  if (facts.loading) return 'wait';
  if (!facts.hasPhone) return 'backup-codes';
  if (!facts.autoSendAttempted && facts.numBackupCodes === 0) {
    return 'auto-send-phone';
  }
  return 'show-choice';
}
