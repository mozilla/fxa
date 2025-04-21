import React, { useState, useEffect, useCallback } from 'react';
import { Localized, useLocalization } from '@fluent/react';
import { RouteComponentProps } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { SETTINGS_PATH } from '../../../constants';
import { logViewEvent } from '../../../lib/metrics';
import { useAccount, useAlertBar } from '../../../models';
import InputText from '../../InputText';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { useForm } from 'react-hook-form';
import { AuthUiErrors } from 'fxa-settings/src/lib/auth-errors/auth-errors';
import { getErrorFtlId } from '../../../lib/error-utils';

type FormData = {
  verificationCode: string;
};

export const PageSecondaryEmailVerify = ({ location }: RouteComponentProps) => {
  const [errorText, setErrorText] = useState<string>();
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
        if (e.errno) {
          const errorText = l10n.getString(
            getErrorFtlId(e),
            null,
            AuthUiErrors.INVALID_VERIFICATION_CODE.message
          );
          setErrorText(errorText);
        } else {
          alertBar.error(
            l10n.getString(
              'verify-secondary-email-error-3',
              null,
              'There was a problem sending the confirmation code'
            )
          );
        }
        logViewEvent('verify-secondary-email.verification', 'fail');
      }
    },
    [account, alertSuccessAndGoHome, setErrorText, alertBar, l10n]
  );

  useEffect(() => {
    if (!email) {
      navigateWithQuery(SETTINGS_PATH, { replace: true });
    }
  }, [email, navigateWithQuery]);

  const buttonDisabled =
    !formState.isDirty || !formState.isValid || account.loading;
  return (
    <Localized id="verify-secondary-email-page-title" attrs={{ title: true }}>
      <FlowContainer title="Secondary email" subtitle={subtitleText}>
        <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
        <form
          data-testid="secondary-email-verify-form"
          onSubmit={handleSubmit(({ verificationCode }) => {
            verifySecondaryEmail(email, verificationCode);
            logViewEvent('verify-secondary-email.verification', 'clicked');
          })}
        >
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
        </form>
      </FlowContainer>
    </Localized>
  );
};

export default PageSecondaryEmailVerify;
