# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-project-header-title = { -product-mozilla-account }

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } लोगो

## Component - NewUserEmailForm

# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = अपना ईमेल दर्ज करें
new-user-confirm-email =
    .label = अपने ईमेल की पुष्टि करें
new-user-email-validate = ईमेल मान्य नहीं है

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = धन्यवाद!
payment-confirmation-order-heading = ऑर्डर का विवरण
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-amount = { $amount } हर { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } प्रतिदिन
       *[other] { $amount } हर { $intervalCount } दिन
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } साप्ताहिक
       *[other] { $amount } हर { $intervalCount } सप्ताह
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } मासिक
       *[other] { $amount } हर { $intervalCount } महीने
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } वार्षिक
       *[other] { $amount } हर { $intervalCount } वर्ष
    }
payment-confirmation-download-button = डाउनलोड करने के लिए आगे बढ़ें

## Component - PaymentForm

payment-name =
    .placeholder = पूरा नाम
    .label = नाम जो आपके कार्ड पर दर्शाया होता है
payment-cc =
    .label = आपका कार्ड
payment-cancel-btn = रद्द करें
payment-update-btn = अपडेट करें
payment-pay-btn = अभी भुगतान करें
payment-validate-name-error = कृपया अपना नाम दर्ज करें

## Component - PaymentMethodHeader

# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }

## Component - PlanDetails

plan-details-header = उत्पाद विवरण
plan-details-show-button = विवरण दिखाएं
plan-details-hide-button = विवरण छिपाएं
plan-details-total-label = कुल

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = सेवा की शर्तें
privacy = गोपनीयता सूचना

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts

## Error messages

expired-card-error = लगता है आपके कार्ड की अवधि समाप्त हो गई है। दूसरा कार्ड आज़मा कर देखें।
insufficient-funds-error = लगता है आपके कार्ड में अपर्याप्त राशि है। दूसरा कार्ड आज़मा कर देखें।

## Routes - Checkout - New user

new-user-card-title = अपने कार्ड की जानकारी दर्ज करें

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = कार्ड से भुगतान करें

## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-apple-app-store-2 = { -app-store }

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = सदस्यता रद्द करें

## Routes - Subscription - ActionButton

pay-update-change-btn = बदलें

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = इस सदस्यता के लिए ऐसी कोई योजना नहीं है।

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = { $name } का उपयोग करना जारी रखना चाहते हैं?

## $date (Date) - Last day of product access

reactivate-success-button = बंद करें
