/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized } from '@fluent/react';
import { storiesOf } from '@storybook/react';
import React, { useState } from 'react';
import Switch from '.';

storiesOf('Components/Switch', module)
  .add('on', () => <Subject />)
  .add('loading, user switched off', () => <Subject isSubmitting />)
  .add('off', () => <Subject isOn={false} />)
  .add('loading, user switched on', () => (
    <Subject isOn={false} isSubmitting />
  ));

const Subject = ({ isOn = true, isSubmitting = false }) => {
  const [switchState, setSwitchState] = useState<boolean>(isOn);
  const handler = () => {
    alert('You flipped the switch!');
    setSwitchState(!switchState);
  };

  return (
    <Switch
      {...{
        isSubmitting,
        isOn: switchState,
        handler,
        id: 'boop',
        localizedLabel: <Localized id="">Screenreader only text</Localized>,
      }}
    />
  );
};
