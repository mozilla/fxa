/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MemoryRouter } from 'react-router';
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
    return (
      <MemoryRouter initialEntries={[{ pathname: '/post_verify/service_welcome', state: { origin } }]}>
        <ServiceWelcome {...{ integration }} />
      </MemoryRouter>
    );
  }

  return (
    <MemoryRouter>
      <ServiceWelcome {...{ integration }} />
    </MemoryRouter>
  );
};
