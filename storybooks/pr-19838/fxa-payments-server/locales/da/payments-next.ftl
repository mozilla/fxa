loyalty-discount-terms-heading = Vilkår og begrænsninger
loyalty-discount-terms-support = Kontakt support
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
loyalty-discount-terms-contact-support-product-aria = Kontakt support for { $productName }
not-found-page-title-terms = Siden blev ikke fundet
not-found-page-description-terms = Den side, du leder efter, findes ikke.
not-found-page-button-terms-manage-subscriptions = Håndter abonnementer

## Page

checkout-signin-or-create = 1. Log ind eller opret en { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = eller
continue-signin-with-google-button = Fortsæt med { -brand-google }
continue-signin-with-apple-button = Fortsæt med { -brand-apple }
next-payment-method-header = Vælg din betalingsmetode
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Først skal du godkende dit abonnement
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Vælg dit land og indtast dit postnummer <p>for at fortsætte til betalingen af { $productName }</p>
location-banner-info = Vi kunne ikke fastslå din position automatisk
location-required-disclaimer = Vi bruger kun denne information til at beregne afgifter og valutakurser.
location-banner-currency-change = Ændring af valuta understøttes ikke. Vælg et land, der matcher din nuværende faktureringsvaluta, for at fortsætte.

## Page - Upgrade page

upgrade-page-payment-information = Betalingsinformation
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Din plan bliver ændret med det samme, og du vil blive opkrævet et forholdsmæssigt beløb i dag for resten af denne faktureringsperiode. Fra og med { $nextInvoiceDate } vil du blive opkrævet det fulde beløb.

## Authentication Error page

auth-error-page-title = Vi kunne ikke logge dig ind
checkout-error-boundary-retry-button = Prøv igen
checkout-error-boundary-basic-error-message = Noget gik galt. Prøv igen eller <contactSupportLink>kontakt support.</contactSupportLink>
amex-logo-alt-text = { -brand-amex }-logo
diners-logo-alt-text = { -brand-diner }-logo
discover-logo-alt-text = { -brand-discover }-logo
jcb-logo-alt-text = { -brand-jcb }-logo
mastercard-logo-alt-text = { -brand-mastercard }-logo
paypal-logo-alt-text = { -brand-paypal }-logo
unionpay-logo-alt-text = { -brand-unionpay }-logo
visa-logo-alt-text = { -brand-visa }-logo
# Alt text for generic payment card logo
unbranded-logo-alt-text = Umærket logo
link-logo-alt-text = { -brand-link }-logo
apple-pay-logo-alt-text = { -brand-apple-pay }-logo
google-pay-logo-alt-text = { -brand-google-pay }-logo

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Håndter mine abonnementer
next-iap-blocked-contact-support = Du har købt et abonnement i mobil-appen, der er i konflikt med dette produkt. Kontakt supporten, så vi kan hjælpe dig.
next-payment-error-retry-button = Prøv igen
next-basic-error-message = Noget gik galt. Prøv igen senere.
checkout-error-contact-support-button = Kontakt Support
checkout-error-not-eligible = Du er ikke berettiget til at abonnere på dette produkt. Kontakt supporten, så vi kan hjælpe dig.
checkout-error-already-subscribed = Du abonnerer allerede på dette produkt.
checkout-error-contact-support = Kontakt supporten, så vi kan hjælpe dig.
cart-error-currency-not-determined = Vi var ikke i stand til at fastslå valutaen for dette køb. Prøv igen.
checkout-processing-general-error = Der opstod en uventet fejl under behandlingen af din betaling. Prøv igen.
cart-total-mismatch-error = Fakturabeløbet er ændret. Prøv igen.

## Error pages - Payment method failure messages

intent-card-error = Din transaktion kunne ikke behandles. Bekræft oplysningerne om dit betalingskort og prøv igen.
intent-expired-card-error = Det ser ud til, at dit betalingskort er udløbet. Prøv med et andet kort.
intent-payment-error-try-again = Hmm. Der opstod et problem med at godkende din betaling. Prøv igen eller kontakt din kortudsteder.
intent-payment-error-get-in-touch = Hmm. Der opstod et problem med at godkende din betaling. Kontakt din kortudsteder.
intent-payment-error-generic = Der opstod en uventet fejl under behandlingen af din betaling. Prøv igen.
intent-payment-error-insufficient-funds = Det ser ud til, at der ikke er penge nok på dit kort. Prøv et andet kort.
general-paypal-error = Der opstod en uventet fejl under behandlingen af din betaling. Prøv igen.
paypal-active-subscription-no-billing-agreement-error = Det ser ud til, at der var et problem med at fakturere din { -brand-paypal }-konto. Genaktivér automatiske betalinger for dit abonnement.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Vent mens vi behandler din betaling…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Tak. Tjek nu din mail!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Du modtager en mail på { $email } med dine betalingsoplysninger og instruktioner om dit abonnement.
next-payment-confirmation-order-heading = Ordredetaljer
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Faktura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Betalingsinformation

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Fortsæt til hentning

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Kort, der ender på { $last4 }

## Not found page

not-found-title-subscriptions = Abonnement ikke fundet
not-found-description-subscriptions = Vi kunne ikke finde dit abonnement. Prøv igen, eller kontakt support.
not-found-button-back-to-subscriptions = Tilbage til abonnementer

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = Ingen betalingsmetode tilføjet
subscription-management-page-banner-warning-link-no-payment-method = Tilføj en betalingsmetode
subscription-management-subscriptions-heading = Abonnementer
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = Hop til
subscription-management-nav-payment-details = Betalingsdetaljer
subscription-management-nav-active-subscriptions = Aktive abonnementer
subscription-management-payment-details-heading = Betalingsdetaljer
subscription-management-email-label = Mailadresse
subscription-management-credit-balance-label = Tilgodehavende
subscription-management-credit-balance-message = Tilgodehavende vil automatisk blive brugt til fremtidige fakturaer
subscription-management-payment-method-label = Betalingsmetode
subscription-management-button-add-payment-method-aria = Tilføj betalingsmetode
subscription-management-button-add-payment-method = Tilføj
subscription-management-page-warning-message-no-payment-method = Tilføj en betalingsmetode for at undgå afbrydelser i dine abonnementer.
subscription-management-button-manage-payment-method-aria = Håndter betalingsmetode
subscription-management-button-manage-payment-method = Håndter
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Kort, der ender på { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Udløber { $expirationDate }
subscription-management-active-subscriptions-heading = Aktive abonnementer
subscription-management-you-have-no-active-subscriptions = Du har ingen aktive abonnementer
subscription-management-new-subs-will-appear-here = Nye abonnementer vil blive vist her.
subscription-management-your-active-subscriptions-aria = Dine aktive abonnementer
subscription-management-button-support = Få hjælp
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = Få hjælp til { $productName }
subscription-management-your-apple-iap-subscriptions-aria = Dine { -brand-apple }-abonnementer købt i appen
subscription-management-apple-in-app-purchase-2 = { -brand-apple } køb i appen
subscription-management-your-google-iap-subscriptions-aria = Dine { -brand-google }-abonnementer købt i appen
subscription-management-google-in-app-purchase-2 = { -brand-google } køb i appen
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Udløber den { $date }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = Håndter abonnement på { $productName }
subscription-management-button-manage-subscription-1 = Håndter abonnement
error-payment-method-banner-title-expired-card = Udløbet kort
error-payment-method-banner-message-add-new-card = Tilføj et nyt kort eller en ny betalingsmetode for at undgå afbrydelser i dine abonnementer.
error-payment-method-banner-label-update-payment-method = Opdater betalingsmetode
error-payment-method-expired-card = Dit kort er udløbet. Tilføj et nyt kort eller en ny betalingsmetode for at undgå afbrydelser i dine abonnementer.
error-payment-method-banner-title-invalid-payment-information = Ugyldig betalingsinformation
error-payment-method-banner-message-account-issue = Der er et problem med din konto.
subscription-management-button-manage-payment-method-1 = Håndter betalingsmetode
subscription-management-error-apple-pay = Der er et problem med din { -brand-apple-pay }-konto. Løs problemet for at beholde dine aktive abonnementer.
subscription-management-error-google-pay = Der er et problem med din { -brand-google-pay }-konto. Løs problemet for at beholde dine aktive abonnementer.
subscription-management-error-link = Der er et problem med din { -brand-link }-konto. Løs problemet for at beholde dine aktive abonnementer.
subscription-management-error-paypal-billing-agreement = Der er et problem med din { -brand-paypal }-konto. Løs problemet for at beholde dine aktive abonnementer.
subscription-management-error-payment-method = Der er et problem med din betalingsmetode. Løs problemet for at beholde dine aktive abonnementer.
manage-payment-methods-heading = Håndter betalingsmetoder
paypal-payment-management-page-invalid-header = Ugyldige faktureringsoplysninger
paypal-payment-management-page-invalid-description = Der ser ud til at være en fejl med din { -brand-paypal }-konto. Du skal udføre de nødvendige ændringer for at løse problemet.
# Page - Not Found
page-not-found-title = Siden blev ikke fundet
page-not-found-description = Den ønskede side blev ikke fundet. Vi har fået besked og vil rette links, der ikke virker.
page-not-found-back-button = Gå tilbage
alert-dialog-title = Advarselsdialogboks

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Startside for konto
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Abonnementer
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = Håndter betalingsmetoder
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = Gå tilbage til { $page }

## CancelSubscription

subscription-cancellation-dialog-title = Vi er kede af, at du opsiger dit abonnement
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Dit abonnement på { $name } er blevet annulleret. Du har adgang til { $name } frem til { $date }.
subscription-cancellation-dialog-aside = Har du spørgsmål? Besøg <LinkExternal>{ -brand-mozilla } Support</LinkExternal>.
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
cancel-subscription-heading = Opsig abonnement på { $productName }

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = Du vil ikke længere kunne bruge { $productName } efter { $currentPeriodEnd }, der er den sidste dag i din faktureringsperiode.
subscription-content-cancel-access-message = Annuller min adgang og kassér mine informationer gemt i { $productName } den { $currentPeriodEnd }

## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

cancel-subscription-button-cancel-subscription = Opsig abonnement
    .aria-label = Opsig dit abonnement på { $productName }
cancel-subscription-button-stay-subscribed = Fortsæt abonnement
    .aria-label = Fortsæt abonnement på { $productName }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Jeg giver hermed tilladelse til, at { -brand-mozilla } kan trække det viste beløb med min angivne betalingsmetode i overensstemmelse med <termsOfServiceLink>tjenestevilkårene</termsOfServiceLink> og <privacyNoticeLink>privatlivserklæringen</privacyNoticeLink>, indtil jeg annullerer mit abonnement.
next-payment-confirm-checkbox-error = Du skal fuldføre dette, før du går videre

## Checkout Form

next-new-user-submit = Abonner nu
next-pay-with-heading-paypal = Betal med { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Indtast kode
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Rabatkode
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Rabatkode anvendt
next-coupon-remove = Fjern
next-coupon-submit = Anvend

# Component - Header

payments-header-help =
    .title = Hjælp
    .aria-label = Hjælp
    .alt = Hjælp
payments-header-bento =
    .title = Produkter fra { -brand-mozilla }
    .aria-label = Produkter fra { -brand-mozilla }
    .alt = { -brand-mozilla }-logo
payments-header-bento-close =
    .alt = Luk
payments-header-bento-tagline = Flere produkter fra { -brand-mozilla }, der beskytter dit privatliv
payments-header-bento-firefox-desktop = { -brand-firefox } Browser til din computer
payments-header-bento-firefox-mobile = { -brand-firefox } Browser til din telefon
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Lavet af { -brand-mozilla }
payments-header-avatar =
    .title = { -product-mozilla-account }-menu
payments-header-avatar-icon =
    .alt = Kontoens profilbillede
payments-header-avatar-expanded-signed-in-as = Logget ind som
payments-header-avatar-expanded-sign-out = Log ud
payments-client-loading-spinner =
    .aria-label = Indlæser…
    .alt = Indlæser…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Angiv som standardbetalingsmetode
# Save button for saving a new payment method
payment-method-management-save-method = Gem betalingsmetode
manage-stripe-payments-title = Håndter betalingsmetoder

## Component - PurchaseDetails

next-plan-details-header = Produktdetaljer
next-plan-details-list-price = Listepris
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = Forholdsmæssig pris for { $productName }
next-plan-details-tax = Afgifter og gebyrer
next-plan-details-total-label = I alt
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Tilgodehavende fra ubrugt tid
purchase-details-subtotal-label = Subtotal
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Tilgodehavende anvendt
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Samlet udestående
next-plan-details-hide-button = Skjul detaljer
next-plan-details-show-button = Vis detaljer
next-coupon-success = Din plan fornys automatisk til listeprisen.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Din plan fornys automatisk til listeprisen efter { $couponDurationDate }.

## Select Tax Location

select-tax-location-title = Position
select-tax-location-edit-button = Rediger
select-tax-location-save-button = Gem
select-tax-location-continue-to-checkout-button = Fortsæt til kassen
select-tax-location-country-code-label = Land
select-tax-location-country-code-placeholder = Vælg dit land
select-tax-location-error-missing-country-code = Vælg dit land
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } er ikke tilgængelig i dette område.
select-tax-location-postal-code-label = Postnummer
select-tax-location-postal-code =
    .placeholder = Indtast dit postnummer
select-tax-location-error-missing-postal-code = Indtast dit postnummer
select-tax-location-error-invalid-postal-code = Indtast et gyldigt postnummer
select-tax-location-successfully-updated = Din position er blevet opdateret.
select-tax-location-error-location-not-updated = Din position kunne ikke opdateres. Prøv igen.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Din konto faktureres i { $currencyDisplayName }. Vælg et land, der bruger { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Vælg et land, der matcher valutaen for dine aktive abonnementer.
select-tax-location-new-tax-rate-info = Ved at opdatere din position vil den nye afgiftssats blive anvendt på alle din kontos aktive abonnementer fra og med din næste faktureringsperiode.
signin-form-continue-button = Fortsæt
signin-form-email-input = Indtast din mailadresse
signin-form-email-input-missing = Indtast din mailadresse
signin-form-email-input-invalid = Indtast en gyldig mailadresse
next-new-user-subscribe-product-updates-mdnplus = Jeg vil gerne modtage nyheder om produkter og opdateringer fra { -product-mdn-plus } og { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Jeg vil gerne modtage nyheder om produkter og opdateringer fra { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = Jeg vil gerne modtage nyheder om privatlivsbeskyttelse og opdateringer fra { -brand-mozilla }
next-new-user-subscribe-product-assurance = Vi bruger kun din mailadresse til at oprette din konto. Vi vil aldrig sælge den til en tredjepart.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = Vil du fortsætte med at bruge { $productName }?
stay-subscribed-access-will-continue = Din adgang til { $productName } vil fortsætte, og din faktureringsperiode og betaling vil forblive den samme.
subscription-content-button-resubscribe = Abonner igen
    .aria-label = Abonner på { $productName } igen
resubscribe-success-dialog-title = Tak! Du er klar.

## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.
## $last4 (String) - The last four digits of the default payment method card.
## $currentPeriodEnd (Date) - The date of the next charge.

stay-subscribed-next-charge-with-tax = Din næste opkrævning er på { $nextInvoiceTotal } + { $taxDue } i afgifter den { $currentPeriodEnd }.
stay-subscribed-next-charge-no-tax = Din næste opkrævning er på { $nextInvoiceTotal } den { $currentPeriodEnd }.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = Rabatten { $promotionName } vil blive anvendt
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Seneste regning • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } afgift
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = Se faktura
subscription-management-link-view-invoice-aria = Se faktura for { $productName }
subscription-content-expires-on-expiry-date = Udløber den { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Næste regning • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } afgift
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = Behold abonnement
    .aria-label = Behold  abonnement på { $productName }
subscription-content-button-cancel-subscription = Annuller abonnement
    .aria-label = Annuller abonnement på { $productName }

##

dialog-close = Luk dialogboks
button-back-to-subscriptions = Tilbage til abonnementer
subscription-content-cancel-action-error = Der opstod en uventet fejl. Prøv igen.
paypal-unavailable-error = { -brand-paypal } er i øjeblikket ikke tilgængelig. Brug en anden betalingsmulighed eller prøv igen senere.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } dagligt
plan-price-interval-weekly = { $amount } ugentligt
plan-price-interval-monthly = { $amount } månedligt
plan-price-interval-halfyearly = { $amount } hver 6 måned
plan-price-interval-yearly = { $amount } årligt

## Component - SubscriptionTitle

next-subscription-create-title = Opsætning af dit abonnement
next-subscription-success-title = Bekræftelse af abonnement
next-subscription-processing-title = Bekræfter abonnement…
next-subscription-error-title = Der opstod en fejl under bekræftelse af abonnement…
subscription-title-sub-exists = Du abonnerer allerede
subscription-title-plan-change-heading = Gennemgå dine ændringer
subscription-title-not-supported = Denne ændring af abonnementsplan understøttes ikke
next-sub-guarantee = 30-dages pengene-tilbage-garanti

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Tjenestevilkår
next-privacy = Privatlivserklæring
next-terms-download = Betingelser for hentning
terms-and-privacy-stripe-label = { -brand-mozilla } bruger { -brand-name-stripe } til sikker behandling af betaling.
terms-and-privacy-stripe-link = Privatlivspolitik for { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } bruger { -brand-paypal } til sikker behandling af betaling.
terms-and-privacy-paypal-link = Privatlivspolitik for { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } bruger { -brand-name-stripe } og { -brand-paypal } til sikker behandling af betaling.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Nuværende plan
upgrade-purchase-details-new-plan-label = Ny plan
upgrade-purchase-details-promo-code = Rabatkode
upgrade-purchase-details-tax-label = Afgifter og gebyrer
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Tilgodehavende føjet til konto
upgrade-purchase-details-credit-will-be-applied = Tilgodehavende vil blive føjet til din konto og brugt til fremtidige fakturaer.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (Dagligt)
upgrade-purchase-details-new-plan-weekly = { $productName } (Ugentligt)
upgrade-purchase-details-new-plan-monthly = { $productName } (Månedligt)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 måneder)
upgrade-purchase-details-new-plan-yearly = { $productName } (Årligt)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Kasse | { $productTitle }
metadata-description-checkout-start = Indtast dine betalingsoplysninger for at gennemføre dit køb.
# Checkout processing
metadata-title-checkout-processing = Behandler | { $productTitle }
metadata-description-checkout-processing = Vent, mens vi afslutter behandlingen af din betaling.
# Checkout error
metadata-title-checkout-error = Fejl | { $productTitle }
metadata-description-checkout-error = Der opstod en fejl under behandling af dit abonnement. Kontakt supporten, hvis problemet fortsætter.
# Checkout success
metadata-title-checkout-success = Succes | { $productTitle }
metadata-description-checkout-success = Tillykke! Du har gennemført dit køb.
# Checkout needs_input
metadata-title-checkout-needs-input = Handling påkrævet | { $productTitle }
metadata-description-checkout-needs-input = Udfør den påkrævede handling for at fortsætte med din betaling.
# Upgrade start
metadata-title-upgrade-start = Opgradering | { $productTitle }
metadata-description-upgrade-start = Indtast dine betalingsoplysninger for at gennemføre din opgradering.
# Upgrade processing
metadata-title-upgrade-processing = Behandler | { $productTitle }
metadata-description-upgrade-processing = Vent, mens vi afslutter behandlingen af din betaling.
# Upgrade error
metadata-title-upgrade-error = Fejl | { $productTitle }
metadata-description-upgrade-error = Der opstod en fejl under behandling af din opgradering. Kontakt supporten, hvis problemet fortsætter.
# Upgrade success
metadata-title-upgrade-success = Succes | { $productTitle }
metadata-description-upgrade-success = Tillykke! Du har gennemført din opgradering.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Handling påkrævet | { $productTitle }
metadata-description-upgrade-needs-input = Udfør den påkrævede handling for at fortsætte med din betaling.
# Default
metadata-title-default = Siden blev ikke fundet | { $productTitle }
metadata-description-default = Siden, du bad om, blev ikke fundet.

## Coupon Error Messages

next-coupon-error-cannot-redeem = Den indtastede kode kan ikke indløses — din konto har et tidligere abonnement på en af vores tjenester.
next-coupon-error-expired = Den indtastede kode er udløbet.
next-coupon-error-generic = Der opstod en fejl under behandlingen af koden. Prøv igen.
next-coupon-error-invalid = Den indtastede kode er ugyldig.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = Den indtastede kode kan ikke bruges mere.

## Stay Subscribed Error Messages

stay-subscribed-error-expired = Dette tilbud er udløbet.
stay-subscribed-error-discount-used = Rabatkode er allerede anvendt.
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = Denne rabat er kun tilgængelig for nuværende { $productTitle }-abonnenter.
stay-subscribed-error-still-active = Dit abonnement på { $productTitle } er stadig aktivt.
stay-subscribed-error-general = Der opstod et problem med at forny dit abonnement.
