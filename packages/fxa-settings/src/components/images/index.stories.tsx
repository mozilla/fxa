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
} from '.';
import { withLocalization } from '../../../.storybook/decorators';

export default {
  title: 'Components/Images',
  subcomponents: {
    RecoveryCodesImage,
    MailImage,
    HeartsBrokenImage,
    HeartsVerifiedImage,
    TwoFactorAuthImage,
  },
  decorators: [withLocalization],
} as Meta;

export const RecoveryCodesIllustration = () => <RecoveryCodesImage />;

export const MailIllustration = () => <MailImage />;

export const HeartsBrokenIllustration = () => <HeartsBrokenImage />;

export const HeartsVerifiedIllustration = () => <HeartsVerifiedImage />;

export const TwoFactorAuthIllustration = () => <TwoFactorAuthImage />;
