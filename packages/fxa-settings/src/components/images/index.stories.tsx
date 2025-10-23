/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';

import { withLocalization } from 'fxa-react/lib/storybooks';
import {
  BackupAuthenticationCodesImage,
  BackupCodesImage,
  BackupRecoveryPhoneCodeImage,
  BackupRecoveryPhoneImage,
  BackupRecoveryPhoneSmsImage,
  EmailCodeImage,
  FallingConfettiImage,
  HeartsBrokenImage,
  HeartsVerifiedImage,
  LightbulbImage,
  MailImage,
  PasswordImage,
  PasswordSuccessImage,
  RecoveryKeyImage,
  SyncCloudsImage,
  TwoFactorAuthImage,
} from '.';

export default {
  title: 'Components/Images',
  subcomponents: {
    EmailCodeImage,
    HeartsBrokenImage,
    HeartsVerifiedImage,
    LightbulbImage,
    PasswordImage,
    MailImage,
    BackupCodesImage,
    RecoveryKeyImage,
    TwoFactorAuthImage,
    PasswordSuccessImage,
    BackupRecoveryPhoneImage,
    BackupRecoveryPhoneCodeImage,
  },
  decorators: [withLocalization],
} as Meta;

export const EmailCode = () => <EmailCodeImage />;

export const HeartsBroken = () => <HeartsBrokenImage />;

export const HeartsVerified = () => <HeartsVerifiedImage />;

export const Key = () => <RecoveryKeyImage />;

export const Lightbulb = () => <LightbulbImage />;

export const Password = () => <PasswordImage />;

export const Mail = () => <MailImage />;

export const BackupCodes = () => <BackupCodesImage />;

export const TwoFactorAuth = () => <TwoFactorAuthImage />;

export const PasswordSuccess = () => <PasswordSuccessImage />;

export const BackupRecoveryPhone = () => <BackupRecoveryPhoneImage />;

export const BackupRecoveryPhoneCode = () => <BackupRecoveryPhoneCodeImage />;

export const BackupRecoveryPhoneSms = () => <BackupRecoveryPhoneSmsImage />;

export const BackupAuthenticationCodes = () => (
  <BackupAuthenticationCodesImage />
);
export const SyncClouds = () => <SyncCloudsImage />;

export const ConfettiFallingFullPage = () => <FallingConfettiImage />;
