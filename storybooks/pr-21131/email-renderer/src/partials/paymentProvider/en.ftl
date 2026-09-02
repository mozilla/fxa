## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link
payment-method-payment-provider = <b>Payment method:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Payment method: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Payment method: { $cardName } ending in { $lastFour }
payment-provider-card-ending-in-plaintext = Payment method: Card ending in { $lastFour }
payment-provider-card-ending-in = <b>Payment method:</b> Card ending in { $lastFour }
payment-provider-card-ending-in-card-name = <b>Payment method:</b> { $cardName } ending in { $lastFour }
