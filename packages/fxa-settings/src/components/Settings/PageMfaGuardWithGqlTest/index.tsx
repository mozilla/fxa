/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState, useEffect, useSyncExternalStore } from 'react';
import {
  JwtNotFoundError,
  JwtTokenCache,
  sessionToken as getSessionToken,
} from '../../../lib/cache';

import { MfaGuard } from '../MfaGuard';
import { RouteComponentProps } from '@reach/router';
import { useErrorHandler } from 'react-error-boundary';
import { ApolloError, gql, useMutation } from '@apollo/client';
import { MfaReason } from '../../../lib/types';

export const PageMfaGuardTestWithGql = (props: RouteComponentProps) => {
  return (
    <MfaGuard requiredScope="test" reason={MfaReason.test}>
      <TestWithGql {...{ props }} />
    </MfaGuard>
  );
};

export default PageMfaGuardTestWithGql;

const MFA_TEST_MUTATION = gql`
  mutation MfaTest($input: MfaTestInput!) {
    mfaTest(input: $input) {
      status
    }
  }
`;

const TestWithGql = (_: RouteComponentProps) => {
  const errorHandler = useErrorHandler();
  const jwtCache = useSyncExternalStore(
    JwtTokenCache.subscribe,
    JwtTokenCache.getSnapshot
  );
  const [status, setStatus] = useState('');
  const [refresh, setRefresh] = useState(0);

  const [mfaTest] = useMutation(MFA_TEST_MUTATION, {
    onError() {
      // no-op
    },
  });

  const sessionToken = getSessionToken();
  if (!sessionToken) {
    throw new Error('Invalid state. Session token missing!@');
  }

  // Each page will have a unique scope, possibly shared with other pages
  const scope = 'test';
  const jwtKey = `${sessionToken}-${scope}`;

  // Fire off the request to test if the JWT worked or not
  // If this throws an exception, we should get a 110 errno back
  // and the guard's modal should pop up again
  useEffect(() => {
    (async () => {
      const jwt = JwtTokenCache.getToken(sessionToken, scope);

      const result = await mfaTest({
        variables: {
          input: {
            jwt: jwt,
          },
        },
      });

      if (result.data?.mfaTest) {
        setStatus(
          result.data?.mfaTest.status === 'success' ? 'valid' : 'invalid'
        );
      } else if (result.errors instanceof ApolloError) {
        // extensions holds the auth server errno and code
        errorHandler(result.errors?.cause?.extensions);
      }
    })();
  }, [jwtCache, mfaTest, errorHandler, sessionToken]);

  // Wrap the page's content with an MfaGuard to protect it from access without
  // a JWT that has a scope of "test"
  return (
    <>
      <b>JWT Status Check</b>
      <br />
      <br />
      <p>
        Your JWT status is: <pre>{status}</pre>
      </p>
      <br />
      <p>
        Your JWT is held in the cache under:
        <pre>{jwtKey}</pre>
      </p>
      <br />
      <p>
        Your JWT value is:
        <pre>{jwtCache[jwtKey]}</pre>
      </p>
      <br />
      <p>
        Page Refreshes <pre>{refresh}</pre>
      </p>

      <br />
      <br />
      <button
        type="button"
        className="cta-neutral cta-xl flex-1 w-1/2"
        onClick={(e) => {
          // This just illustrates the persistence of the JWT in the cache.
          // If you wait long enough, the JWT expires, and hitting
          // refresh should result in an invalid jwt, and cause the
          // OTP modal to pop up. Same as above.
          setRefresh(refresh + 1);
          e.stopPropagation();
        }}
      >
        Refresh Page
      </button>

      <br />
      <br />
      <button
        type="button"
        className="cta-neutral cta-xl flex-1 w-1/2"
        onClick={(e) => {
          // This illustrates what happens if a token drops out of cache.
          // The OTP modal should pop up!
          JwtTokenCache.removeToken(sessionToken, scope);

          // Important! The click has a race and can bubble
          // up and close the modal that is going to be rendered
          // after the JWT gets cleared from the cache
          e.stopPropagation();
        }}
      >
        Clear JWT from Cache
      </button>

      <br />
      <br />
      <button
        type="button"
        className="cta-neutral cta-xl flex-1 w-1/2"
        onClick={(e) => {
          // This illustrates what happens if the token held in the cache
          // expires. In this case, we should get back a 110 errno, and
          // the MFA error boundary should pick this state up, flush the
          // token, and the OTP modal should be displayed again.
          const expiredToken =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1aWQiLCJzY29wZSI6WyJwcm90ZWN0ZWQtYWN0aW9uczp0ZXN0Il0sImlhdCI6MTc1NTg4MTQ4NiwianRpIjoiY2QyNTJjZjYtM2MwNi00OWYyLWE4OTItNjU5NTc2MjhjZWU5IiwiZXhwIjoxNzU1ODgxNDk2LCJhdWQiOiJmeGEiLCJpc3MiOiJhY2NvdW50cy5maXJlZm94LmNvbSJ9.GB_vrTsRXmpVF5WYKCaUPqCcP5WOBS2wOvuzvkjafiw';
          JwtTokenCache.setToken(sessionToken, scope, expiredToken);
          e.stopPropagation();
        }}
      >
        Replace with JWT in cache with expired token.
      </button>

      <br />
      <br />
      <button
        type="button"
        className="cta-neutral cta-xl flex-1 w-1/2"
        onClick={(e) => {
          // In the event a random error is thrown, the MFA error boundary
          // should let it bubble up to the AppError boundary, and
          // we should see the General Error screen
          errorHandler(new Error('BOOMO!'));
          e.stopPropagation();
        }}
      >
        Throw unrelated error.
      </button>

      <br />
      <br />
      <button
        type="button"
        className="cta-neutral cta-xl flex-1 w-1/2"
        onClick={(e) => {
          // In the event a fabricated JWT-not-found error occurs,
          // the error boundary should catch this, and clear the
          // token from cache, which will cause the OTP modal to pop up.
          errorHandler(new JwtNotFoundError());
          e.stopPropagation();
        }}
      >
        Throw fabricated invalid token error.
      </button>
    </>
  );
};
