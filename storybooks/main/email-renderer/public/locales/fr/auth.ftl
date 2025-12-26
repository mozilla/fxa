## Non-email strings

session-verify-send-push-title-2 = Connexion à votre { -product-mozilla-account } ?
session-verify-send-push-body-2 = Cliquez ici pour confirmer qu’il s’agit bien de vous
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } est votre code de vérification { -brand-mozilla }. Expire dans 5 minutes.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Code de vérification de { -brand-mozilla } : { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } est votre code de récupération { -brand-mozilla }. Expire dans 5 minutes.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Code { -brand-mozilla } : { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } est votre code de récupération { -brand-mozilla }. Expire dans 5 minutes.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Code { -brand-mozilla } : { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logo { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synchroniser les appareils">
body-devices-image = <img data-l10n-name="devices-image" alt="Appareils">
fxa-privacy-url = Politique de confidentialité de { -brand-mozilla }
moz-accounts-privacy-url-2 = Politique de confidentialité des { -product-mozilla-accounts }
moz-accounts-terms-url = Conditions d’utilisation des { -product-mozilla-accounts }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo { -brand-mozilla }">
subplat-automated-email = Ceci est un message automatique ; si vous l’avez reçu par erreur, vous n’avez rien à faire.
subplat-privacy-notice = Politique de confidentialité
subplat-privacy-plaintext = Politique de confidentialité :
subplat-update-billing-plaintext = { subplat-update-billing } :
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Vous recevez ce message car { $email } possède un { -product-mozilla-account } et vous avez souscrit un abonnement à { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Vous recevez ce message, car { $email } possède un { -product-mozilla-account }.
subplat-explainer-multiple-2 = Vous recevez ce message car { $email } possède un { -product-mozilla-account } et vous avez souscrit plusieurs abonnements.
subplat-explainer-was-deleted-2 = Vous recevez ce message car l’adresse { $email } a été utilisée pour créer un { -product-mozilla-account }.
subplat-manage-account-2 = Gérez votre { -product-mozilla-account } en visitant <a data-l10n-name="subplat-account-page">la page de votre compte</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Gérez les paramètres de votre { -product-mozilla-account } en vous rendant sur la page de votre compte : { $accountSettingsUrl }
subplat-terms-policy = Conditions et politique d’annulation
subplat-terms-policy-plaintext = { subplat-terms-policy } :
subplat-cancel = Annuler l’abonnement
subplat-cancel-plaintext = { subplat-cancel } :
subplat-reactivate = Réactiver l’abonnement
subplat-reactivate-plaintext = { subplat-reactivate } :
subplat-update-billing = Mettre à jour les informations de facturation
subplat-privacy-policy = Politique de confidentialité de { -brand-mozilla }
subplat-privacy-policy-2 = Politique de confidentialité des { -product-mozilla-accounts }
subplat-privacy-policy-plaintext = { subplat-privacy-policy } :
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 } :
subplat-moz-terms = Conditions d’utilisation des { -product-mozilla-accounts }
subplat-moz-terms-plaintext = { subplat-moz-terms } :
subplat-legal = Mentions légales
subplat-legal-plaintext = { subplat-legal } :
subplat-privacy = Vie privée
subplat-privacy-website-plaintext = { subplat-privacy } :
account-deletion-info-block-communications = Si votre compte est supprimé, vous continuerez à recevoir des e-mails de Mozilla Corporation et de la Fondation Mozilla, sauf si vous <a data-l10n-name="unsubscribeLink">demandez votre désinscription</a>.
account-deletion-info-block-support = Si vous avez des questions ou avez besoin d’aide, n’hésitez pas à contacter notre <a data-l10n-name="supportLink">équipe d’assistance</a>.
account-deletion-info-block-communications-plaintext = Si votre compte est supprimé, vous recevrez toujours des e-mails de Mozilla Corporation et de la Fondation Mozilla, sauf si vous demandez votre désinscription :
account-deletion-info-block-support-plaintext = Si vous avez des questions ou avez besoin d’aide, n’hésitez pas à contacter notre équipe d’assistance :
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Télécharger { $productName } sur { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Télécharger { $productName } sur l’{ -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installer { $productName } sur <a data-l10n-name="anotherDeviceLink">un autre ordinateur de bureau</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installer { $productName } sur <a data-l10n-name="anotherDeviceLink">un autre appareil</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Obtenez { $productName } sur Google Play :
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Téléchargez { $productName } sur l’App Store :
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installez { $productName } sur un autre appareil :
automated-email-change-2 = Si vous n’êtes pas à l’origine de cette action, <a data-l10n-name="passwordChangeLink">modifiez immédiatement votre mot de passe</a>.
automated-email-support = Pour plus d’informations, consultez <a data-l10n-name="supportLink">le site d’assistance de { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Si vous n’êtes pas à l’origine de cette action, modifiez immédiatement votre mot de passe :
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Pour plus d’informations, consultez le site d’assistance de { -brand-mozilla } :
automated-email-inactive-account = Ceci est un message automatique. Vous le recevez, car vous avez un { -product-mozilla-account } et deux ans se sont écoulés depuis votre dernière connexion.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Pour davantage d’informations, veuillez consulter <a data-l10n-name="supportLink">l’assistance de { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Ceci est un e-mail automatique. Si vous l’avez reçu par erreur, vous n’avez rien à faire.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Ceci est un message automatique ; si vous n’avez pas autorisé cette action, veuillez changer votre mot de passe.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Cette requête provient de { $uaBrowser } sous { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Cette requête provient de { $uaBrowser } sous { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Cette requête provient de { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Cette requête provient de { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Cette requête provient de { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = S’il ne s’agissait pas de vous, <a data-l10n-name="revokeAccountRecoveryLink">supprimez la nouvelle clé</a> et <a data-l10n-name="passwordChangeLink">changez votre mot de passe</a>.
automatedEmailRecoveryKey-change-pwd-only = S’il ne s’agissait pas de vous, <a data-l10n-name="passwordChangeLink">changez de mot de passe</a>.
automatedEmailRecoveryKey-more-info = Pour plus d’informations, consultez <a data-l10n-name="supportLink">le site d’assistance de { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = La requête provient de :
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = S’il ne s’agissait pas de vous, supprimez la nouvelle clé :
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = S’il ne s’agissait pas de vous, changez de mot de passe :
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = et changez votre mot de passe :
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Pour plus d’informations, consultez le site d’assistance de { -brand-mozilla } :
automated-email-reset =
    Il s’agit d’un e-mail automatisé ; si vous n’avez pas autorisé cette action, <a data-l10n-name="resetLink">veuillez changer de mot de passe</a>.
    Pour plus d’informations, veuillez consulter <a data-l10n-name="supportLink">l’assistance de { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Si vous n’avez pas autorisé cette action, veuillez réinitialiser votre mot de passe immédiatement depuis { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Si vous n’avez pas effectué cette action, alors <a data-l10n-name="resetLink">réinitialisez votre mot de passe</a> et <a data-l10n-name="twoFactorSettingsLink">réinitialisez l’authentification en deux étapes</a> immédiatement.
    Pour davantage d’informations, veuillez consulter <a data-l10n-name="supportLink">le site d’assistance de { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Si vous n’êtes pas à l’origine de cette action, réinitialisez immédiatement votre mot de passe sur :
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Réinitialisez également l’authentification en deux étapes sur :
brand-banner-message = Saviez-vous que nous avons renommé les { -product-firefox-accounts } en { -product-mozilla-accounts } ? <a data-l10n-name="learnMore">En savoir plus</a>
cancellationSurvey = Aidez-nous à améliorer nos services en répondant à <a data-l10n-name="cancellationSurveyUrl">ce court questionnaire</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Aidez-nous à améliorer nos services en répondant à ce court questionnaire :
change-password-plaintext = Si vous avez des raisons de penser que quelqu’un essaie d’accéder à votre compte, veuillez changer votre mot de passe.
manage-account = Gérer le compte
manage-account-plaintext = { manage-account } :
payment-details = Détails du paiement :
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numéro de facture : { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceTotal } facturés le { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Prochaine facture : { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Mode de paiement :</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Mode de paiement : { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Mode de paiement : { $cardName } se terminant par { $lastFour }
payment-provider-card-ending-in-plaintext = Mode de paiement : carte se terminant par { $lastFour }
payment-provider-card-ending-in = <b>Mode de paiement :</b> carte se terminant par { $lastFour }
payment-provider-card-ending-in-card-name = <b>Mode de paiement :</b> { $cardName } se terminant par { $lastFour }
subscription-charges-invoice-summary = Récapitulatif de facture

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Numéro de facture :</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Numéro de facture : { $invoiceNumber }
subscription-charges-invoice-date = <b>Date :</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Date : { $invoiceDateOnly }
subscription-charges-prorated-price = Prix au prorata
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Prix au prorata : { $remainingAmountTotal }
subscription-charges-list-price = Prix courant
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Prix courant : { $offeringPrice }
subscription-charges-credit-from-unused-time = Avoir pour le temps non utilisé
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Avoir pour le temps non utilisé : { $unusedAmountTotal }
subscription-charges-subtotal = <b>Sous-total</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Sous-total : { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Remise unique
subscription-charges-one-time-discount-plaintext = Remise unique : { $invoiceDiscountAmount }
subscription-charges-repeating-discount = Remise de { $discountDuration } mois
subscription-charges-repeating-discount-plaintext = Remise de { $discountDuration } mois : { $invoiceDiscountAmount }
subscription-charges-discount = Remise
subscription-charges-discount-plaintext = Remise : { $invoiceDiscountAmount }
subscription-charges-taxes = Taxes et frais
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Taxes et frais : { $invoiceTaxAmount }
subscription-charges-total = <b>Total</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Total : { $invoiceTotal }
subscription-charges-credit-applied = Avoir appliqué
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Avoir appliqué : { $creditApplied }
subscription-charges-amount-paid = <b>Montant payé</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Montant payé : { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Vous avez reçu un avoir de { $creditReceived }, qui sera appliqué à vos prochaines factures.

##

subscriptionSupport = Des questions sur votre abonnement ? Notre <a data-l10n-name="subscriptionSupportUrl">équipe d’assistance</a> est là pour vous aider.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Des questions sur votre abonnement ? Notre équipe d’assistance est là pour vous aider :
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Merci d’avoir souscrit à { $productName }. Si vous avez des questions sur votre abonnement ou avez besoin de plus d’informations sur { $productName }, veuillez <a data-l10n-name="subscriptionSupportUrl">nous contacter</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Merci d’avoir souscrit à { $productName }. Si vous avez des questions sur votre abonnement ou avez besoin de plus d’informations sur { $productName }, veuillez nous contacter :
subscription-support-get-help = Obtenez de l’aide pour votre abonnement
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Gérer votre abonnement</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Gérer votre abonnement :
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contacter l’assistance</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contacter l’assistance :
subscriptionUpdateBillingEnsure = Vous pouvez vous assurer que votre mode de paiement et les informations de votre compte sont à jour <a data-l10n-name="updateBillingUrl">ici</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Vous pouvez vous assurer que votre mode de paiement et les informations de votre compte sont à jour ici :
subscriptionUpdateBillingTry = Nous essaierons d’encaisser de nouveau votre paiement dans les prochains jours, mais vous devez peut-être nous aider en mettant à jour <a data-l10n-name="updateBillingUrl">vos informations de paiement</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Nous essaierons d’encaisser de nouveau votre paiement dans les prochains jours, mais vous devez peut-être nous aider en mettant à jour vos informations de paiement :
subscriptionUpdatePayment = Pour éviter toute interruption de votre service, veuillez <a data-l10n-name="updateBillingUrl">mettre à jour vos informations de paiement</a> dès que possible.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Pour éviter toute interruption de votre service, veuillez mettre à jour vos informations de paiement dès que possible :
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Pour plus d’informations, consultez <a data-l10n-name="supportLink">le site d’assistance de { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Pour plus d’informations, consultez l’assistance de { -brand-mozilla } : { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } sous { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } sous { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (approximatif)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (approximatif)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (approximatif)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (approximatif)
view-invoice-link-action = Voir la facture
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Voir la facture : { $invoiceLink }
cadReminderFirst-subject-1 = Rappel ! Procédons à la synchronisation de { -brand-firefox }
cadReminderFirst-action = Synchroniser un autre appareil
cadReminderFirst-action-plaintext = { cadReminderFirst-action } :
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Il en faut deux pour synchroniser
cadReminderFirst-description-v2 = Emportez vos onglets sur tous vos appareils. Retrouvez vos marque-pages, mots de passe et autres données partout où vous utilisez { -brand-firefox }.
cadReminderSecond-subject-2 = Ne passez pas à côté ! Terminons la configuration de votre synchronisation
cadReminderSecond-action = Synchroniser un autre appareil
cadReminderSecond-title-2 = N’oubliez pas de synchroniser !
cadReminderSecond-description-sync = Synchronisez vos marque-pages, mots de passe, onglets ouverts et plus encore — partout où vous utilisez { -brand-firefox }.
cadReminderSecond-description-plus = De plus, vos données sont toujours chiffrées. Seuls vous et les appareils que vous approuvez pouvez les consulter.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Bienvenue sur { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Bienvenue sur { $productName }
downloadSubscription-content-2 = Commençons à utiliser toutes les fonctionnalités incluses dans votre abonnement :
downloadSubscription-link-action-2 = Lancez-vous
fraudulentAccountDeletion-subject-2 = Votre { -product-mozilla-account } a été supprimé
fraudulentAccountDeletion-title = Votre compte a été supprimé
fraudulentAccountDeletion-content-part1-v2 = Récemment, un { -product-mozilla-account } a été créé et un abonnement facturé avec cette adresse e-mail. Comme nous le faisons pour tous les nouveaux comptes, nous vous demandons de confirmer votre compte en validant d’abord cette adresse e-mail.
fraudulentAccountDeletion-content-part2-v2 = Actuellement, nous constatons que le compte n’a jamais été confirmé. Étant donné que cette étape n’a pas été effectuée, nous ne savons pas s’il s’agit d’un abonnement autorisé. En conséquence, le { -product-mozilla-account } associé à cette adresse e-mail a été supprimé, votre abonnement annulé et tous les frais remboursés.
fraudulentAccountDeletion-contact = Pour toute question, veuillez contacter notre <a data-l10n-name="mozillaSupportUrl">équipe d’assistance</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Pour toute question, veuillez contacter notre équipe d’assistance : { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Dernière chance de conserver votre { -product-mozilla-account }
inactiveAccountFinalWarning-title = Votre compte { -brand-mozilla } et vos données vont être supprimés
inactiveAccountFinalWarning-preview = Connectez-vous pour conserver votre compte
inactiveAccountFinalWarning-account-description = Votre { -product-mozilla-account } sert à accéder à des produits gratuits de protection de la vie privée et de navigation tels que { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } et { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Le <strong>{ $deletionDate }</strong>, votre compte et vos données personnelles seront supprimés définitivement, sauf si vous vous connectez.
inactiveAccountFinalWarning-action = Connectez-vous pour conserver votre compte
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Connectez-vous pour conserver votre compte :
inactiveAccountFirstWarning-subject = Ne perdez pas votre compte
inactiveAccountFirstWarning-title = Voulez-vous conserver votre compte et vos données { -brand-mozilla } ?
inactiveAccountFirstWarning-account-description-v2 = Votre { -product-mozilla-account } sert à accéder à des produits gratuits de protection de la vie privée et de navigation tels que { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } et { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Nous avons remarqué que vous ne vous êtes pas connecté·e depuis deux ans.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Votre compte et vos données personnelles seront supprimés définitivement le <strong>{ $deletionDate }</strong> en raison de votre inactivité.
inactiveAccountFirstWarning-action = Connectez-vous pour conserver votre compte
inactiveAccountFirstWarning-preview = Connectez-vous pour conserver votre compte
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Connectez-vous pour conserver votre compte :
inactiveAccountSecondWarning-subject = Action requise : suppression du compte dans 7 jours
inactiveAccountSecondWarning-title = Votre compte { -brand-mozilla } et vos données seront supprimés dans 7 jours
inactiveAccountSecondWarning-account-description-v2 = Votre { -product-mozilla-account } sert à accéder à des produits gratuits de protection de la vie privée et de navigation tels que { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } et { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Votre compte et vos données personnelles seront supprimés définitivement le <strong>{ $deletionDate }</strong> en raison de votre inactivité.
inactiveAccountSecondWarning-action = Connectez-vous pour conserver votre compte
inactiveAccountSecondWarning-preview = Connectez-vous pour conserver votre compte
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Connectez-vous pour conserver votre compte :
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Vous n’avez plus aucun code d’authentification de secours !
codes-reminder-title-one = Vous utilisez votre dernier code d’authentification de secours.
codes-reminder-title-two = Le moment est venu de créer davantage de codes d’authentification de secours
codes-reminder-description-part-one = Les codes d’authentification de secours vous aident à récupérer vos informations si vous oubliez votre mot de passe.
codes-reminder-description-part-two = Créez de nouveaux codes maintenant pour ne pas perdre vos données plus tard.
codes-reminder-description-two-left = Il ne vous reste que deux codes.
codes-reminder-description-create-codes = Créez de nouveaux codes d’authentification de secours pour vous permettre de retrouver votre compte s’il est verrouillé.
lowRecoveryCodes-action-2 = Créer des codes
codes-create-plaintext = { lowRecoveryCodes-action-2 } :
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Il ne reste aucun code d’authentification de secours
        [one] Il ne reste qu’un code d’authentification de secours
       *[other] Plus que { $numberRemaining } codes d’authentification de secours !
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nouvelle connexion via { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nouvelle connexion à votre { -product-mozilla-account }
newDeviceLogin-title-3 = Votre { -product-mozilla-account } a été utilisé pour se connecter
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Il ne s’agissait pas de vous ? <a data-l10n-name="passwordChangeLink">Changez votre mot de passe</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Il ne s’agissait pas de vous ? Changez votre mot de passe :
newDeviceLogin-action = Gérer le compte
passwordChanged-subject = Mot de passe mis à jour
passwordChanged-title = Modification du mot de passe
passwordChanged-description-2 = Le mot de passe de votre { -product-mozilla-account } a été correctement changé depuis cet appareil :
passwordChangeRequired-subject = Activité suspecte détectée
passwordChangeRequired-preview = Changez votre mot de passe immédiatement
passwordChangeRequired-title-2 = Réinitialisez votre mot de passe
passwordChangeRequired-suspicious-activity-3 = Nous avons verrouillé votre compte pour le protéger des activités suspectes. Vous avez été déconnecté·e de tous vos appareils et toutes les données synchronisées ont été supprimées par mesure de précaution.
passwordChangeRequired-sign-in-3 = Pour vous reconnecter à votre compte, il vous suffit de réinitialiser votre mot de passe.
passwordChangeRequired-different-password-2 = <b>Important :</b> choisissez un mot de passe compliqué, différent de celui que vous avez utilisé par le passé.
passwordChangeRequired-different-password-plaintext-2 = Important : choisissez un mot de passe compliqué, différent de celui que vous avez utilisé par le passé.
passwordChangeRequired-action = Réinitialiser le mot de passe
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action } :
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Utilisez { $code } pour changer votre mot de passe
password-forgot-otp-preview = Ce code expire dans 10 minutes
password-forgot-otp-title = Mot de passe oublié ?
password-forgot-otp-request = Nous avons reçu une demande de changement de mot de passe pour votre { -product-mozilla-account } depuis :
password-forgot-otp-code-2 = Si c’était vous, voici le code de confirmation pour continuer :
password-forgot-otp-expiry-notice = Ce code expire dans 10 minutes.
passwordReset-subject-2 = Votre mot de passe à été réinitialisé
passwordReset-title-2 = Votre mot de passe à été réinitialisé
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Vous avez réinitialisé le mot de passe de votre { -product-mozilla-account } sur :
passwordResetAccountRecovery-subject-2 = Votre mot de passe a été réinitialisé
passwordResetAccountRecovery-title-3 = Votre mot de passe à été réinitialisé
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Vous avez utilisé la clé de récupération de votre compte pour réinitialiser le mot de passe de votre { -product-mozilla-account } sur :
passwordResetAccountRecovery-information = Nous vous avons déconnecté·e de tous vos appareils synchronisés. Nous avons créé une nouvelle clé de récupération de compte pour remplacer celle que vous avez utilisée. Vous pouvez la modifier dans les paramètres de votre compte.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Nous vous avons déconnecté·e de tous vos appareils synchronisés. Nous avons créé une nouvelle clé de récupération de compte pour remplacer celle que vous avez utilisée. Vous pouvez la modifier dans les paramètres de votre compte :
passwordResetAccountRecovery-action-4 = Gérer le compte
passwordResetRecoveryPhone-subject = Numéro de téléphone de secours utilisé
passwordResetRecoveryPhone-preview = Vérifiez qu’il s’agit bien de vous
passwordResetRecoveryPhone-title = Votre numéro de téléphone de secours a été utilisé pour confirmer la réinitialisation du mot de passe
passwordResetRecoveryPhone-device = Numéro de téléphone de secours utilisé depuis :
passwordResetRecoveryPhone-action = Gérer le compte
passwordResetWithRecoveryKeyPrompt-subject = Votre mot de passe à été réinitialisé
passwordResetWithRecoveryKeyPrompt-title = Votre mot de passe à été réinitialisé
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Vous avez réinitialisé le mot de passe de votre { -product-mozilla-account } sur :
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Créer une clé de récupération de compte
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Créer une clé de récupération de compte :
passwordResetWithRecoveryKeyPrompt-cta-description = Vous devrez vous reconnecter sur tous vos appareils synchronisés. Gardez vos données en sécurité la prochaine fois avec une clé de récupération de compte. Une telle clé vous permet de récupérer vos données si vous oubliez votre mot de passe.
postAddAccountRecovery-subject-3 = Une nouvelle clé de récupération de compte a été créée
postAddAccountRecovery-title2 = Vous avez créé une nouvelle clé de récupération de compte
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Conservez cette clé en lieu sûr, vous en aurez besoin pour restaurer vos données de navigation chiffrées si vous oubliez votre mot de passe.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Cette clé ne peut être utilisée qu’une seule fois. Après son utilisation, nous en génèrerons automatiquement une nouvelle pour vous. Vous pouvez également en créer une à tout moment depuis les paramètres de votre compte.
postAddAccountRecovery-action = Gérer le compte
postAddLinkedAccount-subject-2 = Nouveau compte lié à votre { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Votre compte { $providerName } a été lié à votre { -product-mozilla-account }
postAddLinkedAccount-action = Gérer le compte
postAddRecoveryPhone-subject = Numéro de téléphone de secours ajouté
postAddRecoveryPhone-preview = Compte protégé par l’authentification en deux étapes
postAddRecoveryPhone-title-v2 = Vous avez ajouté un numéro de téléphone de secours
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Vous avez ajouté { $maskedLastFourPhoneNumber } comme numéro de téléphone de secours
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Comment cela protège votre compte
postAddRecoveryPhone-how-protect-plaintext = Comment cela protège votre compte :
postAddRecoveryPhone-enabled-device = Vous l’avez activé le :
postAddRecoveryPhone-action = Gérer le compte
postAddTwoStepAuthentication-preview = Votre compte est protégé
postAddTwoStepAuthentication-subject-v3 = Authentification en deux étapes activée
postAddTwoStepAuthentication-title-2 = Vous avez activé l’authentification en deux étapes
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = La demande a été effectuée depuis :
postAddTwoStepAuthentication-action = Gérer le compte
postAddTwoStepAuthentication-code-required-v4 = Un code de sécurité issu de votre application d’authentification est désormais requis à chaque connexion.
postAddTwoStepAuthentication-recovery-method-codes = Vous avez également ajouté des codes d’authentification de secours comme méthode de récupération.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Vous avez également ajouté { $maskedPhoneNumber } comme numéro de téléphone de secours.
postAddTwoStepAuthentication-how-protects-link = En quoi cela protège votre compte
postAddTwoStepAuthentication-how-protects-plaintext = En quoi cela protège votre compte :
postAddTwoStepAuthentication-device-sign-out-message = Afin de protéger tous vos appareils connectés, vous devriez vous déconnecter partout où vous utilisez ce compte, puis vous reconnecter en utilisant l’authentification en deux étapes.
postChangeAccountRecovery-subject = La clé de récupération du compte a été modifiée
postChangeAccountRecovery-title = Vous avez modifié la clé de récupération de votre compte
postChangeAccountRecovery-body-part1 = Vous disposez maintenant d’une nouvelle clé de récupération de compte. Votre clé précédente a été supprimée.
postChangeAccountRecovery-body-part2 = Conservez cette nouvelle clé en lieu sûr, vous en aurez besoin pour restaurer vos données de navigation chiffrées si vous oubliez votre mot de passe.
postChangeAccountRecovery-action = Gérer le compte
postChangePrimary-subject = Adresse e-mail principale mise à jour
postChangePrimary-title = Nouvelle adresse e-mail principale
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Votre adresse e-mail principale est désormais { $email }. Vous pouvez à présent l’utiliser pour vous connecter à votre { -product-mozilla-account } et recevoir les notifications de sécurité et les confirmations de connexion.
postChangePrimary-action = Gérer le compte
postChangeRecoveryPhone-subject = Numéro de téléphone de secours mis à jour
postChangeRecoveryPhone-preview = Compte protégé par l’authentification en deux étapes
postChangeRecoveryPhone-title = Vous avez changé votre numéro de téléphone de secours
postChangeRecoveryPhone-description = Vous avez maintenant un nouveau numéro de téléphone de secours. Votre précédent numéro de téléphone a été supprimé.
postChangeRecoveryPhone-requested-device = La demande a été effectuée depuis :
postChangeTwoStepAuthentication-preview = Votre compte est protégé
postChangeTwoStepAuthentication-subject = Authentification en deux étapes mise à jour
postChangeTwoStepAuthentication-title = L’authentification en deux étapes a été mise à jour
postChangeTwoStepAuthentication-use-new-account = Vous devez maintenant utiliser la nouvelle entrée { -product-mozilla-account } dans votre application d’authentification. L’ancienne ne fonctionnera plus et vous pouvez la supprimer.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = La demande a été effectuée depuis :
postChangeTwoStepAuthentication-action = Gérer le compte
postChangeTwoStepAuthentication-how-protects-link = En quoi cela protège votre compte
postChangeTwoStepAuthentication-how-protects-plaintext = En quoi cela protège votre compte :
postChangeTwoStepAuthentication-device-sign-out-message = Afin de protéger tous vos appareils connectés, vous devriez vous déconnecter partout où vous utilisez ce compte, puis vous reconnecter en utilisant votre nouvelle authentification en deux étapes.
postConsumeRecoveryCode-title-3 = Votre code d’authentification de secours a été utilisé pour confirmer la réinitialisation du mot de passe
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Code utilisé depuis :
postConsumeRecoveryCode-action = Gérer le compte
postConsumeRecoveryCode-subject-v3 = Code d’authentification de secours utilisé
postConsumeRecoveryCode-preview = Vérifiez qu’il s’agit bien de vous
postNewRecoveryCodes-subject-2 = Nouveaux codes d’authentification de secours créés
postNewRecoveryCodes-title-2 = Vous avez créé de nouveaux codes d’authentification de secours
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Ils ont été créé sur :
postNewRecoveryCodes-action = Gérer le compte
postRemoveAccountRecovery-subject-2 = Clé de récupération de compte supprimée
postRemoveAccountRecovery-title-3 = Vous avez supprimé la clé de récupération de votre compte
postRemoveAccountRecovery-body-part1 = Votre clé de récupération de compte est nécessaire pour restaurer vos données de navigation chiffrées si vous oubliez votre mot de passe.
postRemoveAccountRecovery-body-part2 = Si ce n’est pas déjà fait, créez une nouvelle clé de récupération depuis les paramètres de votre compte pour éviter de perdre vos mots de passe, marque-pages, historique de navigation et autres données enregistrées.
postRemoveAccountRecovery-action = Gérer le compte
postRemoveRecoveryPhone-subject = Le numéro de téléphone de secours a été supprimé
postRemoveRecoveryPhone-preview = Compte protégé par l’authentification en deux étapes
postRemoveRecoveryPhone-title = Le numéro de téléphone de secours a été supprimé
postRemoveRecoveryPhone-description-v2 = Votre numéro de téléphone de secours a été supprimé de vos paramètres d’authentification en deux étapes.
postRemoveRecoveryPhone-description-extra = Vous pouvez toujours utiliser vos codes d’authentification de secours pour vous connecter si vous ne pouvez pas utiliser votre application d’authentification.
postRemoveRecoveryPhone-requested-device = La demande a été effectuée depuis :
postRemoveSecondary-subject = L’adresse e-mail secondaire a été supprimée
postRemoveSecondary-title = L’adresse e-mail secondaire a été supprimée
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Vous avez retiré { $secondaryEmail } des adresses e-mail secondaires de votre { -product-mozilla-account }. Les notifications de sécurité et les confirmations de connexion ne seront plus envoyées à cette adresse.
postRemoveSecondary-action = Gérer le compte
postRemoveTwoStepAuthentication-subject-line-2 = Authentification en deux étapes désactivée
postRemoveTwoStepAuthentication-title-2 = Vous avez désactivé l’authentification en deux étapes
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Vous l’avez désactivée depuis :
postRemoveTwoStepAuthentication-action = Gérer le compte
postRemoveTwoStepAuthentication-not-required-2 = Vous n’avez plus besoin des codes de sécurité fournis par votre application d’authentification quand vous vous connectez.
postSigninRecoveryCode-subject = Code d’authentification de secours utilisé pour se connecter
postSigninRecoveryCode-preview = Confirmer l’activité du compte
postSigninRecoveryCode-title = Votre code d’authentification de secours a été utilisé pour se connecter
postSigninRecoveryCode-description = Si vous n’êtes pas à l’origine de cette action, vous devriez changer votre mot de passe immédiatement pour assurer la sécurité de votre compte.
postSigninRecoveryCode-device = Vous vous êtes connecté·e depuis :
postSigninRecoveryCode-action = Gérer le compte
postSigninRecoveryPhone-subject = Numéro de téléphone de secours utilisé pour se connecter
postSigninRecoveryPhone-preview = Confirmer l’activité du compte
postSigninRecoveryPhone-title = Votre numéro de téléphone de secours a été utilisé pour se connecter
postSigninRecoveryPhone-description = Si vous n’êtes pas à l’origine de cette action, vous devriez changer votre mot de passe immédiatement pour assurer la sécurité de votre compte.
postSigninRecoveryPhone-device = Vous vous êtes connecté·e depuis :
postSigninRecoveryPhone-action = Gérer le compte
postVerify-sub-title-3 = Nous sommes ravis de vous voir !
postVerify-title-2 = Vous voulez consulter le même onglet sur deux appareils ?
postVerify-description-2 = C’est facile ! Installez simplement { -brand-firefox } sur un autre appareil et connectez-vous pour synchroniser, comme par magie.
postVerify-sub-description = (Psst… Cela signifie également que vous pouvez obtenir vos marque-pages, mots de passe et autres données de { -brand-firefox } partout où vous êtes connecté·e.)
postVerify-subject-4 = Bienvenue chez { -brand-mozilla } !
postVerify-setup-2 = Connectez un autre appareil :
postVerify-action-2 = Connecter un autre appareil
postVerifySecondary-subject = Adresse e-mail secondaire ajoutée
postVerifySecondary-title = Adresse e-mail secondaire ajoutée
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = L’adresse e-mail secondaire { $secondaryEmail } de votre { -product-mozilla-account } a été confirmée avec succès. Les notifications de sécurité et les confirmations de connexion seront désormais envoyées aux deux adresses e-mail.
postVerifySecondary-action = Gérer le compte
recovery-subject = Réinitialiser le mot de passe
recovery-title-2 = Mot de passe oublié ?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Nous avons reçu une demande de changement de mot de passe pour votre { -product-mozilla-account } depuis :
recovery-new-password-button = Créez un nouveau mot de passe en cliquant sur le bouton ci-dessous. Ce lien expirera dans une heure.
recovery-copy-paste = Créez un nouveau mot de passe en copiant et collant l’URL ci-dessous dans votre navigateur. Ce lien expirera dans une heure.
recovery-action = Créer un nouveau mot de passe
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Votre abonnement à { $productName } a été annulé
subscriptionAccountDeletion-title = Nous sommes tristes de vous voir partir
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Vous avez récemment supprimé votre { -product-mozilla-account }. Par conséquent, nous avons annulé votre abonnement à { $productName }. Votre paiement final de { $invoiceTotal } a été réglé le { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Bienvenue dans { $productName } : veuillez définir votre mot de passe.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Bienvenue sur { $productName }
subscriptionAccountFinishSetup-content-processing = Votre paiement est en cours de traitement, ce qui peut prendre jusqu’à quatre jours ouvrables. Votre abonnement se renouvellera automatiquement à chaque période de facturation, sauf si vous choisissez de l’annuler.
subscriptionAccountFinishSetup-content-create-3 = Veuillez maintenant créer un mot de passe de { -product-mozilla-account } pour commencer à utiliser votre nouvel abonnement.
subscriptionAccountFinishSetup-action-2 = Commencer
subscriptionAccountReminderFirst-subject = Rappel : terminez la configuration de votre compte
subscriptionAccountReminderFirst-title = Vous ne pouvez pas encore accéder à votre abonnement
subscriptionAccountReminderFirst-content-info-3 = Il y a quelques jours, vous avez créé un { -product-mozilla-account }, mais vous ne l’avez jamais confirmé. Nous espérons que vous finirez de configurer votre compte afin que vous puissiez utiliser votre nouvel abonnement.
subscriptionAccountReminderFirst-content-select-2 = Sélectionnez « Créer un mot de passe » pour configurer un nouveau mot de passe et terminer la confirmation de votre compte.
subscriptionAccountReminderFirst-action = Créer un mot de passe
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action } :
subscriptionAccountReminderSecond-subject = Dernier rappel : configurez votre compte
subscriptionAccountReminderSecond-title-2 = Bienvenue chez { -brand-mozilla } !
subscriptionAccountReminderSecond-content-info-3 = Il y a quelques jours, vous avez créé un { -product-mozilla-account }, mais vous ne l’avez jamais confirmé. Nous espérons que vous finirez de configurer votre compte afin que vous puissiez utiliser votre nouvel abonnement.
subscriptionAccountReminderSecond-content-select-2 = Sélectionnez « Créer un mot de passe » pour configurer un nouveau mot de passe et terminer la confirmation de votre compte.
subscriptionAccountReminderSecond-action = Créer un mot de passe
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action } :
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Votre abonnement à { $productName } a été annulé
subscriptionCancellation-title = Nous sommes tristes de vous voir partir

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Nous avons annulé votre abonnement à { $productName }. Votre dernier paiement de { $invoiceTotal } a été effectué le { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Nous avons annulé votre abonnement à { $productName }. Votre dernier paiement de { $invoiceTotal } sera effectué le { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Le service sera opérationnel jusqu’à la fin de votre période de facturation actuelle, soit le { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Vous utilisez maintenant { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Votre passage de { $productNameOld } à { $productName } s’est effectué correctement.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = À partir de votre prochaine facture, vos frais passeront de { $paymentAmountOld } par { $productPaymentCycleOld } à { $paymentAmountNew } par { $productPaymentCycleNew }. À ce moment-là, vous recevrez également un crédit unique de { $paymentProrated } pour refléter les frais inférieurs pour le reste de la période.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Si un nouveau logiciel doit être installé pour utiliser { $productName }, vous recevrez un e-mail séparé avec des instructions de téléchargement.
subscriptionDowngrade-content-auto-renew = Votre abonnement sera automatiquement renouvelé à chaque période de facturation, sauf si vous choisissez de l’annuler.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Votre abonnement à { $productName } a été annulé
subscriptionFailedPaymentsCancellation-title = Votre abonnement a été annulé
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Nous avons annulé votre abonnement à { $productName } car plusieurs tentatives de paiement ont échoué. Pour retrouver votre accès, veuillez vous réabonner avec un mode de paiement à jour.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Paiement pour { $productName } confirmé
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Merci pour votre abonnement à { $productName }
subscriptionFirstInvoice-content-processing = Votre paiement est en cours de traitement et peut prendre jusqu’à quatre jours ouvrables.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Vous recevrez un e-mail séparé expliquant comment commencer à utiliser { $productName }.
subscriptionFirstInvoice-content-auto-renew = Votre abonnement sera automatiquement renouvelé à chaque période de facturation, sauf si vous choisissez de l’annuler.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Votre prochaine facture sera émise le { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Le mode de paiement pour { $productName } a expiré ou expire bientôt
subscriptionPaymentExpired-title-2 = Votre mode de paiement est arrivé à expiration ou est sur le point d’y être
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Le mode de paiement que vous utilisez pour { $productName } est arrivé à expiration ou est sur le point d’y être.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Le paiement pour { $productName } a échoué
subscriptionPaymentFailed-title = Toutes nos excuses, nous avons rencontré des problèmes avec votre paiement
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Nous avons rencontré un problème avec votre dernier paiement pour { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Il se peut que votre mode de paiement ait expiré ou que votre mode de paiement actuel soit obsolète.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Mise à jour des informations de paiement requise pour { $productName }
subscriptionPaymentProviderCancelled-title = Toutes nos excuses, nous avons rencontré des problèmes avec votre mode de paiement
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Nous avons rencontré un problème avec votre mode de paiement pour { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Il se peut que votre mode de paiement ait expiré ou que votre mode de paiement actuel soit obsolète.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = L’abonnement à { $productName } a été réactivé
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Merci d’avoir réactivé votre abonnement à { $productName } !
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Votre cycle de facturation et de paiement resteront les mêmes. Votre prochain paiement sera de { $invoiceTotal } le { $nextInvoiceDateOnly }. Votre abonnement sera renouvelé automatiquement à chaque période de facturation, sauf si vous choisissez de l’annuler.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Avis de renouvellement automatique de { $productName }
subscriptionRenewalReminder-title = Votre abonnement sera renouvelé prochainement
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Chers utilisateurs et utilisatrices de { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Votre abonnement actuel est configuré pour se renouveler automatiquement dans { $reminderLength } jours. À ce moment-là, { -brand-mozilla } renouvellera votre abonnement de { $planIntervalCount } { $planInterval } et un montant de { $invoiceTotal } sera prélevé via le mode de paiement de votre compte.
subscriptionRenewalReminder-content-closing = Cordialement,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = L’équipe { $productName }
subscriptionReplaced-subject = Votre abonnement a été mis à jour dans le cadre de votre mise à niveau
subscriptionReplaced-title = Votre abonnement a été mis à jour
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Votre abonnement individuel à { $productName } a été remplacé et est maintenant inclus dans votre nouveau pack.
subscriptionReplaced-content-credit = Vous recevrez un crédit pour le temps inutilisé de votre abonnement précédent. Ce crédit sera automatiquement appliqué à votre compte et utilisé pour les prochains paiements.
subscriptionReplaced-content-no-action = Aucune action n’est requise de votre part.
subscriptionsPaymentExpired-subject-2 = Le mode de paiement pour vos abonnements a expiré ou expire bientôt
subscriptionsPaymentExpired-title-2 = Votre mode de paiement est arrivé à expiration ou est sur le point d’y être
subscriptionsPaymentExpired-content-2 = Le mode de paiement que vous utilisez pour régler les abonnements suivants est arrivé à expiration ou est sur le point d’y être.
subscriptionsPaymentProviderCancelled-subject = Mise à jour des informations de paiement requise pour les abonnements { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Toutes nos excuses, nous avons rencontré des problèmes avec votre mode de paiement
subscriptionsPaymentProviderCancelled-content-detected = Nous avons rencontré un problème avec votre mode de paiement pour les abonnements suivants.
subscriptionsPaymentProviderCancelled-content-payment-1 = Il se peut que votre mode de paiement ait expiré ou que votre mode de paiement actuel soit obsolète.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Paiement pour { $productName } reçu
subscriptionSubsequentInvoice-title = Merci pour votre abonnement !
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Nous avons reçu votre dernier paiement pour { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Votre prochaine facture sera émise le { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Vous utilisez maintenant { $productName }
subscriptionUpgrade-title = Merci pour la mise à jour !
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Vous avez effectué la mise à niveau vers { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Des frais uniques de { $invoiceAmountDue } vous ont été facturés pour refléter le prix plus élevé de votre abonnement pour le reste de la période de facturation ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Vous avez reçu un crédit d’un montant de { $paymentProrated } sur votre compte.
subscriptionUpgrade-content-subscription-next-bill-change = À partir de votre prochaine facture, le prix de votre abonnement changera.
subscriptionUpgrade-content-old-price-day = L’ancien tarif était de { $paymentAmountOld } par jour.
subscriptionUpgrade-content-old-price-week = L’ancien tarif était de { $paymentAmountOld } par semaine.
subscriptionUpgrade-content-old-price-month = L’ancien tarif était de { $paymentAmountOld } par mois.
subscriptionUpgrade-content-old-price-halfyear = L’ancien tarif était de { $paymentAmountOld } par semestre.
subscriptionUpgrade-content-old-price-year = L’ancien tarif était de { $paymentAmountOld } par an.
subscriptionUpgrade-content-old-price-default = L’ancien tarif était de { $paymentAmountOld } par intervalle de facturation.
subscriptionUpgrade-content-old-price-day-tax = L’ancien tarif était de { $paymentAmountOld } + { $paymentTaxOld } de taxes par jour.
subscriptionUpgrade-content-old-price-week-tax = L’ancien tarif était de { $paymentAmountOld } + { $paymentTaxOld } de taxes par semaine.
subscriptionUpgrade-content-old-price-month-tax = L’ancien tarif était de { $paymentAmountOld } + { $paymentTaxOld } de taxes par mois.
subscriptionUpgrade-content-old-price-halfyear-tax = L’ancien tarif était de { $paymentAmountOld } + { $paymentTaxOld } de taxes par semestre.
subscriptionUpgrade-content-old-price-year-tax = L’ancien tarif était de { $paymentAmountOld } + { $paymentTaxOld } de taxes par an.
subscriptionUpgrade-content-old-price-default-tax = L’ancien tarif était de { $paymentAmountOld } + { $paymentTaxOld } de taxes par intervalle de facturation.
subscriptionUpgrade-content-new-price-day = À l’avenir, vous serez facturé·e { $paymentAmountNew } par jour, hors remises.
subscriptionUpgrade-content-new-price-week = À l’avenir, vous serez facturé·e { $paymentAmountNew } par semaine, hors remises.
subscriptionUpgrade-content-new-price-month = À l’avenir, vous serez facturé·e { $paymentAmountNew } par mois, hors remises.
subscriptionUpgrade-content-new-price-halfyear = À l’avenir, vous serez facturé·e { $paymentAmountNew } par semestre, hors remises.
subscriptionUpgrade-content-new-price-year = À l’avenir, vous serez facturé·e { $paymentAmountNew } par an, hors remises.
subscriptionUpgrade-content-new-price-default = À l’avenir, vous serez facturé·e { $paymentAmountNew } par intervalle de facturation, hors remises.
subscriptionUpgrade-content-new-price-day-dtax = À l’avenir, vous serez facturé·e { $paymentAmountNew } + { $paymentTaxNew } de taxes par jour, hors remises.
subscriptionUpgrade-content-new-price-week-tax = À l’avenir, vous serez facturé·e { $paymentAmountNew } + { $paymentTaxNew } de taxes par semaine, hors remises.
subscriptionUpgrade-content-new-price-month-tax = À l’avenir, vous serez facturé·e { $paymentAmountNew } + { $paymentTaxNew } de taxes par mois, hors remises.
subscriptionUpgrade-content-new-price-halfyear-tax = À l’avenir, vous serez facturé·e { $paymentAmountNew } + { $paymentTaxNew } de taxes par semestre, hors remises.
subscriptionUpgrade-content-new-price-year-tax = À l’avenir, vous serez facturé·e { $paymentAmountNew } + { $paymentTaxNew } de taxes par an, hors remises.
subscriptionUpgrade-content-new-price-default-tax = À l’avenir, vous serez facturé·e { $paymentAmountNew } + { $paymentTaxNew } de taxes par intervalle de facturation, hors remises.
subscriptionUpgrade-existing = Si l’un de vos abonnements existants comprend tout ou partie de cette mise à niveau, nous le prendrons en compte et vous enverrons un e-mail séparé avec tous les détails. Si votre nouveau forfait comprend des produits qui doivent être installés, nous vous enverrons un e-mail séparé contenant les instructions d’installation.
subscriptionUpgrade-auto-renew = Votre abonnement sera automatiquement renouvelé à chaque période de facturation, sauf si vous choisissez de l’annuler.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Utilisez { $unblockCode } pour vous connecter
unblockCode-preview = Ce code expire dans une heure
unblockCode-title = Étiez-vous à l’origine de cette connexion ?
unblockCode-prompt = Si oui, voici le code d’autorisation dont vous avez besoin :
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Si oui, voici le code d’autorisation dont vous avez besoin : { $unblockCode }
unblockCode-report = Si non, aidez-nous à repousser les intrus et <a data-l10n-name="reportSignInLink">signalez-le-nous</a>.
unblockCode-report-plaintext = Si non, aidez-nous à repousser les intrus et signalez-le-nous.
verificationReminderFinal-subject = Dernier rappel pour confirmer votre compte
verificationReminderFinal-description-2 = Il y a quelques semaines, vous avez créé un { -product-mozilla-account }, mais vous ne l’avez jamais confirmé. Pour votre sécurité, nous supprimerons le compte s’il n’est pas vérifié dans les prochaines 24 heures.
confirm-account = Confirmer le compte
confirm-account-plaintext = { confirm-account } :
verificationReminderFirst-subject-2 = N’oubliez pas de confirmer votre compte
verificationReminderFirst-title-3 = Bienvenue chez { -brand-mozilla } !
verificationReminderFirst-description-3 = Il y a quelques jours, vous avez créé un { -product-mozilla-account }, mais vous ne l’avez jamais confirmé. Veuillez confirmer votre compte dans les 15 prochains jours ou il sera automatiquement supprimé.
verificationReminderFirst-sub-description-3 = Ne passez pas à côté du navigateur qui fait passer la confidentialité avant tout le reste.
confirm-email-2 = Confirmer le compte
confirm-email-plaintext-2 = { confirm-email-2 } :
verificationReminderFirst-action-2 = Confirmer le compte
verificationReminderSecond-subject-2 = N’oubliez pas de confirmer votre compte
verificationReminderSecond-title-3 = Ne manquez rien de { -brand-mozilla } !
verificationReminderSecond-description-4 = Il y a quelques jours, vous avez créé un { -product-mozilla-account }, mais vous ne l’avez jamais confirmé. Veuillez confirmer votre compte dans les 10 prochains jours ou il sera automatiquement supprimé.
verificationReminderSecond-second-description-3 = Votre { -product-mozilla-account } vous permet de synchroniser votre expérience { -brand-firefox } sur tous vos appareils et donne accès à davantage de produits de { -brand-mozilla } pour protéger votre vie privée.
verificationReminderSecond-sub-description-2 = Rejoignez notre mission pour transformer Internet en un lieu ouvert à tout le monde.
verificationReminderSecond-action-2 = Confirmer le compte
verify-title-3 = Accédez à Internet avec { -brand-mozilla }
verify-description-2 = Confirmez votre compte et tirez le meilleur parti de { -brand-mozilla } partout où vous vous connectez, en commençant par :
verify-subject = Terminez la création de votre compte
verify-action-2 = Confirmer le compte
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Utilisez { $code } pour modifier votre compte
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Ce code expire dans { $expirationTime } minute.
       *[other] Ce code expire dans { $expirationTime } minutes.
    }
verifyAccountChange-title = Êtes-vous en train de modifier les informations de votre compte ?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Aidez-nous à protéger votre compte en approuvant ce changement sur :
verifyAccountChange-prompt = Si oui, voici le code d’autorisation :
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Il expire dans { $expirationTime } minute.
       *[other] Il expire dans { $expirationTime } minutes.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Vous êtes-vous connecté·e via { $clientName } ?
verifyLogin-description-2 = Aidez-nous à protéger votre compte en confirmant votre connexion via :
verifyLogin-subject-2 = Confirmer la connexion
verifyLogin-action = Confirmer la connexion
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Utilisez { $code } pour vous connecter
verifyLoginCode-preview = Ce code expire dans 5 minutes.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Vous êtes-vous connecté·e via { $serviceName } ?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Aidez-nous à protéger votre compte en confirmant votre connexion sur :
verifyLoginCode-prompt-3 = Si oui, voici le code d’autorisation :
verifyLoginCode-expiry-notice = Il expire dans 5 minutes.
verifyPrimary-title-2 = Confirmer l’adresse e-mail principale
verifyPrimary-description = Une requête pour modifier le compte a été effectuée depuis l’appareil suivant :
verifyPrimary-subject = Confirmer l’adresse principale
verifyPrimary-action-2 = Confirmez votre adresse e-mail
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 } :
verifyPrimary-post-verify-2 = Une fois le compte confirmé, il sera possible de le modifier à partir de cet appareil pour, entre autres, ajouter une adresse e-mail secondaire.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Utilisez { $code } pour confirmer votre adresse e-mail secondaire
verifySecondaryCode-preview = Ce code expire dans 5 minutes.
verifySecondaryCode-title-2 = Confirmer l’adresse e-mail secondaire
verifySecondaryCode-action-2 = Confirmez votre adresse e-mail
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Une demande d’utilisation de l’adresse { $email } en tant qu’adresse secondaire a été effectuée depuis le { -product-mozilla-account } suivant :
verifySecondaryCode-prompt-2 = Utilisez ce code de confirmation :
verifySecondaryCode-expiry-notice-2 = Celui-ci expire dans 5 minutes. Une fois confirmée, cette adresse commencera à recevoir des notifications de sécurité et codes de confirmation.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Utilisez { $code } pour confirmer votre compte
verifyShortCode-preview-2 = Ce code expire dans 5 minutes
verifyShortCode-title-3 = Accédez à Internet avec { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirmez votre compte et tirez le meilleur parti de { -brand-mozilla } partout où vous vous connectez, en commençant par :
verifyShortCode-prompt-3 = Utilisez ce code de confirmation :
verifyShortCode-expiry-notice = Il expire dans 5 minutes.
