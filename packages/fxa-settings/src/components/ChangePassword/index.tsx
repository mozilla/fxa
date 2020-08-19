/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import FlowContainer from '../FlowContainer';
import PasswordInput from '../PasswordInput';
import LinkExternal from 'fxa-react/components/LinkExternal';

// eslint-disable-next-line no-empty-pattern
export const ChangePassword = ({}: RouteComponentProps) => {
  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    // TODO: actually perform the change password
  };

  return (
    <FlowContainer title="Change Password">
      <form onSubmit={handleSubmit}>
        <h1>Stay safe — don't reuse passwords. Your password:</h1>
        <ul className="list-disc text-grey-400 text-xs p-3">
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

        <PasswordInput label="Enter current password" />
        <PasswordInput label="Enter new password" />
        <PasswordInput label="Re-enter new password" />

        <div className="flex justify-center p-2">
          <button
            className="cta-neutral-lg w-1/4 m-2"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button className="cta-primary transition-standard w-1/4 m-2">
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

export default ChangePassword;
