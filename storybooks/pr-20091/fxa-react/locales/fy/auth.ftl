## Non-email strings

session-verify-send-push-title-2 = Oanmelde by jo { -product-mozilla-account }?
session-verify-send-push-body-2 = Klik hjir om te befêstigjen dat jo it binne
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } is jo { -brand-mozilla }-ferifikaasjekoade. Ferrint oer 5 minuten.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla }-ferifikaasjekoade: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } is jo { -brand-mozilla }-werstelkoade. Ferrint oer 5 minuten.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla }-koade: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } is jo { -brand-mozilla }-werstelkoade. Ferrint oer 5 minuten.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla }-koade: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla }-logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla }-logo">
subplat-automated-email = Dit is in automatysk e-mailberjocht; as jo it troch fersin ûntfongen hawwe, hoege jo neat te dwaan.
subplat-privacy-notice = Privacyferklearring
subplat-privacy-plaintext = Privacyferklearring:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Jo ûntfange dit berjocht, omdat { $email } in { -product-mozilla-account } hat en jo ynskreaun binne foar { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Jo ûntfange dit e-mailberjocht omdat { $email } in { -product-mozilla-account } hat
subplat-explainer-multiple-2 = Jo ûntfange dit berjocht omdat { $email } in { -product-mozilla-account } hat en jo binne abonnearre op mear produkten.
subplat-explainer-was-deleted-2 = Jo ûntfange dit e-mailberjocht, omdat { $email } registrearre wie foar in { -product-mozilla-account }
subplat-manage-account-2 = Behear jo { -product-mozilla-account }-ynstellingen troch nei jo <a data-l10n-name="subplat-account-page">accountside</a> te gean.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = { -product-mozilla-account }-ynstellingen beheare troch jo accountside te besykjen: { $accountSettingsUrl }
subplat-terms-policy = Betingsten en annulearringsbelied
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Abonnemint opsizze
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Abonnemint opnij aktivearje
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Fakturaasjegegevens bywurkje
subplat-privacy-policy = { -brand-mozilla }-privacybelied
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") }-privacyferklearring
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") }-Tsjinstbetingsten
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Juridysk
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacy
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Help ús de tsjinstferliening te ferbetterjen troch dizze <a data-l10n-name="cancellationSurveyUrl">koarte enkête</a> yn te foljen.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Help ús de tsjinstferliening te ferbetterjen troch dizze koarte enkête yn te foljen:
payment-details = Betellingsgegevens:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Faktuernûmer: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceTotal } yn rekkening brocht op { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Folgjende faktuer: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Betellingsmetoade:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Betellingsmetoade: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Betellingsmetoade: { $cardName } einigjend op { $lastFour }
payment-provider-card-ending-in-plaintext = Betellingsmetoade: kaart einigjend op { $lastFour }
payment-provider-card-ending-in = <b>Betellingsmetoade:</b> kaart einigjend op { $lastFour }
payment-provider-card-ending-in-card-name = <b>Betellingsmetoade:</b> { $cardName } einigjend op { $lastFour }
subscription-charges-invoice-summary = Faktuergearfetting

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Faktuernûmer:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Faktuernûmer: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Nei rato priis
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Nei rato priis: { $remainingAmountTotal }
subscription-charges-list-price = Normale priis
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Normale priis: { $offeringPrice }
subscription-charges-credit-from-unused-time = Tegoed fan net-brûkte tiid
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Tegoed fan net-brûkte tiid: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotaal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotaal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Ienmalige koarting
subscription-charges-one-time-discount-plaintext = Ienmalige koarting: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration } moanne koarting
       *[other] { $discountDuration } moannen koarting
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration } moanne koarting: { $invoiceDiscountAmount }
       *[other] { $discountDuration } moannen koarting: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Koarting
subscription-charges-discount-plaintext = Koarting: { $invoiceDiscountAmount }
subscription-charges-taxes = Btw en taslaggen
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Belestingen en taslaggen: { $invoiceTaxAmount }
subscription-charges-total = <b>Totaal</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Totaal: { $invoiceTotal }
subscription-charges-credit-applied = Tegoed tapast
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Tegoed tapast: { $creditApplied }
subscription-charges-amount-paid = <b>Betelle bedrach</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Betelle bedrach: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Jo hawwe in accounttegoed fan { $creditReceived } ûntfongen. Dit tegoed wurdt op jo takomstige faktueren tapast.

##

subscriptionSupport = Fragen oer jo abonnemint? Us <a data-l10n-name="subscriptionSupportUrl">stipeteam</a> is der om jo te helpen.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Fragen oer jo abonnemint? Us stipeteam is der om jo te helpen:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Tank foar jo abonnemint op { $productName }. As jo fragen oer jo abonnemint hawwe, of mear ynformaasje oer { $productName } wolle, <a data-l10n-name="subscriptionSupportUrl">nim dan kontakt op</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Tank foar jo abonnemint op { $productName }. As jo fragen oer jo abonnemint hawwe, of mear ynformaasje oer { $productName } wolle, nim dan kontakt op:
subscription-support-get-help = Help by jo abonnemint krije
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Jo abonnemint beheare</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Jo abonnemint beheare:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Kontakt opnimme</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Kontakt opnimme:
subscriptionUpdateBillingEnsure = Jo kinne <a data-l10n-name="updateBillingUrl">hjir</a> derfoar soargje dat jo betellingsmetoade en accountgegevens aktueel binne.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Jo kinne hjir derfoar soargje dat jo betellingsmetoade en accountgegevens aktueel binne:
subscriptionUpdateBillingTry = Wy sille de kommende dagen jo betelling opnij probearje yn te barren, mar jo moatte ús miskien helpe troch <a data-l10n-name="updateBillingUrl">jo betellingsgegevens by te wurkjen</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Wy sille de kommende dagen jo betelling opnij probearje yn te barren, mar jo moatte ús miskien helpe troch jo betellingsgegevens by te wurkjen:
subscriptionUpdatePayment = Wurkje sa gau as mooglik <a data-l10n-name="updateBillingUrl">jo betellingsgegevens by</a> om ûnderbrekking fan jo service foar te kommen.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Wurkje sa gau as mooglik jo betellingsgegevens by om ûnderbrekking fan jo service foar te kommen:
view-invoice-link-action = Faktuer besjen
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Faktuer besjen: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Wolkom by { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Wolkom by { $productName }.
downloadSubscription-content-2 = Litte wy oan de slach gean mei alle funksjes dy’t by jo abonnemint ynbegrepen binne:
downloadSubscription-link-action-2 = Oan de slach
fraudulentAccountDeletion-subject-2 = Jo { -product-mozilla-account } is fuortsmiten
fraudulentAccountDeletion-title = Jo account is fuortsmiten
fraudulentAccountDeletion-content-part1-v2 = Koartlyn is der in { -product-mozilla-account } oanmakke en in abonnemint mei dit e-mailadres yn rekken brocht. Lykas wy dogge mei alle nije accounts, hawwe wy jo frege om jo account te befêstigjen troch dit e-mailadres earst te falidearjen.
fraudulentAccountDeletion-content-part2-v2 = Op it stuit sjogge wy dat dizze account nea befêstige is. Omdat dizze stap net foltôge is, binne wy net wis oft dit in autorisearre abonnemint is. Dêrtroch is it { -product-mozilla-account }, registrearre by dit e-mailadres, fuortsmiten en is jo abonnemint annulearre binne alle kosten werombetelle.
fraudulentAccountDeletion-contact = As jo fragen hawwe, nim dan kontakt op mei ús <a data-l10n-name="mozillaSupportUrl">stipeteam</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = As jo fragen hawwe, nim dan kontakt op mei ús stipeteam: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Jo abonnemint op { $productName } is opsein
subscriptionAccountDeletion-title = Spitich dat jo ôfsette
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Jo hawwe jo { -product-mozilla-account } koartlyn fuortsmiten. As gefolch hjirfan hawwe wy jo abonnemint foar { $productName } opsein. Jo lêste betelling fan { $invoiceTotal } is betelle op { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Oantinken: foltôgje it ynstellen fan jo account
subscriptionAccountReminderFirst-title = Jo hawwe noch gjin tagong ta jo abonnemint
subscriptionAccountReminderFirst-content-info-3 = In pear dagen lyn hawwe jo in { -product-mozilla-account } oanmakke, mar dizze nea befêstige. Wy hoopje dat jo it ynstellen fan jo account foltôgje, sadat jo jo nije abonnemint brûke kinne.
subscriptionAccountReminderFirst-content-select-2 = Selektearje ‘Wachtwurd oanmeitsje’ om in nij wachtwurd yn te stellen en de befêstiging fan jo account te foltôgjen.
subscriptionAccountReminderFirst-action = Wachtwurd oanmeitsje
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Lêste oantinken: stel jo account yn
subscriptionAccountReminderSecond-title-2 = Wolkom by { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = In pear dagen lyn hawwe jo in { -product-mozilla-account } oanmakke, mar dizze nea befêstige. Wy hoopje dat jo it ynstellen fan jo account foltôgje, sadat jo jo nije abonnemint brûke kinne.
subscriptionAccountReminderSecond-content-select-2 = Selektearje ‘Wachtwurd oanmeitsje’ om in nij wachtwurd yn te stellen en de befêstiging fan jo account te foltôgjen.
subscriptionAccountReminderSecond-action = Wachtwurd oanmeitsje
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Jo abonnemint op { $productName } is opsein
subscriptionCancellation-title = Spitich dat jo ôfsette

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Wy hawwe jo { $productName }-abonnemint annulearre. Jo lêste betelling fan { $invoiceTotal } is betelle op { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Wy hawwe jo { $productName }-abonnemint annulearre. Jo lêste betelling fan { $invoiceTotal } wurdt betelle op { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Jo tsjinst sil trochgean oant it ein fan jo aktuele fakturearringperioade, dat is { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Jo binne oerskeakele nei { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Jo binne mei sukses oerskeakele fan { $productNameOld } nei { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Fan jo folgjende faktuer ôf wizigje jo kosten fan { $paymentAmountOld } yn ’e { $productPaymentCycleOld } nei { $paymentAmountNew } yn ’e { $productPaymentCycleNew }. Jo ûntfange dan ek ien kear in kredyt fan { $paymentProrated } ta gefolch fan de legere kosten foar de rest fan dizze { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = As jo nije software ynstallearje moatte om { $productName } brûke te kinnen, dan ûntfange jo in ôfsûnderlik e-mailbericht mei downloadynstruksjes.
subscriptionDowngrade-content-auto-renew = Jo abonnemint wurdt automatysk elke fakturearringsperioade ferlinge, útsein jo derfoar kieze om op te sizzen.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Jo abonnemint op { $productName } ferrint ynkoarten
subscriptionEndingReminder-title = Jo abonnemint op { $productName } ferrint ynkoarten
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Jo tagong ta { $productName } sil einigje op <strong>{ $serviceLastActiveDateOnly } </strong>.
subscriptionEndingReminder-content-line2 = As jo { $productName } brûke bliuwe wolle, kinne jo foar <strong>{ $serviceLastActiveDateOnly }</strong> jo abonnemint opnij aktivearje yn <a data-l10n-name="subscriptionEndingReminder-account-settings">Accountynstellingen</a>. As jo help nedich hawwe, <a data-l10n-name="subscriptionEndingReminder-contact-support">nim dan kontakt op mei ús stipeteam</a>.
subscriptionEndingReminder-content-line1-plaintext = Jo tagong ta { $productName } sil einigje op { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = As jo { $productName } brûke bliuwe wolle, kinne jo jo abonnemint foar { $serviceLastActiveDateOnly } opnij aktivearje yn Accountynstellingen. Nim kontakt op mei ús stipeteam ss jo help nedich hawwe.
subscriptionEndingReminder-content-closing = Tank dat jo in wurdearre abonnee binne!
subscriptionEndingReminder-churn-title = Wolle jo tagong behâlde?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Beheinde betingsten en beheiningen binne fan tapassing</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Beheinde betingsten en beheiningen binne fan tapassing: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Nim kontakt op mei ús stipeteam: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Jo abonnemint op { $productName } is opsein
subscriptionFailedPaymentsCancellation-title = Jo abonnemint is opsein
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Wy hawwe jo abonnemint op { $productName } opsein, omdat meardere betellingsbesykjen mislearre binne. Start in nij abonnemint mei in bywurke betellingsmetoade om wer tagong te krijen.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = De betelling foar { $productName } is befêstige
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Tank foar jo abonnemint op { $productName }
subscriptionFirstInvoice-content-processing = Jo betelling wurdt op dit stuit ferwurke en it kin oant fjouwer wurkdagen duorje eardat dizze foltôge is.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Jo ûntfange in apart e-mailberjocht oer hoe’t jo { $productName } brûke gean kinne.
subscriptionFirstInvoice-content-auto-renew = Jo abonnemint wurdt automatysk elke fakturearringsperioade ferlinge, útsein jo derfoar kieze om op te sizzen.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Jo folgjende faktuer wurdt op { $nextInvoiceDateOnly } yn rekkening brocht.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Betellingsmetoade foar { $productName } is ferrûn of ferrint ynkoarten
subscriptionPaymentExpired-title-2 = Jo betellingsmetoade is ferrûn of ferrint ynkoarten
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = De betellingsmetoade dy’t jo foar { $productName } brûke, is ferrûn of ferrint ynkoarten.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Betelling foar { $productName } mislearre
subscriptionPaymentFailed-title = Sorry, wy hawwe problemen mei jo betelling
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Wy hiene in probleem mei jo lêste betelling foar { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Miskien is jo betellingsmetoade ferrûn, of jo aktuele betellingsmetoade is ferâldere.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Bywurkjen fan betellingsynformaasje fereaske foar { $productName }
subscriptionPaymentProviderCancelled-title = Sorry, wy hawwe problemen mei jo betellingsmetoade
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Wy hawwe in probleem mei jo betellingsmetoade foar { $productName } fêststeld.
subscriptionPaymentProviderCancelled-content-reason-1 = Miskien is jo betellingsmetoade ferrûn, of jo aktuele betellingsmetoade is ferâldere.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonnemint op { $productName } opnij aktivearre
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Tank foar it opnij aktivearjen fan jo abonnemint op { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Jo betellingssyklus en betelling bliuwe itselde. Jo folgjende ôfskriuwing is { $invoiceTotal } op { $nextInvoiceDateOnly }. Jo abonnemint wurdt automatysk elke fakturearringsperioade ferlinge, útsein jo derfoar kieze om op te sizzen.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Automatyske ferlingingsmelding foar { $productName }
subscriptionRenewalReminder-title = Jo abonnemint wurdt ynkoarten ferlinge
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Beste klant fan { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Jo aktuele abonnemint wurdt oer { $reminderLength } dagen automatysk ferlinge.
subscriptionRenewalReminder-content-discount-change = Jo folgjende faktuer jout in priiswiziging wer, omdat in eardere koarting is komme te ferfallen en in nije koarting tapast is.
subscriptionRenewalReminder-content-discount-ending = Omdat in eardere koarting foarby is komme te ferfallen, wurdt jo abonnemint ferlinge tsjin de standertpriis.
subscriptionRenewalReminder-content-closing = Mei heechachting,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = It { $productName }-team
subscriptionReplaced-subject = Dyn abonnemint is bywurke as ûnderdiel fan dyn opwurdearring
subscriptionReplaced-title = Dyn abonnemint is bywurke
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Jo yndividuele { $productName }-abonnemint is ferfongen en is no opnommen yn jo nije bondel.
subscriptionReplaced-content-credit = Jo ûntfange in tegoed foar alle net brûkte tiid fan jo foarige abonnemint út. Dit tegoed wurdt automatysk tapast op jo account en brûkt foar takomstige kosten.
subscriptionReplaced-content-no-action = Der is gjin aksje fan jo kant fereaske.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Betelling foar { $productName } ûntfongen
subscriptionSubsequentInvoice-title = Tank dat jo abonnee binne!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Wy hawwe jo lêste betelling foar { $productName } ûntfongen.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Jo folgjende faktuer wurdt op { $nextInvoiceDateOnly } yn rekkening brocht.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Jo hawwe opwurdearre nei { $productName }
subscriptionUpgrade-title = Tank foar it opwurdearjen!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Jo hawwe mei sukses opwurdearre nei { $productName }

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Der is ien kear in fergoeding fan { $invoiceAmountDue } yn rekkening brocht om de hegere priis fan jo abonnemint foar de rest fan dizze fakturearingsperioade ({ $productPaymentCycleOld }) wer te jaan.
subscriptionUpgrade-content-charge-credit = Jo hawwe in accounttegoed ûntfongen foar in bedrach fan { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Fan jo folgjende faktuer ôf wiziget de priis fan jo abonnemint.
subscriptionUpgrade-content-old-price-day = It foarige taryf wie { $paymentAmountOld } per dei.
subscriptionUpgrade-content-old-price-week = It foarige taryf wie { $paymentAmountOld } per wike.
subscriptionUpgrade-content-old-price-month = It foarige taryf wie { $paymentAmountOld } per moanne.
subscriptionUpgrade-content-old-price-halfyear = It foarige taryf wie { $paymentAmountOld } per seis moannen.
subscriptionUpgrade-content-old-price-year = It foarige taryf wie { $paymentAmountOld } per jier.
subscriptionUpgrade-content-old-price-default = It foarige taryf wie { $paymentAmountOld } per fakturearringsynterval.
subscriptionUpgrade-content-old-price-day-tax = It foarige taryf wie { $paymentAmountOld } + { $paymentTaxOld } btw per dei.
subscriptionUpgrade-content-old-price-week-tax = It foarige taryf wie { $paymentAmountOld } + { $paymentTaxOld } btw per wike.
subscriptionUpgrade-content-old-price-month-tax = It foarige taryf wie { $paymentAmountOld } + { $paymentTaxOld } btw per moanne.
subscriptionUpgrade-content-old-price-halfyear-tax = It foarige taryf wie { $paymentAmountOld } + { $paymentTaxOld } btw per seis moannen.
subscriptionUpgrade-content-old-price-year-tax = It foarige taryf wie { $paymentAmountOld } + { $paymentTaxOld } btw per jier.
subscriptionUpgrade-content-old-price-default-tax = It foarige taryf wie { $paymentAmountOld } + { $paymentTaxOld } btw per fakturearringsynterval.
subscriptionUpgrade-content-new-price-day = Fan no ôf wurdt { $paymentAmountNew } per dei yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-week = Fan no ôf wurdt { $paymentAmountNew } per wike yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-month = Fan no ôf wurdt { $paymentAmountNew } per moanne yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-halfyear = Fan no ôf wurdt { $paymentAmountNew } per seis moannen yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-year = Fan no ôf wurdt { $paymentAmountNew } per jier yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-default = Fan no ôf wurdt { $paymentAmountNew } per fakturearringsynterval yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-day-dtax = Fan no ôf wurdt { $paymentAmountNew } + { $paymentTaxNew } btw per dei yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-week-tax = Fan no ôf wurdt { $paymentAmountNew } + { $paymentTaxNew } btw per wike yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-month-tax = Fan no ôf wurdt { $paymentAmountNew } + { $paymentTaxNew } btw per moanne yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-halfyear-tax = Fan no ôf wurdt { $paymentAmountNew } + { $paymentTaxNew } btw per seis moannen yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-year-tax = Fan no ôf wurdt { $paymentAmountNew } + { $paymentTaxNew } btw per jier yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-content-new-price-default-tax = Fan no ôf wurdt { $paymentAmountNew } + { $paymentTaxNew } btw per fakturearringsynterval yn rekken brocht, eksklusyf koartingen.
subscriptionUpgrade-existing = As ien fan jo besteande abonneminten oerlaapje mei dizze opwurdearring, sille wy se behannelje en jo in aparte e-mailberjocht stjoere mei de details. As jo nije plan produkten omfettet dy’t ynstallaasje fereaskje, sille wy jo in apart e-mailberjocht stjoere mei ynstallaasje-ynstruksjes.
subscriptionUpgrade-auto-renew = Jo abonnemint wurdt automatysk elke fakturearringsperioade ferlinge, útsein jo derfoar kieze om op te sizzen.
subscriptionsPaymentExpired-subject-2 = De betellingsmetoade foar jo abonneminten is ferrûn of ferrint ynkoarten
subscriptionsPaymentExpired-title-2 = Jo betellingsmetoade is ferrûn of ferrint ynkoarten
subscriptionsPaymentExpired-content-2 = De betellingsmetoade dy’t jo brûke foar betellingen foar de folgjende abonneminten is ferrûn of ferrint ynkoarten.
subscriptionsPaymentProviderCancelled-subject = Bywurkjen fan betellingsynformaasje fereaske foar { -brand-mozilla }-abonneminten
subscriptionsPaymentProviderCancelled-title = Sorry, wy hawwe problemen mei jo betellingsmetoade
subscriptionsPaymentProviderCancelled-content-detected = Wy hawwe in probleem mei jo betellingsmetoade foar de folgjende abonneminten fêststeld.
subscriptionsPaymentProviderCancelled-content-payment-1 = Miskien is jo betellingsmetoade ferrûn, of jo aktuele betellingsmetoade is ferâldere.
