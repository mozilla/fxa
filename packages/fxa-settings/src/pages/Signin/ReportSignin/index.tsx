import React from 'react';
import { RouteComponentProps } from '@reach/router';
import CardHeader from '../../../components/CardHeader';

import { FtlMsg } from 'fxa-react/lib/utils';
import { usePageViewEvent } from '../../../lib/metrics';
import {
  BLOCKED_SIGNIN_SUPPORT_URL,
  REACT_ENTRYPOINT,
} from '../../../constants';
import LinkExternal from 'fxa-react/components/LinkExternal';

export type ReportSigninProps = {
  showSupportLink?: string;
};

export const viewName = 'report-signin';

export const ReportSignin = ({
  showSupportLink,
}: ReportSigninProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  // TODO: get all query params from link
  // TODO: validate all query params and determine if link is damaged
  // TODO: add tests
  // TODO: Add in the LinkDamaged component once Valerie's PR is merged
  // TODO: determine why we would or wouldn't show the support link.
  const isLinkDamaged = false;

  return (
    <>
      {isLinkDamaged ? (
        <>
          {/* We'll make this into a component when vpomerleau's PR is merged https://github.com/mozilla/fxa/pull/15058*/}
          <CardHeader
            headingText={'Link damaged'}
            headingTextFtlId={'report-signin-link-damaged-header'}
          />
          <FtlMsg id="reset-pwd-link-damaged-message">
            <p className="mt-4 text-sm">
              The link you clicked was missing characters, and may have been
              broken by your email client. Copy the address carefully, and try
              again.
            </p>
          </FtlMsg>
        </>
      ) : (
        <>
          <CardHeader
            headingText="Report unauthorized sign-in?"
            headingTextFtlId="report-signin-header"
          />
          <FtlMsg id="report-signin-message">
            <p className="mt-4 text-sm">
              You received an email about attempted access to your account.
              Would you like to report this activity as suspicious?
            </p>
          </FtlMsg>
          <form noValidate className="mt-6">
            <FtlMsg id="report-signin-cta-button">
              <button className="cta-primary cta-xl w-full" type="submit">
                Report activity
              </button>
            </FtlMsg>
          </form>

          {showSupportLink && (
            <FtlMsg id="report-signin-support-link-prompt">
              <LinkExternal
                className="link-blue text-sm block mt-6"
                href={BLOCKED_SIGNIN_SUPPORT_URL}
              >
                Why is this happening?
              </LinkExternal>
            </FtlMsg>
          )}
        </>
      )}
    </>
  );
};

export default ReportSignin;
