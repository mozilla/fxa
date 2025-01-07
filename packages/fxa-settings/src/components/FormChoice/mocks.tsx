/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { CHOICES } from '.';
import {
  BackupAuthenticationCodesImage,
  BackupRecoveryPhoneSmsImage,
} from '../images';

export const commonFormChoiceProps = {
  onSubmit: (data: any) => console.log('Submitted with choice:', data),
  legendEl: (
    <legend>
      <h2 className="card-header mb-4">I am (form) legend</h2>
    </legend>
  ),
  formChoices: [
    {
      id: 'recovery-choice-phone',
      value: CHOICES.phone,
      image: <BackupRecoveryPhoneSmsImage />,
      localizedChoiceTitle: '1st Choice Example',
      localizedChoiceInfo: '1st example description',
    },
    {
      id: 'recovery-choice-code',
      value: CHOICES.code,
      image: <BackupAuthenticationCodesImage />,
      localizedChoiceTitle: '2nd Choice Example',
      localizedChoiceInfo: '2nd example description',
    },
  ],
};
