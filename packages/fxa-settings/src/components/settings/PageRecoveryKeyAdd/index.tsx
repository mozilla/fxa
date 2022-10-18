import { Localized, useLocalization } from '@fluent/react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import base32encode from 'base32-encode';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HomePath } from '../../constants';
import {
  AuthUiErrorNos,
  AuthUiErrors,
  composeAuthUiErrorTranslationId,
} from '../../lib/auth-errors/auth-errors';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { useAccount, useAlertBar } from '../../models';
import DataBlock from '../DataBlock';
import FlowContainer from '../FlowContainer';
import InputPassword from '../InputPassword';
import VerifiedSessionGuard from '../VerifiedSessionGuard';

type FormData = {
  password: string;
};

export const PageRecoveryKeyAdd = (_: RouteComponentProps) => {
  usePageViewEvent('settings.account-recovery');
  const { handleSubmit, register, formState, setValue } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      password: '',
    },
  });
  // TODO: the `.errors.password` clause shouldn't be necessary, but `isValid` isn't updating
  // properly. I think this is a bug in react-hook-form.
  const disabled =
    !formState.isDirty || !formState.isValid || !!formState.errors.password;
  const [errorText, setErrorText] = useState<string>();
  const { l10n } = useLocalization();
  const [subtitleText, setSubtitleText] = useState<string>(
    l10n.getString('recovery-key-step-1', null, 'Step 1 of 2')
  );
  const [formattedRecoveryKey, setFormattedRecoveryKey] = useState<string>();
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const goHome = () => navigate(HomePath + '#recovery-key', { replace: true });
  const alertSuccessAndGoHome = () => {
    alertBar.success(
      l10n.getString(
        'recovery-key-success-alert-3',
        null,
        'Account recovery key created'
      )
    );
    navigate(HomePath + '#recovery-key', { replace: true });
  };
  const account = useAccount();

  const createRecoveryKey = useCallback(
    async (password: string) => {
      try {
        const recoveryKey = await account.createRecoveryKey(password);
        setFormattedRecoveryKey(
          base32encode(recoveryKey.buffer, 'Crockford')
            .match(/.{4}/g)!
            .join(' ')
        );
        setSubtitleText(
          l10n.getString('recovery-key-step-2', null, 'Step 2 of 2')
        );
        logViewEvent(
          'flow.settings.account-recovery',
          'confirm-password.success'
        );
      } catch (e) {
        let localizedError;

        if (e.errno === AuthUiErrors.THROTTLED.errno) {
          localizedError = l10n.getString(
            composeAuthUiErrorTranslationId(e),
            { retryAfter: e.retryAfterLocalized },
            AuthUiErrorNos[e.errno].message
          );
        } else {
          localizedError = l10n.getString(
            composeAuthUiErrorTranslationId(e),
            null,
            e.message
          );
        }

        if (e.errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
          setErrorText(localizedError);
        } else {
          alertBar.error(localizedError);
          logViewEvent(
            'flow.settings.account-recovery',
            'confirm-password.fail'
          );
        }
        setValue('password', '');
      }
    },
    [
      account,
      setFormattedRecoveryKey,
      setSubtitleText,
      l10n,
      setErrorText,
      setValue,
      alertBar,
    ]
  );
  useEffect(() => {
    if (account.recoveryKey && !formattedRecoveryKey) {
      navigate(HomePath, { replace: true });
    }
  }, [account, formattedRecoveryKey, navigate]);

  return (
    <Localized id="recovery-key-page-title-1" attrs={{ title: true }}>
      <FlowContainer title="Account recovery key" subtitle={subtitleText}>
        <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
        {formattedRecoveryKey && (
          <div className="my-2" data-testid="recover-key-confirm">
            <Localized id="recovery-key-created-1">
              <p>
                Your account recovery key has been created. Be sure to save the
                key in a safe place that you can easily find later — you'll need
                the key to regain access to your data if you forget your
                password.
              </p>
            </Localized>
            <div className="mt-6 flex flex-col items-center h-48 justify-between">
              <DataBlock
                value={formattedRecoveryKey}
                onAction={(type) => {
                  logViewEvent(
                    'flow.settings.account-recovery',
                    `recovery-key.${type}-option`
                  );
                }}
                contentType="Firefox account recovery key"
              ></DataBlock>
              <Localized id="recovery-key-close-button">
                <button
                  className="cta-primary mx-2 px-10 py-2 mt-6"
                  onClick={alertSuccessAndGoHome}
                  data-testid="close-button"
                >
                  Close
                </button>
              </Localized>
            </div>
          </div>
        )}
        {!formattedRecoveryKey && (
          <form
            onSubmit={handleSubmit(({ password }) => {
              createRecoveryKey(password);
              logViewEvent(
                'flow.settings.account-recovery',
                'confirm-password.submit'
              );
            })}
          >
            <div className="mt-4 mb-6" data-testid="recovery-key-input">
              <Localized
                id="recovery-key-enter-password"
                attrs={{ label: true }}
              >
                <InputPassword
                  name="password"
                  label="Enter password"
                  onChange={() => {
                    if (errorText) {
                      setErrorText(undefined);
                    }
                  }}
                  inputRef={register({
                    required: true,
                    minLength: 8,
                  })}
                  {...{ errorText }}
                />
              </Localized>
            </div>

            <div className="flex justify-center mx-auto max-w-64">
              <Localized id="recovery-key-cancel-button">
                <button
                  type="button"
                  className="cta-neutral cta-base-p mx-2 flex-1"
                  data-testid="cancel-button"
                  onClick={goHome}
                >
                  Cancel
                </button>
              </Localized>
              <Localized id="recovery-key-continue-button">
                <button
                  type="submit"
                  className="cta-primary cta-base-p mx-2 flex-1"
                  data-testid="continue-button"
                  disabled={disabled}
                >
                  Continue
                </button>
              </Localized>
            </div>
          </form>
        )}
      </FlowContainer>
    </Localized>
  );
};

export default PageRecoveryKeyAdd;
