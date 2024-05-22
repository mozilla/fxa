/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';

import {
  RecoveryCodesImage,
  MailImage,
  HeartsBrokenImage,
  HeartsVerifiedImage,
  TwoFactorAuthImage,
  SecurityShieldImage,
  LockImage,
  RecoveryKeyImage,
  LightbulbImage,
} from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Images',
  subcomponents: {
    RecoveryCodesImage,
    MailImage,
    HeartsBrokenImage,
    HeartsVerifiedImage,
    TwoFactorAuthImage,
    SecurityShieldImage,
  },
  decorators: [withLocalization],
} as Meta;

export const RecoveryCodes = () => <RecoveryCodesImage />;

export const Mail = () => <MailImage />;

export const HeartsBroken = () => <HeartsBrokenImage />;

export const HeartsVerified = () => <HeartsVerifiedImage />;

export const TwoFactorAuth = () => <TwoFactorAuthImage />;

export const SecurityShield = () => <SecurityShieldImage />;

export const Lock = () => <LockImage />;

export const Key = () => <RecoveryKeyImage />;

export const Lightbulb = () => <LightbulbImage />;

export const EmailCode = () => <EmailCode />;
