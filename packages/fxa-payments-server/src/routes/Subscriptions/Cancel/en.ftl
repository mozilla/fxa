## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Cancel Subscription
sub-item-stay-sub = Stay Subscribed

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access
sub-item-cancel-msg =
    You will no longer be able to use { $name } after
    { $period }, the last day of your billing cycle.
sub-item-cancel-confirm =
    Cancel my access and my saved information within
    { $name } on { $period }

## Subscription billing details
## $amount (Number) - The amount billed. It will be formatted as currency.

#  $intervalCount (Number) - The interval between payments, in days.
sub-plan-price-day = { $intervalCount ->
  [one] { $amount } daily
  *[other] { $amount } every { $intervalCount } days
}
#  $intervalCount (Number) - The interval between payments, in weeks.
sub-plan-price-week = { $intervalCount ->
  [one] { $amount } weekly
  *[other] { $amount } every { $intervalCount } weeks
}
#  $intervalCount (Number) - The interval between payments, in months.
sub-plan-price-month = { $intervalCount ->
  [one] { $amount } monthly
  *[other] { $amount } every { $intervalCount } months
}
#  $intervalCount (Number) - The interval between payments, in years.
sub-plan-price-year = { $intervalCount ->
  [one] { $amount } yearly
  *[other] { $amount } every { $intervalCount } years
}
