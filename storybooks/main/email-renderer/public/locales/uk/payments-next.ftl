## Page

checkout-signin-or-create = 1. Увійдіть або створіть { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = або
continue-signin-with-google-button = Продовжити з { -brand-google }
continue-signin-with-apple-button = Продовжити з { -brand-apple }
next-payment-method-header = Оберіть спосіб оплати
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Спочатку ви маєте підтвердити передплату
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Виберіть свою країну та введіть поштовий індекс, <p>щоб продовжити оформлення замовлення на { $productName }</p>
location-banner-info = Не вдалося автоматично визначити ваше розташування
location-required-disclaimer = Ця інформація використовується лише для розрахунку податків і валюти.
location-banner-currency-change = Зміна валюти не підтримується. Щоб продовжити, виберіть країну, яка відповідає вашій поточній платіжній валюті.

## Page - Upgrade page

upgrade-page-payment-information = Платіжні дані
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Ваш тарифний план зміниться негайно і сьогодні з вас буде стягнуто пропорційну суму за решту циклу передплати. Починаючи з { $nextInvoiceDate } з вас стягуватиметься повна сума.

## Authentication Error page

auth-error-page-title = Не вдається виконати вхід
checkout-error-boundary-retry-button = Спробувати знову
checkout-error-boundary-basic-error-message = Щось пішло не так. Спробуйте ще раз або <contactSupportLink>зверніться до служби підтримки.</contactSupportLink>

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Керувати передплатою
next-iap-blocked-contact-support = У вас є мобільна передплата в програмі, яка конфліктує з цим продуктом. Зверніться до служби підтримки по допомогу.
next-payment-error-retry-button = Спробувати знову
next-basic-error-message = Щось пішло не так. Будь ласка, спробуйте знову пізніше.
checkout-error-contact-support-button = Звернутися до служби підтримки
checkout-error-not-eligible = Ви не маєте права передплачувати цей продукт – зверніться до служби підтримки для отримання допомоги.
checkout-error-already-subscribed = Ви вже передплачуєте цей продукт.
checkout-error-contact-support = Зверніться до служби підтримки для отримання допомоги.
cart-error-currency-not-determined = Не вдалося визначити валюту для цієї покупки. Повторіть спробу.
checkout-processing-general-error = Під час обробки вашого платежу сталася неочікувана помилка. Будь ласка, повторіть спробу.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Зачекайте, поки ми обробимо ваш платіж…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Дякуємо! Тепер перевірте свою електронну пошту!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Ви отримаєте електронний лист на адресу { $email } з інструкціями щодо вашої передплати, а також платіжними даними.
next-payment-confirmation-order-heading = Подробиці замовлення
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Рахунок-фактура #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Платіжні дані

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Продовжити завантаження

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Картка, номер якої закінчується на { $last4 }

## Page - Subscription Management

# Page - Not Found
page-not-found-title = Сторінку не знайдено
page-not-found-description = Запитану вами сторінку не знайдено. Ми отримали сповіщення про цю проблему і якнайшвидше виправимо пошкоджені посилання.
page-not-found-back-button = Повернутися назад

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Я дозволяю { -brand-mozilla } стягувати зазначену суму з використанням мого способу оплати, відповідно до <termsOfServiceLink>Умов надання послуг</termsOfServiceLink> і <privacyNoticeLink>Положення про приватність</privacyNoticeLink>, доки я не скасую передплату.
next-payment-confirm-checkbox-error = Необхідно завершити це, перш ніж переходити далі

## Checkout Form

next-new-user-submit = Передплатити
next-pay-with-heading-paypal = Сплатити через { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Ввести код
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Промокод
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Промокод застосовано
next-coupon-remove = Вилучити
next-coupon-submit = Застосувати

# Component - Header

payments-header-help =
    .title = Довідка
    .aria-label = Довідка
    .alt = Довідка
payments-header-bento =
    .title = Продукти { -brand-mozilla }
    .aria-label = Продукти { -brand-mozilla }
    .alt = Логотип { -brand-mozilla }
payments-header-bento-close =
    .alt = Закрити
payments-header-bento-tagline = Інші продукти від { -brand-mozilla }, які захищають вашу приватність
payments-header-bento-firefox-desktop = Браузер { -brand-firefox } для комп'ютера
payments-header-bento-firefox-mobile = Браузер { -brand-firefox } для мобільного
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Створено в { -brand-mozilla }
payments-header-avatar =
    .title = Меню { -product-mozilla-account(case: "gen") }
payments-header-avatar-icon =
    .alt = Зображення профілю облікового запису
payments-header-avatar-expanded-signed-in-as = Вхід виконано
payments-header-avatar-expanded-sign-out = Вийти
payments-client-loading-spinner =
    .aria-label = Завантаження…
    .alt = Завантаження…

## Component - PurchaseDetails

next-plan-details-header = Докладніше про продукт
next-plan-details-list-price = Базова ціна
next-plan-details-tax = Податки та збори
next-plan-details-total-label = Всього
next-plan-details-hide-button = Сховати подробиці
next-plan-details-show-button = Докладніше
next-coupon-success = Вашу передплату буде автоматично поновлено за базовою ціною.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Ваш тарифний план буде автоматично поновлено після { $couponDurationDate } за роздрібною ціною.

## Select Tax Location

select-tax-location-title = Розташування
select-tax-location-edit-button = Редагувати
select-tax-location-save-button = Зберегти
select-tax-location-continue-to-checkout-button = Перейти до оформлення замовлення
select-tax-location-country-code-label = Країна
select-tax-location-country-code-placeholder = Виберіть свою країну
select-tax-location-error-missing-country-code = Виберіть свою країну
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } недоступний у цьому регіоні.
select-tax-location-postal-code-label = Поштовий індекс
select-tax-location-postal-code =
    .placeholder = Введіть свій поштовий індекс
select-tax-location-error-missing-postal-code = Введіть свій поштовий індекс
select-tax-location-error-invalid-postal-code = Введіть дійсний поштовий індекс
select-tax-location-successfully-updated = Ваше розташування оновлено.
select-tax-location-error-location-not-updated = Не вдалося оновити ваше розташування. Повторіть спробу.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Платіж з вашого облікового запису здійснюється в { $currencyDisplayName }. Виберіть країну, в якій використовується { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Виберіть країну, валюта якої відповідає тій, що зазначена в активних передплатах.
select-tax-location-new-tax-rate-info = Оновлення розташування призведе до застосування нової ставки податку до всіх активних передплат у вашому обліковому записі, починаючи з наступного розрахункового періоду.
signin-form-continue-button = Продовжити
signin-form-email-input = Введіть свою електронну пошту
signin-form-email-input-missing = Введіть свою електронну пошту
signin-form-email-input-invalid = Вкажіть дійсну електронну пошту
next-new-user-subscribe-product-updates-mdnplus = Я хочу отримувати новини про продукти й оновлення від { -product-mdn-plus } і { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Я хочу отримувати новини та оновлення продуктів від { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = Я хочу отримувати новини та оновлення щодо безпеки та приватності від { -brand-mozilla }
next-new-user-subscribe-product-assurance = Ми застосовуємо вашу електронну адресу лише для створення вашого облікового запису. Ми ніколи не продаватимемо її стороннім.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } щодня
plan-price-interval-weekly = { $amount } щотижня
plan-price-interval-monthly = { $amount } щомісяця
plan-price-interval-halfyearly = { $amount } кожні 6 місяців
plan-price-interval-yearly = { $amount } щороку

## Component - SubscriptionTitle

next-subscription-create-title = Налаштуйте передплату
next-subscription-success-title = Підтвердження передплати
next-subscription-processing-title = Підтвердження передплати…
next-subscription-error-title = Помилка підтвердження передплати…
subscription-title-sub-exists = У вас вже є передплата
subscription-title-plan-change-heading = Перегляньте свої зміни
subscription-title-not-supported = Ця зміна тарифного плану не підтримується
next-sub-guarantee = Гарантоване повернення коштів упродовж 30 днів

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Умови надання послуг
next-privacy = Положення про приватність
next-terms-download = Завантажити умови
terms-and-privacy-stripe-label = { -brand-mozilla } використовує { -brand-name-stripe } для безпечної обробки платежів.
terms-and-privacy-stripe-link = Політика приватності { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } використовує { -brand-paypal } для безпечної обробки платежів.
terms-and-privacy-paypal-link = Політика приватності { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } використовує { -brand-name-stripe } і { -brand-paypal } для безпечної обробки платежів.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Поточний тарифний план
upgrade-purchase-details-new-plan-label = Новий тарифний план
upgrade-purchase-details-promo-code = Промокод
upgrade-purchase-details-tax-label = Податки та збори

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (щодня)
upgrade-purchase-details-new-plan-weekly = { $productName } (щотижня)
upgrade-purchase-details-new-plan-monthly = { $productName } (щомісяця)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (кожні 6 місяців)
upgrade-purchase-details-new-plan-yearly = { $productName } (щороку)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Оформлення замовлення | { $productTitle }
metadata-description-checkout-start = Введіть свої платіжні дані, щоб завершити покупку.
# Checkout processing
metadata-title-checkout-processing = Обробка | { $productTitle }
metadata-description-checkout-processing = Зачекайте, поки завершиться обробка вашого платежу.
# Checkout error
metadata-title-checkout-error = Помилка | { $productTitle }
metadata-description-checkout-error = Під час обробки вашої передплати сталася помилка. Якщо проблема не зникне, зверніться до служби підтримки.
# Checkout success
metadata-title-checkout-success = Успішно | { $productTitle }
metadata-description-checkout-success = Вітаємо! Ви успішно завершили покупку.
# Checkout needs_input
metadata-title-checkout-needs-input = Потрібна дія | { $productTitle }
metadata-description-checkout-needs-input = Будь ласка, виконайте необхідні дії, щоб продовжити оплату.
# Upgrade start
metadata-title-upgrade-start = Оновлення | { $productTitle }
metadata-description-upgrade-start = Введіть платіжні дані, щоб завершити оновлення.
# Upgrade processing
metadata-title-upgrade-processing = Обробка | { $productTitle }
metadata-description-upgrade-processing = Зачекайте, поки завершиться обробка вашого платежу.
# Upgrade error
metadata-title-upgrade-error = Помилка | { $productTitle }
metadata-description-upgrade-error = Під час обробки вашого оновлення сталася помилка. Якщо проблема не зникне, зверніться до служби підтримки.
# Upgrade success
metadata-title-upgrade-success = Успішно | { $productTitle }
metadata-description-upgrade-success = Вітаємо! Ви успішно завершили оновлення.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Потрібна дія | { $productTitle }
metadata-description-upgrade-needs-input = Будь ласка, виконайте необхідні дії, щоб продовжити оплату.
# Default
metadata-title-default = Сторінку не знайдено | { $productTitle }
metadata-description-default = Запитану вами сторінку не знайдено.

## Coupon Error Messages

next-coupon-error-expired = Термін дії введеного коду закінчився.
next-coupon-error-generic = Під час обробки коду сталася помилка. Спробуйте ще раз.
next-coupon-error-invalid = Введений вами код недійсний.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = Введений вами код вичерпав свій ліміт.
