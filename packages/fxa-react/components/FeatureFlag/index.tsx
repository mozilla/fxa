/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from 'react';

export const FeatureFlag = ({
  feature,
  enabled,
  children,
}: {
  feature: string;
  enabled: (feature: string) => boolean;
  children: ReactElement | ReactElement[];
}) => {
  return enabled(feature) ? <>{children}</> : <></>;
};
