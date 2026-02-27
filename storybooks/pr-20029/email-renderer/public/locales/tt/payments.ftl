# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Хисапның баш бите
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Промо-код кулланылды
coupon-submit = Куллану
coupon-remove = Бетерү
coupon-error = Керелгән код хаталы яки аның вакыты чыккан.
coupon-error-generic = Кодны эшкәртүдә хата килеп чыкты. Зинһар янәдән тырышып карагыз.
coupon-error-expired = Кертелгән кодның вакыты чыккан.
coupon-error-limit-reached = Кертелгән код куллану чигенә җитте.
coupon-error-invalid = Кертелгән код хаталы.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Кодны кертү

## Component - Fields

default-input-error = Бу кыр кирәкле
input-error-is-required = { $label } кирәк

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } логотибы

## Component - NewUserEmailForm

new-user-sign-in-link-2 = { -product-mozilla-account } хисабыгыз бармы инде? <a>Керү</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Эл. почтагызны кертегез
new-user-confirm-email =
    .label = Эл. почтагызны раслагыз
new-user-subscribe-product-updates-mozilla = Мин { -brand-mozilla } җибәргән яңалыклардан хәбәрдар булырга телим
new-user-subscribe-product-updates-snp = Мин { -brand-mozilla } җибәргән куркынычсызлык һәм хосусыйлык яңалыкларыннан һәм яңартулардан хәбәрдар булырга телим
new-user-email-validate = Эл. почта адресы яраклы түгел
new-user-email-validate-confirm = Эл. почта адреслары бер-берсенә туры килми
new-user-already-has-account-sign-in = Сезнең хисабыгыз бар инде. <a>Керү</a>

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Рәхмәт!
payment-confirmation-thanks-heading-account-exists = Рәхмәт, ә хәзер эл. почтагызны тикшерегез!
payment-confirmation-order-heading = Заказ нечкәлекләре
payment-confirmation-invoice-number = Квитанция №{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Түләү турындагы мәгълүмат
payment-confirmation-amount = { $amount } / { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] Көнгә { $amount }
       *[other] { $intervalCount } көн саен { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] Атнага { $amount }
       *[other] { $intervalCount } атна саен { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] Айга { $amount }
       *[other] { $intervalCount } ай саен { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] Елга { $amount }
       *[other] { $intervalCount } ел саен { $amount }
    }
payment-confirmation-download-button = Йөкләүне дәвам итү

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView

payment-error-retry-button = Янәдән тырышып карау
payment-error-manage-subscription-button = Минем язылу белән идарә итү

## Component - PaymentErrorView - IAP upgrade errors

iap-upgrade-get-help-button = Ярдәм алу

## Component - PaymentForm

payment-name =
    .placeholder = Тулы исем
    .label = Исемегез картагызда язылганча
payment-cc =
    .label = Сезнең карта
payment-cancel-btn = Баш тарту
payment-update-btn = Яңарту
payment-pay-btn = Хәзер үк түләү
payment-pay-with-paypal-btn-2 = { -brand-paypal } белән түләү
payment-validate-name-error = Зинһар, исемегезне кертегез

## Component - PaymentLegalBlurb

payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } хосусыйлык сәясәте</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Түләү ысулын сайлагыз
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }

## Component - PaymentProcessing

payment-processing-message = Сезнең түләү эшкәртелә. Зинһар, көтегез…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = { $last4 } белән тәмамланучы карта

## Component - PayPalButton

pay-with-heading-paypal-2 = { -brand-paypal } белән түләү

## Component - PlanDetails

plan-details-header = Продукт нечкәлекләре
plan-details-list-price = Бәяләр исемлеге
plan-details-show-button = Нечкәлекләрен күрсәтү
plan-details-hide-button = Нечкәлекләрен яшерү
plan-details-total-label = Барлыгы
plan-details-tax = Салымнар һәм түләүләр

## Component - PlanErrorDialog

product-no-such-plan = Әлеге продукт өчен андый план юк.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } салым

## Component - SubscriptionTitle

subscription-create-title = Язылуларыгызны көйләү
subscription-success-title = Язылуны раслау
subscription-processing-title = Язылуны раслау…
subscription-error-title = Язылуны раслау хатасы…
subscription-noplanchange-title = Абунә планындагы мондый үзгәреш мөмкин түгел
subscription-iapsubscribed-title = Инде язылган
sub-guarantee = 30 көн эчендә акчаны кире кайтару гарантиясе

## Component - TermsAndPrivacy

terms = Куллану Шартлары
privacy = Хосусыйлык сәясәте
terms-download = Куллану шартларын йөкләп алу

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Хисап язмалары
# General aria-label for closing modals
close-aria =
    .aria-label = Тәрәзәне ябу
settings-subscriptions-title = Язылулар
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Промо-код

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = Гомуми кушымта хатасы
basic-error-message = Нидер булды. Зинһар соңрак тырышып карагыз.
payment-error-2 = Хмм. Түләвегезне раслаганда проблема килеп чыкты. Картаны чыгаручы белән элемтәгә керегез.
payment-error-3b = Түләүне эшкәрткәндә  көтелмәгән хата килеп чыкты, зинһар янәдән тырышып карагыз.
expired-card-error = Кредит картагызның вакыты чыккан, ахрысы. Башка карта кулланып карагыз.
insufficient-funds-error = Картагызда акча җитәрлек түгел ахрысы. Башка картаны кулланып карагыз.
withdrawal-count-limit-exceeded-error = Бу транзакция Сезнең кредит лимитыннан артып китәр кебек. Башка картаны кулланып карагагыз.
charge-exceeds-source-limit = Бу транзакция сезнең көндәлек кредит лимитыннан артып китәр кебек. 24 сәгатьтән соң яки башка картаны сынап карагыз.
currency-currency-mismatch = Гафу. Валюталарны алмаштыра алмыйсыз.
no-subscription-change = Гафу. Язылу планыгызны үзгәртә алмыйсыз.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Сез инде { $mobileAppStore } аша язылгансыз.
product-plan-error =
    .title = Планнарны йөкләгәндә хата китте
product-profile-error =
    .title = Профильне йөкләгәндә хата китте
product-customer-error =
    .title = Кулланучыны йөкләгәндә хата китте
product-plan-not-found = План табылмады

## Hooks - coupons


## Routes - Checkout - New user

new-user-card-title = Кредит картагызның язуларын кертегез
new-user-submit = Хәзер үк язылу

## Routes - Product and Subscriptions

sub-update-payment-title = Түләү турында мәгълүмат

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Карта белән түләү

## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Үзгәртүләрегезне күздән кичерегез
sub-change-failed = Планны үзгәртү уңышсыз тәмамланды
sub-change-submit = Үзгәртүне раслау
sub-update-current-plan-label = Хәзерге план
sub-update-new-plan-label = Яңа план
sub-update-total-label = Яңа сумма
sub-update-prorated-upgrade = Пропорциональ яңарту

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (көндәлек)
sub-update-new-plan-weekly = { $productName } (атналык)
sub-update-new-plan-monthly = { $productName } (айлык)
sub-update-new-plan-yearly = { $productName } (еллык)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Язылудан баш тарту
sub-item-stay-sub = Язылуда калу

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Исәп-хисапның соңгы көне булган { $period }
    көненнән соң { $name } продуктын куллана алмаячаксыз.

## Routes - Subscription

sub-route-idx-reactivating = Язылуны яңадан активләштерү уңышсыз тәмамланды
sub-route-idx-cancel-failed = Язылудан баш тарту уңышсыз тәмамланды
sub-route-idx-contact = Ярдәм хезмәтенә мөрәҗәгать итү
sub-route-idx-cancel-msg-title = Сезнең белән саубуллашу кызганыч

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Кулланучыны йөкләгәндә хата китте
sub-invoice-error =
    .title = Квитанцияләрне йөкләгәндә хата китте
sub-billing-update-success = Түләү турындагы мәгълүматларыгызны яңарту уңышлы узды

## Routes - Subscription - ActionButton

pay-update-change-btn = Үзгәртү
pay-update-manage-btn = Идарә итү

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-expires-on = Вакыты чыга: { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Вакыты чыга: { $expirationDate }
sub-route-idx-updating = Түләү турындагы мәгълүматны яңарту…
sub-route-payment-modal-heading = Яраксыз хисап бирү мәгълүматы
sub-route-missing-billing-agreement-payment-alert = Яраксыз түләү мәгълүматы; хисабыгызга бәйле бер проблема бар. <div>Хәл итү</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Әлеге язылу өчен андый план юк.
invoice-not-found = Киләсе квитанция табылмады
sub-item-no-such-subsequent-invoice = Бу язылу өчен киләсе квитанция табылмады.

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = { $name } продуктын куллануны дәвам итәсегез киләме?
reactivate-confirm-button = Яңадан язылу

## $date (Date) - Last day of product access

reactivate-success-copy = Рәхмәт! Сезнең өчен барысы да әзер.
reactivate-success-button = Ябу

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Кушымта эчендә сатып алу
sub-iap-item-apple-purchase-2 = { -brand-apple }: Кушымта эчендә сатып алу
sub-iap-item-manage-button = Идарә итү
