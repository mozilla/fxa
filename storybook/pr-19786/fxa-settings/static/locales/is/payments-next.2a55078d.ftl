## Page

checkout-signin-or-create = 1. Skráðu þig inn eða útbúðu { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = eða
continue-signin-with-google-button = Halda áfram með { -brand-google }
continue-signin-with-apple-button = Halda áfram með { -brand-apple }
next-payment-method-header = Veldu greiðslumáta þinn
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Fyrst þarftu að samþykkja áskriftina þína
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Veldu landið þitt og settu inn póstnúmerið þitt <p>til að halda áfram að ganga frá greiðslu fyrir { $productName } </p>
location-banner-info = Við gátum ekki greint staðsetningu þína sjálfkrafa
location-required-disclaimer = Við notum þessar upplýsingar eingöngu til að reikna út skatta og gjaldmiðil.

## Page - Upgrade page

upgrade-page-payment-information = Greiðsluupplýsingar
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment =
    Áskriftarleiðin þín mun breytast strax og þú færð kröfu um leiðrétta
    upphæð fyrir það sem eftir er af greiðslutímabilinu þínu. Frá og með 
    { $nextInvoiceDate } færð þú kröfu um alla upphæðina.

## Authentication Error page

checkout-error-boundary-retry-button = Reyna aftur
checkout-error-boundary-basic-error-message = Eitthvað fór úrskeiðis. Reyndu aftur eða <contactSupportLink>hafðu samband við aðstoðarteymið.</contactSupportLink>

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Sýsla með áskriftina mína
next-payment-error-retry-button = Reyndu aftur
next-basic-error-message = Eitthvað fór úrskeiðis. Reyndu aftur síðar.
checkout-error-contact-support-button = Hafa samband við aðstoðarteymi
checkout-error-not-eligible = Þú ert ekki gjaldgeng/ur til að gerast áskrifandi að þessum hugbúnaði - hafðu samband við aðstoðargáttina svo við getum hjálpað þér.
checkout-error-already-subscribed = Þú ert nú þegar áskrifandi að þessum hugbúnaði.
checkout-error-contact-support = Hafðu samband við aðstoðargáttina svo við getum hjálpað þér.
checkout-processing-general-error = Óvænt villa kom upp við vinnslu greiðslunnar þinnar, reyndu aftur.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Hinkraðu við á meðan við meðhöndlum greiðsluna þína…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Takk, athugaðu nú tölvupóstinn þinn!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Þú munt fá tölvupóst á { $email } með leiðbeiningum varðandi áskriftina þína, sem og greiðsluupplýsingar þínar.
next-payment-confirmation-order-heading = Upplýsingar um pöntun
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Reikningur #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Greiðsluupplýsingar

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Halda áfram í niðurhal

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Kort sem endar á { $last4 }

## Page - Subscription Management

# Page - Not Found
page-not-found-title = Síða fannst ekki
page-not-found-description = Síðan sem þú baðst um fannst ekki. Við höfum fengið tilkynningu og munum fara í að lagfæra þá tengla sem eru bilaðir.
page-not-found-back-button = Til baka

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Ég heimila hér með { -brand-mozilla } að millifæra tilgreinda upphæð af greiðslumátanum mínum, samkvæmt <termsOfServiceLink >þjónustuskilmálum</termsOfServiceLink> og <privacyNoticeLink>stefnu um meðferð persónuupplýsinga</privacyNoticeLink>, þar til ég segi upp áskriftinni.
next-payment-confirm-checkbox-error = Þú þarft að ljúka þessu áður en þú heldur áfram

## Checkout Form

next-new-user-submit = Gerast áskrifandi núna
next-payment-validate-name-error = Settu inn nafnið þitt
next-pay-with-heading-paypal = Greiða með { -brand-paypal }
# Label for the Full Name input
payment-name-label = Nafn eins og það birtist á kortinu þínu
payment-name-placeholder = Fullt nafn

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Settu inn kóða
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Kynningarkóði
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Kynningarkóði notaður
next-coupon-remove = Fjarlægja
next-coupon-submit = Virkja

# Component - Header

payments-header-help =
    .title = Hjálp
    .aria-label = Hjálp
    .alt = Hjálp
payments-header-bento =
    .title = { -brand-mozilla } hugbúnaður
    .aria-label = { -brand-mozilla } hugbúnaður
    .alt = { -brand-mozilla } táknmerki
payments-header-bento-close =
    .alt = Loka
payments-header-bento-tagline = Fleiri vörur frá { -brand-mozilla } sem vernda friðhelgi þína
payments-header-bento-firefox-desktop = { -brand-firefox }-vafri fyrir vinnutölvur
payments-header-bento-firefox-mobile = { -brand-firefox }-vafri fyrir farsíma
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Gert af { -brand-mozilla }
payments-header-avatar =
    .title = { -product-mozilla-account }-valmynd
payments-header-avatar-icon =
    .alt = Auðkennismynd reiknings
payments-header-avatar-expanded-signed-in-as = Skráð/ur inn sem
payments-header-avatar-expanded-sign-out = Skrá út
payments-client-loading-spinner =
    .aria-label = Hleður…
    .alt = Hleður…

## Payment Section

next-new-user-card-title = Settu inn kortaupplýsingarnar þínar

## Component - PurchaseDetails

next-plan-details-header = Upplýsingar um vöru
next-plan-details-list-price = Listaverð
next-plan-details-tax = Skattar og gjöld
next-plan-details-total-label = Samtals
next-plan-details-hide-button = Fela ítarupplýsingar
next-plan-details-show-button = Sjá nánari upplýsingar
next-coupon-success = Áskriftarleiðin þín mun sjálfkrafa endurnýjast á listaverði.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Áskriftin þín endurnýjast sjálfkrafa eftir { $couponDurationDate } á listaverði.

## Select Tax Location

select-tax-location-title = Staðsetning
select-tax-location-edit-button = Breyta
select-tax-location-save-button = Vista
select-tax-location-continue-to-checkout-button = Halda áfram í greiðslu
select-tax-location-country-code-label = Land
select-tax-location-country-code-placeholder = Veldu landið þitt
select-tax-location-error-missing-country-code = Veldu landið þitt
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } er ekki í boði á þessum stað.
select-tax-location-postal-code-label = Póstnúmer
select-tax-location-postal-code =
    .placeholder = Settu inn póstnúmerið þitt
select-tax-location-error-missing-postal-code = Settu inn póstnúmerið þitt
select-tax-location-error-invalid-postal-code = Settu inn löglegt póstnúmer
select-tax-location-successfully-updated = Staðsetningin þín hefur verið uppfærð.
select-tax-location-error-location-not-updated = Ekki var hægt að uppfæra staðsetninguna þína. Endilega reyndu aftur.
select-tax-location-invalid-currency-change-default = Veldu land sem passar við gjaldmiðil virkra áskrifta þinna.
signin-form-continue-button = Halda áfram
signin-form-email-input = Settu inn tölvupóstfangið þitt
signin-form-email-input-missing = Settu inn tölvupóstfangið þitt
signin-form-email-input-invalid = Gefðu upp gilt tölvupóstfang.
next-new-user-subscribe-product-updates-mdnplus = Ég myndi vilja fá upplýsingar um hugbúnað og uppfærslur frá { -product-mdn-plus } og { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Ég myndi vilja fá upplýsingar um hugbúnað og uppfærslur frá { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = Ég myndi vilja fá fréttir um öryggismál og friðhelgi frá { -brand-mozilla }
next-new-user-subscribe-product-assurance = Við notum aðeins tölvupóstfangið þitt til að búa til reikninginn þinn. Við munum aldrei selja það til utanaðkomandi aðila.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } daglega
plan-price-interval-weekly = { $amount } vikulega
plan-price-interval-monthly = { $amount } mánaðarlega
plan-price-interval-halfyearly = { $amount } á 6 mánaða fresti
plan-price-interval-yearly = { $amount } á ári

## Component - SubscriptionTitle

next-subscription-create-title = Settu upp áskriftina þína
next-subscription-success-title = Staðfesting áskriftar
next-subscription-processing-title = Staðfesti áskrift…
next-subscription-error-title = Villa við að staðfesta áskrift…
subscription-title-sub-exists = Þú ert nú þegar áskrifandi
subscription-title-plan-change-heading = Farðu yfir breytinguna þína
next-sub-guarantee = 30-daga skilafrestur

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Þjónustuskilmálar
next-privacy = Meðferð persónuupplýsinga
next-terms-download = Sækja skilmála
terms-and-privacy-stripe-label = { -brand-mozilla } notar { -brand-name-stripe } fyrir örugga vinnslu greiðslna.
terms-and-privacy-stripe-link = Persónuverndarstefna { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } notar { -brand-paypal } fyrir örugga vinnslu greiðslna.
terms-and-privacy-paypal-link = Persónuverndarstefna { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } notar { -brand-name-stripe } og { -brand-paypal } fyrir örugga vinnslu greiðslna.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Núverandi áskriftarleið
upgrade-purchase-details-new-plan-label = Ný áskriftarleið
upgrade-purchase-details-promo-code = Kynningarkóði
upgrade-purchase-details-tax-label = Skattar og gjöld

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (daglega)
upgrade-purchase-details-new-plan-weekly = { $productName } (vikulega)
upgrade-purchase-details-new-plan-monthly = { $productName } (mánaðarlega)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 mánuðir)
upgrade-purchase-details-new-plan-yearly = { $productName } (árlega)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Afgreiðsla | { $productTitle }
# Checkout processing
metadata-title-checkout-processing = Vinnsla | { $productTitle }
# Checkout error
metadata-title-checkout-error = Villa | { $productTitle }
# Checkout success
metadata-title-checkout-success = Tókst | { $productTitle }
# Checkout needs_input
metadata-title-checkout-needs-input = Aðgerðar krafist | { $productTitle }
# Upgrade start
metadata-title-upgrade-start = Uppfærsla | { $productTitle }
# Upgrade processing
metadata-title-upgrade-processing = Vinnsla | { $productTitle }
# Upgrade error
metadata-title-upgrade-error = Villa | { $productTitle }
# Upgrade success
metadata-title-upgrade-success = Tókst | { $productTitle }
# Upgrade needs_input
metadata-title-upgrade-needs-input = Aðgerðar krafist | { $productTitle }
# Default
metadata-title-default = Síða fannst ekki | { $productTitle }
