/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import * as Sentry from '@sentry/browser';
import { FtlMsg } from 'fxa-react/lib/utils';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import { AuthError } from '../../lib/oauth';
import { useFtlMsgResolver } from '../../models';
import AppLayout from '../AppLayout';
import Banner from '../Banner';
import CardHeader from '../CardHeader';

const OAuthDataError = ({
  error,
  gleanMetric,
}: {
  error: AuthError;
  gleanMetric?: (data: { event: { reason: string } }) => void;
}) => {
  const ftlMsgResolver = useFtlMsgResolver();

  // Prefer the ID from the original capture site.
  const [sentryEventId, setSentryEventId] = useState(error.sentryEventId);

  useEffect(() => {
    // Capture only errors not already reported at their throw site, so one
    // error never emits two events. Stamp the id onto the error so a remount
    // (e.g. StrictMode) reuses it instead of capturing again.
    if (error.sentryEventId) {
      return;
    }
    const eventId = Sentry.captureException(new Error(error.message), {
      tags: { source: 'OAuthDataError', errno: error.errno },
    });
    error.sentryEventId = eventId;
    setSentryEventId(eventId);
  }, [error]);

  useEffect(() => {
    if (gleanMetric) {
      gleanMetric({ event: { reason: error.errno.toString() } });
    }
  }, [gleanMetric, error.errno]);

  return (
    <AppLayout>
      <CardHeader
        headingText="Bad Request"
        headingTextFtlId="error-bad-request"
      />
      {/* TODO Localize this, FXA-9502, and account for potential errno
        overlaps with AuthErrors (see ticket). */}
      <Banner
        type="error"
        content={{
          // TODO FXA-9502
          localizedHeading: error.version
            ? getLocalizedErrorMessage(ftlMsgResolver, error)
            : error.message,
        }}
      />
      {sentryEventId && (
        <FtlMsg id="app-error-id" vars={{ errorId: sentryEventId }}>
          <p className="mt-6 text-center text-xs text-grey-400 dark:text-grey-300">
            {`Error ID: ${sentryEventId}`}
          </p>
        </FtlMsg>
      )}
    </AppLayout>
  );
};

export default OAuthDataError;
