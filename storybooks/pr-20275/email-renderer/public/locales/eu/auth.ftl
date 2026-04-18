## Non-email strings

session-verify-send-push-title-2 = Zure { -product-mozilla-account }-n saioa hasi nahi duzu?
session-verify-send-push-body-2 = Klikatu hemen zeu zarela egiaztatzeko
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

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Azpi-totala: { $invoiceSubtotal }

##

subscriptionSupport = Zure harpidetzari buruzko galderarik ba al duzu? Gure <a data-l10n-name="subscriptionSupportUrl"> laguntza taldea </a> zuri laguntzeko prest dago.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Zure harpidetzari buruzko galderarik ba al duzu? Gure laguntza taldea laguntzeko prest dago.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Eskarrikasko { $productName }-n harpidetzeagatik. Zure harpidetzari buruz galderarik baduzu edo { $productName }ri buruz informazio gehiago nahi baduzu, jarri harremanetan <a data-l10n-name="subscriptionSupportUrl"> gurekin</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Eskarrikasko { $productName }-n harpidetzeagatik. Zure harpidetzari buruz galderarik baduzu edo { $productName }-ri buruz informazio gehiago nahi baduzu, jarri harremanetan gurekin.
subscriptionUpdateBillingEnsure = Zure ordainketa-metodoa eta kontuaren informazioa eguneratuta daudela <a data-l10n-name="updateBillingUrl"> hemen ziurtatu dezakezu</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Zure ordainketa-metodoa eta kontuaren informazioa eguneratuta daudela hemen ziurtatu dezakezu:
subscriptionUpdateBillingTry = Zure ordainketa egiten saiatuko gara berriro hurrengo egunetan, baina baliteke hori konpontzen lagundu behar izatea <a data-l10n-name="updateBillingUrl">ordainketen informazioa eguneratuz</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Zure ordainketa egiten saiatuko gara berriro hurrengo egunetan, baina baliteke hori konpontzen lagundu behar izatea ordainketen informazioa eguneratuz:
subscriptionUpdatePayment = Zure zerbitzua etenik ez izateko, mesedez <a data-l10n-name="updateBillingUrl">eguneratu zure ordainketa-informazioa</a> ahalik eta azkarren.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Zure zerbitzua etenik ez izateko, mesedez eguneratu zure ordainketa-informazioa ahalik eta azkarren.
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
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } ordainketak huts egin du
subscriptionPaymentFailed-title = Barkatu, arazoak ditugu ordainketarekin
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Arazo bat izan dugu { $productName }-ren azken ordainketarekin.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Ordainketa-informazioa eguneratu behar da { $productName }-rako
subscriptionPaymentProviderCancelled-title = Barkatu, arazoak ditugu ordainketa-metodoarekin
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Arazo bat hauteman dugu zure ordainketa-metodoarekin: { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } harpidetza berriz aktibatua
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Eskerrik asko { $productName } harpidetza berriz aktibatzeagatik!
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
subscriptionRenewalReminder-content-closing = Adeitasunez
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } taldea
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } ordainketa jaso da
subscriptionSubsequentInvoice-title = Eskerrik asko harpidedun izateagatik!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = { $productName }-ren azken ordainketa jaso dugu.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = { $productName }-era berritu zara
subscriptionUpgrade-title = Eskerrik asko eguneratzeagatik!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Zure harpidetzak fakturazio-aldi bakoitza automatikoki berrituko du bertan behera uztea erabakitzen ez baduzu.
subscriptionsPaymentProviderCancelled-subject = Ordainketa-informazioaren eguneratzea beharrezkoa da { -brand-mozilla } harpidetzetan
subscriptionsPaymentProviderCancelled-title = Barkatu, arazoak ditugu ordainketa-metodoarekin
subscriptionsPaymentProviderCancelled-content-detected = Arazo bat hauteman dugu zure ordainketa-metodoarekin hurrengo harpidetzetan.
