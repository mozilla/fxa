/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const appBadges = `
  <mj-include path="./lib/senders/emails/css/appBadges/index.css" type="css" css-inline="inline" />
  <mj-section>
    <mj-group>
      <mj-column>
        <mj-image
          css-class="app-badges"
          href="<%= iosURL %>"
          src="https://accounts-static.cdn.mozilla.net/product-icons/apple-app-store.png"
          alt="iOS badge"
        ></mj-image>
      </mj-column>
      <mj-column>
        <mj-image
          css-class="app-badges"
          href="<%= androidURL %>"
          src="https://accounts-static.cdn.mozilla.net/product-icons/google-play.png"
          alt="android badge"
        ></mj-image>
      </mj-column>
    </mj-group>
  </mj-section>
  <mj-section>
    <mj-column>
      <mj-text css-class="secondary-text mb-3">
        <% if(onDesktopOrTabletDevice){ %> Or, install on
        <a
          href="<%= baseURL %><%= anotherDeviceURL %>"
          class="link-blue"
          >another version</a
        >.
        <% } else{ %> Or, install on
        <a
          href="<%= baseURL %><%= anotherDeviceURL %>"
          class="link-blue"
          >another device</a
        >.
        <% } %>
      </mj-text>
    </mj-column>
  </mj-section>
`;
