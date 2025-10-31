## SubscriptionContent

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = { $promotionName } discount will be applied
subscription-content-heading-cancel-subscription = Cancel Subscription
subscription-content-no-longer-use-message = You will no longer be able to use { $productName } after { $currentPeriodEnd }, the last day of your billing cycle.
subscription-content-cancel-access-message = Cancel my access and my saved information within { $productName } on { $currentPeriodEnd }
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Last bill • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } tax
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = View invoice
subscription-management-link-view-invoice-aria = View invoice for { $productName }
subscription-content-expires-on-expiry-date = Expires on { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Next bill • { $billedOnDate}
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } tax
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed =
  Stay Subscribed
  .aria-label = Stay subscribed to { $productName }
subscription-content-button-cancel-subscription-1 = Cancel subscription
subscription-content-button-cancel-subscription =
  Cancel Subscription
  .aria-label = Cancel your subscription to { $productName }
subscription-content-button-cancel =
  Cancel
  .aria-label = Cancel your subscription to { $productName }
subscription-content-cancel-action-error = An unexpected error occurred. Please try again.
subscription-cancellation-dialog-title = We’re sorry to see you go
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Your { $name } subscription has been cancelled. You will still have access to { $name } until { $date }.
subscription-cancellation-dialog-aside = Have questions? Visit <LinkExternal>{ -brand-mozilla } Support</LinkExternal>.
subscription-content-button-resubscribe = Resubscribe
  .aria-label = Resubscribe to { $productName }
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-content-resubscribe = You will lose access to { $name } on <strong>{ $date }</strong>.
# $name (String) - The name of the subscribed product.
resubscribe-dialog-title = Want to keep using { $name }?

## $name (String) - The name of the subscribed product.
## $amount (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $tax (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $endDate (Date) - The end date of the subscription period.

resubscribe-dialog-content = Your access to { $name } will continue, and your billing cycle and payment will stay the same. Your next charge will be { $amount } on { $endDate }.
resubscribe-dialog-content-with-tax = Your access to { $name } will continue, and your billing cycle and payment will stay the same. Your next charge will be { $amount } + { $tax } tax on { $endDate }.
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
resubscribe-dialog-action-button-resubscribe = Resubscribe
  .aria-label = Resubscribe to { $productName }
resubscribe-success-dialog-title = Thanks! You’re all set.
resubscribe-success-dialog-action-button-close = Close
  .aria-label = Close dialog

##
