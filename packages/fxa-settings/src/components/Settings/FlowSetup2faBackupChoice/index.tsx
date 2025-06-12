/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { GleanClickEventType2FA } from '../../../lib/types';
import GleanMetrics from '../../../lib/glean';
import {
  BackupAuthenticationCodesImage,
  BackupRecoveryPhoneSmsImage,
} from '../../images';
import { useFtlMsgResolver } from '../../../models';
import FormChoice, { Choice, CHOICES, FormChoiceData } from '../../FormChoice';
import LinkExternal from 'fxa-react/components/LinkExternal';

type FlowSetup2faBackupChoiceProps = {
  currentStep?: number;
  numberOfSteps?: number;
  hideBackButton?: boolean;
  localizedFlowTitle: string;
  onBackButtonClick?: () => void;
  showProgressBar?: boolean;
  onSubmitCb: (choice: Choice) => void;
  reason?: GleanClickEventType2FA;
};

export const FlowSetup2faBackupChoice = ({
  currentStep,
  numberOfSteps,
  hideBackButton = false,
  localizedFlowTitle,
  onBackButtonClick,
  showProgressBar = true,
  onSubmitCb,
  reason = GleanClickEventType2FA.setup,
}: FlowSetup2faBackupChoiceProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    GleanMetrics.accountPref.twoStepAuthBackupChoiceView({
      event: { reason },
    });
  }, [reason]);

  const onSubmit = useCallback(
    ({ choice }: FormChoiceData) => {
      setIsSubmitting(true);
      GleanMetrics.accountPref.twoStepAuthBackupChoiceSubmit({
        event: { reason, choice },
      });
      onSubmitCb(choice);
      setIsSubmitting(false);
    },
    [onSubmitCb, reason]
  );

  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <FlowContainer
      title={localizedFlowTitle}
      {...{ hideBackButton, onBackButtonClick }}
    >
      {showProgressBar && currentStep != null && numberOfSteps != null && (
        <ProgressBar {...{ currentStep, numberOfSteps }} />
      )}
      <FormChoice
        legendEl={
          <>
            <legend>
              <FtlMsg id="flow-setup-2fa-backup-choice-heading">
                <h2 className="font-bold text-xl my-2">
                  Choose a recovery method
                </h2>
              </FtlMsg>
            </legend>
            <FtlMsg id="flow-setup-2fa-backup-choice-description">
              <p className="mb-4">
                This allows you to sign in if you can’t access your mobile
                device or authenticator app.
              </p>
            </FtlMsg>
          </>
        }
        contentAlignVertical="top"
        formChoices={[
          {
            id: 'backup-choice-phone',
            value: CHOICES.phone,
            localizedChoiceTitle: ftlMsgResolver.getMsg(
              'flow-setup-2fa-backup-choice-phone-title',
              'Recovery phone'
            ),
            localizedChoiceBadge: ftlMsgResolver.getMsg(
              'flow-setup-2fa-backup-choice-phone-badge',
              'Easiest'
            ),
            localizedChoiceInfo: ftlMsgResolver.getMsg(
              'flow-setup-2fa-backup-choice-phone-info',
              'Get a recovery code via text message. Currently available in the USA and Canada.'
            ),
            image: (
              <BackupRecoveryPhoneSmsImage
                className="max-h-44 mt-[6px]"
                ariaHidden
              />
            ),
          },
          {
            id: 'backup-choice-code',
            value: CHOICES.code,
            localizedChoiceTitle: ftlMsgResolver.getMsg(
              'flow-setup-2fa-backup-choice-code-title',
              'Backup authentication codes'
            ),
            localizedChoiceBadge: ftlMsgResolver.getMsg(
              'flow-setup-2fa-backup-choice-code-badge',
              'Safest'
            ),
            localizedChoiceInfo: ftlMsgResolver.getMsg(
              'flow-setup-2fa-backup-choice-code-info',
              'Create and save one-time-use authentication codes.'
            ),
            image: (
              <BackupAuthenticationCodesImage
                className="max-h-44 mt-[6px]"
                ariaHidden
              />
            ),
          },
        ]}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
      <FtlMsg id="flow-setup-2fa-backup-choice-learn-more-link">
        <LinkExternal
          href="https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication"
          className="link-blue mt-5 text-sm mx-auto"
          gleanDataAttrs={{
            id: 'two_step_auth_backup_choice_learn_more_link',
            type: reason,
          }}
        >
          Learn about recovery and SIM swap risk
        </LinkExternal>
      </FtlMsg>
    </FlowContainer>
  );
};
