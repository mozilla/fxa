/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactComponent as WebIcon } from './web.svg';
import { ReactComponent as DesktopIcon } from './desktop.svg';
import { ReactComponent as MobileIcon } from './mobile.svg';
import { ReactComponent as TabletIcon } from './tablet.svg';

/**
 * The icon for a device's attached client. Under Nova, render it inside a
 * `mono-icon` element so it follows the text color in dark mode.
 */
export const DeviceIcon = ({
  name,
  deviceType,
  className,
}: {
  name: string | null;
  deviceType: string | null;
  className?: string;
}) => {
  if ((name || '').toLowerCase().includes('ipad') || deviceType === 'tablet') {
    return <TabletIcon data-testid="tablet-icon" {...{ className }} />;
  }
  if (deviceType === 'mobile') {
    return <MobileIcon data-testid="mobile-icon" {...{ className }} />;
  }
  if (deviceType === 'desktop') {
    return <DesktopIcon data-testid="desktop-icon" {...{ className }} />;
  }
  return <WebIcon data-testid="web-icon" {...{ className }} />;
};

export default DeviceIcon;
