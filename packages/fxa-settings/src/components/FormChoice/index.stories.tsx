/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import FormChoice from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import AppLayout from '../AppLayout';
import { commonFormChoiceProps } from './mocks';
import {
  BackupAuthenticationCodesImage,
  BackupRecoveryPhoneSmsImage,
} from '../images';

export default {
  title: 'components/FormChoice',
  component: FormChoice,
  decorators: [withLocalization],
} as Meta;

export const DefaultLeftAlignedImages = () => (
  <AppLayout>
    <FormChoice {...commonFormChoiceProps} />
  </AppLayout>
);

export const WithBadges = () => (
  <AppLayout>
    <FormChoice
      {...commonFormChoiceProps}
      formChoices={[
        {
          ...commonFormChoiceProps.formChoices[0],
          localizedChoiceBadge: '1st badge',
        },
        {
          ...commonFormChoiceProps.formChoices[1],
          localizedChoiceBadge: '2nd badge',
        },
      ]}
    />
  </AppLayout>
);

export const TopAlignedImages = () => (
  <AppLayout>
    <FormChoice
      {...commonFormChoiceProps}
      contentAlignVertical="top"
      formChoices={[
        {
          ...commonFormChoiceProps.formChoices[0],
          localizedChoiceBadge: '1st badge',
          image: (
            <BackupRecoveryPhoneSmsImage
              ariaHidden
              className="max-h-44 mt-[6px]"
            />
          ),
        },
        {
          ...commonFormChoiceProps.formChoices[1],
          localizedChoiceBadge: '2nd badge',
          image: (
            <BackupAuthenticationCodesImage
              ariaHidden
              className="max-h-44 mt-[6px]"
            />
          ),
        },
      ]}
    />
  </AppLayout>
);

export const RightAlignedImages = () => (
  <AppLayout>
    <FormChoice imagePosition="end" {...commonFormChoiceProps} />
  </AppLayout>
);
