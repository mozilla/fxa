/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

import {
  Integration,
  isOAuthWebIntegration,
  useAuthClient,
  useFtlMsgResolver,
} from '../../models';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import { useNavigateWithQuery } from '../../lib/hooks';
import { getAccountByUid } from '../../lib/cache';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import {
  DisplayablePermission,
  displayablePermissions,
  recordSeenPermissions,
} from '../../lib/oauth/permissions';
import OAuthDataError from '../../components/OAuthDataError';
import { getSigninState, handleNavigation } from '../Signin/utils';
import { SigninLocationState } from '../Signin/interfaces';
import Permissions, { PermissionRow } from '.';

const PermissionsContainer = ({
  integration,
}: {
  integration: Integration;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateWithQuery = useNavigateWithQuery();
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const [bannerErrorMessage, setBannerErrorMessage] = useState('');
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const signinState = getSigninState(location.state as SigninLocationState);

  // getPermissions throws on an unusable scope. The App-level handler renders
  // OAuthDataError for that, so let it surface rather than masking it here.
  const scopes = useMemo(
    () =>
      isOAuthWebIntegration(integration)
        ? displayablePermissions(integration.getPermissions())
        : [],
    [integration]
  );

  // Reached without a session, e.g. by typing the URL. There is no flow to
  // resume, so send the user back to sign in.
  useEffect(() => {
    if (!signinState || !isOAuthWebIntegration(integration)) {
      navigateWithQuery('/signin');
    }
  }, [signinState, integration, navigateWithQuery]);

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  if (!signinState || !isOAuthWebIntegration(integration)) {
    return <LoadingSpinner fullScreen />;
  }

  const onContinue = async () => {
    setBannerErrorMessage('');
    const clientId = integration.getClientId();
    if (clientId) {
      recordSeenPermissions(signinState.uid, clientId, scopes);
    }
    const { error: navError } = await handleNavigation({
      navigate,
      email: signinState.email,
      signinData: {
        uid: signinState.uid,
        sessionToken: signinState.sessionToken,
        emailVerified: signinState.emailVerified,
        sessionVerified: signinState.sessionVerified,
        verificationMethod: signinState.verificationMethod,
        verificationReason: signinState.verificationReason,
      },
      integration,
      finishOAuthFlowHandler,
      queryParams: location.search,
      authClient,
    });
    if (navError) {
      setBannerErrorMessage(getLocalizedErrorMessage(ftlMsgResolver, navError));
    }
  };

  const onCancel = () => navigateWithQuery('/signin');

  const values: Record<DisplayablePermission, string | undefined> = {
    'profile:email': signinState.email,
    'profile:display_name': getAccountByUid(signinState.uid)?.displayName,
  };
  const rows: PermissionRow[] = scopes.map((scope) => ({
    scope,
    value: values[scope],
  }));

  return (
    <Permissions
      serviceName={integration.getServiceName()}
      {...{ rows, onContinue, onCancel, bannerErrorMessage }}
    />
  );
};

export default PermissionsContainer;
