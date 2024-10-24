/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import Storage from '../../lib/storage';
import { searchParams } from '../../lib/utilities';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import CardHeader from '../../components/CardHeader';
import { REACT_ENTRYPOINT } from '../../constants';
import Banner from '../../components/Banner';
import { useFtlMsgResolver } from '../../models';

export const viewName = 'cookies-disabled';

const CookiesDisabled = (_: RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const ftlMsgResolver = useFtlMsgResolver();

  /* HACK / TODO when sunsetting content-server: if this page is hit through content-server's
   * router instead of hitting it directly via `/cookies_disabled?showReactApp=true`, which
   * is useful for manual and possibly functional testing, we must navigate back _two_ pages.
   * Flow params are not always available to check against so we explicitely send in an
   * additional param. Remove this check when we don't handle the redirect `router.js`.
   */
  const { contentRedirect } = searchParams(window.location.search);
  const [stillDisabled, setStillDisabled] = useState(false);

  const buttonHandler = useCallback(() => {
    logViewEvent(`flow.${viewName}`, 'try-again-submit', REACT_ENTRYPOINT);
    if (!Storage.isLocalStorageEnabled(window) || !navigator.cookieEnabled) {
      logViewEvent(`flow.${viewName}`, 'try-again-fail', REACT_ENTRYPOINT);
      setStillDisabled(true);
    } else {
      logViewEvent(`flow.${viewName}`, 'try-again-success', REACT_ENTRYPOINT);
      if (contentRedirect) {
        window.history.go(-2);
      } else {
        window.history.back();
      }
    }
  }, [contentRedirect]);

  return (
    <AppLayout>
      <CardHeader
        headingTextFtlId="cookies-disabled-header"
        headingText="Local storage and cookies are required"
      />

      {stillDisabled && (
        <Banner
          type="error"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'auth-error-1003',
              'Local storage or cookies are still disabled'
            ),
          }}
        />
      )}

      <FtlMsg id="cookies-disabled-enable-prompt-2">
        <p className="text-sm">
          Please enable cookies and local storage in your browser to access your
          Mozilla account. Doing so will enable functionality such as
          remembering you between sessions.
        </p>
      </FtlMsg>

      <div className="my-6">
        <LinkExternal
          className="link-blue text-sm"
          href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer"
        >
          <FtlMsg id="cookies-disabled-learn-more">Learn more</FtlMsg>
        </LinkExternal>
      </div>

      <div className="flex">
        <FtlMsg id="cookies-disabled-button-try-again">
          <button className="cta-primary cta-xl" onClick={buttonHandler}>
            Try again
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default CookiesDisabled;
