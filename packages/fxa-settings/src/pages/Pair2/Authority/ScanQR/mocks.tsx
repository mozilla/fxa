/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ScanQR, { ScanQRProps } from '.';
import {
  AuthorityState,
  Integration,
  PairingAuthorityIntegration,
} from '../../../../models';

// Deliberately not a pairing URL — building the real value lands with the flow
// wiring, and a lookalike here would invite someone to trust it.
export const MOCK_QR_CODE_VALUE = 'placeholder-qr-code-value';

// Long enough to push the QR to a denser version, so the composite can be
// checked against a code with many more, and much smaller, modules.
export const MOCK_LONG_QR_CODE_VALUE = MOCK_QR_CODE_VALUE.repeat(12);

export const Subject = ({
  qrCodeValue = MOCK_QR_CODE_VALUE,
}: Partial<ScanQRProps> = {}) => <ScanQR {...{ qrCodeValue }} />;

/** The channel URL a successfully created channel resolves to. */
export const MOCK_PAIR_URL = `${window.location.origin}/pair#channel_id=chan-1&channel_key=key-1&v=2`;

export type MockAuthorityIntegration = PairingAuthorityIntegration & {
  createChannel: jest.Mock;
  getPairUrl: jest.Mock;
  destroy: jest.Mock;
  isFirefoxMobileClient: jest.Mock;
};

/**
 * A `PairingAuthorityIntegration` with the channel surface stubbed. Built from
 * the real prototype rather than a plain object because the container narrows
 * on `instanceof` before it touches any of these.
 */
export function mockAuthorityIntegration(
  overrides: Partial<Record<keyof MockAuthorityIntegration, unknown>> = {}
): MockAuthorityIntegration {
  const integration = Object.create(
    PairingAuthorityIntegration.prototype
  ) as MockAuthorityIntegration;

  return Object.assign(integration, {
    createChannel: jest.fn().mockResolvedValue(undefined),
    getPairUrl: jest.fn().mockReturnValue(MOCK_PAIR_URL),
    destroy: jest.fn().mockResolvedValue(undefined),
    isFirefoxMobileClient: jest.fn().mockReturnValue(false),
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
