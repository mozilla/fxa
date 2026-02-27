## Non-email strings

session-verify-send-push-title-2 = Të hyhet te { -product-mozilla-account } juaj?
session-verify-send-push-body-2 = Klikoni këtu që të ripohoni se jeni ju
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } është kodi juaj i verifikimit { -brand-mozilla }. Skadon pas 5 minutash.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Kodi verifikimi { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } është kodi juaj i rikthimit { -brand-mozilla }. Skadon pas 5 minutash.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Kod { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } është kodi juaj i rikthimit { -brand-mozilla }. Skadon pas 5 minutash.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Kod { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Stemë e { -brand-mozilla }-s">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Stemë e { -brand-mozilla }-s">
subplat-automated-email = Ky është një email i automatizuar; nëse e morët gabimisht, s’ka nevojë të bëni gjë.
subplat-privacy-notice = Shënim privatësie
subplat-privacy-plaintext = Shënim privatësie:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Këtë email e merrni ngaqë për { $email } ka një { -product-mozilla-account } dhe jeni regjistruar për { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Këtë email po e merrni, ngaqë për { $email } ka një { -product-mozilla-account }.
subplat-explainer-multiple-2 = Këtë email po e merrni ngaqë { $email } ka një { -product-mozilla-account } dhe jeni pajtuar te disa produkte.
subplat-explainer-was-deleted-2 = Këtë email po e merrni, ngaqë { $email } qe regjistruar për një { -product-mozilla-account }.
subplat-manage-account-2 = Administroni rregullimet tuaja { -product-mozilla-account }, duke vizituar <a data-l10n-name="subplat-account-page">faqen e llogarisë tuaj</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Administroni rregullimet për { -product-mozilla-account } tuajën, duke vizituar faqen e llogarisë tuaj: { $accountSettingsUrl }
subplat-terms-policy = Kushte dhe rregulla anulimi
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Anulojeni pajtimin
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Riaktivizoni pajtimin
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Përditësoni të dhëna faturimi
subplat-privacy-policy = Rregulla Privatësie të { -brand-mozilla }-s
subplat-privacy-policy-2 = Shënim privatësie { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Kushte Shërbimi të { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Ligjore
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privatësi
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Ju lutemi, ndihmonani të përmirësojmë shërbimet tona duke plotësuar këtë <a data-l10n-name="cancellationSurveyUrl">pyetësor të shkurtër</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ju lutemi, ndihmonani të përmirësojmë shërbimet tona duke plotësuar këtë pyetësor të shkurtër:
payment-details = Hollësi pagese:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numër Fature: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = U faturuan: { $invoiceTotal } më { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Fatura Pasuese: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Metodë pagese:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Metodë pagese: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Metodë pagese: { $cardName } që përfundon me { $lastFour }
payment-provider-card-ending-in-plaintext = Metodë pagese: Kartë që përfundon me { $lastFour }
payment-provider-card-ending-in = <b>Metodë pagese:</b> Kartë që përfundon me { $lastFour }
payment-provider-card-ending-in-card-name = <b>Metodë pagese:</b>> { $cardName } që përfundon me { $lastFour }
subscription-charges-invoice-summary = Përmbledhje Fature

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Numër fature</b>b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Numër fature: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datë:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datë: { $invoiceDateOnly }
subscription-charges-list-price = Çmim normal
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Çmim normal: { $offeringPrice }
subscription-charges-credit-from-unused-time = Kredit nga kohë e papërdorur
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Kredit nga kohë e papërdorur: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Nënshumë</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Nënshumë: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Zbritje për një herë vetëm
subscription-charges-one-time-discount-plaintext = Zbritje për një herë vetëm: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
       *[other] Zbritje { $discountDuration }-mujore
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Zbritje { $discountDuration }-mujore: { $invoiceDiscountAmount }
       *[other] Zbritje { $discountDuration }-mujore: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Zbritje
subscription-charges-discount-plaintext = Zbritje: { $invoiceDiscountAmount }
subscription-charges-taxes = Taksa & tarifa
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Taksa & tarifa: { $invoiceTaxAmount }
subscription-charges-total = <b>Gjithsej</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Gjithsej: { $invoiceTotal }
subscription-charges-credit-applied = Krediti u aplikua
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Kredit i aplikuar: { $creditApplied }
subscription-charges-amount-paid = <b>Sasi e paguar</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Sasi e paguar: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Keni marrë një sasi krediti prej { $creditReceived }, e cila do të aplikohet te faturat tuaja të ardhshme.

##

subscriptionSupport = Pyetje rreth pajtimit tuaj? <a data-l10n-name="subscriptionSupportUrl">Ekipi ynë i asistencës</a> është këtu për t’ju ndihmuar.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Pyetje rreth pajtimit tuaj? Ekipi ynë i asistencës është këtu për t’ju ndihmuar:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Faleminderit për pajtimin te { $productName }. Nëse keni ndonjë pyetje mbi pajtimin tuaj, ose ju duhet më tepër informacion rreth { $productName }, ju lutemi, <a data-l10n-name="subscriptionSupportUrl">lidhuni me ne</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Faleminderit për pajtimin te { $productName }. Nëse keni ndonjë pyetje mbi pajtimin tuaj, ose ju duhet më tepër informacion rreth { $productName }, ju lutemi, lidhuni me ne:
subscription-support-get-help = Merrni ndihmë për pajtimin tuaj
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Administroni pajtimin tuaj</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Administroni pajtimin tuaj:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Lidhuni me asistencën</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Lidhuni me asistencën:
subscriptionUpdateBillingEnsure = Nga <a data-l10n-name="updateBillingUrl">këtu</a>, mund të siguroheni se metoda juaj e pagesës dhe hollësitë e llogarisë janë të sakta.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Nga këtu, mund të siguroheni se metoda juaj e pagesës dhe hollësitë e llogarisë janë të sakta:
subscriptionUpdateBillingTry = Do të riprovojmë kryerjen e pagesës tuaj gjatë pak ditëve të ardhshme, por mund të duhet të na ndihmoni për ta ndrequr, duke <a data-l10n-name="updateBillingUrl">përditësuar hollësitë e pagesës tuaj</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Do të riprovojmë kryerjen e pagesës tuaj gjatë pak ditëve të ardhshme, por mund të duhet të na ndihmoni për ta ndrequr, duke përditësuar hollësitë e pagesës tuaj:
subscriptionUpdatePayment = Që të parandalohet çfarëdo ndërprerje në shërbimin tuaj, ju lutemi, <a data-l10n-name="updateBillingUrl">përditësoni të dhënat tuaja të pagesës</a> sa më shpejt të jetë e mundur.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Që të parandalohet çfarëdo ndërprerje në shërbimin tuaj, ju lutemi, përditësoni të dhënat tuaja të pagesës sa më shpejt të jetë e mundur:
view-invoice-link-action = Shihni faturën
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Shihni Faturën: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Mirë se vini te { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Mirë se vini te { $productName }.
downloadSubscription-content-2 = Le t’ia fillojmë duke përdorur krejt veçoritë që përfshin pajtimi juaj:
downloadSubscription-link-action-2 = Fillojani
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account } e juaja u fshi
fraudulentAccountDeletion-title = Llogaria juaj u fshi
fraudulentAccountDeletion-content-part1-v2 = Tani së fundi u krijua një { -product-mozilla-account } dhe u bë një faturim pajtimi duke përdorur këtë adresë email. Siç bëjmë me krejt llogaritë e reja, ju kërkuam të ripohoni llogarinë tuaj, duke dëshmuar së pari se kjo adresë email është e vlefshme.
fraudulentAccountDeletion-content-part2-v2 = Hëpërhë shohim se llogaria s’qe ripohuar kurrë. Ngaqë s’qe plotësuar ky hap, s’jemi të sigurt nëse ky qe një pajtim i autorizuar. Si pasojë, { -product-mozilla-account } e regjistruar me këtë adresë email qe fshirë dhe pajtimi juaj u anulua me rimbursim të gjithë ç’qe faturuar.
fraudulentAccountDeletion-contact = Nëse keni ndonjë pyetje, ju lutemi, lidhuni me  <a data-l10n-name="mozillaSupportUrl">ekipin tonë të asistencës</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Nëse keni ndonjë pyetje, ju lutemi, lidhuni me ekipin tonë të asistencës: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Pajtimi juaj për { $productName } është anuluar
subscriptionAccountDeletion-title = Ju shohim me keqardhje teksa ikni
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Tani afër fshitë { -product-mozilla-account } tuajën. Si pasojë, anuluam pajtimin tuaj për { $productName }. Pagesa juaj përfundimtare prej { $invoiceTotal } qe bërë më { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Kujtues: Përfundoni ujdisjen e llogarisë tuaj
subscriptionAccountReminderFirst-title = S’mund të përdorni ende pajtimin tuaj
subscriptionAccountReminderFirst-content-info-3 = Ca ditë më parë krijuat një { -product-mozilla-account }, por s’bëtë ripohimin për këtë. Shpresojmë se do të përfundoni ujdisjen e llogarisë tuaj, që të mund të përdorni pajtimin tuaj të ri.
subscriptionAccountReminderFirst-content-select-2 = Që të ujdisni një fjalëkalim të ri dhe të përfundoni ripohimin e llogarisë tuaj, përzgjidhni “Krijoni Fjalëkalim”.
subscriptionAccountReminderFirst-action = Krijoni Fjalëkalim
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Kujtues përfundimtar: Ujdisni llogarinë tuaj
subscriptionAccountReminderSecond-title-2 = Mirë se vini në { -brand-mozilla }
subscriptionAccountReminderSecond-content-info-3 = Ca ditë më parë krijuat një { -product-mozilla-account }, por s’bëtë ripohimin për këtë. Shpresojmë se do të përfundoni ujdisjen e llogarisë tuaj, që të mund të përdorni pajtimin tuaj të ri.
subscriptionAccountReminderSecond-content-select-2 = Që të ujdisni një fjalëkalim të ri dhe të përfundoni ripohimin e llogarisë tuaj, përzgjidhni “Krijoni Fjalëkalim”.
subscriptionAccountReminderSecond-action = Krijoni Fjalëkalim
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Pajtimi juaj për { $productName } është anuluar
subscriptionCancellation-title = Ju shohim me keqardhje teksa ikni

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Anuluam pajtimin tuaj për { $productName }. Pagesa juaj përfundimtare prej { $invoiceTotal } u bë më { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Anuluam pajtimin tuaj për { $productName }. Pagesa juaj përfundimtare prej { $invoiceTotal } do të bëhet më { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Shërbimi juaj do të vazhdojë deri në fund të periudhës suaj të tanishme të faturimit, që bie më { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = U hodhët në { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = U hodhët me sukses nga { $productNameOld } në { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Duke filluar me faturën tuaj të ardhshme, vlera që ju faturohet do të ndryshohet nga { $paymentAmountOld } për { $productPaymentCycleOld } në { $paymentAmountNew } për { $productPaymentCycleNew }. Në atë kohë do t’ju jepet një kredit vetëm për një herë prej { $paymentProrated } për të pasqyruar tarifën më të ulët për pjesën e mbetur të këtij { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Në pastë <em>software</em> të ri që ta instaloni, për të mundur të përdorni { $productName }, do të merrni një email veçmas me udhëzime shkarkimi.
subscriptionDowngrade-content-auto-renew = Pajtimi juaj do të rinovohet automatikisht çdo periudhë faturimi, deri sa të zgjidhni anulimin.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Pajtimi juaj për { $productName } është anuluar
subscriptionFailedPaymentsCancellation-title = Pajtimi juaj është anuluar
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Anuluam pajtimin tuaj për { $productName }, për shkak përpjekjesh të shumta të dështuara pagimi. Që të keni hyrje sërish, nisni një pajtim të ri, me një metodë të përditësuar pagesash.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pagesa për { $productName } u ripohua
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Faleminderit për pajtimin te { $productName }
subscriptionFirstInvoice-content-processing = Pagesa juaj po kryhet dhe që të plotësohet, mund të duhen deri në katër ditë biznesi.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Do të merrni një email më vete se si të nisni të përdorni { $productName }.
subscriptionFirstInvoice-content-auto-renew = Pajtimi juaj do të rinovohet automatikisht çdo periudhë faturimi, deri sa të zgjidhni anulimin.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Fatura juaj pasuese do të bëhet gati më { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Metoda e pagesës për { $productName } që ka skaduar, ose skadon së shpejti
subscriptionPaymentExpired-title-2 = Metoda juaj e pagesës ka skaduar, ose është afër skadimit
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Metoda e pagesës që po përdorni për { $productName } ka skaduar ose është afër skadimit.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Pagesa për { $productName } dështoi
subscriptionPaymentFailed-title = Na ndjeni, po kemi probleme me pagesën tuaj
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Patëm një problem me pagesën tuaj të fundit për { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Mundet të ketë skaduar metoda juaj e pagesës, ose metoda juaj e tanishme e pagesave të jetë e vjetruar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Lypset përditësim të dhënash pagese për { $productName }
subscriptionPaymentProviderCancelled-title = Na ndjeni, po kemi probleme me metodën tuaj të pagesave
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Pikasëm një problem me metodën tuaj të pagesës për { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Mundet të ketë skaduar metoda juaj e pagesës, ose metoda juaj e tanishme e pagesave të jetë e vjetruar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Pajtimi në { $productName } u riaktivizua
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Faleminderit për riaktivizimin e pajtimit tuaj në { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Cikli juaj i faturimeve dhe pagesave do të mbesë njësoj. Faturimi pasues do të jetë { $invoiceTotal }, më { $nextInvoiceDateOnly }. Pajtimi juaj do të rinovohet automatikisht në çdo periudhë faturimi, veç në zgjedhshi ta anuloni.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Njoftim rinovimi të automatizuar të { $productName }
subscriptionRenewalReminder-title = Pajtimi juaj do të rinovohet së shpejti
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = I dashur klient i { $productName },
subscriptionRenewalReminder-content-closing = Sinqerisht,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Ekipi i { $productName }-s
subscriptionReplaced-subject = Pajtimi juaj është përditësuar si pjesë e përmirësimit tuaj
subscriptionReplaced-title = Pajtimi juaj është përditësuar
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Pajtimi juaj individual { $productName } është zëvendësuar dhe tani përfshihet te paketa juaj e re.
subscriptionReplaced-content-credit = Do të përfitoni një kredit për çfarëdo kohe të papërdorur nga pajtimi juaj i mëparshëm, Ky kredit do të aplikohet automatikisht te llogaria juaj dhe përdoret për faturime të ardhshme.
subscriptionReplaced-content-no-action = Nga ana juaj s’lypset ndonjë veprim.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Pagesa për { $productName } u mor
subscriptionSubsequentInvoice-title = Faleminderit që jeni një pajtimtar!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Morëm pagesën tuaj më të re për { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Fatura juaj pasuese do të bëhet gati më { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = E përmirësuat me { $productName }
subscriptionUpgrade-title = Faleminderit për përmirësimin!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = E keni përmirësuar me sukses me { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Ju është faturuar një tarifë prej { $invoiceAmountDue } për vetëm një herë, për të pasqyruar çmim më të lartë të pajtimit tuaj për pjesën e mbetur të kësaj periudhe faturimi { $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Keni marrë një sasi krediti llogarie prej { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Duke filluar nga faturimi juaj i ardhshëm, çmimi i pajtimit tuaj do të ndryshojë.
subscriptionUpgrade-content-old-price-day = Tarifa e mëparshme qe { $paymentAmountOld } në ditë.
subscriptionUpgrade-content-old-price-week = Tarifa e mëparshme qe { $paymentAmountOld } në javë.
subscriptionUpgrade-content-old-price-month = Tarifa e mëparshme qe { $paymentAmountOld } në muaj.
subscriptionUpgrade-content-old-price-halfyear = Tarifa e mëparshme qe { $paymentAmountOld } në gjashtë muaj.
subscriptionUpgrade-content-old-price-year = Tarifa e mëparshme qe { $paymentAmountOld } në vit.
subscriptionUpgrade-content-old-price-default = Tarifa e mëparshme qe { $paymentAmountOld } për periudhë faturimi.
subscriptionUpgrade-content-old-price-day-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë në ditë.
subscriptionUpgrade-content-old-price-week-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë në javë.
subscriptionUpgrade-content-old-price-month-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë në muaj.
subscriptionUpgrade-content-old-price-halfyear-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë për gjashtë muaj.
subscriptionUpgrade-content-old-price-year-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë në vit.
subscriptionUpgrade-content-old-price-default-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë për periudhë faturimi.
subscriptionUpgrade-content-new-price-day = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } në ditë, hiq zbritje.
subscriptionUpgrade-content-new-price-week = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } në javë, hiq zbritje.
subscriptionUpgrade-content-new-price-month = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } në muaj, hiq zbritje.
subscriptionUpgrade-content-new-price-halfyear = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } për gjashtë muaj, hiq zbritje.
subscriptionUpgrade-content-new-price-year = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } në vit, hiq zbritje.
subscriptionUpgrade-content-new-price-default = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } për periudhë faturimi, hiq zbritje.
subscriptionUpgrade-content-new-price-day-dtax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë në ditë, hiq zbritje.
subscriptionUpgrade-content-new-price-week-tax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë në javë, hiq zbritje.
subscriptionUpgrade-content-new-price-month-tax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë në muaj, hiq zbritje.
subscriptionUpgrade-content-new-price-halfyear-tax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë në gjashtë muaj, hiq zbritje.
subscriptionUpgrade-content-new-price-year-tax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë në vit, hiq zbritje.
subscriptionUpgrade-content-new-price-default-tax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë për periudhë faturimi, hiq zbritje.
subscriptionUpgrade-existing = Nëse ndonjë nga pajtimet tuaja ekzistues mbivendoset me këtë përmirësim, do ta zgjidhim dhe do t’ju dërgojmë një email më vete me hollësitë. Nëse plani juaj i ri përfshin produkte që lypin instalim, do t’ju dërgojmë një email më vete me udhëzime ujdisjeje.
subscriptionUpgrade-auto-renew = Pajtimi juaj do të rinovohet automatikisht çdo periudhë faturimi, deri sa të zgjidhni anulimin.
subscriptionsPaymentExpired-subject-2 = Metoda e pagesës për pajtimet tuaja ka skaduar, ose skadon së shpejti
subscriptionsPaymentExpired-title-2 = Metoda juaj e pagesës ka skaduar, ose është afër skadimit
subscriptionsPaymentExpired-content-2 = Metoda e pagesave që po përdorni për të bërë pagesa për pajtimet vijuese ka skaduar, ose është afër skadimit.
subscriptionsPaymentProviderCancelled-subject = Lypset përditësim hollësish pagese për pajtime { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Na ndjeni, po kemi probleme me metodën tuaj të pagesave
subscriptionsPaymentProviderCancelled-content-detected = Pikasëm një problem me metodën tuaj të pagesës për pajtimet vijuese.
subscriptionsPaymentProviderCancelled-content-payment-1 = Mundet të ketë skaduar metoda juaj e pagesës, ose metoda juaj e tanishme e pagesave të jetë e vjetruar.
