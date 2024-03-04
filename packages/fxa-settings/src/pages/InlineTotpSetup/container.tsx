/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useCallback, useEffect, useState } from 'react';
import InlineTotpSetup, { TotpToken } from '.';
import { MozServices } from '../../lib/types';
import { OAuthIntegration, useAccount, useSession } from '../../models';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { checkCode } from '../../lib/totp';
import { useMutation } from '@apollo/client';
import { CREATE_TOTP_MUTATION } from './gql';

export const InlineTotpSetupContainer = ({
  isSignedIn,
  integration,
  serviceName,
}: {
  isSignedIn: boolean;
  integration: OAuthIntegration;
  serviceName: MozServices;
} & RouteComponentProps) => {
  const [totp, setTotp] = useState<TotpToken>();

  const account = useAccount();
  const session = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const [createTotp] = useMutation<{ createTotp: TotpToken }>(
    CREATE_TOTP_MUTATION
  );

  const navTo = useCallback(
    (
      uri:
        | 'signup'
        | 'signin_token_code'
        | 'signin_totp_code'
        | 'inline_recovery_setup',
      state?: Record<string, any>
    ) => {
      navigate(`/${uri}${location.search}`, { state });
    },
    [location, navigate]
  );

  const cancelSetupHandler = useCallback(() => {
    const error = AuthUiErrors.TOTP_REQUIRED;

    if (integration.returnOnError()) {
      const url = integration.getRedirectWithErrorUrl(error);
      window.location.assign(url);
      return;
    }

    throw error;
  }, [integration]);

  const verifyCodeHandler = useCallback(
    async (code: string) => {
      try {
        const isValid = await checkCode(totp!.secret, code);

        if (!isValid) {
          throw AuthUiErrors.INVALID_TOTP_CODE;
        }

        navTo('inline_recovery_setup', { totp });
      } catch (error) {
        throw AuthUiErrors.INVALID_TOTP_CODE;
      }
    },
    [navTo, totp]
  );

  useEffect(() => {
    // The user is navigated to this page by the web application in response to
    // a sign-in attempt.  But let's do some sanity checks.

    if (!isSignedIn || !account || !session) {
      navTo('signup');
      return;
    }

    (async () => {
      try {
        const sessionVerified = await session.isSessionVerified();
        if (!sessionVerified) {
          navTo('signin_token_code');
        }

        await account.refresh('account');

        if (account.totpActive) {
          navTo('signin_totp_code');
        }

        const totpResp = await createTotp({ variables: { input: {} } });

        setTotp(totpResp.data?.createTotp);
      } catch (_) {
        navTo('signup');
      }
    })();
  }, [isSignedIn, account, session, navTo, createTotp]);

  if (!totp) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <InlineTotpSetup
      totp={totp!}
      email={account.email}
      serviceName={serviceName}
      cancelSetupHandler={cancelSetupHandler}
      verifyCodeHandler={verifyCodeHandler}
    />
  );
};

export default InlineTotpSetupContainer;
