## App-level string(s) and messages shared by multiple components or routes

document =
  .title = Firefox Accounts

# General aria-label for closing modals
close-aria =
  .aria-label = Close modal

settings-subscriptions-title = Subscriptions

# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Promo Code

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day = { $intervalCount ->
  [one] { $amount } daily
  *[other] { $amount } every { $intervalCount } days
}
  .title = { $intervalCount ->
    [one] { $amount } daily
    *[other] { $amount } every { $intervalCount } days
  }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week = { $intervalCount ->
  [one] { $amount } weekly
  *[other] { $amount } every { $intervalCount } weeks
}
  .title = { $intervalCount ->
    [one] { $amount } weekly
    *[other] { $amount } every { $intervalCount } weeks
  }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month = { $intervalCount ->
  [one] { $amount } monthly
  *[other] { $amount } every { $intervalCount } months
}
  .title = { $intervalCount ->
    [one] { $amount } monthly
    *[other] { $amount } every { $intervalCount } months
  }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year = { $intervalCount ->
  [one] { $amount } yearly
  *[other] { $amount } every { $intervalCount } years
}
  .title = { $intervalCount ->
    [one] { $amount } yearly
    *[other] { $amount } every { $intervalCount } years
  }
