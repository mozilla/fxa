/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import FormChoice, {
  CHOICES,
  FormChoiceData,
  FormChoiceOption,
} from '../../../components/FormChoice';
import { useFtlMsgResolver } from '../../../models';
import {
  BackupAuthenticationCodesImage,
  BackupRecoveryPhoneSmsImage,
} from '../../../components/images';
import ButtonBack from '../../../components/ButtonBack';

const SigninRecoveryMethod = () => {
  const onSubmit = async ({ choice }: FormChoiceData) => {
    // TODO: actually do something with this, maybe pull into container
    console.log('Submitted with choice:', choice);
  };

  const ftlMsgResolver = useFtlMsgResolver();
  // TODO, actually pull these values
  const numberOfCodes = 4;
  const lastFourPhoneNumber = 3019;

  const formChoices: FormChoiceOption[] = [
    {
      id: 'recovery-choice-phone',
      value: CHOICES.phone,
      image: <BackupRecoveryPhoneSmsImage />,
      localizedChoiceTitle: ftlMsgResolver.getMsg(
        'signin-recovery-method-phone',
        'Recovery phone'
      ),
      // This doesn't need localization
      localizedChoiceInfo: `••••••${lastFourPhoneNumber}`,
    },
    {
      id: 'recovery-choice-code',
      value: CHOICES.code,
      image: <BackupAuthenticationCodesImage />,
      localizedChoiceTitle: ftlMsgResolver.getMsg(
        'signin-recovery-method-code',
        'Authentication codes'
      ),
      localizedChoiceInfo: ftlMsgResolver.getMsg(
        'signin-recovery-method-code-info',
        `${numberOfCodes} codes remaining`,
        { numberOfCodes }
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="relative flex items-start">
        <ButtonBack />
        <FtlMsg id="signin-recovery-method-header">
          <HeadingPrimary>Sign in</HeadingPrimary>
        </FtlMsg>
      </div>

      <FormChoice {...{ legendEl, onSubmit, formChoices }} />
    </AppLayout>
  );
};
const legendEl = (
  <>
    <legend>
      <FtlMsg id="signin-recovery-method-subheader">
        <h2 className="card-header">Choose a recovery method</h2>
      </FtlMsg>
    </legend>
    <FtlMsg id="signin-recovery-method-details">
      <p className="pt-2 mb-8">
        Let’s make sure it’s you using your recovery methods.
      </p>
    </FtlMsg>
  </>
);

export default SigninRecoveryMethod;
