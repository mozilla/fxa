/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { logPageViewEvent } from '../../lib/metrics';
import { ReactComponent as EmailBounced } from './graphic_email_bounced.svg';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models/hooks';
import LinkExternal from 'fxa-react/components/LinkExternal';

export type SigninBouncedProps = {
  onBackButtonClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  canGoBack?: boolean;
  email: string;
};

const SigninBounced = ({
  canGoBack,
  email,
  onBackButtonClick = () => window.history.back(),
}: SigninBouncedProps & RouteComponentProps) => {
  logPageViewEvent('signin-bounced', {
    entrypoint_variation: 'react',
  });
  const ftlMessageResolver = useFtlMsgResolver();
  const backText = ftlMessageResolver.getMsg('back', 'Back');
  const navigate = useNavigate();

  const createAccountHandler = () => {
    // TO-DO (per content-server functionality):
    // clear all existing accounts
    // clear the session
    // clear the form prefill
    navigate('/signup');
  };

  return (
    <>
      <div className="mb-4">
        <FtlMsg id="signin-bounced-header">
          <h1 className="card-header">
            Sorry. We’ve locked your{'\u00A0'}account.
          </h1>
        </FtlMsg>
      </div>
      <section>
        <div className="flex justify-center mx-auto">
          <EmailBounced className="w-3/5" role="img" />
        </div>
        <FtlMsg id="signin-bounced-message" vars={{ email: email }}>
          <p className="text-sm mb-6">
            The confirmation email we sent to {email} was returned and we’ve
            locked your account to protect your Firefox data.
          </p>
        </FtlMsg>

        <FtlMsg id="signin-bounced-help">
          <p className="text-sm mb-6 text-grey-400">
            If this is a valid email address,{' '}
            <LinkExternal
              className="link-blue"
              href="https://support.mozilla.org/"
            >
              let us know
            </LinkExternal>{' '}
            and we can help unlock your account.
          </p>
        </FtlMsg>

        <div className="flex flex-col link-blue text-sm">
          {/*
            In the original code, there are style classes that indicate that
            if the Back button is visible, it should be aligned right and the
            'create a new account' text should be aligned left. This is accomplished
            via a check which conditionally adds the `left` class to the create-account text.
            We can make them align this way fairly easily, but it looks a little strange,
            and prod currently does not reflect these changes, so we're leaving it as-is pending
            further weigh-in from product.
           */}
          <button
            id="create-account"
            className="mb-2 opacity-0 animate-delayed-fade-in"
            onClick={createAccountHandler}
          >
            <FtlMsg id="signin-bounced-create-new-account">
              No longer own that email? Create a new account
            </FtlMsg>
          </button>
          {canGoBack && (
            <button
              className="opacity-0 animate-delayed-fade-in"
              onClick={onBackButtonClick}
              data-testid="signin-bounced-back-btn"
              title={backText}
            >
              <FtlMsg id="back">Back</FtlMsg>
            </button>
          )}
        </div>
      </section>
    </>
  );
};

export default SigninBounced;
