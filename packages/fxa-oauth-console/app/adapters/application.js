/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import DS from 'ember-data';
import config from '../config/environment';

function fixUpRedirectUri(uri) {
  if (!uri) {
    // add some defaults, oauth server requires these fields
    uri = 'http://';
  }

  return uri.trim();
}

export default DS.RESTAdapter.extend({
  _handleErrorResponse: function() {
    this.get('session').invalidate();
  },
  session: Ember.inject.service('session'),
  /**
   * API Namespace
   */
  namespace: 'v1',
  /**
   * API Host
   */
  host: config.servers.oauthInternal,
  /**
   * Request headers
   *
   * Sets Authorization headers
   */
  headers: Ember.computed(function() {
    return {
      Authorization: 'Bearer ' + this.get('session.data.authenticated.token'),
    };
  }),

  shouldReloadAll() {
    return true;
  },
  shouldBackgroundReloadRecord() {
    return true;
  },
  /**
   * Overrides default RESTAdapter 'find'.
   *
   * @param store
   * @param type
   * @param id
   * @param record
   * @returns {*}
   */
  findRecord: function(store, type, id, record) {
    // post process the resuld of 'findRecord'. Need to add the Model type 'client' into the response
    return this.ajax(this.buildURL(type.modelName, id, record), 'GET').then(
      function(resp) {
        return { client: resp };
      }
    );
  },
  /**
   * Overrides default RESTAdapter 'createRecord'
   *
   * @param store
   * @param type
   * @param record
   * @returns {*}
   */
  createRecord: function(store, type, record) {
    var data = {};
    var serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, record, { includeId: true });

    delete data.secret;

    data.redirect_uri = fixUpRedirectUri(data.redirect_uri); //eslint-disable-line camelcase

    // post process the result of 'find'. Need to add the Model type 'client' into the response
    return this.ajax(this.buildURL(type.modelName, null, record), 'POST', {
      data: data,
    }).then(
      resp => {
        return { client: resp };
      },
      () => {
        this._handleErrorResponse();
      }
    );
  },
  /**
   * Overrides default RESTAdapter 'updateRecord'
   * @param store
   * @param type
   * @param record
   * @returns {*}
   */
  updateRecord: function(store, type, record) {
    var data = {};
    var serializer = store.serializerFor(type.modelName);
    serializer.serializeIntoHash(data, type, record);

    var id = record.id;

    delete data.secret;
    delete data.trusted;

    data.redirect_uri = fixUpRedirectUri(data.redirect_uri); //eslint-disable-line camelcase

    // set POST instead of PUT
    return this.ajax(this.buildURL(type.modelName, id, record), 'POST', {
      data: data,
    }).then(
      () => {
        data.id = id;

        return { client: data };
      },
      () => {
        this._handleErrorResponse();
      }
    );
  },
  /**
  /**
   * Overrides default RESTAdapter 'buildURL'.
   * @param type
   * @param id
   * @param record
   * @returns {Array}
   */
  buildURL: function(type, id, record) {
    var url = [];
    var host = this.host;
    var prefix = this.urlPrefix();

    // FxA OAuth API requires singular 'client' when the record id is set
    if (record) {
      url.push('client');
    } else {
      url.push('clients');
    }

    if (id && !Ember.isArray(id)) {
      url.push(encodeURIComponent(id));
    }

    if (prefix) {
      url.unshift(prefix);
    }

    url = url.join('/');
    if (!host && url) {
      url = '/' + url;
    }

    return url;
  },
});
