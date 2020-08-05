/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { gql, useQuery } from '@apollo/client';
import sentryMetrics from 'fxa-shared/lib/sentry';

export const GET_SESSION = gql`
  query GetSession {
    session {
      verified
    }
  }
`;

export const VerifiedSessionGuard = ({
  guard,
  children,
}: {
  guard: React.ReactElement;
  children: React.ReactElement;
}) => {
  const { error, data } = useQuery(GET_SESSION, { fetchPolicy: 'cache-only' });

  if (error || !data) {
    // idk if this'll ever happen irl
    const e = error || new Error('VerifiedSessionGuard missing data');
    console.error(e);
    sentryMetrics.captureException(e);
    return guard;
  }

  return data.session.verified ? children : guard;
};

export default VerifiedSessionGuard;
