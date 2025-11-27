/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'server-only';
jest.mock('server-only', () => {});

// l10n module uses ESM imports
jest.mock('@fxa/shared/l10n/dom', () => ({
  LocalizerServer: jest.fn().mockImplementation(() => ({
    getLocaleFromAcceptLanguage: jest.fn().mockReturnValue('en'),
    formatMessagesSync: jest
      .fn()
      .mockImplementation((messages: any[]) =>
        messages.map((msg: any) => ({ value: `Localized: ${msg.id}` }))
      ),
  })),
  LocalizerDom: jest.fn().mockImplementation(() => ({
    localize: jest.fn().mockImplementation((element: any) => element),
  })),
  determineDirection: jest.fn().mockReturnValue('ltr'),
}));
const { LocalizerServer } = jest.requireMock('@fxa/shared/l10n/dom');

import { Test } from '@nestjs/testing';
import { promises as fs } from 'fs';

import { EmailTemplateManager } from './emailTemplate.manager';
import { createRenderEmailOptions } from './factories/emailTemplate.factory';

const mockTemplateMjml = `
<%# This Source Code Form is subject to the terms of the Mozilla Public
  # License, v. 2.0. If a copy of the MPL was not distributed with this
  # file, You can obtain one at http://mozilla.org/MPL/2.0/. %>

  <mj-section>
    <mj-column>
      <mj-text css-class="text-header">
        <span data-l10n-id="subscriptionUpgrade-title">Thank you for upgrading!</span>
      </mj-text>

      <mj-text css-class="text-body">
        <span data-l10n-id="subscriptionUpgrade-upgrade-info-2" data-l10n-args="<%= JSON.stringify({productName}) %>">You have successfully upgraded to <%- productName %>.</span>
      </mj-text>

      <mj-text css-class="text-body">
        <% if (locals.paymentProratedInCents < 0) { %>
          <span data-l10n-id="subscriptionUpgrade-content-charge-credit" data-l10n-args="<%= JSON.stringify({paymentProrated}) %>">You have received an account credit in the amount of <%- paymentProrated %>.</span>
        <% } else if (locals.paymentProratedInCents > 0) { %>
          <span data-l10n-id="subscriptionUpgrade-content-charge-prorated-1" data-l10n-args="<%= JSON.stringify({invoiceAmountDue, productPaymentCycleOld}) %>">You have been charged a one-time fee of <%- invoiceAmountDue %> to reflect your subscription’s higher price for the remainder of this billing period (<%- productPaymentCycleOld %>).</span>
        <% } %>
        <span data-l10n-id="subscriptionUpgrade-content-next-bill-change">
          Starting with your next bill, the price of your subscription will change.
        </span>
        <span data-l10n-id="<%= previousRate.l10nId %>"
          data-l10n-args="<%= previousRate.l10nArgs %>">
            <%= previousRate.message %>
        </span>
        <span data-l10n-id="<%= newRate.l10nId %>"
            data-l10n-args="<%= newRate.l10nArgs %>">
          <%= newRate.message %>
        </span>
      </mj-text>

      <mj-text css-class="text-body">
        <span data-l10n-id="subscriptionUpgrade-existing">If any of your existing subscriptions overlap with this upgrade, we’ll handle them and send you a separate email with the details. If your new plan includes products that require installation, we’ll send you a separate email with setup instructions.</span>
      </mj-text>

      <mj-text css-class="text-body">
        <span data-l10n-id="subscriptionUpgrade-auto-renew">Your subscription will automatically renew each billing period unless you choose to cancel.</span>
      </mj-text>
    </mj-column>
  </mj-section>
`;

const mockTemplateText = `
subscriptionUpgrade-subject = "You have upgraded to <%- productName %>"

subscriptionUpgrade-title = "Thank you for upgrading!"

subscriptionUpgrade-upgrade-info-2 = "You have successfully upgraded to <%- productName %>."

<% if (locals.paymentProratedInCents < 0) { %>
subscriptionUpgrade-content-charge-credit = "You have received an account credit in the amount of <%- paymentProrated %>."
<% } else if (locals.paymentProratedInCents > 0) { %>
subscriptionUpgrade-content-charge-prorated-1 = "You have been charged a one-time fee of <%- invoiceAmountDue %> to reflect your subscription’s higher price for the remainder of this billing period (<%- productPaymentCycleOld %>)."
<% } %>
subscriptionUpgrade-content-subscription-will-change = "Starting with your next bill, the price of your subscription will change."
<% if (locals.paymentTaxOldInCents) { %>
<% if (locals.productPaymentCycleOld === 'day') { %>
subscriptionUpgrade-content-old-price-day-tax = "The previous rate was <%- paymentAmountOld %> + <%- paymentTaxOld %> tax per day."
<% } else if (locals.productPaymentCycleOld === 'week') { %>
subscriptionUpgrade-content-old-price-week-tax = "The previous rate was <%- paymentAmountOld %> + <%- paymentTaxOld %> tax per week."
<% } else if (locals.productPaymentCycleOld === 'month') { %>
subscriptionUpgrade-content-old-price-month-tax = "The previous rate was <%- paymentAmountOld %> + <%- paymentTaxOld %> tax per month."
<% } else if (locals.productPaymentCycleOld === 'halfyear') { %>
subscriptionUpgrade-content-old-price-halfyear-tax = "The previous rate was <%- paymentAmountOld %> + <%- paymentTaxOld %> tax per six months."
<% } else if (locals.productPaymentCycleOld === 'year') { %>
subscriptionUpgrade-content-old-price-year-tax = "The previous rate was <%- paymentAmountOld %> + <%- paymentTaxOld %> tax per year."
<% } else { %>
subscriptionUpgrade-content-old-price-default-tax = "The previous rate was <%- paymentAmountOld %> + <%- paymentTaxOld %> tax per billing interval."
<% } %>
<% } else { %>
<% if (locals.productPaymentCycleOld === 'day') { %>
subscriptionUpgrade-content-old-price-day = "The previous rate was <%- paymentAmountOld %> per day."
<% } else if (locals.productPaymentCycleOld === 'week') { %>
subscriptionUpgrade-content-old-price-week = "The previous rate was <%- paymentAmountOld %> per week."
<% } else if (locals.productPaymentCycleOld === 'month') { %>
subscriptionUpgrade-content-old-price-month = "The previous rate was <%- paymentAmountOld %> per month."
<% } else if (locals.productPaymentCycleOld === 'halfyear') { %>
subscriptionUpgrade-content-old-price-halfyear = "The previous rate was <%- paymentAmountOld %> per six months."
<% } else if (locals.productPaymentCycleOld === 'year') { %>
subscriptionUpgrade-content-old-price-year = "The previous rate was <%- paymentAmountOld %> per year."
<% } else { %>
subscriptionUpgrade-content-old-price-default = "The previous rate was <%- paymentAmountOld %> per billing interval."
<% } %>
<% } %>
<% if (locals.paymentTaxNewInCents) { %>
<% if (locals.productPaymentCycleNew === 'day') { %>
subscriptionUpgrade-content-new-price-day-tax = "Going forward, you will be charged <%- paymentAmountNew %> + <%- paymentTaxNew %> tax per day."
<% } else if (locals.productPaymentCycleNew === 'week') { %>
subscriptionUpgrade-content-new-price-week-tax = "Going forward, you will be charged <%- paymentAmountNew %> + <%- paymentTaxNew %> tax per week."
<% } else if (locals.productPaymentCycleNew === 'month') { %>
subscriptionUpgrade-content-new-price-month-tax = "Going forward, you will be charged <%- paymentAmountNew %> + <%- paymentTaxNew %> tax per month."
<% } else if (locals.productPaymentCycleNew === 'halfyear') { %>
subscriptionUpgrade-content-new-price-halfyear-tax = "Going forward, you will be charged <%- paymentAmountNew %> + <%- paymentTaxNew %> tax per six months."
<% } else if (locals.productPaymentCycleNew === 'year') { %>
subscriptionUpgrade-content-new-price-year-tax = "Going forward, you will be charged <%- paymentAmountNew %> + <%- paymentTaxNew %> tax per year."
<% } else { %>
subscriptionUpgrade-content-new-price-default-tax = "Going forward, you will be charged <%- paymentAmountNew %> + <%- paymentTaxNew %> tax per billing interval."
<% } %>
<% } else { %>
<% if (locals.productPaymentCycleNew === 'day') { %>
subscriptionUpgrade-content-new-price-day = "Going forward, you will be charged <%- paymentAmountNew %> per day."
<% } else if (locals.productPaymentCycleNew === 'week') { %>
subscriptionUpgrade-content-new-price-week = "Going forward, you will be charged <%- paymentAmountNew %> per week."
<% } else if (locals.productPaymentCycleNew === 'month') { %>
subscriptionUpgrade-content-new-price-month = "Going forward, you will be charged <%- paymentAmountNew %> per month."
<% } else if (locals.productPaymentCycleNew === 'halfyear') { %>
subscriptionUpgrade-content-new-price-halfyear = "Going forward, you will be charged <%- paymentAmountNew %> per six months."
<% } else if (locals.productPaymentCycleNew === 'year') { %>
subscriptionUpgrade-content-new-price-year = "Going forward, you will be charged <%- paymentAmountNew %> per year."
<% } else { %>
subscriptionUpgrade-content-new-price-default = "Going forward, you will be charged <%- paymentAmountNew %> per billing interval."
<% } %>
<% } %>

subscriptionUpgrade-existing = "If any of your existing subscriptions overlap with this upgrade, we’ll handle them and send you a separate email with the details. If your new plan includes products that require installation, we’ll send you a separate email with setup instructions."

subscriptionUpgrade-auto-renew = "Your subscription will automatically renew each billing period unless you choose to cancel."
`;

const mockLayoutMjml = `
<%# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/. %>

<mjml>
  <mj-body>
    <mj-section css-class="mb-8">
      <% if (locals.productIconURLNew) { %>
        <mj-column>
          <mj-image width="58px" src="<%- productIconURLNew %>" alt="<%- productName %>" title="<%- productName %>"
            css-class="product-icon">
          </mj-image>
        </mj-column>
      <% } else { %>
        <mj-column>
          <mj-image width="58px" src="<%- icon %>" alt="<%- productName %>" title="<%- productName %>"
          css-class="product-icon"></mj-image>
        </mj-column>
      <% } %>
    </mj-section>

    <%- body %>

    <mj-section>
      <mj-column css-class="<%= locals.cssClass || undefined %>">
        <mj-text css-class="text-body">
          <span data-l10n-id="subscriptionSupport">
            Questions about your subscription? Our <a data-l10n-name="subscriptionSupportUrl" href="<%- subscriptionSupportUrl %>">support team</a> is here to help you.
          </span>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

const mockLayoutText = `
subscriptionSupport-plaintext = "Questions about your subscription? Our support team is here to help you:"
<%- subscriptionSupportUrl %>
`;

const mockIncludes = {
  subject: {
    id: 'subscriptionUpgrade-subject',
    message: 'You have upgraded to <%- productName %>',
  },
};

describe('EmailTemplateManager', () => {
  let emailTemplateManager: EmailTemplateManager;

  beforeEach(async () => {
    const mockLocalizerServer = {
      setupDomLocalization: jest.fn().mockResolvedValue({
        l10n: {
          connectRoot: jest.fn(),
          translateRoots: jest.fn().mockReturnValue(undefined),
          formatValue: jest.fn().mockResolvedValue('Localized Subject'),
        },
        selectedLocale: 'en-US',
      }),
      getLocaleFromAcceptLanguage: jest.fn().mockReturnValue('en'),
      formatMessagesSync: jest
        .fn()
        .mockImplementation((messages: any[]) =>
          messages.map((msg: any) => ({ value: `Localized: ${msg.id}` }))
        ),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: LocalizerServer, useValue: mockLocalizerServer },
        EmailTemplateManager,
      ],
    }).compile();

    emailTemplateManager = moduleRef.get(EmailTemplateManager);

    jest.spyOn(fs, 'readFile').mockImplementation(async (path: any) => {
      let fileContent = '';
      if (path.toString().includes('includes.json')) {
        fileContent = JSON.stringify(mockIncludes);
      }
      if (
        path.toString().includes('index.mjml') &&
        path.toString().includes('template')
      ) {
        fileContent = mockTemplateMjml;
      }
      if (
        path.toString().includes('index.txt') &&
        path.toString().includes('template')
      ) {
        fileContent = mockTemplateText;
      }
      if (
        path.toString().includes('index.mjml') &&
        path.toString().includes('layout')
      ) {
        fileContent = mockLayoutMjml;
      }
      if (
        path.toString().includes('index.txt') &&
        path.toString().includes('layout')
      ) {
        fileContent = mockLayoutText;
      }

      return Promise.resolve(fileContent);
    });
  });

  describe('renderEmail', () => {
    it('should render an email template successfully', async () => {
      const options = createRenderEmailOptions({
        template: 'test',
        layout: 'layout',
        args: {
          userName: 'John Doe',
          productName: 'Pro Plan',
          subscriptionSupportUrl: 'https://example.com/support',
          previousRate: {
            l10nId: 'subscriptionUpgrade-content-old-price-month',
            l10nArgs: {
              paymentAmountOld: '$5.00',
            },
            message: 'The previous rate was $5.00 per month.',
          },
          newRate: {
            l10nId: 'subscriptionUpgrade-content-new-price-month',
            l10nArgs: {
              paymentAmountNew: '$10.00',
            },
            message: 'Going forward, you will be charged $10.00 per month.',
          },
          paymentProratedInCents: 250,
          paymentProrated: '$2.50',
          invoiceAmountDue: '$2.50',
          productPaymentCycleOld: 'month',
          productPaymentCycleNew: 'month',
          icon: 'https://example.com/icon.png',
        },
      });

      const result = await emailTemplateManager.renderEmail(options);
      expect(result.html).toContain(
        '<img alt="Pro Plan" src="https://example.com/icon.png"'
      );
      expect(result.html).toContain('href="https://example.com/support"');
      expect(result.html).toContain(
        'You have successfully upgraded to Pro Plan.'
      );
      expect(result.html).toContain(
        'Your subscription will automatically renew each billing period unless you choose to cancel.'
      );
      expect(result.html).toContain(
        'You have been charged a one-time fee of $2.50'
      );
    });
  });
});
