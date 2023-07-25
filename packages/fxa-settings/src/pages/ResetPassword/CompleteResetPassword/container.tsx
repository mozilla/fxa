/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import CompleteResetPassword from '.';
import { Integration, useAuthClient } from '../../../models';
import LinkValidator from '../../../components/LinkValidator';
import { LinkType } from '../../../lib/types';
import { CreateCompleteResetPasswordLink } from '../../../models/reset-password/verification/factory';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import AppLayout from '../../../components/AppLayout';
import { CardHeader } from '@material-ui/core';

const CompleteResetPasswordContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  // TODO: UX for this, FXA-8106
  if (oAuthDataError) {
    return (
      <AppLayout>
        <CardHeader
          headingText="Unexpected error"
          headingTextFtlId="auth-error-999"
        />
      </AppLayout>
    );
  }

  // TODO: possibly rethink LinkValidator approach as it's a lot of layers with
  // the new container approach. We want to handle validation here while still sharing
  // logic with other container components and probably rendering CompleteResetPassword
  // and other link status components here. FXA-8099
  return (
    <LinkValidator
      path="/complete_reset_password/*"
      linkType={LinkType['reset-password']}
      viewName="complete-reset-password"
      getParamsFromModel={() => {
        return CreateCompleteResetPasswordLink();
      }}
      {...{ integration }}
    >
      {({ setLinkStatus, params }) => (
        <CompleteResetPassword
          {...{
            setLinkStatus,
            params,
            integration,
            finishOAuthFlowHandler,
          }}
        />
      )}
    </LinkValidator>
  );
};

export default CompleteResetPasswordContainer;
