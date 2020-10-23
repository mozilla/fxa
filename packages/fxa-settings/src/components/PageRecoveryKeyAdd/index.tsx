import React, { useCallback, useEffect, useState } from 'react';
import base32encode from 'base32-encode';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useRecoveryKeyMaker } from '../../lib/auth';
import { cache, sessionToken } from '../../lib/cache';
import { useAlertBar } from '../../lib/hooks';
import { useAccount, Account } from '../../models';
import InputPassword from '../InputPassword';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import AlertBar from '../AlertBar';
import DataBlock from '../DataBlock';
import { cloneDeep } from '@apollo/client/utilities';
import { HomePath } from '../../constants';
import GetDataTrio from '../GetDataTrio';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';

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
  const [subtitleText, setSubtitleText] = useState<string>('Step 1 of 2');
  const [formattedRecoveryKey, setFormattedRecoveryKey] = useState<string>();
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const goBack = useCallback(() => window.history.back(), []);

  const account = useAccount();
  const createRecoveryKey = useRecoveryKeyMaker({
    onSuccess: (recoveryKey) => {
      setFormattedRecoveryKey(
        base32encode(recoveryKey.buffer, 'Crockford').match(/.{4}/g)!.join(' ')
      );
      setSubtitleText('Step 2 of 2');
      cache.modify({
        fields: {
          account: (existing: Account) => {
            const account = cloneDeep(existing);
            account.recoveryKey = true;
            return account;
          },
        },
      });
      logViewEvent(
        'flow.settings.account-recovery',
        'confirm-password.success'
      );
    },
    onError: (error) => {
      if (error.errno === 103) {
        setErrorText(error.message);
        setValue('password', '');
      } else {
        alertBar.setType('error');
        alertBar.setContent(error.message);
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
    <FlowContainer title="Recovery key" subtitle={subtitleText}>
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid="add-recovery-key-error">{alertBar.content}</p>
        </AlertBar>
      )}
      <VerifiedSessionGuard onDismiss={goBack} onError={goBack} />
      {formattedRecoveryKey && (
        <div className="my-2" data-testid="recover-key-confirm">
          Your recovery key has been created. Be sure to save the key in a safe
          place that you can easily find later — you'll need the key to regain
          access to your data if you forget your password.
          <div className="mt-6 flex flex-col items-center h-48 justify-between">
            <DataBlock value={formattedRecoveryKey}></DataBlock>
            <GetDataTrio
              value={formattedRecoveryKey}
              onAction={(type) => {
                logViewEvent(
                  'flow.settings.account-recovery',
                  `recovery-key.${type}-option`
                );
              }}
            ></GetDataTrio>
            <button
              className="cta-primary mx-2"
              onClick={() => navigate(HomePath, { replace: true })}
              data-testid="close-button"
            >
              Close
            </button>
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
          </div>

          <div className="flex justify-center mx-auto max-w-64">
            <button
              type="button"
              className="cta-neutral mx-2 flex-1"
              data-testid="cancel-button"
              onClick={goBack}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cta-primary mx-2 flex-1"
              data-testid="continue-button"
              disabled={disabled}
            >
              Continue
            </button>
          </div>
        </form>
      )}
    </FlowContainer>
  );
};

export default PageRecoveryKeyAdd;
