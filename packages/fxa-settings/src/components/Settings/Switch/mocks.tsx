/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import Switch from '.';

export const Subject = ({ isOn = true, isSubmitting = false }) => {
  const [switchState, setSwitchState] = useState<boolean>(isOn);
  const handler = () => {
    alert('You flipped the switch!');
    setSwitchState(!switchState);
  };

  const localizedLabel = (
    <FtlMsg id="mock-l10n-id">Screenreader only text</FtlMsg>
  );

  return (
    <Switch
      {...{
        isSubmitting,
        isOn: switchState,
        handler,
        id: 'boop',
        localizedLabel,
      }}
    />
  );
};
