# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Почетна страница налога

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Промотивни код је примењен
coupon-submit = Примени
coupon-remove = Уклони
coupon-error = Код који сте унели је неважећи или истекао.
coupon-error-generic = Дошло је до грешке при обради код. Покушајте поново касније.
coupon-error-expired = Код који сте унели је истекао.
coupon-error-limit-reached = Код који сте унели је достигао ограничење.
coupon-error-invalid = Код који сте унели је неважећи.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Унеси код

## Component - Fields

default-input-error = Ово поље је обавезно
input-error-is-required = { $label } је обавезно

## Component - Header


## Component - NewUserEmailForm

# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Унесите вашу е-адресу
new-user-confirm-email =
    .label = Потврди адресу е-поште
new-user-subscribe-product-assurance = Користимо само вашу е-пошту да направимо ваш налог. Никада је нећемо продати трећој страни.
new-user-email-validate = Е-пошта није важећа
new-user-email-validate-confirm = Е-поште се не подударају
new-user-already-has-account-sign-in = Већ имате налог. <a>Пријавите се</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Нетачно унета адреса? { $domain } не нуди е-поште.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Хвала!
payment-confirmation-thanks-heading-account-exists = Хвала, сада проверите вашу е-пошту!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Е-порука са потврдом је послана на { $email } са детаљима о томе како да почнете да користите { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Добићете е-поруку на { $email } са упутствима за подешавање налога и детаљима о плаћању.
payment-confirmation-order-heading = Детаљи поруџбине
payment-confirmation-invoice-number = Рачун #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Подаци о плаћању
payment-confirmation-amount = { $amount } по { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } дневно
        [few] { $amount } свака { $intervalCount } дана
       *[other] { $amount } сваких { $intervalCount } дана
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } недељно
        [few] { $amount } сваке { $intervalCount } недеље
       *[other] { $amount } сваких { $intervalCount } недеља
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } месечно
        [few] { $amount } свака { $intervalCount } месеца
       *[other] { $amount } сваких { $intervalCount } месеци
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } годишње
        [few] { $amount } сваке { $intervalCount } године
       *[other] { $amount } сваких { $intervalCount } година
    }
payment-confirmation-download-button = Идите на преузимање

## Component - PaymentConsentCheckbox

payment-confirm-checkbox-error = Прихватите ово да бисте наставили

## Component - PaymentErrorView

payment-error-retry-button = Покушај поново
payment-error-manage-subscription-button = Управљај претплатом

## Component - PaymentErrorView - IAP upgrade errors

iap-upgrade-no-bundle-support = Сада нисмо у могућности да надоградимо на ове претплате, али радимо на томе.
iap-upgrade-contact-support = Овај производ вам је и даље доступан — контактирајте подршку да вам помогне.
iap-upgrade-get-help-button = Потражите помоћ

## Component - PaymentForm

payment-name =
    .placeholder = Пуно име
    .label = Приказано име на картици
payment-cc =
    .label = Ваша картица
payment-cancel-btn = Откажи
payment-update-btn = Ажурирај
payment-pay-btn = Плати сад
payment-validate-name-error = Унесите ваше име

## Component - PaymentLegalBlurb

payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } политика приватности</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Изаберите начин плаћања
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Прво ћете морати да одобрите вашу претплату

## Component - PaymentProcessing

payment-processing-message = Сачекајте док обрадимо вашу уплату…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Картица завршава са { $last4 }

## Component - PayPalButton


## Component - PlanDetails

plan-details-header = Детаљи производа
plan-details-list-price = Ценовник
plan-details-show-button = Прикажи детаље
plan-details-hide-button = Сакриј детаље
plan-details-total-label = Укупно
plan-details-tax = Порези и надокнаде

## Component - PlanErrorDialog

product-no-such-plan = Не постоји такав план за овај производ.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } пореза
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } сваки { $intervalCount } дан
        [few] { $priceAmount } свака { $intervalCount } дана
       *[other] { $priceAmount } сваких { $intervalCount } дана
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } сваки { $intervalCount } дан
            [few] { $priceAmount } свака { $intervalCount } дана
           *[other] { $priceAmount } сваких { $intervalCount } дана
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } сваку { $intervalCount } недељу
        [few] { $priceAmount } сваке { $intervalCount } недеље
       *[other] { $priceAmount } сваких { $intervalCount } недеља
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } сваку { $intervalCount } недељу
            [few] { $priceAmount } сваке { $intervalCount } недеље
           *[other] { $priceAmount } сваких { $intervalCount } недеља
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } сваки { $intervalCount } месец
        [few] { $priceAmount } свака { $intervalCount } месеца
       *[other] { $priceAmount } сваких { $intervalCount } месеци
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } сваки { $intervalCount } месец
            [few] { $priceAmount } свака { $intervalCount } месеца
           *[other] { $priceAmount } сваких { $intervalCount } месеци
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } сваку { $intervalCount } годину
        [few] { $priceAmount } сваке { $intervalCount } године
       *[other] { $priceAmount } сваких { $intervalCount } година
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } сваку { $intervalCount } годину
            [few] { $priceAmount } сваке { $intervalCount } године
           *[other] { $priceAmount } сваких { $intervalCount } година
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } пореза сваки { $intervalCount } дан
        [few] { $priceAmount } + { $taxAmount } пореза свака { $intervalCount } дана
       *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } дана
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } пореза сваки { $intervalCount } дан
            [few] { $priceAmount } + { $taxAmount } пореза свака { $intervalCount } дана
           *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } дана
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } пореза сваку { $intervalCount } недељу
        [few] { $priceAmount } + { $taxAmount } пореза сваке { $intervalCount } недеље
       *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } недеља
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } пореза сваку { $intervalCount } недељу
            [few] { $priceAmount } + { $taxAmount } пореза сваке { $intervalCount } недеље
           *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } недеља
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } пореза сваки { $intervalCount } месец
        [few] { $priceAmount } + { $taxAmount } пореза свака { $intervalCount } месеца
       *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } месеци
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } пореза сваки { $intervalCount } месец
            [few] { $priceAmount } + { $taxAmount } пореза свака { $intervalCount } месеца
           *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } месеци
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } пореза сваку { $intervalCount } годину
        [few] { $priceAmount } + { $taxAmount } пореза сваке { $intervalCount } године
       *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } година
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } пореза сваку { $intervalCount } годину
            [few] { $priceAmount } + { $taxAmount } пореза сваке { $intervalCount } године
           *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } година
        }

## Component - SubscriptionTitle

subscription-create-title = Подесите вашу претплату
subscription-success-title = Потврда претплате
subscription-processing-title = Потврђујемо претплату…
subscription-error-title = Грешка при потврди претплате…
subscription-noplanchange-title = Ова промена плана претплате није подржана
subscription-iapsubscribed-title = Већ сте претплаћени
sub-guarantee = 30-дневна гаранција поврата новца

## Component - TermsAndPrivacy

terms = Услови коришћења
privacy = Обавештење о приватности
terms-download = Услови преузимања

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox налози
# General aria-label for closing modals
close-aria =
    .aria-label = Затвори модал
settings-subscriptions-title = Претплате
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Промотивни код

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } сваки { $intervalCount } дан
        [few] { $amount } свака { $intervalCount } дана
       *[other] { $amount } сваких { $intervalCount } дана
    }
    .title =
        { $intervalCount ->
            [one] { $amount } сваки { $intervalCount } дан
            [few] { $amount } свака { $intervalCount } дана
           *[other] { $amount } сваких { $intervalCount } дана
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } сваку { $intervalCount } недељу
        [few] { $amount } сваке { $intervalCount } недеље
       *[other] { $amount } сваких { $intervalCount } недеља
    }
    .title =
        { $intervalCount ->
            [one] { $amount } сваку { $intervalCount } недељу
            [few] { $amount } сваке { $intervalCount } недеље
           *[other] { $amount } сваких { $intervalCount } недеља
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } сваки { $intervalCount } месец
        [few] { $amount } свака { $intervalCount } месеца
       *[other] { $amount } сваких { $intervalCount } месеци
    }
    .title =
        { $intervalCount ->
            [one] { $amount } сваки { $intervalCount } месец
            [few] { $amount } свака { $intervalCount } месеца
           *[other] { $amount } сваких { $intervalCount } месеци
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } сваку { $intervalCount } годину
        [few] { $amount } сваке { $intervalCount } године
       *[other] { $amount } сваких { $intervalCount } година
    }
    .title =
        { $intervalCount ->
            [one] { $amount } сваку { $intervalCount } годину
            [few] { $amount } сваке { $intervalCount } године
           *[other] { $amount } сваких { $intervalCount } година
        }

## Error messages

# App error dialog
general-error-heading = Општа грешка апликације
basic-error-message = Нешто није у реду. Покушајте поново касније.
payment-error-1 = Дошло је до проблема приликом одобравања плаћања. Покушајте поново или контактирајте издавача картице.
payment-error-2 = Дошло је до проблема приликом одобравања плаћања. Контактирајте издавача картице.
payment-error-3b = Дошло је до неочекиване грешке приликом обраде ваше уплате. Покушајте поново касније.
expired-card-error = Изгледа да је ваша кредитна картица истекла. Покушајте са другом.
insufficient-funds-error = Изгледа да је стање на вашој кредитној картици недовољно. Покушајте са другом.
withdrawal-count-limit-exceeded-error = Изгледа да ће ова трансакција премашити ограничење ваше картице. Покушајте са другом.
charge-exceeds-source-limit = Изгледа да ће ова трансакција премашити дневно ограничење ваше картице. Покушајте са другом или поново након 24 сата.
instant-payouts-unsupported = Изгледа да ваша дебитна картица није подешена за тренутна плаћања. Покушајте са другом или кредитном картицом.
duplicate-transaction = Изгледа да је идентична трансакција управо послана. Проверите вашу историју плаћања.
coupon-expired = Изгледа да је тај промотивни код истекао.
card-error = Ваша трансакција није могла бити обрађена. Проверите податке ваше кредитне картице и покушајте поново.
country-currency-mismatch = Валута ове претплате не вреди за земљу повезану са вашим плаћањем.
currency-currency-mismatch = Жао нам је. Не можете да мењате валуте.
no-subscription-change = Жао нам је. Не можете да мењате план претплате.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Већ сте претплаћени преко { $mobileAppStore }-а.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Пријава на { $productName } није успела због системске грешке. Ваш начин плаћања није наплаћен. Покушајте поново.
fxa-post-passwordless-sub-error = Претплата је потврђена, али страница за потврду се није учитала. Проверите вашу адресу е-поште да подесите налог.
newsletter-signup-error = Нисте претплаћени на е-поруке о ажурирању производа. Можете да покушате поново у подешавањима налога.
product-plan-error =
    .title = Проблем при учитавању планова
product-profile-error =
    .title = Проблем при учитавању профила
product-customer-error =
    .title = Проблем при учитавању купца
product-plan-not-found = План није пронађен

## Hooks - coupons

coupon-success = Ваш план ће се аутоматски обновити по основној цени.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Ваш план ће се аутоматски обновити после { $couponDurationDate } по основној цени.

## Routes - Checkout - New user

new-user-card-title = Унесите податке са картице
new-user-submit = Претплати се

## Routes - Product and Subscriptions

sub-update-payment-title = Подаци о плаћању

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Платите картицом
product-invoice-preview-error-title = Проблем при учитавању прегледа рачуна
product-invoice-preview-error-text = Није могуће учитати преглед рачуна

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Још не можемо да вас надоградимо

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.


## Routes - Product - Subscription upgrade

product-plan-change-heading = Прегледајте промену
sub-change-failed = Промена плана није успела
sub-change-submit = Потврди промене
sub-update-current-plan-label = Тренутни план
sub-update-new-plan-label = Нови план
sub-update-total-label = Нови укупни износ

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)


## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Откажи претплату
sub-item-stay-sub = Задржи претплату

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Више нећете моћи да користите { $name } након
    { $period }, последњег дана вашег обрачунског циклуса.
sub-item-cancel-confirm =
    Откажи мој приступ и сачуване податке на услузи
    { $name }, { $period }

## Routes - Subscription

sub-route-idx-reactivating = Поновно активирање претплате није успело
sub-route-idx-cancel-failed = Отказивање претплате није успело
sub-route-idx-contact = Контактирајте подршку
sub-route-idx-cancel-msg-title = Жао нам је што одлазите
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Ваша { $name } претплата је отказана.
          <br />
          Још увек имате приступ { $name } услузи до { $date }.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Проблем при учитавању купца
sub-invoice-error =
    .title = Проблем при учитавању рачуна
sub-billing-update-success = Ваши подаци о плаћању су успешно ажурирани
sub-invoice-previews-error-title = Проблем при учитавању прегледа рачуна
sub-invoice-previews-error-text = Није могуће учитати прегледе рачуна

## Routes - Subscription - ActionButton

pay-update-change-btn = Промени
pay-update-manage-btn = Управљај

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Следећи обрачун { $date }
sub-expires-on = Истиче { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Истиче { $expirationDate }
sub-route-idx-updating = Ажурирам податке о плаћању…
sub-route-payment-modal-heading = Неваћежи подаци о плаћању
sub-route-missing-billing-agreement-payment-alert = Неважећи подаци о плаћању; дошло је до грешке са вашим налогом. <div>Управљај</div>
sub-route-funding-source-payment-alert = Неважећи подаци о плаћању; дошло је до грешке са вашим налогом. Ово упозорење се може задржати неко време након што сте успешно ажурирали своје податке. <div>Управљај</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Не постоји такав план за ову претплату.
invoice-not-found = Накнадни рачун није пронађен
sub-item-no-such-subsequent-invoice = Накнадни рачун није пронађен за ову претплату.
sub-invoice-preview-error-title = Преглед рачуна није пронађен
sub-invoice-preview-error-text = Преглед рачуна није пронађен за ову претплату

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Желите ли и даље да користите { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Приступ на { $name } ће се наставити и циклус наплате
    и плаћања ће остати исти. Ваше следећа наплата износиће
    { $amount } на картици која завршава са { $last } на { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Приступ на { $name } ће се наставити и циклус наплате
    и плаћања ће остати исти. Ваша следећа наплата износиће
    { $amount } на { $endDate }.
reactivate-confirm-button = Поново се претплати

## $date (Date) - Last day of product access

reactivate-panel-copy = Изгубићете приступ { $name }-у <strong>{ $date }</strong>.
reactivate-success-copy = Хвала! Све је спремно.
reactivate-success-button = Затвори

## Routes - Subscriptions - Subscription iap item

sub-iap-item-manage-button = Управљај
