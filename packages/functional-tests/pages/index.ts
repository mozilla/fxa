/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { AvatarPage } from './settings/avatar';
import { BaseTarget } from '../lib/targets/base';
import { ConfigPage } from './config';
import { ConfirmSignupCodePage } from './confirmSignupCode';
import { ConnectAnotherDevicePage } from './connectAnotherDevice';
import { CookiesDisabledPage } from './cookiesDisabled';
import { ChangePasswordPage } from './settings/changePassword';
import { DeleteAccountPage } from './settings/deleteAccount';
import { DisplayNamePage } from './settings/displayName';
import { FourOhFourPage } from './fourOhFour';
import { FxDesktopV3ForceAuthPage } from './forceAuth/fxDesktopV3';
import { ForceAuthPage } from './forceAuth';
import { LegalPage } from './legal';
import { LoginPage } from './login';
import { PostVerifyPage } from './postVerify';
import { PrivacyPage } from './privacy';
import { RecoveryKeyPage } from './settings/recoveryKey';
import { RelierPage } from './relier';
import { ResetPasswordPage } from './resetPassword';
import { SecondaryEmailPage } from './settings/secondaryEmail';
import { SettingsPage } from './settings';
import { SigninPage } from './signin';
import { SigninRecoveryCodePage } from './signinRecoveryCode';
import { SigninTokenCodePage } from './signinTokenCode';
import { SigninTotpCodePage } from './signinTotpCode';
import { SigninUnblockPage } from './signinUnblock';
import { SignupPage } from './signup';
import { SubscribePage } from './products';
import { TermsOfService } from './termsOfService';
import { TotpPage } from './settings/totp';

export function create(page: Page, target: BaseTarget) {
  return {
    avatar: new AvatarPage(page, target),
    changePassword: new ChangePasswordPage(page, target),
    configPage: new ConfigPage(page, target),
    confirmSignupCode: new ConfirmSignupCodePage(page, target),
    connectAnotherDevice: new ConnectAnotherDevicePage(page, target),
    cookiesDisabled: new CookiesDisabledPage(page, target),
    deleteAccount: new DeleteAccountPage(page, target),
    displayName: new DisplayNamePage(page, target),
    forceAuth: new ForceAuthPage(page, target),
    fourOhFour: new FourOhFourPage(page, target),
    fxDesktopV3ForceAuth: new FxDesktopV3ForceAuthPage(page, target),
    legal: new LegalPage(page, target),
    login: new LoginPage(page, target),
    page,
    postVerify: new PostVerifyPage(page, target),
    privacy: new PrivacyPage(page, target),
    recoveryKey: new RecoveryKeyPage(page, target),
    relier: new RelierPage(page, target),
    resetPassword: new ResetPasswordPage(page, target),
    secondaryEmail: new SecondaryEmailPage(page, target),
    settings: new SettingsPage(page, target),
    signin: new SigninPage(page, target),
    signinRecoveryCode: new SigninRecoveryCodePage(page, target),
    signinTokenCode: new SigninTokenCodePage(page, target),
    signinTotpCode: new SigninTotpCodePage(page, target),
    signinUnblock: new SigninUnblockPage(page, target),
    signup: new SignupPage(page, target),
    subscribe: new SubscribePage(page, target),
    termsOfService: new TermsOfService(page, target),
    totp: new TotpPage(page, target),
  };
}
