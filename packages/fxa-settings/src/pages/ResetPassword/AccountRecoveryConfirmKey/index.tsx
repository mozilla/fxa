/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, RouteComponentProps } from '@reach/router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { useAlertBar } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models/hooks';

import { InputText } from '../../../components/InputText';
import CardHeader from '../../../components/CardHeader';
import WarningMessage from '../../../components/WarningMessage';
import LinkExpired from '../../../components/LinkExpired';
import LinkDamaged from '../../../components/LinkDamaged';

// --serviceName-- is the relying party

export type AccountRecoveryConfirmKeyProps = {
  serviceName?: string;
  linkStatus: LinkStatus;
};

type FormData = {
  recoveryKey: string;
};

type LinkStatus = 'damaged' | 'expired' | 'valid';

// eslint-disable-next-line no-empty-pattern
const AccountRecoveryConfirmKey = ({
  serviceName,
  linkStatus,
}: AccountRecoveryConfirmKeyProps & RouteComponentProps) => {
  // TODO: confirm event name
  usePageViewEvent('account-recovery-confirm-key', {
    entrypoint_variation: 'react',
  });

  const [recoveryKey, setRecoveryKey] = useState<string>('');
  const [recoveryKeyErrorText, setRecoveryKeyErrorText] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const alertBar = useAlertBar();
  const onFocusMetricsEvent = 'account-recovery-confirm-key.engage';
  const ftlMsgResolver = useFtlMsgResolver();

  const { handleSubmit } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      recoveryKey: '',
    },
  });

  const onFocus = () => {
    if (!isFocused && onFocusMetricsEvent) {
      logViewEvent('flow', onFocusMetricsEvent, {
        entrypoint_variation: 'react',
      });
      setIsFocused(true);
    }
  };

  const checkRecoveryKey = () => {
    // TODO AccountRecoveryConfirmKey function
    console.log(recoveryKey);
  };

  // --TODO: Complete onSubmit handling--
  const onSubmit = () => {
    if (recoveryKey === '') {
      const errorEmptyRecoveryKeyInput = ftlMsgResolver.getMsg(
        'account-recovery-confirm-key-empty-input-error',
        'Account recovery key required'
      );
      setRecoveryKeyErrorText(errorEmptyRecoveryKeyInput);
      return;
    }
    try {
      checkRecoveryKey();
      logViewEvent('flow', 'account-recovery-confirm-key.submit', {
        entrypoint_variation: 'react',
      });
    } catch (e) {
      const errorAccountRecoveryConfirmKey = ftlMsgResolver.getMsg(
        'account-recovery-confirm-key-error-general',
        // Original error message was 'invalid hex string: null'
        // Probably should not be user-facing
        'Invalid account recovery key'
      );
      alertBar.error(errorAccountRecoveryConfirmKey);
    }
  };

  return (
    <>
      {linkStatus === 'damaged' && <LinkDamaged linkType="reset-password" />}
      {linkStatus === 'expired' && <LinkExpired linkType="reset-password" />}

      {linkStatus === 'valid' && (
        <>
          <CardHeader
            headingWithDefaultServiceFtlId="account-recovery-confirm-key-heading-w-default-service"
            headingWithCustomServiceFtlId="account-recovery-confirm-key-heading-w-custom-service"
            headingText={`Reset password with account recovery key`}
            {...{ serviceName }}
          />
          <FtlMsg id="account-recovery-confirm-key-instructions">
            <p className="mt-4 text-sm">
              Please enter the one time use account recovery key you stored in a
              safe place to regain access to your Firefox Account.
            </p>
          </FtlMsg>
          <WarningMessage
            warningMessageFtlId="account-recovery-confirm-key-warning-message"
            warningType="Note:"
          >
            If you reset your password and don't have account recovery key
            saved, some of your data will be erased (including synced server
            data like history and bookmarks).
          </WarningMessage>

          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
            data-testid="account-recovery-confirm-key-form"
          >
            <FtlMsg id="account-recovery-confirm-key-input">
              <InputText
                type="text"
                label="Enter account recovery key"
                name="recoveryKey"
                onChange={(e) => {
                  setRecoveryKey(e.target.value);
                }}
                errorText={recoveryKeyErrorText}
                onFocusCb={onFocusMetricsEvent ? onFocus : undefined}
                autoFocus
                className="text-start"
                anchorStart
                autoComplete="off"
                spellCheck={false}
                prefixDataTestId="account-recovery-confirm-key"
              />
            </FtlMsg>

            <FtlMsg id="account-recovery-confirm-key-button">
              <button type="submit" className="cta-primary cta-xl mb-6">
                Confirm account recovery key
              </button>
            </FtlMsg>
          </form>

          {/* TODO: log 'lost-recovery-key' flow event, pass lostRecoveryKey:true, accountResetToken  */}
          <FtlMsg id="account-recovery-lost-recovery-key-link">
            <Link
              to={'/complete_password_reset'}
              className="link-blue text-sm"
              id="lost-recovery-key"
            >
              Don't have an account recovery key?
            </Link>
          </FtlMsg>
        </>
      )}
    </>
  );
};

export default AccountRecoveryConfirmKey;
