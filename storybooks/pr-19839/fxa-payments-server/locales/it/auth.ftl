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

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logo { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sincronizza dispositivi">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositivi">
fxa-privacy-url = Informativa sulla privacy  di { -brand-mozilla }
moz-accounts-privacy-url-2 = Informativa sulla privacy degli { -product-mozilla-accounts }
moz-accounts-terms-url = Condizioni di utilizzo del servizio degli { -product-mozilla-accounts }
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
account-deletion-info-block-communications = Se il tuo account viene eliminato, continuerai a ricevere email da Mozilla Corporation e Mozilla Foundation, a meno che tu non <a data-l10n-name="unsubscribeLink">chieda di annullare l’iscrizione</a>.
account-deletion-info-block-support = Se hai domande o hai bisogno di assistenza, non esitare a contattare il nostro <a data-l10n-name="supportLink">team di supporto</a>.
account-deletion-info-block-communications-plaintext = Se il tuo account viene eliminato, continuerai a ricevere email da Mozilla Corporation e Mozilla Foundation, a meno che tu non chieda di annullare l’iscrizione:
account-deletion-info-block-support-plaintext = Se hai domande o hai bisogno di assistenza, non esitare a contattare il nostro team di supporto:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Scarica { $productName } su { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Scarica { $productName } sull’{ -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installa { $productName } su <a data-l10n-name="anotherDeviceLink">un altro dispositivo desktop</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installa { $productName } su <a data-l10n-name="anotherDeviceLink">un altro dispositivo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Ottieni { $productName } su Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Scarica { $productName } dall’App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installa { $productName } su un altro dispositivo:
automated-email-change-2 = Se non sei stato tu a eseguire questa operazione, <a data-l10n-name="passwordChangeLink">cambia la tua password</a> immediatamente.
automated-email-support = Per ulteriori informazioni, visita il <a data-l10n-name="supportLink">supporto { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Se questa operazione non è stata eseguita da te, cambia la tua password immediatamente.
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Per ulteriori informazioni, visita il supporto { -brand-mozilla }:
automated-email-inactive-account = Questa è una email automatica. L’hai ricevuta perché hai un { -product-mozilla-account } e sono trascorsi 2 anni dall’ultimo accesso.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Per ulteriori informazioni, visita il <a data-l10n-name="supportLink">supporto { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Questa email è stata inviata da un servizio automatico. Se hai ricevuto questa email per errore, puoi semplicemente ignorarla.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Questo messaggio è stato inviato da un servizio automatico. Se questa operazione non è stata autorizzata da te, cambia la password per proteggere il tuo account:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Questa richiesta è stata inviata da { $uaBrowser } su { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Questa richiesta è stata inviata da { $uaBrowser } su { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Questa richiesta è stata inviata da { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Questa richiesta è stata inviata da { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Questa richiesta è stata inviata da { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Se questa operazione non è stata eseguita da te, <a data-l10n-name="revokeAccountRecoveryLink">elimina la nuova chiave</a> e <a data-l10n-name="passwordChangeLink">cambia la tua password</a>.
automatedEmailRecoveryKey-change-pwd-only = Se questa operazione non è stata eseguita da te, <a data-l10n-name="passwordChangeLink">cambia la password</a>.
automatedEmailRecoveryKey-more-info = Per ulteriori informazioni, visita il <a data-l10n-name="supportLink">supporto { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Questa richiesta è stata inviata da:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Se questa operazione non è stata eseguita da te, elimina la nuova chiave:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Se questa operazione non è stata eseguita da te, cambia la password:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = e cambia la password:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Per ulteriori informazioni, visita il supporto { -brand-mozilla }:
automated-email-reset =
    Questa email è stata inviata da un servizio automatico. Se non hai autorizzato questa azione, <a data-l10n-name="resetLink">ripristina la tua password</a>.
    Per ulteriori informazioni, visita la pagina di <a data-l10n-name="supportLink">supporto { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Se non sei stato tu ad autorizzare questa azione, reimposta la password ora su { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Se non sei stato tu a eseguire questa operazione, <a data-l10n-name="resetLink">reimposta la password</a> e <a data-l10n-name="twoFactorSettingsLink">reimposta l’autenticazione in due passaggi</a> immediatamente. Per ulteriori informazioni, visita il <a data-l10n-name="supportLink">supporto { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Se non sei stato tu a eseguire questa operazione, reimposta immediatamente la password all’indirizzo:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Reimposta l’autenticazione in due passaggi anche su:
brand-banner-message = Lo sapevi che abbiamo cambiato nome da { -product-firefox-accounts } ad { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Ulteriori informazioni</a>
cancellationSurvey = Aiutaci a migliorare i nostri servizi partecipando a questo <a data-l10n-name="cancellationSurveyUrl">breve sondaggio</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Aiutaci a migliorare i nostri servizi partecipando a questo breve sondaggio:
change-password-plaintext = Se ritieni che qualcuno stia tentando di accedere indebitamente al tuo account, cambiane subito la password.
manage-account = Gestisci account
manage-account-plaintext = { manage-account }:
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
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Per ulteriori informazioni, visita il <a data-l10n-name="supportLink">supporto { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Per ulteriori informazioni, visita il supporto { -brand-mozilla }: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } su { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } su { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (stimato)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (stimato)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (stimato)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (stimato)
view-invoice-link-action = Visualizza fattura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Visualizza fattura: { $invoiceLink }
cadReminderFirst-subject-1 = Promemoria: è ora di sincronizzare { -brand-firefox }
cadReminderFirst-action = Sincronizza un altro dispositivo
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Bisogna essere in due per sincronizzarsi
cadReminderFirst-description-v2 = Porta le tue schede su tutti i tuoi dispositivi. Ottieni segnalibri, password e altri dati ovunque utilizzi { -brand-firefox }.
cadReminderSecond-subject-2 = Non perderti nulla! Completa la configurazione per iniziare a sincronizzare
cadReminderSecond-action = Sincronizza un altro dispositivo
cadReminderSecond-title-2 = Non dimenticarti di sincronizzare!
cadReminderSecond-description-sync = Sincronizza segnalibri, password, schede aperte e molto altro in tutti i dispositivi in cui usi { -brand-firefox }.
cadReminderSecond-description-plus = In più, i tuoi dati sono sempre crittati. Solo tu e i dispositivi che approvi potete accedervi.
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
inactiveAccountFinalWarning-subject = Ultima possibilità per mantenere il tuo { -product-mozilla-account }
inactiveAccountFinalWarning-title = Il tuo account { -brand-mozilla } e i tuoi dati verranno eliminati
inactiveAccountFinalWarning-preview = Accedi per mantenere il tuo account
inactiveAccountFinalWarning-account-description = Il tuo { -product-mozilla-account } viene utilizzato per accedere a prodotti gratuiti per la privacy e la navigazione come la sincronizzazione in { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Il giorno <strong>{ $deletionDate }</strong>, il tuo account e i tuoi dati personali verranno eliminati in modo permanente a meno che tu non effettui l’accesso.
inactiveAccountFinalWarning-action = Accedi per mantenere il tuo account
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Accedi per mantenere il tuo account:
inactiveAccountFirstWarning-subject = Non perdere il tuo account
inactiveAccountFirstWarning-title = Vuoi conservare i dati e l’account { -brand-mozilla }?
inactiveAccountFirstWarning-account-description-v2 = Il tuo { -product-mozilla-account } viene utilizzato per accedere a prodotti gratuiti per la privacy e la navigazione come la sincronizzazione in { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Abbiamo notato che non accedi da 2 anni.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Il tuo account e i tuoi dati personali verranno eliminati definitivamente <strong>{ $deletionDate }</strong> a causa della tua inattività.
inactiveAccountFirstWarning-action = Accedi per mantenere il tuo account
inactiveAccountFirstWarning-preview = Accedi per mantenere il tuo account
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Accedi per mantenere il tuo account:
inactiveAccountSecondWarning-subject = Azione richiesta: eliminazione dell’account entro 7 giorni
inactiveAccountSecondWarning-title = Il tuo account { -brand-mozilla } e i tuoi dati verranno eliminati entro 7 giorni
inactiveAccountSecondWarning-account-description-v2 = Il tuo { -product-mozilla-account } viene utilizzato per accedere a prodotti gratuiti per la privacy e la navigazione come la sincronizzazione in { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Il tuo account e i tuoi dati personali verranno eliminati definitivamente <strong>{ $deletionDate }</strong> a causa della tua inattività.
inactiveAccountSecondWarning-action = Accedi per mantenere il tuo account
inactiveAccountSecondWarning-preview = Accedi per mantenere il tuo account
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Accedi per mantenere il tuo account:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Hai esaurito i codici di autenticazione di backup!
codes-reminder-title-one = Ultimo codice di autenticazione di backup rimasto
codes-reminder-title-two = È arrivato il momento di generare nuovi codici di autenticazione di backup
codes-reminder-description-part-one = I codici di autenticazione di backup ti permettono di ripristinare i tuoi dati nel caso in cui dimentichi la password.
codes-reminder-description-part-two = Genera adesso nuovi codici per non perdere i tuoi dati in futuro.
codes-reminder-description-two-left = Rimangono solo solo due codici.
codes-reminder-description-create-codes = Genera nuovi codici di autenticazione di backup per poter accedere al tuo account nel caso in cui rimani bloccato fuori.
lowRecoveryCodes-action-2 = Genera codici
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nessun codice di autenticazione di backup rimasto
        [one] Un solo codice di autenticazione di backup rimasto
       *[other] Rimangono solo { $numberRemaining } codici di autenticazione di backup
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nuovo accesso a { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nuovo accesso al tuo { -product-mozilla-account }
newDeviceLogin-title-3 = Hai effettuato l’accesso con il tuo { -product-mozilla-account }
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Non sei stato tu? <a data-l10n-name="passwordChangeLink">Cambia la tua password</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Non sei stato tu? Cambia la tua password:
newDeviceLogin-action = Gestisci account
passwordChanged-subject = Password aggiornata
passwordChanged-title = Password modificata correttamente
passwordChanged-description-2 = La password dell’{ -product-mozilla-account } è stata modificata correttamente dal seguente dispositivo:
passwordChangeRequired-subject = Rilevata attività sospetta
passwordChangeRequired-preview = Cambia subito la password
passwordChangeRequired-title-2 = Reimpostazione della password
passwordChangeRequired-suspicious-activity-3 = Abbiamo bloccato il tuo account per proteggerlo da attività sospette. Sei stato disconnesso da tutti i tuoi dispositivi e tutti i dati sincronizzati sono stati eliminati per precauzione.
passwordChangeRequired-sign-in-3 = Per accedere nuovamente al tuo account è sufficiente reimpostare la password.
passwordChangeRequired-different-password-2 = <b>Importante:</b> scegli una password complessa, diversa da quella che hai utilizzato in passato.
passwordChangeRequired-different-password-plaintext-2 = Importante: scegli una password complessa, diversa da quella che hai utilizzato in passato.
passwordChangeRequired-action = Reimposta password
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Utilizza { $code } per cambiare la password
password-forgot-otp-preview = Questo codice scade tra 10 minuti
password-forgot-otp-title = Password dimenticata?
password-forgot-otp-request = Abbiamo ricevuto una richiesta di modifica della password per il tuo { -product-mozilla-account } da:
password-forgot-otp-code-2 = Se sei stato tu, ecco il codice di conferma per procedere:
password-forgot-otp-expiry-notice = Questo codice scade tra 10 minuti.
passwordReset-subject-2 = La password è stata reimpostata
passwordReset-title-2 = La password è stata reimpostata
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Hai reimpostato la password del tuo { -product-mozilla-account } su:
passwordResetAccountRecovery-subject-2 = La password è stata reimpostata
passwordResetAccountRecovery-title-3 = La password è stata reimpostata
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Hai utilizzato la chiave di recupero dell’account per reimpostare la password dell’{ -product-mozilla-account } su:
passwordResetAccountRecovery-information = Ti abbiamo disconnesso da tutti i tuoi dispositivi sincronizzati. Abbiamo creato una nuova chiave di recupero dell’account per sostituire quella che hai utilizzato. Puoi modificarla nelle impostazioni del tuo account.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Ti abbiamo disconnesso da tutti i tuoi dispositivi sincronizzati. Abbiamo creato una nuova chiave di recupero dell’account per sostituire quella che hai utilizzato. Puoi modificarla nelle impostazioni del tuo account:
passwordResetAccountRecovery-action-4 = Gestisci account
passwordResetRecoveryPhone-subject = Utilizzato telefono per il recupero dell’account
passwordResetRecoveryPhone-preview = Assicurati di essere stato tu
passwordResetRecoveryPhone-title = Il telefono per il recupero dell’account è stato utilizzato per confermare la reimpostazione della password
passwordResetRecoveryPhone-device = Telefono per il recupero dell’account utilizzato da:
passwordResetRecoveryPhone-action = Gestisci account
passwordResetWithRecoveryKeyPrompt-subject = La password è stata reimpostata
passwordResetWithRecoveryKeyPrompt-title = La password è stata reimpostata
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Hai reimpostato la password del tuo { -product-mozilla-account } su:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Genera una chiave di recupero dell’account
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Genera una chiave di recupero dell’account:
passwordResetWithRecoveryKeyPrompt-cta-description = Dovrai accedere nuovamente su tutti i tuoi dispositivi sincronizzati. Mantieni i tuoi dati al sicuro la prossima volta con una chiave di recupero dell’account. Questo ti permette di recuperare i tuoi dati se dimentichi la password.
postAddAccountRecovery-subject-3 = Generata nuova chiave di recupero dell’account
postAddAccountRecovery-title2 = Hai generato una nuova chiave di recupero dell’account
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Conserva questa chiave in un luogo sicuro: ti servirà per ripristinare i dati di navigazione crittati se dimentichi la password.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Questa chiave può essere utilizzata una sola volta. Una volta utilizzata, ne verrà generata automaticamente una nuova. Puoi anche generarne una nuova in qualsiasi momento dalle impostazioni del tuo account.
postAddAccountRecovery-action = Gestisci account
postAddLinkedAccount-subject-2 = Nuovo account collegato al tuo { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Il tuo account { $providerName } è stato collegato al tuo { -product-mozilla-account }
postAddLinkedAccount-action = Gestisci account
postAddRecoveryPhone-subject = Aggiunto telefono per il recupero dell’account
postAddRecoveryPhone-preview = Account protetto da autenticazione in due passaggi
postAddRecoveryPhone-title-v2 = Hai aggiunto un telefono per il recupero dell’account
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Hai aggiunto { $maskedLastFourPhoneNumber } come telefono per il recupero dell’account
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Come aiuta a proteggere il tuo account
postAddRecoveryPhone-how-protect-plaintext = Come aiuta a proteggere il tuo account:
postAddRecoveryPhone-enabled-device = L’hai attivata da:
postAddRecoveryPhone-action = Gestisci account
postAddTwoStepAuthentication-preview = Il tuo account è protetto
postAddTwoStepAuthentication-subject-v3 = L’autenticazione in due passaggi è attiva
postAddTwoStepAuthentication-title-2 = Hai attivato l’autenticazione in due passaggi
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = L’hai richiesto da:
postAddTwoStepAuthentication-action = Gestisci account
postAddTwoStepAuthentication-code-required-v4 = D’ora in avanti a ogni nuovo accesso verranno richiesti i codici generati dall’app di autenticazione.
postAddTwoStepAuthentication-recovery-method-codes = Hai anche aggiunto dei codici di autenticazione di backup come metodo di recupero.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Hai anche aggiunto { $maskedPhoneNumber } come telefono per il recupero dell’account.
postAddTwoStepAuthentication-how-protects-link = Come aiuta a proteggere il tuo account
postAddTwoStepAuthentication-how-protects-plaintext = Come aiuta a proteggere il tuo account:
postAddTwoStepAuthentication-device-sign-out-message = Per proteggere tutti i tuoi dispositivi connessi, devi disconnetterti da tutti i dispositivi in cui utilizzi questo account, quindi accedere nuovamente utilizzando l’autenticazione in due passaggi.
postChangeAccountRecovery-subject = Chiave di recupero dell’account modificata
postChangeAccountRecovery-title = Hai modificato la chiave di recupero dell’account
postChangeAccountRecovery-body-part1 = Ora hai una nuova chiave di recupero dell’account. La chiave precedente è stata eliminata.
postChangeAccountRecovery-body-part2 = Salva questa nuova chiave in un luogo sicuro: ti servirà per ripristinare i dati di navigazione crittati se dimentichi la password.
postChangeAccountRecovery-action = Gestisci account
postChangePrimary-subject = Indirizzo email primario aggiornato
postChangePrimary-title = Nuovo indirizzo email primario
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Hai modificato correttamente il tuo indirizzo email primario in { $email }. Da questo momento puoi utilizzare il nuovo indirizzo email per accedere all’{ -product-mozilla-account }, ricevere notifiche di sicurezza e conferme.
postChangePrimary-action = Gestisci account
postChangeRecoveryPhone-subject = Aggiornato telefono per il recupero dell’account
postChangeRecoveryPhone-preview = Account protetto da autenticazione in due passaggi
postChangeRecoveryPhone-title = Modificato telefono per il recupero dell’account
postChangeRecoveryPhone-description = Ora hai un nuovo telefono per il recupero dell’account. Il telefono precedente è stato eliminato.
postChangeRecoveryPhone-requested-device = L’hai richiesto da:
postChangeTwoStepAuthentication-preview = Il tuo account è protetto
postChangeTwoStepAuthentication-subject = Aggiornata autenticazione in due passaggi
postChangeTwoStepAuthentication-title = L’autenticazione in due passaggi è stata aggiornata
postChangeTwoStepAuthentication-use-new-account = D’ora in poi dovrai utilizzare la nuova voce per { -product-mozilla-account } nella tua app di autenticazione. La versione precedente non funzionerà più ed è possibile rimuoverla.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = L’hai richiesto da:
postChangeTwoStepAuthentication-action = Gestisci account
postChangeTwoStepAuthentication-how-protects-link = Come aiuta a proteggere il tuo account
postChangeTwoStepAuthentication-how-protects-plaintext = Come aiuta a proteggere il tuo account:
postChangeTwoStepAuthentication-device-sign-out-message = Per proteggere tutti i tuoi dispositivi connessi, devi disconnetterti da tutti i dispositivi in cui utilizzi questo account, quindi accedere nuovamente utilizzando la nuova autenticazione in due passaggi.
postConsumeRecoveryCode-title-3 = Il codice di autenticazione di backup è stato utilizzato per confermare la reimpostazione della password
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Codice utilizzato da:
postConsumeRecoveryCode-action = Gestisci account
postConsumeRecoveryCode-subject-v3 = È stato utilizzato un codice di autenticazione di backup
postConsumeRecoveryCode-preview = Assicurati di essere stato tu
postNewRecoveryCodes-subject-2 = Sono stati generati nuovi codici di autenticazione di backup
postNewRecoveryCodes-title-2 = Hai generato nuovi codici di autenticazione di backup
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Sono stati generati su:
postNewRecoveryCodes-action = Gestisci account
postRemoveAccountRecovery-subject-2 = La chiave di recupero dell’account è stata eliminata
postRemoveAccountRecovery-title-3 = Hai eliminato la chiave di recupero dell’account
postRemoveAccountRecovery-body-part1 = La chiave di recupero dell’account è necessaria per ripristinare i dati di navigazione crittati se dimentichi la password.
postRemoveAccountRecovery-body-part2 = Se non l’hai già fatto, genera una nuova chiave di recupero dell’account nelle impostazioni per evitare di perdere i dati salvati quali password, segnalibri, cronologia di navigazione e altro ancora.
postRemoveAccountRecovery-action = Gestisci account
postRemoveRecoveryPhone-subject = Rimosso telefono per il recupero dell’account
postRemoveRecoveryPhone-preview = Account protetto da autenticazione in due passaggi
postRemoveRecoveryPhone-title = Rimosso telefono per il recupero dell’account
postRemoveRecoveryPhone-description-v2 = Il telefono per il recupero dell’account è stato rimosso dalle impostazioni di autenticazione in due passaggi.
postRemoveRecoveryPhone-description-extra = Puoi comunque utilizzare i codici di autenticazione di backup per accedere se non puoi utilizzare l’app di autenticazione.
postRemoveRecoveryPhone-requested-device = L’hai richiesto da:
postRemoveSecondary-subject = L’indirizzo email secondario è stato rimosso
postRemoveSecondary-title = L’indirizzo email secondario è stato rimosso
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = L’indirizzo email { $secondaryEmail } non è più configurato come indirizzo secondario per il tuo { -product-mozilla-account }. Da questo momento le notifiche di sicurezza e le verifiche d’accesso non verranno più inviate a questo indirizzo.
postRemoveSecondary-action = Gestisci account
postRemoveTwoStepAuthentication-subject-line-2 = Autenticazione in due passaggi disattivata
postRemoveTwoStepAuthentication-title-2 = Hai disattivato l’autenticazione in due passaggi
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = L’hai disattivata da:
postRemoveTwoStepAuthentication-action = Gestisci account
postRemoveTwoStepAuthentication-not-required-2 = Non dovrai più utilizzare i codici di sicurezza dalla tua app di autenticazione per accedere.
postSigninRecoveryCode-subject = Codice di autenticazione di backup utilizzato per accedere
postSigninRecoveryCode-preview = Conferma l’attività dell’account
postSigninRecoveryCode-title = Il codice di autenticazione di backup è stato utilizzato per accedere
postSigninRecoveryCode-description = In caso contrario, dovresti cambiare immediatamente la password per mantenere il tuo account al sicuro.
postSigninRecoveryCode-device = Hai effettuato l’accesso da:
postSigninRecoveryCode-action = Gestisci account
postSigninRecoveryPhone-subject = Telefono per il recupero dell’account utilizzato per accedere
postSigninRecoveryPhone-preview = Conferma l’attività dell’account
postSigninRecoveryPhone-title = Telefono per il recupero dell’account utilizzato per accedere
postSigninRecoveryPhone-description = In caso contrario, dovresti cambiare immediatamente la password per mantenere il tuo account al sicuro.
postSigninRecoveryPhone-device = Hai effettuato l’accesso da:
postSigninRecoveryPhone-action = Gestisci account
postVerify-sub-title-3 = Siamo felici di averti qui!
postVerify-title-2 = Vuoi visualizzare la stessa scheda su due dispositivi?
postVerify-description-2 = È facile! Installa { -brand-firefox } su un altro dispositivo ed effettua l’accesso per attivare la sincronizzazione. È come un tocco di magia!
postVerify-sub-description = (Psst… Questo significa che puoi accedere ai tuoi segnalibri, password e altri dati { -brand-firefox } ovunque effettui l’accesso.)
postVerify-subject-4 = Benvenuto in { -brand-mozilla }!
postVerify-setup-2 = Connetti un altro dispositivo:
postVerify-action-2 = Connetti un altro dispositivo
postVerifySecondary-subject = Email secondaria aggiunta correttamente
postVerifySecondary-title = Email secondaria aggiunta correttamente
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = L’indirizzo email { $secondaryEmail } è stato correttamente confermato e sarà utilizzato come indirizzo secondario per l’{ -product-mozilla-account }. Da questo momento le notifiche di sicurezza e le conferme d’accesso verranno inviate a entrambi gli indirizzi email.
postVerifySecondary-action = Gestisci account
recovery-subject = Reimposta la tua password
recovery-title-2 = Password dimenticata?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Abbiamo ricevuto una richiesta di modifica della password per il tuo { -product-mozilla-account } da:
recovery-new-password-button = Fai clic sul pulsante in basso per generare una nuova password. Questo link scadrà entro la prossima ora.
recovery-copy-paste = Copia e incolla il seguente URL nel tuo browser per generare una nuova password. Questo link scadrà entro la prossima ora.
recovery-action = Genera nuova password
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Il tuo abbonamento a { $productName } è stato annullato
subscriptionAccountDeletion-title = Ci mancherai.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Di recente hai eliminato il tuo { -product-mozilla-account }. Di conseguenza, abbiamo annullato il tuo abbonamento a { $productName }. Il pagamento finale di { $invoiceTotal } è stato effettuato in data { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Ti diamo il benvenuto in { $productName }: imposta la tua password.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Benvenuto in { $productName }
subscriptionAccountFinishSetup-content-processing = Il pagamento è in fase di elaborazione, l’operazione potrebbe richiedere fino a quattro giorni lavorativi. Il tuo abbonamento si rinnoverà automaticamente a ogni periodo di fatturazione, a meno che tu non decida di annullarlo.
subscriptionAccountFinishSetup-content-create-3 = Successivamente, dovrai creare una password per l’{ -product-mozilla-account } per iniziare a utilizzare il tuo nuovo abbonamento.
subscriptionAccountFinishSetup-action-2 = Inizia
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
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Il tuo abbonamento attuale è impostato per il rinnovo automatico tra { $reminderLength } giorni. A quel punto, { -brand-mozilla } rinnoverà il tuo abbonamento per { $planIntervalCount } { $planInterval } e sarà applicato un addebito di { $invoiceTotal } sul metodo di pagamento inserito nel tuo account.
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
subscriptionsPaymentExpired-subject-2 = Il metodo di pagamento per i tuoi abbonamenti è scaduto o sta per scadere
subscriptionsPaymentExpired-title-2 = Il metodo di pagamento è scaduto o sta per scadere
subscriptionsPaymentExpired-content-2 = Il metodo di pagamento in uso per i seguenti abbonamenti è scaduto o sta per scadere.
subscriptionsPaymentProviderCancelled-subject = Aggiornamento delle informazioni di pagamento richiesto per gli abbonamenti { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Siamo spiacenti, stiamo riscontrando problemi con il tuo metodo di pagamento
subscriptionsPaymentProviderCancelled-content-detected = Abbiamo rilevato un problema con il metodo di pagamento scelto per i seguenti abbonamenti.
subscriptionsPaymentProviderCancelled-content-payment-1 = È possibile che il metodo di pagamento in uso sia scaduto o il metodo di pagamento corrente non sia aggiornato.
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
subscriptionUpgrade-content-old-price-day-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } di tasse al giorno.
subscriptionUpgrade-content-old-price-week-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } di tasse a settimana.
subscriptionUpgrade-content-old-price-month-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } di tasse al mese.
subscriptionUpgrade-content-old-price-halfyear-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } di tasse per sei mesi.
subscriptionUpgrade-content-old-price-year-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } di tasse all’anno.
subscriptionUpgrade-content-old-price-default-tax = La tariffa precedente era di { $paymentAmountOld } + { $paymentTaxOld } di tasse per intervallo di fatturazione.
subscriptionUpgrade-content-new-price-day = In futuro ti verranno addebitati { $paymentAmountNew } al giorno, sconti esclusi.
subscriptionUpgrade-content-new-price-week = In futuro ti verranno addebitati { $paymentAmountNew } a settimana, sconti esclusi.
subscriptionUpgrade-content-new-price-month = In futuro ti verranno addebitati { $paymentAmountNew } al mese, sconti esclusi.
subscriptionUpgrade-content-new-price-halfyear = In futuro ti verranno addebitati { $paymentAmountNew } per sei mesi, sconti esclusi.
subscriptionUpgrade-content-new-price-year = In futuro ti verranno addebitati { $paymentAmountNew } all’anno, sconti esclusi.
subscriptionUpgrade-content-new-price-default = In futuro ti verranno addebitati { $paymentAmountNew } per intervallo di fatturazione, sconti esclusi.
subscriptionUpgrade-content-new-price-day-dtax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } di tasse al giorno, sconti esclusi.
subscriptionUpgrade-content-new-price-week-tax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } di tasse a settimana, sconti esclusi.
subscriptionUpgrade-content-new-price-month-tax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } di tasse al mese, sconti esclusi.
subscriptionUpgrade-content-new-price-halfyear-tax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } di tasse per sei mesi, sconti esclusi.
subscriptionUpgrade-content-new-price-year-tax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } di tasse all’anno, sconti esclusi.
subscriptionUpgrade-content-new-price-default-tax = In futuro ti verranno addebitati { $paymentAmountNew } + { $paymentTaxNew } di tasse per intervallo di fatturazione, sconti esclusi.
subscriptionUpgrade-existing = Se uno dei tuoi abbonamenti esistenti si sovrappone a questo aggiornamento, lo gestiremo e ti invieremo un’email separata con i dettagli. Se il tuo nuovo piano include prodotti che richiedono l’installazione, ti invieremo un’altra email con le istruzioni per l’installazione.
subscriptionUpgrade-auto-renew = Il tuo abbonamento si rinnoverà automaticamente a ogni periodo di fatturazione, a meno che tu non decida di annullarlo.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Utilizza { $unblockCode } per accedere
unblockCode-preview = Questo codice scade tra un’ora
unblockCode-title = Hai effettuato tu questo accesso?
unblockCode-prompt = In caso affermativo, questo è il codice di autorizzazione da utilizzare:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = In caso affermativo, questo è il codice di autorizzazione da utilizzare: { $unblockCode }
unblockCode-report = In caso contrario, aiutaci a tenere alla larga gli intrusi <a data-l10n-name="reportSignInLink">segnalandocelo</a>.
unblockCode-report-plaintext = In caso contrario, aiutaci a tenere alla larga gli intrusi segnalandocelo.
verificationReminderFinal-subject = Ultimo promemoria: conferma il tuo account
verificationReminderFinal-description-2 = Hai creato un { -product-mozilla-account } qualche settimana fa ma non l’hai mai confermato. Per la tua sicurezza, l’account sarà eliminato se non viene verificato nelle prossime 24 ore.
confirm-account = Conferma account
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Ricordati di confermare il tuo account
verificationReminderFirst-title-3 = Benvenuto in { -brand-mozilla }!
verificationReminderFirst-description-3 = Hai creato un { -product-mozilla-account } qualche giorno fa ma non l’hai mai confermato. Conferma il tuo account nei prossimi 15 giorni o verrà automaticamente eliminato.
verificationReminderFirst-sub-description-3 = Non farti sfuggire il browser che mette te e la tua privacy al primo posto.
confirm-email-2 = Conferma account
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Conferma account
verificationReminderSecond-subject-2 = Ricordati di confermare il tuo account
verificationReminderSecond-title-3 = Non perderti nulla di { -brand-mozilla }!
verificationReminderSecond-description-4 = Hai creato un { -product-mozilla-account } qualche giorno fa ma non l’hai mai confermato. Conferma il tuo account nei prossimi 10 giorni o verrà automaticamente eliminato.
verificationReminderSecond-second-description-3 = Il tuo { -product-mozilla-account } ti consente di sincronizzare la tua esperienza con { -brand-firefox } su tutti i dispositivi e offre accesso ad altri prodotti { -brand-mozilla } dedicati alla protezione della privacy.
verificationReminderSecond-sub-description-2 = Partecipa alla nostra missione per trasformare Internet in un luogo aperto a tutti.
verificationReminderSecond-action-2 = Conferma account
verify-title-3 = Apri Internet con { -brand-mozilla }
verify-description-2 = Conferma il tuo account e ottieni il massimo da { -brand-mozilla } su tutti i dispositivi da cui accedi, a cominciare da:
verify-subject = Completa la creazione del tuo account
verify-action-2 = Conferma account
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Utilizza { $code } per modificare il tuo account
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Questo codice scade tra { $expirationTime } minuto.
       *[other] Questo codice scade tra { $expirationTime } minuti.
    }
verifyAccountChange-title = Stai modificando le informazioni relative al tuo account?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Aiutaci a mantenere il tuo account al sicuro approvando questa modifica:
verifyAccountChange-prompt = In caso affermativo, questo è il tuo codice di autorizzazione:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Scade tra { $expirationTime } minuto.
       *[other] Scade tra { $expirationTime } minuti.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Hai effettuato tu l’accesso a { $clientName }?
verifyLogin-description-2 = Aiutaci a mantenere il tuo account al sicuro confermando di esser stato tu ad accedere:
verifyLogin-subject-2 = Conferma accesso
verifyLogin-action = Conferma accesso
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Utilizza { $code } per accedere
verifyLoginCode-preview = Questo codice scade tra 5 minuti.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Hai effettuato tu l’accesso a { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Aiutaci a mantenere il tuo account al sicuro approvando il tuo accesso su:
verifyLoginCode-prompt-3 = In caso affermativo, questo è il tuo codice di autorizzazione:
verifyLoginCode-expiry-notice = Il codice scadrà entro 5 minuti.
verifyPrimary-title-2 = Conferma indirizzo email primario
verifyPrimary-description = Una richiesta di autorizzazione a modificare l’account è stata inviata dal seguente dispositivo:
verifyPrimary-subject = Conferma l’indirizzo email primario
verifyPrimary-action-2 = Conferma indirizzo email
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Una volta confermata la richiesta, sarà possibile modificare le impostazioni dell’account, per esempio aggiungendo un indirizzo email secondario, direttamente dal dispositivo.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Utilizza { $code } per confermare l’indirizzo email secondario
verifySecondaryCode-preview = Questo codice scade tra 5 minuti.
verifySecondaryCode-title-2 = Conferma l’indirizzo email secondario
verifySecondaryCode-action-2 = Conferma indirizzo email
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Il seguente { -product-mozilla-account } richiede di utilizzare { $email } come indirizzo email secondario:
verifySecondaryCode-prompt-2 = Usa questo codice di conferma:
verifySecondaryCode-expiry-notice-2 = Il codice scade tra 5 minuti. Una volta confermato, il presente indirizzo email riceverà notifiche di sicurezza e messaggi di conferma.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Utilizza { $code } per confermare il tuo account
verifyShortCode-preview-2 = Questo codice scade tra 5 minuti
verifyShortCode-title-3 = Apri Internet con { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Conferma il tuo account e ottieni il massimo da { -brand-mozilla } su tutti i dispositivi da cui accedi, a cominciare da:
verifyShortCode-prompt-3 = Usa questo codice di conferma:
verifyShortCode-expiry-notice = Il codice scadrà entro 5 minuti.
