/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { logPageViewEvent, logViewEvent } from '../../../lib/metrics';
import GleanMetrics from '../../../lib/glean';
import { useAccount } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models/hooks';

import { InputText } from '../../../components/InputText';
import CardHeader from '../../../components/CardHeader';
import WarningMessage from '../../../components/WarningMessage';
import { REACT_ENTRYPOINT } from '../../../constants';
import AppLayout from '../../../components/AppLayout';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import base32Decode from 'base32-decode';
import { decryptRecoveryKeyData } from 'fxa-auth-client/lib/recoveryKey';
import { isBase32Crockford } from '../../../lib/utilities';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import Banner, { BannerType } from '../../../components/Banner';
import {
  AccountRecoveryConfirmKeyFormData,
  AccountRecoveryConfirmKeyProps,
  AccountRecoveryConfirmKeySubmitData,
} from './interfaces';
import { LinkStatus } from '../../../lib/types';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';

export const viewName = 'account-recovery-confirm-key';

const AccountRecoveryConfirmKey = ({
  linkModel,
  setLinkStatus,
  integration,
}: AccountRecoveryConfirmKeyProps) => {
  const serviceName = integration.getServiceName();
  const [tooltipText, setTooltipText] = useState<string>('');
  const [bannerMessage, setBannerMessage] = useState<string | ReactElement>();
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
          GleanMetrics.resetPassword.recoveryKeyView();
        } else {
          setLinkStatus(LinkStatus.expired);
        }
      } catch (e) {
        setLinkStatus(LinkStatus.damaged);
      }
    };

    checkPasswordForgotToken(linkModel.token);
  }, [account, linkModel.token, setLinkStatus]);

  const { handleSubmit, register, formState } =
    useForm<AccountRecoveryConfirmKeyFormData>({
      mode: 'onChange',
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

      const decodedRecoveryKey = base32Decode(recoveryKey, 'Crockford');
      const uint8RecoveryKey = new Uint8Array(decodedRecoveryKey);

      const { kB } = await decryptRecoveryKeyData(
        uint8RecoveryKey,
        recoveryData,
        uid
      );

      navigate('/account_recovery_reset_password', {
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
    async ({
      recoveryKey,
      token,
      code,
      email,
      uid,
    }: AccountRecoveryConfirmKeySubmitData) => {
      try {
        let resetToken = fetchedResetToken;
        if (!resetToken) {
          const accountResetToken = await account.passwordForgotVerifyCode(
            token,
            code,
            true
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
        setIsLoading(false);
        logViewEvent('flow', `${viewName}.fail`, REACT_ENTRYPOINT);
        // if the link expired or the reset was completed in another tab/browser
        // between page load and form submission
        // on form submission, redirect to link expired page to provide a path to resend a link
        if (error.errno === AuthUiErrors.INVALID_TOKEN.errno) {
          setLinkStatus(LinkStatus.expired);
        } else {
          // NOTE: in content-server, we only check for invalid token and invalid recovery
          // key, and note that all other errors are unexpected. However in practice,
          // users could also trigger (for example) an 'invalid hex string: null' message or throttling errors.
          // Here, we are using the auth errors library, and unaccounted errors are announced as unexpected.
          const localizedBannerMessage = getLocalizedErrorMessage(
            ftlMsgResolver,
            error
          );
          if (error.errno === AuthUiErrors.INVALID_RECOVERY_KEY.errno) {
            setTooltipText(localizedBannerMessage);
          } else {
            setBannerMessage(localizedBannerMessage);
          }
        }
      }
    },
    [
      account,
      fetchedResetToken,
      ftlMsgResolver,
      getRecoveryBundleAndNavigate,
      setLinkStatus,
      setIsLoading,
    ]
  );

  const onSubmit = (submitData: AccountRecoveryConfirmKeySubmitData) => {
    const { recoveryKey } = submitData;
    setIsLoading(true);
    setBannerMessage(undefined);
    logViewEvent('flow', `${viewName}.submit`, REACT_ENTRYPOINT);
    GleanMetrics.resetPassword.recoveryKeySubmit();

    // if the submitted key does not match the expected format,
    // abort before submitting to the auth server
    if (recoveryKey.length !== 32 || !isBase32Crockford(recoveryKey)) {
      const localizedErrorMessage = ftlMsgResolver.getMsg(
        'auth-error-159',
        'Invalid account recovery key'
      );
      setTooltipText(localizedErrorMessage);
      setIsLoading(false);
      logViewEvent('flow', `${viewName}.fail`, REACT_ENTRYPOINT);
    } else {
      checkRecoveryKey(submitData);
    }
  };
  if (showLoadingSpinner) {
    return <LoadingSpinner fullScreen />;
  }
  return (
    <AppLayout>
      <CardHeader
        headingWithDefaultServiceFtlId="account-recovery-confirm-key-heading-w-default-service"
        headingWithCustomServiceFtlId="account-recovery-confirm-key-heading-w-custom-service"
        headingText="Reset password with account recovery key"
        {...{ serviceName }}
      />

      {bannerMessage && (
        <Banner type={BannerType.error}>{bannerMessage}</Banner>
      )}

      <FtlMsg id="account-recovery-confirm-key-instructions-2">
        <p className="mt-4 text-sm">
          Please enter the one time use account recovery key you stored in a
          safe place to regain access to your Mozilla account.
        </p>
      </FtlMsg>
      <WarningMessage
        warningMessageFtlId="account-recovery-confirm-key-warning-message"
        warningType="Note:"
      >
        If you reset your password and don’t have account recovery key saved,
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
            token: linkModel.token,
            code: linkModel.code,
            email: linkModel.email,
            uid: linkModel.uid,
          });
        })}
        data-testid="account-recovery-confirm-key-form"
      >
        <FtlMsg id="account-recovery-confirm-key-input" attrs={{ label: true }}>
          <InputText
            type="text"
            label="Enter account recovery key"
            name="recoveryKey"
            errorText={tooltipText}
            onFocusCb={onFocus}
            autoFocus
            // Crockford base32 encoding is case insensitive, so visually display as
            // uppercase here but don't bother transforming the submit data to match
            inputOnlyClassName="font-mono uppercase"
            className="text-start"
            anchorPosition="start"
            autoComplete="off"
            spellCheck={false}
            onChange={() => {
              setTooltipText('');
            }}
            prefixDataTestId="account-recovery-confirm-key"
            inputRef={register({ required: true })}
          />
        </FtlMsg>

        <FtlMsg id="account-recovery-confirm-key-button">
          <button
            type="submit"
            className="cta-primary cta-xl mb-6"
            disabled={
              isLoading || !formState.isDirty || !!formState.errors.recoveryKey
            }
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
          state={{
            lostRecoveryKey: true,
            accountResetToken: fetchedResetToken,
          }}
          onClick={() => {
            logViewEvent(
              'flow',
              `lost-recovery-key.${viewName}`,
              REACT_ENTRYPOINT
            );
          }}
        >
          Don’t have an account recovery key?
        </Link>
      </FtlMsg>
    </AppLayout>
  );
};

export default AccountRecoveryConfirmKey;
