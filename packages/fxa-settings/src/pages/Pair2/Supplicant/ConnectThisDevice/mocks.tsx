/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConnectThisDevice, ConnectThisDeviceProps } from '.';
import { MOCK_METADATA_WITH_DEVICE_NAME } from '../../../../components/DeviceInfoBlock/mocks';
import { RemoteMetadata } from '../../../../lib/types';
import { MOCK_EMAIL } from '../../../mocks';

// No dashes or spaces, so the only way this fits is if the block wraps it.
export const MOCK_METADATA_LONG_DEVICE_NAME: RemoteMetadata = {
  ...MOCK_METADATA_WITH_DEVICE_NAME,
  deviceName: 'LaurelsExtremelyLongMacBookPro16inch2023',
};

// Likewise: neither `@` nor `.` is a wrap opportunity, so this only fits if
// the paragraph breaks mid-word.
export const MOCK_LONG_EMAIL =
  'laurelsextremelylongaccountname@anevenlongerexampledomainname.com';

export const Subject = ({
  email = MOCK_EMAIL,
  remoteMetadata = MOCK_METADATA_WITH_DEVICE_NAME,
  onConnect = () => {},
  onCancel = () => {},
}: Partial<ConnectThisDeviceProps> = {}) => (
  <ConnectThisDevice {...{ email, remoteMetadata, onConnect, onCancel }} />
);
