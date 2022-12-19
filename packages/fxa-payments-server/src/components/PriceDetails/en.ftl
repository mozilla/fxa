## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } tax

# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day = { $intervalCount ->
  [one] { $priceAmount } daily
  *[other] { $priceAmount } every { $intervalCount } days
}
  .title = { $intervalCount ->
    [one] { $priceAmount } daily
    *[other] { $priceAmount } every { $intervalCount } days
  }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week = { $intervalCount ->
  [one] { $priceAmount } weekly
  *[other] { $priceAmount } every { $intervalCount } weeks
}
  .title = { $intervalCount ->
    [one] { $priceAmount } weekly
    *[other] { $priceAmount } every { $intervalCount } weeks
  }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month = { $intervalCount ->
  [one] { $priceAmount } monthly
  *[other] { $priceAmount } every { $intervalCount } months
}
  .title = { $intervalCount ->
    [one] { $priceAmount } monthly
    *[other] { $priceAmount } every { $intervalCount } months
  }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year = { $intervalCount ->
  [one] { $priceAmount } yearly
  *[other] { $priceAmount } every { $intervalCount } years
}
  .title = { $intervalCount ->
    [one] { $priceAmount } yearly
    *[other] { $priceAmount } every { $intervalCount } years
  }

# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day = { $intervalCount ->
  [one] { $priceAmount } + { $taxAmount } tax daily
  *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } days
}
  .title = { $intervalCount ->
    [one] { $priceAmount } + { $taxAmount } tax daily
    *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } days
  }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week = { $intervalCount ->
  [one] { $priceAmount } + { $taxAmount } tax weekly
  *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } weeks
}
  .title = { $intervalCount ->
    [one] { $priceAmount } + { $taxAmount } tax weekly
    *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } weeks
  }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month = { $intervalCount ->
  [one] { $priceAmount } + { $taxAmount } tax monthly
  *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } months
}
  .title = { $intervalCount ->
    [one] { $priceAmount } + { $taxAmount } tax monthly
    *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } months
  }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year = { $intervalCount ->
  [one] { $priceAmount } + { $taxAmount } tax yearly
  *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } years
}
  .title = { $intervalCount ->
    [one] { $priceAmount } + { $taxAmount } tax yearly
    *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } years
  }
