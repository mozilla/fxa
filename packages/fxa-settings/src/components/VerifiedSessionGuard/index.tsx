/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useSession } from '../../models';

export const VerifiedSessionGuard = ({
  guard,
  children,
}: {
  guard: React.ReactElement;
  children: React.ReactElement;
}) => {
  return useSession().verified ? children : guard;
};

export default VerifiedSessionGuard;
