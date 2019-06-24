/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
});

Router.map(function() {
  this.route('login');

  this.route('clients', { path: '/clients' });
  this.route('clients.token', { path: '/clients/token' });
  this.route('client.register', { path: '/client/register' });
  this.route(
    'client',
    { path: '/client/:client_id', resetNamespace: true },
    function() {
      this.route('delete');
      this.route('update');
    }
  );
});

export default Router;
