/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { RouteComponentProps } from '@reach/router';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import { FtlMsg } from 'fxa-react/lib/utils';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';
import GleanMetrics from '../../lib/glean';

export const viewName = 'cannot-create-account';

const CannotCreateAccount = (_: RouteComponentProps) => {
  /* TODO: get serviceName from relier once FXA-6437 is complete. Or... rethink this issue
   * filed/fixed 8.5 years ago: https://github.com/mozilla/fxa-content-server/issues/1783
   * In some contexts, opening this link in a new tab was not ideal, so we previously set it
   * to open in a new tab _only_ if it was the Sync flow. Is this still true?
   * Alternatively, do we want to always open this in the same tab since users are locked out?
   */
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  GleanMetrics.registration.ageInvalid();
  return (
    <AppLayout>
      {/* Span is temporary until sign up tests are converted to playwright */}
      <span id="fxa-cannot-create-account-header">
        <CardHeader
          headingText="Cannot create account"
          headingTextFtlId="cannot-create-account-header"
        />
      </span>
      <FtlMsg id="cannot-create-account-requirements-2">
        <p className="my-4 text-sm">
          You must meet certain age requirements to create a Mozilla account.
        </p>
      </FtlMsg>
      <LinkExternal
        className="link-blue text-sm"
        href="https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy"
      >
        <FtlMsg id="cannot-create-account-learn-more-link">Learn more</FtlMsg>
      </LinkExternal>
    </AppLayout>
  );
};

export default CannotCreateAccount;
