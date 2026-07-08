/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { transitionTableToMermaid } from './chart';

it('emits a mermaid state diagram including a known edge', () => {
  const mmd = transitionTableToMermaid();
  expect(mmd).toContain('stateDiagram-v2');
  expect(mmd).toContain(
    'identifying.index --> identifying.checkingAccountStatus'
  );
  expect(mmd).toContain('verifying.totp --> finalizing.handoff');
});
