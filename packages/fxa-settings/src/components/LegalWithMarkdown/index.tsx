/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import AppLayout from '../AppLayout';
import { navigate } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import CardHeader from '../CardHeader';
import MarkdownLegal from '../MarkdownLegal';
import Banner, { BannerType } from '../Banner';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { REACT_ENTRYPOINT } from '../../constants';
import { fetchLegalMd, LegalDocFile } from '../../lib/file-utils-legal';

const LegalWithMarkdown = ({
  locale,
  viewName,
  legalDocFile,
  headingTextFtlId,
  headingText,
}: {
  locale?: string;
  viewName: 'legal-privacy' | 'legal-terms';
  legalDocFile: LegalDocFile;
  headingTextFtlId: string;
  headingText: string;
}) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const [markdown, setMarkdown] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { markdown: fetchedMarkdown, error } = await fetchLegalMd(
        navigator.languages,
        locale,
        legalDocFile
      );
      // ensure component is still mounted before trying to render (fixes state update warning)
      if (isMounted) {
        if (fetchedMarkdown) {
          setMarkdown(fetchedMarkdown);
        }
        if (error) {
          setError(error);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [locale, legalDocFile]);

  const buttonHandler = () => {
    logViewEvent(`flow.${viewName}`, 'back', REACT_ENTRYPOINT);
    navigate(-1);
  };

  return (
    <AppLayout widthClass="card-xl">
      {markdown ? (
        <article className="text-start">
          <MarkdownLegal {...{ markdown }} />
        </article>
      ) : (
        <CardHeader {...{ headingTextFtlId, headingText }} />
      )}

      {!markdown && error && (
        <Banner type={BannerType.error}>
          <FtlMsg id="app-general-err-message">{error}</FtlMsg>
        </Banner>
      )}

      {!markdown && !error && (
        <LoadingSpinner imageClassName="w-10 h-10 animate-spin mx-auto" />
      )}

      <div className="flex mt-5">
        <FtlMsg id="legal-back-button">
          <button className="cta-primary cta-xl" onClick={buttonHandler}>
            Back
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default LegalWithMarkdown;
