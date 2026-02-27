# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = അക്കൗണ്ടു് ആമുഖം
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

coupon-remove = മാറ്റുക

## Component - Fields

default-input-error = ഈ തലം പൂരിപ്പിക്കേണ്ടതാണു്
input-error-is-required = { $label } ആവശ്യമാണു്

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } അടയാളം

## Component - NewUserEmailForm

# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = താങ്ങളുടെ ഇ-തപാൽ നൽകുക
new-user-confirm-email =
    .label = ഇ-തപാൽ തീൎച്ചപ്പെടുത്തുക

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = നന്ദി
payment-confirmation-order-heading = ഓർഡർ വിശദാംശങ്ങൾ
payment-confirmation-download-button = ഇറക്കിവയ്ക്കുന്നതിനു് തുടരുക

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView


## Component - PaymentErrorView - IAP upgrade errors

iap-upgrade-get-help-button = പിന്തുണ നേടുക

## Component - PaymentForm

payment-name =
    .placeholder = മഴുവൻ പേരു്
    .label = താങ്ങളുടെ ചീട്ടിൽ പേരു് വരുന്നപ്പോലെ
payment-cc =
    .label = താങ്ങളുടെ ചീട്ടു്
payment-cancel-btn = റദ്ദാക്കുക
payment-update-btn = പുതുക്കുക
payment-pay-btn = ഇപ്പോഴു് പണമടയ്ക്കുക
payment-pay-with-paypal-btn-2 = { -brand-paypal }-ന്റെ കൂടെ പണമടയ്ക്കുക
payment-validate-name-error = ദയവായി താങ്ങളുടെ പേരു് നല്കുക

## Component - PaymentLegalBlurb


## Component - PaymentMethodHeader


## Component - PaymentProcessing


## Component - PaymentProviderDetails


## Component - PayPalButton


## Component - PlanDetails

plan-details-header = ഉൽപ്പന്ന വിശദാംശങ്ങൾ
plan-details-show-button = വിശദാംശങ്ങൾ കാണിക്കുക
plan-details-hide-button = വിശദാംശങ്ങള്‍ മറയ്ക്കുക
plan-details-total-label = മൊത്തം
plan-details-tax = ചുങ്കവും കൂലിയും

## Component - PlanErrorDialog

product-no-such-plan = ഈ ഉൽ‌പ്പന്നത്തിനായി അത്തരം പദ്ധതികളൊന്നുമില്ല.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } ചുങ്കം

## Component - SubscriptionTitle

sub-guarantee = 30 ദിവസത്തെ പണം മടക്കിനൽകുന്നതിനുള്ള ഉറപ്പു്

## Component - TermsAndPrivacy

terms = സേവന നിബന്ധനകള്‍
privacy = സ്വകാര്യത അറിയിപ്പു്

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = ഫയർഫോക്സ് അക്കൗണ്ടുകൾpayment-error-retry-button = വീണ്ടും ശ്രമിയ്ക്കുക
# General aria-label for closing modals
close-aria =
    .aria-label = പടകൊടി അടയ്ക്കുക
settings-subscriptions-title = സബ്‌സ്ക്രിപ്ഷനുകൾ

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = പൊതുവായ പ്രയോഗ പിശകു്
basic-error-message = എന്തോ കുഴപ്പം ഉണ്ടായി. ദയവായി വീണ്ടും ശ്രമിക്കുക.
payment-error-1 = ഉം. നിങ്ങളുടെ പേയ്‌മെന്റ് അംഗീകരിക്കുന്നതിൽ ഒരു പ്രശ്‌നമുണ്ട്. വീണ്ടും ശ്രമിക്കുക അല്ലെങ്കിൽ നിങ്ങളുടെ കാർഡ് നൽ‌കുന്നയാളുമായി ബന്ധപ്പെടുക.
payment-error-2 = ഉം. നിങ്ങളുടെ പേയ്‌മെന്റ് അംഗീകരിക്കുന്നതിൽ ഒരു പ്രശ്‌നമുണ്ട്. നിങ്ങളുടെ കാർഡ് നൽ‌കുന്നയാളുമായി ബന്ധപ്പെടുക.
expired-card-error = നിങ്ങളുടെ ക്രെഡിറ്റ് കാർഡ് കാലഹരണപ്പെട്ടതായി തോന്നുന്നു. മറ്റൊരു കാർഡ് പരീക്ഷിക്കുക.
insufficient-funds-error = നിങ്ങളുടെ കാർഡിൽ മതിയായ പൈസ ഇല്ലെന്ന് തോന്നുന്നു. മറ്റൊരു കാർഡ് പരീക്ഷിക്കുക.
withdrawal-count-limit-exceeded-error = ഈ ഇടപാട് നിങ്ങളുടെ ക്രെഡിറ്റ് പരിധിയെ മറികടക്കുമെന്ന് തോന്നുന്നു. മറ്റൊരു കാർഡ് പരീക്ഷിക്കുക.
charge-exceeds-source-limit = ഈ ഇടപാട് നിങ്ങളുടെ ദൈനംദിന ക്രെഡിറ്റ് പരിധിയെ മറികടക്കുമെന്ന് തോന്നുന്നു. മറ്റൊരു കാർഡ് അല്ലെങ്കിൽ 24 മണിക്കൂറിനുള്ളിൽ ശ്രമിക്കുക.
instant-payouts-unsupported = നിങ്ങളുടെ ഡെബിറ്റ് കാർഡ് തൽക്ഷണ പേയ്‌മെന്റുകൾക്കായി സജ്ജമാക്കിയിട്ടില്ലെന്ന് തോന്നുന്നു. മറ്റൊരു ഡെബിറ്റ് അല്ലെങ്കിൽ ക്രെഡിറ്റ് കാർഡ് പരീക്ഷിക്കുക.
duplicate-transaction = ഉം. സമാനമായ ഒരു ഇടപാട് ഇപ്പോൾ അയച്ചതായി തോന്നുന്നു. നിങ്ങളുടെ പേയ്‌മെന്റ് ചരിത്രം പരിശോധിക്കുക.
coupon-expired = ആ പ്രൊമോ കോഡ് കാലഹരണപ്പെട്ടതായി തോന്നുന്നു.
card-error = നിങ്ങളുടെ ഇടപാട് പ്രോസസ്സ് ചെയ്യാൻ കഴിഞ്ഞില്ല. നിങ്ങളുടെ ക്രെഡിറ്റ് കാർഡ് വിവരങ്ങൾ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.
product-plan-error =
    .title = പ്ലാനുകൾ ലോഡ്‌ ചെയ്യുന്നതില്‍ തകരാര്‍
product-profile-error =
    .title = രൂപരേഖ ലഭ്യമാക്കുന്നതിൽ കുഴപ്പമുണ്ടായി
product-customer-error =
    .title = ഉപയോക്താവുവിശദാംശങ്ങൾ ലഭ്യമാക്കുന്നതിലൊരു കുഴപ്പമുണ്ടായി
product-plan-not-found = പ്ലാൻ കണ്ടെത്തിയില്ല.

## Hooks - coupons


## Routes - Checkout - New user

new-user-submit = വരിക്കാരാവുക

## Routes - Product and Subscriptions


## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate


## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.


## Routes - Product - Subscription upgrade

sub-update-current-plan-label = നിലവിലെ പ്ലാൻ
sub-update-new-plan-label = പുതിയ പ്ലാൻ
sub-update-total-label = പുതിയ ആകെത്തുക

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)


## Routes - Subscriptions - Cancel

sub-item-cancel-sub = സബ്സ്ക്രിപ്ഷൻ റദ്ദാക്കുക
sub-item-stay-sub = വരിക്കാരനായിയിരിക്കുക

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access


## Routes - Subscription

sub-route-idx-reactivating = സബ്‌സ്‌ക്രിപ്‌ഷൻ വീണ്ടും സജീവമാക്കുന്നത് പരാജയപ്പെട്ടു
sub-route-idx-cancel-failed = സബ്‌സ്‌ക്രിപ്‌ഷൻ റദ്ദാക്കുന്നത് പരാജയപ്പെട്ടു
sub-route-idx-contact = പിന്തുണയെ ബന്ധപ്പെടുക
sub-route-idx-cancel-msg-title = നിങ്ങൾ പോകുന്നതിൽ ഞങ്ങൾക്ക് വിഷമമുണ്ട്

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = ഉപഭോക്താവിനെ ലോഡുചെയ്യുന്നതിൽ പ്രശ്‌നം
sub-billing-update-success = നിങ്ങളുടെ ബില്ലിംഗ് വിവരങ്ങൾ വിജയകരമായി അപ്‌ഡേറ്റുചെയ്‌തു

## Routes - Subscription - ActionButton

pay-update-change-btn = മാറ്റങ്ങള്‍

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.


## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

sub-route-idx-updating = ബില്ലിംഗ് വിവരങ്ങൾ അപ്‌ഡേറ്റുചെയ്യുന്നു…

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = ഈ സബ്‌സ്‌ക്രിപ്‌ഷനായി അത്തരം പദ്ധതികളൊന്നുമില്ല.

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-button = വീണ്ടും വരിക്കാരാവുക

## $date (Date) - Last day of product access

reactivate-success-copy = നന്ദി! നിങ്ങൾ എല്ലാം സജ്ജമാക്കി.
reactivate-success-button = അടയ്ക്കുക

## Routes - Subscriptions - Subscription iap item

sub-iap-item-manage-button = കൈകാര്യം ചെയ്യുക
