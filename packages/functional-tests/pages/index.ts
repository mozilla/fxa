import { Page } from '@playwright/test';
import { AvatarPage } from './settings/avatar';
import { BaseTarget } from '../lib/targets/base';
import { ConfigPage } from './config';
import { ConfirmSignupCodePage } from './confirmSignupCodePage.ts';
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
import { ResetPasswordReactPage } from './resetPasswordReact';
import { SecondaryEmailPage } from './settings/secondaryEmail';
import { SettingsPage } from './settings';
import { SigninReactPage } from './signinReact';
import { SigninTokenCodePage } from './signinTokenCode.ts';
import { SigninTotpCodePage } from './signinTotpCode.ts';
import { SigninUnblockPage } from './signinUnblock.ts';
import { SignupReactPage } from './signupReact';
import { SubscribePage } from './products';
import { SubscriptionManagementPage } from './products/subscriptionManagement';
import { TermsOfService } from './termsOfService';
import { TotpPage } from './settings/totp';
import { SigninRecoveryCodePage } from './signinRecoveryCode.ts';

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
    resetPasswordReact: new ResetPasswordReactPage(page, target),
    secondaryEmail: new SecondaryEmailPage(page, target),
    settings: new SettingsPage(page, target),
    signinReact: new SigninReactPage(page, target),
    signinRecoveryCode: new SigninRecoveryCodePage(page, target),
    signinTokenCode: new SigninTokenCodePage(page, target),
    signinTotpCode: new SigninTotpCodePage(page, target),
    signinUnblock: new SigninUnblockPage(page, target),
    signupReact: new SignupReactPage(page, target),
    subscribe: new SubscribePage(page, target),
    subscriptionManagement: new SubscriptionManagementPage(page, target),
    termsOfService: new TermsOfService(page, target),
    totp: new TotpPage(page, target),
  };
}
