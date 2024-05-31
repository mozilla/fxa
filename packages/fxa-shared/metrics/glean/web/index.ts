/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type GleanMetricsConfig = {
  enabled: boolean;
  applicationId: string;
  uploadEnabled: boolean;
  appDisplayVersion: string;
  channel: string;
  serverEndpoint: string;
  logPings: boolean;
  debugViewTag: string;
};

export const eventPropertyNames = ['reason'] as const;
export type PropertyNameT = typeof eventPropertyNames;
export type PropertyName = PropertyNameT[number];
export type EventProperties = {
  [k in PropertyName]?: string;
};
export type EventsMap = typeof eventsMap;
export type EventMapKeys = keyof EventsMap;

// Type for optional values
export type GleanPingMetrics = {
  event?: EventProperties;
  sync?: { cwts: Record<string, boolean> };
};

export const eventsMap = {
  emailFirst: {
    view: 'email_first_view',
  },

  registration: {
    view: 'reg_view',
    engage: 'reg_engage',
    submit: 'reg_submit',
    success: 'reg_submit_success',
    complete: 'reg_success_view',
    cwts: 'reg_cwts_engage',
  },

  signupConfirmation: {
    view: 'reg_signup_code_view',
    submit: 'reg_signup_code_submit',
  },

  login: {
    view: 'login_view',
    submit: 'login_submit',
    success: 'login_submit_success',
    error: 'login_submit_frontend_error',
    forgotPassword: 'login_forgot_pwd_submit',
  },

  cachedLogin: {
    view: 'cached_login_view',
    submit: 'cached_login_submit',
    success: 'cached_login_success_view',
    forgotPassword: 'cached_login_forgot_pwd_submit',
  },

  loginConfirmation: {
    view: 'login_email_confirmation_view',
    submit: 'login_email_confirmation_submit',
    success: 'login_email_confirmation_success_view',
  },

  loginBackupCode: {
    view: 'login_backup_code_view',
    submit: 'login_backup_code_submit',
    success: 'login_backup_code_success_view',
  },

  totpForm: {
    view: 'login_totp_form_view',
    submit: 'login_totp_code_submit',
    success: 'login_totp_code_success_view',
  },

  passwordReset: {
    view: 'password_reset_view',
    submit: 'password_reset_submit',

    createNewView: 'password_reset_create_new_view',
    createNewSubmit: 'password_reset_create_new_submit',
    createNewSuccess: 'password_reset_create_new_success_view',
    createNewClickRecoveryKeyMessage:
      'password_reset_create_new_recovery_key_message_click',

    emailConfirmationView: 'password_reset_email_confirmation_view',
    emailConfirmationSubmit: 'password_reset_email_confirmation_submit',
    emailConfirmationDifferentAccount:
      'password_reset_email_confirmation_different_account',
    emailConfirmationSignin: 'password_reset_email_confirmation_signin',
    emailConfirmationResendCode:
      'password_reset_email_confirmation_resend_code',

    recoveryKeyView: 'password_reset_recovery_key_view',
    recoveryKeySubmit: 'password_reset_recovery_key_submit',
    recoveryKeyCannotFind: 'password_reset_recovery_key_cannot_find',

    recoveryKeyCreatePasswordView:
      'password_reset_recovery_key_create_new_view',
    recoveryKeyCreatePasswordSubmit:
      'password_reset_recovery_key_create_new_submit',

    recoveryKeyResetSuccessView:
      'password_reset_recovery_key_create_success_view',
  },
} as const;
