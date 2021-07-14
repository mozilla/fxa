/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { style } from '../../styles';
import { appBadges } from '../../partials/appBadges';
import { button } from '../../partials/button';

export const render = () => {
  return `
    <mjml>
      <mj-head>
        <mj-style inline="inline">
          ${style}
        </mj-style>
      </mj-head>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-image align="center" css-class="fxa-logo" src="https://accounts-static.cdn.mozilla.net/product-icons/firefox-logo.png"></mj-image>
            <mj-text css-class="header-text">Here's your reminder to sync devices.</mj-text>
            <mj-image css-class="sync-logo" alt="Devices" src="https://accounts-static.cdn.mozilla.net/other/graphic-laptop-mobile.png"></mj-image>
          </mj-column>
        </mj-section>
        <mj-section>
          <mj-column>
            <mj-text css-class="primary-text">It takes two to sync. Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.</mj-text>
          </mj-column>
        </mj-section>
        </mj-section>
        ${button}
        ${appBadges}
        <mj-section>
          <mj-column>
            <mj-text css-class="secondary-text">This is an automated email; if you received it in error, no action is required. For more information, please visit Mozilla Support.</mj-text>
            <mj-text css-class="secondary-text"><span>Mozilla. 2 Harrison St, #175, San Francisco, CA 94105</span></mj-text>
            <mj-text css-class="secondary-text"><span>Mozilla Privacy Policy</span></mj-text>
            <mj-text css-class="secondary-text"><span>Firefox Cloud Terms of Service</span></mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
};
