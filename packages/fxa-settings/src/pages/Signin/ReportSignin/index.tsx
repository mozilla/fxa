/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { usePageViewEvent } from '../../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { RouteComponentProps } from '@reach/router';
import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { ReportSigninProps } from './interfaces';
import Banner from '../../../components/Banner';

export const viewName = 'report-signin';

export const ReportSignin = ({
  errorMessage,
  submitReport,
}: ReportSigninProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  return (
    <AppLayout>
      <CardHeader
        headingText="Report unauthorized sign-in?"
        headingTextFtlId="report-signin-header"
      />
      {errorMessage && (
        <Banner type="error" content={{ localizedHeading: errorMessage }} />
      )}
      <FtlMsg id="report-signin-body">
        <p>
          You received an email about attempted access to your account. Would
          you like to report this activity as suspicious?
        </p>
      </FtlMsg>
      <form
        noValidate
        className="my-4"
        onSubmit={(event) => {
          event.preventDefault();
          submitReport();
        }}
      >
        <FtlMsg id="report-signin-submit-button">
          {/* TODO submit handling */}
          <button
            id="submit-btn"
            type="submit"
            className="cta-primary w-full cta-xl"
          >
            Report activity
          </button>
        </FtlMsg>
      </form>
      <FtlMsg id="report-signin-support-link">
        <LinkExternal
          className="link-blue text-sm"
          href="https://support.mozilla.org/kb/accounts-blocked"
        >
          Why is this happening?
        </LinkExternal>
      </FtlMsg>
    </AppLayout>
  );
};

export default ReportSignin;
