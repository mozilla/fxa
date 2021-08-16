/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { appBadges, button, automatedEmailNoAction } from '../../partials';

export const render = () => `
  <mj-include path="./lib/senders/emails/css/global.css" type="css" css-inline="inline" />
   <mj-section>
     <mj-column>
       <mj-text css-class="primary-text"><span data-l10n-id="postVerify-sub-title">Firefox Account verified. You're almost there.</span></mj-text>
       <mj-text css-class="header-text"><span data-l10n-id="postVerify-title">Next sync between your devices!</span></mj-text>
       <mj-image css-class="sync-logo" alt="Devices" src="https://accounts-static.cdn.mozilla.net/other/graphic-laptop-mobile.png"></mj-image>
     </mj-column>
   </mj-section>
   <mj-section>
     <mj-column>
       <mj-text css-class="primary-text"><span data-l10n-id="postVerify-description">Sync privately keeps your bookmarks, passwords and other Firefox data the same across all your devices.</span></mj-text>
     </mj-column>
   </mj-section>
   ${button}
   ${appBadges}
   ${automatedEmailNoAction}
`;
