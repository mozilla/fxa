/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ScanQR, { ScanQRProps } from '.';

// Deliberately not a pairing URL — building the real value lands with the flow
// wiring, and a lookalike here would invite someone to trust it.
export const MOCK_QR_CODE_VALUE = 'placeholder-qr-code-value';

// Long enough to push the QR to a denser version, so the composite can be
// checked against a code with many more, and much smaller, modules.
export const MOCK_LONG_QR_CODE_VALUE = MOCK_QR_CODE_VALUE.repeat(12);

export const Subject = ({
  qrCodeValue = MOCK_QR_CODE_VALUE,
}: Partial<ScanQRProps> = {}) => <ScanQR {...{ qrCodeValue }} />;
