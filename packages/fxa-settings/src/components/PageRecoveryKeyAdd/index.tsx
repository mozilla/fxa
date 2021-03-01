import React, { useEffect, useState } from 'react';
import { Localized, useLocalization } from '@fluent/react';
import base32encode from 'base32-encode';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useRecoveryKeyMaker } from '../../lib/auth';
import { alertTextExternal, cache, sessionToken } from '../../lib/cache';
import { useAlertBar } from '../../lib/hooks';
import { useAccount } from '../../models';
import InputPassword from '../InputPassword';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import AlertBar from '../AlertBar';
import DataBlock from '../DataBlock';
import { HomePath } from '../../constants';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';

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
    l10n.getString('recovery-key-step-1')
  );
  const [formattedRecoveryKey, setFormattedRecoveryKey] = useState<string>();
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const goHome = () => navigate(HomePath + '#recovery-key', { replace: true });
  const alertSuccessAndGoHome = () => {
    alertTextExternal(
      l10n.getString(
        'recovery-key-success-alert',
        null,
        'Recovery key created.'
      )
    );
    navigate(HomePath + '#recovery-key', { replace: true });
  };
  const account = useAccount();
  const createRecoveryKey = useRecoveryKeyMaker({
    onSuccess: (recoveryKey) => {
      setFormattedRecoveryKey(
        base32encode(recoveryKey.buffer, 'Crockford').match(/.{4}/g)!.join(' ')
      );
      setSubtitleText(l10n.getString('recovery-key-step-2'));
      cache.modify({
        id: cache.identify({ __typename: 'Account' }),
        fields: {
          recoveryKey() {
            return true;
          },
        },
      });
      logViewEvent(
        'flow.settings.account-recovery',
        'confirm-password.success'
      );
    },
    onError: (error) => {
      const localizedError = l10n.getString(
        `auth-error-${AuthUiErrors.INCORRECT_PASSWORD.errno}`,
        null,
        AuthUiErrors.INCORRECT_PASSWORD.message
      );
      if (error.errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
        setErrorText(localizedError);
        setValue('password', '');
      } else {
        alertBar.setType('error');
        alertBar.setContent(localizedError);
        alertBar.show();
        logViewEvent('flow.settings.account-recovery', 'confirm-password.fail');
      }
    },
  });
  useEffect(() => {
    if (account.recoveryKey && !formattedRecoveryKey) {
      navigate(HomePath, { replace: true });
    }
  }, [account, formattedRecoveryKey, navigate]);

  return (
    <Localized id="recovery-key-page-title" attrs={{ title: true }}>
      <FlowContainer title="Recovery key" subtitle={subtitleText}>
        {alertBar.visible && (
          <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
            <p data-testid="add-recovery-key-error">{alertBar.content}</p>
          </AlertBar>
        )}
        <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
        {formattedRecoveryKey && (
          <div className="my-2" data-testid="recover-key-confirm">
            <Localized id="recovery-key-created">
              <p>
                Your recovery key has been created. Be sure to save the key in a
                safe place that you can easily find later — you'll need the key
                to regain access to your data if you forget your password.
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
              ></DataBlock>
              <Localized id="recovery-key-close-button">
                <button
                  className="cta-primary mx-2 px-10"
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
              createRecoveryKey.execute(
                account.primaryEmail.email,
                password,
                account.uid,
                sessionToken()!
              );
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
                  className="cta-neutral mx-2 flex-1"
                  data-testid="cancel-button"
                  onClick={goHome}
                >
                  Cancel
                </button>
              </Localized>
              <Localized id="recovery-key-continue-button">
                <button
                  type="submit"
                  className="cta-primary mx-2 flex-1"
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
