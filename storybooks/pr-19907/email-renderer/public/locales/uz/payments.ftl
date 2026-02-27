# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout


## Component - CouponForm


## Component - Fields


## Component - Header


## Component - NewUserEmailForm


## Component - PaymentConfirmation


## Component - PaymentConsentCheckbox


## Component - PaymentErrorView

payment-error-retry-button = Qayta urining
payment-error-manage-subscription-button = Obunalarni boshqarish

## Component - PaymentErrorView - IAP upgrade errors


## Component - PaymentForm


## Component - PaymentLegalBlurb


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


## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox hisoblari
# General aria-label for closing modals
close-aria =
    .aria-label = Oynani yopish

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = Umumiy dastur xatosi
basic-error-message = Qandaydir xatolik yuz berdi. Keyinroq qayta urining.
payment-error-1 = Hmm. Toʻlovni tasdiqlashda muammo yuz berdi. Qayta urinib koʻring yoki karta beruvchi bankka murojaat qiling.
payment-error-2 = Hmm. Toʻlovni tasdiqlashda muammo yuz berdi. Karta beruvchi bankka murojaat qiling.
payment-error-3b = Toʻlovni amalga oshirishda kutilmagan xatolik yuz berdi, qaytadan urinib koʻring.
expired-card-error = Kredit kartangiz muddati tugaganga oʻxshaydi. Boshqa kartani sinab koʻring.
insufficient-funds-error = Kartangizda mablagʻ kamga oʻxshaydi. Boshqa kartani sinab koʻring.
country-currency-mismatch = Ushbu obuna valyutasi toʻlovingiz bilan bogʻliq mamlakat uchun yaroqsiz.
currency-currency-mismatch = Kechirasiz. Siz valyutalarni almashtira olmaysiz.
no-subscription-change = Kechirasiz. Obuna rejangizni oʻzgartira olmaysiz.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Siz allaqachon { $mobileAppStore } orqali obuna boʻlgansiz.

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

