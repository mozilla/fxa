import { style } from '../styles';
import { appBadges } from '../partials/appBadges';
import { button } from '../partials/button';

export const render = () => {
  return `
    <mjml>
      <mj-head>
      </mj-head>
      <mj-body>
      <mj-include path="./lib/senders/emails/css/style.css" type="css" css-inline="inline" />
        <mj-section>
          <mj-column>
            <mj-image align="center" css-class="fxa-logo" src="https://image.e.mozilla.org/lib/fe9915707361037e75/m/4/11c1e411-7dfe-4e04-914c-0f098edac96c.png"></mj-image>
            <mj-text css-class="header-text">Here's your reminder to sync devices.</mj-text>
            <mj-image css-class="sync-logo" alt="Devices" src="https://image.e.mozilla.org/lib/fe9915707361037e75/m/5/f9463f08-8831-49fb-bbc4-7b5072cb63be.png"></mj-image>
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
