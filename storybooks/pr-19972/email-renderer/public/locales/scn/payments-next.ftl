## Page

checkout-signin-or-create = 1. Trasi o crìa un { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = o
continue-signin-with-google-button = Cuntinua cu { -brand-google }
continue-signin-with-apple-button = Cuntinua cu { -brand-apple }
next-payment-method-header = Scarta u to mètudu di pagamentu
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Pi prima cosa, hâ appruvari u to abbunamentu
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Scarta u to pajisi e metti u to còdici pustali <p>pi cuntinuari l’accàttitu di { $productName }</p>
location-banner-info = Nun pòttimu pigghiari di manera autumàtica i nfurmazzioni ncapu â to pusizzioni
location-required-disclaimer = Usamu sti nfurmazzioni sulu pi carculari i tassi e a valuta.
location-banner-currency-change = Nun suppurtamu u canciu di valuta. Pi cuntinuari, pi favuri scarta un pajisi chi appatta câ valuta di fatturazzioni.

## Page - Upgrade page

upgrade-page-payment-information = Nfurmazzioni di pagamentu
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = U to chianu veni attualizzatu sùbbitu, e ti veni addibbitatu chiḍḍu chi ammanca, di manera prupurziunali, pû restu dû piriudu di fatturazzioni. Accuminciannu dû { $nextInvoiceDate } ti veni addibbitata a còtima sana.

## Authentication Error page

auth-error-page-title = Nun ti pòttimu fari tràsiri
checkout-error-boundary-retry-button = Prova arrè
checkout-error-boundary-basic-error-message = Cci fu un prubblema. Pi favuri torna a prova o <contactSupportLink>cuntatta l’assistenza</contactSupportLink>.

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Manija u me abbunamentu
next-iap-blocked-contact-support = Ài n’abbunamentu in-app fattu d’un dispusitivu mòbbili chi va ’n cunflittu cu stu pruduttu — pi favuri cuntatta l’assistenza p’addumannari ajutu.
next-payment-error-retry-button = Prova arrè
next-basic-error-message = Cci fu un prubblema. Pi favuri torna a prova cchiù tardu.
checkout-error-contact-support-button = Cuntatta l’assistenza
checkout-error-not-eligible = Nun ti po’ abbunari a stu pruduttu. Pi favuri cuntatta l’assistenza p’addumannari ajutu.
checkout-error-already-subscribed = Già t’abbunasti a stu pruduttu.
checkout-error-contact-support = Pi favuri cuntatta l’assistenza p’addumannari ajutu.
cart-error-currency-not-determined = Nun pòttimu stabbiliri a valuta pi st’accàttitu, pi favuri torna a prova.
checkout-processing-general-error = Cci fu n’erruri mentri chi prucissàvamu u to pagamentu, pi favuri torna a prova.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Pi favuri aspetta mentri chi prucissamu u pagamentu…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Grazzi! Ora cuntrolla a to posta elittrònica.
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Hâ ricìviri na littra ô nnirizzu { $email } cu l’istruzzioni ncapu ô to abbunamentu, e chî to minutagghi di pagamentu.
next-payment-confirmation-order-heading = Minutagghi di l’ùrdini
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Fattura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Nfurmazzioni di pagamentu

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Cuntinua cû scarricamentu

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Carta chi finisci pi { $last4 }

## Page - Subscription Management

# Page - Not Found
page-not-found-title = Pàggina nun truvata
page-not-found-description = Nun attruvai a pàggina chi addumannasti. Ni fu signalijatu e circamu d’abbirsari tutti i lijami chi sfarsìjanu.
page-not-found-back-button = Vai nn’arrè

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Auturizzu { -brand-mozilla } a pigghiàrisi u mportu mustratu dû me mètudu di pagamentu, sicunnu i <termsOfServiceLink>tèrmini di sirbizzu</termsOfServiceLink> e l’<privacyNoticeLink>abbisu di privatizza</privacyNoticeLink>, nzinu a quannu nun mi disiscrivu.
next-payment-confirm-checkbox-error = Hâ cumplitari stu passaggiu prima di jiri innanzi

## Checkout Form

next-new-user-submit = Abbònati ora
next-pay-with-heading-paypal = Paga cu { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Metti u còdici
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Còdici prumuzziunali
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Còdici prumuzziunali usatu
next-coupon-remove = Leva
next-coupon-submit = Riggistra

# Component - Header

payments-header-help =
    .title = Ajutu
    .aria-label = Ajutu
    .alt = Ajutu
payments-header-bento =
    .title = Prudutti { -brand-mozilla }
    .aria-label = Prudutti { -brand-mozilla }
    .alt = Mercu { -brand-mozilla }
payments-header-bento-close =
    .alt = Chiuji
payments-header-bento-tagline = Autri prudutti { -brand-mozilla } chi prutègginu a to privatizza
payments-header-bento-firefox-desktop = { -brand-firefox } pû Scagnu
payments-header-bento-firefox-mobile = { -brand-firefox } pû Tilèfunu
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Fattu di { -brand-mozilla }
payments-header-avatar =
    .title = Minù di { -product-mozilla-account }
payments-header-avatar-icon =
    .alt = Mmàggini di prufilu pû cuntu
payments-header-avatar-expanded-signed-in-as = Trasisti comu
payments-header-avatar-expanded-sign-out = Nesci
payments-client-loading-spinner =
    .aria-label = Staju carricannu…
    .alt = Staju carricannu…

## Component - PurchaseDetails

next-plan-details-header = Minutagghi dû pruduttu
next-plan-details-list-price = Prezzu currenti
next-plan-details-tax = Tassi e cummissioni
next-plan-details-total-label = Tutali
next-plan-details-hide-button = Ammuccia i minutagghi
next-plan-details-show-button = Mustra i minutagghi
next-coupon-success = U to chianu veni rinnuvatu di manera autumàtica ô prezzu currenti.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = U to chianu veni rinnuvatu di manera autumàtica doppu { $couponDurationDate } ô prezzu currenti.

## Select Tax Location

select-tax-location-title = Pusizzioni
select-tax-location-edit-button = Cancia
select-tax-location-save-button = Sarba
select-tax-location-continue-to-checkout-button = Cuntinua cû pagamentu
select-tax-location-country-code-label = Pajisi
select-tax-location-country-code-placeholder = Scarta u to pajisi
select-tax-location-error-missing-country-code = Pi favuri scarta u to pajisi
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } nun è dispunìbbili nna stu locu.
select-tax-location-postal-code-label = Còdici pustali
select-tax-location-postal-code =
    .placeholder = Metti u to còdici pustali
select-tax-location-error-missing-postal-code = Pi favuri metti u to còdici pustali
select-tax-location-error-invalid-postal-code = Pi favuri metti un còdici pustali vàlitu
select-tax-location-successfully-updated = A to pusizzioni fu attualizzata.
select-tax-location-error-location-not-updated = Nun potti attualizzari a to pusizzioni. Pi favuri torna a prova.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = U to cuntu veni fatturatu cu { $currencyDisplayName }. Scarta un pajisi chi usa { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Scarta un pajisi chi appatta câ valuta dî to abbunamenti attivi.
select-tax-location-new-tax-rate-info = Si attualizzi a to pusizzioni veni canciata macari a tassazzioni di tutti l’abbunamenti attivi nnô to cuntu, accuminciannu dû ciclu di fatturazzioni vinturu.
signin-form-continue-button = Cuntinua
signin-form-email-input = Metti u to nnirizzu di posta elittrònica
signin-form-email-input-missing = Pi favuri metti u to nnirizzu di posta elittrònica
signin-form-email-input-invalid = Pi favuri metti nu nnirizzu di posta elittrònica vàlitu
next-new-user-subscribe-product-updates-mdnplus = Vogghiu aviri nutizzi e attualizzi ncapu ê prudutti di { -product-mdn-plus } e { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Vogghiu aviri nutizzi e attualizzi ncapu ê prudutti di { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = Vogghiu aviri nutizzi e attualizzi di sicurizza e privatizza di { -brand-mozilla }
next-new-user-subscribe-product-assurance = Usamu u to nnirizzu di posta elittrònica sulu pi crìari u to cuntu. Nun u vinnemu mai a nuḍḍu.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } ô jornu
plan-price-interval-weekly = { $amount } â simana
plan-price-interval-monthly = { $amount } ô misi
plan-price-interval-halfyearly = { $amount } ogni 6 misi
plan-price-interval-yearly = { $amount } ogni annu

## Component - SubscriptionTitle

next-subscription-create-title = Cunfijura u to abbunamentu
next-subscription-success-title = Cunferma di l’abbunamentu
next-subscription-processing-title = Staju cunfirmannu l’abbunamentu…
next-subscription-error-title = Cci fu un prubblema mentri chi cunfirmava l’abbunamentu…
subscription-title-sub-exists = Già t’abbunasti
subscription-title-plan-change-heading = Rividi u to canciu
subscription-title-not-supported = Stu canciu ô chianu d’abbunamentu nun è suppurtatu
next-sub-guarantee = Priggiarìa di rifazzioni pi 30 jorna

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Tèrmini di sirbizzu
next-privacy = Abbisu di privatizza
next-terms-download = Scàrrica i tèrmini
terms-and-privacy-stripe-label = { -brand-mozilla } usa { -brand-name-stripe } pi prucissari i pagamenti di manera sicura.
terms-and-privacy-stripe-link = Abbisu di privatizza di { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } usa { -brand-paypal } pi prucissari i pagamenti di manera sicura.
terms-and-privacy-paypal-link = Abbisu di privatizza di { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } usa { -brand-name-stripe } e { -brand-paypal } pi prucissari i pagamenti di manera sicura.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Chianu attuali
upgrade-purchase-details-new-plan-label = Chianu novu
upgrade-purchase-details-promo-code = Còdici prumuzziunali
upgrade-purchase-details-tax-label = Tassi e cummissioni

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (ô jornu)
upgrade-purchase-details-new-plan-weekly = { $productName } (â simana)
upgrade-purchase-details-new-plan-monthly = { $productName } (ô misi)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (ogni 6 misi)
upgrade-purchase-details-new-plan-yearly = { $productName } (a l’annu)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Pagamentu | { $productTitle }
metadata-description-checkout-start = Metti i nfurmazzioni pû pagamentu pi cumplitari l’accàttitu.
# Checkout processing
metadata-title-checkout-processing = Pagamentu ’n cursu | { $productTitle }
metadata-description-checkout-processing = Pi favuri aspetta mentri chi cumplitamu u to pagamentu.
# Checkout error
metadata-title-checkout-error = Erruri | { $productTitle }
metadata-description-checkout-error = Cci fu n’erruri mentri chi cunfirmàvamu l’abbunamentu. Si stu prubblema arresta, pi favuri cuntatta l’assistenza.
# Checkout success
metadata-title-checkout-success = Fattu | { $productTitle }
metadata-description-checkout-success = Cungratulazzioni! Cumplitasti u to accàttitu.
# Checkout needs_input
metadata-title-checkout-needs-input = Azzioni nicissaria | { $productTitle }
metadata-description-checkout-needs-input = Pi favuri fai soccu serbi pi jiri avanti cû pagamentu.
# Upgrade start
metadata-title-upgrade-start = Attualizza | { $productTitle }
metadata-description-upgrade-start = Metti i nfurmazzioni pû pagamentu pi cumplitari l’attualizzu.
# Upgrade processing
metadata-title-upgrade-processing = Pagamentu ’n cursu | { $productTitle }
metadata-description-upgrade-processing = Pi favuri aspetta mentri chi cumplitamu u to pagamentu.
# Upgrade error
metadata-title-upgrade-error = Erruri | { $productTitle }
metadata-description-upgrade-error = Cci fu n’erruri mentri chi cunfirmàvamu l’attualizzu. Si stu prubblema arresta, pi favuri cuntatta l’assistenza.
# Upgrade success
metadata-title-upgrade-success = Fattu | { $productTitle }
metadata-description-upgrade-success = Cungratulazzioni! Cumplitasti u to attualizzu.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Azzioni nicissaria | { $productTitle }
metadata-description-upgrade-needs-input = Pi favuri fai soccu serbi pi jiri avanti cû pagamentu.
# Default
metadata-title-default = Nun truvai a pàggina | { $productTitle }
metadata-description-default = Nun potti attruvari a pàggina chi addumannasti.

## Coupon Error Messages

next-coupon-error-expired = U còdici chi mittisti scadìu.
next-coupon-error-generic = Cci fu un prubblema riggistrannu u còdici. Pi favuri torna a prova.
next-coupon-error-invalid = U còdici chi mittisti nun è vàlitu.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = U còdici chi mittisti passau u so lìmiti d’usu.
