## Non-email strings

session-verify-send-push-title-2 = Accesso a tu { -product-mozilla-account }?
session-verify-send-push-body-2 = Clicca hic pro confirmar que es tu
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } es tu codice de verification de { -brand-mozilla }. Illo expira in 5 minutas.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Codice de verification de { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } es tu codice de recuperation de { -brand-mozilla }. Illo expira in 5 minutas.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } codice: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } es tu codice de recuperation de { -brand-mozilla }. Illo expira in 5 minutas.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } codice: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synchronisar apparatos">
body-devices-image = <img data-l10n-name="devices-image" alt="Apparatos">
fxa-privacy-url = Politica de confidentialitate de { -brand-mozilla }
moz-accounts-privacy-url-2 = Aviso re le confidentialitate de { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Terminos del servicio del { -product-mozilla-accounts(capitalization: "lowercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo { -brand-mozilla }">
subplat-automated-email = Iste message ha essite inviate automaticamente. Si tu lo ha recipite in error, nulle action es necessari.
subplat-privacy-notice = Aviso de confidentialitate
subplat-privacy-plaintext = Aviso de confidentialitate:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Tu recipe iste e-mail perque { $email } tu ha un { -product-mozilla-account } e tu te inscribeva a { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Tu recipe iste e-mail perque { $email } ha un { -product-mozilla-account }.
subplat-explainer-multiple-2 = Tu recipe iste e-mail perque { $email } ha un { -product-mozilla-account } e tu es abonate a plure productos.
subplat-explainer-was-deleted-2 = Tu recipe iste email perque { $email } es registrate pro un { -product-mozilla-account }.
subplat-manage-account-2 = Gere tu parametros del { -product-mozilla-account } visitante tu <a data-l10n-name="subplat-account-page">pagina de conto</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Gere tu parametros de { -product-mozilla-account } visitante le pagina de tu conto: { $accountSettingsUrl }
subplat-terms-policy = Terminos e politica de cancellation
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Cancellar subscription
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactivar subscription
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Actualisar le informationes de factura
subplat-privacy-policy = Politica de confidentialitate de { -brand-mozilla }
subplat-privacy-policy-2 = Aviso re le confidentialitate de { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Terminos del servicio de { -product-mozilla-accounts(capitalization: "lowercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Legal
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Confidentialitate
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Si tu conto es delite, ancora tu recipera emails de Mozilla Corporation e Mozilla Foundation, si tu non <a data-l10n-name="unsubscribeLink">demanda de remover le inscription</a>.
account-deletion-info-block-support = Si tu ha questiones o besonia de assistentia, contacta nostre <a data-l10n-name="supportLink">equipa de assistentia</a>.
account-deletion-info-block-communications-plaintext = Si tu conto es delite, ancora tu recipera emails de Mozilla Corporation e Mozilla Foundation, si tu non demanda de remover le inscription:
account-deletion-info-block-support-plaintext = Si tu ha alcun question o tu besonia assistentia, senti te libere de contactar nostre equipa de assistentia:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Discarga { $productName } de { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Discarga { $productName } de { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installa { $productName } sur <a data-l10n-name="anotherDeviceLink">un altere apparato scriptorio</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installa { $productName } sur <a data-l10n-name="anotherDeviceLink">un altere apparato</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Obtene { $productName } sur Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Discarga { $productName } sur le App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installa { $productName } sur un altere apparato:
automated-email-change-2 = Si non es tu qui prendeva iste action, <a data-l10n-name="passwordChangeLink">cambia tu contrasigno</a> immediatemente.
automated-email-support = Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Supporto</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Si non es tu qui prendeva iste action, cambia tu contrasigno immediatemente:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Pro plus informationes, visita le sito de supporto de { -brand-mozilla }:
automated-email-inactive-account = Isto es un email automatisate. Tu recipe illo perque tu ha un { -product-mozilla-account } e il ha passate 2 annos desde tu ultime authentication.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Supporto</a>.
automated-email-no-action-plaintext = Isto es un email automatisate. Si tu ha recipite illo per error, tu non besonia de facer alco.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Isto es un e-mail automatisate; si tu non autorisa iste action, alora cambia tu contrasigno:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Iste requesta veni ab  { $uaBrowser } sur { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Iste requesta veni ab  { $uaBrowser } sur { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Iste requesta veni ab { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Iste requesta veni ab { $uaOS }{ $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Iste requesta veni ab { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Si isto non era tu, <a data-l10n-name="revokeAccountRecoveryLink">dele le nove clave</a> e <a data-l10n-name="passwordChangeLink">cambia tu contrasigno</a>.
automatedEmailRecoveryKey-change-pwd-only = Si isto non era tu, <a data-l10n-name="passwordChangeLink">cambia tu contrasigno</a>.
automatedEmailRecoveryKey-more-info = Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Supporto</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Iste requeste veni ab:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Si isto non era tue, dele le nove clave:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Si isto non era tue, cambia tu contrasigno:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = e cambia tu contrasigno:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Pro altere informationes, visita le sito de supporto de { -brand-mozilla }:
automated-email-reset =
    Isto es un e-mail automatisate; si tu non autorisava iste action, alora <a data-l10n-name="resetLink">per favor reinitialisa tu contrasigno</a>.
    Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Assistentia</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Si tu non autorisa iste action, per favor reinitialisa tu contrasigno ora a { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Si tu non faceva iste action, alora <a data-l10n-name="resetLink">reinitialisa tu contrasigno</a> e <a data-l10n-name="twoFactorSettingsLink">reinitialisa tu authentication a duo passos</a> immediatemente.
    Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } supporto</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Si tu non faceva iste action, alora reinitialisa tu contrasigno immediatemente in:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Alsi, reinitialisa tu authentication a duo passos in:
brand-banner-message = Sape tu que nos cambiava nostre nomine ab { -product-firefox-accounts } a { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Saper plus</a>
cancellationSurvey = Per favor adjuta nos a meliorar nostre servicios redigente iste <a data-l10n-name="cancellationSurveyUrl">breve questionario</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Per favor adjuta nos a meliorar nostre servicios redigente iste breve questionario:
change-password-plaintext = Si tu suspecta que alcuno tenta ganiar accesso a tu conto, cambia tu contrasigno.
manage-account = Gerer le conto
manage-account-plaintext = { manage-account }:
payment-details = Detalios del pagamento:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numero de factura : { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceTotal } facturate le { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Proxime factura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Methodo de pagamento:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Methodo de pagamento: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Methodo de pagamento: { $cardName } finiente in { $lastFour }
payment-provider-card-ending-in-plaintext = Methodo de pagamento: carta finiente per { $lastFour }
payment-provider-card-ending-in = <b>Methodo de pagamento:</b> carta finiente per  { $lastFour }
payment-provider-card-ending-in-card-name = <b>Methodo de pagamento:</b> { $cardName } carta finiente per { $lastFour }
subscription-charges-invoice-summary = Summario del factura

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Numero de factura:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Numero de factura: { $invoiceNumber }
subscription-charges-invoice-date = <b>Data:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Data: { $invoiceDateOnly }
subscription-charges-prorated-price = Precio dividite pro rata
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Precio dividite pro rata: { $remainingAmountTotal }
subscription-charges-list-price = Precio de lista
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Precio de lista: { $offeringPrice }
subscription-charges-credit-from-unused-time = Credito de tempore inutilisate
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Credito ab tempore non usate: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Disconto una tantum
subscription-charges-one-time-discount-plaintext = Disconto una tantum: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Disconto de { $discountDuration }-mense
       *[other] Disconto de { $discountDuration }-menses
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Disconto de { $discountDuration }-mense: { $invoiceDiscountAmount }
       *[other] Disconto de { $discountDuration }-menses: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Disconto
subscription-charges-discount-plaintext = Disconto: { $invoiceDiscountAmount }
subscription-charges-taxes = Taxas e oneres
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Taxas e oneres: { $invoiceTaxAmount }
subscription-charges-total = <b>Total</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Total: { $invoiceTotal }
subscription-charges-credit-applied = Credito applicate
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Credito applicate: { $creditApplied }
subscription-charges-amount-paid = <b>Amonta pagate</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Amonta pagate: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Tu ha recipite un accreditation de conto de { $creditReceived }, que sera applicate a tu futur facturas.

##

subscriptionSupport = Questiones re tu subscription? Nostre <a data-l10n-name="subscriptionSupportUrl">equipa de assistentia</a> es hic pro adjutar te.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Questiones re tu subscription? Nostre equipa de supporto es ci pro te adjutar:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Gratias pro tu abonamento a { $productName }. Si tu ha questiones sur tu abonamento o tu require altere informationes sur { $productName }, <a data-l10n-name="subscriptionSupportUrl">contacta nos</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Gratias pro tu abonamento a { $productName }. Si tu ha questiones re tu abonamento o tu require altere informationes sur { $productName }, contacta nos:
subscription-support-get-help = Recipe auxilio con tu abonamento
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Gere tu abonamento</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Gere tu abonamento:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contactar assistentia</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contactar assistentia:
subscriptionUpdateBillingEnsure = Tu pote assecurar te que tu methodo de pagamento e le informationes de tu conto es actualisate <a data-l10n-name="updateBillingUrl">hic</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Tu pote assecurar te que tu methodo de pagamento e le informationes de tu conto es al currente hic:
subscriptionUpdateBillingTry = Nos tentara tu pagamento de novo le proxime poc dies, ma tu pote deber adjutar nos a corriger lo <a data-l10n-name="updateBillingUrl">actualisante tu informationes de pagamento</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Nos provara tu pagamento de novo in le proxime poc dies, ma tu pote deber adjutar nos a corriger lo actualisante tu informationes de pagamento:
subscriptionUpdatePayment = Pro impedir ulle interruption a tu servicio, per favor <a data-l10n-name="updateBillingUrl">actualisa tu informationes de pagamento</a> al plus tosto possibile.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Pro impedir ulle interruption a tu servicio, actualisa tu informationes de pagamento le plus tosto possibile:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Supporto</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Pro altere informationes, visita { -brand-mozilla } Supporto: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } sur { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } sur { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (estimate)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (estimate)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (estimate)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (estimate)
view-invoice-link-action = Vider le factura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Vide factura: { $invoiceLink }
cadReminderFirst-subject-1 = Memento! Synchronisar { -brand-firefox }
cadReminderFirst-action = Synchronisar un altere apparato
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Il es necessari duos pro synchronisar
cadReminderFirst-description-v2 = Apporta tu schedas sur tote tu apparatos. Obtene marcapaginas, contrasignos e altere datos ubique tu usa { -brand-firefox }.
cadReminderSecond-subject-2 = Non perde lo! Que nos fini le installation de tu synchronisation
cadReminderSecond-action = Synchronisar un altere apparato
cadReminderSecond-title-2 = Non oblidar de synchronisar!
cadReminderSecond-description-sync = Synchronisa tu marcapaginas, contrasignos, schedas aperte e altero ancora, ubique tu usa { -brand-firefox }.
cadReminderSecond-description-plus = In ultra, tu datos es sempre cryptate. Solo tu e le apparatos que tu approba pote vider
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Benvenite a { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Benvenite a { $productName }.
downloadSubscription-content-2 = Comencia a usar tote le functiones includite in tu abonamento:
downloadSubscription-link-action-2 = Comenciar
fraudulentAccountDeletion-subject-2 = Tu { -product-mozilla-account } ha essite delite
fraudulentAccountDeletion-title = Tu conto ha essite delite
fraudulentAccountDeletion-content-part1-v2 = Recentemente, un { -product-mozilla-account } ha essite create e un abonamento cargate per iste adresse email. Como nos face con tote le nove contos, nos demanda que tu confirma tu conto per le prime validation de iste adresse email.
fraudulentAccountDeletion-content-part2-v2 = Actualmente, nos vide que le conto non ha jammais essite confirmate. Pois que iste passo non ha essite completate, nos non es secur si isto es un abonamento autorisate. In consequentia, le { -product-mozilla-account } registrate con iste adresse de e-mail ha essite delite e tu abonamento ha essite cancellate con reimbursamento de tote le costos.
fraudulentAccountDeletion-contact = Si tu ha questiones, contacta nostre <a data-l10n-name="mozillaSupportUrl">equipa de assistentia</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Si tu ha questiones, contacta nostre equipa de assistentia: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Ultime chance pro mantener tu { -product-mozilla-account }
inactiveAccountFinalWarning-title = Tu conto e datos de { -brand-mozilla } sera delite.
inactiveAccountFinalWarning-preview = Accede pro mantener tu conto
inactiveAccountFinalWarning-account-description = Tu { -product-mozilla-account } es usate pro acceder productos gratuite pro confidentialitate e navigation como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay }, e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Le <strong>{ $deletionDate }</strong>, tu conto e tu datos personal sera permanentemente delite si tu non accede.
inactiveAccountFinalWarning-action = Accede pro mantener tu conto
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Accede pro mantener tu conto:
inactiveAccountFirstWarning-subject = Non perde tu conto
inactiveAccountFirstWarning-title = Vole tu mantener tu conto { -brand-mozilla } e tu datos?
inactiveAccountFirstWarning-account-description-v2 = Tu { -product-mozilla-account } es usate pro acceder productos gratuite pro confidentialitate e navigation como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay }, e { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Nos constatava que tu non ha habeva accedite pro 2 annos.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Tu conto e tu datos personal sera permanentemente delite le <strong>{ $deletionDate }</strong> perque tu non ha essite active.
inactiveAccountFirstWarning-action = Accede pro mantener tu conto
inactiveAccountFirstWarning-preview = Accede pro mantener tu conto
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Accede pro mantener tu conto:
inactiveAccountSecondWarning-subject = Action necessari: deletion del conto in 7 dies
inactiveAccountSecondWarning-title = Tu conto e datos de { -brand-mozilla } sera delite in 7 dies.
inactiveAccountSecondWarning-account-description-v2 = Tu { -product-mozilla-account } es usate pro acceder productos gratuite pro confidentialitate e navigation como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay }, e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Tu conto e tu datos personal sera permanentemente delite le <strong>{ $deletionDate }</strong> perque tu non ha essite active.
inactiveAccountSecondWarning-action = Accede pro mantener tu conto
inactiveAccountSecondWarning-preview = Accede pro mantener tu conto
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Accede pro mantener tu conto:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Tu ha terminate le codices de authentication de reserva!
codes-reminder-title-one = Tu es a tu ultime codice de authentication de reserva
codes-reminder-title-two = Tempore pro crear altere codices de authentication de reserva
codes-reminder-description-part-one = Le codices de authentication de reserva te adjuta a restaurar tu informationes quando tu oblida tu contrasigno.
codes-reminder-description-part-two = Crea nove codices ora, assi tu non perde tu datos plus tarde.
codes-reminder-description-two-left = Tu ha solo duo codices restate.
codes-reminder-description-create-codes = Crea nove codices de authentication de reserva pro adjutar te a re-acceder in tu conto si tu ha perdite le accesso.
lowRecoveryCodes-action-2 = Crear codices
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nulle codices de authentication de reserva restate
        [one] Solo 1 codice de authentication de reserva restate
       *[other] Solo { $numberRemaining } codices de authentication de reserva restate!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nove accesso a { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nove accesso a tu { -product-mozilla-account }
newDeviceLogin-title-3 = Tu { -product-mozilla-account } era usate pro acceder
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Non tu? <a data-l10n-name="passwordChangeLink">Cambia tu contrasigno</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Non tu? Cambia tu contrasigno:
newDeviceLogin-action = Gerer le conto
passwordChanged-subject = Contrasigno actualisate
passwordChanged-title = Contrasigno cambiate correctemente
passwordChanged-description-2 = Tu contrasigno de { -product-mozilla-account } ha essite cambiate con successo cambiate ab le sequente apparato:
passwordChangeRequired-subject = Activitate suspecte detegite
passwordChangeRequired-preview = Cambia tu contrasigno immediatemente
passwordChangeRequired-title-2 = Reinitialisa tu contrasigno
passwordChangeRequired-suspicious-activity-3 = Nos blocava tu conto pro mantener lo secur de activitate suspecte. Tu ha essite disconnectite de tote tu apparatos e qualcunque dato synchronisate ha essite delite como precaution.
passwordChangeRequired-sign-in-3 = Pro re-acceder a tu conto, tote lo que tu debe facer es reinitialisar tu contrasigno.
passwordChangeRequired-different-password-2 = <b>Importante:</b> Elige un contrasigno complexe que es differente de un que tu ha usate in le passato.
passwordChangeRequired-different-password-plaintext-2 = Importante: Elige un contrasigno complexe que es differente de un que tu ha usate in le passato.
passwordChangeRequired-action = Reinitialisar le contrasigno
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Usa { $code } pro modificar tu contrasigno
password-forgot-otp-preview = Iste codice expira in 10 minutas
password-forgot-otp-title = Contrasigno oblidate?
password-forgot-otp-request = Nos recipeva un requesta pro un cambio de contrasigno sur tu { -product-mozilla-account } ab:
password-forgot-otp-code-2 = Si isto era tu, ecce tu codice de confirmation pro continuar:
password-forgot-otp-expiry-notice = Iste codice expira in 10 minutas.
passwordReset-subject-2 = Tu contrasigno ha essite remontate
passwordReset-title-2 = Tu contrasigno ha essite remontate
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Tu remontava tu contrasigno pro { -product-mozilla-account } sur:
passwordResetAccountRecovery-subject-2 = Tu contrasigno ha essite remontate
passwordResetAccountRecovery-title-3 = Tu contrasigno ha essite remontate
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Tu usava tu clave recuperation del conto pro remontar tu contrasigno pro { -product-mozilla-account } sur:
passwordResetAccountRecovery-information = Nos te disconnecteva de tote le tu apparatos synchronisate. Nos creava un nove clave recuperation del conto pro reimplaciar le sol que tu usava. Tu pote cambiar lo in parametros de tu conto.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Nos te disconnecteva de tote le tu apparatos synchronisate. Nos creava un nove clave recuperation del conto pro reimplaciar le sol que tu usava. Tu pote cambiar lo in parametros de tu conto:
passwordResetAccountRecovery-action-4 = Gerer le conto
passwordResetRecoveryPhone-subject = Telephono de recuperation usate
passwordResetRecoveryPhone-preview = Verifica que iste era tu
passwordResetRecoveryPhone-title = Tu telephono de recuperation era usate pro confirmar un reinitialisation de contrasigno
passwordResetRecoveryPhone-device = Telephono de recuperation usate per:
passwordResetRecoveryPhone-action = Gerer le conto
passwordResetWithRecoveryKeyPrompt-subject = Tu contrasigno ha essite remontate
passwordResetWithRecoveryKeyPrompt-title = Tu contrasigno ha essite remontate
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Tu remontava tu contrasigno pro { -product-mozilla-account } sur:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Crear clave de recuperation del conto
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Crear clave de recuperation del conto:
passwordResetWithRecoveryKeyPrompt-cta-description = Tu debera acceder de novo sur tote tu apparatos synchronisate. Mantene tu datos secur le proxime vice con un clave recuperation del conto. Isto te permitte de recuperar tu datos si tu oblida tu contrasigno.
postAddAccountRecovery-subject-3 = Nove clave de recuperation del conto create
postAddAccountRecovery-title2 = Tu ha create un nove clave de recuperation del conto
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Reserva iste clave in un loco secur, illo te besoniara pro restaurar tu datos de navigation cryptate si tu oblida tu contrasigno.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Iste es un clave a uso singule. Post que tu lo usara, nos automaticamente creara pro te un nove clave. O tu pote crear quandocunque uno nove per le parametros de tu conto.
postAddAccountRecovery-action = Gerer le conto
postAddLinkedAccount-subject-2 = Nove conto ligate a tu { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Tu conto { $providerName } ha essite ligate a tu { -product-mozilla-account }
postAddLinkedAccount-action = Gerer le conto
postAddRecoveryPhone-subject = Telephono de recuperation addite
postAddRecoveryPhone-preview = Conto protegite per authentication a duo passos
postAddRecoveryPhone-title-v2 = Tu addeva un numero de telephono de recuperation
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Tu ha addite { $maskedLastFourPhoneNumber } como tu numero de telephono de recuperation
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Como isto protege tu conto
postAddRecoveryPhone-how-protect-plaintext = Como isto protege tu conto:
postAddRecoveryPhone-enabled-device = Tu lo activava ab:
postAddRecoveryPhone-action = Gerer le conto
postAddTwoStepAuthentication-preview = Tu conto es protecte
postAddTwoStepAuthentication-subject-v3 = Le authentication a duo passos es active
postAddTwoStepAuthentication-title-2 = Tu activava le authentication a duo passos
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Tu lo ha requirite ab:
postAddTwoStepAuthentication-action = Gerer le conto
postAddTwoStepAuthentication-code-required-v4 = Le codices de securitate ab tu application de authentication es ora requirite a cata apertura de session.
postAddTwoStepAuthentication-recovery-method-codes = Tu alsi addeva codices de authentication de reserva como tu methodo de recuperation.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Tu alsi addeva { $maskedPhoneNumber } como tu numero de telephono de recuperation.
postAddTwoStepAuthentication-how-protects-link = Como isto protege tu conto
postAddTwoStepAuthentication-how-protects-plaintext = Como isto protege tu conto:
postAddTwoStepAuthentication-device-sign-out-message = Pro proteger tote tu apparatos connexe, tu deberea disconnecter te ubique tu usa iste conto, e pois reconnecter te per authentication a duo passos.
postChangeAccountRecovery-subject = Clave de recuperation del conto cambiate
postChangeAccountRecovery-title = Tu cambiava tu clave de recuperation del conto
postChangeAccountRecovery-body-part1 = Tu ora ha un nove clave de recuperation del conto.Tu clave precedente era delite.
postChangeAccountRecovery-body-part2 = Reserva iste nove clave in un loco secur, illo te besoniara pro restaurar tu datos de navigation cryptate si tu oblida tu contrasigno.
postChangeAccountRecovery-action = Gerer le conto
postChangePrimary-subject = E-mail primari actualisate
postChangePrimary-title = Nove e-mail primari
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Tu ha correctemente cambiate tu adresse de e-mail primari a { $email }. Iste adresse es ora tu nomine de usator pro aperir session a tu { -product-mozilla-account }, e pro reciper notificationes de securitate e confirmationes de accesso.
postChangePrimary-action = Gerer le conto
postChangeRecoveryPhone-subject = Telephono de recuperation actualisate
postChangeRecoveryPhone-preview = Conto protegite per authentication a duo passos
postChangeRecoveryPhone-title = Tu cambiava tu telephono de recuperation
postChangeRecoveryPhone-description =
    Tu ora ha un nove numero de telephono de recuperation.
    Tu previe numero de telephono ha essite delite.
postChangeRecoveryPhone-requested-device = Tu ha requirite illo ab:
postChangeTwoStepAuthentication-preview = Tu conto es protegite
postChangeTwoStepAuthentication-subject = Authentication a duo passos actualisate
postChangeTwoStepAuthentication-title = Le authentication a duo passos ha essite actualisate
postChangeTwoStepAuthentication-use-new-account = Tu ora debe usar le nove entrata de { -product-mozilla-account } in tu application de authentication. Lo plus vetere non plus functionara e tu pote remover lo.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Tu lo ha requirite ab:
postChangeTwoStepAuthentication-action = Gerer le conto
postChangeTwoStepAuthentication-how-protects-link = Como isto protege tu conto
postChangeTwoStepAuthentication-how-protects-plaintext = Como isto protege tu conto:
postChangeTwoStepAuthentication-device-sign-out-message = Pro proteger tote tu apparatos connexe, tu deberea disconnecter te ubique tu usa iste conto, e pois reconnecter te per tu nove authentication a duo passos.
postConsumeRecoveryCode-title-3 = Tu codice de authentication de reserva era usate pro confirmar un redefinition de contrasigno
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Codice usate ab:
postConsumeRecoveryCode-action = Gerer le conto
postConsumeRecoveryCode-subject-v3 = Codice de authentication de salvamento usate
postConsumeRecoveryCode-preview = Verificar que iste era tu
postNewRecoveryCodes-subject-2 = Nove codice authentication de reserva create
postNewRecoveryCodes-title-2 = Tu ha create nove codices authentication de reserva
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Illos era create sur:
postNewRecoveryCodes-action = Gerer le conto
postRemoveAccountRecovery-subject-2 = Clave recuperation del conto delite
postRemoveAccountRecovery-title-3 = Tu ha delite tu clave recuperation del conto
postRemoveAccountRecovery-body-part1 = Tu clave de recuperation del conto es necessari pro restaurar tu datos de navigation cryptate si tu oblida tu contrasigno.
postRemoveAccountRecovery-body-part2 = Si tu jam non lo habeva, crea un nove clave de recuperation del conto in le parametro de tu conto, pro impedir de perder tu contrasignos, marcapaginas, chronologia de navigation, e altero ancora reservate.
postRemoveAccountRecovery-action = Gerer le conto
postRemoveRecoveryPhone-subject = Numero de telephono de recuperation removite
postRemoveRecoveryPhone-preview = Conto protegite per authentication a duo passos
postRemoveRecoveryPhone-title = Telephono de recuperation removite
postRemoveRecoveryPhone-description-v2 = Tu numero de telephono de recuperation ha essite removite ab le parametros de tu authentication a duo passos.
postRemoveRecoveryPhone-description-extra = Tu ancora pote usar tu codices de authentication de reserva pro aperir session si tu non pote usar tu app de authentication.
postRemoveRecoveryPhone-requested-device = Tu ha requirite illo ab:
postRemoveSecondary-subject = E-mail secundari removite
postRemoveSecondary-title = E-mail secundari removite
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Tu ha removite con successo { $secondaryEmail }, como email secundari, de tu { -product-mozilla-account }. Le notificationes de securitate e le confirmationes de authentication non sera plus livrate a iste adresse.
postRemoveSecondary-action = Gerer le conto
postRemoveTwoStepAuthentication-subject-line-2 = Le authentication a duo passos es disactivate
postRemoveTwoStepAuthentication-title-2 = Tu disactivava le authentication a duo passos
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Tu lo disactivava de:
postRemoveTwoStepAuthentication-action = Gerer le conto
postRemoveTwoStepAuthentication-not-required-2 = Tu non plus besonia codices de securitate de tu app de authentication quando aperi session
postSigninRecoveryCode-subject = Codice de authentication de salvamento usate pro acceder
postSigninRecoveryCode-preview = Confirmar activitate del conto
postSigninRecoveryCode-title = Tu codice de authentication de salvamento era usate pro acceder
postSigninRecoveryCode-description = Si tu non lo face, tu debe cambiar tu contrasigno immediatemente pro mantener tu conto secur.
postSigninRecoveryCode-device = Tu accedeva ab:
postSigninRecoveryCode-action = Gerer conto
postSigninRecoveryPhone-subject = Numero de telephono de recuperation usate pro aperir session
postSigninRecoveryPhone-preview = Confirma le activitate del conto
postSigninRecoveryPhone-title = Tu numero de telephono de recuperation era usate pro aperir session
postSigninRecoveryPhone-description = Si tu non lo face, tu debe cambiar tu contrasigno immediatemente pro mantener tu conto secur.
postSigninRecoveryPhone-device = Tu accedeva ab:
postSigninRecoveryPhone-action = Gerer conto
postVerify-sub-title-3 = Nos es delectate de vider te!
postVerify-title-2 = Vole tu vider le mesme scheda sur duo apparatos?
postVerify-description-2 = Il es facile! Solo installa { -brand-firefox } sur un altere apparato e aperi session pro synchronisar. Illo es como magic!
postVerify-sub-description = (Psst… Illo alsi significa que tu pote installar tu marcapaginas, contrasignos, e altere datos de { -brand-firefox } ubique tu ha accedite.)
postVerify-subject-4 = Benvenite a { -brand-mozilla }!
postVerify-setup-2 = Connecter un altere apparato:
postVerify-action-2 = Connecter un altere apparato
postVerifySecondary-subject = Adresse de e-mail secundari addite
postVerifySecondary-title = Adresse de e-mail secundari addite
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Tu ha confirmate con successo { $secondaryEmail } como email secundari pro tu { -product-mozilla-account }. Notificationes de securitate e confirmationes de authentication ora essera livrate a ambe adresses email.
postVerifySecondary-action = Gerer le conto
recovery-subject = Reinitialisa tu contrasigno
recovery-title-2 = Contrasigno oblidate?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Nos recipeva un requesta pro un cambio de contrasigno sur tu { -product-mozilla-account } ab:
recovery-new-password-button = Crea un nove contrasigno cliccante le button infra. Iste ligamine expirara in le proxime hora.
recovery-copy-paste = Crea un nove contrasigno copiante e collante le URL infra in tu navigator. Iste ligamine expirara in le proxime hora.
recovery-action = Crear le nove contrasigno
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Tu abonamento a { $productName } ha essite cancellate
subscriptionAccountDeletion-title = Nos displace que tu vade
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Tu ha delite recentemente tu conto { -product-mozilla-account }. In consequentia, nos ha cancellate tu subscription a { $productName }. Tu pagamento final de { $invoiceTotal } ha essite pagate le { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Benvenite in { $productName }: configura tu contrasigno.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Benvenite a { $productName }.
subscriptionAccountFinishSetup-content-processing = Tu pagamento es in execution e pote prender usque quatro dies laborative pro completar se. Tu abonamento sera renovate automaticamente cata termino de facturation usque tu non seligera de lo cancellar.
subscriptionAccountFinishSetup-content-create-3 = Postea, tu creara un contrasigno de { -product-mozilla-account } pro initiar usar tu nove abonamento.
subscriptionAccountFinishSetup-action-2 = Comenciar
subscriptionAccountReminderFirst-subject = Memento: fini le preparation de tu conto
subscriptionAccountReminderFirst-title = Tu non pote ancora acceder a tu subscription
subscriptionAccountReminderFirst-content-info-3 = Alcun dies retro tu ha create un { -product-mozilla-account }, ma tu non lo ha ancora confirmate. Nos spera que tu finira le configuration de tu conto, assi que tu pote usar tu nove abonamento.
subscriptionAccountReminderFirst-content-select-2 = Elige “Crear contrasigno” pro configurar un nove contrasigno e finir de confirmar tu conto.
subscriptionAccountReminderFirst-action = Crear contrasigno
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Memento final: configura tu conto
subscriptionAccountReminderSecond-title-2 = Benvenite a { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Alcun dies retro tu ha create un { -product-mozilla-account }, ma tu non lo ha ancora confirmate. Nos spera que tu finira le configuration de tu conto, assi que tu pote usar tu nove abonamento.
subscriptionAccountReminderSecond-content-select-2 = Elige “Crear contrasigno” pro configurar un nove contrasigno e finir de confirmar tu conto.
subscriptionAccountReminderSecond-action = Crear contrasigno
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Tu abonamento a { $productName } ha essite cancellate
subscriptionCancellation-title = Nos displace que tu vade

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Nos ha cancellate tu abonamento a { $productName }. Tu pagamento final de { $invoiceTotal } era pagate le { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Nos ha cancellate tu abonamento a { $productName }. Tu pagamento final de { $invoiceTotal } sera pagate le { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Tu servicio continuara usque le fin de tu periodo de facturation currente, que es { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Tu ha passate a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Tu ha passate con successo ab { $productNameOld } a { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A comenciar con tu proxime factura, tu amonta cambiara de { $paymentAmountOld } per { $productPaymentCycleOld } a { $paymentAmountNew } per { $productPaymentCycleNew }. In ille tempore te sera date un credito una tantum de { $paymentProrated } pro reflecter le inferior amonta pro le resto de iste { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Si il habera nove software pro te a installar pro usar { $productName }, tu recipera un email separate con instructiones pro discargamentos.
subscriptionDowngrade-content-auto-renew = Tu subscription sera renovate automaticamente cata termino de facturation usque tu non seligera de cancellar lo.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Tu abonamento a { $productName } ha essite cancellate
subscriptionFailedPaymentsCancellation-title = Tu abonamento ha essite cancellate
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Nos ha cancellate tu subscription a { $productName } per plure tentativas de pagamento fallite. Pro de novo obtener accesso, initia un nove subscription con un methodo de pagamento actualisate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pagamento de { $productName } confirmate
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Gratias pro tu subscription a { $productName } !
subscriptionFirstInvoice-content-processing = Tu pagamento es actualmente in processo e pote prender usque quatro dies de negotios pro completar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Tu recipera un separate email re como initiar a usar { $productName }
subscriptionFirstInvoice-content-auto-renew = Tu subscription sera renovate automaticamente cata termino de facturation usque tu non seligera de cancellar lo.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Tu proxime factura sera emittite le { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Le methodo de pagamento pro { $productName } expirava o tosto va expirar
subscriptionPaymentExpired-title-2 = Tu methodo de pagamento expirava o va expirar
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Le methodo de pagamento que tu usa pro facer pagamentos pro { $productName } expirava o tosto va expirar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Pagamento de { $productName } fallite
subscriptionPaymentFailed-title = Desolate, nos ha problemas con tu pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Nos ha habite problemas con tu ultime pagamento pro { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Forsan tu methodo de pagamento ha expirate o tu actual methodo de pagamento non es actualisate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Actualisation obligatori del informationes de pagamento pro { $productName }
subscriptionPaymentProviderCancelled-title = Desolate, nos ha problemas con tu methodo de pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Nos ha revelate un problemas con tu methodo de pagamento pro { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Forsan tu methodo de pagamento ha expirate o tu actual methodo de pagamento non es actualisate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Subscription a { $productName } reactivate
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Gratias pro le reactivation de tu subscription a { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Tu amonta successive sera { $invoiceTotal } le { $nextInvoiceDateOnly }. Tu amonta successive sera { $invoiceTotal } le { $nextInvoiceDateOnly }. Tu abonamento sera renovate automaticamente cata termino de facturation usque tu non seligera de cancellar lo.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Aviso de renovation automatic de { $productName }
subscriptionRenewalReminder-title = Tu abonamento sera renovate tosto
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Car cliente de { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Tu actual abonamento es predefinite pro automaticamente renovar se in { $reminderLength } dies. In ille tempore, { -brand-mozilla } renovara tu abonamento a { $planIntervalCount } { $planInterval } e un carga de { $invoiceTotal } sera applicate al methodo de pagamento sur tu conto.
subscriptionRenewalReminder-content-closing = Sincermente,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Le equipa de { $productName }
subscriptionReplaced-subject = Tu abonamento ha essite actualisate como parte de tu promotion
subscriptionReplaced-title = Tu abonamento ha essite actualisate
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Tu abonamento individual a { $productName } ha essite substituite e ora es includite in tu nove pacchetto.
subscriptionReplaced-content-credit = Tu recipera un credito pro ulle periodo non usate de tu previe abonamento. Iste credito sera automaticamente applicate a tu conto e usate pro debitos futur.
subscriptionReplaced-content-no-action = Nulle action es necessari de parte tue.
subscriptionsPaymentExpired-subject-2 = Le methodo de pagamento pro tu abonamentos expirava o tosto va expirar
subscriptionsPaymentExpired-title-2 = Tu methodo de pagamento expirava o va expirar
subscriptionsPaymentExpired-content-2 = Le methodo de pagamento que tu usa pro facer pagamentos pro le sequente abonamentos expirava o va tosto expirar.
subscriptionsPaymentProviderCancelled-subject = Actualisation obligatori del informationes de pagamento pro le subscriptiones de { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Desolate, nos ha problemas con tu methodo de pagamento
subscriptionsPaymentProviderCancelled-content-detected = Nos ha revelate un problemas con tu methodo de pagamento pro le sequente subscriptiones.
subscriptionsPaymentProviderCancelled-content-payment-1 = Forsan tu methodo de pagamento ha expirate o tu actual methodo de pagamento non es actualisate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Pagamento de { $productName } recepite
subscriptionSubsequentInvoice-title = Gratias pro esser un abonato!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Le ultime pagamento pro { $productName } ha essite recipite.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Tu proxime factura sera emittite le { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Tu ha promovite a { $productName }.
subscriptionUpgrade-title = Gratias pro tu promotion!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Tu era con successo promovite a { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Te ha essite cargate un onere de un-vice de { $invoiceAmountDue } pro reflecter tu precio de abonamento superior pro le resto de iste termino de facturation ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Tu ha recipite un accreditation de conto in le amonta de { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Comenciante con tu proxime factura, le precio de tu abonamento cambiara.
subscriptionUpgrade-content-old-price-day = Le previe rata era { $paymentAmountOld } per die.
subscriptionUpgrade-content-old-price-week = Le previe rata era { $paymentAmountOld } per septimana.
subscriptionUpgrade-content-old-price-month = Le previe rata era { $paymentAmountOld } per mense.
subscriptionUpgrade-content-old-price-halfyear = Le previe rata era { $paymentAmountOld } per sex menses.
subscriptionUpgrade-content-old-price-year = Le previe rata era { $paymentAmountOld } per anno.
subscriptionUpgrade-content-old-price-default = Le previe rata era { $paymentAmountOld } per intervallo de facturation.
subscriptionUpgrade-content-old-price-day-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per die.
subscriptionUpgrade-content-old-price-week-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per septimana.
subscriptionUpgrade-content-old-price-month-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per mense.
subscriptionUpgrade-content-old-price-halfyear-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per sex menses.
subscriptionUpgrade-content-old-price-year-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per anno.
subscriptionUpgrade-content-old-price-default-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per intervallo de facturation.
subscriptionUpgrade-content-new-price-day = Desde ora, tu sera cargate { $paymentAmountNew } per die, salvo discontos.
subscriptionUpgrade-content-new-price-week = Desde ora, tu sera cargate { $paymentAmountNew } per septimana, salvo discontos.
subscriptionUpgrade-content-new-price-month = Desde ora, tu sera cargate { $paymentAmountNew } per mense, salvo discontos.
subscriptionUpgrade-content-new-price-halfyear = Desde ora, tu sera cargate { $paymentAmountNew } per sex menses, salvo discontos.
subscriptionUpgrade-content-new-price-year = Desde ora, tu sera cargate { $paymentAmountNew } per anno, salvo discontos.
subscriptionUpgrade-content-new-price-default = Desde ora, tu sera cargate { $paymentAmountNew } per intervallo de facturation, salvo discontos.
subscriptionUpgrade-content-new-price-day-dtax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per die, salvo discontos.
subscriptionUpgrade-content-new-price-week-tax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per septimana, salvo discontos.
subscriptionUpgrade-content-new-price-month-tax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per per mense, salvo discontos.
subscriptionUpgrade-content-new-price-halfyear-tax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per per sex menses, salvo discontos.
subscriptionUpgrade-content-new-price-year-tax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per anno, salvo discontos.
subscriptionUpgrade-content-new-price-default-tax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per intervallo de facturation, salvo discontos.
subscriptionUpgrade-existing = Si il ha alcun imbrication de tu abonamentos existente con iste promotion, nos los tractara e te inviara un email separate con le detalios. Si tu nove plano include productos que require installation, nos te inviara un email separate con le instructiones de installation.
subscriptionUpgrade-auto-renew = Tu subscription sera renovate automaticamente cata termino de facturation usque tu non seligera de cancellar lo.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Usa { $unblockCode } pro aperir session
unblockCode-preview = Iste codice expira in un hora
unblockCode-title = Es tu qui aperi session?
unblockCode-prompt = In tal caso, ecce le codice de autorisation que tu require:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Si si, ecce le codice de autorisation que te besonia: { $unblockCode }
unblockCode-report = Si non, adjuta nos a parar le intrusos e <a data-l10n-name="reportSignInLink">reporta lo a nos</a>.
unblockCode-report-plaintext = Si non, adjuta nos a parar le intrusos e reporta lo a nos.
verificationReminderFinal-subject = Memento final pro confirmar tu conto
verificationReminderFinal-description-2 = Un par de septimanas retro tu ha create un { -product-mozilla-account }, ma jammais lo ha confirmate. Pro tu securitate, nos delera le conto si non verificate in le proxime 24 horas.
confirm-account = Confirmar conto
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Rememora pro confirmar tu conto
verificationReminderFirst-title-3 = Benvenite a { -brand-mozilla }!
verificationReminderFirst-description-3 = Alcun dies retro tu ha create un { -product-mozilla-account }, ma non lo ha jammais confirmate. Confirma tu conto in le proxime 15 dies o illo essera automaticamente delite.
verificationReminderFirst-sub-description-3 = Non perde te le navigator que primo antepone te e tu confidentialitate.
confirm-email-2 = Confirmar conto
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confirmar conto
verificationReminderSecond-subject-2 = Rememora de confirmar tu conto
verificationReminderSecond-title-3 = Non te lassa escappar { -brand-mozilla }!
verificationReminderSecond-description-4 = Alcun dies retro tu creava un { -product-mozilla-account }, ma non lo ha jammais confirmate. Confirma tu conto in le proxime 10 dies o illo essera automaticamente delite.
verificationReminderSecond-second-description-3 = Tu { -product-mozilla-account } te permitte de synchronisar tu experientia con { -brand-firefox } inter apparatos e disblocar le accesso a altere productos de protection del confidentialitate de { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Contribue a nostre mission pro transformar internet in un placia aperte pro totes.
verificationReminderSecond-action-2 = Confirmar conto
verify-title-3 = Aperi internet con { -brand-mozilla }
verify-description-2 = Confirma tu conto e tira le maximo de { -brand-mozilla } ubicunque tu aperi session, a comenciar per:
verify-subject = Termina le creation de tu conto
verify-action-2 = Confirmar conto
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Usa { $code } pro modificar tu conto
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Le codice expira in { $expirationTime } minuta.
       *[other] Le codice expira in { $expirationTime } minutas.
    }
verifyAccountChange-title = Es tu qui modifica le informationes de tu conto?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Adjuta nos a mantener tu conto secur approbante iste modification sur:
verifyAccountChange-prompt = Si affirmative, ecce tu codice de autorisation:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Illo expira in { $expirationTime } minuta.
       *[other] Illo expira in { $expirationTime } minutas.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Habeva tu accedite a { $clientName }?
verifyLogin-description-2 = Adjuta nos a mantener tu conto secur confirmante que tu accedeva a illo:
verifyLogin-subject-2 = Confirmar accesso
verifyLogin-action = Confirmar apertura de session
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Usa { $code } pro aperir session
verifyLoginCode-preview = Iste codice expira in 5 minutas.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Habeva tu accedite a { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Adjuta nos a mantener tu conto secur approbante tu accesso a illo:
verifyLoginCode-prompt-3 = Si si, ecce tu codice de autorisation:
verifyLoginCode-expiry-notice = Illo expira in 5 minutas.
verifyPrimary-title-2 = Confirmar email primari
verifyPrimary-description = Requesta de modificar le conto per le sequente apparato:
verifyPrimary-subject = Confirmar e-mail primari
verifyPrimary-action-2 = Confirmar email
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Post le confirmation sera possibile per le apparato le cambios del conto, como adder le email secundari.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Usa { $code } pro confirmar tu email secundari
verifySecondaryCode-preview = Iste codice expira in 5 minutas.
verifySecondaryCode-title-2 = Confirmar email secundari
verifySecondaryCode-action-2 = Confirmar email
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Un requesta de usar { $email } como adresse email secundari ha essite facite ab le sequente { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Usa iste codice de confirmation:
verifySecondaryCode-expiry-notice-2 = Illo expira in 5 minutas. Un vice confirmate, iste adresse comenciara a reciper notificationes e confirmationes de securitate.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Usa { $code } pro confirmar tu conto
verifyShortCode-preview-2 = Iste codice expira in 5 minutas
verifyShortCode-title-3 = Aperi internet con { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirma tu conto e tira le maximo de { -brand-mozilla } ubicunque tu aperi session, a comenciar per:
verifyShortCode-prompt-3 = Usa iste codice de confirmation:
verifyShortCode-expiry-notice = Illo expira in 5 minutas.
