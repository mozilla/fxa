export const appBadges = `
  <mj-include path="./lib/senders/emails/css/appBadges.css" type="css" css-inline="inline" />
  <mj-section>
    <mj-group>
      <mj-column>
        <mj-image
          css-class="app-badges"
          href="<%= iosURL %>"
          src="https://image.e.mozilla.org/lib/fe9915707361037e75/m/5/ebdfb903-4e62-4aeb-9eae-26e1ef495049.png"
          alt="iOS badge"
        ></mj-image>
      </mj-column>
      <mj-column>
        <mj-image
          css-class="app-badges"
          href="<%= androidURL %>"
          src="https://image.e.mozilla.org/lib/fe9915707361037e75/m/5/0dda16b4-21bb-4cc1-9042-2ebaaa7a9764.png"
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
          href="<%= anotherDeviceURL %>"
          color="#0a84ff"
          text-decoration="none"
          font-family="sans-serif"
          >another version</span
        >
        <% } else{ %> Or, install on
        <span
          href="<%= anotherDeviceURL %>"
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
