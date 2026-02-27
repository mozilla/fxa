# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Tepas Akun

## Component - CouponForm


## Component - Fields


## Component - Header


## Component - NewUserEmailForm


## Component - PaymentConfirmation


## Component - PaymentConsentCheckbox


## Component - PaymentErrorView

payment-error-retry-button = Pecakan deui
payment-error-manage-subscription-button = Kokolakeun langganan kami

## Component - PaymentErrorView - IAP upgrade errors


## Component - PaymentForm

payment-name =
    .placeholder = Ngaran Lengkep
    .label = Ngaran luyu jeung kartu anjeun
payment-cc =
    .label = Kartu anjeun
payment-cancel-btn = Bolay

## Component - PaymentLegalBlurb

payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } kawijakan pripasi</stripePrivacyLink>.

## Component - PaymentMethodHeader


## Component - PaymentProcessing


## Component - PaymentProviderDetails


## Component - PayPalButton


## Component - PlanDetails


## Component - PlanErrorDialog


## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.


## Component - SubscriptionTitle


## Component - TermsAndPrivacy

terms = Katangtuan Layanan
privacy = Wawar Privasi
terms-download = Undeur Katangtuan

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Akun Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Tutup modal
settings-subscriptions-title = Langganan

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = Éror aplikasi umum
basic-error-message = Aya anu salah. Cobaan deui engké.
payment-error-1 = Duh. Aya masalah sanggeus mastikeun bayaran anjeun. Cobaan deui atawa béjaan anu ngaluarkeun kartu anjeun.
product-profile-error =
    .title = Propil hésé dimuat
product-customer-error =
    .title = Konsumén hésé dimuat

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

sub-item-cancel-sub = Bolay Langganan

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Anjeun moal bisa maké { $name } sanggeus
    { $period }, poé panungtung daur tagihan anjeun.
sub-item-cancel-confirm =
    Bolaykeun aksés jeung émbaran anu disimpen nepi ka
    { $name } dina { $period }

## Routes - Subscription

sub-route-idx-cancel-failed = Ngabolaykeun langganan gagal
sub-route-idx-cancel-msg-title = Pileuleuyan

## Routes - Subscriptions - Errors


## Routes - Subscription - ActionButton


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


## Routes - Subscriptions - Subscription iap item

