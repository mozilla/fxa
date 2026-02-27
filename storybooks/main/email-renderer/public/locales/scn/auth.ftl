## Non-email strings

session-verify-send-push-title-2 = Vo’ tràsiri nnô to { -product-mozilla-account }?
session-verify-send-push-body-2 = Ammacca cca pi cunfirmari a to idintità
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } è u to còdici di virìfica { -brand-mozilla }. Scadi ntra 5 minuti.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Còdici di virìfica di { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } è u to còdici di ricùpiru { -brand-mozilla }. Scadi ntra 5 minuti.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Còdici di { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } è u to còdici di ricùpiru { -brand-mozilla }. Scadi ntra 5 minuti.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Còdici di { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Mercu di { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Mercu di { -brand-mozilla }">
subplat-automated-email = Chista è na littra mannata di manera autumàtica; si a ricivisti pi sbagghiu nun hâ fari nenti.
subplat-privacy-notice = Abbisu di privatizza
subplat-privacy-plaintext = Abbisu di privatizza:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Stai ricivennu sta littra picchì u nnirizzu { $email } è assuciatu c’un { -product-mozilla-account } e ti scrivisti pi { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Stai ricivennu sta littra picchì u nnirizzu { $email } è assuciatu c’un { -product-mozilla-account }.
subplat-explainer-multiple-2 = Stai ricivennu sta littra picchì u nnirizzu { $email } è assuciatu c’un { -product-mozilla-account } e t’abbunasti a cchiù assai prudutti.
subplat-explainer-was-deleted-2 = Stai ricivennu sta littra picchì u nnirizzu { $email } fu assuciatu c’un { -product-mozilla-account }.
subplat-manage-account-2 = Manija i mpustazzioni dû to { -product-mozilla-account } nnâ <a data-l10n-name="subplat-account-page">pàggina dû cuntu</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Manija i mpustazzioni dû to { -product-mozilla-account } nnâ pàggina dû cuntu: { $accountSettingsUrl }
subplat-terms-policy = Tèrmini e pulìtica di scancellamentu
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Scancella abbunamentu
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Riattiva l’abbunamentu
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Attualizza i nfurmazzioni di fatturazzioni
subplat-privacy-policy = Pulìtica di privatizza di { -brand-mozilla }
subplat-privacy-policy-2 = Abbisu di privatizza di { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Tèrmini di sirbizzu dî { -product-mozilla-accounts }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Noti ligali
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privatizza
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Pi favuri ajùtani a fari megghiu i nostri sirbizzi arrispunnennu a sta <a data-l10n-name="cancellationSurveyUrl">ntirbista nicareḍḍa</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Pi favuri ajùtani a fari megghiu i nostri sirbizzi arrispunnennu a sta ntirbista nicareḍḍa:
payment-details = Minutagghi dû pagamentu:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Fattura nùmmaru: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Addèbbitu: { $invoiceTotal } u { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Pròssima fattura: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Tutali parziali: { $invoiceSubtotal }

##

subscriptionSupport = Ài dumanni ncapu ô to abbunamentu? A nostra <a data-l10n-name="subscriptionSupportUrl">squatra di supportu</a> è cca p’ajutàriti.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Ài dumanni ncapu ô to abbunamento? A nostra squatra di supportu è cca p’ajutàriti:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Grazzi chi t’abbunasti a { $productName }. Si ài dumanni ncapu ô to abbunamentu o ti sèrbinu cchiù assai nfurmazzioni ncapu a { $productName }, pi favuri <a data-l10n-name="subscriptionSupportUrl">cuntàttani</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Grazzi chi t’abbunasti a { $productName }. Si ài dumanni ncapu ô to abbunamentu o ti sèrbinu cchiù assai nfurmazzioni ncapu a { $productName }, pi favuri cuntàttani:
subscriptionUpdateBillingEnsure = <a data-l10n-name="updateBillingUrl">Cuntrolla</a> si i nfurmazzioni ncapu ô to cuntu e ncapu ê furmi di pagamentu sunnu attualizzati.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Cuntrolla si i nfurmazzioni ncapu ô to cuntu e ncapu ê furmi di pagamentu sunnu attualizzati:
subscriptionUpdateBillingTry = Pruvamu arrè u to pagamentu i pròssimi jorna, ma capaci chi serbi chi <a data-l10n-name="updateBillingUrl">attualizzi i to nfurmazzioni di pagamentu</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Pruvamu arrè u to pagamentu i pròssimi jorna, ma capaci chi serbi chi attualizzi i to nfurmazzioni di pagamentu:.
subscriptionUpdatePayment = Pi scanzari di firmari u sirbizzu, pi favuri <a data-l10n-name="updateBillingUrl">attualizza i to nfurmazzioni di pagamentu</a> prima ca poi.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Pi scanzari di firmari u sirbizzu, pi favuri attualizza i to nfurmazzioni di pagamentu prima ca poi:
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Vidi fattura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Bummegna nne { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Bummegna nne { $productName }
downloadSubscription-content-2 = Accuminciamu a usari tutti i funzioni nchiusi nnô to abbunamentu:
downloadSubscription-link-action-2 = Accumincia
fraudulentAccountDeletion-subject-2 = U to { -product-mozilla-account } fu scancillatu
fraudulentAccountDeletion-title = U to cuntu fu scancillatu
fraudulentAccountDeletion-content-part1-v2 = Di ricenti criaru un { -product-mozilla-account } cu stu nnirizzu di posta elittrònica, e cci fu pagatu n’abbunamentu. Comu règula pi tutti i cunti novi, t’addumannammu di cunfirmari u to cuntu virificannu stu nnirizzu di posta elittrònica.
fraudulentAccountDeletion-content-part2-v2 = Nzinu a ora, videmu chi stu cuntu nun fu mai cunfirmatu. Siccomu stu passu nun fu cumplitatu, nun semu sicuri chi l’abbunamentu era auturizzatu. Pi sta scaciuni, u { -product-mozilla-account } riggistratu cu stu nnirizzu di posta elittrònica fu scancillatu, e fu scancillatu macari l’abbunamentu, cu tutti i sordi turnati nn’arrè.
fraudulentAccountDeletion-contact = Si ài dumanni, pi favuri cuntatta a nostra <a data-l10n-name="mozillaSupportUrl">squatra d’assistenza</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Si ài dumanni, pi favuri cuntatta a nostra squatra di supportu: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = U to abbunamentu a { $productName } fu scancillatu
subscriptionAccountDeletion-title = Ni dispiaci chi ti nni vai
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Àvi picca chi scancillasti u to { -product-mozilla-account }. Pi sta scaciuni, scancillammu u to abbunamentu a { $productName }. U pagamentu finali di { $invoiceTotal } fu fattu jornu { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Ricòrdati: cumpleta a cunfijurazzioni dû to cuntu
subscriptionAccountReminderFirst-title = Ancora nun po’ tràsiri ô to abbunamentu
subscriptionAccountReminderFirst-content-info-3 = Quarchi jornu nn’arrè criasti un { -product-mozilla-account } ma nun u cunfirmasti mai. Spiramu chi cumpleti a cunfijurazzioni, accussì po’ usari u to abbunamentu novu.
subscriptionAccountReminderFirst-content-select-2 = Scarta “Crìa na chiavi” pi mpustari na chiavi nova e cumplitari a cunferma dû to cuntu.
subscriptionAccountReminderFirst-action = Crìa na chiavi
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Abbisu finali: cunfijura u to cuntu
subscriptionAccountReminderSecond-title-2 = Bummegna nne { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Quarchi jornu nn’arrè criasti un { -product-mozilla-account } ma nun u cunfirmasti mai. Spiramu chi cumpleti a cunfijurazzioni, accussì po’ usari u to abbunamentu novu.
subscriptionAccountReminderSecond-content-select-2 = Scarta “Crìa na chiavi” pi mpustari na chiavi nova e cumplitari a cunferma dû to cuntu.
subscriptionAccountReminderSecond-action = Crìa na chiavi
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = U to abbunamentu a { $productName } fu scancillatu
subscriptionCancellation-title = Ni dispiaci chi ti nni vai

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Scancillammu u to abbunamentu a { $productName }. U pagamentu finali di { $invoiceTotal } fu fattu jornu { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Scancillammu u to abbunamentu a { $productName }. U pagamentu finali di { $invoiceTotal } veni fattu jornu { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = U sirbizzu cuntinua nzinu â fini dû pirìudu di fatturazzioni attuali, veni a diri jornu { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Canciasti a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Canciasti bonu di { $productNameOld } a { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Principiannu dâ pròssima fattura, l’addèbbitu canciarà di { $paymentAmountOld } pi { $productPaymentCycleOld } a { $paymentAmountNew } pi { $productPaymentCycleNew }. Ti daremu macari un crèditu di { $paymentProrated } pi na vota sula, p’appattari câ còtima cchiù vascia pû restu di stu { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Siḍḍu ti serbi di nzitari quarchi prugramma superchiu pi usari { $productName }, t’agghica n’autra e-mail cu l’istruzzioni pi scarricàrilu.
subscriptionDowngrade-content-auto-renew = U to abbunamentu si rinova di manera autumàtica p’ogni ciclu di fatturazzioni sparti si scarti di scancillàrilu.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = U to abbunamentu a { $productName } fu scancillatu
subscriptionFailedPaymentsCancellation-title = U to abbunamentu fu scancillatu
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Scancillammu u to abbunamentu pi { $productName } picchì assai voti i pagamenti sfalleru. Pi tràsiri arrè, fatti n’abbunamentu novu cu n’autra furma di pagamentu.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = U pagamentu di { $productName } fu cunfirmatu
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Grazzi pû to abbunamentu a { $productName }
subscriptionFirstInvoice-content-processing = Stamu prucissannu u to pagamentu e ponnu sèrbiri nzinu a quattru jorna di travagghiu pi cumplitallu.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = T’agghicarà n’autra littra ncapu a comu principiari a usari { $productName }.
subscriptionFirstInvoice-content-auto-renew = U to abbunamentu si rinova di manera autumàtica p’ogni ciclu di fatturazzioni sparti si scarti di scancillàrilu.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = U pagamentu di { $productName } sfallìu
subscriptionPaymentFailed-title = Ni dispiaci, accamora avemu prubblemi cû to pagamentu
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Àppimu un prubblema cû to ùrtimu pagamentu pi { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Abbisogna n’attualizzu dî nfurmazzioni di pagamentu pi { $productName }
subscriptionPaymentProviderCancelled-title = Ni dispiaci, accamora avemu prubblemi câ to furma di pagamentu
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Cci fu un prubblema câ to furma di pagamentu pi { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abbunamentu a { $productName } arrè attivu
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Grazzi chi attivasti arrè u to abbunamentu a { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = U to ciclu di fatturazzioni e u pagamentu arrèstanu i stissi. U pròssimu addèbbitu sarà di { $invoiceTotal } jornu { $nextInvoiceDateOnly }. U to abbunamentu si rinova di manera autumàtica p’ogni ciclu di fatturazzioni sparti si scarti di scancillàrilu.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Abbisu di rinovu autumàticu di { $productName }
subscriptionRenewalReminder-title = U to abbunamentu veni rinuvatu ntra picca
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Caru clienti di { $productName },
subscriptionRenewalReminder-content-closing = Saluti cari,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = A squatra di { $productName }
subscriptionReplaced-subject = U to abbunamentu fu canciatu nnô quatru dû to attualizzu.
subscriptionReplaced-title = U to abbunamentu fu attualizzatu
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = U to abbunamentu a { $productName } fu scanciatu picchì ora è nchiusu nnô pacchettu nova.
subscriptionReplaced-content-credit = Ricivirai un crèditu pâ parti dû to abbunamentu pricidenti chi nun usasti. Stu crèditu veni misu direttu nnô to cuntu e veni usatu pi l’addèbbiti futuri.
subscriptionReplaced-content-no-action = Nun è nicissariu chi fai nenti.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Ricivemmu u pagamentu pi { $productName }
subscriptionSubsequentInvoice-title = Grazzi chi t’abbunasti!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Ricivemmu u to ùrtimu pagamentu pi { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Attualizzasti a { $productName }
subscriptionUpgrade-title = Grazzi pi l’attualizzu!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = L’attualizzu a { $productName } jìu bonu.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-credit = Ricivisti un crèditu di { $paymentProrated } nnô to cuntu.
subscriptionUpgrade-existing = Si quarchidunu di l’abbunamenti chi già ài nchiudi parti di st’attualizzu, manijamu nuiautri a situazzioni e ti mannamu n’e-mail chî minutagghi. Si u to chianu novu abbisogna di nzitari autri prudutti, ti mannamu n’autra e-mail cu l’istruzzioni pû nzitamentu.
subscriptionUpgrade-auto-renew = U to abbunamentu si rinova di manera autumàtica p’ogni ciclu di fatturazzioni sparti si scarti di scancillàrilu.
subscriptionsPaymentProviderCancelled-subject = Abbisogna n’attualizzu dî nfurmazzioni di pagamentu pi l’abbunamenti { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Ni dispiaci, accamora avemu prubblemi câ to furma di pagamentu
subscriptionsPaymentProviderCancelled-content-detected = Cci fu un prubblema câ to furma di pagamentu pi l’abbunamenti appressu.
