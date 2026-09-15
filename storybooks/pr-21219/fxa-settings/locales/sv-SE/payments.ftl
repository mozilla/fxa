# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Startsida för konton
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Kampanjkod tillämpas
coupon-submit = Tillämpa
coupon-remove = Ta bort
coupon-error = Koden du angav är ogiltig eller har upphört.
coupon-error-generic = Ett fel uppstod vid bearbetning av koden. Var god försök igen.
coupon-error-expired = Koden du angav har upphört.
coupon-error-limit-reached = Koden du angav har nått sin gräns.
coupon-error-invalid = Koden du angav är ogiltig.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Ange kod

## Component - Fields

default-input-error = Fältet är obligatoriskt
input-error-is-required = { $label } krävs

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } logotyp

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Har du redan ett { -product-mozilla-account }? <a>Logga in</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Ange din e-postadress
new-user-confirm-email =
    .label = bekräfta din e-postadress
new-user-subscribe-product-updates-mozilla = Jag vill få produktnyheter och uppdateringar från { -brand-mozilla }
new-user-subscribe-product-updates-snp = Jag vill få nyheter och uppdateringar om säkerhet och sekretess från { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Jag vill få produktnyheter och uppdateringar från { -product-mozilla-hubs } och { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Jag vill få produktnyheter och uppdateringar från { -product-mdn-plus } och { -brand-mozilla }
new-user-subscribe-product-assurance = Vi använder bara din e-postadress för att skapa ditt konto. Vi kommer aldrig att sälja den till en tredje part.
new-user-email-validate = E-postadressen är inte giltig
new-user-email-validate-confirm = E-postadresserna matchar inte
new-user-already-has-account-sign-in = Har du redan ett konto, <a>Logga in</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Felskriven e-postadress? { $domain } erbjuder inte e-postadresser.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Tack så mycket!
payment-confirmation-thanks-heading-account-exists = Tack, kolla nu din mejl!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Ett bekräftelsemeddelande har skickats till { $email } med information om hur du kommer igång med { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Du får ett e -postmeddelande till { $email } med instruktioner för hur du konfigurerar ditt konto samt dina betalningsuppgifter.
payment-confirmation-order-heading = Orderdetaljer
payment-confirmation-invoice-number = Faktura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Betalningsinformation
payment-confirmation-amount = { $amount } per { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } dagligen
       *[other] { $amount } var { $intervalCount } dag
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } varje vecka
       *[other] { $amount } var { $intervalCount } vecka
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } varje månad
       *[other] { $amount } var { $intervalCount } månad
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } varje år
       *[other] { $amount } var { $intervalCount } år
    }
payment-confirmation-download-button = Fortsätt till nedladdning

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Jag godkänner { -brand-mozilla } att debitera min betalningsmetod för det visade beloppet, enligt <termsOfServiceLink>användarvillkor</termsOfServiceLink> och <privacyNoticeLink>sekretessmeddelande</privacyNoticeLink>, tills jag säger upp min prenumeration.
payment-confirm-checkbox-error = Du måste slutföra detta innan du går vidare

## Component - PaymentErrorView

payment-error-retry-button = Försök igen
payment-error-manage-subscription-button = Hantera min prenumeration

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Du har redan en prenumeration på { $productName } via appbutikerna { -brand-google } eller { -brand-apple }.
iap-upgrade-no-bundle-support = Vi stöder inte uppgraderingar för dessa prenumerationer, men vi kommer att göra det snart.
iap-upgrade-contact-support = Du kan fortfarande få den här produkten — kontakta supporten så att vi kan hjälpa dig.
iap-upgrade-get-help-button = Få hjälp

## Component - PaymentForm

payment-name =
    .placeholder = Fullständigt namn
    .label = Namnet som det står på ditt kort
payment-cc =
    .label = Ditt betalkort
payment-cancel-btn = Avbryt
payment-update-btn = Uppdatera
payment-pay-btn = Betala nu
payment-pay-with-paypal-btn-2 = Betala med { -brand-paypal }
payment-validate-name-error = Ange ditt namn

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } använder { -brand-name-stripe } och { -brand-paypal } för säker betalningshantering.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } sekretesspolicy</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } sekretesspolicy</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } använder { -brand-paypal } för säker betalningshantering.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } sekretesspolicy</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } använder { -brand-name-stripe } för säker betalningshantering.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } sekretesspolicy</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Välj din betalningsmetod
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Först måste du godkänna din prenumeration

## Component - PaymentProcessing

payment-processing-message = Vänta medan vi behandlar din betalning…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kort som slutar på { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Betala med { -brand-paypal }

## Component - PlanDetails

plan-details-header = Produktinformation
plan-details-list-price = Listpris
plan-details-show-button = Visa detaljer
plan-details-hide-button = Dölj detaljer
plan-details-total-label = Totalt
plan-details-tax = Skatter och avgifter

## Component - PlanErrorDialog

product-no-such-plan = Ingen sådan plan för denna produkt.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } skatt
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } dagligen
       *[other] { $priceAmount } var { $intervalCount } dag
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } dagligen
           *[other] { $priceAmount } var { $intervalCount } dag
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } varje vecka
       *[other] { $priceAmount } var { $intervalCount } vecka
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } varje vecka
           *[other] { $priceAmount } var { $intervalCount } vecka
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } varje månad
       *[other] { $priceAmount } var { $intervalCount } månad
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } varje månad
           *[other] { $priceAmount } var { $intervalCount } månad
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } varje år
       *[other] { $priceAmount } var { $intervalCount } år
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } varje år
           *[other] { $priceAmount } var { $intervalCount } år
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt dagligen
       *[other] { $priceAmount } + { $taxAmount } skatt var { $intervalCount } dag
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt dagligen
           *[other] { $priceAmount } + { $taxAmount } skatt var { $intervalCount } dag
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt varje vecka
       *[other] { $priceAmount } + { $taxAmount } skatt var { $intervalCount } vecka
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt varje vecka
           *[other] { $priceAmount } + { $taxAmount } skatt var { $intervalCount } vecka
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt varje månad
       *[other] { $priceAmount } + { $taxAmount } skatt var { $intervalCount } månad
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt varje månad
           *[other] { $priceAmount } + { $taxAmount } skatt var { $intervalCount } månad
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt varje år
       *[other] { $priceAmount } + { $taxAmount } skatt var { $intervalCount } år
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt varje år
           *[other] { $priceAmount } + { $taxAmount } skatt var { $intervalCount } år
        }

## Component - SubscriptionTitle

subscription-create-title = Konfigurera din prenumeration
subscription-success-title = Prenumerationsbekräftelse
subscription-processing-title = Bekräftar prenumerationen…
subscription-error-title = Fel vid bekräftelse av prenumeration…
subscription-noplanchange-title = Ändringen av prenumerationsplanen stöds inte
subscription-iapsubscribed-title = Har redan prenumererat
sub-guarantee = 30-dagars återbetalningsgaranti

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Användarvillkor
privacy = Sekretesspolicy
terms-download = Nerladdningsvillkor

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox-konton
# General aria-label for closing modals
close-aria =
    .aria-label = Stäng modal
settings-subscriptions-title = Prenumerationer
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Kampanjkod

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } dagligen
       *[other] { $amount } var { $intervalCount } dag
    }
    .title =
        { $intervalCount ->
            [one] { $amount } dagligen
           *[other] { $amount } var { $intervalCount } dag
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } varje vecka
       *[other] { $amount } var { $intervalCount } vecka
    }
    .title =
        { $intervalCount ->
            [one] { $amount } varje vecka
           *[other] { $amount } var { $intervalCount } vecka
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } varje månad
       *[other] { $amount } var { $intervalCount } månad
    }
    .title =
        { $intervalCount ->
            [one] { $amount } varje månad
           *[other] { $amount } var { $intervalCount } månad
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } varje år
       *[other] { $amount } var { $intervalCount } år
    }
    .title =
        { $intervalCount ->
            [one] { $amount } varje år
           *[other] { $amount } var { $intervalCount } år
        }

## Error messages

# App error dialog
general-error-heading = Allmänt applikationsfel
basic-error-message = Något gick fel. Vänligen försök igen.
payment-error-1 = Hmm. Det gick inte att godkänna din betalning. Försök igen eller kontakta din kortutgivare.
payment-error-2 = Hmm. Det gick inte att godkänna din betalning. Ta kontakt med din kortutgivare.
payment-error-3b = Ett oväntat fel har uppstått vid bearbetningen av din betalning. Försök igen.
expired-card-error = Det ser ut som att ditt kreditkort har upphört att gälla. Prova ett annat kort.
insufficient-funds-error = Det ser ut som att ditt kort inte har tillräckligt med pengar. Prova ett annat kort.
withdrawal-count-limit-exceeded-error = Det ser ut som att denna transaktion överskred din kreditgräns. Prova ett annat kort.
charge-exceeds-source-limit = Det ser ut som att denna transaktion överskred din dagliga kreditgräns. Prova ett annat kort eller om 24 timmar.
instant-payouts-unsupported = Det ser ut som att ditt betalkort inte är inställt för omedelbara betalningar. Prova ett annat betalkort eller kreditkort.
duplicate-transaction = Hmm. Det verkar som om en identisk transaktion just skickades. Kolla in din betalningshistorik.
coupon-expired = Det ser ut som att kampanjkoden har gått ut.
card-error = Din transaktion kunde inte behandlas. Kontrollera din kreditkortsinformation och försök igen.
country-currency-mismatch = Prenumerationens valuta är inte giltig för det land som är kopplat till din betalning.
currency-currency-mismatch = Tyvärr. Du kan inte växla mellan valutor.
location-unsupported = Din nuvarande plats stöds inte enligt våra användarvillkor.
no-subscription-change = Tyvärr. Du kan inte ändra din prenumerationsplan.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Du prenumererar redan via { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Ett systemfel orsakade att registreringen för { $productName } misslyckades. Din betalningsmetod har inte debiterats. Var god försök igen.
fxa-post-passwordless-sub-error = Prenumerationen bekräftades, men bekräftelsesidan kunde inte laddas. Kontrollera din e-post för att konfigurera ditt konto.
newsletter-signup-error = Du har inte registrerat dig för produktuppdateringsmeddelanden. Du kan försöka igen i dina kontoinställningar.
product-plan-error =
    .title = Problem med att ladda planer
product-profile-error =
    .title = Problem med att ladda profil
product-customer-error =
    .title = Problem med att ladda kund
product-plan-not-found = Plan hittades inte
product-location-unsupported-error = Plats stöds inte

## Hooks - coupons

coupon-success = Din plan förnyas automatiskt till listpriset.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Din plan förnyas automatiskt efter { $couponDurationDate } till listpriset.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Skapa ett { -product-mozilla-account }
new-user-card-title = Ange din kortinformation
new-user-submit = Prenumerera nu

## Routes - Product and Subscriptions

sub-update-payment-title = Betalningsinformation

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Betala med kort
product-invoice-preview-error-title = Problem med att ladda förhandsgranskning av faktura
product-invoice-preview-error-text = Det gick inte att läsa in förhandsgranskning av faktura

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Vi kan inte uppgradera dig riktigt än

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Butik
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Granska din ändring
sub-change-failed = Planändring misslyckades
sub-update-acknowledgment =
    Din plan kommer att ändras omedelbart och du kommer att debiteras
    ett proportionellt belopp idag för resten av denna faktureringsperiod.
    Från och med { $startingDate } kommer du att debiteras för hela beloppet.
sub-change-submit = Bekräfta ändring
sub-update-current-plan-label = Nuvarande plan
sub-update-new-plan-label = Ny plan
sub-update-total-label = Ny summa
sub-update-prorated-upgrade = Proportionell uppgradering

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (dagligen)
sub-update-new-plan-weekly = { $productName } (veckovis)
sub-update-new-plan-monthly = { $productName } (månadsvis)
sub-update-new-plan-yearly = { $productName } (årligen)
sub-update-prorated-upgrade-credit = Negativt saldo som visas kommer att krediteras ditt konto och användas för framtida fakturor.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Avbryt prenumeration
sub-item-stay-sub = Behåll din prenumeration

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Du kommer inte längre att kunna använda { $name } efter
    { $period }, den sista dagen i din faktureringscykel.
sub-item-cancel-confirm =
    Avbryt min åtkomst och min sparade information för
    { $name } den { $period }
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
sub-promo-coupon-applied = Utnyttjar erbjudande { $promotion_name }: <priceDetails> </priceDetails>
subscription-management-account-credit-balance = Denna prenumerationsbetalning resulterade i en kreditering till ditt konto: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Återaktivering av prenumerationen misslyckades
sub-route-idx-cancel-failed = Avbrytande av prenumeration misslyckades
sub-route-idx-contact = Kontakta supporten
sub-route-idx-cancel-msg-title = Vi tycker det är tråkigt att du lämnar oss.
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Din prenumeration { $name } har avbrutits.
          <br />
          Du har fortfarande åtkomst till { $name } ända tills { $date }.
sub-route-idx-cancel-aside-2 = Har du frågor? Besök <a>{ -brand-mozilla } Support</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problem med att ladda kund
sub-invoice-error =
    .title = Problem med att ladda fakturor
sub-billing-update-success = Din faktureringsinformation har uppdaterats
sub-invoice-previews-error-title = Problem med att ladda förhandsgranskningar av faktura
sub-invoice-previews-error-text = Det gick inte att läsa in förhandsgranskningar av faktura

## Routes - Subscription - ActionButton

pay-update-change-btn = Ändra
pay-update-manage-btn = Hantera

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Nästa fakturering den { $date }
sub-next-bill-due-date = Nästa räkning förfaller { $date }
sub-expires-on = Upphör { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Upphör { $expirationDate }
sub-route-idx-updating = Uppdaterar faktureringsinformation…
sub-route-payment-modal-heading = Ogiltig faktureringsinformation
sub-route-payment-modal-message-2 = Det verkar vara ett fel med ditt { -brand-paypal }-konto, vi måste vidta nödvändiga åtgärder för att lösa det här betalningsproblemet.
sub-route-missing-billing-agreement-payment-alert = Ogiltig betalningsinformation, det finns ett problem med ditt konto. <div>Hantera</div>
sub-route-funding-source-payment-alert = Ogiltig betalningsinformation. Det finns ett problem med ditt konto. Det kan ta en stund att rensa den här varningen efter att du har uppdaterat din information. <div>Hantera</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Ingen sådan plan för denna prenumeration.
invoice-not-found = Efterföljande faktura hittades inte
sub-item-no-such-subsequent-invoice = Efterföljande faktura hittades inte för denna prenumeration.
sub-invoice-preview-error-title = Förhandsgranskning av faktura hittades inte
sub-invoice-preview-error-text = Förhandsgranskning av faktura hittades inte för denna prenumeration

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Vill du fortsätta använda { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Din åtkomst till { $name } fortsätter och din faktureringscykel
    och betalning förblir densamma. Din nästa betalning är
    på { $amount } den { $endDate } till kortet som slutar på { $last }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Din åtkomst till { $name } fortsätter och din faktureringscykel
    och betalning förblir densamma. Din nästa betalning är
    på { $amount } den { $endDate }.
reactivate-confirm-button = Prenumerera igen

## $date (Date) - Last day of product access

reactivate-panel-copy = Du förlorar åtkomsten till { $name } den <strong>{ $date }</strong>.
reactivate-success-copy = Tack! Du är klar.
reactivate-success-button = Stäng

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Köp i appen
sub-iap-item-apple-purchase-2 = { -brand-apple }: Köp i appen
sub-iap-item-manage-button = Hantera
