/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Header from './Header';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

const Page = ({ title, children }) => (
  <AppLocalizationProvider>
    <div className="p-8 pt-0 min-h-screen">
      <Header />
      <h2 className="mt-6 mb-4 text-xxxl">{title}</h2>
      {children}
    </div>
  </AppLocalizationProvider>
);

export default Page;
