/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { BannerMessage } from '.';
import { BannerType } from '../../../../components/Banner';

const bannerText = <p>Uh-oh that device is not allowed to connect</p>;

export const MOCK_BANNER_MESSAGE: BannerMessage = {
  messageType: BannerType.error,
  messageElement: bannerText,
};
