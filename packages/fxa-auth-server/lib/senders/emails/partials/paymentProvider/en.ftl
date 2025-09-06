payment-method-paypal-1 = <b>Payment method:</b> { -brand-paypal}
payment-method-apple-pay = <b>Payment method:</b> { -brand-apple-pay }
payment-method-google-pay = <b>Payment method:</b> { -brand-google-pay }
payment-method-link = <b>Payment method:</b> { -brand-link }
payment-provider-paypal-plaintext = Payment method: { -brand-paypal }
payment-provider-apple-pay-plaintext = Payment method: { -brand-apple-pay }
payment-provider-google-pay-plaintext = Payment method: { -brand-google-pay }
payment-provider-link-plaintext = Payment method: { -brand-link }


## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Payment method: { $cardName } ending in { $lastFour }
payment-provider-card-ending-in-plaintext = Payment method: Card ending in { $lastFour }
payment-provider-card-ending-in = <b>Payment method:</b> Card ending in { $lastFour }
payment-provider-card-ending-in-amex = <b>Payment method:</b> { -brand-amex } ending in { $lastFour }
payment-provider-card-ending-in-diners = <b>Payment method:</b> { -brand-diners } ending in { $lastFour }
payment-provider-card-ending-in-discover = <b>Payment method:</b> { -brand-discover } ending in { $lastFour }
payment-provider-card-ending-in-jcb = <b>Payment method:</b> { -brand-jcb } ending in { $lastFour }
payment-provider-card-ending-in-mastercard = <b>Payment method:</b> { -brand-mastercard } ending in { $lastFour }
payment-provider-card-ending-in-unionpay = <b>Payment method:</b> { -brand-unionpay } ending in { $lastFour }
payment-provider-card-ending-in-visa = <b>Payment method:</b> { -brand-visa } ending in { $lastFour }
