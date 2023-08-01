/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import config from '../../lib/config';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { FeatureFlag } from 'fxa-react/components/FeatureFlag';

export type OAuthClientFeatureFlagConfig = {
  oauth: {
    reactClientIdsEnabled: string[];
  };
};

export const OAuthClientFeatureFlag = ({
  clientId,
  children,
}: {
  clientId: string;
  children: ReactElement | ReactElement[];
}) => {
  return (
    <FeatureFlag
      {...{
        feature: clientId,
        enabled: (feature: string) => {
          return config.oauth.reactClientIdsEnabled.some(
            (id: string) => id === feature
          );
        },
      }}
    >
      {children}
    </FeatureFlag>
  );
};
