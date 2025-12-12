## Page

# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = немесе
continue-signin-with-google-button = { -brand-google } арқылы жалғастыру
continue-signin-with-apple-button = { -brand-apple } арқылы жалғастыру
next-payment-method-header = Төлем әдісін таңдаңыз
next-payment-method-first-approve = Алдымен жазылуыңызды растауыңыз керек

## Page - Upgrade page

upgrade-page-payment-information = Төлем ақпараты

## Authentication Error page

checkout-error-boundary-retry-button = Қайтадан көру
amex-logo-alt-text = { -brand-amex } логотипі
diners-logo-alt-text = { -brand-diner } логотипі
discover-logo-alt-text = { -brand-discover } логотипі
jcb-logo-alt-text = { -brand-jcb } логотипі
mastercard-logo-alt-text = { -brand-mastercard } логотипі
paypal-logo-alt-text = { -brand-paypal } логотипі
unionpay-logo-alt-text = { -brand-unionpay } логотипі
visa-logo-alt-text = { -brand-visa } логотипі
# Alt text for generic payment card logo
unbranded-logo-alt-text = Брендсіз логотип
link-logo-alt-text = { -brand-link } логотипі
apple-pay-logo-alt-text = { -brand-apple-pay } логотипі
google-pay-logo-alt-text = { -brand-google-pay } логотипі

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Менің жазылуымды басқару
next-payment-error-retry-button = Қайтадан көру
next-basic-error-message = Бірнәрсе қате кетті. Кейінірек қайталап көріңіз.
checkout-error-contact-support-button = Қолдау қызметіне хабарласу
checkout-error-already-subscribed = Сіз бұл өнімге жазылып қойғансыз.
checkout-processing-general-error = Төлеміңізді өңдеу кезінде күтпеген қате орын алды, әрекетті қайталаңыз.
cart-total-mismatch-error = Шот сомасы өзгерді. Қайталап көріңіз.

## Error pages - Payment method failure messages

intent-card-error = Транзакцияны өңдеу мүмкін болмады. Несие карта ақпаратын тексеріп, әрекетті қайталаңыз.
intent-expired-card-error = Несие картаңыздың мерзімі өтіп кеткен сияқты. Басқа картаны қолданып көріңіз.
intent-payment-error-try-again = Төлеміңізді авторизациялау кезінде мәселе орын алды. Қайталап көріңіз немесе карта шығарушысымен байланысыңыз.
intent-payment-error-get-in-touch = Төлеміңізді авторизациялау кезінде мәселе орын алды. Карта шығарушысымен байланысыңыз.
intent-payment-error-generic = Төлеміңізді өңдеу кезінде күтпеген қате орын алды, әрекетті қайталаңыз.
intent-payment-error-insufficient-funds = Сіздің картаңызда қаражат жеткіліксіз сияқты. Басқа картаны қолданып көріңіз.
general-paypal-error = Төлеміңізді өңдеу кезінде күтпеген қате орын алды, әрекетті қайталаңыз.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Төлеміңізді өңделгенше күтіңіз…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Рахмет, енді эл. поштаңызды тексеріңіз!
next-payment-confirmation-order-heading = Тапсырыс мәліметтері
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = №{ $invoiceNumber } шот-фактура
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Төлем ақпараты

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Жүктеп алуды жалғастыру

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = { $last4 } аяқталатын карта

## Page - Subscription Management

subscription-management-subscriptions-heading = Жазылулар
subscription-management-button-add-payment-method-aria = Төлем әдісін қосу
subscription-management-button-add-payment-method = Қосу
subscription-management-button-manage-payment-method-aria = Төлем әдісін басқару
subscription-management-button-manage-payment-method = Басқару
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = { $last4 } деп аяқталатын карта
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Мерзімі { $expirationDate } күні аяқталады
subscription-management-button-support = Көмек алу
subscription-management-your-apple-iap-subscriptions-aria = Сіздің { -brand-apple } қолданбадағы жазылымдарыңыз
paypal-payment-management-page-invalid-header = Төлем ақпараты жарамсыз
# Page - Not Found
page-not-found-title = Бет табылмады
page-not-found-description = Сіз сұраған бет табылмады. Ол туралы біз хабарды алдық, және қате бола алатын сілтемелерді жөндейміз.
page-not-found-back-button = Артқа

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Тіркелгінің басты беті
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Жазылулар

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Мен { -brand-mozilla } компаниясына, оның <termsOfServiceLink>Қызмет көрсету шарттары</termsOfServiceLink> және <privacyNoticeLink>Жекелік ескертуіне</privacyNoticeLink> сәйкес, мен жазылудан бас тартқанша дейін, көрсетілген сома үшін төлем әдісімнен ақы алуға рұқсат беремін.
next-payment-confirm-checkbox-error = Алға жылжу алдында осыны аяқтауыңыз керек.

## Checkout Form

next-new-user-submit = Қазір жазылу
next-payment-validate-name-error = Атыңызды енгізіңіз
next-pay-with-heading-paypal = { -brand-paypal } арқылы төлеу
# Label for the Full Name input
payment-name-label = Картаңызда көрсетілгендей атыңыз
payment-name-placeholder = Толық аты

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Кодты енгізіңіз
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Промокод
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Промокоды іске асырылды
next-coupon-remove = Өшіру
next-coupon-submit = Іске асыру

# Component - Header

payments-header-help =
    .title = Көмек
    .aria-label = Көмек
    .alt = Көмек
payments-header-bento =
    .title = { -brand-mozilla } өнімдері
    .aria-label = { -brand-mozilla } өнімдері
    .alt = { -brand-mozilla } логотипі
payments-header-bento-close =
    .alt = Жабу
payments-header-bento-tagline = Жекелігіңізді қорғайтын басқа да { -brand-mozilla } өнімдері
payments-header-bento-firefox-desktop = Компьютер үшін { -brand-firefox } браузері
payments-header-bento-firefox-mobile = Мобильді { -brand-firefox } браузері
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = { -brand-mozilla } жасаған
payments-header-avatar =
    .title = { -product-mozilla-account } мәзірі
payments-header-avatar-icon =
    .alt = Тіркелгі профилінің суреті
payments-header-avatar-expanded-signed-in-as = Кім ретінде кірген
payments-header-avatar-expanded-sign-out = Шығу
payments-client-loading-spinner =
    .aria-label = Жүктелуде…
    .alt = Жүктелуде…

## Payment method management page - Stripe

# Save button for saving a new payment method
payment-method-management-save-method = Төлем әдісін сақтау
manage-stripe-payments-title = Төлем әдістерін басқару

## Payment Section

next-new-user-card-title = Карта ақпаратын енгізіңіз

## Component - PurchaseDetails

next-plan-details-header = Өнім мәліметтері
next-plan-details-list-price = Прейскурант
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = { $productName } үшін пропорционалды баға
next-plan-details-tax = Салықтар мен алымдар
next-plan-details-total-label = Барлығы
purchase-details-subtotal-label = Аралық сома
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Несие қолданылды
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Жалпы сома
next-plan-details-hide-button = Мәліметтерді жасыру
next-plan-details-show-button = Мәліметтерді көрсету
next-coupon-success = Сіздің жоспарыңыз тізімдік баға бойынша автоматты түрде жаңартылады.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Жоспарыңыз тізім бағасы бойынша { $couponDurationDate } кейін автоматты түрде жаңартылады.

## Select Tax Location

select-tax-location-title = Орналасу
select-tax-location-edit-button = Түзету
select-tax-location-save-button = Сақтау
select-tax-location-country-code-label = Ел
select-tax-location-country-code-placeholder = Еліңізді таңдаңыз
select-tax-location-error-missing-country-code = Еліңізді таңдаңыз
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } бұл орналасу үшін қолжетімді емес.
select-tax-location-postal-code-label = Пошта индексі
select-tax-location-postal-code =
    .placeholder = Пошта индексіңізді енгізіңіз
select-tax-location-error-missing-postal-code = Пошта индексіңізді енгізіңіз
select-tax-location-error-invalid-postal-code = Жарамды пошта индексін енгізіңіз
select-tax-location-successfully-updated = Орналасқан жеріңіз жаңартылды.
select-tax-location-error-location-not-updated = Орналасқан жеріңізді жаңарту мүмкін болмады. Қайталап көріңіз.
signin-form-continue-button = Жалғастыру
signin-form-email-input = Эл. поштаны енгізіңіз
signin-form-email-input-missing = Эл. поштаңызды енгізіңіз
signin-form-email-input-invalid = Жарамды эл. поштаны көрсетіңіз
next-new-user-subscribe-product-updates-mdnplus = Мен { -product-mdn-plus } және { -brand-mozilla } өнім жаңалықтары мен жаңартуларын алғым келеді
next-new-user-subscribe-product-updates-mozilla = Мен { -brand-mozilla } өнім жаңалықтары мен жаңартуларын алғым келеді
next-new-user-subscribe-product-updates-snp = Мен { -brand-mozilla } ұсынған қауіпсіздік пен жекелік жаңалықтары мен жаңартуларын алғым келеді
next-new-user-subscribe-product-assurance = Біз эл. поштаңызды тек тіркелгіңізді жасау үшін пайдаланамыз. Біз оны ешқашан үшінші тарапқа сатпаймыз.

## $productName (String) - The name of the subscribed product.

resubscribe-success-dialog-title = Рахмет! Барлығы дайын.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } күн сайын
plan-price-interval-weekly = { $amount } апта сайын
plan-price-interval-monthly = { $amount } ай сайын
plan-price-interval-halfyearly = { $amount } әр 6 ай сайын
plan-price-interval-yearly = { $amount } жыл сайын

## Component - SubscriptionTitle

next-subscription-create-title = Жазылуыңызды реттеу
next-subscription-success-title = Жазылуды растау
next-subscription-processing-title = Жазылуды растау…
next-subscription-error-title = Жазылуды растау қатесі…
subscription-title-plan-change-heading = Өзгерісіңізді қарап шығыңыз
subscription-title-not-supported = Бұл жазылу жоспарын өзгертуге қолдау көрсетілмейді
next-sub-guarantee = Ақшаны қайтарудың 30-күндік кепілдігі

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Қолдану шарттары
next-privacy = Жекелік ескертуі
next-terms-download = Жүктеп алу шарттары
terms-and-privacy-stripe-label = { -brand-mozilla } төлемдерді қауіпсіз өңдеу үшін { -brand-name-stripe } пайдаланады.
terms-and-privacy-stripe-link = { -brand-name-stripe } жекелік саясаты
terms-and-privacy-paypal-label = { -brand-mozilla } төлемдерді қауіпсіз өңдеу үшін { -brand-paypal } пайдаланады.
terms-and-privacy-paypal-link = { -brand-paypal } жекелік саясаты
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } төлемдерді қауіпсіз өңдеу үшін { -brand-name-stripe } және { -brand-paypal } пайдаланады.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Ағымдағы жоспар
upgrade-purchase-details-new-plan-label = Жаңа жоспар
upgrade-purchase-details-promo-code = Промокод
upgrade-purchase-details-tax-label = Салықтар мен алымдар

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (күн сайын)
upgrade-purchase-details-new-plan-weekly = { $productName } (апта сайын)
upgrade-purchase-details-new-plan-monthly = { $productName } (ай сайын)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 ай сайын)
upgrade-purchase-details-new-plan-yearly = { $productName } (жыл сайын)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Төлеу | { $productTitle }
# Checkout error
metadata-title-checkout-error = Қате | { $productTitle }
metadata-description-checkout-error = Жазылымыңызды өңдеу кезінде қате орын алды. Бұл мәселе шешілмесе, қолдау қызметіне хабарласыңыз.
# Checkout success
metadata-title-checkout-success = Сәтті | { $productTitle }
# Upgrade error
metadata-title-upgrade-error = Қате | { $productTitle }
metadata-description-upgrade-error = Жаңартуды өңдеу кезінде қате орын алды. Бұл мәселе шешілмесе, қолдау қызметіне хабарласыңыз.
# Upgrade success
metadata-title-upgrade-success = Сәтті | { $productTitle }
metadata-description-upgrade-success = Құттықтаймыз! Сіз жаңартуды сәтті аяқтадыңыз.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Әрекет қажет | { $productTitle }
# Default
metadata-title-default = Бет табылмады | { $productTitle }
metadata-description-default = Сіз сұраған бет табылмады.

## Coupon Error Messages

next-coupon-error-expired = Сіз енгізген кодтың мерзімі аяқталды.
