/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TODO replace harcoded list with database query in FXA-8533
export const MONITOR_CLIENTIDS = [
  '802d56ef2a9af9fa', // Mozilla Monitor
  '946bfd23df91404c', // Mozilla Monitor stage
  'edd29a80019d61a1', // Mozilla Monitor local dev
];

export const POCKET_CLIENTIDS = [
  '7377719276ad44ee', // pocket-mobile
  '749818d3f2e7857f', // pocket-web
];

export const isClientPocket = (clientId?: string) => {
  return !!(clientId && POCKET_CLIENTIDS.includes(clientId));
};

export const isClientMonitor = (clientId?: string) => {
  return !!(clientId && MONITOR_CLIENTIDS.includes(clientId));
};
