/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { automatedEmailNoAction, button } from '../../partials';

export const render = () => `
  <mj-include path="./lib/senders/emails/css/global.css" type="css" css-inline="inline" />
  <mj-section>
    <mj-column>
    <mj-text css-class="header-text"><span data-l10n-id="post-remove-secondary-title">Secondary email removed</span></mj-text>
    </mj-column>
  </mj-section>
  <mj-section>
    <mj-column>
    <mj-text css-class="primary-text"><span data-l10n-id="post-remove-secondary-description" data-l10n-args='<%= JSON.stringify({secondaryEmail: locals.secondaryEmail}) %>'>You have successfully removed secondary@email as a secondary email from your Firefox Account. Security notifications and sign-in confirmations will no longer be delivered to this address.</span></mj-text>
    </mj-column>
  </mj-section>
  ${button}
  ${automatedEmailNoAction}
`;
