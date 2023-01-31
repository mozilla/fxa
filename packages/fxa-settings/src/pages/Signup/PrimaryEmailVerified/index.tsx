/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Ready from '../../../components/Ready';
import { MozServices } from '../../../lib/types';

export type PrimaryEmailVerifiedProps = {
  serviceName?: MozServices;
  isSignedIn?: boolean;
};

const PrimaryEmailVerified = ({
  serviceName,
  isSignedIn = false,
}: PrimaryEmailVerifiedProps & RouteComponentProps) => {
  const viewName = 'primary-email-verified';

  return <Ready {...{ viewName, serviceName, isSignedIn }} />;
};

export default PrimaryEmailVerified;
