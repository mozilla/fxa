/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { transitionTableToMermaid } from '../src/lib/auth-machine/chart';

const out = join(__dirname, '..', 'src', 'lib', 'auth-machine', 'funnel.mmd');
writeFileSync(out, transitionTableToMermaid());
// eslint-disable-next-line no-console
console.log(`wrote ${out}`);
