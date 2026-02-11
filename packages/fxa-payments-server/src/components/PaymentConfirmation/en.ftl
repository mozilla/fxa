## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Thank you!
payment-confirmation-thanks-heading-account-exists = Thanks, now check your email!

# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = A confirmation email has been sent to { $email } with details on how to get started with { $product_name }.

# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = You’ll receive an email at { $email } with instructions for setting up your account, as well as your payment details.

payment-confirmation-order-heading = Order details
payment-confirmation-invoice-number = Invoice #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Payment information

payment-confirmation-amount = { $amount } per { $interval }

# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day = { $intervalCount ->
  [one] { $amount } daily
  *[other] { $amount } every { $intervalCount } days
}
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week = { $intervalCount ->
  [one] { $amount } weekly
  *[other] { $amount } every { $intervalCount } weeks
}
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month = { $intervalCount ->
  [one] { $amount } monthly
  *[other] { $amount } every { $intervalCount } months
}
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year = { $intervalCount ->
  [one] { $amount } yearly
  *[other] { $amount } every { $intervalCount } years
}

payment-confirmation-download-button = Continue to download
