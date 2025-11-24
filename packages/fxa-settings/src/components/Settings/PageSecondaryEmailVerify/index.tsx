/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Localized, useLocalization } from '@fluent/react';
import { RouteComponentProps } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { SETTINGS_PATH } from '../../../constants';
import { logViewEvent } from '../../../lib/metrics';
import { useAccount, useAlertBar, useFtlMsgResolver } from '../../../models';
import InputText from '../../InputText';
import FlowContainer from '../FlowContainer';
import { useForm } from 'react-hook-form';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { MfaGuard } from '../MfaGuard';
import {
  isInvalidJwtError,
  clearMfaAndJwtCacheOnInvalidJwt,
} from '../../../lib/mfa-guard-utils';
import { MfaReason } from '../../../lib/types';
import Banner, { ResendCodeSuccessBanner } from '../../Banner';

type FormData = {
  verificationCode: string;
};

export const PageSecondaryEmailVerify = ({ location }: RouteComponentProps) => {
  const [errorText, setErrorText] = useState<string>();
  const [resendCodeLoading, setResendCodeLoading] = useState(false);
  const [showResendSuccessBanner, setShowResendSuccessBanner] = useState(false);
  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState<string | undefined>(undefined);
  const lastResendRef = useRef<number | undefined>(undefined);
  const [resendCooldownActive, setResendCooldownActive] = useState(false);
  const { handleSubmit, register, formState } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      verificationCode: '',
    },
  });
  const navigateWithQuery = useNavigateWithQuery();
  const goHome = useCallback(
    () =>
      navigateWithQuery(SETTINGS_PATH + '#secondary-email', { replace: true }),
    [navigateWithQuery]
  );
  const { l10n } = useLocalization();
  const ftlMsgResolver = useFtlMsgResolver();
  const alertBar = useAlertBar();
  const account = useAccount();
  const alertSuccessAndGoHome = useCallback(
    (email: string) => {
      alertBar.success(
        l10n.getString(
          'verify-secondary-email-success-alert-2',
          { email },
          `${email} successfully added`
        )
      );
      navigateWithQuery(SETTINGS_PATH + '#secondary-email', { replace: true });
    },
    [alertBar, l10n, navigateWithQuery]
  );
  const subtitleText = l10n.getString(
    'add-secondary-email-step-2',
    null,
    'Step 2 of 2'
  );
  // Using 'any' here, instead of FluentVariable, to avoid having to import @fluent/bundle.
  const email = (location?.state as any)?.email as string | undefined | any;

  const verifySecondaryEmail = useCallback(
    async (email: string, code: string) => {
      try {
        await account.verifySecondaryEmail(email, code);
        logViewEvent('verify-secondary-email.verification', 'success');
        alertSuccessAndGoHome(email);
      } catch (e) {
        if (isInvalidJwtError(e)) {
          // JWT invalid/expired — defer cache clear to next tick so the modal opens
          // after the current click event completes (avoids immediate outside-click dismiss).
          setTimeout(() => clearMfaAndJwtCacheOnInvalidJwt(e, 'email'), 0);
          return;
        }
        setErrorText(getLocalizedErrorMessage(ftlMsgResolver, e));
        logViewEvent('verify-secondary-email.verification', 'fail');
      }
    },
    [account, alertSuccessAndGoHome, setErrorText, ftlMsgResolver]
  );

  const handleResendCode = useCallback(async () => {
    if (!email) {
      return;
    }
    // Simple debounce to prevent over-sending
    const now = Date.now();
    if (lastResendRef.current && now - lastResendRef.current < 3000) {
      return;
    }
    lastResendRef.current = now;
    setResendCooldownActive(true);
    // Clear the UI cooldown after 3s to mirror the debounce window
    setTimeout(() => setResendCooldownActive(false), 3000);
    setResendCodeLoading(true);
    try {
      await account.resendSecondaryEmailCodeWithJwt(email);
      setLocalizedErrorBannerMessage(undefined);
      setShowResendSuccessBanner(true);
    } catch (err) {
      setShowResendSuccessBanner(false);
      if (isInvalidJwtError(err)) {
        // Defer cache clear to next tick to avoid immediate outside-click dismissal.
        setTimeout(() => clearMfaAndJwtCacheOnInvalidJwt(err, 'email'), 0);
        return;
      }
      setLocalizedErrorBannerMessage(
        getLocalizedErrorMessage(ftlMsgResolver, err)
      );
    } finally {
      setResendCodeLoading(false);
    }
  }, [account, email, ftlMsgResolver]);

  useEffect(() => {
    if (!email) {
      navigateWithQuery(SETTINGS_PATH, { replace: true });
    }
  }, [email, navigateWithQuery]);

  const buttonDisabled =
    !formState.isDirty || !formState.isValid || account.loading;
  const resendDisabled =
    resendCodeLoading || account.loading || resendCooldownActive;
  return (
    <Localized id="verify-secondary-email-page-title" attrs={{ title: true }}>
      <FlowContainer title="Secondary email" subtitle={subtitleText}>
        <form
          data-testid="secondary-email-verify-form"
          onSubmit={handleSubmit(({ verificationCode }) => {
            verifySecondaryEmail(email, verificationCode);
            logViewEvent('verify-secondary-email.verification', 'clicked');
          })}
        >
          {showResendSuccessBanner && <ResendCodeSuccessBanner />}
          {localizedErrorBannerMessage && (
            <Banner
              type="error"
              content={{ localizedHeading: localizedErrorBannerMessage }}
              dismissButton={{
                action: () => setLocalizedErrorBannerMessage(undefined),
              }}
            />
          )}
          <Localized
            id="verify-secondary-email-please-enter-code-2"
            vars={{ email: email }}
            elems={{ strong: <span className="font-bold"> </span> }}
          >
            <p>
              Please enter the confirmation code that was sent to{' '}
              <span className="font-bold">{email}</span> within 5 minutes.
            </p>
          </Localized>

          <div className="my-6">
            <Localized
              id="verify-secondary-email-verification-code-2"
              attrs={{ label: true }}
            >
              <InputText
                name="verificationCode"
                label="Enter your confirmation code"
                onChange={() => {
                  if (errorText) {
                    setErrorText(undefined);
                  }
                }}
                inputRef={register({
                  required: true,
                  pattern: /^\s*[0-9]{6}\s*$/,
                })}
                prefixDataTestId="verification-code"
                {...{ errorText }}
              ></InputText>
            </Localized>
          </div>

          <div className="flex justify-center mx-auto max-w-64">
            <Localized id="verify-secondary-email-cancel-button">
              <button
                type="button"
                className="cta-neutral cta-base-p mx-2 flex-1"
                data-testid="secondary-email-verify-cancel"
                onClick={goHome}
              >
                Cancel
              </button>
            </Localized>
            <Localized id="verify-secondary-email-verify-button-2">
              <button
                type="submit"
                className="cta-primary cta-base-p mx-2 flex-1"
                data-testid="secondary-email-verify-submit"
                disabled={buttonDisabled}
              >
                Confirm
              </button>
            </Localized>
          </div>

          <div className="flex justify-center mx-auto max-w-64 mt-8">
            <Localized id="verify-secondary-email-resend-code-button">
              <button
                type="button"
                className={classNames(
                  'text-sm',
                  resendDisabled
                    ? 'text-grey-300 cursor-not-allowed pointer-events-none'
                    : 'link-blue'
                )}
                data-testid="secondary-email-resend-code-button"
                disabled={resendDisabled}
                onClick={handleResendCode}
              >
                Resend confirmation code
              </button>
            </Localized>
          </div>
        </form>
      </FlowContainer>
    </Localized>
  );
};

export const MfaGuardPageSecondaryEmailVerify = ({
  location,
}: RouteComponentProps) => {
  return (
    <MfaGuard requiredScope="email" reason={MfaReason.verifySecondaryEmail}>
      <PageSecondaryEmailVerify location={location} />
    </MfaGuard>
  );
};
