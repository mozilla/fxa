export const render = () => {
  return `
    <mjml>
      <mj-body>
      <mj-include path="./lib/senders/emails/css/style.css" type="css" css-inline="inline" />
        <mj-section>
          <mj-column>
            <mj-image width="32" height="32" src="https://accounts-static.cdn.mozilla.net/images/16821f55.firefox-logo.svg"></mj-image>
            <mj-divider></mj-divider>
            <mj-text css-class="large-text">Welcome, Yogita! Thank you for signing up </mj-text>
            <mj-text><h1 data-l10n-id="hello-world">Is this localized</h1></mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
};
