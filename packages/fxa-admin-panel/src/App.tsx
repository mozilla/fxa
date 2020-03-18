/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Switch, Redirect, Route, BrowserRouter } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import EmailBlocks from './components/EmailBlocks';

const App = () => (
  <BrowserRouter>
    <AppLayout>
      <Switch>
        <Redirect exact from="/" to="/email-blocks" />
        <Route path="/email-blocks" component={EmailBlocks} />
      </Switch>
    </AppLayout>
  </BrowserRouter>
);

export default App;
