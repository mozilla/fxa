/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm, ValidateResult } from 'react-hook-form';
import { cloneDeep } from '@apollo/client/utilities';
import { RouteComponentProps, useNavigate } from '@reach/router';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { usePasswordChanger } from '../../lib/auth';
import { cache, sessionToken } from '../../lib/cache';
import { useAccount, Account, Session } from '../../models';
import AlertBar from '../AlertBar';
import FlowContainer from '../FlowContainer';
import InputPassword from '../InputPassword';
import { logViewEvent, settingsViewName } from 'fxa-settings/src/lib/metrics';
import { ReactComponent as ValidIcon } from './valid.svg';
import { ReactComponent as InvalidIcon } from './invalid.svg';
import { ReactComponent as UnsetIcon } from './unset.svg';

type FormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ValidationIcon = ({
  isSet,
  hasError,
}: {
  isSet?: boolean;
  hasError: ValidateResult;
}) => {
  if (!isSet) {
    return <UnsetIcon className="inline mr-1" data-testid="icon-unset" />;
  }
  return hasError ? (
    <InvalidIcon className="inline mr-1" data-testid="icon-invalid" />
  ) : (
    <ValidIcon className="inline mr-1" data-testid="icon-valid" />
  );
};

// eslint-disable-next-line no-empty-pattern
export const PageChangePassword = ({}: RouteComponentProps) => {
  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    errors,
    formState,
    trigger,
  } = useForm<FormData>({
    mode: 'onTouched',
    criteriaMode: 'all',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const [alertBarRevealed, revealAlertBar, hideAlertBar] = useBooleanState();
  const [alertText, setAlertText] = useState<string>();
  const [currentPasswordErrorText, setCurrentPasswordErrorText] = useState<
    string
  >();
  const { primaryEmail } = useAccount();
  const navigate = useNavigate();
  const changePassword = usePasswordChanger({
    onSuccess: (response) => {
      logViewEvent(settingsViewName, 'change-password.success');
      changePassword.reset();
      sessionToken(response.sessionToken);
      cache.modify({
        fields: {
          account: (existing: Account) => {
            const account = cloneDeep(existing);
            account.passwordCreated = response.authAt * 1000;
            return account;
          },
          session: (existing: Session) => {
            const session = cloneDeep(existing);
            session.verified = response.verified;
            return session;
          },
        },
      });
      navigate('/beta/settings');
    },
    onError: (e) => {
      if (e.errno === 103) {
        // incorrect password
        setCurrentPasswordErrorText(e.message);
        setValue('oldPassword', '');
      } else {
        setAlertText(e.message);
        revealAlertBar();
      }
    },
  });
  return (
    <FlowContainer title="Change Password">
      {alertBarRevealed && alertText && (
        <AlertBar onDismiss={hideAlertBar} type="error">
          <p data-testid="sign-out-error">Error text TBD. {alertText}</p>
        </AlertBar>
      )}
      <form
        onSubmit={handleSubmit(({ oldPassword, newPassword }) => {
          changePassword.execute(
            primaryEmail.email,
            oldPassword,
            newPassword,
            sessionToken()!
          );
        })}
      >
        <h1>Stay safe — don't reuse passwords. Your password:</h1>

        <ul className="text-grey-400 text-xs m-3 list-inside">
          <li data-testid="change-password-length">
            <ValidationIcon
              isSet={formState.dirtyFields.newPassword}
              hasError={errors.newPassword?.types?.length}
            />
            Must be at least 8 characters
          </li>
          <li data-testid="change-password-email">
            <ValidationIcon
              isSet={formState.dirtyFields.newPassword}
              hasError={errors.newPassword?.types?.notEmail}
            />
            Must not be your email address
          </li>
          <li data-testid="change-password-common">
            <ValidationIcon
              isSet={formState.dirtyFields.newPassword}
              hasError={errors.newPassword?.types?.uncommon}
            />
            Must not match this{' '}
            <LinkExternal
              className="link-blue"
              data-testid="nav-link-common-passwords"
              href="https://support.mozilla.org/en-US/kb/password-strength"
            >
              list of common passwords
            </LinkExternal>
          </li>
        </ul>

        <div className="my-6">
          <InputPassword
            name="oldPassword"
            label="Enter current password"
            className="mb-2"
            errorText={currentPasswordErrorText}
            onChange={() => {
              if (currentPasswordErrorText) {
                setCurrentPasswordErrorText(undefined);
              }
              trigger('oldPassword');
            }}
            inputRef={register({
              required: true,
            })}
          />
          <InputPassword
            name="newPassword"
            label="Enter new password"
            className="mb-2"
            onChange={() => trigger(['newPassword', 'confirmPassword'])}
            inputRef={register({
              required: true,
              validate: {
                length: (value: string) => value.length > 7,
                notEmail: (value: string) => {
                  const input = value.toLowerCase();
                  const email = primaryEmail.email.toLowerCase();
                  const [username] = email.split('@');
                  return (
                    !input.includes(email) &&
                    !email.includes(input) &&
                    (!input.includes(username) ||
                      username.length * 2 < input.length)
                  );
                },
                uncommon: async (value: string) => {
                  // @ts-ignore
                  const list = await import('fxa-common-password-list');
                  return !list.test(value.toLowerCase());
                },
              },
            })}
          />
          <InputPassword
            name="confirmPassword"
            label="Re-enter new password"
            onChange={() => trigger(['newPassword', 'confirmPassword'])}
            inputRef={register({
              required: true,
              validate: (value) => value === getValues().newPassword,
            })}
          />
        </div>

        <div className="flex justify-center mb-4 mx-auto max-w-64">
          <button
            type="button"
            className="cta-neutral mx-2 flex-1"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            data-testid="submit-change-password"
            type="submit"
            className="cta-primary mx-2 flex-1"
            disabled={
              !formState.isDirty || !formState.isValid || changePassword.loading
            }
          >
            Save
          </button>
        </div>

        <LinkExternal
          className="link-blue text-sm justify-center flex"
          data-testid="nav-link-reset-password"
          href="/reset_password"
        >
          Forgot password?
        </LinkExternal>
      </form>
    </FlowContainer>
  );
};

export default PageChangePassword;
