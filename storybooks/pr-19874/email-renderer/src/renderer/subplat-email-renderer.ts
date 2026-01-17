import { EmailRenderer } from './email-renderer';
import * as SubscriptionLayouts from '../layouts/subscription';
import * as DownloadSubscription from '../templates/downloadSubscription';
import * as FraudulentAccountDeletion from '../templates/fraudulentAccountDeletion';
import * as SubscriptionAccountDeletion from '../templates/subscriptionAccountDeletion';
import * as SubscriptionAccountFinishSetup from '../templates/subscriptionAccountFinishSetup';
import * as SubscriptionAccountReminderFirst from '../templates/subscriptionAccountReminderFirst';
import * as SubscriptionAccountReminderSecond from '../templates/subscriptionAccountReminderSecond';
import * as SubscriptionCancellation from '../templates/subscriptionCancellation';
import * as SubscriptionDowngrade from '../templates/subscriptionDowngrade';
import * as SubscriptionFailedPaymentsCancellation from '../templates/subscriptionFailedPaymentsCancellation';
import * as SubscriptionFirstInvoice from '../templates/subscriptionFirstInvoice';
import * as SubscriptionPaymentExpired from '../templates/subscriptionPaymentExpired';
import * as SubscriptionPaymentFailed from '../templates/subscriptionPaymentFailed';
import * as SubscriptionPaymentProviderCancelled from '../templates/subscriptionPaymentProviderCancelled';
import * as SubscriptionReactivation from '../templates/subscriptionReactivation';
import * as SubscriptionRenewalReminder from '../templates/subscriptionRenewalReminder';
import * as SubscriptionReplaced from '../templates/subscriptionReplaced';
import * as SubscriptionsPaymentExpired from '../templates/subscriptionsPaymentExpired';
import * as SubscriptionsPaymentProviderCancelled from '../templates/subscriptionsPaymentProviderCancelled';
import * as SubscriptionSubsequentInvoice from '../templates/subscriptionSubsequentInvoice';
import * as SubscriptionUpgrade from '../templates/subscriptionUpgrade';

export class SubplatEmailRender extends EmailRenderer {
  async renderDownloadSubscription(
    templateValues: DownloadSubscription.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: DownloadSubscription.template,
      version: DownloadSubscription.version,
      layout: DownloadSubscription.layout,
      includes: DownloadSubscription.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderFraudulentAccountDeletion(
    templateValues: FraudulentAccountDeletion.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: FraudulentAccountDeletion.template,
      version: FraudulentAccountDeletion.version,
      layout: FraudulentAccountDeletion.layout,
      includes: FraudulentAccountDeletion.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionAccountDeletion(
    templateValues: SubscriptionAccountDeletion.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionAccountDeletion.template,
      version: SubscriptionAccountDeletion.version,
      layout: SubscriptionAccountDeletion.layout,
      includes: SubscriptionAccountDeletion.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionAccountFinishSetup(
    templateValues: SubscriptionAccountFinishSetup.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionAccountFinishSetup.template,
      version: SubscriptionAccountFinishSetup.version,
      layout: SubscriptionAccountFinishSetup.layout,
      includes: SubscriptionAccountFinishSetup.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionAccountReminderFirst(
    templateValues: SubscriptionAccountReminderFirst.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionAccountReminderFirst.template,
      version: SubscriptionAccountReminderFirst.version,
      layout: SubscriptionAccountReminderFirst.layout,
      includes: SubscriptionAccountReminderFirst.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionAccountReminderSecond(
    templateValues: SubscriptionAccountReminderSecond.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionAccountReminderSecond.template,
      version: SubscriptionAccountReminderSecond.version,
      layout: SubscriptionAccountReminderSecond.layout,
      includes: SubscriptionAccountReminderSecond.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionCancellation(
    templateValues: SubscriptionCancellation.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionCancellation.template,
      version: SubscriptionCancellation.version,
      layout: SubscriptionCancellation.layout,
      includes: SubscriptionCancellation.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionDowngrade(
    templateValues: SubscriptionDowngrade.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionDowngrade.template,
      version: SubscriptionDowngrade.version,
      layout: SubscriptionDowngrade.layout,
      includes: SubscriptionDowngrade.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionFailedPaymentsCancellation(
    templateValues: SubscriptionFailedPaymentsCancellation.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionFailedPaymentsCancellation.template,
      version: SubscriptionFailedPaymentsCancellation.version,
      layout: SubscriptionFailedPaymentsCancellation.layout,
      includes: SubscriptionFailedPaymentsCancellation.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionFirstInvoice(
    templateValues: SubscriptionFirstInvoice.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionFirstInvoice.template,
      version: SubscriptionFirstInvoice.version,
      layout: SubscriptionFirstInvoice.layout,
      includes: SubscriptionFirstInvoice.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionPaymentExpired(
    templateValues: SubscriptionPaymentExpired.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionPaymentExpired.template,
      version: SubscriptionPaymentExpired.version,
      layout: SubscriptionPaymentExpired.layout,
      includes: SubscriptionPaymentExpired.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionPaymentFailed(
    templateValues: SubscriptionPaymentFailed.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionPaymentFailed.template,
      version: SubscriptionPaymentFailed.version,
      layout: SubscriptionPaymentFailed.layout,
      includes: SubscriptionPaymentFailed.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionPaymentProviderCancelled(
    templateValues: SubscriptionPaymentProviderCancelled.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionPaymentProviderCancelled.template,
      version: SubscriptionPaymentProviderCancelled.version,
      layout: SubscriptionPaymentProviderCancelled.layout,
      includes: SubscriptionPaymentProviderCancelled.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionReactivation(
    templateValues: SubscriptionReactivation.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionReactivation.template,
      version: SubscriptionReactivation.version,
      layout: SubscriptionReactivation.layout,
      includes: SubscriptionReactivation.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionRenewalReminder(
    templateValues: SubscriptionRenewalReminder.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionRenewalReminder.template,
      version: SubscriptionRenewalReminder.version,
      layout: SubscriptionRenewalReminder.layout,
      includes: SubscriptionRenewalReminder.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionReplaced(
    templateValues: SubscriptionReplaced.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionReplaced.template,
      version: SubscriptionReplaced.version,
      layout: SubscriptionReplaced.layout,
      includes: SubscriptionReplaced.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionsPaymentExpired(
    templateValues: SubscriptionsPaymentExpired.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionsPaymentExpired.template,
      version: SubscriptionsPaymentExpired.version,
      layout: SubscriptionsPaymentExpired.layout,
      includes: SubscriptionsPaymentExpired.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionsPaymentProviderCancelled(
    templateValues: SubscriptionsPaymentProviderCancelled.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionsPaymentProviderCancelled.template,
      version: SubscriptionsPaymentProviderCancelled.version,
      layout: SubscriptionsPaymentProviderCancelled.layout,
      includes: SubscriptionsPaymentProviderCancelled.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionSubsequentInvoice(
    templateValues: SubscriptionSubsequentInvoice.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionSubsequentInvoice.template,
      version: SubscriptionSubsequentInvoice.version,
      layout: SubscriptionSubsequentInvoice.layout,
      includes: SubscriptionSubsequentInvoice.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }

  async renderSubscriptionUpgrade(
    templateValues: SubscriptionUpgrade.TemplateData,
    layoutTemplateValues: SubscriptionLayouts.TemplateData
  ) {
    return this.renderEmail({
      template: SubscriptionUpgrade.template,
      version: SubscriptionUpgrade.version,
      layout: SubscriptionUpgrade.layout,
      includes: SubscriptionUpgrade.includes,
      ...templateValues,
      ...layoutTemplateValues,
    });
  }
}
