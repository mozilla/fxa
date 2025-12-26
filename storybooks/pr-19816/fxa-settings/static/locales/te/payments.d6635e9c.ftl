# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = ఖాతా ముంగిలి

## Component - CouponForm

coupon-submit = వర్తింపజేయి
coupon-remove = తీసివేయి

## Component - Fields


## Component - Header


## Component - NewUserEmailForm


## Component - PaymentConfirmation

payment-confirmation-thanks-heading = కృతజ్ఞతలు!
payment-confirmation-order-heading = ఆర్డరు వివరాలు
payment-confirmation-invoice-number = ఇన్వాయిస్ #{ $invoiceNumber }
payment-confirmation-details-heading-2 = చెల్లింపు సమాచారం

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView

payment-error-retry-button = మళ్ళీ ప్రయత్నించండి

## Component - PaymentErrorView - IAP upgrade errors


## Component - PaymentForm

payment-name =
    .placeholder = పూర్తి పేరు
    .label = మీ కార్డు మీద ఉన్నట్టుగా పేరు
payment-cc =
    .label = మీ కార్డు
payment-cancel-btn = రద్దుచేయి
payment-update-btn = తాజాకరించు
payment-pay-btn = ఇప్పుడు చెల్లించండి

## Component - PaymentLegalBlurb


## Component - PaymentMethodHeader


## Component - PaymentProcessing


## Component - PaymentProviderDetails


## Component - PayPalButton


## Component - PlanDetails

plan-details-show-button = వివరాలను చూపించు
plan-details-hide-button = వివరాలను దాచు
plan-details-total-label = మొత్తం

## Component - PlanErrorDialog


## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.


## Component - SubscriptionTitle


## Component - TermsAndPrivacy

terms = సేవా నియమాలు
privacy = గోప్యతా విధానం
terms-download = దింపుకోలు నియమాలు

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox ఖాతాలు
settings-subscriptions-title = చందాలు

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages


## Hooks - coupons


## Routes - Checkout - New user


## Routes - Product and Subscriptions


## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate


## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.


## Routes - Product - Subscription upgrade


## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)


## Routes - Subscriptions - Cancel


## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access


## Routes - Subscription


## Routes - Subscriptions - Errors


## Routes - Subscription - ActionButton

pay-update-change-btn = మార్చు

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.


## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.


## Routes - Subscription - SubscriptionItem


## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.


## $date (Date) - Last day of product access

reactivate-success-button = మూసివేయి

## Routes - Subscriptions - Subscription iap item

