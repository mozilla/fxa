## Page

next-payment-method-header = Түләү ысулын сайлагыз
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }

## Authentication Error page

diners-logo-alt-text = { -brand-diner } логотибы
discover-logo-alt-text = { -brand-discover } логотибы
jcb-logo-alt-text = { -brand-jcb } логотибы
mastercard-logo-alt-text = { -brand-mastercard } логотибы
paypal-logo-alt-text = { -brand-paypal } логотибы
unionpay-logo-alt-text = { -brand-unionpay } логотибы
visa-logo-alt-text = { -brand-visa } логотибы
link-logo-alt-text = { -brand-link } логотибы
apple-pay-logo-alt-text = { -brand-apple-pay } логотибы
google-pay-logo-alt-text = { -brand-google-pay } логотибы

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Минем язылу белән идарә итү
next-payment-error-retry-button = Янәдән тырышып карау
next-basic-error-message = Нидер булды. Зинһар соңрак тырышып карагыз.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Сезнең түләү эшкәртелә. Зинһар, көтегез…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Рәхмәт, ә хәзер эл. почтагызны тикшерегез!
next-payment-confirmation-order-heading = Заказ нечкәлекләре
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Квитанция №{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Түләү турындагы мәгълүмат

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Йөкләүне дәвам итү

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = { $last4 } белән тәмамланучы карта

## Checkout Form

next-new-user-submit = Хәзер үк язылу

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Кодны кертү
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Промо-код
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Промо-код кулланылды
next-coupon-remove = Бетерү
next-coupon-submit = Куллану

##


# Component - Header

payments-header-bento-close =
    .alt = Ябу
payments-header-bento-firefox-desktop = Компьютерлар өчен { -brand-firefox } браузеры
payments-header-bento-firefox-mobile = Мобиль җиһазлар өчен { -brand-firefox } браузеры
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-avatar =
    .title = { -product-mozilla-account } менюсы

## Component - PurchaseDetails

next-plan-details-header = Продукт нечкәлекләре
next-plan-details-list-price = Бәяләр исемлеге
next-plan-details-tax = Салымнар һәм түләүләр
next-plan-details-total-label = Барлыгы
next-plan-details-hide-button = Нечкәлекләрен яшерү
next-plan-details-show-button = Нечкәлекләрен күрсәтү

## Select Tax Location

select-tax-location-edit-button = Үзгәртү
select-tax-location-save-button = Саклау
signin-form-continue-button = Дәвам итү
next-new-user-subscribe-product-updates-mozilla = Мин { -brand-mozilla } җибәргән яңалыклардан хәбәрдар булырга телим
next-new-user-subscribe-product-updates-snp = Мин { -brand-mozilla } җибәргән куркынычсызлык һәм хосусыйлык яңалыкларыннан һәм яңартулардан хәбәрдар булырга телим

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }

## Component - SubscriptionTitle

next-subscription-create-title = Язылуларыгызны көйләү
next-subscription-success-title = Язылуны раслау
next-subscription-processing-title = Язылуны раслау…
next-subscription-error-title = Язылуны раслау хатасы…
next-sub-guarantee = 30 көн эчендә акчаны кире кайтару гарантиясе

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Куллану Шартлары
next-privacy = Хосусыйлык сәясәте
next-terms-download = Куллану шартларын йөкләп алу

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout error
metadata-title-checkout-error = Хата | { $productTitle }
# Checkout success
metadata-title-checkout-success = Уңышлы | { $productTitle }
# Upgrade error
metadata-title-upgrade-error = Хата | { $productTitle }
# Upgrade success
metadata-title-upgrade-success = Уңышлы | { $productTitle }
