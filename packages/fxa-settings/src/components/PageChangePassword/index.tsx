/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
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

// eslint-disable-next-line no-empty-pattern
export const PageChangePassword = ({}: RouteComponentProps) => {
  const [alertBarRevealed, revealAlertBar, hideAlertBar] = useBooleanState();
  const [saveBtnDisabled, setSaveBtnDisabled] = useState(true);
  const [alertText, setAlertText] = useState<string>();
  const [currentPasswordErrorText, setCurrentPasswordErrorText] = useState<
    string
  >();
  const oldPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const { primaryEmail } = useAccount();
  const navigate = useNavigate();
  const changePassword = usePasswordChanger({
    onSuccess: (response) => {
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
      } else {
        setAlertText(e.message);
        revealAlertBar();
      }
    },
  });

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    // TODO input field validation
    if (
      oldPasswordRef.current?.value &&
      newPasswordRef.current?.value &&
      confirmPasswordRef.current?.value
    ) {
      changePassword.execute(
        primaryEmail.email,
        oldPasswordRef.current.value,
        newPasswordRef.current.value,
        sessionToken()!
      );
    }
  };

  const checkForm = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      // TODO input field validation
      setSaveBtnDisabled(false);
    },
    [setSaveBtnDisabled]
  );

  return (
    <FlowContainer title="Change Password">
      {alertBarRevealed && alertText && (
        <AlertBar onDismiss={hideAlertBar} type="error">
          <p data-testid="sign-out-error">Error text TBD. {alertText}</p>
        </AlertBar>
      )}
      <form onSubmit={handleSubmit}>
        <h1>Stay safe — don't reuse passwords. Your password:</h1>

        <ul className="list-disc text-grey-400 text-xs m-3 list-inside">
          <li>Must be at least 8 characters</li>
          <li>Must not be your email address</li>
          <li>
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
            label="Enter current password"
            className="mb-2"
            onChange={checkForm}
            errorText={currentPasswordErrorText}
            inputRef={oldPasswordRef}
          />
          <InputPassword
            label="Enter new password"
            className="mb-2"
            onChange={checkForm}
            inputRef={newPasswordRef}
          />
          <InputPassword
            label="Re-enter new password"
            onChange={checkForm}
            inputRef={confirmPasswordRef}
          />
        </div>

        <div className="flex justify-center mb-4 mx-auto max-w-64">
          <button
            className="cta-neutral mx-2 flex-1"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            className="cta-primary mx-2 flex-1"
            disabled={saveBtnDisabled || changePassword.loading}
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
