/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as Mail } from './graphic_mail.svg';
import LinkExternal from 'fxa-react/components/LinkExternal';
import CardHeader from '../CardHeader';

export type ConfirmWithLinkProps = {
  confirmWithLinkPageStrings: ConfirmWithLinkPageStrings;
  email: string;
  // TODO : update type definition once callback function is defined
  goBackCallback?: () => void;
  withWebmailLink?: boolean; // TODO: Replace broker functionality which gives us this value (provider?)
  resendEmailCallback: () => void;
};

export type WebmailValues = {
  buttonText: string;
  link: string;
};

export type ConfirmWithLinkPageStrings = {
  headingText: string;
  headingFtlId: string;
  instructionText: string;
  instructionFtlId: string;
};

const ConfirmWithLink = ({
  confirmWithLinkPageStrings,
  email,
  goBackCallback,
  withWebmailLink = false,
  resendEmailCallback,
}: ConfirmWithLinkProps) => {
  // TODO: Replace utility that gets these values by matching the email provider via regex.
  const getWebmailValues = (email: string) => {
    // TODO replace hardcoded email provider and link - create a utility for this, see open-webmail-mixin.js
    // - encode email address
    const emailProvider = 'Gmail';
    return {
      emailProvider,
      link: `https://mail.google.com/mail/u/?authuser=${email}`,
    };
  };

  const webmailValues = getWebmailValues(email);

  /*
    TODO:
        - Add a Banner to receive error/success messages.
  */

  return (
    <>
      <CardHeader
        headingText={confirmWithLinkPageStrings.headingText}
        headingTextFtlId={confirmWithLinkPageStrings.headingFtlId}
      />

      <FtlMsg id="confirm-signup-aria-label" attrs={{ ariaLabel: true }}>
        <div className="flex justify-center">
          <Mail role="img" aria-label="An envelope containing a link" />
        </div>
      </FtlMsg>
      <FtlMsg id={confirmWithLinkPageStrings.instructionFtlId} vars={{ email }}>
        <p className="my-4 text-sm">
          {confirmWithLinkPageStrings.instructionText}
        </p>
      </FtlMsg>
      <div className="flex flex-col gap-3">
        {withWebmailLink && (
          <FtlMsg
            id="confirm-with-link-webmail-link"
            vars={{ emailProvider: webmailValues.emailProvider }}
          >
            <LinkExternal
              href={webmailValues.link}
              className="mx-auto link-blue text-sm"
            >
              Open {webmailValues.emailProvider}
            </LinkExternal>
          </FtlMsg>
        )}
        <FtlMsg id="confirm-with-link-resend-link-button">
          <button
            className="mx-auto link-blue text-sm opacity-0 animate-delayed-fade-in"
            onClick={() => resendEmailCallback()}
          >
            Not in inbox or spam folder? Resend
          </button>
        </FtlMsg>
        {goBackCallback && (
          <FtlMsg id="confirm-with-link-back-link">
            <button
              className="mx-auto link-blue text-sm opacity-0 animate-delayed-fade-in"
              onClick={() => goBackCallback()}
            >
              Back
            </button>
          </FtlMsg>
        )}
      </div>
    </>
  );
};

export default ConfirmWithLink;
