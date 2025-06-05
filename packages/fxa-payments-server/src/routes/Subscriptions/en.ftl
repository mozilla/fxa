## Routes - Subscription

sub-route-idx-reactivating = Reactivating subscription failed
sub-route-idx-cancel-failed = Cancelling subscription failed
sub-route-idx-contact = Contact Support
sub-route-idx-cancel-msg-title = We’re sorry to see you go
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Your { $name } subscription has been cancelled.
          <br />
          You will still have access to { $name } until { $date }.
sub-route-idx-cancel-aside-2 =
    Have questions? Visit <a>{ -brand-mozilla } Support</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
  .title = Problem loading customer
sub-invoice-error =
  .title = Problem loading invoices
sub-billing-update-success = Your billing information has been updated successfully
sub-invoice-previews-error-title = Problem loading invoice previews
sub-invoice-previews-error-text = Could not load invoice previews

## Routes - Subscription - ActionButton

pay-update-change-btn = Change
pay-update-manage-btn = Manage

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Next billed on { $date }
sub-next-bill-no-tax-1 = Next bill of { $priceAmount } is due { $date }
sub-next-bill-tax-1 = Next bill of { $priceAmount } + { $taxAmount } tax is due { $date }
sub-expires-on = Expires on { $date }

## Routes - Subscription - PaymentUpdate
# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Expires { $expirationDate }
sub-route-idx-updating = Updating billing information…
sub-route-payment-modal-heading = Invalid billing information
sub-route-payment-modal-message-2 = There seems to be an error with your { -brand-paypal } account, we need you to take the necessary steps to resolve this payment issue.
sub-route-missing-billing-agreement-payment-alert = Invalid payment information; there is an error with your account. <div>Manage</div>
sub-route-funding-source-payment-alert = Invalid payment information; there is an error with your account. This alert may take some time to clear after you successfully update your information. <div>Manage</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = No such plan for this subscription.
invoice-not-found = Subsequent invoice not found
sub-item-no-such-subsequent-invoice = Subsequent invoice not found for this subscription.
sub-invoice-preview-error-title = Invoice preview not found
sub-invoice-preview-error-text = Invoice preview not found for this subscription
