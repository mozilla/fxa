/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, useLocation, useNavigate } from '@reach/router';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { logPageViewEvent, logViewEvent } from '../../../lib/metrics';
import { useAccount } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models/hooks';

import { InputText } from '../../../components/InputText';
import CardHeader from '../../../components/CardHeader';
import WarningMessage from '../../../components/WarningMessage';
import { LinkStatus, MozServices } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';
import AppLayout from '../../../components/AppLayout';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import base32Decode from 'base32-decode';
import { decryptRecoveryKeyData } from 'fxa-auth-client/lib/recoveryKey';
import { isBase32Crockford } from '../../../lib/utilities';
import { CompleteResetPasswordLink } from '../../../models/reset-password/verification';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

type FormData = {
  recoveryKey: string;
};

export type RequiredParamsAccountRecoveryConfirmKey = {
  email: string;
  token: string;
  code: string;
  uid: string;
};

type SubmitData = {
  recoveryKey: string;
} & RequiredParamsAccountRecoveryConfirmKey;

export const viewName = 'account-recovery-confirm-key';

const AccountRecoveryConfirmKey = ({
  params,
  setLinkStatus,
}: {
  params: CompleteResetPasswordLink;
  setLinkStatus: React.Dispatch<React.SetStateAction<LinkStatus>>;
}) => {
  // TODO: grab serviceName from the relier
  const serviceName = MozServices.Default;

  const [recoveryKeyErrorText, setRecoveryKeyErrorText] = useState<string>('');
  // The password forgot code can only be used once to retrieve `accountResetToken`
  // so we set its value after the first request for subsequent requests.
  const [fetchedResetToken, setFetchedResetToken] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  // Show loading spinner until token is valid, else LinkValidator handles invalid states
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(true);
  // We use this to debounce the submit button
  const [isLoading, setIsLoading] = useState(false);
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkPasswordForgotToken = async (token: string) => {
      try {
        const isValid = await account.resetPasswordStatus(token);
        if (isValid) {
          setLinkStatus(LinkStatus.valid);

          setShowLoadingSpinner(false);
          logPageViewEvent(viewName, REACT_ENTRYPOINT);
        } else {
          setLinkStatus(LinkStatus.expired);
        }
      } catch (e) {
        setLinkStatus(LinkStatus.damaged);
      }
    };

    checkPasswordForgotToken(params.token);
  }, [account, params.token, setLinkStatus]);

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

  const errorInvalidRecoveryKey = ftlMsgResolver.getMsg(
    'account-recovery-confirm-key-error-general',
    'Invalid account recovery key'
  );

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

      const decodedRecoveryKey = base32Decode(recoveryKey, 'Crockford');
      const uint8RecoveryKey = new Uint8Array(decodedRecoveryKey);

      const { kB } = await decryptRecoveryKeyData(
        uint8RecoveryKey,
        recoveryData,
        uid
      );

      navigate(`/account_recovery_reset_password${window.location.search}`, {
        state: {
          accountResetToken,
          recoveryKeyId,
          kB,
        },
      });
    },
    [account, navigate]
  );

  const checkRecoveryKey = useCallback(
    async ({ recoveryKey, token, code, email, uid }: SubmitData) => {
      try {
        let resetToken = fetchedResetToken;
        if (!resetToken) {
          const { accountResetToken } = await account.verifyPasswordForgotToken(
            token,
            code
          );
          setFetchedResetToken(accountResetToken);
          resetToken = accountResetToken;
        }
        await getRecoveryBundleAndNavigate({
          accountResetToken: resetToken,
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
          setRecoveryKeyErrorText(errorInvalidRecoveryKey);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      account,
      fetchedResetToken,
      getRecoveryBundleAndNavigate,
      setLinkStatus,
      errorInvalidRecoveryKey,
    ]
  );

  const invalidRecoveryKey = (localizedError: string) => {
    setRecoveryKeyErrorText(localizedError);
    setIsLoading(false);
    logViewEvent('flow', `${viewName}.fail`, REACT_ENTRYPOINT);
  };

  const onSubmit = (submitData: SubmitData) => {
    const { recoveryKey } = submitData;
    setIsLoading(true);
    logViewEvent('flow', `${viewName}.submit`, REACT_ENTRYPOINT);

    if (recoveryKey === '') {
      invalidRecoveryKey(
        ftlMsgResolver.getMsg(
          'account-recovery-confirm-key-empty-input-error',
          'Account recovery key required'
        )
      );
    } else if (recoveryKey.length !== 32 || !isBase32Crockford(recoveryKey)) {
      invalidRecoveryKey(errorInvalidRecoveryKey);
    } else {
      checkRecoveryKey(submitData);
    }
  };
  if (showLoadingSpinner) {
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
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
            token: params.token,
            code: params.code,
            email: params.email,
            uid: params.uid,
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
            // Crockford base32 encoding is case insensitive, so visually display as
            // uppercase here but don't bother transforming the submit data to match
            inputOnlyClassName="uppercase"
            className="text-start"
            anchorPosition="start"
            autoComplete="off"
            spellCheck={false}
            onChange={() => {
              setRecoveryKeyErrorText('');
            }}
            prefixDataTestId="account-recovery-confirm-key"
            // We don't have this marked as 'required: true` because we want to validate
            // on submit, not on blur
            inputRef={register()}
          />
        </FtlMsg>

        <FtlMsg id="account-recovery-confirm-key-button">
          <button
            type="submit"
            className="cta-primary cta-xl mb-6"
            disabled={isLoading}
          >
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
