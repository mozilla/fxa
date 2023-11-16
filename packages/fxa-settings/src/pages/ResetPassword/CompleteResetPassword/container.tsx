/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import CompleteResetPassword from '.';
import { Integration } from '../../../models';
import LinkValidator from '../../../components/LinkValidator';
import { LinkType } from '../../../lib/types';
import { CreateCompleteResetPasswordLink } from '../../../models/reset-password/verification/factory';

const CompleteResetPasswordContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  // TODO: possibly rethink LinkValidator approach as it's a lot of layers with
  // the new container approach. We want to handle validation here while still sharing
  // logic with other container components and probably rendering CompleteResetPassword
  // and other link status components here. FXA-8099
  return (
    <LinkValidator
      path="/complete_reset_password/*"
      linkType={LinkType['reset-password']}
      viewName="complete-reset-password"
      createLinkModel={() => {
        return CreateCompleteResetPasswordLink();
      }}
      {...{ integration }}
    >
      {({ setLinkStatus, linkModel }) => (
        <CompleteResetPassword
          {...{
            setLinkStatus,
            linkModel,
            integration,
          }}
        />
      )}
    </LinkValidator>
  );
};

export default CompleteResetPasswordContainer;
