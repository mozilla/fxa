/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect, useState } from 'react';
import AppLayout from '../AppLayout';
import { navigate } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import CardHeader from '../CardHeader';
import MarkdownLegal from '../MarkdownLegal';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { REACT_ENTRYPOINT } from '../../constants';
import { fetchLegalMd, LegalDocFile } from '../../lib/file-utils-legal';
import { AppContext, useFtlMsgResolver } from '../../models';
import { searchParams } from '../../lib/utilities';
import Banner from '../Banner';

export type FetchLegalDoc = (
  locale: string,
  legalDocFile: string
) => Promise<{ markdown?: string; error?: string }>;

export type LegalWithMarkdownProps = {
  locale?: string;
  viewName: 'legal-privacy' | 'legal-terms';
  legalDocFile: LegalDocFile;
  headingTextFtlId: string;
  headingText: string;
  fetchLegalDoc?: FetchLegalDoc;
};

const LegalWithMarkdown = ({
  locale,
  viewName,
  legalDocFile,
  headingTextFtlId,
  headingText,
  fetchLegalDoc,
}: LegalWithMarkdownProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const [markdown, setMarkdown] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const { apolloClient } = useContext(AppContext);
  const ftlMsgResolver = useFtlMsgResolver();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      async function fetchLegal(locale: string, legalDocFile: string) {
        if (fetchLegalDoc != null) {
          return fetchLegalDoc(locale, legalDocFile);
        }
        return fetchLegalMd(apolloClient, locale, legalDocFile);
      }

      const { markdown: fetchedMarkdown, error } = await fetchLegal(
        locale || navigator.language || 'en',
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
  }, [locale, legalDocFile, apolloClient, fetchLegalDoc]);

  const buttonHandler = () => {
    logViewEvent(`flow.${viewName}`, 'back', REACT_ENTRYPOINT);

    navigate(
      (searchParams(window.location.search) as any).contentRedirect ? -2 : -1
    );
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

      {/* Currently this only returns a generic error message, we should verify if we want to display the specific error that occurred */}
      {!markdown && error && (
        <Banner
          type="error"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'app-general-err-message',
              'Something went wrong. Please try again later.'
            ),
          }}
        />
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
