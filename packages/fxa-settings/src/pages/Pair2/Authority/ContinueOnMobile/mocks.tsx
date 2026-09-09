/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ContinueOnMobile, { ContinueOnMobileProps } from '.';
import {
  AuthorityState,
  Integration,
  PairingAuthorityIntegration,
} from '../../../../models';

export const Subject = ({
  onCancel = () => {},
}: Partial<ContinueOnMobileProps> = {}) => (
  <ContinueOnMobile {...{ onCancel }} />
);

export type MockAuthorityIntegration = PairingAuthorityIntegration & {
  destroy: jest.Mock;
};

/**
 * A `PairingAuthorityIntegration` with the container's surface stubbed. Built
 * from the real prototype because the container narrows on `instanceof` before
 * it touches any of it.
 */
export function mockAuthorityIntegration(
  overrides: Partial<Record<keyof MockAuthorityIntegration, unknown>> = {}
): MockAuthorityIntegration {
  const integration = Object.create(
    PairingAuthorityIntegration.prototype
  ) as MockAuthorityIntegration;

  return Object.assign(integration, {
    destroy: jest.fn().mockResolvedValue(undefined),
    onStateChange: null,
    ...overrides,
  });
}

/** Drives the integration's state machine the way the channel would. */
export function emitState(
  integration: MockAuthorityIntegration,
  state: AuthorityState
) {
  (integration as PairingAuthorityIntegration).onStateChange?.(state);
}

/** A non-pairing integration, for the container's narrowing guard. */
export const MOCK_NON_PAIRING_INTEGRATION = {} as Integration;
