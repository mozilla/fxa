/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TODO replace harcoded list with database query in FXA-8533

export const MONITOR_CLIENTIDS = [
  '802d56ef2a9af9fa', // Firefox Monitor
  '946bfd23df91404c', // Firefox Monitor stage
  'edd29a80019d61a1', // Firefox Monitor local dev
  // enable for testing on 123Done locally
  // only enable for either pocket-migration-mixin or monitor-client-mixin
  // but not both
  // 'dcdb5ae7add825d2',
];

export default {
  setInitialContext(context) {
    const isMonitorClient = MONITOR_CLIENTIDS.includes(
      this.relier.get('clientId')
    );

    if (isMonitorClient) {
      context.set({
        // in signin and signup pages we add terms of service and privacy notice for Monitor
        isMonitorClient,
      });
    }
  },
};
