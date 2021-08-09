/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const appBadges = `
  <mj-include path="./lib/senders/emails/css/appBadges/index.css" type="css" css-inline="inline" />
  <mj-section>
    <mj-group>
      <mj-column>
        <mj-image css-class="app-badges"
          href="<%- iosUrl %>"
          src="https://accounts-static.cdn.mozilla.net/product-icons/apple-app-store.png" 
          alt="iOS badge">
        </mj-image>
      </mj-column>
      <mj-column>
        <mj-image css-class="app-badges"
          href="<%- androidUrl %>"
          src="https://accounts-static.cdn.mozilla.net/product-icons/google-play.png" 
          alt="android badge">
        </mj-image>
      </mj-column>
    </mj-group>
  </mj-section>
  <mj-section>
    <mj-column>
      <% if (locals.onDesktopOrTabletDevice) { %>
      <mj-text css-class="secondary-text mb-3"><span data-l10n-id="another-desktop-device"> Or, install on
        <a href="<%- link %>" class="link-blue" data-l10n-name="anotherDeviceLink">another desktop device</a></span>
      </mj-text>
      <% } else { %>
      <mj-text css-class="secondary-text mb-3 install-device-link"><span data-l10n-id="another-device"> Or, install on
        <a href="<%- link %>" class="link-blue" data-l10n-name="anotherDeviceLink">another device</a></span>
        <% } %>
      </mj-text>
    </mj-column>
  </mj-section>
`;
