/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const automatedEmailNoAction = `
  <mj-include path="./lib/senders/emails/css/automatedEmailNoAction/index.css" type="css" css-inline="inline" />
  <mj-section>
    <mj-column>
      <mj-text css-class="text-footer-automatedEmail"><span data-l10n-id="automated-email">This is an automated email; if you received it in error, no action is
        required. For more information, please visit <a class="link-blue" href="<%- supportUrl %>" data-l10n-name="supportLink">Mozilla Support</a>.</span></mj-text>
    </mj-column>
  </mj-section>
`;
