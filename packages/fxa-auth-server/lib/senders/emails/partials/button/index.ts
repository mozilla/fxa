/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const button = `
  <mj-include path="./lib/senders/emails/css/button/index.css" type="css" css-inline="inline" />
  <mj-section>
    <mj-column>
      <mj-button css-class="primary-button" href="<%- link %>"><%- action %></mj-button>
    </mj-column>
  </mj-section>
`;
