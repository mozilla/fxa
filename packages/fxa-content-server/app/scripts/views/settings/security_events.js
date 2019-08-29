/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import 'modal';
import AttachedClients from '../../models/attached-clients';
import BaseView from '../base';
import SecurityEvent from '../../../scripts/models/security-events';
import Template from 'templates/security_events.mustache';

let account;

const View = BaseView.extend({
  template: Template,
  className: 'security-events',
  viewName: 'security_events',

  mustVerify: true,

  events: {
    'click #delete-events': '_deleteSecurityEvents',
  },

  beforeRender() {
    account = this.getSignedInAccount();
    if (!account) {
      this.navigate('/signin');
    }

    return this._fetchAttachedClients().then(() => {
      return this._fetchSecurityEvents();
    });
  },

  initialize(options = {}) {
    if (!this._attachedClients) {
      this._attachedClients = new AttachedClients([], {
        notifier: options.notifier,
      });
    }
  },

  setInitialContext(context) {
    context.set({
      clients: this._clients,
      securityEvents: this._securityEvents,
    });
  },

  _setAttachedClients() {
    this._clients = this._attachedClients.map(client => {
      return client.attributes;
    });

    this._clients.map(client => {
      const dateObj = new Date(client.lastAccessTime);
      client.lastAccessTime = formatDate(dateObj);

      client.location = _.isEmpty(client.location)
        ? ''
        : `${client.location.city}, ${client.location.country}`;
    });

    return this._clients;
  },

  _fetchAttachedClients() {
    return this._attachedClients.fetchClients(this.user).then(() => {
      return this._setAttachedClients();
    });
  },

  _fetchSecurityEvents() {
    return account.securityEvents().then(events => {
      this._securityEvents = events.map(event => {
        event.createdAt = formatDate(new Date(event.createdAt));

        return new SecurityEvent(event).toJSON();
      });
    });
  },

  _deleteSecurityEvents() {
    return account.deleteSecurityEvents().then(() => {
      this._securityEvents = [];
      return this.render();
    });
  },
});

function formatDate(dateObj) {
  const date = dateObj.toDateString();
  let time = dateObj.toTimeString();
  const indexOfFirstSpace = time.indexOf(' ');
  time = time.substring(0, indexOfFirstSpace);

  return `${date} ${time}`;
}

export default View;
