/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { SETTINGS_PATH } from '../../../constants';
import InputText from '../../InputText';
import FlowContainer from '../FlowContainer';
import { isEmailMask, isEmailValid } from 'fxa-shared/email/helpers';
import { useAccount, useAlertBar } from 'fxa-settings/src/models';
import { MfaGuard } from '../MfaGuard';
import { useErrorHandler } from 'react-error-boundary';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { isInvalidJwtError } from '../../../lib/mfa-guard-utils';
import { MfaReason } from '../../../lib/types';
import { useFtlMsgResolver } from '../../../models/hooks';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';

export const PageSecondaryEmailAdd = (_: RouteComponentProps) => {
  usePageViewEvent('settings.emails');
  const errorHandler = useErrorHandler();
  const [saveBtnDisabled, setSaveBtnDisabled] = useState(true);
  const [errorText, setErrorText] = useState<string>();
  const [email, setEmail] = useState<string>();
  const inputRefDOM = useRef<HTMLInputElement>(null);
  const ftlMsgResolver = useFtlMsgResolver();

  const subtitleText = ftlMsgResolver.getMsg(
    'add-secondary-email-step-1',
    'Step 1 of 2'
  );
  const navigateWithQuery = useNavigateWithQuery();
  const alertBar = useAlertBar();
  const account = useAccount();

  const goHome = () =>
    navigateWithQuery(SETTINGS_PATH + '#secondary-email', { replace: true });

  const createSecondaryEmail = useCallback(
    async (email: string) => {
      try {
        await account.createSecondaryEmail(email);
        navigateWithQuery('emails/verify', { state: { email }, replace: true });
      } catch (e) {
        if (isInvalidJwtError(e)) {
          // JWT invalid/expired
          errorHandler(e);
          return;
        }
        if (e.errno) {
          const localizedErrorMessage = getLocalizedErrorMessage(
            ftlMsgResolver,
            e
          );
          setErrorText(localizedErrorMessage);
        } else {
          alertBar.error(
            ftlMsgResolver.getMsg(
              'add-secondary-email-error-2',
              'There was a problem creating this email'
            )
          );
        }
      }
    },
    [
      account,
      navigateWithQuery,
      setErrorText,
      alertBar,
      errorHandler,
      ftlMsgResolver,
    ]
  );

  const checkEmail = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const email = inputRefDOM.current?.value || '';
      const isValid = isEmailValid(email);

      setSaveBtnDisabled(!isValid);
      setEmail(inputRefDOM.current?.value);
      setErrorText('');

      if (isEmailMask(email)) {
        const errorText = ftlMsgResolver.getMsg(
          'add-secondary-email-mask',
          'Email masks can’t be used as a secondary email'
        );
        setErrorText(errorText);
        setSaveBtnDisabled(true);
      }
    },
    [setSaveBtnDisabled, setErrorText, ftlMsgResolver]
  );

  return (
    <FtlMsg id="add-secondary-email-page-title" attrs={{ title: true }}>
      <FlowContainer title="Secondary email" subtitle={subtitleText}>
        <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            if (inputRefDOM.current) {
              createSecondaryEmail(email!);
              logViewEvent('settings.emails', 'submit');
            }
          }}
        >
          <div className="mt-4 mb-6" data-testid="secondary-email-input">
            <FtlMsg
              id="add-secondary-email-enter-address"
              attrs={{ label: true }}
            >
              <InputText
                label="Enter email address"
                type="email"
                onChange={checkEmail}
                inputRefDOM={inputRefDOM}
                {...{ errorText }}
              />
            </FtlMsg>
          </div>

          <div className="flex justify-center mx-auto max-w-64">
            <FtlMsg id="add-secondary-email-cancel-button">
              <button
                type="button"
                className="cta-neutral cta-base-p mx-2 flex-1"
                data-testid="cancel-button"
                onClick={goHome}
              >
                Cancel
              </button>
            </FtlMsg>
            <FtlMsg id="add-secondary-email-save-button">
              <button
                type="submit"
                className="cta-primary cta-base-p mx-2 flex-1"
                data-testid="save-button"
                disabled={saveBtnDisabled || account.loading}
              >
                Save
              </button>
            </FtlMsg>
          </div>
        </form>
      </FlowContainer>
    </FtlMsg>
  );
};

export const MfaGuardPageSecondaryEmailAdd = (_: RouteComponentProps) => {
  return (
    <MfaGuard requiredScope="email" reason={MfaReason.createSecondaryEmail}>
      <PageSecondaryEmailAdd />
    </MfaGuard>
  );
};
