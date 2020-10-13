import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
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
import { cloneDeep } from '@apollo/client/utilities';

type FormData = {
  password: string;
};

export const PageRecoveryKeyAdd = (_: RouteComponentProps) => {
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
  const [formattedRecoveryKey, setFormattedRecoveryKey] = useState<string>();
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const goBack = useCallback(() => window.history.back(), []);

  const account = useAccount();
  const createRecoveryKey = useRecoveryKeyMaker({
    onSuccess: (recoveryKey) => {
      setFormattedRecoveryKey(base32encode(recoveryKey.buffer, 'Crockford'));
      cache.modify({
        fields: {
          account: (existing: Account) => {
            const account = cloneDeep(existing);
            account.recoveryKey = true;
            return account;
          },
        },
      });
    },
    onError: (error) => {
      if (error.errno === 103) {
        setErrorText(error.message);
        setValue('password', '');
      } else {
        alertBar.setType('error');
        alertBar.setContent(error.message);
        alertBar.show();
      }
    },
  });
  if (formattedRecoveryKey) {
    console.log('UI coming in FXA-1656', formattedRecoveryKey);
  }
  return (
    <FlowContainer title="Recovery key" subtitle="Step 1 of 2">
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid="add-recovery-key-error">{alertBar.content}</p>
        </AlertBar>
      )}
      <VerifiedSessionGuard onDismiss={goBack} onError={goBack} />
      <form
        onSubmit={handleSubmit(({ password }) => {
          createRecoveryKey.execute(
            account.primaryEmail.email,
            password,
            account.uid,
            sessionToken()!
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
    </FlowContainer>
  );
};

export default PageRecoveryKeyAdd;
