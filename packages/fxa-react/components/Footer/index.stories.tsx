/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Footer } from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

export default { title: 'Components/Footer' };
export const Default = () => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <Footer />
  </AppLocalizationProvider>
);
