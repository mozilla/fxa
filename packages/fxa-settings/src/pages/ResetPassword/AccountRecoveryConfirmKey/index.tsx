/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Link,
  navigate,
  RouteComponentProps,
  useLocation,
} from '@reach/router';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { useAccount } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models/hooks';

import { InputText } from '../../../components/InputText';
import CardHeader from '../../../components/CardHeader';
import WarningMessage from '../../../components/WarningMessage';
import { ResetPasswordLinkExpired } from '../../../components/LinkExpired';
import LinkDamaged from '../../../components/LinkDamaged';
import { LinkStatus, MozServices } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';
import {
  RequiredParamsAccountRecoveryConfirmKey,
  useAccountRecoveryConfirmKeyLinkStatus,
} from '../../../lib/hooks/useLinkStatus';
import AppLayout from '../../../components/AppLayout';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { randomBytes } from 'crypto';

type FormData = {
  recoveryKey: string;
};

type SubmitData = {
  recoveryKey: string;
} & RequiredParamsAccountRecoveryConfirmKey;

type LocationState = { email: string };

export const viewName = 'account-recovery-confirm-key';

const AccountRecoveryConfirmKey = (_: RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  // TODO: grab serviceName from the relier
  const serviceName = MozServices.Default;

  const [recoveryKeyErrorText, setRecoveryKeyErrorText] = useState<string>('');
  // The password forgot code can only be used once to retrieve `accountResetToken`
  // so we set its value after the first request for subsequent requests.
  const [fetchedResetToken, setFetchedResetToken] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const { linkStatus, setLinkStatus, requiredParams } =
    useAccountRecoveryConfirmKeyLinkStatus();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };

  const { handleSubmit, register } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      recoveryKey: '',
    },
  });

  const onFocus = () => {
    if (!isFocused) {
      logViewEvent('flow', `${viewName}.engage`, REACT_ENTRYPOINT);
      setIsFocused(true);
    }
  };

  const getRecoveryBundleAndNavigate = useCallback(
    async ({
      accountResetToken,
      recoveryKey,
      uid,
      email,
    }: {
      accountResetToken: string;
      recoveryKey: string;
      uid: string;
      email: string;
    }) => {
      const { recoveryData, recoveryKeyId } =
        await account.getRecoveryKeyBundle(accountResetToken, recoveryKey, uid);

      logViewEvent('flow', `${viewName}.success`, REACT_ENTRYPOINT);

      // FOLLOW-UP: Get values by decoding recovery data.
      const decode = (_data: string) => ({
        kB: randomBytes(64).toString('hex'),
      });
      const { kB } = decode(recoveryData);

      navigate(`/account_recovery_reset_password${window.location.search}`, {
        state: {
          accountResetToken,
          recoveryKeyId,
          kB,
        },
      });
    },
    [account]
  );

  const checkRecoveryKey = useCallback(
    async ({ recoveryKey, token, code, email, uid }: SubmitData) => {
      try {
        if (!fetchedResetToken) {
          const { accountResetToken } = await account.verifyPasswordForgotToken(
            token,
            code
          );
          setFetchedResetToken(accountResetToken);
          await getRecoveryBundleAndNavigate({
            accountResetToken,
            recoveryKey,
            uid,
            email,
          });
        }
        await getRecoveryBundleAndNavigate({
          accountResetToken: fetchedResetToken,
          recoveryKey,
          uid,
          email,
        });
      } catch (error) {
        logViewEvent('flow', `${viewName}.fail`, REACT_ENTRYPOINT);

        if (error.errno === AuthUiErrors.INVALID_TOKEN.errno) {
          setLinkStatus(LinkStatus.expired);
        } else {
          // NOTE: in content-server, we only check for invalid token and invalid recovery
          // key, and note that all other errors are unexpected. However in practice,
          // users could also trigger an 'invalid hex string: null' message. We may want to
          // circle back to this but for now serves as a catch-all for other errors.
          const errorAccountRecoveryConfirmKey = ftlMsgResolver.getMsg(
            'account-recovery-confirm-key-error-general',
            'Invalid account recovery key'
          );
          setRecoveryKeyErrorText(errorAccountRecoveryConfirmKey);
        }
      }
    },
    [
      account,
      fetchedResetToken,
      getRecoveryBundleAndNavigate,
      setLinkStatus,
      ftlMsgResolver,
    ]
  );

  const onSubmit = ({ recoveryKey, token, code, email, uid }: SubmitData) => {
    logViewEvent('flow', `${viewName}.submit`, REACT_ENTRYPOINT);
    if (recoveryKey === '') {
      const errorEmptyRecoveryKeyInput = ftlMsgResolver.getMsg(
        'account-recovery-confirm-key-empty-input-error',
        'Account recovery key required'
      );
      setRecoveryKeyErrorText(errorEmptyRecoveryKeyInput);
      return;
    }

    checkRecoveryKey({ recoveryKey, token, code, email, uid });
  };

  if (linkStatus === LinkStatus.damaged || requiredParams === null) {
    return <LinkDamaged linkType="reset-password" />;
  }

  if (linkStatus === LinkStatus.expired) {
    return <ResetPasswordLinkExpired />;
  }

  return (
    <AppLayout>
      <CardHeader
        headingWithDefaultServiceFtlId="account-recovery-confirm-key-heading-w-default-service"
        headingWithCustomServiceFtlId="account-recovery-confirm-key-heading-w-custom-service"
        headingText="Reset password with account recovery key"
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
        If you reset your password and don't have account recovery key saved,
        some of your data will be erased (including synced server data like
        history and bookmarks).
      </WarningMessage>

      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(({ recoveryKey }) => {
          // When users create their recovery key, the copyable output has spaces and we
          // display it visually this way to users as well for easier reading. Strip that
          // from here for less copy-and-paste friction for users.
          const recoveryKeyStripped = recoveryKey.replace(/\s/g, '');
          onSubmit({
            recoveryKey: recoveryKeyStripped,
            token: requiredParams.token,
            code: requiredParams.code,
            email: requiredParams.email,
            uid: requiredParams.uid,
          });
        })}
        data-testid="account-recovery-confirm-key-form"
      >
        <FtlMsg id="account-recovery-confirm-key-input" attrs={{ label: true }}>
          <InputText
            type="text"
            label="Enter account recovery key"
            name="recoveryKey"
            errorText={recoveryKeyErrorText}
            onFocusCb={onFocus}
            autoFocus
            // capitalization differences are nullified server-side so visually display as
            // uppercase here but don't bother transforming the submit data to match
            className="text-start"
            inputOnlyClassName="uppercase"
            anchorStart
            autoComplete="off"
            spellCheck={false}
            prefixDataTestId="account-recovery-confirm-key"
            inputRef={register({
              required: true,
            })}
          />
        </FtlMsg>

        <FtlMsg id="account-recovery-confirm-key-button">
          <button type="submit" className="cta-primary cta-xl mb-6">
            Confirm account recovery key
          </button>
        </FtlMsg>
      </form>

      <FtlMsg id="account-recovery-lost-recovery-key-link">
        <Link
          to={`/complete_reset_password${location.search}`}
          className="link-blue text-sm"
          id="lost-recovery-key"
          state={{ lostRecoveryKey: true }}
          onClick={() => {
            logViewEvent(
              'flow',
              `lost-recovery-key.${viewName}`,
              REACT_ENTRYPOINT
            );
          }}
        >
          Don't have an account recovery key?
        </Link>
      </FtlMsg>
    </AppLayout>
  );
};

export default AccountRecoveryConfirmKey;
