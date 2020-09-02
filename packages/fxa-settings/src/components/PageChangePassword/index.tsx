/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import FlowContainer from '../FlowContainer';
import InputPassword from '../InputPassword';
import LinkExternal from 'fxa-react/components/LinkExternal';

// eslint-disable-next-line no-empty-pattern
export const PageChangePassword = ({}: RouteComponentProps) => {
  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    // TODO: actually perform the change password
  };

  return (
    <FlowContainer title="Change Password">
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
          <InputPassword label="Enter current password" className="mb-2" />
          <InputPassword label="Enter new password" className="mb-2" />
          <InputPassword label="Re-enter new password" />
        </div>

        <div className="flex justify-center mb-4 mx-auto max-w-64">
          <button
            className="cta-neutral mx-2 flex-1"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button className="cta-primary mx-2 flex-1">Save</button>
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
