/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { metaData } from '../../partials/metadata';

export const render = (body: string) => {
  return `
  <mjml>
    <mj-head>
      <mj-raw>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        ${metaData}
      </mj-raw>
      <mj-title>
        <%- subject %>
      </mj-title>
    </mj-head>
    <mj-body css-class="body-80">
    <mj-include path="./lib/senders/emails/css/global.css" type="css" css-inline="inline" />
    <mj-include path="./lib/senders/emails/css/fxa/index.css" type="css" css-inline="inline" />
    <mj-include path="./lib/senders/emails/css/locale-dir.css" type="css" />
        <mj-raw>
        <% if (locals.preHeader) { %>
        <div class="hidden">
          <%- preHeader %>
          &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
          &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
          &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
          ‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
          ‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌‌‌
        </div>
        <% } %>
        <% if (!locals.sync) { %>
        <img src="https://accounts-static.cdn.mozilla.net/product-icons/firefox-logo.png" class="fxa-logo" alt="Firefox logo"/>
        <% } else { %>
        <img src="https://accounts-static.cdn.mozilla.net/other/sync-devices.png" class="sync" alt="Sync devices"/>
        <% } %>
      </mj-raw>
      ${body}
      <mj-section>
        <mj-column>
          <mj-text css-class="secondary-text">Mozilla. 2 Harrison St, #175, San Francisco, CA 94105</mj-text>
          <mj-text css-class="secondary-text privacy-url"><a class="link-blue" data-l10n-id="fxa-privacy-url" href="<%- privacyUrl %>">Mozilla Privacy Policy</a></mj-text>
          <mj-text css-class="secondary-text support-url"><a class="link-blue" data-l10n-id="fxa-support-url" href="<%- supportUrl %>">Firefox Cloud Terms of Service</a></mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`;
};
