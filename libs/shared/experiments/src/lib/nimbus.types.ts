/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A collection of attributes about the client that will be used for
 * targeting an experiment.
 */
export type NimbusContext = {
  language: string | null;
  region: string | null;
};

/**
 * The nimbus experiments and enrollment information needed for applying a feature experiment.
 */
export interface NimbusEnrollment {
  nimbus_user_id: string;
  app_id: string;
  experiment: string;
  branch: string;
  experiment_type: string;
  is_preview: string;
}

/**
 * The nimbus experiments and enrollment information needed for applying a feature experiment.
 */
export interface NimbusResult {
  Features: Record<string, any>;
  Enrollments: Array<NimbusEnrollment>;
}
