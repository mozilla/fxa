/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { Integration } from '../../../models';
import AccountRecoveryResetPassword from '.';

const AccountRecoveryResetPasswordContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  return <AccountRecoveryResetPassword {...{ integration }} />;
};

export default AccountRecoveryResetPasswordContainer;
