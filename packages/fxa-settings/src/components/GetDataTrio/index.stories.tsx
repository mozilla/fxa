/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { useState } from 'react';
import { MOCK_EMAIL } from '../../pages/mocks';
import GetDataTrio, {
  GetDataCopySingleton,
  GetDataCopySingletonInline,
} from './index';

export default {
  title: 'Components/GetDataTrio',
  component: GetDataTrio,
  decorators: [withLocalization],
} as Meta;

export const Default = () => {
  const [, setTooltipVisible] = useState(false);
  return (
    <div className="p-10 max-w-xs">
      <GetDataTrio
        value="Copy that"
        email={MOCK_EMAIL}
        {...{ setTooltipVisible }}
        gleanDataAttrs={{}}
      />
    </div>
  );
};

export const SingleCopyButton = () => {
  const [, setTooltipVisible] = useState(false);
  return (
    <div className="p-10 max-w-xs">
      <GetDataCopySingleton
        value="Copy that"
        {...{ setTooltipVisible }}
        gleanDataAttrs={{}}
      />
    </div>
  );
};

export const SingleCopyButtonInline = () => {
  const [, setTooltipVisible] = useState(false);
  return (
    <div className="p-10 max-w-xs">
      <GetDataCopySingletonInline
        value="Copy that"
        {...{ setTooltipVisible }}
      />
    </div>
  );
};
