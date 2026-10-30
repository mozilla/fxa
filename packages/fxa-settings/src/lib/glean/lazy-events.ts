/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GleanPingMetrics } from './web/index';
import * as accountBanner from './web/accountBanner';
import * as accountPref from './web/accountPref';
import * as cad from './web/cad';
import * as cadApproveDevice from './web/cadApproveDevice';
import * as cadFirefox from './web/cadFirefox';
import * as cadMobilePair from './web/cadMobilePair';
import * as cadMobilePairUseApp from './web/cadMobilePairUseApp';
import * as cadRedirectDesktop from './web/cadRedirectDesktop';
import * as cadRedirectMobile from './web/cadRedirectMobile';
import * as deleteAccount from './web/deleteAccount';
import * as dtmDesktop from './web/dtmDesktop';
import * as dtmMobile from './web/dtmMobile';
import * as firefoxPromo from './web/firefoxPromo';

// Settings, CAD and DTM events, split out so sign-in routes do not bundle them.
export const recordLazyEventMetric = (
  eventName: string,
  gleanPingMetrics: GleanPingMetrics
) => {
  switch (eventName) {
    case 'cad_view':
      cad.view.record();
      break;
    case 'cad_submit':
      cad.submit.record();
      break;
    case 'cad_startbrowsing_submit':
      cad.startbrowsingSubmit.record();
      break;
    case 'cad_firefox_view':
      cadFirefox.view.record();
      break;
    case 'cad_firefox_choice_view':
      cadFirefox.choiceView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'cad_firefox_choice_engage':
      cadFirefox.choiceEngage.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'cad_firefox_choice_submit':
      cadFirefox.choiceSubmit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'cad_firefox_choice_notnow_submit':
      cadFirefox.choiceNotnowSubmit.record();
      break;
    case 'cad_firefox_sync_device_submit':
      cadFirefox.syncDeviceSubmit.record();
      break;
    case 'cad_firefox_notnow_submit':
      cadFirefox.notnowSubmit.record();
      break;
    case 'cad_firefox_download_firefox_view':
      cadFirefox.downloadFirefoxView.record({
        browser_family: gleanPingMetrics?.event?.['browser_family'] || '',
      });
      break;
    case 'cad_approve_device_view':
      cadApproveDevice.view.record();
      break;
    case 'cad_approve_device_submit':
      cadApproveDevice.submit.record();
      break;
    case 'cad_mobile_pair_view':
      cadMobilePair.view.record();
      break;
    case 'cad_mobile_pair_submit':
      cadMobilePair.submit.record();
      break;
    case 'cad_mobile_pair_use_app_view':
      cadMobilePairUseApp.view.record({
        browser_family: gleanPingMetrics?.event?.['browser_family'] || '',
      });
      break;
    case 'cad_redirect_desktop_view':
      cadRedirectDesktop.view.record({
        browser_family: gleanPingMetrics?.event?.['browser_family'] || '',
      });
      break;
    case 'cad_redirect_desktop_default_view':
      cadRedirectDesktop.defaultView.record({
        browser_family: gleanPingMetrics?.event?.['browser_family'] || '',
      });
      break;
    case 'cad_redirect_desktop_download':
      cadRedirectDesktop.download.record();
      break;
    case 'cad_redirect_mobile_view':
      cadRedirectMobile.view.record({
        browser_family: gleanPingMetrics?.event?.['browser_family'] || '',
      });
      break;
    case 'account_pref_view':
      accountPref.view.record();
      break;
    case 'account_pref_recovery_key_submit':
      accountPref.recoveryKeySubmit.record();
      break;
    case 'account_pref_two_step_auth_submit':
      accountPref.twoStepAuthSubmit.record();
      break;
    case 'account_pref_two_step_auth_scan_code_link':
      accountPref.twoStepAuthScanCodeLink.record();
      break;
    case 'account_pref_two_step_auth_qr_view':
      accountPref.twoStepAuthQrView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_two_step_auth_qr_code_success':
      accountPref.twoStepAuthQrCodeSuccess.record();
      break;
    case 'account_pref_two_step_auth_manual_code_view':
      accountPref.twoStepAuthManualCodeView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_two_step_auth_codes_view':
      accountPref.twoStepAuthCodesView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_two_step_auth_enter_code_view':
      accountPref.twoStepAuthEnterCodeView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_two_step_auth_backup_choice_view':
      accountPref.twoStepAuthBackupChoiceView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_two_step_auth_backup_choice_submit':
      accountPref.twoStepAuthBackupChoiceSubmit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
        choice: gleanPingMetrics?.event?.['choice'] || '',
      });
      break;
    case 'account_pref_change_password_submit':
      accountPref.changePasswordSubmit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_google_unlink_submit':
      accountPref.googleUnlinkSubmit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_google_unlink_submit_confirm':
      accountPref.googleUnlinkSubmitConfirm.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_apple_unlink_submit':
      accountPref.appleUnlinkSubmit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_apple_unlink_submit_confirm':
      accountPref.appleUnlinkSubmitConfirm.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_device_signout':
      accountPref.deviceSignout.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_google_play_submit':
      accountPref.googlePlaySubmit.record();
      break;
    case 'account_pref_apple_submit':
      accountPref.appleSubmit.record();
      break;
    case 'account_pref_display_name_submit':
      accountPref.displayNameSubmit.record();
      break;
    case 'account_pref_secondary_email_submit':
      accountPref.secondaryEmailSubmit.record();
      break;
    case 'account_pref_help':
      accountPref.help.record();
      break;
    case 'account_pref_bento_view':
      accountPref.bentoView.record({
        nimbus_user_id: gleanPingMetrics?.event?.['nimbusUserId'] || '',
      });
      break;
    case 'account_pref_bento_firefox_desktop':
      accountPref.bentoFirefoxDesktop.record();
      break;
    case 'account_pref_bento_firefox_mobile':
      accountPref.bentoFirefoxMobile.record();
      break;
    case 'account_pref_bento_monitor':
      accountPref.bentoMonitor.record();
      break;
    case 'account_pref_bento_relay':
      accountPref.bentoRelay.record();
      break;
    case 'account_pref_bento_vpn':
      accountPref.bentoVpn.record();
      break;
    case 'account_pref_two_step_auth_enter_code_success_view':
      accountPref.twoStepAuthEnterCodeSuccessView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_two_step_auth_phone_submit_view':
      accountPref.twoStepAuthPhoneSubmitView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_two_step_auth_phone_verify_view':
      accountPref.twoStepAuthPhoneVerifyView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_two_step_auth_phone_remove_success_view':
      accountPref.twoStepAuthPhoneRemoveSuccessView.record();
      break;
    case 'account_pref_two_step_auth_disable_modal_view':
      accountPref.twoStepAuthDisableModalView.record();
      break;
    case 'account_pref_two_step_auth_disable_success_view':
      accountPref.twoStepAuthDisableSuccessView.record();
      break;
    case 'account_pref_two_step_auth_complete_view':
      accountPref.twoStepAuthCompleteView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'delete_account_settings_submit':
      deleteAccount.settingsSubmit.record();
      break;
    case 'delete_account_view':
      deleteAccount.view.record();
      break;
    case 'delete_account_engage':
      deleteAccount.engage.record();
      break;
    case 'delete_account_submit':
      deleteAccount.submit.record();
      break;
    case 'delete_account_password_view':
      deleteAccount.passwordView.record();
      break;
    case 'delete_account_password_submit':
      deleteAccount.passwordSubmit.record();
      break;
    case 'account_pref_promo_monitor_view':
      accountPref.promoMonitorView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_promo_monitor_submit':
      accountPref.promoMonitorSubmit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_promo_vpn_view':
      accountPref.promoVpnView.record();
      break;
    case 'account_pref_promo_vpn_submit':
      accountPref.promoVpnSubmit.record();
      break;
    case 'account_pref_mfa_guard_view':
      accountPref.mfaGuardView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_mfa_guard_submit_success':
      accountPref.mfaGuardSubmitSuccess.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_passkey_create_view':
      accountPref.passkeyCreateView.record();
      break;
    case 'account_pref_passkey_create_submit_frontend_error':
      accountPref.passkeyCreateSubmitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_passkey_create_success_view':
      accountPref.passkeyCreateSuccessView.record();
      break;
    case 'account_pref_passkey_create_retry_without_prf_request':
      accountPref.passkeyCreateRetryWithoutPrfRequest.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
        outcome: gleanPingMetrics?.event?.['outcome'] || '',
      });
      break;
    case 'account_pref_passkey_delete_view':
      accountPref.passkeyDeleteView.record();
      break;
    case 'account_pref_passkey_delete_submit_frontend_error':
      accountPref.passkeyDeleteSubmitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_passkey_delete_success_view':
      accountPref.passkeyDeleteSuccessView.record();
      break;
    case 'account_pref_passkey_rename_view':
      accountPref.passkeyRenameView.record();
      break;
    case 'account_pref_passkey_rename_submit_frontend_error':
      accountPref.passkeyRenameSubmitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'account_pref_passkey_rename_success_view':
      accountPref.passkeyRenameSuccessView.record();
      break;
    case 'account_banner_create_recovery_key_view':
      accountBanner.createRecoveryKeyView.record();
      break;
    case 'account_banner_add_recovery_phone_view':
      accountBanner.addRecoveryPhoneView.record();
      break;
    case 'account_banner_reactivation_success_view':
      accountBanner.reactivationSuccessView.record();
      break;
    case 'firefox_promo_connect_mobile_view':
      firefoxPromo.connectMobileView.record({
        mobile_device_count:
          gleanPingMetrics?.event?.['mobile_device_count'] || '',
      });
      break;
    case 'firefox_promo_connect_mobile_submit':
      firefoxPromo.connectMobileSubmit.record({
        mobile_device_count:
          gleanPingMetrics?.event?.['mobile_device_count'] || '',
      });
      break;
    case 'firefox_promo_connect_mobile_dismiss':
      firefoxPromo.connectMobileDismiss.record({
        mobile_device_count:
          gleanPingMetrics?.event?.['mobile_device_count'] || '',
      });
      break;
    case 'firefox_promo_switch_to_firefox_view':
      firefoxPromo.switchToFirefoxView.record({
        mobile_device_count:
          gleanPingMetrics?.event?.['mobile_device_count'] || '',
      });
      break;
    case 'firefox_promo_switch_to_firefox_submit':
      firefoxPromo.switchToFirefoxSubmit.record({
        mobile_device_count:
          gleanPingMetrics?.event?.['mobile_device_count'] || '',
      });
      break;
    case 'firefox_promo_switch_to_firefox_dismiss':
      firefoxPromo.switchToFirefoxDismiss.record({
        mobile_device_count:
          gleanPingMetrics?.event?.['mobile_device_count'] || '',
      });
      break;
    case 'dtm_desktop_qr_skip':
      dtmDesktop.qrSkip.record();
      break;
    case 'dtm_desktop_timeout_view':
      dtmDesktop.timeoutView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'dtm_mobile_timeout_view':
      dtmMobile.timeoutView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'dtm_mobile_deeplink_attempt':
      dtmMobile.deeplinkAttempt.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'dtm_mobile_deeplink_firefox_detected':
      dtmMobile.deeplinkFirefoxDetected.record();
      break;
    case 'dtm_mobile_deeplink_store_redirect':
      dtmMobile.deeplinkStoreRedirect.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'dtm_mobile_deeplink_webview_fallback':
      dtmMobile.deeplinkWebviewFallback.record();
      break;
  }
};
