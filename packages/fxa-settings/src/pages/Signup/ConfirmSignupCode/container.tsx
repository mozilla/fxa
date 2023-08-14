/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { Integration, useAuthClient } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import AppLayout from '../../../components/AppLayout';
import CardHeader from '../../../components/CardHeader';
import ConfirmSignupCode from '.';

const SignupConfirmCodeContainer = ({
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

  return <ConfirmSignupCode {...{ integration, finishOAuthFlowHandler }} />;
};

export default SignupConfirmCodeContainer;
