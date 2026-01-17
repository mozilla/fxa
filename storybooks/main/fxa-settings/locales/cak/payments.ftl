# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Rutikirib'al Rub'i' Taqoya'l

## Component - CouponForm

coupon-submit = Tisamajïx
coupon-remove = Tiyuj
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Titz'ib'äx B'itz'ib'

## Component - Fields

default-input-error = K'atzinel re k'ojlib'äl re'.
input-error-is-required = Najowäx { $label }

## Component - Header


## Component - NewUserEmailForm

# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Tatz'ib'aj ri ataqoya'l
new-user-confirm-email =
    .label = Tajikib'a' ataqoya'l
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = ¿La itzel rutz'ib'axik ri taqoya'l? { $domain } man yerusüj ta taq taqoya'l.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = ¡Matyox!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Xtaq jun rutaqoya' jikib'anïk pa { $email } richin rub'eyal natikirisaj rik'in { $product_name }.
payment-confirmation-order-heading = Rub'anikil taqoj
payment-confirmation-invoice-number = Rajilab'al paktura' { $invoiceNumber }
payment-confirmation-details-heading-2 = Retamab'al tojïk
payment-confirmation-amount = { $amount } chi { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } chi q'ij
       *[other] { $amount } jujun { $intervalCount } q'ij
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } chi wuqq'ij
       *[other] { $amount } jujun { $intervalCount } wuqq'ij
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } chi ik'ul
       *[other] { $amount } jujun { $intervalCount } ik'
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } chi juna'
       *[other] { $amount } jujun { $intervalCount } juna'
    }
payment-confirmation-download-button = K'a tiqasäx

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView

payment-error-retry-button = Titojtob'ëx chik
payment-error-manage-subscription-button = Tinuk'samajïx rutz'ib'axik nub'i'

## Component - PaymentErrorView - IAP upgrade errors

iap-upgrade-get-help-button = Tak'ulu' ato'ik

## Component - PaymentForm

payment-name =
    .placeholder = Tz'aqät B'i'aj
    .label = Tatz'ib'aj rub'i' achi'el k'o pa ri tarjeta'
payment-cc =
    .label = Atarjeta'
payment-cancel-btn = Tiq'at
payment-update-btn = Tik'ex
payment-pay-btn = Titzij wakami
payment-validate-name-error = Tatz'ib'aj ab'i'

## Component - PaymentLegalBlurb


## Component - PaymentMethodHeader

# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }

## Component - PaymentProcessing

payment-processing-message = Tawoyob'ej richin niqasamajij ri atojik…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = K'isb'en pa { $last4 } ri tarjeta'

## Component - PayPalButton


## Component - PlanDetails

plan-details-header = Rub'anikil tikojil
plan-details-show-button = Kek'ut pe ri taq rub'anikil
plan-details-hide-button = Ke'ewäx ri taq rub'anikil
plan-details-total-label = Ronojel

## Component - PlanErrorDialog

product-no-such-plan = Majun ajil richin re tikojil.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }

## Component - SubscriptionTitle

subscription-create-title = Tiqab'ana' runuk'ulem rutz'ib'axik b'i'aj
subscription-success-title = Rujikib'axik rutz'ib'axik b'i'aj
subscription-processing-title = Nijikib'äx rutz'ib'axik b'i'aj
subscription-error-title = Xsach toq nijikib'äx ri rutz'ib'axik b'i'aj…
sub-guarantee = 30-q'ij tikirel nitzolïx pwäq

## Component - TermsAndPrivacy

terms = Ketal Samaj
privacy = Ichinan Na'oj

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
# General aria-label for closing modals
close-aria =
    .aria-label = Titz'apïx modal
settings-subscriptions-title = Kitz'ib'axik b'i'aj

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = Rusachoj chijun rusamajixik
basic-error-message = K'o man xel ta ütz. Tatojtob'ej chik jub'a' chik na.
payment-error-1 = Hmm. Xk'oje' jun k'ayewal rik'in ruya'ik q'ij tojïk. Tatojtob'ej chik o katzijon rik'in ri xya'o ri atarjeta'
payment-error-2 = Hmm. Xk'oje' jun k'ayewal rik'in ruya'ik q'ij tojïk. Katzijon rik'in ri xya'o ri atarjeta'.
payment-error-3b = Xk'ulwachitäj jun man oyob'en ta chi sachoj toq nib'an ri tojïk, tatojtob'ej chik.
expired-card-error = Xa ke xa ri rutajeta' richin kre'ito' xik'o yan ruq'ijul. Tatojtob'ej chik rik'in jun tarjeta'.
insufficient-funds-error = Xa ke xa ri tajeta' man k'ïy ta rupam. Tatojtob'ej chik rik'in jun tarjeta'.
withdrawal-count-limit-exceeded-error = Xakexa re tojoj re' xtik'o ruwi' rajil. Tatojtob'ej jun chik tarjeta'.
charge-exceeds-source-limit = Xakexa re tojoj re' xtik'o ruwi' rajil jun q'ij. Tatojtob'ej jun chik tarjeta' o jumul chik pa 24 ramaj.
instant-payouts-unsupported = Xakexa ri rutarjeta' e'ito' majun runuk'ulem richin anin tojïk. Tatojtob'ej rik'in jun chik rutajeta' e'ito' o kre'ito'.
duplicate-transaction = Hmm. Achi'el chi k'a b'a' titaq jun totoj junam. Tanik'oj ri runatab'al atojik.
coupon-expired = Achi'el chi re sujel b'itz'ib' xk'is ruq'ijul.
card-error = Man xb'an ta ri tojïk. Tanik'oj ri retamab'al rutarjeta' kre'ito' chuqa' tatojtob'ej chik.
country-currency-mismatch = Man okel ta ri rupwaq re tz'ib'anïk b'i'aj re' richin re amaq' atz'ib'an kan richin ri atojik.
currency-currency-mismatch = Takuyu'. Man yatikïr ta najäl chi kikojol ri pwaqil.
product-plan-error =
    .title = K'o k'ayewal toq nisamajïx ri taq ajil
product-profile-error =
    .title = K'o k'ayewal toq nisamajïx ri rub'i' awäch
product-customer-error =
    .title = K'o k'ayewal toq nisamajïx ri okisanel
product-plan-not-found = Man xilitäj ta ajil

## Hooks - coupons


## Routes - Checkout - New user

new-user-submit = Tatz'ib'aj ab'i' wakami

## Routes - Product and Subscriptions

sub-update-payment-title = Retamab'al tojïk

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Titoj rik'in tarjeta'

## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.


## Routes - Product - Subscription upgrade

sub-update-current-plan-label = Ajil wakami
sub-update-new-plan-label = K'ak'a' ajil
sub-update-total-label = Ronojel k'ak'a'

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)


## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Tiq'at tz'ib'axïk b'i'aj
sub-item-stay-sub = Tik'oje' na Rutz'ib'axik B'i'aj

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Man xtokisäx ta { $name } chi rij ri 
    { $period }, ri ruk'isib'äl ruwujil tojïk.
sub-item-cancel-confirm =
    Tiq'at ri wokem chuqa' ri wetamab'al yakon
    { $name } pa { $period }

## Routes - Subscription

sub-route-idx-reactivating = Xsach ri rutzijik chik rutz'ib'axik b'i'aj
sub-route-idx-cancel-failed = Xsach ri ruq'atik rutz'ib'axik b'i'aj
sub-route-idx-contact = Katzijon pa Tob'äl
sub-route-idx-cancel-msg-title = Yatqamäy ruma yab'e.
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Ri { $name } rutz'ib'axik ab'i' xq'at.
          <br />
          Xkatikïr xkatok pa { $name } k'a pa { $date }.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = K'o k'ayewal toq nisamajïx ri okisanel
sub-billing-update-success = Ütz xk'ex ri retamab'al paktura'

## Routes - Subscription - ActionButton

pay-update-change-btn = Tijal
pay-update-manage-btn = Tinuk'samajïx

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Jun chik ruwujil tojïk pa { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Nik'is { $expirationDate }
sub-route-idx-updating = Nik'ex ri retamab'al wujil…

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Majun ajil richin re rutz'ib'axik b'i'aj.

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = ¿La k'a nawajo' nawokisaj { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Ri awokem pa { $name } k'a nib'anatäj chuqa' ri retal atojik
    chuqa' atojik junam xtib'anatäj. Ri jun chik atojik xtab'än pa
    { $amount } rik'in ri tarjeta' nik'is pa { $last } ri { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Ri awokem pa { $name } k'a nib'anatäj chuqa' ri retal atojik
    chuqa' atojik junam xtib'anatäj. Ri jun chik atojik xtab'än pa
    { $amount } pa { $endDate }.
reactivate-confirm-button = Titz'ib'äx chik b'i'aj

## $date (Date) - Last day of product access

reactivate-panel-copy = Xtasäch awokem pa { $name } ri <strong>{ $date }</strong>.
reactivate-success-copy = ¡Matyox! Ütz chik.
reactivate-success-button = Titz'apïx

## Routes - Subscriptions - Subscription iap item

sub-iap-item-manage-button = Tinuk'samajïx
