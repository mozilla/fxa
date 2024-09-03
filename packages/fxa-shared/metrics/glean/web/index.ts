/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type GleanMetricsConfig = {
  enabled: boolean;
  applicationId: string;
  uploadEnabled: boolean;
  appDisplayVersion: string;
  appChannel: string;
  serverEndpoint: string;
  logPings: boolean;
  debugViewTag: string;
};

export const booleanEventPropertyNames = ['thirdPartyLinks'] as const;
export const stringEventPropertyNames = ['reason'] as const;

export type PropertyNameStringT = typeof stringEventPropertyNames;
export type PropertyNameString = PropertyNameStringT[number];

export type PropertyNameBooleanT = typeof booleanEventPropertyNames;
export type PropertyNameBoolean = PropertyNameBooleanT[number];

type StringEventProperties = {
  [K in PropertyNameString]?: string;
};

type BooleanEventProperties = {
  [K in PropertyNameBoolean]?: boolean;
};

type EventProperties = StringEventProperties & BooleanEventProperties;
export type EventsMap = typeof eventsMap;
export type EventMapKeys = keyof EventsMap;

// Type for optional values
export type GleanPingMetrics = {
  event?: EventProperties;
  sync?: { cwts: Record<string, boolean> };
  standard?: { marketing: Record<string, boolean> };
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
    ageInvalid: 'reg_age_invalid',
    marketing: 'reg_marketing_engage',
    changeEmail: 'reg_change_email_link_click',
    whyWeAsk: 'reg_why_do_we_ask_link_click',
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
    diffAccountLinkClick: 'login_diff_account_link_click',
    engage: 'login_engage',
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
    createNewRecoveryKeyMessageClick:
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

  thirdPartyAuth: {
    startGoogleAuthFromReg: 'third_party_auth_google_reg_start',
    startAppleAuthFromReg: 'third_party_auth_apple_reg_start',
    startGoogleAuthFromLogin: 'third_party_auth_google_login_start',
    startAppleAuthFromLogin: 'third_party_auth_apple_login_start',
    viewWithNoPasswordSet: 'third_party_auth_login_no_pw_view',
  },

  cadMobilePair: {
    view: 'cad_mobile_pair_view',
    submit: 'cad_mobile_pair_submit',
  },

  cadMobilePairUseApp: {
    view: 'cad_mobile_pair_use_app_view',
  },

  cadApproveDevice: {
    submit: 'cad_approve_device_submit',
  },

  cadFireFox: {
    notnowSubmit: 'cad_firefox_notnow_submit',
  },

  accountPref: {
    view: 'account_pref_view',
    recoveryKeySubmit: 'account_pref_recovery_key_submit',
    twoStepAuthSubmit: 'account_pref_two_step_auth_submit',
    twoStepAuthScanCodeLink: 'account_pref_two_step_auth_scan_code_link',
    twoStepAuthQrView: 'account_pref_two_step_auth_qr_view',
    twoStepAuthQrCodeSuccess: 'account_pref_two_step_auth_qr_code_success',
    twoStepAuthCodesView: 'two_step_auth_codes_view',
    twoStepAuthEnterCodeView: 'two_step_auth_enter_code_view',
    changePasswordSubmit: 'account_pref_change_password_submit',
    deviceSignout: 'account_pref_device_signout',
    appleSubmit: 'account_pref_apple_submit',
    googlePlaySubmit: 'account_pref_google_play_submit',
    googleUnlinkSubmit: 'account_pref_google_unlink_submit',
    googleUnlinkSubmitConfirm: 'account_pref_google_unlink_submit_confirm',
    appleUnlinkSubmit: 'account_pref_apple_unlink_submit',
    appleUnlinkSubmitConfirm: 'account_pref_apple_unlink_submit_confirm',
    displayNameSubmit: 'account_pref_display_name_submit',
    secondaryEmailSubmit: 'account_pref_secondary_email_submit',
    help: 'account_pref_help',
    promoMonitorView: 'account_pref_promo_monitor_view',
    promoMonitorSubmit: 'account_pref_promo_monitor_submit',
    bentoView: 'account_pref_bento_view',
    bentoFirefoxDesktop: 'account_pref_bento_firefox_desktop',
    bentoFirefoxMobile: 'account_pref_bento_firefox_mobile',
    bentoMonitor: 'account_pref_bento_monitor',
    bentoPocket: 'account_pref_bento_pocket',
    bentoRelay: 'account_pref_bento_relay',
    bentoVpn: 'account_pref_bento_vpn',
  },

  deleteAccount: {
    settingsSubmit: 'delete_account_settings_submit',
    view: 'delete_account_view',
    engage: 'delete_account_engage',
    submit: 'delete_account_submit',
    passwordView: 'delete_account_password_view',
    passwordSubmit: 'delete_account_password_submit',
  },
} as const;
