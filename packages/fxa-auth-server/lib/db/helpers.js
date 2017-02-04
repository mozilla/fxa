/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/***
 * This module consists of helpers that are used by both memory and MySQL database engines.
 **/

const unbuf = require('buf').unbuf.hex;

module.exports = {
  /**
   * This helper converts the provided 'activeClientTokens' array and
   * groups them by the token OAuth client.
   * In the end it creates a sorted array where all token scopes are unified together.
   *
   * @param {Array} activeClientTokens
   * A joined array of tokens and their client names:
   * (OAuth client) name|(OAuth client) id|(Token) createdAt|(Token) scope
   * @returns {Array}
   */
  getActiveClientTokens: function getActiveTokens(activeClientTokens) {
    if (! activeClientTokens) {
      return [];
    }

    // Create an Object that stores unique OAuth client data
    var activeClients = {};
    activeClientTokens.forEach(function (clientTokenObj) {
      var clientIdHex = unbuf(clientTokenObj.id);
      var scope = String(clientTokenObj.scope).split(/[\s,]+/);

      if (! activeClients[clientIdHex]) {
        // add the OAuth client if not already in the Object
        activeClients[clientIdHex] = clientTokenObj;
        activeClients[clientIdHex].scope = [];
      }

      scope.forEach(function (clientScope) {
        // aggregate the scopes from all available tokens
        if (activeClients[clientIdHex].scope.indexOf(clientScope) === -1) {
          activeClients[clientIdHex].scope.push(clientScope);
        }
      });

      var clientTokenTime = clientTokenObj.createdAt;
      if (clientTokenTime > activeClients[clientIdHex].createdAt) {
        // only update the createdAt if it is newer
        activeClients[clientIdHex].createdAt = clientTokenTime;
      }
    });

    // Sort the scopes alphabetically, convert the Object structure to an array
    var activeClientsArray = Object.keys(activeClients).map(function (key) {
      var scopes = activeClients[key].scope;
      scopes.sort(function(a, b) {
        if (b < a) {
          return 1;
        }

        if (b > a) {
          return -1;
        }

        return 0;
      });
      activeClients[key].scope = scopes;
      return activeClients[key];
    });

    // Sort the final Array structure first by createdAt and then name
    var customSort = activeClientsArray.slice(0);
    customSort.sort(function(a, b) {
      if (b.createdAt > a.createdAt) {
        return 1;
      }

      if (b.createdAt < a.createdAt) {
        return -1;
      }

      if (a.name > b.name) {
        return 1;
      }

      if (a.name < b.name) {
        return -1;
      }

      return 0;
    });

    return customSort;
  }
};
