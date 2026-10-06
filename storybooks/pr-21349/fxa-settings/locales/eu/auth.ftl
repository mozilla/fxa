## Non-email strings

# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } zure { -brand-mozilla } egiaztapen-kodea da. 5 minutu barru iraungiko da.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } egiaztapen-kodea: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } zure { -brand-mozilla } berreskuratzeko kodea da. 5 minutu barru iraungiko da.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } kodea: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } da zure { -brand-mozilla } berreskuratze-kodea. 5 minutu barru iraungiko da.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } kodea: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Mezu hau automatikoa da; errorez jaso baduzu, ez duzu ekintzarik burutu behar.
subplat-privacy-notice = Pribatutasun-oharra
subplat-privacy-plaintext = Pribatutasun-oharra:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Posta elektroniko hau jaso duzu { $email }-k { -product-mozilla-account } duelako eta { $productName }-n erregistratu zarelako.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Posta elektroniko hau jaso duzu { $email }-k { -product-mozilla-account } duelako.
subplat-explainer-multiple-2 = Posta elektroniko hau jaso duzu { $email }-k { -product-mozilla-account } duelako eta hainbat produktutara harpidetuta zaudelako.
subplat-explainer-was-deleted-2 = Posta elektroniko hau jaso duzu { $email } posta  { -product-mozilla-account } kontuan erregistratu delako..
subplat-manage-account-2 = Kudeatu zure { -product-mozilla-account } ezarpenak <a data-l10n-name="subplat-account-page">kontuaren orria</a> bisitatuz.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Kudeatu zure { -product-mozilla-account } ezarpenak zure kontuko orrian: { $accountSettingsUrl }
subplat-terms-policy = Baldintzak eta bertan behera uzteko politika
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Utzi harpidetza
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Aktibatu berriro harpidetza
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Eguneratu fakturazio-informazioa
subplat-privacy-policy = { -brand-mozilla }ren pribatutasun politika
subplat-privacy-policy-2 = { -product-mozilla-accounts(majuskulaz: "majuskulaz") } Pribatutasun-oharra
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(majuskulaz: "majuskulaz") } Zerbitzu-baldintzak
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Lege-oharra
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Pribatutasuna
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Mesedez, gure zerbitzuak hobetzen lagun iezaguzu honako <a data-l10n-name="cancellationSurveyUrl"> galdetegi motz honi erantzunez</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Mesedez, gure zerbitzuak hobetzen lagun iezaguzu honako galdetegi motz honi erantzunez
payment-details = Ordainketaren xehetasunak:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Faktura-zenbakia: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Kobratuta: { $invoiceTotal } { $invoiceDateOnly } egunean
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Hurrengo faktura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Ordainketa metodoa:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Ordainketa metodoa: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Ordainketa metodoa: { $cardName } txartela, { $lastFour } zenbakiekin amaitzen dena
payment-provider-card-ending-in-plaintext = Ordainketa metodoa: { $lastFour } zenbakiekin amaitzen den txartela
payment-provider-card-ending-in = <b>Ordainketa metodoa:</b> { $lastFour } zenbakiekin amaitzen den txartela
payment-provider-card-ending-in-card-name = <b>Ordainketa metodoa:</b> { $cardName } txartela, { $lastFour } zenbakiekin amaitzen dena
subscription-charges-invoice-summary = Fakturaren laburpena

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Faktura-zenbakia:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Faktura-zenbakia: { $invoiceNumber }
subscription-charges-invoice-date = <b>Data:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Data: { $invoiceDateOnly }
subscription-charges-prorated-price = Salneurri proportzionala
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Salneurri proportzionala: { $remainingAmountTotal }
subscription-charges-list-price = Salneurria
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Salneurria: { $offeringPrice }
subscription-charges-credit-from-unused-time = Erabili gabeko denboraren kreditua
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Erabili gabeko denboraren kreditua: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotala</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Azpi-totala: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Aldi bakarreko deskontua
subscription-charges-one-time-discount-plaintext = Aldi bakarreko deskontua: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Hilabeteko deskontua
       *[other] { $discountDuration } hilabeteko deskontua
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Hilabeteko deskontua: { $invoiceDiscountAmount }
       *[other] { $discountDuration } hilabeteko deskontua: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Deskontua
subscription-charges-discount-plaintext = Deskontua: { $invoiceDiscountAmount }
subscription-charges-taxes = Zergak eta tasak
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Zergak eta tasak: { $invoiceTaxAmount }
subscription-charges-total = <b>Guztira</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Guztira: { $invoiceTotal }
subscription-charges-credit-applied = Aplikatutako kreditua
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Aplikatutako kreditua: { $creditApplied }
subscription-charges-amount-paid = <b>Ordaindutako zenbatekoa</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Ordaindutako zenbatekoa: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Kontuan { $creditReceived } zenbatekodun kreditua jaso duzu eta zure etorkizuneko fakturetan aplikatuko da.

##

subscriptionSupport = Zure harpidetzari buruzko galderarik ba al duzu? Gure <a data-l10n-name="subscriptionSupportUrl"> laguntza taldea </a> zuri laguntzeko prest dago.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Zure harpidetzari buruzko galderarik ba al duzu? Gure laguntza taldea laguntzeko prest dago.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Eskarrikasko { $productName }-n harpidetzeagatik. Zure harpidetzari buruz galderarik baduzu edo { $productName }ri buruz informazio gehiago nahi baduzu, jarri harremanetan <a data-l10n-name="subscriptionSupportUrl"> gurekin</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Eskarrikasko { $productName }-n harpidetzeagatik. Zure harpidetzari buruz galderarik baduzu edo { $productName }-ri buruz informazio gehiago nahi baduzu, jarri harremanetan gurekin.
subscription-support-get-help = Jaso harpidetzari buruzko laguntza
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Kudeatu zure harpidetza</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Kudeatu zure harpidetza:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Jarri laguntzarekin harremanetan</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Jarri laguntzarekin harremanetan
subscriptionUpdateBillingEnsure = Zure ordainketa-metodoa eta kontuaren informazioa eguneratuta daudela <a data-l10n-name="updateBillingUrl"> hemen ziurtatu dezakezu</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Zure ordainketa-metodoa eta kontuaren informazioa eguneratuta daudela hemen ziurtatu dezakezu:
subscriptionUpdateBillingTry = Zure ordainketa egiten saiatuko gara berriro hurrengo egunetan, baina baliteke hori konpontzen lagundu behar izatea <a data-l10n-name="updateBillingUrl">ordainketen informazioa eguneratuz</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Zure ordainketa egiten saiatuko gara berriro hurrengo egunetan, baina baliteke hori konpontzen lagundu behar izatea ordainketen informazioa eguneratuz:
subscriptionUpdatePayment = Zure zerbitzua etenik ez izateko, mesedez <a data-l10n-name="updateBillingUrl">eguneratu zure ordainketa-informazioa</a> ahalik eta azkarren.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Zure zerbitzua etenik ez izateko, mesedez eguneratu zure ordainketa-informazioa ahalik eta azkarren.
view-invoice-link-action = Ikusi faktura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Ikusi faktura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Ongi etorri { $productName }(e)ra
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Ongi etorri { $productName }(e)ra
downloadSubscription-content-2 = Has gaitezen zure harpidetzako erabilera guztiak erabiltzen:
downloadSubscription-link-action-2 = Hasi erabiltzen
fraudulentAccountDeletion-subject-2 = Zure { -product-mozilla-account } ezabatu zen
fraudulentAccountDeletion-title = Zure kontua ezabatu da
fraudulentAccountDeletion-content-part1-v2 = Duela gutxi, { -product-mozilla-account } bat sortu da eta harpidetza kobratu da helbide elektroniko hau erabiliz. Kontu berri guztiekin egiten dugun bezala, zure kontua berresteko eskatu dizugu helbide elektroniko hau balioztatuz.
fraudulentAccountDeletion-content-part2-v2 = Gaur egun, kontua ez dela inoiz baieztatu ikusten dugu. Urrats hau amaitu ez denez, ez dakigu ziur harpidetza baimendua den. Ondorioz, helbide elektroniko honetan erregistratutako { -product-mozilla-account } ezabatu egin da eta zure harpidetza bertan behera utzi da, gastu guztiak itzulita.
fraudulentAccountDeletion-contact = Galderarik baduzu, jarri harremanetan gure <a data-l10n-name="mozillaSupportUrl">laguntza-taldearekin</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Galderarik baduzu, mesedez, gure laguntza taldearekin jar zaitez harremanetan: { $mozillaSupportUrl }
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-subject = Zure { $productName } doako proba laster amaitzen da
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-content-greeting = { $productName } bezero agurgarria,
# Variables:
#   $serviceLastActiveDateOnly (String) - The date the free trial ends, e.g. January 20, 2016
freeTrialEndingReminder-content-trial-ending = Zure doako proba <strong>{ $serviceLastActiveDateOnly }</strong> datan amaituko da.
freeTrialEndingReminder-content-trial-ending-plaintext = Zure doako proba { $serviceLastActiveDateOnly } datan amaituko da.
# Variables:
#   $invoiceTotal (String) - The total amount that will be charged, e.g. $9.99
#   $serviceLastActiveDateOnly (String) - The date the charge will occur, e.g. January 20, 2016
freeTrialEndingReminder-content-auto-charge = Ez baduzu aurretik bertan behera uzten, harpidetza automatikoki hasiko da eta <strong>{ $invoiceTotal }</strong> kobratuko dizugu zure kontuan ezarritako ordainketa-metodoa erabilita <strong>{ $serviceLastActiveDateOnly }</strong> egunean.
freeTrialEndingReminder-content-auto-charge-plaintext = Ez baduzu aurretik bertan behera uzten, harpidetza automatikoki hasiko da eta { $invoiceTotal } kobratuko dizugu zure kontuan ezarritako ordainketa-metodoa erabilita { $serviceLastActiveDateOnly } egunean.
freeTrialEndingReminder-content-charge-heading = Prezioaren xehetasunak
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $invoiceSubtotal (String) - The subtotal amount of the subscription, e.g. $12.99
freeTrialEndingReminder-content-charge-subscription = { $productName } harpidetza: { $invoiceSubtotal }
freeTrialEndingReminder-content-charge-subscription-2 = { $productName } harpidetza
# Variables:
#   $invoiceDiscountAmount (String) - The discount amount, as a negative number, e.g. -$3.00
freeTrialEndingReminder-content-charge-discount = Deskontua: { $invoiceDiscountAmount }
freeTrialEndingReminder-content-charge-discount-2 = Deskontua
# Variables:
#   $invoiceTaxAmount (String) - The tax amount, e.g. $1.20
freeTrialEndingReminder-content-charge-tax = Zergak: { $invoiceTaxAmount }
freeTrialEndingReminder-content-charge-tax-2 = Zergak
# Variables:
#   $serviceLastActiveDateOnly (String) - The date the charge will occur, e.g. January 20, 2016
#   $invoiceTotal (String) - The total amount due, e.g. $9.99
freeTrialEndingReminder-content-charge-total = Guztira { $serviceLastActiveDateOnly } egunera arte ordaintzeko: { $invoiceTotal }
freeTrialEndingReminder-content-charge-total-2 = Guztira { $serviceLastActiveDateOnly } egunera arte ordaintzeko
freeTrialEndingReminder-content-account-link = Zure ordainketa-metodoa eta kontuaren informazioa <a data-l10n-name="freeTrialEndingReminder-update-billing">hemen</a> berrikus eta egunera dezakezu.
freeTrialEndingReminder-content-account-link-plaintext = Zure ordainketa-metodoa eta kontuaren informazioa hemen berrikus eta egunera dezakezu:
# Variables:
#   $serviceLastActiveDateOnly (String) - The date the trial ends, e.g. January 20, 2016
freeTrialEndingReminder-content-cancel-link = Kobratzea ekiditeko, utzi harpidetza bertan behera <strong>{ $serviceLastActiveDateOnly }</strong> egunaren aurretik: <a data-l10n-name="freeTrialEndingReminder-cancel-subscription">Utzi harpidetza</a>
freeTrialEndingReminder-content-cancel-link-plaintext = Kobratzea ekiditeko, utzi harpidetza bertan behera { $serviceLastActiveDateOnly } egunaren aurretik:
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-content-thanks = Eskerrik asko { $productName } probatzeagatik. Zure probarako aldi edo harpidetzari buruzko galderarik baduzu, <a data-l10n-name="freeTrialEndingReminder-contact-support">jarri gurekin harremanetan</a>.
freeTrialEndingReminder-content-thanks-plaintext = Eskerrik asko { $productName } probatzeagatik. Zure probarako aldi edo harpidetzari buruzko galderarik baduzu, jarri gurekin harremanetan.
freeTrialEndingReminder-content-closing = Adeitasunez,
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-content-signature = { $productName } taldea
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
freeTrialEndingReminder-content-support-plaintext = Jarri gurekin harremanetan: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Zure { $productName } harpidetza bertan behera utzi da
subscriptionAccountDeletion-title = Sentitzen dugu zu joatea
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Duela gutxi ezabatu duzu zure { -product-mozilla-account }. Ondorioz, { $productName } harpidetza bertan behera utzi dugu. { $invoiceTotal }ren azken ordainketa { $invoiceDateOnly } egunean ordaindu zen.
subscriptionAccountReminderFirst-subject = Oroigarria: amaitu zure kontuaren ezarpenak
subscriptionAccountReminderFirst-title = Oraindik ezin duzu zure harpidetza sartu
subscriptionAccountReminderFirst-content-info-3 = Duela egun batzuk { -product-mozilla-account } bat sortu zenuen baina ez zenuen inoiz baieztatu. Zure kontua konfiguratzen amaitzea espero dugu, harpidetza berria erabil dezazun.
subscriptionAccountReminderFirst-content-select-2 = Hautatu "Sortu pasahitza" pasahitz berri bat konfiguratzeko eta zure kontua berresten amaitzeko.
subscriptionAccountReminderFirst-action = Sortu pasahitza
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Azken oroigarria: konfiguratu zure kontua
subscriptionAccountReminderSecond-title-2 = Ongi etorri { -brand-mozilla }-ra!
subscriptionAccountReminderSecond-content-info-3 = Duela egun batzuk { -product-mozilla-account } bat sortu zenuen baina ez zenuen inoiz baieztatu. Zure kontua konfiguratzen amaitzea espero dugu, harpidetza berria erabil dezazun.
subscriptionAccountReminderSecond-content-select-2 = Hautatu "Sortu pasahitza" pasahitz berri bat konfiguratzeko eta zure kontua berresten amaitzeko.
subscriptionAccountReminderSecond-action = Sortu pasahitza
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Zure { $productName } harpidetza bertan behera utzi da
subscriptionCancellation-title = Sentitzen dugu zu joatea

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = { $productName } harpidetza bertan behera utzi dugu. { $invoiceTotal }ren azken ordainketa { $invoiceDateOnly } egunean ordaindu zen.
subscriptionCancellation-outstanding-content-2 = { $productName } harpidetza bertan behera utzi dugu. { $invoiceTotal }ren azken ordainketa { $invoiceDateOnly } egunean ordainduko da.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Zure zerbitzuak uneko fakturazio-aldia amaitu arte jarraituko du, hau da, { $serviceLastActiveDateOnly }.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-freeTrial-subject = Zure { $productName } doako proba bertan behera utzi da
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $trialEndDateOnly (String) - The date when the free trial ends, e.g. 01/20/2016
subscriptionCancellation-freeTrial-content = Zure { $productName } doako proba bertan behera utzi da. Erabiltzeko aukera { $trialEndDateOnly } egunean amaituko da. Ez zaizu ezer kobratuko.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = { $productName }-ra aldatu zara
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = { $productNameOld }-tik { $productName }-ra behar bezala aldatu zara.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Zure hurrengo fakturatik hasita, zure kobratzea { $paymentAmountOld } { $productPaymentCycleOld } bakoitzeko izatetik,  { $paymentAmountNew } { $productPaymentCycleNew } bakoitzeko izatera aldatuko da. Une horretan, { $paymentProrated }-ko kreditu bakarre bat ere emango zaizu { $productPaymentCycleOld } honen gainontzeko kargu txikiagoa islatzeko.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = { $productName } erabili ahal izateko instalatu behar duzun software berria badago, mezu elektroniko bat jasoko duzu deskargatzeko argibideekin.
subscriptionDowngrade-content-auto-renew = Zure harpidetzak fakturazio-aldi bakoitza automatikoki berrituko du bertan behera uztea erabakitzen ez baduzu.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Zure { $productName } harpidetza laster iraungiko da
subscriptionEndingReminder-title = Zure { $productName } harpidetza laster iraungiko da
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = { $productName } erabiltzeko aukera <strong>{ $serviceLastActiveDateOnly }</strong> egunean amaituko da.
subscriptionEndingReminder-content-line2-v2 = { $productName } erabiltzen jarraitu nahi baduzu, <a data-l10n-name="subscriptionEndingReminder-subscription-management">harpidetza-kudeaketan</a> harpide zaitezke <strong>{ $serviceLastActiveDateOnly }</strong> egunaren aurretik. Laguntza behar izanez gero, <a data-l10n-name="subscriptionEndingReminder-contact-support">jarri harremanetan gure laguntza-taldearekin</a>.
subscriptionEndingReminder-content-line1-plaintext = { $productName } erabiltzeko aukera { $serviceLastActiveDateOnly } egunean amaituko da.
subscriptionEndingReminder-content-line2-plaintext-v2 = { $productName } erabiltzen jarraitu nahi baduzu, harpidetza-kudeaketan harpide zaitezke { $serviceLastActiveDateOnly } egunaren aurretik. Laguntza behar izanez gero, jarri harremanetan gure laguntza-taldearekin.
subscriptionEndingReminder-content-closing = Eskerrik asko harpidedun izateagatik!
subscriptionEndingReminder-churn-title = Erabiltzeko aukera mantendu nahi duzu?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Termino mugatu eta murrizketak aplikatzen dira</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Termino mugatu eta murrizketak aplikatzen dira: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Jarri harremanetan gure laguntza-taldearekin: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Zure { $productName } harpidetza bertan behera utzi da
subscriptionFailedPaymentsCancellation-title = Zure harpidetza bertan behera utzi da
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = { $productName } harpidetza bertan behera utzi dugu hainbat ordainketa-saiakerak huts egin direlako. Berriro sarbidea lortzeko, hasi harpidetza berri bat ordainketa-metodo eguneratu batekin.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } ordainketa berretsi da
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Eskerrik asko { $productName } zerbitzura harpidetzeagatik
subscriptionFirstInvoice-content-processing = Ordainketa prozesatzen ari da eta lau lanegun behar izan ditzake osatzeko.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = { $productName } erabiltzen hasteko mezu elektroniko bat jasoko duzu.
subscriptionFirstInvoice-content-auto-renew = Zure harpidetzak fakturazio-aldi bakoitza automatikoki berrituko du bertan behera uztea erabakitzen ez baduzu.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Zure hurrengo faktura { $nextInvoiceDateOnly } egunean igorriko da.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = { $productName } produkturako ordainketa-metodoa iraungita edo iraungitzear dago
subscriptionPaymentExpired-title-2 = Zure ordainketa-metodoa iraungita edo iraungitzear dago
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = { $productName } produkturako darabilzun ordainketa-metodoa iraungita edo iraungitzear dago.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } ordainketak huts egin du
subscriptionPaymentFailed-title = Barkatu, arazoak ditugu ordainketarekin
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Arazo bat izan dugu { $productName }-ren azken ordainketarekin.
subscriptionPaymentFailed-content-outdated-1 = Baliteke zure ordainketa-metodoa iraungi izana edo zaharkituta egotea.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Ordainketa-informazioa eguneratu behar da { $productName }-rako
subscriptionPaymentProviderCancelled-title = Barkatu, arazoak ditugu ordainketa-metodoarekin
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Arazo bat hauteman dugu zure ordainketa-metodoarekin: { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Baliteke zure ordainketa-metodoa iraungi izana edo zaharkituta egotea.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject-2 = Zure { $productName } harpidetza berriz aktibatu da
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-free-trial-subject = Zure { $productName } doako proba berriz aktibatu da
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Eskerrik asko { $productName } harpidetza berriz aktibatzeagatik!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-free-trial-title = Eskerrik asko zure { $productName } doako proba berriz aktibatzeagatik!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Zure fakturazio-zikloa eta ordainketa berdinak izango dira. Hurrengo kargua { $invoiceTotal } izango da { $nextInvoiceDateOnly } egunean. Zure harpidetzak fakturazio-aldi bakoitza automatikoki berrituko du, bertan behera uztea erabakit arte.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } berritze automatikoko oharra
subscriptionRenewalReminder-title = Zure harpidetza laster berrituko da
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = { $productName } bezero agurgarria:
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Zure uneko harpidetza automatikoki berritzear da { $reminderLength } egun barru.
subscriptionRenewalReminder-content-discount-change = Zure hurrengo fakturak prezioaren aldaketa bat du, aurretik zuen deskontua amaitu eta deskontu berri bat aplikatu delako.
subscriptionRenewalReminder-content-discount-ending = Aurreko deskontua amaitu denez, zure harpidetza prezio arruntean berrituko da.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = Ordua iristean, { -brand-mozilla }(e)k zure eguneko harpidetza berritu eta { $invoiceTotalExcludingTax } + zergetako { $invoiceTax } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-charge-with-tax-week = Ordua iristean, { -brand-mozilla }(e)k zure asteko harpidetza berritu eta { $invoiceTotalExcludingTax } + zergetako { $invoiceTax } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-charge-with-tax-month = Ordua iristean, { -brand-mozilla }(e)k zure hileko harpidetza berritu eta { $invoiceTotalExcludingTax } + zergetako { $invoiceTax } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = Ordua iristean, { -brand-mozilla }(e)k zure sei hilabeteko harpidetza berritu eta { $invoiceTotalExcludingTax } + zergetako { $invoiceTax } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-charge-with-tax-year = Ordua iristean, { -brand-mozilla }(e)k zure urteko harpidetza berritu eta { $invoiceTotalExcludingTax } + zergetako { $invoiceTax } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-charge-with-tax-default = Ordua iristean, { -brand-mozilla }(e)k zure harpidetza berritu eta { $invoiceTotalExcludingTax } + zergetako { $invoiceTax } kobratuko du zure kontuko ordainketa-metodoa erabilita.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = Ordua iristean, { -brand-mozilla }(e)k zure eguneko harpidetza berritu eta { $invoiceTotal } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-charge-invoice-total-week = Ordua iristean, { -brand-mozilla }(e)k zure asteko harpidetza berritu eta { $invoiceTotal } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-charge-invoice-total-month = Ordua iristean, { -brand-mozilla }(e)k zure hileko harpidetza berritu eta { $invoiceTotal } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = Ordua iristean, { -brand-mozilla }(e)k zure sei hilabeteko harpidetza berritu eta { $invoiceTotal } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-charge-invoice-total-year = Ordua iristean, { -brand-mozilla }(e)k zure urteko harpidetza berritu eta { $invoiceTotal } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-charge-invoice-total-default = Ordua iristean, { -brand-mozilla }(e)k zure harpidetza berritu eta { $invoiceTotal } kobratuko du zure kontuko ordainketa-metodoa erabilita.
subscriptionRenewalReminder-content-closing = Adeitasunez
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } taldea
subscriptionReplaced-subject = Zure harpidetza eguneratu egin da maila-aldaketaren parte gisa
subscriptionReplaced-title = Zure harpidetza eguneratu egin da
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Zure { $productName } banakako harpidetza ordezkatu egin da eta zure pakete berriaren barruan dago orain.
subscriptionReplaced-content-credit = Aurreko harpidetzan erabili gabeko denborari dagokion kreditua jasoko duzu. Kreditu hau automatikoki aplikatuko da zure kontuan eta etorkizuneko karguetarako erabiliko da.
subscriptionReplaced-content-no-action = Zure aldetik ez duzu ezer egin behar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } ordainketa jaso da
subscriptionSubsequentInvoice-title = Eskerrik asko harpidedun izateagatik!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = { $productName }-ren azken ordainketa jaso dugu.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Zure hurrengo faktura { $nextInvoiceDateOnly } egunean igorriko da.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = { $productName }-era berritu zara
subscriptionUpgrade-title = Eskerrik asko eguneratzeagatik!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = { $productName } produktura aldatu zara.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Behin ordaintzeko { $invoiceAmountDue }-ko kuota kobratu zaizu fakturazio-epe honen gainerakoari dagokion zure harpidetzaren prezio altuagoa islatzeko ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Kontuan { $paymentProrated } zenbatekodun kreditua jaso duzu.
subscriptionUpgrade-content-subscription-next-bill-change = Hurrengo fakturatik hasita, zure harpidetzaren prezioa aldatu egingo da.
subscriptionUpgrade-content-old-price-day = Aurreko prezioa eguneko { $paymentAmountOld } zen.
subscriptionUpgrade-content-old-price-week = Aurreko prezioa asteko { $paymentAmountOld } zen.
subscriptionUpgrade-content-old-price-month = Aurreko prezioa hilean { $paymentAmountOld } zen.
subscriptionUpgrade-content-old-price-halfyear = Aurreko prezioa sei hilean behin { $paymentAmountOld } zen.
subscriptionUpgrade-content-old-price-year = Aurreko prezioa urtean { $paymentAmountOld } zen.
subscriptionUpgrade-content-old-price-default = Aurreko prezioa fakturazio-tarte bakoitzean { $paymentAmountOld } zen.
subscriptionUpgrade-content-old-price-day-tax = Aurreko prezioa eguneko { $paymentAmountOld } + zergetako { $paymentTaxOld } zen.
subscriptionUpgrade-content-old-price-week-tax = Aurreko prezioa asteko { $paymentAmountOld } + zergetako { $paymentTaxOld } zen.
subscriptionUpgrade-content-old-price-month-tax = Aurreko prezioa hilean { $paymentAmountOld } + zergetako { $paymentTaxOld } zen.
subscriptionUpgrade-content-old-price-halfyear-tax = Aurreko prezioa sei hilean behin { $paymentAmountOld } + zergetako { $paymentTaxOld } zen.
subscriptionUpgrade-content-old-price-year-tax = Aurreko prezioa urtean { $paymentAmountOld } + zergetako { $paymentTaxOld } zen.
subscriptionUpgrade-content-old-price-default-tax = Aurreko prezioa fakturazio-tarte bakoitzean { $paymentAmountOld } + zergetako { $paymentTaxOld } zen.
subscriptionUpgrade-content-new-price-day = Aurrerantzean, eguneko { $paymentAmountNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-week = Aurrerantzean, asteko { $paymentAmountNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-month = Aurrerantzean, hilean { $paymentAmountNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-halfyear = Aurrerantzean, sei hilean behin { $paymentAmountNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-year = Aurrerantzean, urtean { $paymentAmountNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-default = Aurrerantzean, fakturazio-tarte bakoitzean { $paymentAmountNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-day-dtax = Aurrerantzean, eguneko { $paymentAmountNew } + zergetako { $paymentTaxNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-week-tax = Aurrerantzean, asteko { $paymentAmountNew } + zergetako { $paymentTaxNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-month-tax = Aurrerantzean, hilean { $paymentAmountNew } + zergetako { $paymentTaxNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-halfyear-tax = Aurrerantzean, sei hilean behin { $paymentAmountNew } + zergetako { $paymentTaxNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-year-tax = Aurrerantzean, urtean { $paymentAmountNew } + zergetako { $paymentTaxNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-content-new-price-default-tax = Aurrerantzean, fakturazio-tarte bakoitzean { $paymentAmountNew } + zergetako { $paymentTaxNew } kobratuko zaizu, deskontuak salbu.
subscriptionUpgrade-existing = Aurretik duzun harpidetzaren batek bat-etortze partziala badu aldaketa honekin, guk kudeatuko dugu hori eta mezu elektroniko bereizia bidaliko dizugu xehetasunekin. Zure plan berriak instalazioa eskatzen duten produktuak baditu, mezu elektroniko bereizia bidaliko dizugu konfiguratzeko jarraibideekin.
subscriptionUpgrade-auto-renew = Zure harpidetzak fakturazio-aldi bakoitza automatikoki berrituko du bertan behera uztea erabakitzen ez baduzu.
subscriptionsPaymentExpired-subject-2 = Zure harpidetzetan erabiltzen den ordainketa-metodoa iraungita edo iraungitzear dago
subscriptionsPaymentExpired-title-2 = Zure ordainketa-metodoa iraungita edo iraungitzear dago
subscriptionsPaymentExpired-content-2 = Ondorengo harpidetzetan ordainketak egiteko erabiltzen duzun ordainketa-metodoa iraungita edo iraungitzear dago
subscriptionsPaymentProviderCancelled-subject = Ordainketa-informazioaren eguneratzea beharrezkoa da { -brand-mozilla } harpidetzetan
subscriptionsPaymentProviderCancelled-title = Barkatu, arazoak ditugu ordainketa-metodoarekin
subscriptionsPaymentProviderCancelled-content-detected = Arazo bat hauteman dugu zure ordainketa-metodoarekin hurrengo harpidetzetan.
subscriptionsPaymentProviderCancelled-content-payment-1 = Baliteke zure ordainketa-metodoa iraungi izana edo zaharkituta egotea.
