# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Головна сторінка облікового запису
settings-project-header-title = { -product-mozilla-account(capitalization: "upper") }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Промокод застосовано
coupon-submit = Застосувати
coupon-remove = Вилучити
coupon-error = Введений код недійсний або прострочений.
coupon-error-generic = Під час обробки коду сталася помилка. Спробуйте ще раз.
coupon-error-expired = Термін дії введеного коду закінчився.
coupon-error-limit-reached = Введений вами код вичерпав свій ліміт.
coupon-error-invalid = Введений вами код недійсний.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Ввести код

## Component - Fields

default-input-error = Це поле обов'язкове
input-error-is-required = { $label } обов'язково

## Component - Header

brand-name-mozilla-logo = Логотип { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Вже маєте { -product-mozilla-account }? <a>Увійти</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Введіть адресу е-пошти
new-user-confirm-email =
    .label = Підтвердьте електронну адресу
new-user-subscribe-product-updates-mozilla = Я хочу отримувати новини та оновлення продуктів від { -brand-mozilla }
new-user-subscribe-product-updates-snp = Я хочу отримувати новини та оновлення щодо безпеки та приватності від { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Я хочу отримувати новини про продукти й оновлення від { -product-mozilla-hubs } і { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Я хочу отримувати новини про продукти й оновлення від { -product-mdn-plus } і { -brand-mozilla }
new-user-subscribe-product-assurance = Ми застосовуємо вашу електронну адресу лише для створення вашого облікового запису. Ми ніколи не продаватимемо її стороннім.
new-user-email-validate = Ваша адреса е-пошти недійсна
new-user-email-validate-confirm = Адреси е-пошти відрізняються
new-user-already-has-account-sign-in = У вас вже є обліковий запис. <a>Увійти</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Помилка введення адреси електронної пошти? { $domain } не пропонує електронну пошту.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Дякуємо!
payment-confirmation-thanks-heading-account-exists = Дякуємо! Тепер перевірте свою електронну пошту!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = На адресу { $email } надіслано електронний лист із підтвердженням та настановами про початок роботи з { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Ви отримаєте лист на адресу { $email } з інструкціями для налаштування свого облікового запису, а також подробицями платежу.
payment-confirmation-order-heading = Подробиці замовлення
payment-confirmation-invoice-number = Рахунок-фактура #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Платіжні дані
payment-confirmation-amount = { $amount } на { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } щодня
        [few] { $amount } кожні { $intervalCount } дні
       *[many] { $amount } кожні { $intervalCount } днів
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } щотижня
        [few] { $amount } кожні { $intervalCount } тижні
       *[many] { $amount } кожні { $intervalCount } тижнів
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } щомісяця
        [few] { $amount } кожні { $intervalCount } місяці
       *[many] { $amount } кожні { $intervalCount } місяців
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } щороку
        [few] { $amount } кожні { $intervalCount } роки
       *[many] { $amount } кожні { $intervalCount } років
    }
payment-confirmation-download-button = Продовжити завантаження

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Я дозволяю { -brand-mozilla } стягувати зазначену суму з використанням мого способу оплати, відповідно до <termsOfServiceLink>Умов надання послуг</termsOfServiceLink> і <privacyNoticeLink>Положення про приватність</privacyNoticeLink>, доки я не скасую передплату.
payment-confirm-checkbox-error = Необхідно завершити це, перш ніж переходити далі

## Component - PaymentErrorView

payment-error-retry-button = Спробувати знову
payment-error-manage-subscription-button = Керувати передплатою

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = У вас вже є передплата { $productName } через магазин { -brand-google } або { -brand-apple }.
iap-upgrade-no-bundle-support = Наразі не підтримується підвищення рівня для цих передплат, але невдовзі буде така можливість.
iap-upgrade-contact-support = Ви все одно можете отримати цей продукт — зверніться до служби підтримки по допомогу.
iap-upgrade-get-help-button = Отримати допомогу

## Component - PaymentForm

payment-name =
    .placeholder = Повне ім'я
    .label = Ім'я, зазначене на вашій картці
payment-cc =
    .label = Ваша картка
payment-cancel-btn = Скасувати
payment-update-btn = Оновити
payment-pay-btn = Сплатити зараз
payment-pay-with-paypal-btn-2 = Сплатити через { -brand-paypal }
payment-validate-name-error = Будь ласка, введіть своє ім’я

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } використовує { -brand-name-stripe } і { -brand-paypal } для безпечної обробки платежів.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Політика приватності { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Політика приватності { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } використовує { -brand-paypal } для безпечної обробки платежів.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Політика приватності { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } використовує { -brand-name-stripe } для безпечної обробки платежів.
payment-legal-link-stripe-3 = <stripePrivacyLink>політика приватності { -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Оберіть спосіб оплати
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Спочатку ви маєте підтвердити передплату

## Component - PaymentProcessing

payment-processing-message = Зачекайте, поки ми обробимо ваш платіж…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Картка, номер якої закінчується на { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Сплатити через { -brand-paypal }

## Component - PlanDetails

plan-details-header = Докладніше про продукт
plan-details-list-price = Базова ціна
plan-details-show-button = Докладніше
plan-details-hide-button = Сховати подробиці
plan-details-total-label = Всього
plan-details-tax = Податки та збори

## Component - PlanErrorDialog

product-no-such-plan = Такого тарифного плану для цього продукту не існує.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + податок { $taxAmount }
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } щодня
        [few] { $priceAmount } кожні { $intervalCount } дні
       *[many] { $priceAmount } кожні { $intervalCount } днів
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } щодня
            [few] { $priceAmount } кожні { $intervalCount } дні
           *[many] { $priceAmount } кожні { $intervalCount } днів
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } щотижня
        [few] { $priceAmount } кожні { $intervalCount } тижні
       *[many] { $priceAmount } кожні { $intervalCount } тижнів
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } щотижня
            [few] { $priceAmount } кожні { $intervalCount } тижні
           *[many] { $priceAmount } кожні { $intervalCount } тижнів
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } щомісяця
        [few] { $priceAmount } кожні { $intervalCount } місяці
       *[many] { $priceAmount } кожні { $intervalCount } місяців
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } *щомісяця
            [few] { $priceAmount } кожні { $intervalCount } місяці
           *[many] { $priceAmount } кожні { $intervalCount } місяців
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } щороку
        [few] { $priceAmount } кожні { $intervalCount } роки
       *[many] { $priceAmount } кожні { $intervalCount } років
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } щороку
            [few] { $priceAmount } кожні { $intervalCount } роки
           *[many] { $priceAmount } кожні { $intervalCount } років
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } податок щодня
        [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } дні
       *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } днів
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + податок { $taxAmount } щодня
            [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } дні
           *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } днів
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + податок { $taxAmount } щотижня
        [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } тижні
       *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } тижнів
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + податок { $taxAmount } щотижня
            [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } тижні
           *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } тижнів
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + податок { $taxAmount } щомісяця
        [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } місяці
       *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } місяців
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + податок { $taxAmount } щомісяця
            [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } місяці
           *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } місяців
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + податок { $taxAmount } щороку
        [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } роки
       *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } років
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + податок { $taxAmount } щороку
            [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } роки
           *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } років
        }

## Component - SubscriptionTitle

subscription-create-title = Налаштуйте передплату
subscription-success-title = Підтвердження передплати
subscription-processing-title = Підтвердження передплати…
subscription-error-title = Помилка підтвердження передплати…
subscription-noplanchange-title = Ця зміна тарифного плану не підтримується
subscription-iapsubscribed-title = Уже передплачено
sub-guarantee = Гарантоване повернення коштів упродовж 30 днів

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Умови надання послуг
privacy = Положення про приватність
terms-download = Завантажити умови

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Облікові записи Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Закрити вікно
settings-subscriptions-title = Передплати
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Промокод

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } щодня
        [few] { $amount } кожні { $intervalCount } дні
       *[many] { $amount } кожні { $intervalCount } днів
    }
    .title =
        { $intervalCount ->
            [one] { $amount } щодня
            [few] { $amount } кожні { $intervalCount } дні
           *[many] { $amount } кожні { $intervalCount } днів
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } щотижня
        [few] { $amount } кожні { $intervalCount } тижні
       *[many] { $amount } кожні { $intervalCount } тижнів
    }
    .title =
        { $intervalCount ->
            [one] { $amount } щотижня
            [few] { $amount } кожні { $intervalCount } тижні
           *[many] { $amount } кожні { $intervalCount } тижнів
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } щомісяця
        [few] { $amount } кожні { $intervalCount } місяці
       *[many] { $amount } кожні { $intervalCount } місяців
    }
    .title =
        { $intervalCount ->
            [one] { $amount } щомісяця
            [few] { $amount } кожні { $intervalCount } місяці
           *[many] { $amount } кожні { $intervalCount } місяців
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } щороку
        [few] { $amount } кожні { $intervalCount } роки
       *[many] { $amount } кожні { $intervalCount } років
    }
    .title =
        { $intervalCount ->
            [one] { $amount } щороку
            [few] { $amount } кожні { $intervalCount } роки
           *[many] { $amount } кожні { $intervalCount } років
        }

## Error messages

# App error dialog
general-error-heading = Загальна помилка програми
basic-error-message = Щось пішло не так. Будь ласка, спробуйте знову пізніше.
payment-error-1 = Гм. Не вдалося перевірити платіж. Спробуйте ще раз або зв’яжіться з емітентом вашої картки.
payment-error-2 = Гм. Не вдалося підтвердити платіж. Зв’яжіться з емітентом вашої картки.
payment-error-3b = Під час обробки вашого платежу сталася неочікувана помилка. Будь ласка, повторіть спробу.
expired-card-error = Схоже, строк дії вашої кредитної картки закінчився. Спробуйте скористатись іншою карткою.
insufficient-funds-error = Схоже, на вашій картці недостатньо коштів. Спробуйте скористатись іншою карткою.
withdrawal-count-limit-exceeded-error = Схоже, що після здійснення платежу буде перевищено кредитний ліміт. Спробуйте скористатись іншою карткою.
charge-exceeds-source-limit = Схоже, що після здійснення платежу буде перевищено ваш денний кредитний ліміт. Спробуйте скористатись іншою карткою або повторіть спробу за 24 години.
instant-payouts-unsupported = Схоже, вашу дебетову картку не налаштовано для миттєвих платежів. Спробуйте скористатись іншою дебетовою чи кредитною карткою.
duplicate-transaction = Гм. Схоже, що ідентичний платіж щойно було здійснено. Перевірте історію своїх платежів.
coupon-expired = Схоже, термін дії промо-коду минув.
card-error = Ваш платіж не вдалося обробити. Підтвердьте дані своєї кредитної картки та повторіть спробу.
country-currency-mismatch = Валюта цієї передплати недійсна для країни, пов’язаної з вашим платежем.
currency-currency-mismatch = Перепрошуємо. Ви не можете перемикатися між валютами.
location-unsupported = Згідно з нашими Умовами надання послуг ваше поточне розташування не підтримується.
no-subscription-change = Перепрошуємо, але ви не можете змінити свій тарифний план.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Ви вже оформили передплату через { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Системна помилка призвела до збою реєстрації в { $productName }. Платіж за вказаним способом оплати не було проведено. Будь ласка, спробуйте знову.
fxa-post-passwordless-sub-error = Передплату підтверджено, але не вдалося завантажити сторінку підтвердження. Перевірте свою електронну пошту для завершення налаштування облікового запису.
newsletter-signup-error = Ви не підписалися на сповіщення про оновлення продукту. Ви можете спробувати знову зробити це в налаштуваннях облікового запису.
product-plan-error =
    .title = Не вдалося завантажити сторінку з тарифними планами
product-profile-error =
    .title = Не вдалося завантажити сторінку профілю
product-customer-error =
    .title = Не вдалося завантажити сторінку клієнта
product-plan-not-found = Тарифний план не знайдено
product-location-unsupported-error = Розташування не підтримується

## Hooks - coupons

coupon-success = Вашу передплату буде автоматично поновлено за базовою ціною.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Ваш тарифний план буде автоматично поновлено після { $couponDurationDate } за роздрібною ціною.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Створіть { -product-mozilla-account }
new-user-card-title = Введіть дані своєї картки
new-user-submit = Передплатити

## Routes - Product and Subscriptions

sub-update-payment-title = Платіжні дані

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Сплатити карткою
product-invoice-preview-error-title = Проблема із завантаженням попереднього перегляду рахунка-фактури
product-invoice-preview-error-text = Не вдається завантажити попередній перегляд рахунка-фактури

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Поки що ми не можемо підвищити рівень вашої передплати

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Магазин { -google-play }
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Перегляньте свої зміни
sub-change-failed = Помилка зміни тарифного плану
sub-update-acknowledgment =
    Ваш тарифний план зміниться негайно і сьогодні з вас буде стягнуто пропорційну
    суму за решту циклу передплати. Починаючи з { $startingDate }
    з вас стягуватиметься повна сума.
sub-change-submit = Підтвердити зміни
sub-update-current-plan-label = Поточний тарифний план
sub-update-new-plan-label = Новий тарифний план
sub-update-total-label = Нова сума
sub-update-prorated-upgrade = Пропорційне оновлення

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (щодня)
sub-update-new-plan-weekly = { $productName } (щотижня)
sub-update-new-plan-monthly = { $productName } (щомісяця)
sub-update-new-plan-yearly = { $productName } (щороку)
sub-update-prorated-upgrade-credit = Зазначений негативний баланс буде зараховано на ваш обліковий запис у вигляді кредитів, які буде використано для оплати майбутніх рахунків.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Скасувати передплату
sub-item-stay-sub = Залишити передплату чинною

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Ви більше не зможете користуватися { $name } після
    { $period }, останній день вашого платіжного циклу.
sub-item-cancel-confirm = Скасувати мій доступ до { $name } разом зі збереженими даними { $period }
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
sub-promo-coupon-applied = Застосовано купон { $promotion_name }: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Цей платіж за передплату призвів до утворення кредитів на балансі вашого облікового запису: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Не вдалося поновити передплату
sub-route-idx-cancel-failed = Не вдалося скасувати передплату
sub-route-idx-contact = Звернутися до служби підтримки
sub-route-idx-cancel-msg-title = Нам шкода, що ви йдете
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Вашу передплату { $name } було скасовано.
          <br />
          Ви все одно матимете доступ до { $name } до { $date }.
sub-route-idx-cancel-aside-2 = Маєте запитання? Відвідайте <a>Підтримку { -brand-mozilla }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Не вдалося завантажити сторінку клієнта
sub-invoice-error =
    .title = Проблема із завантаженням рахунків-фактур
sub-billing-update-success = Ваші платіжні дані успішно оновлено
sub-invoice-previews-error-title = Проблема із завантаженням попереднього перегляду рахунків-фактур
sub-invoice-previews-error-text = Не вдається завантажити попередній перегляд рахунків-фактур

## Routes - Subscription - ActionButton

pay-update-change-btn = Змінити
pay-update-manage-btn = Керувати

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Наступна оплата { $date }
sub-expires-on = Чинний до { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Термін дії закінчується { $expirationDate }
sub-route-idx-updating = Оновлення платіжних даних…
sub-route-payment-modal-heading = Недійсна платіжна інформація
sub-route-payment-modal-message-2 = Схоже, виникла помилка з вашим обліковим записом { -brand-paypal }. Вам необхідно виконати певні кроки для розв'язання проблеми з оплатою.
sub-route-missing-billing-agreement-payment-alert = Недійсні платіжні дані. Виникла помилка з вашим обліковим записом. <div>Керувати</div>
sub-route-funding-source-payment-alert = Недійсні платіжні дані; сталася помилка з вашим обліковим записом. Це попередження зникне невдовзі після успішного оновлення даних. <div>Керувати</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Такого тарифного плану для цієї передплати не існує.
invoice-not-found = Наступний рахунок-фактуру не знайдено
sub-item-no-such-subsequent-invoice = Наступний рахунок-фактуру для цієї передплати не знайдено.
sub-invoice-preview-error-title = Попередній перегляд рахунка-фактури не знайдено
sub-invoice-preview-error-text = Не знайдено попередній перегляд рахунка-фактури для цієї передплати

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Хочете продовжувати використовувати { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Ваш доступ до { $name } буде продовжено, а ваші платіжний цикл та
    оплата залишаться незмінними. Наступну оплату розміром
    { $amount } буде здійснено { $endDate } з картки, останні цифри номеру якої { $last }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Ваш доступ до { $name } буде продовжено, а ваші платіжний цикл та
    оплата залишаться незмінними. Наступну оплату розміром
    { $amount } буде здійснено { $endDate }.
reactivate-confirm-button = Поновити передплату

## $date (Date) - Last day of product access

reactivate-panel-copy = Ви втратите доступ до { $name } <strong>{ $date }</strong>.
reactivate-success-copy = Дякуємо! Ви все налаштували.
reactivate-success-button = Закрити

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: покупка в програмі
sub-iap-item-apple-purchase-2 = { -brand-apple }: покупка в програмі
sub-iap-item-manage-button = Керувати
