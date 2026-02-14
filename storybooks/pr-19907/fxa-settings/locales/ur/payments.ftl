# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout


## Component - CouponForm


## Component - Fields


## Component - Header


## Component - NewUserEmailForm


## Component - PaymentConfirmation

payment-confirmation-download-button = ڈاؤن لوڈ جاری رکھیں

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView

payment-error-retry-button = دوبارہ کوشش کریں
payment-error-manage-subscription-button = میری رکنیت منظم کریں

## Component - PaymentErrorView - IAP upgrade errors


## Component - PaymentForm

payment-cc =
    .label = آپ کا کارڈ
payment-cancel-btn = منسوخ کریں
payment-update-btn = اپڈیٹ
payment-pay-btn = ابھی ادا کریں
payment-validate-name-error = براہ مہربانی اپنا نام درج کریں

## Component - PaymentLegalBlurb


## Component - PaymentMethodHeader


## Component - PaymentProcessing


## Component - PaymentProviderDetails


## Component - PayPalButton


## Component - PlanDetails

plan-details-header = مسنوعہ کی تفصیلات
plan-details-show-button = &تفصیلات دکھائیں
plan-details-hide-button = تفصیلات چھپائیں
plan-details-total-label = کل

## Component - PlanErrorDialog

product-no-such-plan = اس مصنوعہ  کے لئے ایسا کوئی منصوبہ نہیں ہے۔

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.


## Component - SubscriptionTitle


## Component - TermsAndPrivacy

terms = خدمت کی شرائط
privacy = رازداری کا نوٹس

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox اکاؤنٹس
# General aria-label for closing modals
close-aria =
    .aria-label = موڈل بند کریں
settings-subscriptions-title = رکنیت

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = عمومی ایپلیکیشن کی خرابی
basic-error-message = کچھ غلط ہو گیا. براہ مہربانی کچھ دیر بعد کوشش کریں.
product-plan-error =
    .title = منصوبہ لوڈ کرنے میں مسلہ ہے
product-profile-error =
    .title = پروفائل لوڈ کرنے میں مسلہ ہے
product-customer-error =
    .title = صارف کو لوڈ کرنے میں مسئلہ ہے
product-plan-not-found = منصوبہ نہیں ملا

## Hooks - coupons


## Routes - Checkout - New user


## Routes - Product and Subscriptions


## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate


## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.


## Routes - Product - Subscription upgrade

sub-update-current-plan-label = موجودہ منصوبہ
sub-update-new-plan-label = نیا منصوبہ

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)


## Routes - Subscriptions - Cancel

sub-item-cancel-sub = رکنیت منسوخ کریں

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access


## Routes - Subscription

sub-route-idx-cancel-failed = رکنیت سازی  منسوخ کرنے میں ناکام ہوگیا
sub-route-idx-cancel-msg-title = ہمیں آپ کو جاتے دیکھ کر افسوس ہے  ۔

## Routes - Subscriptions - Errors


## Routes - Subscription - ActionButton

pay-update-change-btn = تبدیل کریں

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.


## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.


## Routes - Subscription - SubscriptionItem


## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = { $name }کا استعمال جاری رکھنا چاہتے ہیں؟
reactivate-confirm-button = دوبارہ رکن بنیں

## $date (Date) - Last day of product access

reactivate-success-copy = شکریہ! آپ بالکل تیار ہیں۔
reactivate-success-button = بند کریں

## Routes - Subscriptions - Subscription iap item

