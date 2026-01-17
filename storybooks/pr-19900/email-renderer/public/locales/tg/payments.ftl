# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Саҳифаи асосии ҳисоб
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Рамзи таблиғотӣ татбиқ карда шуд
coupon-submit = Татбиқ кардан
coupon-remove = Тоза кардан
coupon-error = Рамзе, ки шумо ворид кардед, нодуруст аст ё аз муҳлаташ гузашт.
coupon-error-generic = Ҳангоми коркарди рамз хато ба миён омад. Лутфан, аз нав кӯшиш кунед.
coupon-error-expired = Рамзе, ки шумо ворид кардед, аз муҳлаташ гузашт.
coupon-error-limit-reached = Рамзе, ки шумо ворид кардед, аз меъёраш зиёд истифода шуд.
coupon-error-invalid = Рамзе, ки шумо ворид кардед, нодуруст аст.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Рамзро ворид кунед

## Component - Fields

default-input-error = Ин майдон ҳатмӣ аст.
input-error-is-required = { $label } ҳатмӣ аст

## Component - Header

brand-name-mozilla-logo = Тамғаи «{ -brand-mozilla }»

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Аллакай «{ -product-mozilla-account }» доред? <a>Ворид шавед</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Почтаи электронии худро ворид кунед
new-user-confirm-email =
    .label = Почтаи электронии худро тасдиқ кунед
new-user-subscribe-product-updates-mozilla = Ман мехоҳам, ки аз «{ -brand-mozilla }» дар бораи маҳсулот хабарҳо ва навигариҳоро қабул кунам
new-user-subscribe-product-updates-snp = Ман мехоҳам, ки аз «{ -brand-mozilla }» дар бораи амният ва махфият хабарҳо ва навигариҳоро қабул кунам
new-user-subscribe-product-updates-hubs = Ман мехоҳам, ки аз «{ -product-mozilla-hubs }» ва «{ -brand-mozilla }» дар бораи маҳсулот хабарҳо ва навигариҳоро қабул кунам
new-user-subscribe-product-updates-mdnplus = Ман мехоҳам, ки аз «{ -product-mdn-plus }» ва «{ -brand-mozilla }» дар бораи маҳсулот хабарҳо ва навигариҳоро қабул кунам
new-user-email-validate = Нишонии почтаи электронӣ эътибор надорад
new-user-email-validate-confirm = Нишониҳои почтаи электронӣ мувофиқат намекунанд
new-user-already-has-account-sign-in = Шумо аллакай ҳисоб доред. <a>Ворид шавед</a>

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Ташаккур!
payment-confirmation-thanks-heading-account-exists = Ташаккур, акнун почтаи электронии худро тафтиш кунед!
payment-confirmation-order-heading = Тафсилоти фармоиш
payment-confirmation-invoice-number = Санади дархости пардохт №{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Маълумоти пардохт
payment-confirmation-amount = { $amount } барои ҳар { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } барои ҳар рӯз
       *[other] { $amount } барои ҳар { $intervalCount } рӯз
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } барои ҳар ҳафта
       *[other] { $amount } барои ҳар { $intervalCount } ҳафта
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } барои ҳар моҳ
       *[other] { $amount } барои ҳар { $intervalCount } моҳ
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } барои ҳар сол
       *[other] { $amount } барои ҳар { $intervalCount } сол
    }
payment-confirmation-download-button = Идома додани боргирӣ

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView

payment-error-retry-button = Аз нав кӯшиш кардан
payment-error-manage-subscription-button = Идоракунии обунаи ман

## Component - PaymentErrorView - IAP upgrade errors

iap-upgrade-get-help-button = Гирифтани кумак

## Component - PaymentForm

payment-name =
    .placeholder = Номи пурра
    .label = Номе, ки дар корти шумо чоп шудааст
payment-cc =
    .label = Корти шумо
payment-cancel-btn = Бекор кардан
payment-update-btn = Навсозӣ кардан
payment-pay-btn = Ҳозир пардохт кунед
payment-pay-with-paypal-btn-2 = Бо «{ -brand-paypal }» пардохт кунед
payment-validate-name-error = Лутфан, номи худро ворид намоед

## Component - PaymentLegalBlurb

payment-legal-link-paypal-3 = <paypalPrivacyLink>Сиёсати махфияти «{ -brand-paypal }»</paypalPrivacyLink>
payment-legal-link-stripe-3 = <stripePrivacyLink>Сиёсати махфияти «{ -brand-name-stripe }»</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Тарзи пардохти худро интихоб кунед
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Аввал шумо бояд обунаи худро тасдиқ кунед

## Component - PaymentProcessing


## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Корте, ки бо { $last4 } анҷом меёбад

## Component - PayPalButton

pay-with-heading-paypal-2 = Бо «{ -brand-paypal }» пардохт кунед

## Component - PlanDetails

plan-details-header = Тафсилоти маҳсул
plan-details-list-price = Нархнома
plan-details-show-button = Намоиш додани тафсилот
plan-details-hide-button = Пинҳон кардани тафсилот
plan-details-total-label = Ҳамагӣ
plan-details-tax = Андозҳо ва ҳаққи хизматрасонӣ

## Component - PlanErrorDialog

product-no-such-plan = Барои ин маҳсул чунин нақша вуҷуд надорад.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } андоз
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } барои ҳар рӯз
       *[other] { $priceAmount } барои ҳар { $intervalCount } рӯз
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } барои ҳар рӯз
           *[other] { $priceAmount } барои ҳар { $intervalCount } рӯз
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } барои ҳар ҳафта
       *[other] { $priceAmount } барои ҳар { $intervalCount } ҳафта
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } барои ҳар ҳафта
           *[other] { $priceAmount } барои ҳар { $intervalCount } ҳафта
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } барои ҳар моҳ
       *[other] { $priceAmount } барои ҳар { $intervalCount } моҳ
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } барои ҳар моҳ
           *[other] { $priceAmount } барои ҳар { $intervalCount } моҳ
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } барои ҳар сол
       *[other] { $priceAmount } барои ҳар { $intervalCount } сол
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } барои ҳар сол
           *[other] { $priceAmount } барои ҳар { $intervalCount } сол
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як рӯз
       *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } рӯз
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як рӯз
           *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } рӯз
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як ҳафта
       *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } ҳафта
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як ҳафта
           *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } ҳафта
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як моҳ
       *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } моҳ
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як моҳ
           *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } моҳ
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як сол
       *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } сол
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як сол
           *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } сол
        }

## Component - SubscriptionTitle

subscription-create-title = Обунаи худро танзим кунед
subscription-success-title = Тасдиқи обуна
subscription-processing-title = Дар ҳоли тасдиқи обуна…
subscription-error-title = Хатои тасдиқи обуна…
subscription-noplanchange-title = Ин тағйироти нақшаи обуна дастгирӣ намешавад
subscription-iapsubscribed-title = Аллакай обуна шудааст
sub-guarantee = Кафолати 30-рӯза барои бозпардохти маблағи шумо

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Шартҳои хизматрасонӣ
privacy = Огоҳномаи махфият
terms-download = Шартҳои боргирӣ

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Ҳисобҳои «Firefox»
# General aria-label for closing modals
close-aria =
    .aria-label = Пӯшидани равзанаи зоҳирӣ
settings-subscriptions-title = Обунаҳо
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Рамзи таблиғотӣ

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } барои ҳар рӯз
       *[other] { $amount } барои ҳар { $intervalCount } рӯз
    }
    .title =
        { $intervalCount ->
            [one] { $amount } барои ҳар рӯз
           *[other] { $amount } барои ҳар { $intervalCount } рӯз
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } барои ҳар ҳафта
       *[other] { $amount } барои ҳар { $intervalCount } ҳафта
    }
    .title =
        { $intervalCount ->
            [one] { $amount } барои ҳар ҳафта
           *[other] { $amount } барои ҳар { $intervalCount } ҳафта
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } барои ҳар моҳ
       *[other] { $amount } барои ҳар { $intervalCount } моҳ
    }
    .title =
        { $intervalCount ->
            [one] { $amount } барои ҳар моҳ
           *[other] { $amount } барои ҳар { $intervalCount } моҳ
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } барои ҳар сол
       *[other] { $amount } барои ҳар { $intervalCount } сол
    }
    .title =
        { $intervalCount ->
            [one] { $amount } барои ҳар сол
           *[other] { $amount } барои ҳар { $intervalCount } сол
        }

## Error messages

# App error dialog
general-error-heading = Хатои умумии барнома
basic-error-message = Чизе нодуруст иҷро шуд. Лутфан, баъдтар аз нав кӯшиш кунед.
expired-card-error = Чунин ба назар мерасад, ки муҳлати эътибории корти бонкии шумо ба охир расидааст. Корти дигареро кӯшиш кунед.
insufficient-funds-error = Чунин ба назар мерасад, ки корти бонкии шумо маблағи кофӣ надорад. Корти дигареро кӯшиш кунед.
coupon-expired = Чунин ба назар мерасад, ки муҳлати рамзи таблиғотӣ ба анҷом расид.
product-plan-error =
    .title = Мушкилии боркунии нақшаҳо
product-profile-error =
    .title = Мушкилии боркунии профил
product-customer-error =
    .title = Мушкилии боркунии муштарӣ
product-plan-not-found = Нақша ёфт нашуд
product-location-unsupported-error = Ҷойгиршавӣ дастгирӣ намешавад

## Hooks - coupons


## Routes - Checkout - New user

new-user-step-1-2 = 1. «{ -product-mozilla-account }»-ро эҷод кунед
new-user-card-title = Маълумоти корти худро ворид кунед
new-user-submit = Ҳозир обуна шавед

## Routes - Product and Subscriptions

sub-update-payment-title = Маълумоти пардохт

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Бо корт пардохт кунед
product-invoice-preview-error-title = Мушкилии боркунии пешнамоиши санади дархости пардохт
product-invoice-preview-error-text = Пешнамоиши санади дархости пардохт бор карда нашуд

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Айни ҳол мо ҳисоби шуморо такмил дода наметавонем

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Дукони «{ -google-play }»
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Тағйироти худро аз назар гузаронед
sub-change-failed = Ивази нақша иҷро нашуд
sub-change-submit = Тағйиротро тасдиқ кунед
sub-update-current-plan-label = Нақшаи ҷорӣ
sub-update-new-plan-label = Нақшаи нав

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (Барои ҳар рӯз)
sub-update-new-plan-weekly = { $productName } (Барои ҳар ҳафта)
sub-update-new-plan-monthly = { $productName } (Барои ҳар моҳ)
sub-update-new-plan-yearly = { $productName } (Барои ҳар сол)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Бекор кардани обуна

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access


## Routes - Subscription

sub-route-idx-contact = Дастаи дастгирии корбарон

## Routes - Subscriptions - Errors

sub-invoice-error =
    .title = Мушкилии боркунии санадҳои дархости пардохт
sub-invoice-previews-error-title = Мушкилии боркунии пешнамоиши санадҳои дархости пардохт
sub-invoice-previews-error-text = Пешнамоиши санадҳои дархости пардохт бор карда нашуд

## Routes - Subscription - ActionButton

pay-update-change-btn = Тағйир додан
pay-update-manage-btn = Идора кардан

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-expires-on = Анҷоми муҳлат дар { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Муҳлаташ дар { $expirationDate } ба анҷом мерасад
sub-route-idx-updating = Дар ҳоли навсозии маълумоти санади ҳисоббарорӣ…
sub-route-payment-modal-heading = Маълумоти санади ҳисоббарорӣ беэътибор аст

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Барои ин обуна чунин нақша вуҷуд надорад.

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-button = Аз нав обуна шавед

## $date (Date) - Last day of product access

reactivate-success-copy = Ташаккур! Шумо ҳамаи қадамҳоро иҷро кардед.
reactivate-success-button = Пӯшидан

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Харид дар дохили барнома
sub-iap-item-apple-purchase-2 = { -brand-apple }: Харид дар дохили барнома
sub-iap-item-manage-button = Идора кардан
