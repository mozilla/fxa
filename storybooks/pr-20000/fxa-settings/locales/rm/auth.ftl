## Non-email strings

session-verify-send-push-title-2 = Acceder a tes conto { -product-mozilla-account }?
session-verify-send-push-body-2 = Clicca qua per confermar tia identitad
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } è tes code da verificaziun { -brand-mozilla }. El scada en 5 minutas.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Code da verificaziun da { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } è tes code da recuperaziun { -brand-mozilla }. El scada en 5 minutas.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Code da { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo da { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo da { -brand-mozilla }">
subplat-automated-email = Quai è in e-mail automatic. Sche ti has retschavì per sbagl quest e-mail na stos ti far nagut.
subplat-privacy-notice = Infurmaziuns davart la protecziun da datas
subplat-privacy-plaintext = Infurmaziuns davart la protecziun da datas:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Ti retschaivas quest e-mail perquai che { $email } è associà cun in { -product-mozilla-account } e ti has in abunament da { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Ti retschaivas quest e-mail perquai che { $email } ha in { -product-mozilla-account }.
subplat-explainer-multiple-2 = Ti retschaivas quest e-mail perquai che { $email } è associà cun in { -product-mozilla-account } e ti has abunà plirs products.
subplat-explainer-was-deleted-2 = Ti retschaivas quest e-mail perquai che { $email } è vegnì duvrà per avrir in { -product-mozilla-account }.
subplat-manage-account-2 = Administrescha tes parameters dal { -product-mozilla-account } cun visitar tia <a data-l10n-name="subplat-account-page">pagina dal conto</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Administrescha tes parameters dal { -product-mozilla-account } cun visitar tia pagina dal conto: { $accountSettingsUrl }
subplat-terms-policy = Cundiziuns e reglas per l’annullaziun
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Annullar l’abunament
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactivar l’abunament
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Actualisar las infurmaziuns per la facturaziun
subplat-privacy-policy = Directivas per la protecziun da datas da { -brand-mozilla }
subplat-privacy-policy-2 = Infurmaziuns davart la protecziun da datas da { -product-mozilla-accounts }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Cundiziuns d'utilisaziun dals { -product-mozilla-accounts }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Infurmaziuns giuridicas
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Protecziun da datas
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Ans gida per plaschair da meglierar noss servetschs cun participar a questa <a data-l10n-name="cancellationSurveyUrl">curta enquista</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ans gida per plaschair da meglierar noss servetschs cun participar a questa curta enquista:
payment-details = Detagls dal pajament:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numer da quint: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Debità: { $invoiceTotal } ils { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Proxim quint: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Summa intermediara: { $invoiceSubtotal }

##

subscriptionSupport = Dumondas davart tes abunament? Noss <a data-l10n-name="subscriptionSupportUrl">team d'agid</a> stat a tia disposiziun.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Dumondas davart tes abunament? Noss team d’agid stat a tia disposiziun:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Grazia per abunar { $productName }. Sche ti has dumondas davart tes abunament u sche ti dovras ulteriuras infurmaziuns davart { $productName }, <a data-l10n-name="subscriptionSupportUrl">ans contactescha</a> per plaschair.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Grazia per abunar { $productName }. Sche ti has dumondas davart tes abunament u sche ti dovras ulteriuras infurmaziuns davart { $productName }, ans contactescha per plaschair:
subscriptionUpdateBillingEnsure = Ti pos controllar <a data-l10n-name="updateBillingUrl">qua</a> che tia metoda da pajament e las infurmaziuns dal conto èn actualas.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Ti pos controllar qua che tia metoda da pajament e las infurmaziuns dal conto èn actualas:
subscriptionUpdateBillingTry = Nus vegnin ad empruvar anc ina giada dad incassar tes pajament durant ils proxims dis, ma ti stos probablamain gidar cun <a data-l10n-name="updateBillingUrl">actualisar tias infurmaziuns da pajament</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Nus vegnin ad empruvar anc ina giada dad incassar tes pajament durant ils proxims dis, ma ti stos probablamain gidar cun actualisar tias infurmaziuns da pajament:
subscriptionUpdatePayment = Per evitar l'interrupziun da tes servetsch, <a data-l10n-name="updateBillingUrl">actualisescha per plaschair tias infurmaziuns da pajament</a> il pli spert pussaivel.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Per evitar l’interrupziun da tes servetsch, actualisescha per plaschair tias infurmaziuns da pajament il pli spert pussaivel:
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Mussar il quint: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Bainvegni tar { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Bainvegni tar { $productName }
downloadSubscription-content-2 = Entschaiva ad utilisar tut las funcziuns inclusas en tes abunament:
downloadSubscription-link-action-2 = Emprims pass
fraudulentAccountDeletion-subject-2 = Tes conto { -product-mozilla-account } è vegnì stizzà
fraudulentAccountDeletion-title = Tes conto è vegnì stizzà
fraudulentAccountDeletion-content-part1-v2 = Dacurt è vegnì creà cun agid da questa adressa dad e-mail in { -product-mozilla-account } cun in abunament che custa. Nus avain ta dumandà – uschia faschain nus quai cun tut ils contos novs – da confermar il conto cun validar questa adressa dad e-mail.
fraudulentAccountDeletion-content-part2-v2 = Ussa avain nus constatà ch'il conto n'è mai vegnì confermà. Cunquai che quest pass manca, na savain nus betg sch'i sa tracta dad in abunament autorisà. En consequenza è il { -product-mozilla-account } registrà cun questa adressa dad e-mail vegnì stizzà e tes abunament è vegnì annullà e tut las debitaziuns restituidas.
fraudulentAccountDeletion-contact = En cas da dumondas, contactescha per plaschair noss <a data-l10n-name="mozillaSupportUrl">team d'agid</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = En cas da dumondas, contactescha per plaschair noss team d'agid: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Tes abunament da { $productName } è vegnì annullà
subscriptionAccountDeletion-title = Donn che ti vas
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Ti has dacurt stizzà tes { -product-mozilla-account }. En consequenza avain nus annullà tes abunament da { $productName }. Tes ultim pajament da { $invoiceTotal } è vegnì pajà ils { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Promemoria: Terminescha la configuraziun da tes conto
subscriptionAccountReminderFirst-title = Ti na pos anc betg acceder a tes abunament
subscriptionAccountReminderFirst-content-info-3 = Avant in pèr dis has ti creà in { -product-mozilla-account } ma n'al has mai confermà. Nus sperain che ti termineschias la configuraziun per che ti possias utilisar tes nov abunament.
subscriptionAccountReminderFirst-content-select-2 = Tscherna «Crear in pled-clav» per endrizzar in nov pled-clav e cumplettar la conferma da tes conto.
subscriptionAccountReminderFirst-action = Crear in pled-clav
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Ultima promemoria: Endrizza tes conto
subscriptionAccountReminderSecond-title-2 = Bainvegni tar { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Avant in pèr dis has ti creà in { -product-mozilla-account } ma n'al has mai confermà. Nus sperain che ti termineschias la configuraziun per che ti possias utilisar tes nov abunament.
subscriptionAccountReminderSecond-content-select-2 = Tscherna «Crear in pled-clav» per endrizzar in nov pled-clav e cumplettar la conferma da tes conto.
subscriptionAccountReminderSecond-action = Crear in pled-clav
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Tes abunament da { $productName } è vegnì annullà
subscriptionCancellation-title = Donn che ti vas

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Nus avain annullà tes abunament da { $productName }. Tes ultim pajament da { $invoiceTotal } è exequì pajà ils { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Nus avain annullà tes abunament da { $productName }. Tes ultim pajament da { $invoiceTotal } vegn exequi ils { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Tes servetsch vegn a cuntinuar enfin la fin da tia perioda da facturaziun actuala ils { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Ti has midà a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Tia midada da { $productNameOld } a { $productName } è succedida correctamain.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A partir da tes proxim quint mida la summa indebitada da { $paymentAmountOld } per { $productPaymentCycleOld } a { $paymentAmountNew } per { $productPaymentCycleNew }. Il medem mument retschaivas ti ina bunificaziun unica da { $paymentProrated } che reflectescha la debitaziun pli bassa durant il rest da quest { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Sch'igl è necessari dad installar nova software per pudair utilisar { $productName }, retschaivas ti in e-mail separà cun instrucziuns per la telechargiar.
subscriptionDowngrade-content-auto-renew = Tes abunament vegn renovà automaticamain la fin da mintga perioda da facturaziun, nun che ti ta decidas da l’annullar.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Tes abunament da { $productName } è vegnì annullà
subscriptionFailedPaymentsCancellation-title = Tes abunament è vegnì annullà
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Nus avain annullà tes abunament da { $productName } perquai che pliras emprovas da debitaziun n'èn betg reussidas. Per puspè avair access, cumenza in nov abunament cun ina metoda da pajament actualisada.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pajament per { $productName } confermà
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Grazia per abunar { $productName }
subscriptionFirstInvoice-content-processing = Tes pajament vegn actualmain elavurà. Quai po durar enfin quatter lavurdis.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Ti vegns a retschaiver in e-mail separà che declera co utilisar { $productName }.
subscriptionFirstInvoice-content-auto-renew = Tes abunament vegn renovà automaticamain la fin da mintga perioda da facturaziun, nun che ti ta decidas da l’annullar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Pajament per { $productName } betg reussì
subscriptionPaymentFailed-title = Perstgisa, nus avain in problem cun tes pajament
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Nus avain gì in problem cun tes ultim pajament per { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Actualisaziun da las infurmaziuns da pajament necessaria per { $productName }
subscriptionPaymentProviderCancelled-title = Perstgisa, nus avain in problem cun tia metoda da pajament
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Nus essan fruntads sin in problem cun tia metoda da pajament per { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Reactivà l'abunament da { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Grazia per reactivar tes abunament da { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Tes ciclus da facturaziun e pajament vegn a restar medem. La proxima debitaziun munta a { $invoiceTotal } e succeda ils { $nextInvoiceDateOnly }. Tes abunament vegn renovà automaticamain mintga perioda da facturaziun nun che ti decidas dad annullar l'abunament.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Avis da prolungaziun automatica da { $productName }
subscriptionRenewalReminder-title = Tes abunament vegn prest prolungà
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = CharA clientA da { $productName },
subscriptionRenewalReminder-content-closing = Amiaivels salids
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = il team da { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Retschavì il pajament per { $productName }
subscriptionSubsequentInvoice-title = Grazia per tes abunament!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Nus avain retschavì tes ultim pajament per { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Ti has midà a { $productName }
subscriptionUpgrade-title = Grazia per l’upgrade!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Tes abunament vegn renovà automaticamain la fin da mintga perioda da facturaziun, nun che ti ta decidas da l’annullar.
subscriptionsPaymentProviderCancelled-subject = Actualisaziun da las infurmaziuns da pajament necessaria per ils abunaments da { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Perstgisa, nus avain in problem cun tia metoda da pajament
subscriptionsPaymentProviderCancelled-content-detected = Nus essan fruntads sin in problem cun tia metoda da pajament per ils suandants abunaments.
