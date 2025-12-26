# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Тіркелгінің басты беті
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Промокоды іске асырылды
coupon-submit = Іске асыру
coupon-remove = Өшіру
coupon-error = Сіз енгізген код жарамсыз немесе мерзімі өтіп кеткен.
coupon-error-generic = Кодты өңдеу кезінде қате орын алды. Қайталап көріңіз.
coupon-error-expired = Сіз енгізген кодтың мерзімі аяқталды.
coupon-error-limit-reached = Сіз енгізген код қолдану шегіне жетті.
coupon-error-invalid = Сіз енгізген код жарамсыз.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Кодты енгізіңіз

## Component - Fields

default-input-error = Бұл өріс міндетті түрде керек
input-error-is-required = { $label } міндетті түрде керек

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } логотипі

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Сізде { -product-mozilla-account } бар ма? <a>Жүйеге кіру</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Эл. поштаңызды енгізіңіз
new-user-confirm-email =
    .label = Эл. пошта адресіңізді растаңыз
new-user-subscribe-product-updates-mozilla = Мен { -brand-mozilla } өнім жаңалықтары мен жаңартуларын алғым келеді
new-user-subscribe-product-updates-snp = Мен { -brand-mozilla } ұсынған қауіпсіздік пен жекелік жаңалықтары мен жаңартуларын алғым келеді
new-user-subscribe-product-updates-hubs = Мен { -product-mozilla-hubs } және { -brand-mozilla } өнім жаңалықтары мен жаңартуларын алғым келеді
new-user-subscribe-product-updates-mdnplus = Мен { -product-mdn-plus } және { -brand-mozilla } өнім жаңалықтары мен жаңартуларын алғым келеді
new-user-subscribe-product-assurance = Біз эл. поштаңызды тек тіркелгіңізді жасау үшін пайдаланамыз. Біз оны ешқашан үшінші тарапқа сатпаймыз.
new-user-email-validate = Эл. пошта жарамсыз
new-user-email-validate-confirm = Эл. пошталар өзара сәйкес келмейді
new-user-already-has-account-sign-in = Сізде тіркелгі бар болып тұр. <a>Жүйеге кіру</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Қате тердіңіз бе? { $domain } эл. поштаны ұсынбайды.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Рахмет!
payment-confirmation-thanks-heading-account-exists = Рахмет, енді эл. поштаңызды тексеріңіз!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = { $email } адресіне { $product_name } өнімімен жұмысты қалай бастау керектігі туралы мәліметтері бар растау электрондық хаты жіберілді.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Сіз { $email } адресіне тіркелгіңізді баптау нұсқаулары, сондай-ақ төлем мәліметтері көрсетілген электрондық хат аласыз.
payment-confirmation-order-heading = Тапсырыс мәліметтері
payment-confirmation-invoice-number = №{ $invoiceNumber } шот-фактура
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Төлем ақпараты
payment-confirmation-amount = { $amount }, { $interval } үшін
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } күнде
       *[other] { $amount } әр { $intervalCount } күнде
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } апта сайын
       *[other] { $amount } әр { $intervalCount } аптада
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } ай сайын
       *[other] { $amount } әр { $intervalCount } айда
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } жыл сайын
       *[other] { $amount } әр { $intervalCount } жылда
    }
payment-confirmation-download-button = Жүктеп алуды жалғастыру

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Мен { -brand-mozilla } компаниясына, оның <termsOfServiceLink>Қызмет көрсету шарттары</termsOfServiceLink> және <privacyNoticeLink>Жекелік ескертуіне</privacyNoticeLink> сәйкес, мен жазылудан бас тартқанша дейін, көрсетілген сома үшін төлем әдісімнен ақы алуға рұқсат беремін.
payment-confirm-checkbox-error = Алға жылжу алдында осыны аяқтауыңыз керек.

## Component - PaymentErrorView

payment-error-retry-button = Қайтадан көру
payment-error-manage-subscription-button = Менің жазылуымды басқару

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Сізде { $productName } жазылуы { -brand-google }немесе { -brand-apple } қолданба дүкендері арқылы бар болып тұр.
iap-upgrade-no-bundle-support = Біз бұл жазылуларды жаңартуға қолдау көрсетпейміз, бірақ жақын арада оны бастаймыз.
iap-upgrade-contact-support = Сіз бұл өнімді әлі де ала аласыз — көмек алу үшін қолдау қызметіне хабарласыңыз.
iap-upgrade-get-help-button = Көмек алу

## Component - PaymentForm

payment-name =
    .placeholder = Толық атыңыз
    .label = Картаңызда көрсетілгендей толық атыңыз
payment-cc =
    .label = Сіздің картаңыз
payment-cancel-btn = Бас тарту
payment-update-btn = Жаңарту
payment-pay-btn = Қазір төлеу
payment-pay-with-paypal-btn-2 = { -brand-paypal } арқылы төлеу
payment-validate-name-error = Атыңызды енгізіңіз

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } төлемдерді қауіпсіз өңдеу үшін { -brand-name-stripe } және { -brand-paypal } пайдаланады.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } жекелік саясаты</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } жекелік саясаты</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } төлемдерді қауіпсіз өңдеу үшін { -brand-paypal } пайдаланады.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } жекелік саясаты</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } төлемдерді қауіпсіз өңдеу үшін { -brand-name-stripe } пайдаланады.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } жекелік саясаты</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Төлем әдісін таңдаңыз
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Алдымен жазылуыңызды растауыңыз керек

## Component - PaymentProcessing

payment-processing-message = Төлеміңізді өңделгенше күтіңіз…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = { $last4 } аяқталатын карта

## Component - PayPalButton

pay-with-heading-paypal-2 = { -brand-paypal } арқылы төлеу

## Component - PlanDetails

plan-details-header = Өнім мәліметтері
plan-details-list-price = Прейскурант
plan-details-show-button = Мәліметтерді көрсету
plan-details-hide-button = Мәліметтерді жасыру
plan-details-total-label = Барлығы
plan-details-tax = Салықтар мен алымдар

## Component - PlanErrorDialog

product-no-such-plan = Бұл өнім үшін мұндай жоспар жоқ.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } салық
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } күн сайын
       *[other] { $priceAmount } әр { $intervalCount } күн сайын
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } күн сайын
           *[other] { $priceAmount } әр { $intervalCount } күн сайын
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } апта сайын
       *[other] { $priceAmount } әр { $intervalCount } апта сайын
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } апта сайын
           *[other] { $priceAmount } әр { $intervalCount } апта сайын
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } ай сайын
       *[other] { $priceAmount } әр { $intervalCount } ай сайын
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ай сайын
           *[other] { $priceAmount } әр { $intervalCount } ай сайын
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } жыл сайын
       *[other] { $priceAmount } әр { $intervalCount } жыл сайын
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } жыл сайын
           *[other] { $priceAmount } әр { $intervalCount } жыл сайын
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } салық күн сайын
       *[other] { $priceAmount } + { $taxAmount } салық  әр { $intervalCount } күн сайын
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } салық күн сайын
           *[other] { $priceAmount } + { $taxAmount } салық  әр { $intervalCount } күн сайын
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } салық апта сайын
       *[other] { $priceAmount } + { $taxAmount } салық әр { $intervalCount } апта сайын
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } салық апта сайын
           *[other] { $priceAmount } + { $taxAmount } салық әр { $intervalCount } апта сайын
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } салық ай сайын
       *[other] { $priceAmount } + { $taxAmount } салық әр { $intervalCount } ай сайын
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } салық ай сайын
           *[other] { $priceAmount } + { $taxAmount } салық әр { $intervalCount } ай сайын
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } салық жыл сайын
       *[other] { $priceAmount } + { $taxAmount } салық әр { $intervalCount } жыл сайын
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } салық жыл сайын
           *[other] { $priceAmount } + { $taxAmount } салық әр { $intervalCount } жыл сайын
        }

## Component - SubscriptionTitle

subscription-create-title = Жазылуыңызды реттеу
subscription-success-title = Жазылуды растау
subscription-processing-title = Жазылуды растау…
subscription-error-title = Жазылуды растау қатесі…
subscription-noplanchange-title = Бұл жазылу жоспарын өзгертуге қолдау көрсетілмейді
subscription-iapsubscribed-title = Жазылып қойған
sub-guarantee = Ақшаны қайтарудың 30-күндік кепілдігі

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Қолдану шарттары
privacy = Жекелік ескертуі
terms-download = Жүктеп алу шарттары

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox тіркелгілері
# General aria-label for closing modals
close-aria =
    .aria-label = Терезені жабу
settings-subscriptions-title = Жазылулар
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Промокод

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } күн сайын
       *[other] { $amount } әр { $intervalCount } күн сайын
    }
    .title =
        { $intervalCount ->
            [one] { $amount } күн сайын
           *[other] { $amount } әр { $intervalCount } күн сайын
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } апта сайын
       *[other] { $amount } әр { $intervalCount } апта сайын
    }
    .title =
        { $intervalCount ->
            [one] { $amount } апта сайын
           *[other] { $amount } әр { $intervalCount } апта сайын
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } ай сайын
       *[other] { $amount } әр { $intervalCount } ай сайын
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ай сайын
           *[other] { $amount } әр { $intervalCount } ай сайын
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } жыл сайын
       *[other] { $amount } әр { $intervalCount } жыл сайын
    }
    .title =
        { $intervalCount ->
            [one] { $amount } жыл сайын
           *[other] { $amount } әр { $intervalCount } жыл сайын
        }

## Error messages

# App error dialog
general-error-heading = Жалпы қолданба қатесі
basic-error-message = Бірнәрсе қате кетті. Кейінірек қайталап көріңіз.
payment-error-1 = Төлеміңізді авторизациялау кезінде мәселе орын алды. Қайталап көріңіз немесе карта шығарушысымен байланысыңыз.
payment-error-2 = Төлеміңізді авторизациялау кезінде мәселе орын алды. Карта шығарушысымен байланысыңыз.
payment-error-3b = Төлеміңізді өңдеу кезінде күтпеген қате орын алды, әрекетті қайталаңыз.
expired-card-error = Несие картаңыздың мерзімі өтіп кеткен сияқты. Басқа картаны қолданып көріңіз.
insufficient-funds-error = Сіздің картаңызда қаражат жеткіліксіз сияқты. Басқа картаны қолданып көріңіз.
withdrawal-count-limit-exceeded-error = Бұл транзакция сізді несие шегінен асырып жіберетін сияқты. Басқа картаны қолданып көріңіз.
charge-exceeds-source-limit = Бұл транзакция сізді күнделікті несие шегінен асырып жіберетін сияқты. Басқа картаны қолданып көріңіз немесе 24 сағат күтіңіз.
instant-payouts-unsupported = Дебеттік картаңыз жедел төлемдер үшін бапталмаған сияқты. Басқа дебеттік немесе несиелік картаны қолданып көріңіз.
duplicate-transaction = Бірдей транзакция жаңа ғана жіберілген сияқты. Төлем тарихын тексеріңіз.
coupon-expired = Бұл промокодтың мерзімі өтіп кеткен сияқты.
card-error = Транзакцияны өңдеу мүмкін болмады. Несие карта ақпаратын тексеріп, әрекетті қайталаңыз.
country-currency-mismatch = Бұл жазылымның валютасы төлеміңізге байланысты ел үшін жарамсыз.
currency-currency-mismatch = Кешіріңіз. Сіз валюталар арасында ауыса алмайсыз.
location-unsupported = Сіздің ағымдағы орналасқан жеріңізге біздің Қызмет көрсету шарттарына сәйкес қолдау көрсетілмейді.
no-subscription-change = Кешіріңіз. Жазылу жоспарын өзгерте алмайсыз.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Сіз { $mobileAppStore } арқылы әлдеқашан жазылғансыз.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Жүйелік қатесі { $productName } тіркелуінің сәтсіз аяқталуына себеп болды. Төлем әдісіңізден ақы алынбады. Қайталап көріңіз.
fxa-post-passwordless-sub-error = Жазылу расталды, бірақ растау беті жүктелмеді. Тіркелгіңізді баптау үшін электрондық поштаңызды тексеріңіз.
newsletter-signup-error = Сіз өнім жаңалықтары хаттарына тіркелмегенсіз. Тіркелгі баптауларында әрекетті қайталауға болады.
product-plan-error =
    .title = Жоспарларды жүктеу мәселесі
product-profile-error =
    .title = Профильді жүктеу мәселесі
product-customer-error =
    .title = Тұтынушыны жүктеу мәселесі
product-plan-not-found = Жоспар табылмады
product-location-unsupported-error = Орналасуға қолдау жоқ

## Hooks - coupons

coupon-success = Сіздің жоспарыңыз тізімдік баға бойынша автоматты түрде жаңартылады.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Жоспарыңыз тізім бағасы бойынша { $couponDurationDate } кейін автоматты түрде жаңартылады.

## Routes - Checkout - New user

new-user-step-1-2 = 1. { -product-mozilla-account } жасау
new-user-card-title = Карта ақпаратын енгізіңіз
new-user-submit = Қазір жазылу

## Routes - Product and Subscriptions

sub-update-payment-title = Төлем ақпараты

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Картамен төлеу
product-invoice-preview-error-title = Шот-фактураны алдын ала қарауды жүктеу кезінде мәселе
product-invoice-preview-error-text = Шот-фактураны алдын ала қарауды жүктеу мүмкін болмады

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Біз сізді әлі толықтай жаңарта алмаймыз

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Өзгерісіңізді қарап шығыңыз
sub-change-failed = Жоспарды өзгерту сәтсіз аяқталды
sub-update-acknowledgment =
    Сіздің жоспарыңыз бірден өзгереді және сізден төлем циклінің
    қалған бөлігі үшін пропорционалды сома бүгін алынады.
    { $startingDate } күнінен бастап сізден толық сома алынады.
sub-change-submit = Өзгерісті растау
sub-update-current-plan-label = Ағымдағы жоспар
sub-update-new-plan-label = Жаңа жоспар
sub-update-total-label = Жаңа толық сома
sub-update-prorated-upgrade = Пропорционалды жаңарту

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (күн сайын)
sub-update-new-plan-weekly = { $productName } (апта сайын)
sub-update-new-plan-monthly = { $productName } (ай сайын)
sub-update-new-plan-yearly = { $productName } (жыл сайын)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Жазылудан бас тарту
sub-item-stay-sub = Жазылуда қала беру

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg = Төлем циклінің соңғы күнінен, яғни { $period } кейін, { $name } бұдан былай пайдалана алмайсыз.
sub-item-cancel-confirm = { $period } күні { $name } ішіне кіру рұқсатымды және сақталған ақпаратымды тоқтатыңыз
# $promotion_name (String) - The name of the promotion.
# The <priceDetails></priceDetails> component acts as a placeholder and could use one of the following IDs:
# price-details-tax-${interval},
# price-details-no-tax-${interval},
# price-details-tax,
# price-details-no-tax
# Examples:
# 20% OFF coupon applied: $11.20 + $0.35 tax monthly
# Holiday Offer 2023 coupon applied: $11.20 monthly
# Cybersecurity Awareness Month 2023 coupon applied: $11.20 + $0.35 tax
# Summer Promo VPN coupon applied: $11.20
sub-promo-coupon-applied = { $promotion_name } купоны қолданылды: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Жазылуды қайта белсендіру сәтсіз аяқталды
sub-route-idx-cancel-failed = Жазылудан бас тарту сәтсіз аяқталды
sub-route-idx-contact = Қолдау қызметіне хабарласу
sub-route-idx-cancel-msg-title = Кетіп қалуыңыздан өкінеміз
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    { $name } жазылуыңыздан бас тартылды.
          <br />
          { $date } дейін { $name } ішіне әлі де қол жеткізе аласыз.
sub-route-idx-cancel-aside-2 = Сұрақтарыңыз бар ма? <a>{ -brand-mozilla } Қолдау көрсету</a> сайтын шолыңыз.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Тұтынушыны жүктеу мәселесі
sub-invoice-error =
    .title = Шот-фактураларды жүктеу мәселесі
sub-billing-update-success = Төлем ақпаратыңыз сәтті жаңартылды
sub-invoice-previews-error-title = Шот-фактураны алдын ала қарауды жүктеу кезінде мәселе
sub-invoice-previews-error-text = Шот-фактураны алдын ала қарауды жүктеу мүмкін болмады

## Routes - Subscription - ActionButton

pay-update-change-btn = Өзгерту
pay-update-manage-btn = Басқару

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Келесі төлем { $date } күні
sub-expires-on = Мерзімі { $date } күні аяқталады

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Мерзімі { $expirationDate } күні аяқталады
sub-route-idx-updating = Төлем ақпаратын жаңарту…
sub-route-payment-modal-heading = Төлем ақпараты жарамсыз
sub-route-payment-modal-message-2 = { -brand-paypal } тіркелгіңізде қате бар сияқты, бұл төлем мәселесін шешу үшін сізге қажетті қадамдарды орындау қажет.
sub-route-missing-billing-agreement-payment-alert = Төлем ақпараты жарамсыз; тіркелгіңізде қате бар. <div>Басқару</div>
sub-route-funding-source-payment-alert = Төлем ақпараты жарамсыз; тіркелгіңізде қате бар.  Ақпаратты сәтті жаңартқаннан кейін бұл ескертудің жойылуы біраз уақыт алуы мүмкін. <div>Басқару</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Бұл жазылу үшін мұндай жоспар жоқ.
invoice-not-found = Кейінгі шот-фактура табылмады
sub-item-no-such-subsequent-invoice = Бұл жазылу үшін келесі шот-фактура табылмады.
sub-invoice-preview-error-title = Шот-фактураны алдын ала қарау табылмады
sub-invoice-preview-error-text = Бұл жазылу үшін шот-фактураны алдын ала қарау табылмады

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = { $name } пайдалануды жалғастырғыңыз келе ме?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    { $name } ішіне қатынау мүмкіндігіңіз жалғасады және төлем
    цикліңіз бен төлеміңіз өзгеріссіз қалады. Келесі төлем шамасы { $amount },
    ол { $endDate } күні { $last } деп аяқталатын картадан алынады.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    { $name } ішіне қатынау мүмкіндігіңіз жалғасады және төлем
    цикліңіз бен төлеміңіз өзгеріссіз қалады. Келесі төлем
    шамасы { $amount }, ол { $endDate } күні алынады.
reactivate-confirm-button = Қайта жазылу

## $date (Date) - Last day of product access

reactivate-panel-copy = { $name } ішіне қол жеткізу рұқсатын <strong>{ $date }</strong> күні жоғалтасыз.
reactivate-success-copy = Рахмет! Барлығы дайын.
reactivate-success-button = Жабу

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Қолданбада сатып алу
sub-iap-item-apple-purchase-2 = { -brand-apple }: Қолданбада сатып алу
sub-iap-item-manage-button = Басқару
