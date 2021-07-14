/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const appBadges = `
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
      <mj-text css-class="secondary-text">
        <% if(onDesktopOrTabletDevice){ %> Or, install on
        <span
          href="<%= baseURL %><%= anotherDeviceURL %>"
          color="#0a84ff"
          text-decoration="none"
          font-family="sans-serif"
          >another version</span
        >
        <% } else{ %> Or, install on
        <span
          href="<%= baseURL %><%= anotherDeviceURL %>"
          color="#0a84ff"
          text-decoration="none"
          font-family="sans-serif"
          >another device</span
        >
        <% } %>
      </mj-text>
    </mj-column>
  </mj-section>
`;
