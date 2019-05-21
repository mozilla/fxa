'use strict';

const  PASSWORD_BALLOON = {
  BALLOON: '.password-strength-balloon',
  MIN_LENGTH_FAIL: '.min-length.fail',
  MIN_LENGTH_MET: '.min-length.met',
  MIN_LENGTH_UNMET: '.min-length.unmet',
  NOT_COMMON_FAIL: '.not-common.fail',
  NOT_COMMON_MET: '.not-common.met',
  NOT_COMMON_UNMET: '.not-common.unmet',
  NOT_EMAIL_FAIL: '.not-email.fail',
  NOT_EMAIL_MET: '.not-email.met',
  NOT_EMAIL_UNMET: '.not-email.unmet',
};

const NEWSLETTERS = {
  CONSUMER_BETA: '.consumer-beta-optin',
  HEALTHY_INTERNET: '.marketing-email-optin',
  ONLINE_SAFETY: '.online-safety-optin',
};

/*eslint-disable max-len*/
module.exports = {
  '123DONE': {
    AUTHENTICATED: '#loggedin',
    AUTHENTICATED_TOTP: '#loggedin span:first-child',
    BUTTON_SIGNIN: '.sign-in-button.signin',
    BUTTON_SIGNIN_CHOOSE_FLOW_FOR_ME: '.ready #splash .sign-choose',
    BUTTON_SIGNUP: '.sign-in-button.signup',
    LINK_LOGOUT: '#logout'
  },
  '400': {
    ERROR: '.error',
    HEADER: '#fxa-400-header'
  },
  CHANGE_PASSWORD: {
    CANCEL_BUTTON: '#change-password .cancel',
    DETAILS: '#change-password .settings-unit-details',
    ERROR: '#change-password .error',
    LINK_RESET_PASSWORD: '.reset-password',
    MENU_BUTTON: '#change-password .settings-unit-toggle',
    NEW_PASSWORD: '#new_password',
    NEW_VPASSWORD: '#new_vpassword',
    OLD_PASSWORD: '#old_password',
    OLD_PASSWORD_SHOW: '[for=show-old_password]',
    PASSWORD_BALLOON,
    SUBMIT: '#change-password button[type="submit"]',
    TOOLTIP: '.tooltip',
  },
  CHOOSE_WHAT_TO_SYNC: {
    ENGINE_ADDRESSES: '#sync-engine-addresses',
    ENGINE_CREDIT_CARDS: '#sync-engine-creditcards',
    ENGINE_HISTORY: '#sync-engine-history',
    ENGINE_PASSWORDS: '#sync-engine-passwords',
    HEADER: '#fxa-choose-what-to-sync-header',
    NEWSLETTERS,
    NEWSLETTERS_HEADER: '.get-involved',
    PROGRESS_INDICATOR: '.step-2',
    SUBMIT: 'button[type=submit]',
  },
  COMPLETE_RESET_PASSWORD: {
    DAMAGED_LINK_HEADER: '#fxa-reset-link-damaged-header',
    EXPIRED_LINK_HEADER: '#fxa-reset-link-expired-header',
    HEADER: '#fxa-complete-reset-password-header',
    PASSWORD: '#password',
    PASSWORD_BALLOON,
    SUBMIT: 'button[type="submit"]',
    VPASSWORD: '#vpassword',
  },
  COMPLETE_RESET_PASSWORD_RECOVERY_KEY: {
    HEADER: '#fxa-recovery-key-confirm',
    INPUT: '#recovery-key',
    LOST_KEY: '.lost-recovery-key',
    SUBMIT: 'button[type="submit"]',
    TOOLTIP: '.tooltip',
  },
  COMPLETE_SIGNIN: {
    LINK_RESEND: '#resend',
    VERIFICATION_LINK_DAMAGED: '#fxa-verification-link-damaged-header',
    VERIFICATION_LINK_EXPIRED: '#fxa-verification-link-expired-header',
    VERIFICATION_LINK_REUSED: '#fxa-verification-link-reused-header'
  },
  CONFIRM_RESET_PASSWORD: {
    HEADER: '#fxa-confirm-reset-password-header',
    LINK_RESEND: '#resend',
    RESEND_SUCCESS: '.success'
  },
  CONFIRM_SIGNIN: {
    HEADER: '#fxa-confirm-signin-header',
    LINK_BACK: '#back',
    LINK_RESEND: '#resend',
    RESEND_SUCCESS: '.success'
  },
  CONFIRM_SIGNUP: {
    HEADER: '#fxa-confirm-header',
    LINK_BACK: '#back',
    PROGRESS_INDICATOR: '.step-3',
  },
  CONNECT_ANOTHER_DEVICE: {
    HEADER: '#fxa-connect-another-device-header',
    LINK_INSTALL_ANDROID: '.marketing-link-android',
    LINK_INSTALL_IOS: '.marketing-link-ios',
    LINK_WHY_IS_THIS_REQUIRED: 'a[href="/connect_another_device/why"]',
    SIGNIN_BUTTON: 'form div a',
    SUCCESS: '.success',
    SUCCESS_DIFFERENT_BROWSER: '.success-not-authenticated',
    SUCCESS_SAME_BROWSER: '.success-authenticated',
    TEXT_INSTALL_FROM_OTHER: '#install-mobile-firefox-other',
    TEXT_INSTALL_FX_ANDROID: '#install-mobile-firefox-android',
    TEXT_INSTALL_FX_DESKTOP: '#install-mobile-firefox-desktop',
    TEXT_INSTALL_FX_FROM_FX_ANDROID: '#connect-other-firefox-from-android',
    TEXT_INSTALL_FX_IOS: '#install-mobile-firefox-ios',
    TEXT_SIGNIN_FXIOS: '#signin-fxios',
  },
  CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED: {
    CLOSE: '.connect-another-device button[type="submit"]',
    HEADER: '#fxa-why-connect-another-device-header',
  },
  DOWNLOAD_FIREFOX_THANKS: {
    HEADER: '#download-button-wrapper-desktop'
  },
  EMAIL: {
    ADD_BUTTON: '.email-add:not(.disabled)',
    ADDRESS_LABEL: '#emails .address',
    INPUT: '.new-email',
    MENU_BUTTON: '#emails .settings-unit-stub button',
    NOT_VERIFIED_LABEL: '.not-verified',
    REMOVE_BUTTON: '.email-address .settings-button.warning-button.email-disconnect',
    SET_PRIMARY_EMAIL_BUTTON: '.email-address .set-primary',
    SUCCESS: '.success',
    TOOLTIP: '.tooltip',
    UNLOCK_BUTTON: '.emails .unlock-button',
    UNLOCK_REFRESH_BUTTON: '.emails .refresh-verification-state',
    UNLOCK_SEND_BUTTON: '.emails .send-verification-email',
    VERIFIED_LABEL: '.verified',
  },
  ENTER_EMAIL: {
    EMAIL: 'input[type=email]',
    ERROR: '.error',
    FIREFOX_FAMILY_SERVICES: '.firefox-family-services',
    HEADER: '#fxa-enter-email-header',
    LINK_SUGGEST_SYNC: '#suggest-sync a',
    SUB_HEADER: '#fxa-enter-email-header .service',
    SUBMIT: 'button[type="submit"]',
    TOOLTIP: 'input[type=email] + .tooltip',
  },
  FORCE_AUTH: {
    EMAIL: 'input[type=email]',
    HEADER: '#fxa-force-auth-header',
    PROGRESS_INDICATOR: '.step',
    SUB_HEADER: '#fxa-force-auth-header .service',
  },
  MOZILLA_ORG_SYNC: {
    HEADER: '.mzp-c-navigation'
  },
  OAUTH_PERMISSIONS: {
    CHECKBOX_DISPLAY_NAME: 'input[name="profile:display_name"]',
    HEADER: '#fxa-permissions-header',
    SUBMIT: '#accept'
  },
  PAIRING: {
    AUTH_SUBMIT: '#auth-approve-btn',
    COMPLETE: '#fxa-oauth-success-header',
    PAIR_FAILURE: '#fxa-pair-failure-header',
    START_PAIRING: '#start-pairing',
    SUPP_SUBMIT: '#supp-approve-btn',
  },
  RECOVERY_KEY: {
    CANCEL_BUTTON: '.cancel',
    CONFIRM_PASSWORD_CONTINUE: '.generate-key-link',
    CONFIRM_REVOKE: '.confirm-revoke',
    CONFIRM_REVOKE_DESCRIPTION: '.revoke-description',
    CONFIRM_REVOKE_OK: '#account-recovery-confirm-revoke .revoke',
    GENERATE_KEY_BUTTON: '.confirm-password',
    MENU_BUTTON: '#account-recovery-section .settings-unit-toggle',
    PASSWORD_INPUT: '#account-recovery-confirm-password #password',
    RECOVERY_KEY_DONE_BUTTON: '.done-link',
    RECOVERY_KEY_TEXT: '.recovery-key',
    STATUS_DISABLED: '.disabled',
    STATUS_ENABLED: '.enabled',
    UNLOCK_BUTTON: '.account-recovery .unlock-button',
    UNLOCK_REFRESH_BUTTON: '.account-recovery .refresh-verification-state',
    UNLOCK_SEND_VERIFY: '.account-recovery .send-verification-email',
  },
  RESET_PASSWORD: {
    BACK: '.remember-password',
    EMAIL: 'input[type=email]',
    ERROR: '.error',
    HEADER: '#fxa-reset-password-header',
    LINK_ERROR_SIGNUP: '.error a[href="/signup"]',
    LINK_SIGNIN: '.remember-password',
    SUBMIT: 'button[type="submit"]',
    SUCCESS: '.success'
  },
  RESET_PASSWORD_COMPLETE: {
    HEADER: '#fxa-reset-password-complete-header',
    SUB_HEADER: '.account-ready-service'
  },
  SETTINGS: {
    CONTENT: '#fxa-settings-content',
    HEADER: '#fxa-settings-header',
    PROFILE_HEADER: '#fxa-settings-profile-header .card-header',
    PROFILE_SUB_HEADER: '#fxa-settings-profile-header .card-subheader',
    SIGNOUT: '#signout',
    SUCCESS: '.settings-success'
  },
  SETTINGS_CLIENTS: {
    BUTTON_REFRESH: '.clients-refresh',
    CLIENT_LIST: '.client-list',
    REFRESHING: '.clients-refresh.disabled',
  },
  SETTINGS_COMMUNICATION: {
    BUTTON_MANAGE: '#marketing-email-manage',
    BUTTON_OPT_IN: '#marketing-email-optin',
    DETAILS: '#communication-preferences .settings-unit-details',
    MENU_BUTTON: '#communication-preferences .settings-unit-toggle',
    READY: '#communication-preferences.basket-ready'
  },
  SETTINGS_DELETE_ACCOUNT: {
    DETAILS: '#delete-account .settings-unit-details',
    MENU_BUTTON: '#delete-account .settings-unit-toggle'
  },
  SETTINGS_DISPLAY_NAME: {
    INPUT_DISPLAY_NAME: '#display-name input[type=text]',
    MENU_BUTTON: '#display-name button.settings-unit-toggle',
    SUBMIT: '#display-name button[type=submit]',
  },
  SIGNIN: {
    EMAIL: 'input[type=email]',
    EMAIL_NOT_EDITABLE: '.prefillEmail',
    ERROR: '.error',
    HEADER: '#fxa-signin-header',
    LINK_USE_DIFFERENT: '.use-different',
    MIGRATION_NUDGE: '#suggest-sync',
    PASSWORD: 'input[type=password]',
    PROGRESS_INDICATOR: '.step',
    RESET_PASSWORD: 'a[href^="/reset_password"]',
    SUB_HEADER: '#fxa-signin-header .service',
    SUBMIT: 'button[type=submit]',
    SUBMIT_USE_SIGNED_IN: '.use-logged-in',
    TOOLTIP: '.tooltip',
  },
  SIGNIN_BOUNCED: {
    BACK: '#back',
    CREATE_ACCOUNT: '#create-account',
    HEADER: '#fxa-signin-bounced-header',
    SUPPORT: '#support'
  },
  SIGNIN_COMPLETE: {
    CONTINUE_BUTTON: '.btn-continue',
    HEADER: '#fxa-sign-in-complete-header',
    SERVICE_NAME: '.account-ready-service'
  },
  SIGNIN_PASSWORD: {
    EMAIL: 'input[type=email]',
    HEADER: '#fxa-signin-password-header',
    LINK_FORGOT_PASSWORD: 'a[href^="/reset_password"]',
    LINK_MISTYPED_EMAIL: '.use-different',
    PASSWORD: 'input[type=password]',
    PROGRESS_INDICATOR: '.step',
    SHOW_PASSWORD: '#password ~ .show-password-label',
    SUB_HEADER: '#fxa-signin-password-header .service',
    SUBMIT: 'button[type="submit"]',
  },
  SIGNIN_RECOVERY_CODE: {
    DONE_BUTTON: '.two-step-authentication-done',
    FIRST_CODE: '.recovery-code:first-child',
    INPUT: '.recovery-code',
    LINK: '#use-recovery-code-link',
    MODAL: '#recovery-codes',
    SECOND_CODE: '.recovery-code:nth-child(2)',
    SUBMIT: 'button[type="submit"]',
  },
  SIGNIN_TOKEN_CODE: {
    EMAIL_FIELD: '.verification-email-message',
    ERROR: '.error',
    HEADER: '#fxa-signin-code-header',
    INPUT: '.token-code',
    SUBMIT: 'button[type="submit"]',
  },
  SIGNIN_UNBLOCK: {
    EMAIL_FIELD: '.verification-email-message',
    HEADER: '#fxa-signin-unblock-header',
    SUBMIT: 'button[type="submit"]',
    VERIFICATION: '.verification-email-message',
  },
  SIGNUP: {
    AGE: '#age',
    CUSTOMIZE_SYNC_CHECKBOX: '#customize-sync',
    EMAIL: 'input[type=email]',
    ERROR: '.error',
    FIREFOX_FAMILY_SERVICES: '.firefox-family-services',
    HEADER: '#fxa-signup-header',
    LINK_SIGN_IN: 'a#have-account',
    LINK_SUGGEST_EMAIL_DOMAIN_CORRECTION: '#email-suggestion',
    LINK_SUGGEST_SIGN_IN: '.error a[href="/signin"]',
    LINK_SUGGEST_SYNC: '#suggest-sync a',
    MARKETING_EMAIL_OPTIN: 'input.marketing-email-optin',
    MIGRATING_USER: '#suggest-sync',
    PASSWORD: '#password',
    SUB_HEADER: '#fxa-signup-header .service',
    SUBMIT: 'button[type="submit"]',
    SUGGEST_EMAIL_DOMAIN_CORRECTION: '.tooltip-suggest',
    SUGGEST_SIGN_IN: '.error',
    SUGGEST_SYNC: '#suggest-sync',
    TOOLTIP_BOUNCED_EMAIL: '.tooltip',
    VPASSWORD: '#vpassword',
  },
  SIGNUP_COMPLETE: {
    CONTINUE_BUTTON: '.btn-continue',
    HEADER: '#fxa-sign-up-complete-header',
    SERVICE_NAME: '.account-ready-service'
  },
  SIGNUP_PASSWORD: {
    AGE: '#age',
    EMAIL: 'input[type=email]',
    ERROR_PASSWORDS_DO_NOT_MATCH: '.error',
    FIREFOX_FAMILY_SERVICES: '.firefox-family-services',
    HEADER: '#fxa-signup-password-header',
    LINK_MISTYPED_EMAIL: '.use-different',
    PASSWORD: '#password',
    PASSWORD_BALLOON,
    PROGRESS_INDICATOR: '.step-1',
    SHOW_PASSWORD: '#password ~ .show-password-label',
    SHOW_VPASSWORD: '#vpassword ~ .show-password-label',
    SUBMIT: 'button[type="submit"]',
    VPASSWORD: '#vpassword',
  },
  SMS_LEARN_MORE: {
    HEADER: '#websites-notice'
  },
  SMS_SEND: {
    HEADER: '#fxa-send-sms-header',
    LINK_LEARN_MORE: 'a#learn-more',
    LINK_MARKETING: '.marketing-link',
    LINK_MARKETING_ANDROID: '.marketing-link-android',
    LINK_MARKETING_IOS: '.marketing-link-ios',
    LINK_START_BROWSING: 'a[href="https://www.mozilla.org"]',
    LINK_WHY_IS_THIS_REQUIRED: 'a[href="/sms/why"]',
    PHONE_NUMBER: 'input[type="tel"]',
    PHONE_NUMBER_TOOLTIP: 'input[type="tel"] ~ .tooltip',
    PROGRESS_INDICATOR: '.step-4',
    SUBMIT: 'button[type="submit"]',
    SUCCESS: '.success'
  },
  SMS_SENT: {
    HEADER: '#fxa-sms-sent-header',
    LINK_BACK: '#back',
    LINK_RESEND: '#resend',
    LINK_START_BROWSING: 'a[href="https://www.mozilla.org"]',
    PHONE_NUMBER_SENT_TO: '#send-success',
    RESEND_SUCCESS: '#resend-success'
  },
  SMS_WHY_IS_THIS_REQUIRED: {
    CLOSE: '.connect-another-device button[type="submit"]',
    HEADER: '#fxa-why-connect-another-device-header',
  },
  TOTP: {
    CANCEL_BUTTON: '.totp-cancel',
    CONFIRM_CODE_BUTTON: '.totp-confirm-code',
    CONFIRM_CODE_INPUT: '.totp-code',
    DELETE_BUTTON: '.totp-delete',
    ENABLE_BUTTON: '.secondary-button.totp-create',
    MANUAL_CODE: '.code',
    MENU_BUTTON: '#totp-section .settings-unit-toggle',
    QR_CODE: '.qr-image',
    RECOVERY_CODES_DESCRIPTION: '#recovery-codes .description',
    RECOVERY_CODES_DONE: '#recovery-codes .two-step-authentication-done',
    RECOVERY_CODES_REPLACE: '#recovery-codes .replace-codes-link',
    SHOW_CODE_LINK: '.show-code-link',
    STATUS_DISABLED: '.two-step-authentication .disabled',
    STATUS_ENABLED: '.two-step-authentication .enabled',
    UNLOCK_BUTTON: '.two-step-authentication .unlock-button',
    UNLOCK_REFRESH_BUTTON: '.two-step-authentication .refresh-verification-state',
    UNLOCK_SEND_VERIFY: '.two-step-authentication .send-verification-email',
  },
  TOTP_SIGNIN: {
    HEADER: '#fxa-totp-code-header',
    INPUT: '.totp-code',
    SUBMIT: 'button[type="submit"]',
  },
  UPDATE_FIREFOX: {
    BUTTON_DOWNLOAD_FIREFOX: '.primary-button',
    HEADER: '#fxa-update-firefox-header'
  },

};
/*eslint-enable max-len*/
