/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ApproveSignIn, { ApproveSignInProps } from '.';
import { MOCK_METADATA_WITH_DEVICE_NAME } from '../../../../components/DeviceInfoBlock/mocks';
import { RemoteMetadata } from '../../../../lib/types';

// No dashes or spaces, so the only way this fits is if the block wraps it.
export const MOCK_METADATA_LONG_DEVICE_NAME: RemoteMetadata = {
  ...MOCK_METADATA_WITH_DEVICE_NAME,
  deviceName: 'LaurelsExtremelyLongMacBookPro16inch2023',
};

export const Subject = ({
  remoteMetadata = MOCK_METADATA_WITH_DEVICE_NAME,
  onCancel = () => {},
}: Partial<ApproveSignInProps> = {}) => (
  <ApproveSignIn {...{ remoteMetadata, onCancel }} />
);
