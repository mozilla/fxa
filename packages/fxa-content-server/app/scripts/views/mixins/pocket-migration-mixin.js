/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TODO replace harcoded list with database query in FXA-8533
export const POCKET_CLIENTIDS = [
  '7377719276ad44ee', // pocket-mobile
  '749818d3f2e7857f', // pocket-web
  // enable for testing on 123Done locally
  // only enable for either pocket-migration-mixin or monitor-client-mixin
  // but not both at the same time
  // 'dcdb5ae7add825d2',
];

export default {
  setInitialContext(context) {
    const isPocketClient = POCKET_CLIENTIDS.includes(
      this.relier.get('clientId')
    );

    if (isPocketClient) {
      context.set({
        newsletters: [], // Disables newsletters
        isAnyNewsletterEnabled: false,
        isPocketClient, // In signup pages we add more terms and conditions for Pocket
      });
    }
  },
};
