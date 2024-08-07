/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { RouteComponentProps } from '@reach/router';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';
import firefox from '../../lib/channels/firefox';
import CardHeader from '../../components/CardHeader';
import { useConfig } from '../../models';

export const viewName = 'web_channel_example';

const WebChannelExample = (_: RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const config = useConfig();
  const [fxaStatusResult, setFxaStatusResult] = useState('');
  const [signedInUser, setSignedInUser] = useState({
    authAt: Date.now(),
    email: 'unknown',
    sessionToken: 'unknown',
    uid: 'unknown',
    verified: true,

    // Fake data for example. In user flows, these would exist.
    keyFetchToken: '123',
    unwrapBKey: '123',
  });

  if (config.env !== 'development') {
    return <></>;
  }

  return (
    <AppLayout>
      <CardHeader
        headingTextFtlId="web-channel-examples"
        headingText="Web Channel Examples"
      />
      <div className="flex mobile:justify-between gap-x-10">
        <div>
          <div>
            <b>FxA Status</b>
            <p>Request status of the currently signed in user.</p>
            <button
              className="cta-neutral cta-base"
              onClick={async () => {
                const status = await firefox.fxaStatus({
                  service: 'sync',
                  isPairing: true,
                  context: 'fx_desktop_v3',
                });
                signedInUser.authAt = Date.now();
                signedInUser.email = status.signedInUser?.email || 'unknown';
                signedInUser.sessionToken =
                  status.signedInUser?.sessionToken || 'unknown';
                signedInUser.uid = status.signedInUser?.uid || 'unknown';
                signedInUser.verified = status.signedInUser?.verified || false;
                setSignedInUser(signedInUser);
                setFxaStatusResult(JSON.stringify(status, null, 1));
              }}
            >
              Get FxA Status
            </button>
            <br />
            <br />
            <pre style={{ fontSize: 8, textAlign: 'left' }}>
              {fxaStatusResult}
            </pre>
          </div>
          <br />
          <div>
            <b>FxA Logout</b>
            <p>Request the current user be signed out of firefox.</p>
            <button
              className="cta-neutral cta-base"
              onClick={() => firefox.fxaLogout({ uid: signedInUser?.uid })}
            >
              Logout Web Channel Event
            </button>
          </div>
          <br />
          <div>
            <b>FxA Login</b>
            <p>
              Requests a user be signed into firefox.{' '}
              <i>(Use the last known state returned by FxaStatus above.)</i>
            </p>
            <button
              className="cta-neutral cta-base"
              onClick={() => {
                firefox.fxaLogin({
                  ...signedInUser,
                });
              }}
            >
              Login Web Channel Event
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WebChannelExample;
