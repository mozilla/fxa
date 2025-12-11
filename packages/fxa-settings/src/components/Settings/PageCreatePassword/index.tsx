/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized } from '@fluent/react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SETTINGS_PATH } from '../../../constants';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../../lib/metrics';
import { useAccount, useAlertBar, useFtlMsgResolver } from '../../../models';
import FlowContainer from '../FlowContainer';
import FormPassword from '../../FormPassword';
import { UnlinkAccountLocationState } from '../../../lib/types';
import {
  MfaGuard,
  useMfaErrorHandler,
} from '../../../components/Settings/MfaGuard';
import { MfaReason } from '../../../lib/types';

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

export const MfaPageCreatePassword = (props: RouteComponentProps) => {
  return (
    <MfaGuard requiredScope="password" reason={MfaReason.createPassword}>
      <PageCreatePassword {...props} />
    </MfaGuard>
  );
};

export const PageCreatePassword = (_: RouteComponentProps) => {
  const handleMfaError = useMfaErrorHandler();
  usePageViewEvent('settings.create-password');

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<FormData>({
      mode: 'onTouched',
      criteriaMode: 'all',
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
      },
    });
  const [newPasswordErrorText, setNewPasswordErrorText] = useState<string>();

  const alertBar = useAlertBar();
  const account = useAccount();
  const navigateWithQuery = useNavigateWithQuery();
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: {
      // Was the user sent here from the unlink account modal?
      wantsUnlinkProviderId?: UnlinkAccountLocationState;
    };
  };
  const { wantsUnlinkProviderId } = location.state || {};

  const passwordCreated = useRef(false);
  useEffect(() => {
    if (account.hasPassword && !passwordCreated.current) {
      navigateWithQuery(SETTINGS_PATH + '/change_password', { replace: true });
    }
  }, [account.hasPassword, navigateWithQuery]);

  const alertSuccessAndGoHome = useCallback(() => {
    alertBar.success(
      ftlMsgResolver.getMsg('pw-create-success-alert-2', 'Password set')
    );
    navigateWithQuery(
      SETTINGS_PATH + (wantsUnlinkProviderId ? '#linked-account' : '#password'),
      {
        replace: true,
        state: { wantsUnlinkProviderId },
      }
    );
  }, [alertBar, ftlMsgResolver, navigateWithQuery, wantsUnlinkProviderId]);

  const onFormSubmit = useCallback(
    async ({ newPassword }: FormData) => {
      try {
        logViewEvent(settingsViewName, 'create-password.submit');
        passwordCreated.current = true;
        await account.createPasswordWithJwt(newPassword);
        logViewEvent(settingsViewName, 'create-password.success');
        alertSuccessAndGoHome();
      } catch (e) {
        passwordCreated.current = false;
        const errorHandled = handleMfaError(e);
        if (errorHandled) {
          return;
        }
        logViewEvent(settingsViewName, 'create-password.fail');
        alertBar.error(
          ftlMsgResolver.getMsg(
            'pw-create-error-2',
            'Sorry, there was a problem setting your password'
          )
        );
      }
    },
    [account, alertSuccessAndGoHome, handleMfaError, alertBar, ftlMsgResolver]
  );

  return (
    <Localized id="pw-create-header" attrs={{ title: true }}>
      <FlowContainer title="Create password">
        <FormPassword
          {...{
            formState,
            errors,
            trigger,
            register,
            getValues,
            newPasswordErrorText,
            setNewPasswordErrorText,
          }}
          onFocusMetricsEvent="create-password.engage"
          onSubmit={handleSubmit(onFormSubmit)}
          primaryEmail={account.primaryEmail.email}
          loading={account.loading}
        />
      </FlowContainer>
    </Localized>
  );
};

export default MfaPageCreatePassword;
