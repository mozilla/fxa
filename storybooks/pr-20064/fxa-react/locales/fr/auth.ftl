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
cancellationSurvey = Aidez-nous à améliorer nos services en répondant à <a data-l10n-name="cancellationSurveyUrl">ce court questionnaire</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Aidez-nous à améliorer nos services en répondant à ce court questionnaire :
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
view-invoice-link-action = Voir la facture
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Voir la facture : { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Votre abonnement à { $productName } a été annulé
subscriptionAccountDeletion-title = Nous sommes tristes de vous voir partir
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Vous avez récemment supprimé votre { -product-mozilla-account }. Par conséquent, nous avons annulé votre abonnement à { $productName }. Votre paiement final de { $invoiceTotal } a été réglé le { $invoiceDateOnly }.
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
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Votre abonnement à { $productName } va bientôt expirer
subscriptionEndingReminder-title = Votre abonnement à { $productName } va bientôt expirer
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Votre accès à { $productName } prendra fin le <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Si vous souhaitez continuer à utiliser { $productName }, vous pouvez réactiver votre abonnement dans les <a data-l10n-name="subscriptionEndingReminder-account-settings">paramètres du compte</a> avant le <strong>{ $serviceLastActiveDateOnly }</strong>. Si vous avez besoin d’aide, <a data-l10n-name="subscriptionEndingReminder-contact-support">contactez notre équipe d’assistance</a>.
subscriptionEndingReminder-content-line1-plaintext = Votre accès à { $productName } prendra fin le { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Si vous souhaitez continuer à utiliser { $productName }, vous pouvez réactiver votre abonnement dans les paramètres du compte avant le { $serviceLastActiveDateOnly }. Si vous avez besoin d’aide, contactez notre équipe d’assistance.
subscriptionEndingReminder-content-closing = Merci pour votre abonnement !
subscriptionEndingReminder-churn-title = Voulez-vous conserver votre accès ?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Des restrictions et conditions particulières s’appliquent</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Des conditions particulières et des restrictions s’appliquent : { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Contactez notre équipe d’assistance : { $subscriptionSupportUrlWithUtm }
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
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Votre abonnement actuel est configuré pour se renouveler automatiquement dans { $reminderLength } jours.
subscriptionRenewalReminder-content-discount-change = Votre prochaine facture reflète un changement de prix, car une remise précédente a pris fin et une nouvelle remise a été appliquée.
subscriptionRenewalReminder-content-discount-ending = Une réduction précédente ayant pris fin, votre abonnement sera renouvelé au prix standard.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = À ce moment-là, { -brand-mozilla } renouvellera votre abonnement de { $planIntervalCount } { $planInterval } et un montant de { $invoiceTotal } sera prélevé au moyen de paiement de votre compte.
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
subscriptionsPaymentExpired-subject-2 = Le mode de paiement pour vos abonnements a expiré ou expire bientôt
subscriptionsPaymentExpired-title-2 = Votre mode de paiement est arrivé à expiration ou est sur le point d’y être
subscriptionsPaymentExpired-content-2 = Le mode de paiement que vous utilisez pour régler les abonnements suivants est arrivé à expiration ou est sur le point d’y être.
subscriptionsPaymentProviderCancelled-subject = Mise à jour des informations de paiement requise pour les abonnements { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Toutes nos excuses, nous avons rencontré des problèmes avec votre mode de paiement
subscriptionsPaymentProviderCancelled-content-detected = Nous avons rencontré un problème avec votre mode de paiement pour les abonnements suivants.
subscriptionsPaymentProviderCancelled-content-payment-1 = Il se peut que votre mode de paiement ait expiré ou que votre mode de paiement actuel soit obsolète.
