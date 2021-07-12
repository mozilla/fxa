/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const metaData = `
  <% if (locals.oneClickLink) { %>
  <script type="application/ld+json">
  {
    "@context": "http://schema.org",
    "@type": "EmailMessage",
    "description": "<%- subject %>",
    "potentialAction": {
      "@type": "ViewAction",
      "name": "<%- action %>",
      "target": "<%- oneClickLink %>",
      "url": "<%- oneClickLink %>"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Firefox Accounts",
      "url": "https://accounts.firefox.com/"
    }
  }
  </script>
  <% } %>
`;
