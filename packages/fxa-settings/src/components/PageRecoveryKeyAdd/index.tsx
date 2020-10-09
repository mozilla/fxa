import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useAlertBar } from '../../lib/hooks';
import InputPassword from '../InputPassword';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import AlertBar from '../AlertBar';

type FormData = {
  password: string;
};

export const PageRecoveryKeyAdd = (_: RouteComponentProps) => {
  const { handleSubmit, register, formState } = useForm<FormData>({
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
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const goBack = useCallback(() => window.history.back(), []);
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
          console.error('Coming in FXA-1657');
        })}
      >
        <div className="mt-4 mb-6" data-testid="recovery-key-input">
          <InputPassword
            name="password"
            label="Enter password"
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
