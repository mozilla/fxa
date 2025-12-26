## Non-email strings

session-verify-send-push-body-2 = Feu clic aquí per confirmar la vostra identitat

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sincronitza dispositius">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositius">
fxa-privacy-url = Política de privadesa de { -brand-mozilla }
subplat-automated-email = Aquest és un missatge automàtic; si l’heu rebut per error, no cal que feu res.
subplat-privacy-notice = Avís de privadesa
subplat-privacy-plaintext = Avís de privadesa:
subplat-update-billing-plaintext = { subplat-update-billing }:
subplat-terms-policy = Condicions d'ús i política de cancel·lació
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Cancel·la la subscripció
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactiva la subscripció
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Actualitza la informació de facturació
subplat-privacy-policy = Política de privadesa de { -brand-mozilla }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-legal = Avisos legals
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privadesa
subplat-privacy-website-plaintext = { subplat-privacy }:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Baixeu el { $productName } del { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Baixeu el { $productName } de l\'{ -app-store }">
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Per a més informació, visiteu l’<a data-l10n-name="supportLink">Assistència de { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Aquest és un correu automàtic. Si l’heu rebut per error, no cal que feu fer res.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Aquest és un correu automàtic; si no heu autoritzat aquesta acció, canvieu la contrasenya:
automated-email-reset =
    Aquest és un missatge automàtic. Si no heu autoritzat aquesta acció, <a data-l10n-name="resetLink">reinicieu la contrasenya</a>.
    Per a més informació, vegeu l'<a data-l10n-name="supportLink">assistència de { -brand-mozilla }</a>.
cancellationSurvey = Ajudeu-nos a millorar els nostres serveis fent aquesta <a data-l10n-name="cancellationSurveyUrl">breu enquesta</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ajudeu-nos a millorar els nostres serveis fent aquesta breu enquesta:
change-password-plaintext = Si sospiteu que algú està provant d’accedir al vostre compte, canvieu la contrasenya.
manage-account = Gestiona el compte
manage-account-plaintext = { manage-account }:
payment-details = Detalls de pagament:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Número de factura: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Cobrat: { $invoiceTotal } el { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Propera factura: { $nextInvoiceDateOnly }

##

subscriptionSupport = Teniu dutes sobre la subscripció? L’<a data-l10n-name="subscriptionSupportUrl">equip d’assistència</a> és aquí per a ajudar-vos.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Teniu dubtes sobre la vostra subscripció? El nostre equip de suport és aquí per ajudar-vos:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Gràcies per subscriure-us al { $productName }. Si teniu qualsevol dubte o us cal més informació sobre el { $productName }, <a data-l10n-name="subscriptionSupportUrl">contacteu amb nosaltres</a>.
cadReminderFirst-action = Sincronitza un altre dispositiu
downloadSubscription-link-action-2 = Primers passos
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Inici de sessió nou al { $clientName }
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = No recordeu haver-ho fet? Canvieu la contrasenya:
newDeviceLogin-action = Gestiona el compte
passwordChanged-subject = S'ha actualitzat la contrasenya
passwordChanged-title = La contrasenya s’ha canviat correctament
postAddAccountRecovery-action = Gestiona el compte
postAddTwoStepAuthentication-action = Gestiona el compte
postChangePrimary-title = Adreça electrònica principal nova
postChangePrimary-action = Gestiona el compte
postConsumeRecoveryCode-action = Gestiona el compte
postNewRecoveryCodes-action = Gestiona el compte
postRemoveAccountRecovery-action = Gestiona el compte
postRemoveSecondary-subject = S’ha eliminat l‘adreça electrònica secundària
postRemoveSecondary-title = S’ha eliminat l‘adreça electrònica secundària
postRemoveSecondary-action = Gestiona el compte
postRemoveTwoStepAuthentication-action = Gestiona el compte
postVerifySecondary-subject = S’ha afegit l‘adreça electrònica secundària
postVerifySecondary-title = S’ha afegit l‘adreça electrònica secundària
postVerifySecondary-action = Gestiona el compte
recovery-subject = Reinicia la contrasenya
recovery-action = Crea una nova contrasenya

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

unblockCode-title = Esteu iniciant la sessió?
unblockCode-prompt = Si és així, aquest és el codi d’autorització que necessiteu:
unblockCode-report-plaintext = Si no és així, ajudeu-nos a rebutjar intrusos i envieu un informe.
verifyLogin-action = Confirmeu l’inici de la sessió
verifyLoginCode-expiry-notice = Caduca d’aquí a 5 minuts.
verifyPrimary-description = S’ha sol·licitat un canvi de compte des del següent dispositiu:
verifyShortCode-expiry-notice = Caduca d’aquí a 5 minuts.
