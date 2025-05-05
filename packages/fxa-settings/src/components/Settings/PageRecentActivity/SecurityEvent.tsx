/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';

enum SecurityEventName {
  Create = 'account.create',
  Disable = 'account.disable',
  Enable = 'account.enable',
  Login = 'account.login',
  Reset = 'account.reset',
  ClearBounces = 'emails.clearBounces',
  LoginFailure = 'account.login.failure',
  TwoFactorAdded = 'account.two_factor_added',
  TwoFactorRequested = 'account.two_factor_requested',
  TwoFactorChallengeFailure = 'account.two_factor_challenge_failure',
  TwoFactorChallengeSuccess = 'account.two_factor_challenge_success',
  TwoFactorRemoved = 'account.two_factor_removed',
  PasswordResetRequested = 'account.password_reset_requested',
  PasswordResetSuccess = 'account.password_reset_success',
  RecoveryKeyAdded = 'account.recovery_key_added',
  RecoveryKeyChallengeFailure = 'account.recovery_key_challenge_failure',
  RecoveryKeyChallengeSuccess = 'account.recovery_key_challenge_success',
  RecoveryKeyRemoved = 'account.recovery_key_removed',
  PasswordAdded = 'account.password_added',
  PasswordChanged = 'account.password_changed',
  SecondaryEmailAdded = 'account.secondary_email_added',
  SecondaryEmailRemoved = 'account.secondary_email_removed',
  PrimarySecondaryEmailSwapped = 'account.primary_secondary_swapped',
  SessionDestroy = 'session.destroy',
  RecoveryPhoneSendCode = 'account.recovery_phone_send_code',
  RecoveryPhoneSetupComplete = 'account.recovery_phone_setup_complete',
  RecoveryPhoneSigninComplete = 'account.recovery_phone_signin_complete',
  RecoveryPhoneSigninFailed = 'account.recovery_phone_signin_failed',
  RecoveryPhoneRemoved = 'account.recovery_phone_removed',
  RecoveryCodesReplaced = 'account.recovery_codes_replaced',
  RecoveryCodesCreated = 'account.recovery_codes_created',
  RecoveryCodesSigninComplete = 'account.recovery_codes_signin_complete',
  PasswordResetOtpSent = 'account.password_reset_otp_sent',
  PasswordResetOtpVerified = 'account.password_reset_otp_verified',
  MustReset = 'account.must_reset',
}

const getSecurityEventNameL10n = (name: string) => {
  switch (name) {
    case SecurityEventName.Create: {
      return {
        ftlId: 'recent-activity-account-create-v2',
        fallbackText: 'Account created',
      };
    }
    case SecurityEventName.Disable: {
      return {
        ftlId: 'recent-activity-account-disable-v2',
        fallbackText: 'Account disabled',
      };
    }
    case SecurityEventName.Enable: {
      return {
        ftlId: 'recent-activity-account-enable-v2',
        fallbackText: 'Account enabled',
      };
    }
    case SecurityEventName.Login: {
      return {
        ftlId: 'recent-activity-account-login-v2',
        fallbackText: 'Account login initiated',
      };
    }
    case SecurityEventName.Reset: {
      return {
        ftlId: 'recent-activity-account-reset-v2',
        fallbackText: 'Password reset initiated',
      };
    }
    case SecurityEventName.ClearBounces: {
      return {
        ftlId: 'recent-activity-emails-clearBounces-v2',
        fallbackText: 'Email bounces cleared',
      };
    }
    case SecurityEventName.LoginFailure: {
      return {
        ftlId: 'recent-activity-account-login-failure',
        fallbackText: 'Account login attempt failed',
      };
    }
    case SecurityEventName.TwoFactorAdded: {
      return {
        ftlId: 'recent-activity-account-two-factor-added',
        fallbackText: 'Two-step authentication enabled',
      };
    }
    case SecurityEventName.TwoFactorRequested: {
      return {
        ftlId: 'recent-activity-account-two-factor-requested',
        fallbackText: 'Two-step authentication requested',
      };
    }
    case SecurityEventName.TwoFactorChallengeFailure: {
      return {
        ftlId: 'recent-activity-account-two-factor-failure',
        fallbackText: 'Two-step authentication failed',
      };
    }
    case SecurityEventName.TwoFactorChallengeSuccess: {
      return {
        ftlId: 'recent-activity-account-two-factor-success',
        fallbackText: 'Two-step authentication successful',
      };
    }
    case SecurityEventName.TwoFactorRemoved: {
      return {
        ftlId: 'recent-activity-account-two-factor-removed',
        fallbackText: 'Two-step authentication removed',
      };
    }
    case SecurityEventName.PasswordResetRequested: {
      return {
        ftlId: 'recent-activity-account-password-reset-requested',
        fallbackText: 'Password reset requested',
      };
    }
    case SecurityEventName.PasswordResetSuccess: {
      return {
        ftlId: 'recent-activity-account-password-reset-success',
        fallbackText: 'Password reset successful',
      };
    }
    case SecurityEventName.RecoveryKeyAdded: {
      return {
        ftlId: 'recent-activity-account-recovery-key-added',
        fallbackText: 'Account recovery key enabled',
      };
    }
    case SecurityEventName.RecoveryKeyChallengeFailure: {
      return {
        ftlId: 'recent-activity-account-recovery-key-challenge-failure',
        fallbackText: 'Account recovery key verification failed',
      };
    }
    case SecurityEventName.RecoveryKeyChallengeSuccess: {
      return {
        ftlId: 'recent-activity-account-recovery-key-challenge-success',
        fallbackText: 'Account recovery key verification successful',
      };
    }
    case SecurityEventName.RecoveryKeyRemoved: {
      return {
        ftlId: 'recent-activity-account-recovery-key-removed',
        fallbackText: 'Account recovery key removed',
      };
    }
    case SecurityEventName.PasswordAdded: {
      return {
        ftlId: 'recent-activity-account-password-added',
        fallbackText: 'New password added',
      };
    }
    case SecurityEventName.PasswordChanged: {
      return {
        ftlId: 'recent-activity-account-password-changed',
        fallbackText: 'Password changed',
      };
    }
    case SecurityEventName.SecondaryEmailAdded: {
      return {
        ftlId: 'recent-activity-account-secondary-email-added',
        fallbackText: 'Secondary email address added',
      };
    }
    case SecurityEventName.SecondaryEmailRemoved: {
      return {
        ftlId: 'recent-activity-account-secondary-email-removed',
        fallbackText: 'Secondary email address removed',
      };
    }
    case SecurityEventName.PrimarySecondaryEmailSwapped: {
      return {
        ftlId: 'recent-activity-account-emails-swapped',
        fallbackText: 'Primary and secondary emails swapped',
      };
    }
    case SecurityEventName.SessionDestroy: {
      return {
        ftlId: 'recent-activity-session-destroy',
        fallbackText: 'Logged out of session',
      };
    }
    case SecurityEventName.RecoveryPhoneSendCode: {
      return {
        ftlId: 'recent-activity-account-recovery-phone-send-code',
        fallbackText: 'Recovery phone code sent',
      };
    }
    case SecurityEventName.RecoveryPhoneSetupComplete: {
      return {
        ftlId: 'recent-activity-account-recovery-phone-setup-complete',
        fallbackText: 'Recovery phone setup completed',
      };
    }
    case SecurityEventName.RecoveryPhoneSigninComplete: {
      return {
        ftlId: 'recent-activity-account-recovery-phone-signin-complete',
        fallbackText: 'Sign-in with recovery phone completed',
      };
    }
    case SecurityEventName.RecoveryPhoneSigninFailed: {
      return {
        ftlId: 'recent-activity-account-recovery-phone-signin-failed',
        fallbackText: 'Sign-in with recovery phone failed',
      };
    }
    case SecurityEventName.RecoveryPhoneRemoved: {
      return {
        ftlId: 'recent-activity-account-recovery-phone-removed',
        fallbackText: 'Recovery phone removed',
      };
    }
    case SecurityEventName.RecoveryCodesReplaced: {
      return {
        ftlId: 'recent-activity-account-recovery-codes-replaced',
        fallbackText: 'Recovery codes replaced',
      };
    }
    case SecurityEventName.RecoveryCodesCreated: {
      return {
        ftlId: 'recent-activity-account-recovery-codes-created',
        fallbackText: 'Recovery codes created',
      };
    }
    case SecurityEventName.RecoveryCodesSigninComplete: {
      return {
        ftlId: 'recent-activity-account-recovery-codes-signin-complete',
        fallbackText: 'Sign-in with recovery codes completed',
      };
    }
    case SecurityEventName.PasswordResetOtpSent: {
      return {
        ftlId: 'recent-activity-password-reset-otp-sent',
        fallbackText: 'Reset password confirmation code sent',
      };
    }
    case SecurityEventName.PasswordResetOtpVerified: {
      return {
        ftlId: 'recent-activity-password-reset-otp-verified',
        fallbackText: 'Reset password confirmation code verified',
      };
    }
    case SecurityEventName.MustReset: {
      return {
        ftlId: 'recent-activity-must-reset-password',
        fallbackText: 'Password reset required',
      };
    }
    default: {
      return {
        ftlId: 'recent-activity-unknown',
        fallbackText: 'Other account activity',
      };
    }
  }
};

export function SecurityEvent({
  name,
  createdAt,
}: {
  name: string;
  createdAt: number;
  verified?: boolean;
}) {
  const localizedDate = Intl.DateTimeFormat(navigator.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(createdAt));

  const l10nName = getSecurityEventNameL10n(name);
  return (
    <li className="mt-5 ms-4" data-testid={l10nName.ftlId}>
      <div className="absolute w-3 h-3 bg-green-600 rounded-full mt-1.5 -start-1.5 border border-green-700"></div>
      <div className="text-grey-900 text-sm mobileLandscape:mt-3 text-start">
        {localizedDate}
      </div>
      <FtlMsg id={l10nName.ftlId}>
        <p className="text-grey-400 text-xs mobileLandscape:mt-3">
          {l10nName.fallbackText}
        </p>
      </FtlMsg>
    </li>
  );
}
export default SecurityEvent;
