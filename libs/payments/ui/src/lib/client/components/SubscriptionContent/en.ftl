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
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Last bill • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } tax
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = View invoice
subscription-management-link-view-invoice-aria = View invoice for { $productName }
subscription-content-expires-on-expiry-date = Expires on { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Next bill • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } tax
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed =
  Stay Subscribed
  .aria-label = Stay subscribed to { $productName }
subscription-content-button-cancel-subscription =
  Cancel subscription
  .aria-label = Cancel your subscription to { $productName }
# Link to the terms and restrictions for a coupon offer.
subscription-content-link-churn-intervention-terms-apply = Terms apply
subscription-content-link-churn-intervention-terms-aria = View coupon terms and restrictions

##
