## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Checkout | { $productTitle }
metadata-description-checkout-start = Enter your payment details to complete your purchase.
# Checkout processing
metadata-title-checkout-processing = Processing | { $productTitle }
metadata-description-checkout-processing = Please wait while we finish processing your payment.
# Checkout error
metadata-title-checkout-error = Error | { $productTitle }
metadata-description-checkout-error = There was an error processing your subscription. If this problem persists, please contact support.
# Checkout success
metadata-title-checkout-success = Success | { $productTitle }
metadata-description-checkout-success = Congratulations! You have successfully completed your purchase.
# Checkout needs_input
metadata-title-checkout-needs-input = Action required | { $productTitle }
metadata-description-checkout-needs-input = Please complete the required action to proceed with your payment.
# Upgrade start
metadata-title-upgrade-start = Upgrade | { $productTitle }
metadata-description-upgrade-start = Enter your payment details to complete your upgrade.
# Upgrade processing
metadata-title-upgrade-processing = Processing | { $productTitle }
metadata-description-upgrade-processing = Please wait while we finish processing your payment.
# Upgrade error
metadata-title-upgrade-error = Error | { $productTitle }
metadata-description-upgrade-error = There was an error processing your upgrade. If this problem persists, please contact support.
# Upgrade success
metadata-title-upgrade-success = Success | { $productTitle }
metadata-description-upgrade-success = Congratulations! You have successfully completed your upgrade.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Action required | { $productTitle }
metadata-description-upgrade-needs-input = Please complete the required action to proceed with your payment.
# Default
metadata-title-default = Page not found | { $productTitle }
metadata-description-default = The page you requested was not found.

## Coupon Error Messages

next-coupon-error-cannot-redeem = The code you entered cannot be redeemed — your account has a previous subscription to one of our services.
next-coupon-error-expired = The code you entered has expired.
next-coupon-error-generic = An error occurred processing the code. Please try again.
next-coupon-error-invalid = The code you entered is invalid.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = The code you entered has reached its limit.

## Stay Subscribed Error Messages

stay-subscribed-error-expired = This offer has expired.
stay-subscribed-error-discount-used = Discount code already applied.
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = This discount is only available to current { $productTitle } subscribers.
stay-subscribed-error-still-active = Your { $productTitle } subscription is still active.
stay-subscribed-error-general = There was an issue with renewing your subscription.

## Manage Payment Method Error Messages

manage-payment-method-intent-error-card-declined = Your transaction could not be processed. Please verify your credit card information and try again.
manage-payment-method-intent-error-expired-card-error = It looks like your credit card has expired. Try another card.
manage-payment-method-intent-error-try-again = Hmm. There was a problem authorizing your payment. Try again or get in touch with your card issuer.
manage-payment-method-intent-error-get-in-touch = Hmm. There was a problem authorizing your payment. Get in touch with your card issuer.
manage-payment-method-intent-error-insufficient-funds = It looks like your card has insufficient funds. Try another card.
manage-payment-method-intent-error-generic = An unexpected error has occurred while processing your payment, please try again.

## Next Charge

## $currentPeriodEnd (Date) - The date of the next charge.
## $discountPercent (Number) - The discount amount between 1 and 100 as an integer (e.g. "You will save 10% on your next charge of $12.00 on December 25, 2025.", discountPercent = 10)
## $last4 (String) - The last four digits of the default payment method card.
## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $paymentMethod (String) - The name of the default payment method - "Google Pay", "Apple Pay", "PayPal", "Link".
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.

next-charge-with-discount-and-tax-card = You will save { $discountPercent }% on your next charge of { $nextInvoiceTotal } + { $taxDue } tax to the card ending in { $last4 } on { $currentPeriodEnd }.
next-charge-with-discount-and-tax-payment-method = You will save { $discountPercent }% on your next charge of { $nextInvoiceTotal } + { $taxDue } tax to your { $paymentMethod } payment method on { $currentPeriodEnd }.
next-charge-next-charge-with-discount-and-tax = You will save { $discountPercent }% on your next charge of { $nextInvoiceTotal } + { $taxDue } tax on { $currentPeriodEnd }.
next-charge-with-discount-no-tax-card = You will save { $discountPercent }% on your next charge of { $nextInvoiceTotal } to the card ending in { $last4 } on { $currentPeriodEnd }.
next-charge-with-discount-no-tax-payment-method = You will save { $discountPercent }% on your next charge of { $nextInvoiceTotal } to your { $paymentMethod } payment method on { $currentPeriodEnd }.
next-charge-with-discount-no-tax = You will save { $discountPercent }% on your next charge of { $nextInvoiceTotal } on { $currentPeriodEnd }.
next-charge-with-tax-card = Your next charge will be { $nextInvoiceTotal } + { $taxDue } tax to the card ending in { $last4 } on { $currentPeriodEnd }.
next-charge-with-tax-payment-method = Your next charge will be { $nextInvoiceTotal } + { $taxDue } tax to your { $paymentMethod } payment method on { $currentPeriodEnd }.
next-charge-with-tax = Your next charge will be { $nextInvoiceTotal } + { $taxDue } tax on { $currentPeriodEnd }.
next-charge-no-tax-card = Your next charge will be { $nextInvoiceTotal } to the card ending in { $last4 } on { $currentPeriodEnd }.
next-charge-no-tax-payment-method = Your next charge will be { $nextInvoiceTotal } to your { $paymentMethod } payment method on { $currentPeriodEnd }.
next-charge-no-tax = Your next charge will be { $nextInvoiceTotal } on { $currentPeriodEnd }.

##
