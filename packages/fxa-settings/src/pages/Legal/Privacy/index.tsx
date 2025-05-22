/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { lazy, Suspense } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FetchLegalDoc } from '../../../components/LegalWithMarkdown';
import { LegalDocFile } from '../../../lib/file-utils-legal';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

const LegalWithMarkdown = lazy(
  () => import('../../../components/LegalWithMarkdown')
);

export const viewName = 'legal-privacy';

export type LegalPrivacyProps = {
  locale?: string;
  fetchLegalDoc?: FetchLegalDoc;
};

const LegalPrivacy = ({
  locale,
  fetchLegalDoc,
}: LegalPrivacyProps & RouteComponentProps) => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <LegalWithMarkdown
        {...{ locale, fetchLegalDoc, viewName }}
        headingTextFtlId="legal-privacy-heading"
        headingText="Privacy Notice"
        legalDocFile={LegalDocFile.privacy}
      />
    </Suspense>
  );
};

export default LegalPrivacy;
