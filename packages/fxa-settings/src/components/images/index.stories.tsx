/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';

import {
  EmailCodeImage,
  HeartsBrokenImage,
  HeartsVerifiedImage,
  LightbulbImage,
  PasswordImage,
  MailImage,
  RecoveryCodesImage,
  RecoveryKeyImage,
  TwoFactorAuthImage,
} from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Images',
  subcomponents: {
    EmailCodeImage,
    HeartsBrokenImage,
    HeartsVerifiedImage,
    LightbulbImage,
    PasswordImage,
    MailImage,
    RecoveryCodesImage,
    RecoveryKeyImage,
    TwoFactorAuthImage,
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

export const RecoveryCodes = () => <RecoveryCodesImage />;

export const TwoFactorAuth = () => <TwoFactorAuthImage />;
