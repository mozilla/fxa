# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Account-startpagina
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Promotiecode toegepast
coupon-submit = Toepassen
coupon-remove = Verwijderen
coupon-error = De ingevoerde kortingscode is ongeldig of verlopen.
coupon-error-generic = Er is een fout opgetreden bij het verwerken van de code. Probeer het opnieuw.
coupon-error-expired = De ingevoerde code is verlopen.
coupon-error-limit-reached = De ingevoerde code heeft zijn limiet bereikt.
coupon-error-invalid = De ingevoerde code is ongeldig.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Code invoeren

## Component - Fields

default-input-error = Dit veld is verplicht
input-error-is-required = { $label } is verplicht

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla }-logo

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Hebt u al een { -product-mozilla-account }? <a>Aanmelden</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Voer uw e-mailadres in
new-user-confirm-email =
    .label = Bevestig uw e-mailadres
new-user-subscribe-product-updates-mozilla = Ik wil graag productnieuws en -updates van { -brand-mozilla } ontvangen
new-user-subscribe-product-updates-snp = Ik wil graag beveiligings- en privacynieuws en updates van { -brand-mozilla } ontvangen
new-user-subscribe-product-updates-hubs = Ik wil graag productnieuws en -updates van { -product-mozilla-hubs } en { -brand-mozilla } ontvangen
new-user-subscribe-product-updates-mdnplus = Ik wil graag productnieuws en -updates van { -product-mdn-plus } en { -brand-mozilla } ontvangen
new-user-subscribe-product-assurance = We gebruiken uw e-mailadres alleen om uw account aan te maken. We zullen het nooit aan een derde partij verkopen.
new-user-email-validate = E-mailadres is niet geldig
new-user-email-validate-confirm = E-mailadressen komen niet overeen
new-user-already-has-account-sign-in = U hebt al een account. <a>Aanmelden</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Hebt u het e-mailadres verkeerd getypt? { $domain } biedt geen e-mail aan.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Bedankt!
payment-confirmation-thanks-heading-account-exists = Bedankt, controleer nu uw e-mail!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Er is een bevestigingsbericht verzonden naar { $email } met details over hoe u aan de slag kunt met { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = U ontvangt een e-mailbericht op { $email } met instructies over het instellen van uw account, evenals uw betalingsgegevens.
payment-confirmation-order-heading = Bestelgegevens
payment-confirmation-invoice-number = Factuurnr. { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Betalingsgegevens
payment-confirmation-amount = { $amount } per { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] dagelijks { $amount }
       *[other] elke { $intervalCount } dagen { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] wekelijks { $amount }
       *[other] elke { $intervalCount } weken { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] maandelijks { $amount }
       *[other] elke { $intervalCount } maanden { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] jaarlijks { $amount }
       *[other] elke { $intervalCount } jaar { $amount }
    }
payment-confirmation-download-button = Doorgaan naar download

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Ik autoriseer { -brand-mozilla } om mijn betaalmethode voor het getoonde bedrag te belasten, in overeenstemming met de <termsOfServiceLink>Servicevoorwaarden</termsOfServiceLink> en de <privacyNoticeLink>Privacyverklaring</privacyNoticeLink>, totdat ik mijn abonnement beëindig.
payment-confirm-checkbox-error = U dient dit te voltooien voordat u verder gaat

## Component - PaymentErrorView

payment-error-retry-button = Opnieuw proberen
payment-error-manage-subscription-button = Mijn abonnement beheren

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = U hebt al een abonnement op { $productName } via de appstore van { -brand-google } of { -brand-apple }.
iap-upgrade-no-bundle-support = We ondersteunen geen upgrades voor deze abonnementen, maar dat doen we binnenkort wel.
iap-upgrade-contact-support = U kunt dit product nog steeds verkrijgen – neem contact op met de ondersteuningsafdeling zodat we u kunnen helpen.
iap-upgrade-get-help-button = Hulp verkrijgen

## Component - PaymentForm

payment-name =
    .placeholder = Volledige naam
    .label = Naam zoals weergegeven op uw kaart
payment-cc =
    .label = Uw kaart
payment-cancel-btn = Annuleren
payment-update-btn = Bijwerken
payment-pay-btn = Nu betalen
payment-pay-with-paypal-btn-2 = Betalen met { -brand-paypal }
payment-validate-name-error = Voer uw naam in

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } gebruikt { -brand-name-stripe } en { -brand-paypal } voor veilig betalingsverkeer.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe }-privacybeleid</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal }-privacybeleid</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } gebruikt { -brand-paypal } voor veilig betalingsverkeer.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal }-privacybeleid</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } gebruikt { -brand-name-stripe } voor veilig betalingsverkeer.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe }-privacybeleid</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Kies uw betalingsmethode
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = U dient eerst uw abonnement goed te keuren

## Component - PaymentProcessing

payment-processing-message = Een ogenblik terwijl we uw betaling verwerken…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Creditcard eindigend op { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Betalen met { -brand-paypal }

## Component - PlanDetails

plan-details-header = Productdetails
plan-details-list-price = Normale prijs
plan-details-show-button = Details tonen
plan-details-hide-button = Details verbergen
plan-details-total-label = Totaal
plan-details-tax = Belastingen en heffingen

## Component - PlanErrorDialog

product-no-such-plan = Een dergelijk schema bestaat niet voor dit product.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } belasting
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] dagelijks { $priceAmount }
       *[other] elke { $intervalCount } dagen { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] dagelijks { $priceAmount }
           *[other] elke { $intervalCount } dagen { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] wekelijks { $priceAmount }
       *[other] elke { $intervalCount } weken { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] wekelijks { $priceAmount }
           *[other] elke { $intervalCount } weken { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] maandelijks { $priceAmount }
       *[other] elke { $intervalCount } maanden { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] maandelijks { $priceAmount }
           *[other] elke { $intervalCount } maanden { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] jaarlijks { $priceAmount }
       *[other] elke { $intervalCount } jaar { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] jaarlijks { $priceAmount }
           *[other] elke { $intervalCount } jaar { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] dagelijks { $priceAmount } + { $taxAmount } belasting
       *[other] elke { $intervalCount } dagen { $priceAmount } + { $taxAmount } belasting
    }
    .title =
        { $intervalCount ->
            [one] dagelijks { $priceAmount } + { $taxAmount } belasting
           *[other] elke { $intervalCount } dagen { $priceAmount } + { $taxAmount } belasting
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] wekelijks { $priceAmount } + { $taxAmount } belasting
       *[other] elke { $intervalCount } weken { $priceAmount } + { $taxAmount } belasting
    }
    .title =
        { $intervalCount ->
            [one] wekelijks { $priceAmount } + { $taxAmount } belasting
           *[other] elke { $intervalCount } weken { $priceAmount } + { $taxAmount } belasting
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] maandelijks { $priceAmount } + { $taxAmount } belasting
       *[other] elke { $intervalCount } maanden { $priceAmount } + { $taxAmount } belasting
    }
    .title =
        { $intervalCount ->
            [one] maandelijks { $priceAmount } + { $taxAmount } belasting
           *[other] elke { $intervalCount } maanden { $priceAmount } + { $taxAmount } belasting
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] jaarlijks { $priceAmount } + { $taxAmount } belasting
       *[other] elke { $intervalCount } jaar { $priceAmount } + { $taxAmount } belasting
    }
    .title =
        { $intervalCount ->
            [one] jaarlijks { $priceAmount } + { $taxAmount } belasting
           *[other] elke { $intervalCount } jaar { $priceAmount } + { $taxAmount } belasting
        }

## Component - SubscriptionTitle

subscription-create-title = Uw abonnement instellen
subscription-success-title = Abonnementsbevestiging
subscription-processing-title = Abonnement bevestigen…
subscription-error-title = Fout bij bevestigen abonnement…
subscription-noplanchange-title = Deze abonnementswijziging wordt niet ondersteund
subscription-iapsubscribed-title = Al geabonneerd
sub-guarantee = 30-dagen-geldteruggarantie

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Servicevoorwaarden
privacy = Privacyverklaring
terms-download = Voorwaarden downloaden

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
# General aria-label for closing modals
close-aria =
    .aria-label = Modal sluiten
settings-subscriptions-title = Abonnementen
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Promotiecode

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] dagelijks { $amount }
       *[other] elke { $intervalCount } dagen { $amount }
    }
    .title =
        { $intervalCount ->
            [one] dagelijks { $amount }
           *[other] elke { $intervalCount } dagen { $amount }
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] wekelijks { $amount }
       *[other] elke { $intervalCount } weken { $amount }
    }
    .title =
        { $intervalCount ->
            [one] wekelijks { $amount }
           *[other] elke { $intervalCount } weken { $amount }
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] maandelijks { $amount }
       *[other] elke { $intervalCount } maanden { $amount }
    }
    .title =
        { $intervalCount ->
            [one] maandelijks { $amount }
           *[other] elke { $intervalCount } maanden { $amount }
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] jaarlijks { $amount }
       *[other] elke { $intervalCount } jaar { $amount }
    }
    .title =
        { $intervalCount ->
            [one] jaarlijks { $amount }
           *[other] elke { $intervalCount } jaar { $amount }
        }

## Error messages

# App error dialog
general-error-heading = Algemene toepassingsfout
basic-error-message = Er is iets misgegaan. Probeer het later opnieuw.
payment-error-1 = Hmm. Er is een probleem opgetreden bij het autoriseren van uw betaling. Probeer het opnieuw of neem contact op met uw kaartverstrekker.
payment-error-2 = Hmm. Er is een probleem opgetreden bij het autoriseren van uw betaling. Neem contact op met uw kaartverstrekker.
payment-error-3b = Er is een onverwachte fout opgetreden tijdens het verwerken van uw betaling, probeer het opnieuw.
expired-card-error = Het lijkt erop dat uw creditcard is verlopen. Probeer een andere kaart.
insufficient-funds-error = Het lijkt erop dat uw kaart onvoldoende saldo heeft. Probeer een andere kaart.
withdrawal-count-limit-exceeded-error = Het lijkt erop dat u met deze transactie uw kredietlimiet overschrijdt. Probeer een andere kaart.
charge-exceeds-source-limit = Het lijkt erop dat u met deze transactie uw dagelijkse kredietlimiet overschrijdt. Probeer een andere kaart of wacht 24 uur.
instant-payouts-unsupported = Het lijkt erop dat uw bankpas niet is ingesteld voor directe betalingen. Probeer een andere bankpas of creditcard.
duplicate-transaction = Hmm. Het lijkt erop dat zojuist een identieke transactie is verzonden. Controleer uw betalingsgeschiedenis.
coupon-expired = Het lijkt erop dat die promotiecode is verlopen.
card-error = Uw transactie kon niet worden verwerkt. Controleer uw creditcardgegevens en probeer het opnieuw.
country-currency-mismatch = De valuta van dit abonnement is niet geldig voor het land dat aan uw betaling is gekoppeld.
currency-currency-mismatch = Sorry. U kunt niet tussen valuta wisselen.
location-unsupported = Uw huidige locatie wordt niet ondersteund volgens onze Servicevoorwaarden.
no-subscription-change = Sorry. U kunt uw abonnement niet wijzigen.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = U bent al geabonneerd via de { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Door een systeemfout is uw registratie bij { $productName } mislukt. Er zijn geen kosten in rekening gebracht bij uw betaalmethode. Probeer het opnieuw.
fxa-post-passwordless-sub-error = Abonnement bevestigd, maar de bevestigingspagina kan niet worden geladen. Controleer uw e-mail om uw account in te stellen.
newsletter-signup-error = U bent niet ingeschreven voor e-mailberichten over productupdates. U kunt het opnieuw proberen in uw accountinstellingen.
product-plan-error =
    .title = Probleem bij het laden van de schema’s
product-profile-error =
    .title = Probleem bij het laden van het profiel
product-customer-error =
    .title = Probleem bij het laden van de klant
product-plan-not-found = Schema niet gevonden
product-location-unsupported-error = Locatie niet ondersteund

## Hooks - coupons

coupon-success = Uw abonnement wordt automatisch verlengd tegen de normale prijs.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Uw abonnement wordt na { $couponDurationDate } automatisch verlengd tegen de standaardprijs.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Maak een { -product-mozilla-account } aan
new-user-card-title = Voer uw kaartgegevens in
new-user-submit = Nu abonneren

## Routes - Product and Subscriptions

sub-update-payment-title = Betalingsgegevens

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Betalen met kaart
product-invoice-preview-error-title = Probleem bij het laden van factuurvoorbeeld
product-invoice-preview-error-text = Kan factuurvoorbeeld niet laden

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = We kunnen u nog niet upgraden

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Uw wijziging bekijken
sub-change-failed = Abonnementswijziging mislukt
sub-update-acknowledgment =
    Uw abonnement wijzigt direct, en er wordt een proportioneel bedrag in rekening
    gebracht voor het restant van deze facturatieperiode. Vanaf { $startingDate }
    wordt u het volledige bedrag in rekening gebracht.
sub-change-submit = Wijziging bevestigen
sub-update-current-plan-label = Huidig schema
sub-update-new-plan-label = Nieuw schema
sub-update-total-label = Nieuw totaalbedrag
sub-update-prorated-upgrade = Naar rato upgrade

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (dagelijks)
sub-update-new-plan-weekly = { $productName } (wekelijks)
sub-update-new-plan-monthly = { $productName } (maandelijks)
sub-update-new-plan-yearly = { $productName } (jaarlijks)
sub-update-prorated-upgrade-credit = Het getoonde negatieve saldo wordt als tegoed op uw account bijgeschreven en gebruikt voor toekomstige facturen.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Abonnement opzeggen
sub-item-stay-sub = Abonnement behouden

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    U kunt { $name } niet meer gebruiken na
    { $period }, de laatste dag van uw betalingscyclus.
sub-item-cancel-confirm =
    Mijn toegang tot en opgeslagen gegevens in { $name }
    op { $period } opzeggen
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
sub-promo-coupon-applied = { $promotion_name }-waardebon toegepast: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Deze abonnementsbetaling heeft geleid tot een bijschrijving op uw accountsaldo: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Opnieuw activeren van abonnement is mislukt
sub-route-idx-cancel-failed = Opzeggen van abonnement is mislukt
sub-route-idx-contact = Contact opnemen
sub-route-idx-cancel-msg-title = We vinden het jammer dat u weggaat.
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Uw abonnement op { $name } is opgezegd.
          <br />
          U hebt nog tot { $date } toegang tot { $name }.
sub-route-idx-cancel-aside-2 = Vragen? Bezoek <a>{ -brand-mozilla } Support</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Probleem bij het laden van klant
sub-invoice-error =
    .title = Probleem bij het laden van facturen
sub-billing-update-success = Uw betalingsgegevens zijn met succes bijgewerkt
sub-invoice-previews-error-title = Probleem bij het laden van factuurvoorbeelden
sub-invoice-previews-error-text = Kan factuurvoorbeelden niet laden

## Routes - Subscription - ActionButton

pay-update-change-btn = Wijzigen
pay-update-manage-btn = Beheren

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Volgende incasso op { $date }
sub-next-bill-due-date = De volgende factuur is verschuldigd op { $date }
sub-expires-on = Vervalt op { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Vervalt op { $expirationDate }
sub-route-idx-updating = Facturatiegegevens bijwerken…
sub-route-payment-modal-heading = Ongeldige facturatiegegevens
sub-route-payment-modal-message-2 = Er lijkt een fout op te treden met uw { -brand-paypal }-account, u dient de noodzakelijke stappen te nemen om dit betalingsprobleem op te lossen.
sub-route-missing-billing-agreement-payment-alert = Ongeldige betalingsgegevens; er is een fout opgetreden met uw account. <div>Beheren</div>
sub-route-funding-source-payment-alert = Ongeldige betalingsgegevens; er is een fout opgetreden met uw account. Deze waarschuwing verdwijnt mogelijk pas enige tijd nadat u met succes uw gegevens hebt bijgewerkt. <div>Beheren</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Abonnementschema bestaat niet.
invoice-not-found = Volgende factuur niet gevonden
sub-item-no-such-subsequent-invoice = Volgende factuur niet gevonden voor dit abonnement.
sub-invoice-preview-error-title = Factuurvoorbeeld niet gevonden
sub-invoice-preview-error-text = Factuurvoorbeeld niet gevonden voor dit abonnement

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Wilt u { $name } blijven gebruiken?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Uw toegang tot { $name } blijft bestaan, en uw betalingscyclus
    en betaling blijven hetzelfde. Uw volgende betaling wordt
    { $amount } op { $endDate } op de kaart eindigend op { $last }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Uw toegang tot { $name } blijft bestaan, en uw betalingscyclus
    en betaling blijven hetzelfde. Uw volgende betaling wordt
    { $amount } op { $endDate }.
reactivate-confirm-button = Opnieuw inschrijven

## $date (Date) - Last day of product access

reactivate-panel-copy = U verliest op <strong>{ $date }</strong> toegang tot { $name }.
reactivate-success-copy = Bedankt! U bent helemaal klaar.
reactivate-success-button = Sluiten

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: in-app-aankoop
sub-iap-item-apple-purchase-2 = { -brand-apple }: in-app-aankoop
sub-iap-item-manage-button = Beheren
