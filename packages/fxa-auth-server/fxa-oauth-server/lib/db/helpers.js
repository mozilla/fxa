/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/***
 * This module consists of helpers that are used by both memory and MySQL database engines.
 **/

const unbuf = require('buf').unbuf.hex;
const ScopeSet = require('../../../../fxa-shared').oauth.scopes;

module.exports = {
  /**
   * This helper takes a list of active oauth tokens and produces an aggregate
   * summary of the active clients, by:
   *
   *   * merging all scopes into a single set
   *   * taking the max token creation time a the last access time
   *
   * The resulting array is in sorted order by last access time, then client name.
   *
   * @param {Array} activeClientTokens
   * An array of OAuth tokens, annotated with client name:
   * (OAuth client) name|(OAuth client) id|(Token) createdAt|(Token) scope
   * @returns {Array}
   */
  aggregateActiveClients: function aggregateActiveClients(activeClientTokens) {
    if (!activeClientTokens) {
      return [];
    }

    // Create an Object that stores unique OAuth client data
    var activeClients = {};
    activeClientTokens.forEach(function(clientTokenObj) {
      var clientIdHex = unbuf(clientTokenObj.id);

      if (!activeClients[clientIdHex]) {
        // add the OAuth client if not already in the Object
        activeClients[clientIdHex] = {
          id: clientTokenObj.id,
          name: clientTokenObj.name,
          lastAccessTime: clientTokenObj.createdAt,
          scope: ScopeSet.fromArray([]),
        };
      }

      activeClients[clientIdHex].scope.add(clientTokenObj.scope);

      var clientTokenTime =
        clientTokenObj.lastUsedAt || clientTokenObj.createdAt;
      if (clientTokenTime > activeClients[clientIdHex].lastAccessTime) {
        // only update the createdAt if it is newer
        activeClients[clientIdHex].lastAccessTime = clientTokenTime;
      }
    });

    // Sort the scopes alphabetically, convert the Object structure to an array
    var activeClientsArray = Object.keys(activeClients).map(function(key) {
      activeClients[key].scope = activeClients[key].scope
        .getScopeValues()
        .sort();
      return activeClients[key];
    });

    // Sort the final Array structure first by lastAccessTime and then name
    activeClientsArray.sort(function(a, b) {
      if (b.lastAccessTime > a.lastAccessTime) {
        return 1;
      }

      if (b.lastAccessTime < a.lastAccessTime) {
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

    return activeClientsArray;
  },
};
