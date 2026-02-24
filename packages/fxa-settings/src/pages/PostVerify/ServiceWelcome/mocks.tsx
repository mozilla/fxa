/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
import ServiceWelcome from '.';
import { ServiceWelcomeIntegration } from './interfaces';

export function createMockIntegration(): ServiceWelcomeIntegration {
  return {
    isFirefoxClientServiceVpn: () => true,
  };
}

export const Subject = ({
  integration = createMockIntegration(),
  origin,
}: {
  integration?: ServiceWelcomeIntegration;
  origin?: string;
}) => {
  if (origin) {
    const history = createHistory(
      createMemorySource('/post_verify/service_welcome')
    );
    history.navigate('/post_verify/service_welcome', {
      state: { origin },
    });

    return (
      <LocationProvider {...{ history }}>
        <ServiceWelcome {...{ integration }} />
      </LocationProvider>
    );
  }

  return (
    <LocationProvider>
      <ServiceWelcome {...{ integration }} />
    </LocationProvider>
  );
};
