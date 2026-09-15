/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import '@hapi/hapi';

// Hapi types these values as `unknown` and expects each app to declare its own
// shape. Joi route validation checks the values, so a permissive shape is enough.
declare module '@hapi/hapi' {
  interface ReqRefDefaults {
    Headers: Record<string, any>;
    Params: Record<string, any>;
    Query: Record<string, any>;
  }
}
