import { Page } from '@playwright/test';
import { BaseTarget } from '../lib/targets/base';
import { ChangePasswordPage } from './settings/changePassword';
import { DeleteAccountPage } from './settings/deleteAccount';
import { DisplayNamePage } from './settings/displayName';
import { LoginPage } from './login';
import { RecoveryKeyPage } from './settings/recoveryKey';
import { RelierPage } from './relier';
import { SecondaryEmailPage } from './settings/secondaryEmail';
import { SettingsPage } from './settings';
import { SubscribePage } from './products';
import { TotpPage } from './settings/totp';
import { AvatarPage } from './settings/avatar';

export function create(page: Page, target: BaseTarget) {
  return {
    page,
    avatar: new AvatarPage(page, target),
    changePassword: new ChangePasswordPage(page, target),
    deleteAccount: new DeleteAccountPage(page, target),
    displayName: new DisplayNamePage(page, target),
    login: new LoginPage(page, target),
    secondaryEmail: new SecondaryEmailPage(page, target),
    settings: new SettingsPage(page, target),
    subscribe: new SubscribePage(page, target),
    recoveryKey: new RecoveryKeyPage(page, target),
    relier: new RelierPage(page, target),
    totp: new TotpPage(page, target),
  };
}
