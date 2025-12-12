## Page

# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = neɣ
continue-signin-with-google-button = Kemmel s { -brand-google }
continue-signin-with-apple-button = Kemmel s { -brand-apple }
next-payment-method-header = Fren tarrayt-ik·im n lexlaṣ
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }

## Page - Upgrade page

upgrade-page-payment-information = Talɣut n lexlaṣ

## Authentication Error page

checkout-error-boundary-retry-button = Ɛreḍ tikelt niḍen

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Sefrek amulteɣ-inu
next-payment-error-retry-button = Ɛreḍ tikkelt-nniḍen
next-basic-error-message = Yella wayen ur nteddu ara akken ilaq. Ma ulac aɣilif, εreḍ tikkelt-nniḍen.
checkout-error-contact-support-button = Nadi tallalt
checkout-processing-general-error = Tuccḍa ur netturaǧu ara teḍra-d deg usesfer lexlaṣ-ik·im, ɛreḍ tikkelt-nniḍen.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Ttxil-k·m ṛǧu mi ara nsesfer asellek-inek·inem…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Tanemmirt, senqed tura imayl-ik·im!
next-payment-confirmation-order-heading = Talqayt n usuter
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Tafaṭurt #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Talɣut n lexlaṣ

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Kemmel akken ad d-tsidreḍ

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Takarḍa ad tfakk deg { $last4 }

## Page - Subscription Management

# Page - Not Found
page-not-found-title = Ulac asebter
page-not-found-description = Asebter i d-sutreḍ ulac-it. Aqlaɣ neẓra udiɣ ad nseggem yal aseɣwen yeṛzen.
page-not-found-back-button = Uɣal

## Checkout Form

next-new-user-submit = Multeɣ tura
next-payment-validate-name-error = Ma ulac aɣilif, sekcem-d isem-inek
next-pay-with-heading-paypal = Xelleṣ { -brand-paypal }
payment-name-placeholder = Isem ummid

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Sekcem tangalt
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Tangalt promo
next-coupon-remove = Kkes
next-coupon-submit = Snes

# Component - Header

payments-header-help =
    .title = Tallalt
    .aria-label = Tallalt
    .alt = Tallalt
payments-header-bento =
    .title = Ifarisen n { -brand-mozilla }
    .aria-label = Ifarisen n { -brand-mozilla }
    .alt = Alugu { -brand-mozilla }
payments-header-bento-close =
    .alt = Mdel
payments-header-bento-firefox-desktop = Iminig { -brand-firefox } i tnarit
payments-header-bento-firefox-mobile = Iminig { -brand-firefox } i uziraz
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-avatar-icon =
    .alt = Tugna n umaɣnu n umiḍan
payments-header-avatar-expanded-signed-in-as = Tkecmeḍ s yisem
payments-header-avatar-expanded-sign-out = Ffeɣ
payments-client-loading-spinner =
    .aria-label = Asali…
    .alt = Asali…

## Payment Section

next-new-user-card-title = Sekcem talɣut-ik·im n yimayl

## Component - PurchaseDetails

next-plan-details-header = Talqayt n ufaris
next-plan-details-list-price = Tabdart n leswam
next-plan-details-total-label = Asemday
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Yettwasnas usmad
next-plan-details-hide-button = Ffer talqayt
next-plan-details-show-button = Sken talqayt
next-coupon-success = Aɣawas-ik·im ad ttuεawed s wudem awurman ɣer ssuma yellan tura.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Aɣawas-ik·im ad yettuεawed s wudem awuran seld { $couponDurationDate } ɣer ssuma tamirant.

## Select Tax Location

select-tax-location-title = Adig
select-tax-location-edit-button = Ẓreg
select-tax-location-save-button = Sekles
select-tax-location-country-code-label = Tamurt
select-tax-location-country-code-placeholder = Fren tamurt·ik·im
select-tax-location-error-missing-country-code = Ttxil-k fren tamurt-ik
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } ulac-it deg waddig-a.
select-tax-location-postal-code-label = Tangalt n pusṭa
select-tax-location-postal-code =
    .placeholder = Selkcem tangalt n lbusṭa
select-tax-location-error-missing-postal-code = Ttxil-k selkcem tangalt n lbusṭa
signin-form-continue-button = Kemmel
signin-form-email-input = Sekcem imayl-inek·inem
signin-form-email-input-missing = Sekcem-d imayl-ik·im, ma ulac aɣilif
next-new-user-subscribe-product-assurance = Nseqdac kan imayl-ik·im i wakken ad nernu amiḍan-ik·im. Urǧin ad t-nsenz i wis kraḍ.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-halfyearly = { $amount } yal 6 wayyuren
plan-price-interval-yearly = { $amount } i useggas

## Component - SubscriptionTitle

next-subscription-create-title = Sbadu amulteɣ-ik·im
next-subscription-success-title = Asentem n umulteɣ
next-subscription-processing-title = Asentem n umulteɣ…
next-subscription-error-title = Tuccḍa deg usentem n umulteɣ…
subscription-title-plan-change-heading = Senqed asnifel-ik·im
next-sub-guarantee = Ṭṭmana n tiririt n yidrimen n 30 n wussan

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Tiwtilin n useqdec
next-privacy = Tasertit n tbaḍnit
next-terms-download = Tiwtilin n usader
terms-and-privacy-stripe-label = { -brand-mozilla } isseqdac { -brand-name-stripe } i usesfer aɣelsan n yiselliken.
terms-and-privacy-stripe-link = Tasertit tabaḍnit n { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } isseqdac { -brand-paypal } i usesfer aɣelsan n yiselliken.
terms-and-privacy-paypal-link = Tasertit tabaḍnit n { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } isseqdac { -brand-name-stripe } akked { -brand-paypal } i usesfer aɣelsan n yiselliken.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Aɣawas amiran
upgrade-purchase-details-new-plan-label = Aɣawas amaynut
upgrade-purchase-details-promo-code = Tangalt promo

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (yal ass)
upgrade-purchase-details-new-plan-weekly = { $productName } (i ddurt)
upgrade-purchase-details-new-plan-monthly = { $productName } (i wayyur)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6-wayyuren)
upgrade-purchase-details-new-plan-yearly = { $productName } (i useggas)
