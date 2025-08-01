## SubscriptionContent

## Examples of coupon applied
## 20% OFF coupon applied: $11.20 + $0.35 tax
## Holiday Offer 2023 coupon applied: 6,42 €
## Cybersecurity Awareness Month 2023 coupon applied: $11.20 + $0.35 tax
## Summer Promo VPN coupon applied: $11.20
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., 08/21/2025 for US locale, 21/08/25 for FR locale)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., 08/21/2025 for US locale, 21/08/25 for FR locale)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-promotion-applied-no-tax = { $promotionName } coupon applied: { $invoiceTotal }
subscription-content-promotion-applied-with-tax = { $promotionName } coupon applied: { $invoiceTotal } + { $taxDue } tax
subscription-content-current-with-tax = { $invoiceTotal } + { $taxDue } tax
subscription-content-next-bill-no-tax = Next bill of { $invoiceTotal } is due { $nextBillDate }
subscription-content-next-bill-with-tax = Next bill of { $invoiceTotal } + { $taxDue } tax is due { $nextBillDate }
subscription-content-heading-cancel-subscription = Cancel Subscription
subscription-content-no-longer-use-message = You will no longer be able to use { $productName } after { $currentPeriodEnd }, the last day of your billing cycle.
subscription-content-cancel-access-message = Cancel my access and my saved information within { $productName } on { $currentPeriodEnd }
subscription-content-button-stay-subscribed =
  Stay Subscribed
  .aria-label = Stay subscribed to { $productName }
subscription-content-button-cancel-subscription =
  Cancel Subscription
  .aria-label = Cancel your subscription to { $productName }
subscription-content-button-cancel =
  Cancel
  .aria-label = Cancel your subscription to { $productName }
