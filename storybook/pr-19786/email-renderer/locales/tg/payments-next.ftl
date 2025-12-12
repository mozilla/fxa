## Page

checkout-signin-or-create = 1. Ворид шавед ё «{ -product-mozilla-account }»-ро эҷод намоед
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = ё
continue-signin-with-google-button = Бо «{ -brand-google }» идома диҳед
continue-signin-with-apple-button = Бо «{ -brand-apple }» идома диҳед
next-payment-method-header = Тарзи пардохти худро интихоб кунед
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Аввал шумо бояд обунаи худро тасдиқ кунед

## Page - Upgrade page

upgrade-page-payment-information = Маълумоти пардохт

## Authentication Error page

checkout-error-boundary-retry-button = Аз нав кӯшиш кардан
amex-logo-alt-text = Тамғаи «{ -brand-amex }»
diners-logo-alt-text = Тамғаи «{ -brand-diner }»
discover-logo-alt-text = Тамғаи «{ -brand-discover }»
jcb-logo-alt-text = Тамғаи «{ -brand-jcb }»
mastercard-logo-alt-text = Тамғаи «{ -brand-mastercard }»
paypal-logo-alt-text = Тамғаи «{ -brand-paypal }»
unionpay-logo-alt-text = Тамғаи «{ -brand-unionpay }»
visa-logo-alt-text = Тамғаи «{ -brand-visa }»

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Идоракунии обунаи ман
next-payment-error-retry-button = Аз нав кӯшиш кардан
next-basic-error-message = Чизе нодуруст иҷро шуд. Лутфан, баъдтар аз нав кӯшиш кунед.
checkout-error-contact-support-button = Дастаи дастгирии корбарон
checkout-error-already-subscribed = Шумо аллакай ба ин маҳсул обуна шудаед.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Лутфан, интизор шавед, пардохти шумо дар ҳоли коркард мебошад…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Ташаккур, акнун почтаи электронии худро тафтиш кунед!
next-payment-confirmation-order-heading = Тафсилоти фармоиш
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Санади дархости пардохт №{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Маълумоти пардохт

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Идома додани боргирӣ

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Корте, ки бо { $last4 } анҷом меёбад

## Page - Subscription Management

subscription-management-subscriptions-heading = Обунаҳо
subscription-management-nav-payment-details = Тафсилоти пардохт
subscription-management-payment-details-heading = Тафсилоти пардохт
subscription-management-email-label = Почтаи электронӣ
subscription-management-payment-method-label = Тарзи пардохт
subscription-management-button-add-payment-method-aria = Илова кардани тарзи пардохт
subscription-management-button-add-payment-method = Илова кардан
subscription-management-button-manage-payment-method = Идоракунӣ
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Корте, ки бо { $last4 } анҷом меёбад
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Муҳлаташ дар { $expirationDate } ба анҷом мерасад
subscription-management-button-support = Гирифтани кумак
error-payment-method-banner-title-invalid-payment-information = Маълумоти пардохт беэътибор аст
manage-payment-methods-heading = Идоракунии тарзҳои пардохт
# Page - Not Found
page-not-found-title = Саҳифа ёфт нашуд
page-not-found-back-button = Бозгашт

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Саҳифаи асосии ҳисоб
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Обунаҳо

## Checkout Form

next-new-user-submit = Ҳозир обуна шавед
next-payment-validate-name-error = Лутфан, номи пурраи худро ворид кунед
next-pay-with-heading-paypal = Бо «{ -brand-paypal }» пардохт кунед
# Label for the Full Name input
payment-name-label = Номе, ки дар корти бонкии шумо чоп шудааст
payment-name-placeholder = Номи пурра

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Рамзро ворид кунед
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Рамзи таблиғотӣ
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Рамзи таблиғотӣ татбиқ карда шуд
next-coupon-remove = Тоза кардан
next-coupon-submit = Татбиқ кардан

# Component - Header

payments-header-help =
    .title = Кумак
    .aria-label = Кумак
    .alt = Кумак
payments-header-bento =
    .title = Маҳсулоти «{ -brand-mozilla }»
    .aria-label = Маҳсулоти «{ -brand-mozilla }»
    .alt = Тамғаи «{ -brand-mozilla }»
payments-header-bento-close =
    .alt = Пӯшидан
payments-header-bento-tagline = Маҳсулоти бештар аз «{ -brand-mozilla }», ки махфияти шуморо муҳофизат мекунанд
payments-header-bento-firefox-desktop = Браузери «{ -brand-firefox }» барои мизи корӣ
payments-header-bento-firefox-mobile = Браузери «{ -brand-firefox }» барои дастгоҳи мобилӣ
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Аз ҷониби «{ -brand-mozilla }» сохта шудааст
payments-header-avatar =
    .title = Менюи «{ -product-mozilla-account }»
payments-header-avatar-icon =
    .alt = Расми профили ҳисоб
payments-header-avatar-expanded-sign-out = Баромад
payments-client-loading-spinner =
    .aria-label = Бор шуда истодааст…
    .alt = Бор шуда истодааст…

## Payment method management page - Stripe

# Save button for saving a new payment method
payment-method-management-save-method = Нигоҳ доштани тарзи пардохт
manage-stripe-payments-title = Идоракунии тарзҳои пардохт

## Payment Section

next-new-user-card-title = Маълумоти корти худро ворид кунед

## Component - PurchaseDetails

next-plan-details-header = Тафсилоти маҳсул
next-plan-details-list-price = Нархнома
next-plan-details-tax = Андозҳо ва ҳаққи хизматрасонӣ
next-plan-details-total-label = Ҳамагӣ
next-plan-details-hide-button = Пинҳон кардани тафсилот
next-plan-details-show-button = Намоиш додани тафсилот

## Select Tax Location

select-tax-location-title = Ҷойгиршавӣ
select-tax-location-edit-button = Таҳрир кардан
select-tax-location-save-button = Нигоҳ доштан
select-tax-location-continue-to-checkout-button = Идома додан ба қадами пардохти харид
select-tax-location-country-code-label = Кишвар
select-tax-location-country-code-placeholder = Кишвари худро интихоб кунед
select-tax-location-error-missing-country-code = Лутфан, кишвари худро интихоб кунед
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } дар ин ҷойгиршавӣ дастнорас аст.
select-tax-location-postal-code-label = Рамзи почта
select-tax-location-postal-code =
    .placeholder = Рамзи почтаи худро ворид кунед
select-tax-location-error-missing-postal-code = Лутфан, рамзи почтаи худро ворид кунед
select-tax-location-error-invalid-postal-code = Лутфан, рамзи почтаи дурустро ворид кунед
select-tax-location-successfully-updated = Ҷойгиршавии шумо навсозӣ карда шуд.
select-tax-location-error-location-not-updated = Ҷойгиршавии шумо навсозӣ карда намешавад. Лутфан, аз нав кӯшиш кунед.
signin-form-continue-button = Идома додан
signin-form-email-input = Почтаи электронии худро ворид кунед
signin-form-email-input-missing = Лутфан, почтаи электронии худро ворид намоед
next-new-user-subscribe-product-updates-mdnplus = Ман мехоҳам, ки аз «{ -product-mdn-plus }» ва «{ -brand-mozilla }» дар бораи маҳсулот хабарҳо ва навигариҳоро қабул кунам
next-new-user-subscribe-product-updates-mozilla = Ман мехоҳам, ки аз «{ -brand-mozilla }» дар бораи маҳсулот хабарҳо ва навигариҳоро қабул кунам
next-new-user-subscribe-product-updates-snp = Ман мехоҳам, ки аз «{ -brand-mozilla }» дар бораи амният ва махфият хабарҳо ва навигариҳоро қабул кунам

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } ҳар рӯз
plan-price-interval-weekly = { $amount } ҳар ҳафта
plan-price-interval-monthly = { $amount } ҳар моҳ
plan-price-interval-yearly = { $amount } ҳар сол

## Component - SubscriptionTitle

next-subscription-create-title = Обунаи худро танзим кунед
next-subscription-success-title = Тасдиқи обуна
next-subscription-processing-title = Дар ҳоли тасдиқи обуна…
next-subscription-error-title = Хатои тасдиқи обуна…
subscription-title-sub-exists = Шумо аллакай обуна шудаед
subscription-title-plan-change-heading = Тағйироти худро аз назар гузаронед
subscription-title-not-supported = Ин тағйироти нақшаи обуна дастгирӣ намешавад
next-sub-guarantee = Кафолати 30-рӯза барои бозпардохти маблағи шумо

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Шартҳои хизматрасонӣ
next-privacy = Огоҳномаи махфият
next-terms-download = Шартҳои боргирӣ
terms-and-privacy-stripe-link = Сиёсати махфияти «{ -brand-name-stripe }»
terms-and-privacy-paypal-link = Сиёсати махфияти «{ -brand-paypal }»

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Нақшаи ҷорӣ
upgrade-purchase-details-new-plan-label = Нақшаи нав
upgrade-purchase-details-promo-code = Рамзи таблиғотӣ
upgrade-purchase-details-tax-label = Андозҳо ва ҳаққи хизматрасонӣ

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (Барои ҳар рӯз)
upgrade-purchase-details-new-plan-weekly = { $productName } (Барои ҳар ҳафта)
upgrade-purchase-details-new-plan-monthly = { $productName } (Барои ҳар моҳ)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (Барои 6 моҳ)
upgrade-purchase-details-new-plan-yearly = { $productName } (Барои ҳар сол)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Пардохти харид | { $productTitle }
# Checkout error
metadata-title-checkout-error = Хато | { $productTitle }
# Checkout success
metadata-title-checkout-success = Муваффақият | { $productTitle }
# Upgrade start
metadata-title-upgrade-start = Такмил додан | { $productTitle }
# Upgrade error
metadata-title-upgrade-error = Хато | { $productTitle }
# Upgrade success
metadata-title-upgrade-success = Муваффақият | { $productTitle }
# Upgrade needs_input
metadata-title-upgrade-needs-input = Амал лозим аст | { $productTitle }
# Default
metadata-title-default = Саҳифа ёфт нашуд | { $productTitle }
