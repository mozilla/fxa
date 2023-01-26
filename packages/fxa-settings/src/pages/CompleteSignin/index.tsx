/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useNavigate, RouteComponentProps } from '@reach/router';
import LinkDamaged from '../../components/LinkDamaged';
import LinkExpired from '../../components/LinkExpired';
import LinkUsed from '../../components/LinkUsed';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { usePageViewEvent } from '../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { LinkStatus } from '../../lib/types';

// We will probably grab `isSignedIn` off of the Account model in the long run.
export type CompleteSigninProps = {
  brokerNextAction?: Function;
  isForPrimaryEmail: boolean;
  linkStatus: LinkStatus;
};

const CompleteSignin = ({
  brokerNextAction,
  isForPrimaryEmail,
  linkStatus,
}: CompleteSigninProps & RouteComponentProps) => {
  usePageViewEvent('complete-signin', {
    entrypoint_variation: 'react',
  });
  const navigate = useNavigate();
  const linkType = 'signin';
  const [error, setError] = useState<string>();
  // there is no valid view in the `complete_signin` mustache. It completes your signin,
  // and then redirects you according to the broker method. The default is to `signin_verified`.
  // I think it makes sense to keep this logic in this page (as opposed to housing it a level up,
  // in the router), so I'm opting to show a "progress" animation  until we're redirected or hit an error
  if (linkStatus === 'valid') {
    try {
      // TO-DO:
      // do all the stuff to complete signin!
      brokerNextAction ? brokerNextAction() : navigate('/signin_verified');
    } catch (error) {
      setError(error);
      // TO-DO:
      // Update the UI from the original template to use the Alert Bar.
    }
  }
  return (
    <>
      {linkStatus === 'valid' && (
        <div className="flex-col justify-center align-middle">
          {error ? (
            <p className="text-sm">
              <span className="text-red-600 uppercase">
                <FtlMsg id="error-label">Error:</FtlMsg>
              </span>{' '}
              {error}
            </p>
          ) : (
            <>
              <FtlMsg id="validating-signin">
                <p className="text-base">Validating sign-in…</p>
              </FtlMsg>
              <LoadingSpinner className="flex items-center flex-col justify-center mt-4 select-none" />
            </>
          )}
        </div>
      )}
      {linkStatus === 'damaged' && <LinkDamaged {...{ linkType }} />}
      {linkStatus === 'expired' && <LinkExpired {...{ linkType }} />}
      {linkStatus === 'used' && <LinkUsed {...{ isForPrimaryEmail }} />}
    </>
  );
};

export default CompleteSignin;
