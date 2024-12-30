/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const RELAY_CLIENTIDS = [
  '41b4363ae36440a9', // Relay stage
  '723aa3bce05884d8', // Relay dev
  '9ebfe2c2f9ea3c58', // Relay prod
  // 'dcdb5ae7add825d2', // 123done, turn on for manual testing
];

export default {
  setInitialContext(context) {
    const isRelayClient = RELAY_CLIENTIDS.includes(this.relier.get('clientId'));

    if (isRelayClient) {
      context.set({
        isRelayClient,
      });
    }
  },
};
