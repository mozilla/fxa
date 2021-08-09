/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { appBadges, button, automatedEmailNoAction } from '../../partials';

export const cadReminder = `
  <mj-include path="./lib/senders/emails/css/cadReminder/index.css" type="css" css-inline="inline" />
  <mj-section>
    <mj-column>
      <mj-text css-class="header-text"><span data-l10n-id="sync-reminder"><%- headerText %></span></mj-text>
      <mj-image css-class="sync-logo" alt="Devices" src="https://accounts-static.cdn.mozilla.net/other/graphic-laptop-mobile.png"></mj-image>
    </mj-column>
  </mj-section>
  <mj-section>
    <mj-column>
      <mj-text css-class="primary-text"><span data-l10n-id="sync-description"><%- bodyText %></span></mj-text>
    </mj-column>
  </mj-section>
  ${button}
  ${appBadges}
  ${automatedEmailNoAction}
`;
