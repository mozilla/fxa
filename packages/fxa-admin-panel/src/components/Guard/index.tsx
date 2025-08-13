/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useUserContext } from '../../hooks/UserContext';
import { AdminPanelFeature } from 'fxa-shared/guards';
import { useGuardContext } from '../../hooks/GuardContext';

export type GuardProps = {
  children?: React.ReactNode;
  features: AdminPanelFeature[];
};

export const Guard: React.FC<GuardProps> = ({ features, children }) => {
  const { user } = useUserContext();
  const { guard } = useGuardContext();

  return features.some((x) => guard.allow(x, user.group)) ? (
    <>{children}</>
  ) : (
    <></>
  );
};

export default Guard;
