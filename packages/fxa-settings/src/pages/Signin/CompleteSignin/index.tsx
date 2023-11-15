/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useNavigate, RouteComponentProps } from '@reach/router';
import { SigninLinkDamaged } from '../../../components/LinkDamaged';
import { LinkExpiredSignin } from '../../../components/LinkExpiredSignin';
import LinkUsed from '../../../components/LinkUsed';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { usePageViewEvent } from '../../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { LinkStatus } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';
import AppLayout from '../../../components/AppLayout';

// We will probably grab `isSignedIn` off of the Account model in the long run.
// and email from validated query params
export type CompleteSigninProps = {
  email: string;
  brokerNextAction?: Function;
  isForPrimaryEmail: boolean;
  linkStatus: LinkStatus;
};

export const viewName = 'complete-signin';

const CompleteSignin = ({
  email,
  brokerNextAction,
  isForPrimaryEmail,
  linkStatus,
}: CompleteSigninProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const navigate = useNavigate();
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

  if (linkStatus === LinkStatus.damaged) {
    return <SigninLinkDamaged />;
  }
  if (linkStatus === LinkStatus.expired) {
    return <LinkExpiredSignin {...{ email, viewName }} />;
  }
  if (linkStatus === LinkStatus.used) {
    return <LinkUsed {...{ isForPrimaryEmail }} />;
  }

  return (
    <AppLayout>
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
              <LoadingSpinner fullScreen />
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default CompleteSignin;
