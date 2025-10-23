/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../AppLayout';
import CardHeader from '../CardHeader';

type LinkDamagedProps = {
  headingText: string;
  headingTextFtlId: string;
};

const LinkDamaged = ({ headingText, headingTextFtlId }: LinkDamagedProps) => {
  return (
    <AppLayout>
      <CardHeader {...{ headingText, headingTextFtlId }} />

      <FtlMsg id="reset-pwd-link-damaged-message">
        <p className="mt-4 text-sm">
          The link you clicked was missing characters, and may have been broken
          by your email client. Copy the address carefully, and try again.
        </p>
      </FtlMsg>
    </AppLayout>
  );
};

export const ResetPasswordLinkDamaged = () => {
  // TODO in FXA-7630 add metrics event and associated tests for users hitting the LinkDamaged page
  return (
    <LinkDamaged
      headingText="Reset password link damaged"
      headingTextFtlId="reset-pwd-link-damaged-header"
    />
  );
};

export const SigninLinkDamaged = () => {
  return (
    <LinkDamaged
      headingText="Confirmation link damaged"
      headingTextFtlId="signin-link-damaged-header"
    />
  );
};

export const ReportSigninLinkDamaged = () => {
  return (
    <LinkDamaged
      headingText="Link damaged"
      headingTextFtlId="report-signin-link-damaged-header"
    />
  );
};
