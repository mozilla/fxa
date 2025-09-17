/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import { Localized, useLocalization } from '@fluent/react';
import { RouteComponentProps } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { SETTINGS_PATH } from '../../../constants';
import InputText from '../../InputText';
import FlowContainer from '../FlowContainer';
import { isEmailMask, isEmailValid } from 'fxa-shared/email/helpers';
import { useAccount, useAlertBar } from 'fxa-settings/src/models';
import { AuthUiErrorNos } from 'fxa-settings/src/lib/auth-errors/auth-errors';
import { getErrorFtlId } from '../../../lib/error-utils';

export const PageSecondaryEmailAdd = (_: RouteComponentProps) => {
  usePageViewEvent('settings.emails');
  const [saveBtnDisabled, setSaveBtnDisabled] = useState(true);
  const [errorText, setErrorText] = useState<string>();
  const [email, setEmail] = useState<string>();
  const inputRefDOM = useRef<HTMLInputElement>(null);
  const { l10n } = useLocalization();

  const subtitleText = l10n.getString(
    'add-secondary-email-step-1',
    null,
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
        if (e.errno) {
          const errorText = l10n.getString(
            getErrorFtlId(e),
            { retryAfter: e.retryAfterLocalized },
            AuthUiErrorNos[e.errno].message
          );
          setErrorText(errorText);
        } else {
          alertBar.error(
            l10n.getString(
              'add-secondary-email-error-2',
              null,
              'There was a problem creating this email'
            )
          );
        }
      }
    },
    [account, navigateWithQuery, setErrorText, alertBar, l10n]
  );

  const checkEmail = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const email = inputRefDOM.current?.value || '';
      const isValid = isEmailValid(email);

      setSaveBtnDisabled(!isValid);
      setEmail(inputRefDOM.current?.value);
      setErrorText('');

      if (isEmailMask(email)) {
        const errorText = l10n.getString(
          'add-secondary-email-mask',
          null,
          'Email masks can’t be used as a secondary email'
        );
        setErrorText(errorText);
        setSaveBtnDisabled(true);
      }
    },
    [setSaveBtnDisabled, setErrorText, l10n]
  );

  return (
    <Localized id="add-secondary-email-page-title" attrs={{ title: true }}>
      <FlowContainer title="Secondary email" subtitle={subtitleText}>
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
            <Localized
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
            </Localized>
          </div>

          <div className="flex justify-center mx-auto max-w-64">
            <Localized id="add-secondary-email-cancel-button">
              <button
                type="button"
                className="cta-neutral cta-base-p mx-2 flex-1"
                data-testid="cancel-button"
                onClick={goHome}
              >
                Cancel
              </button>
            </Localized>
            <Localized id="add-secondary-email-save-button">
              <button
                type="submit"
                className="cta-primary cta-base-p mx-2 flex-1"
                data-testid="save-button"
                disabled={saveBtnDisabled || account.loading}
              >
                Save
              </button>
            </Localized>
          </div>
        </form>
      </FlowContainer>
    </Localized>
  );
};

export default PageSecondaryEmailAdd;
