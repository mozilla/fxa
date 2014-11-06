/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  rootURL: config.baseURL,
  location: config.locationType
});

Router.map(function () {
  this.route('login');

  this.route('clients', {path: '/clients'});
  this.route('client.register',  {path:'/client/register'});
  this.resource('client', {path: '/client/:client_id'}, function () {
    this.route('update');
  });
});

export default Router;
