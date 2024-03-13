/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Represents the config needed for running cloud tasks */
export type CloudTasksConfig = {
  cloudTasks: {
    useLocalEmulator: boolean;
    projectId: string;
    locationId: string;
    credentials: {
      keyFilename: string;
    };
    oidc: {
      aud: string;
      serviceAccountEmail: string;
    };
  };
};
