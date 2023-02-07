/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import LegalWithMarkdown from '.';
import { viewName as termsViewName } from '../../pages/Legal/Terms';
import { LegalDocFile } from '../../lib/file-utils-legal';

// defaults are set to LegalTerms
export const Subject = ({
  locale = undefined,
  viewName = termsViewName,
  legalDocFile = LegalDocFile.terms,
  headingTextFtlId = 'legal-terms-heading',
  headingText = 'Terms of Service',
}: Partial<React.ComponentProps<typeof LegalWithMarkdown>>) => {
  return (
    <LegalWithMarkdown
      {...{ locale, viewName, legalDocFile, headingTextFtlId, headingText }}
    />
  );
};
