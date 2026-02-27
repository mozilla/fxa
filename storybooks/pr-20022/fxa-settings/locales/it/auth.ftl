## Non-email strings

session-verify-send-push-title-2 = Accedere al tuo { -product-mozilla-account }?
session-verify-send-push-body-2 = Fai clic qui per confermare la tua identità
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } è il tuo codice di verifica per { -brand-mozilla }. Scade tra 5 minuti.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Codice di verifica { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } è il tuo codice di recupero per { -brand-mozilla }. Scade tra 5 minuti.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Codice { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } è il tuo codice di recupero per { -brand-mozilla }. Scade tra 5 minuti.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Codice { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo { -brand-mozilla }">
subplat-automated-email = Questa email è stata inviata da un servizio automatico, se hai ricevuto questa email per errore, puoi semplicemente ignorarla.
subplat-privacy-notice = Informativa sulla privacy
subplat-privacy-plaintext = Informativa sulla privacy:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Ricevi questa email perché l’indirizzo { $email } è associato a un { -product-mozilla-account } e ti sei registrato per { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Ricevi questa email perché l’indirizzo { $email } è associato a un { -product-mozilla-account }.
subplat-explainer-multiple-2 = Ricevi questa email perché l’indirizzo { $email } è associato a un { -product-mozilla-account } e ti sei registrato per più prodotti.
subplat-explainer-was-deleted-2 = Ricevi questo messaggio perché l’indirizzo { $email } è stato utilizzato per registrare un { -product-mozilla-account }.
subplat-manage-account-2 = Gestisci le impostazioni del tuo { -product-mozilla-account } visitando la <a data-l10n-name="subplat-account-page">pagina dell’account</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Gestisci le impostazioni del tuo { -product-mozilla-account } visitando questa pagina: { $accountSettingsUrl }
subplat-terms-policy = Termini e condizioni di annullamento
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Cancella abbonamento
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Rinnova l’abbonamento
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Aggiorna le informazioni di fatturazione
subplat-privacy-policy = Informativa sulla privacy { -brand-mozilla }
subplat-privacy-policy-2 = Informativa sulla privacy degli { -product-mozilla-accounts }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Condizioni di utilizzo del servizio degli { -product-mozilla-accounts }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Note legali
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacy
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Aiutaci a migliorare i nostri servizi partecipando a questo <a data-l10n-name="cancellationSurveyUrl">breve sondaggio</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Aiutaci a migliorare i nostri servizi partecipando a questo breve sondaggio:
payment-details = Dettagli del pagamento:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numero fattura: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Addebito: { $invoiceTotal } il { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Prossima fattura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Metodo di pagamento:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Metodo di pagamento: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Metodo di pagamento: { $cardName } che termina con { $lastFour }
payment-provider-card-ending-in-plaintext = Metodo di pagamento: carta che termina con { $lastFour }
payment-provider-card-ending-in = <b>Metodo di pagamento:</b> carta che termina con { $lastFour }
payment-provider-card-ending-in-card-name = <b>Metodo di pagamento:</b> { $cardName } che termina con { $lastFour }
subscription-charges-invoice-summary = Riepilogo fattura

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Numero fattura:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Numero fattura: { $invoiceNumber }
subscription-charges-invoice-date = <b>Data:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Data: { $invoiceDateOnly }
subscription-charges-prorated-price = Prezzo ripartito proporzionalmente
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Prezzo ripartito proporzionalmente: { $remainingAmountTotal }
subscription-charges-list-price = Prezzo di listino
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Prezzo di listino: { $offeringPrice }
subscription-charges-credit-from-unused-time = Credito dal tempo inutilizzato
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Credito dal tempo inutilizzato: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotale</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Totale parziale: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Sconto una tantum
subscription-charges-one-time-discount-plaintext = Sconto una tantum: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Sconto di { $discountDuration } mesi
       *[other] Sconto di { $discountDuration } mesi
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Sconto di { $discountDuration } mesi: { $invoiceDiscountAmount }
       *[other] Sconto di { $discountDuration } mesi: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Sconto
subscription-charges-discount-plaintext = Sconto: { $invoiceDiscountAmount }
subscription-charges-taxes = Tasse e commissioni
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Tasse e commissioni: { $invoiceTaxAmount }
subscription-charges-total = <b>Totale</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Totale: { $invoiceTotal }
subscription-charges-credit-applied = Credito applicato
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Credito applicato: { $creditApplied }
subscription-charges-amount-paid = <b>Importo pagato</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Importo pagato: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Hai ricevuto un credito di { $creditReceived } sul tuo account che verrà applicato alle tue fatture future.

##

subscriptionSupport = Hai delle domande sull’abbonamento? Il <a data-l10n-name="subscriptionSupportUrl">team di supporto</a> è a tua disposizione.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Hai delle domande sull’abbonamento? Il team di supporto è a tua disposizione:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Grazie per esserti abbonato a { $productName }. Se hai domande sul tuo abbonamento o hai bisogno di ulteriori informazioni su { $productName }, <a data-l10n-name="subscriptionSupportUrl">contattaci</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Grazie per esserti abbonato a { $productName }. Se hai domande sull’abbonamento o hai bisogno di ulteriori informazioni su { $productName }, contattaci:
subscription-support-get-help = Ottieni assistenza per il tuo abbonamento
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Gestisci il tuo abbonamento</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Gestisci il tuo abbonamento:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contatta il supporto</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contatta il supporto:
subscriptionUpdateBillingEnsure = Puoi assicurarti che il metodo di pagamento e le informazioni sull’account siano aggiornate <a data-l10n-name="updateBillingUrl">qui</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Puoi assicurarti che il metodo di pagamento e le informazioni sull’account siano aggiornate qui:
subscriptionUpdateBillingTry = Proveremo a effettuare nuovamente il pagamento nei prossimi giorni, ma potrebbe essere necessario aiutarci a risolvere il problema <a data-l10n-name="updateBillingUrl">aggiornando le informazioni di pagamento</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Proveremo a effettuare nuovamente il pagamento nei prossimi giorni, ma potrebbe essere necessario aiutarci a risolvere il problema aggiornando le informazioni di pagamento:
subscriptionUpdatePayment = Al fine di prevenire l’interruzione del servizio è consigliato <a data-l10n-name="updateBillingUrl">aggiornare le informazioni di pagamento</a> il prima possibile.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Per evitare interruzioni del servizio, aggiorna le tue modalità di pagamento il prima possibile:
view-invoice-link-action = Visualizza fattura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Visualizza fattura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Benvenuto in { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Benvenuto in { $productName }.
downloadSubscription-content-2 = Inizia a utilizzare tutte le funzionalità incluse nel tuo abbonamento:
downloadSubscription-link-action-2 = Inizia
fraudulentAccountDeletion-subject-2 = Il tuo { -product-mozilla-account } è stato eliminato
fraudulentAccountDeletion-title = Il tuo account è stato eliminato
fraudulentAccountDeletion-content-part1-v2 = Di recente è stato creato un { -product-mozilla-account } ed è stato registrato un abbonamento a pagamento utilizzando questo indirizzo email. Come facciamo per tutti i nuovi account, per prima cosa abbiamo chiesto di confermare il tuo account convalidando questo indirizzo email.
fraudulentAccountDeletion-content-part2-v2 = Al momento ci risulta che l’account non è mai stato confermato. Poiché questo passaggio non è stato completato, non possiamo essere sicuri che si tratti di un abbonamento legittimo. Di conseguenza, l’{ -product-mozilla-account } registrato con questo indirizzo email è stato eliminato e l’abbonamento è stato annullato con il rimborso di tutti gli addebiti.
fraudulentAccountDeletion-contact = Per qualsiasi domanda contatta il nostro <a data-l10n-name="mozillaSupportUrl">team di supporto</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Per qualsiasi domanda contatta il nostro team di supporto: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Il tuo abbonamento a { $productName } è stato annullato
subscriptionAccountDeletion-title = Ci mancherai.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Di recente hai eliminato il tuo { -product-mozilla-account }. Di conseguenza, abbiamo annullato il tuo abbonamento a { $productName }. Il pagamento finale di { $invoiceTotal } è stato effettuato in data { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Promemoria: completa la configurazione del tuo account
subscriptionAccountReminderFirst-title = Non puoi ancora accedere al tuo abbonamento
subscriptionAccountReminderFirst-content-info-3 = Hai creato un { -product-mozilla-account } qualche giorno fa ma non l’hai mai confermato. Speriamo che tu finisca di configurare il tuo account, in modo da poter utilizzare il tuo nuovo abbonamento.
subscriptionAccountReminderFirst-content-select-2 = Seleziona “Crea password” per impostare una nuova password e completare la conferma del tuo account.
subscriptionAccountReminderFirst-action = Crea password
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Ultimo promemoria: configura il tuo account
subscriptionAccountReminderSecond-title-2 = Benvenuto in { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Hai creato un { -product-mozilla-account } qualche giorno fa ma non l’hai mai confermato. Speriamo che tu finisca di configurare il tuo account, in modo da poter utilizzare il tuo nuovo abbonamento.
subscriptionAccountReminderSecond-content-select-2 = Seleziona “Crea password” per impostare una nuova password e completare la conferma del tuo account.
subscriptionAccountReminderSecond-action = Crea password
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Il tuo abbonamento a { $productName } è stato annullato
subscriptionCancellation-title = Ci mancherai.

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Abbiamo annullato il tuo abbonamento a { $productName }. Il pagamento finale di { $invoiceTotal } è stato effettuato in data { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Abbiamo annullato il tuo abbonamento a { $productName }. Il pagamento finale di { $invoiceTotal } verrà effettuato il { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Il servizio continuerà fino alla fine del periodo di fatturazione corrente ({ $serviceLastActiveDateOnly }).
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Sei passato a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Il passaggio da { $productNameOld } a { $productName } è stato completato correttamente.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A partire dalla prossima fattura, il tuo pagamento sarà modificato da { $paymentAmountOld } per { $productPaymentCycleOld } a { $paymentAmountNew } per { $productPaymentCycleNew }. Contestualmente ti verrà accreditato un importo una tantum di { $paymentProrated } per riflettere la tariffa più bassa per il resto di questo { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Nel caso sia necessario installare software aggiuntivo per utilizzare { $productName }, riceverai in un’altra email le istruzioni per scaricarlo.
subscriptionDowngrade-content-auto-renew = Il tuo abbonamento si rinnoverà automaticamente a ogni periodo di fatturazione, a meno che tu non decida di annullarlo.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Il tuo abbonamento a { $productName } scadrà a breve
subscriptionEndingReminder-title = Il tuo abbonamento a { $productName } scadrà a breve
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Il tuo accesso a { $productName } terminerà il <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Se desideri continuare a utilizzare { $productName }, puoi riattivare il tuo abbonamento in <a data-l10n-name="subscriptionEndingReminder-account-settings">Impostazioni account</a> prima del <strong>{ $serviceLastActiveDateOnly }</strong>. Se hai bisogno di assistenza, <a data-l10n-name="subscriptionEndingReminder-contact-support">contatta il nostro team di supporto</a>.
subscriptionEndingReminder-content-line1-plaintext = Il tuo accesso a { $productName } terminerà il { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Se desideri continuare a utilizzare { $productName }, puoi riattivare il tuo abbonamento in Impostazioni account prima del { $serviceLastActiveDateOnly }. Se hai bisogno di assistenza, contatta il nostro team di supporto.
subscriptionEndingReminder-content-closing = Grazie per essere un prezioso abbonato.
subscriptionEndingReminder-churn-title = Vuoi mantenere l’accesso?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Si applicano termini e restrizioni limitati</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Si applicano termini e restrizioni limitati: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Contatta il nostro team di supporto: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Il tuo abbonamento a { $productName } è stato annullato
subscriptionFailedPaymentsCancellation-title = Il tuo abbonamento è stato annullato
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Abbiamo annullato il tuo abbonamento a { $productName } a causa dei numerosi tentativi di pagamento non andati a buon fine. Per ottenere nuovamente l’accesso, sottoscrivi un nuovo abbonamento con un metodo di pagamento aggiornato.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Il pagamento per { $productName } è stato confermato
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Grazie per aver sottoscritto un abbonamento a { $productName }
subscriptionFirstInvoice-content-processing = Il pagamento è in fase di elaborazione, l’operazione potrebbe richiedere fino a quattro giorni lavorativi.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Riceverai un’altra email con informazioni su come iniziare a utilizzare { $productName }.
subscriptionFirstInvoice-content-auto-renew = Il tuo abbonamento si rinnoverà automaticamente a ogni periodo di fatturazione, a meno che tu non decida di annullarlo.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = La prossima fattura verrà emessa il { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Il metodo di pagamento per { $productName } è scaduto o in scadenza
subscriptionPaymentExpired-title-2 = Il metodo di pagamento è scaduto o sta per scadere
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Il metodo di pagamento utilizzato per { $productName } è scaduto o sta per scadere.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Pagamento per { $productName } non riuscito
subscriptionPaymentFailed-title = Siamo spiacenti, stiamo riscontrando problemi con il tuo pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Si è verificato un problema con il tuo ultimo pagamento per { $productName }.
subscriptionPaymentFailed-content-outdated-1 = È possibile che il metodo di pagamento in uso sia scaduto o il metodo di pagamento corrente non sia aggiornato.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Aggiornamento delle informazioni di pagamento richiesto per { $productName }
subscriptionPaymentProviderCancelled-title = Siamo spiacenti, stiamo riscontrando problemi con il tuo metodo di pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Abbiamo rilevato un problema con il metodo di pagamento scelto per { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = È possibile che il metodo di pagamento in uso sia scaduto o il metodo di pagamento corrente non sia aggiornato.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abbonamento a { $productName } riattivato
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Grazie per aver riattivato il tuo abbonamento a { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Il ciclo di fatturazione e l’importo resteranno invariati. Il tuo prossimo addebito sarà di { $invoiceTotal } e avverrà il { $nextInvoiceDateOnly }. Il tuo abbonamento si rinnoverà automaticamente a ogni scadenza di fatturazione, a meno che tu non decida di annullarlo.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Avviso di rinnovo automatico di { $productName }
subscriptionRenewalReminder-title = Il tuo abbonamento verrà rinnovato a breve
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Gentile cliente di { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Il tuo abbonamento attuale è impostato per il rinnovo automatico tra { $reminderLength } giorni.
subscriptionRenewalReminder-content-discount-change = La fattura successiva rifletterà una modifica del prezzo, in quanto uno sconto esistente è terminato ed è stato applicato un nuovo sconto.
subscriptionRenewalReminder-content-discount-ending = Poiché lo sconto esistente è terminato, il tuo abbonamento verrà rinnovato al prezzo standard.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = A quel punto, { -brand-mozilla } rinnoverà il tuo abbonamento { $planIntervalCount } { $planInterval } e verrà applicato un addebito di { $invoiceTotal } al metodo di pagamento sul tuo account.
subscriptionRenewalReminder-content-closing = Cordiali saluti,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = il team di { $productName }
subscriptionReplaced-subject = Il tuo abbonamento è stato modificato nell’ambito dell’aggiornamento
subscriptionReplaced-title = Il tuo abbonamento è stato aggiornato
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Il tuo abbonamento individuale a { $productName } è stato sostituito ed è ora incluso nel nuovo pacchetto.
subscriptionReplaced-content-credit = Riceverai un credito per la parte non utilizzata del tuo abbonamento precedente. Questo credito verrà automaticamente applicato al tuo account e utilizzato per addebiti futuri.
subscriptionReplaced-content-no-action = Non è richiesta alcuna azione da parte tua.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Il pagamento per { $productName } è stato ricevuto
subscriptionSubsequentInvoice-title = Grazie per il tuo abbonamento.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = L’ultimo pagamento per { $productName } è stato ricevuto.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = La prossima fattura verrà emessa il { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Hai effettuato l’aggiornamento a { $productName }
subscriptionUpgrade-title = Grazie per aver effettuato l’aggiornamento.
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = L’aggiornamento a { $productName } è stato effettuato correttamente.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Ti è stata addebitata una tariffa una tantum di { $invoiceAmountDue } per riflettere il prezzo più alto del tuo abbonamento per il resto di questo periodo di fatturazione ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Hai ricevuto un credito sul conto pari a { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = A partire dalla prossima fattura, il prezzo del tuo abbonamento cambierà.
subscriptionUpgrade-content-old-price-day = La tariffa precedente era di { $paymentAmountOld } al giorno.
subscriptionUpgrade-content-old-price-week = La tariffa precedente era di { $paymentAmountOld } a settimana.
subscriptionUpgrade-content-old-price-month = La tariffa precedente era di { $paymentAmountOld } al mese.
subscriptionUpgrade-content-old-price-halfyear = La tariffa precedente era di { $paymentAmountOld } per sei mesi.
subscriptionUpgrade-content-old-price-year = La tariffa precedente era di { $paymentAmountOld } all’anno.
subscriptionUpgrade-content-old-price-default = La tariffa precedente era di { $paymentAmountOld } per intervallo di fatturazione.
subscriptionUpgrade-content-old-price-day-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } (tasse) al giorno.
subscriptionUpgrade-content-old-price-week-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } (tasse) a settimana.
subscriptionUpgrade-content-old-price-month-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } (tasse) al mese.
subscriptionUpgrade-content-old-price-halfyear-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } (tasse) per sei mesi.
subscriptionUpgrade-content-old-price-year-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } (tasse) all’anno.
subscriptionUpgrade-content-old-price-default-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } (tasse) per intervallo di fatturazione.
subscriptionUpgrade-content-new-price-day = In futuro ti verranno addebitati { $paymentAmountNew } al giorno, sconti esclusi.
subscriptionUpgrade-content-new-price-week = In futuro ti verranno addebitati { $paymentAmountNew } a settimana, sconti esclusi.
subscriptionUpgrade-content-new-price-month = In futuro ti verranno addebitati { $paymentAmountNew } al mese, sconti esclusi.
subscriptionUpgrade-content-new-price-halfyear = In futuro ti verranno addebitati { $paymentAmountNew } per sei mesi, sconti esclusi.
subscriptionUpgrade-content-new-price-year = In futuro ti verranno addebitati { $paymentAmountNew } all’anno, sconti esclusi.
subscriptionUpgrade-content-new-price-default = In futuro ti verranno addebitati { $paymentAmountNew } per intervallo di fatturazione, sconti esclusi.
subscriptionUpgrade-content-new-price-day-dtax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } (tasse) al giorno, sconti esclusi.
subscriptionUpgrade-content-new-price-week-tax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } (tasse) a settimana, sconti esclusi.
subscriptionUpgrade-content-new-price-month-tax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } (tasse) al mese, sconti esclusi.
subscriptionUpgrade-content-new-price-halfyear-tax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } (tasse) per sei mesi, sconti esclusi.
subscriptionUpgrade-content-new-price-year-tax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } (tasse) all’anno, sconti esclusi.
subscriptionUpgrade-content-new-price-default-tax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } (tasse) per intervallo di fatturazione, sconti esclusi.
subscriptionUpgrade-existing = Se uno dei tuoi abbonamenti esistenti si sovrappone a questo aggiornamento, lo gestiremo e ti invieremo un’email separata con i dettagli. Se il tuo nuovo piano include prodotti che richiedono l’installazione, ti invieremo un’altra email con le istruzioni per l’installazione.
subscriptionUpgrade-auto-renew = Il tuo abbonamento si rinnoverà automaticamente a ogni periodo di fatturazione, a meno che tu non decida di annullarlo.
subscriptionsPaymentExpired-subject-2 = Il metodo di pagamento per i tuoi abbonamenti è scaduto o sta per scadere
subscriptionsPaymentExpired-title-2 = Il metodo di pagamento è scaduto o sta per scadere
subscriptionsPaymentExpired-content-2 = Il metodo di pagamento in uso per i seguenti abbonamenti è scaduto o sta per scadere.
subscriptionsPaymentProviderCancelled-subject = Aggiornamento delle informazioni di pagamento richiesto per gli abbonamenti { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Siamo spiacenti, stiamo riscontrando problemi con il tuo metodo di pagamento
subscriptionsPaymentProviderCancelled-content-detected = Abbiamo rilevato un problema con il metodo di pagamento scelto per i seguenti abbonamenti.
subscriptionsPaymentProviderCancelled-content-payment-1 = È possibile che il metodo di pagamento in uso sia scaduto o il metodo di pagamento corrente non sia aggiornato.
