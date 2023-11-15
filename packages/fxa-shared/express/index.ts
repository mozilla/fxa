/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import cors from './cors';
import routing from './routing';

export const express: () => {
  cors: typeof cors;
  routing: typeof routing;
} = () => ({
  cors,
  routing,
});

export default express;
