# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Галоўная старонка ўліковага запісу
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Прамакод ужыты
coupon-submit = Прымяніць
coupon-remove = Выдаліць
coupon-error = Код, які вы ўвялі, несапраўдны або пратэрмінаваны.
coupon-error-generic = Здарылася памылка пры апрацоўцы кода. Калі ласка, паспрабуйце яшчэ раз.
coupon-error-expired = Тэрмін дзеяння ўведзенага вамі кода скончыўся.
coupon-error-limit-reached = Уведзены вамі код вычарпаў свой ліміт.
coupon-error-invalid = Код, які вы ўвялі, нядзейсны.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Увядзіце код

## Component - Fields

default-input-error = Гэта поле абавязковае
input-error-is-required = { $label } абавязковае

## Component - Header

brand-name-mozilla-logo = Лагатып { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Ужо маеце { -product-mozilla-account }? <a>Увайсці</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Увядзіце сваю электронную пошту
new-user-confirm-email =
    .label = Пацвердзіце сваю электронную пошту
new-user-subscribe-product-updates-mozilla = Я хачу атрымліваць навіны аб прадуктах і абнаўленні ад { -brand-mozilla }
new-user-subscribe-product-updates-snp = Я хачу атрымліваць навіны і абнаўленні па бяспецы і прыватнасці ад { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Я хачу атрымліваць навіны аб прадуктах і абнаўленні ад { -product-mozilla-hubs } і { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Я хачу атрымліваць навіны аб прадуктах і абнаўленні ад { -product-mdn-plus } і { -brand-mozilla }
new-user-subscribe-product-assurance = Мы выкарыстоўваем вашу электронную пошту толькі для стварэння вашага ўліковага запісу. Мы ніколі не прададзім яго староннім асобам.
new-user-email-validate = Адрас электроннай пошты несапраўдны
new-user-email-validate-confirm = Адрасы электроннай пошты адрозніваюцца
new-user-already-has-account-sign-in = У вас ужо ёсць уліковы запіс. <a>Увайсці</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Памылка ўводу адраса? { $domain } не прадстаўляе паслуг электроннай пошты.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Дзякуй!
payment-confirmation-thanks-heading-account-exists = Дзякуй, праверце сваю электронную пошту!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = На адрас { $email } быў адпраўлены электронны ліст з пацвярджэннем і інфармацыя аб тым, як пачаць працу з { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Вы атрымаеце электронны ліст на адрас { $email } з інструкцыямі па наладзе ўліковага запісу, а таксама плацежнымі дадзенымі.
payment-confirmation-order-heading = Падрабязнасці замовы
payment-confirmation-invoice-number = Рахунак-фактура #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Плацежная інфармацыя
payment-confirmation-amount = { $amount } за { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } штодзень
        [few] { $amount } кожныя { $intervalCount } дні
       *[many] { $amount } кожныя { $intervalCount } дзён
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } кожны { $intervalCount } тыдзень
        [few] { $amount } кожныя { $intervalCount } тыдня
       *[many] { $amount } кожныя { $intervalCount } тыдні
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } кожны { $intervalCount } месяц
        [few] { $amount } кожныя { $intervalCount } месяцы
       *[many] { $amount } кожныя { $intervalCount } месяцы
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } штогод
        [few] { $amount } кожныя { $intervalCount } гады
       *[many] { $amount } кожныя { $intervalCount } гадоў
    }
payment-confirmation-download-button = Працягнуць сцягванне

## Component - PaymentConsentCheckbox

payment-confirm-checkbox-error = Вам трэба завяршыць гэта, перш чым рухацца далей

## Component - PaymentErrorView

payment-error-retry-button = Паспрабаваць зноў
payment-error-manage-subscription-button = Кіраваць маёй падпіскай

## Component - PaymentErrorView - IAP upgrade errors

iap-upgrade-no-bundle-support = Мы не падтрымліваем абнаўленні для гэтых падпісак, але ў бліжэйшы час будзем.
iap-upgrade-contact-support = Вы ўсё яшчэ можаце атрымаць гэты прадукт — звярніцеся ў службу падтрымкі, каб мы маглі вам дапамагчы.
iap-upgrade-get-help-button = Атрымаць дапамогу

## Component - PaymentForm

payment-name =
    .placeholder = Поўнае імя
    .label = Імя, як напісана на вашай картцы
payment-cc =
    .label = Ваша картка
payment-cancel-btn = Скасаваць
payment-update-btn = Абнавіць
payment-pay-btn = Аплаціць зараз
payment-pay-with-paypal-btn-2 = Аплаціць праз { -brand-paypal }
payment-validate-name-error = Увядзіце, калі ласка, ваша імя

## Component - PaymentLegalBlurb

payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } палітыка прыватнасці</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Выберыце спосаб аплаты
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Спачатку вам трэба будзе зацвердзіць вашу падпіску

## Component - PaymentProcessing

payment-processing-message = Калі ласка, пачакайце, пакуль мы апрацуем ваш плацеж…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Карта, нумар якой заканчваецца на { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Аплаціць праз { -brand-paypal }

## Component - PlanDetails

plan-details-header = Інфармацыя аб прадукце
plan-details-list-price = Базавая цана
plan-details-show-button = Паказаць падрабязнасці
plan-details-hide-button = Схаваць падрабязнасці
plan-details-total-label = Усяго
plan-details-tax = Падаткі і зборы

## Component - PlanErrorDialog

product-no-such-plan = Няма такога плана для гэтага прадукту.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + падаткі { $taxAmount }
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } кожны { $intervalCount } дзень
        [few] { $priceAmount } кожныя { $intervalCount } дні
       *[many] { $priceAmount } кожныя { $intervalCount } дзён
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } кожны { $intervalCount } дзень
            [few] { $priceAmount } кожныя { $intervalCount } дні
           *[many] { $priceAmount } кожныя { $intervalCount } дзён
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } кожны { $intervalCount } тыдзень
        [few] { $priceAmount } кожныя { $intervalCount } тыдні
       *[many] { $priceAmount } кожныя { $intervalCount } тыдняў
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } кожны { $intervalCount } тыдзень
            [few] { $priceAmount } кожныя { $intervalCount } тыдні
           *[many] { $priceAmount } кожныя { $intervalCount } тыдняў
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } кожны { $intervalCount } месяц
        [few] { $priceAmount } кожныя { $intervalCount } месяцы
       *[many] { $priceAmount } кожныя { $intervalCount } месяцаў
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } кожны { $intervalCount } месяц
            [few] { $priceAmount } кожныя { $intervalCount } месяцы
           *[many] { $priceAmount } кожныя { $intervalCount } месяцаў
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } штогод
        [few] { $priceAmount } кожныя { $intervalCount } гады
       *[many] { $priceAmount } кожныя { $intervalCount } гадоў
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } штогод
            [few] { $priceAmount } кожныя { $intervalCount } гады
           *[many] { $priceAmount } кожныя { $intervalCount } гадоў
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } падатку кожны { $intervalCount } дзень
        [few] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } дні
       *[many] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } дзён
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } падатку кожны { $intervalCount } дзень
            [few] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } дні
           *[many] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } дзён
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } падатку кожны { $intervalCount } тыдзень
        [few] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } тыдні
       *[many] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } тыдняў
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } падатку кожны { $intervalCount } тыдзень
            [few] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } тыдні
           *[many] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } тыдняў
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } падатку кожны { $intervalCount } месяц
        [few] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } месяцы
       *[many] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } месяцаў
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } падатку кожны { $intervalCount } месяц
            [few] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } месяцы
           *[many] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } месяцаў
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } падатку штогод
        [few] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } гады
       *[many] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } гадоў
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } падатку штогод
            [few] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } гады
           *[many] { $priceAmount } + { $taxAmount } падатку кожныя { $intervalCount } гадоў
        }

## Component - SubscriptionTitle

subscription-create-title = Наладзьце падпіску
subscription-success-title = Пацверджанне падпіскі
subscription-processing-title = Пацвярджэнне падпіскі…
subscription-error-title = Памылка пацверджання падпіскі…
subscription-noplanchange-title = Змена гэтага плана падпіскі не падтрымліваецца
subscription-iapsubscribed-title = Ужо падпісаны
sub-guarantee = 30-дзённая гарантыя вяртання грошай

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Умовы абслугоўвання
privacy = Паведамленне аб прыватнасці
terms-download = Умовы сцягвання

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Уліковыя запісы Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Закрыць акно
settings-subscriptions-title = Падпіскі
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Прамакод

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } кожны { $intervalCount } дзень
        [few] { $amount } кожныя { $intervalCount } дні
       *[many] { $amount } кожныя { $intervalCount } дзён
    }
    .title =
        { $intervalCount ->
            [one] { $amount } кожны { $intervalCount } дзень
            [few] { $amount } кожныя { $intervalCount } дні
           *[many] { $amount } кожныя { $intervalCount } дзён
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } кожны { $intervalCount } тыдзень
        [few] { $amount } кожныя { $intervalCount } тыдні
       *[many] { $amount } кожныя { $intervalCount } тыдняў
    }
    .title =
        { $intervalCount ->
            [one] { $amount } кожны { $intervalCount } тыдзень
            [few] { $amount } кожныя { $intervalCount } тыдні
           *[many] { $amount } кожныя { $intervalCount } тыдняў
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } кожны { $intervalCount } месяц
        [few] { $amount } кожныя { $intervalCount } месяцы
       *[many] { $amount } кожныя { $intervalCount } месяцаў
    }
    .title =
        { $intervalCount ->
            [one] { $amount } кожны { $intervalCount } месяц
            [few] { $amount } кожныя { $intervalCount } месяцы
           *[many] { $amount } кожныя { $intervalCount } месяцаў
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } штогод
        [few] { $amount } кожныя { $intervalCount } гады
       *[many] { $amount } кожныя { $intervalCount } гадоў
    }
    .title =
        { $intervalCount ->
            [one] { $amount } штогод
            [few] { $amount } кожныя { $intervalCount } гады
           *[many] { $amount } кожныя { $intervalCount } гадоў
        }

## Error messages

# App error dialog
general-error-heading = Агульная памылка праграмы
basic-error-message = Нешта пайшло не так. Калі ласка, паспрабуйце зноў пазней.
payment-error-1 = Хм. Пры аўтарызацыі вашага плацяжу ўзнікла праблема. Паўтарыце спробу або звяжыцеся з эмітэнтам вашай карткі.
payment-error-2 = Хм. Пры аўтарызацыі вашага плацяжу ўзнікла праблема. Звяжыцеся з эмітэнтам вашай карткі.
payment-error-3b = Здарылася нечаканая памылка ў часе апрацоўкі вашага плацяжу. Калі ласка, паўтарыце спробу.
expired-card-error = Падобна на тое, што тэрмін дзеяння вашай крэдытнай карты скончыўся. Паспрабуйце іншую картку.
insufficient-funds-error = Здаецца, на вашай картцы недастаткова сродкаў. Паспрабуйце іншую картку.
withdrawal-count-limit-exceeded-error = Падобна на тое, што гэта транзакцыя прывядзе да перавышэння вашага крэдытнага ліміту. Паспрабуйце іншую карту.
charge-exceeds-source-limit = Падобна на тое, што гэта транзакцыя прывядзе да перавышэння вашага штодзённага крэдытнага ліміту. Паспрабуйце іншую карту ці пачакайце 24 гадзіны.
instant-payouts-unsupported = Падобна на тое, што ваша дэбетавая карта не прызначана для імгненных плацяжоў. Паспрабуйце іншую дэбетавую ці крэдытную карту.
duplicate-transaction = Хм. Здаецца, што толькі што была зроблена ідэнтычная транзакцыя. Праверце гісторыю сваіх плацяжоў.
coupon-expired = Здаецца, тэрмін дзеяння прома-кода скончыўся.
card-error = Ваша транзакцыя не можа быць апрацавана. Праверце даныя сваёй крэдытнай карты і паспрабуйце яшчэ раз.
country-currency-mismatch = Валюта гэтай падпіскі несапраўдная для краіны, звязанай з вашым плацяжом.
currency-currency-mismatch = Прабачце. Вы не можаце пераключацца паміж валютамі.
no-subscription-change = Прабачце. Вы не можаце змяніць свой план падпіскі.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Вы ўжо аформілі падпіску праз { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Сістэмная памылка прывяла да збою рэгістрацыі ў { $productName }. Спісанне з вашага спосабу аплаты не адбылося. Калі ласка, паспрабуйце яшчэ раз.
fxa-post-passwordless-sub-error = Падпіска пацверджана, але не ўдалося загрузіць старонку пацверджання. Праверце сваю электронную пошту, каб завяршыць наладжванне ўліковага запісу.
newsletter-signup-error = Вы не падпісаліся на лісты з навінамі пра прадукт. Вы можаце паспрабаваць яшчэ раз у наладах свайго ўліковага запісу.
product-plan-error =
    .title = Праблема загрузкі планаў
product-profile-error =
    .title = Праблема з загрузкай профілю
product-customer-error =
    .title = Праблема з загрузкай кліента
product-plan-not-found = План не знойдзены
product-location-unsupported-error = Месцазнаходжанне не падтрымліваецца

## Hooks - coupons

coupon-success = Ваш тарыфны план будзе аўтаматычна падоўжаны па базавай цане.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Ваш план будзе аўтаматычна падоўжаны пасля { $couponDurationDate } па базавай цане.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Стварыце { -product-mozilla-account }
new-user-card-title = Увядзіце даныя вашай карты
new-user-submit = Падпісацца зараз

## Routes - Product and Subscriptions

sub-update-payment-title = Плацежная інфармацыя

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Аплаціць картай
product-invoice-preview-error-title = Праблема з загрузкай папярэдняга прагляду рахунка-фактуры
product-invoice-preview-error-text = Не ўдалося загрузіць папярэдні прагляд рахунка-фактуры

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Мы пакуль не можам абнавіць вас

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Крама { -google-play }
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Праглядзіце свае змены
sub-change-failed = Не атрымалася змяніць план
sub-update-acknowledgment =
    Ваш тарыфны план неадкладна зменіцца,  і сёння з вас будзе спісана прапарцыйная
    сума за астатнюю частку гэтага плацежнага цыкла. Пачынаючы з { $startingDate }
    з вас будзе здымацца поўная сума.
sub-change-submit = Пацвердзіце змяненне
sub-update-current-plan-label = Цяперашні план
sub-update-new-plan-label = Новы план
sub-update-total-label = Новая сума
sub-update-prorated-upgrade = Прапарцыйнае абнаўленне

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (штодня)
sub-update-new-plan-weekly = { $productName } (штотыдзень)
sub-update-new-plan-monthly = { $productName } (штомесяц)
sub-update-new-plan-yearly = { $productName } (штогод)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Ануляваць падпіску
sub-item-stay-sub = Пакінуць падпіску

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Вы больш не зможаце карыстацца { $name } пасля
    { $period }, гэта апошні дзень вашага плацежнага цыкла.
sub-item-cancel-confirm = Скасаваць мой доступ да { $name } разам з захаванай інфармацыяй { $period }

## Routes - Subscription

sub-route-idx-reactivating = Не атрымалася паўторна актываваць падпіску
sub-route-idx-cancel-failed = Не атрымалася скасаваць падпіску
sub-route-idx-contact = Звязацца з падтрымкай
sub-route-idx-cancel-msg-title = Нам шкада, што вы сыходзіце
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Ваша падпіска на { $name } была скасавана.
          <br />
          У вас па-ранейшаму будзе доступ да { $name } да { $date }.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Праблема з загрузкай кліента
sub-invoice-error =
    .title = Праблема з загрузкай рахункаў-фактур
sub-billing-update-success = Ваша плацежная інфармацыя была паспяхова абноўлена
sub-invoice-previews-error-title = Праблема з загрузкай папярэдняга прагляду рахункаў-фактур
sub-invoice-previews-error-text = Не ўдалося загрузіць папярэдні прагляд рахункаў-фактур

## Routes - Subscription - ActionButton

pay-update-change-btn = Змяніць
pay-update-manage-btn = Кіраваць

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Наступная аплата { $date }
sub-expires-on = Дзейнічае да { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Заканчваецца { $expirationDate }
sub-route-idx-updating = Абнаўленне плацежнай інфармацыі
sub-route-payment-modal-heading = Няправільная плацежная інфармацыя
sub-route-missing-billing-agreement-payment-alert = Недапушчальная плацежная інфармацыя; узнікла памылка з вашым уліковым запісам. <div>Кіраваць</div>
sub-route-funding-source-payment-alert = Недапушчальная плацежная інфармацыя; узнікла памылка з вашым уліковым запісам. Гэта папярэджанне можа адлюстроўвацца цягам пэўнага часу пасля паспяховага абнаўлення вамі сваёй інфармацыі. <div>Кіраваць</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Няма такога плана для гэтай падпіскі.
invoice-not-found = Наступны рахунак-фактура не знойдзены
sub-item-no-such-subsequent-invoice = Наступны рахунак-фактура для гэтай падпіскі не знойдзены.
sub-invoice-preview-error-title = Папярэдні прагляд рахунка-фактуры не знойдзены
sub-invoice-preview-error-text = Папярэдні прагляд рахунка-фактуры не знойдзены для гэтай падпіскі

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Хочаце працягваць карыстацца { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Ваш доступ да { $name } будзе працягвацца, а ваш плацежны цыкл
    і сума аплата застанецца ранейшай. Ваша наступная плата адбудзецца
    { $endDate } і складзе { $amount } з карткі, што канчаецца на { $last }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Ваш доступ да { $name } будзе працягвацца, а ваш плацежны цыкл
    і сума аплата застанецца ранейшай. Ваша наступная плата адбудзецца
    { $endDate } і складзе { $amount }.
reactivate-confirm-button = Падпішыцеся яшчэ раз

## $date (Date) - Last day of product access

reactivate-panel-copy = Вы страціце доступ да { $name } <strong>{ $date }</strong>.
reactivate-success-copy = Дзякуй! Усё гатова.
reactivate-success-button = Закрыць

## Routes - Subscriptions - Subscription iap item

sub-iap-item-manage-button = Кіраваць
