/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { usePageViewEvent } from '../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { RouteComponentProps } from '@reach/router';
import { ReactComponent as Mail } from './graphic_mail.svg';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useFtlMsgResolver } from '../../models/hooks';

export type ConfirmSigninProps = {
  canGoBack?: boolean;
  email: string;
  goBackCallback?: Function;
  isOpenWebmailButtonVisible: boolean; // TO-DO: Replace broker functionality which gives us this value (provider?)
};

export type WebmailValues = {
  buttonText: string;
  link: string;
};

const ConfirmSignin = ({
  canGoBack,
  email,
  goBackCallback,
  isOpenWebmailButtonVisible,
}: RouteComponentProps & ConfirmSigninProps) => {
  usePageViewEvent('confirm-signin', {
    entrypoint_variation: 'react',
  });

  const ftlMsgResolver = useFtlMsgResolver();

  const localizedAriaLabel = ftlMsgResolver.getMsg(
    'confirm-signin-aria-label',
    'A blue envelope with a link icon inside of it against a backdrop of light gray clouds'
  );

  // TO-DO: Replace utility that gets these values by matching the email provider via regex.
  const getWebmailValues = (email: string) => {
    return {
      buttonText: 'Open Gmail',
      link: `https://mail.google.com/mail/u/?authuser=${email}`,
    };
  };

  const webmailValues = getWebmailValues(email);

  const showBackButton = canGoBack && goBackCallback;

  const resendEmail = () => {
    // TO-DO: resend email to user.
  };

  /*
    TO-DO:
        - Fix up the alert bar for any errors (such as from resending the email) or success.
        - wire up the functionality to resend an email
  */

  return (
    <>
      <div className="mb-4">
        <FtlMsg id="confirm-signin-header">
          <h1 className="card-header">Confirm this sign-in</h1>
        </FtlMsg>
      </div>
      <section>
        <div className="flex justify-center">
          <Mail role="img" aria-label={localizedAriaLabel} />
        </div>
        <FtlMsg id="confirm-signin-message">
          <p className="my-4 text-sm">
            {`Check your email for the sign-in confirmation link sent to ${email}`}
          </p>
        </FtlMsg>
        {isOpenWebmailButtonVisible && (
          <div>
            <LinkExternal
              href={webmailValues.link}
              className="link-blue text-sm"
            >
              {webmailValues.buttonText}
            </LinkExternal>
          </div>
        )}
        <>
          <div className="flex flex-col gap-4">
            <button
              className="link-blue text-sm opacity-0 animate-delayed-fade-in"
              onClick={() => resendEmail()}
            >
              <FtlMsg id="confirm-pw-reset-resend">
                Not in inbox or spam folder? Resend
              </FtlMsg>
            </button>
            {showBackButton && (
              <button
                className="link-blue text-sm opacity-0 animate-delayed-fade-in"
                onClick={() => goBackCallback()}
              >
                <FtlMsg id="back">Back</FtlMsg>
              </button>
            )}
          </div>
        </>
      </section>
    </>
  );
};

export default ConfirmSignin;
