/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';

/**
 * The nimbus experiments and enrollment information needed for applying a feature experiment.
 */
export interface NimbusResult {
  features: Record<string, any>;
  nimbusUserId: string;
}

export default class Nimbus {
  static experiments: any;

  static async initialize(clientId: string, context: any) {
    // Important! Disabling this was requested in FXA-11622. There's a chance this call is
    // hurting our perf metrics due to a cirrus side car issues. Disabling for now until
    // nimbus teams can take a look at cirrus.
    this.experiments = null;

    //   const body = JSON.stringify({
    //     client_id: clientId,
    //     context,
    //   });

    //   try {
    //     const resp = await fetch('/nimbus-experiments', {
    //       method: 'POST',
    //       body,
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     });

    //     if (resp.status === 200) {
    //       const json = await resp.json();
    //       this.experiments = json as NimbusResult;
    //     } else {
    //       this.experiments = null;
    //     }
    //   } catch (err) {
    //     Sentry.captureException(err, {
    //       tags: {
    //         source: 'nimbus-experiments',
    //       },
    //     });
    //     this.experiments = null;
    //   }
  }
}
