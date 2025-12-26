loyalty-discount-terms-heading = Conditions et restrictions
loyalty-discount-terms-support = Contacter l’assistance
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
loyalty-discount-terms-contact-support-product-aria = Contacter l’assistance pour { $productName }
not-found-page-title-terms = Page introuvable
not-found-page-description-terms = La page que vous recherchez n’existe pas.
not-found-page-button-terms-manage-subscriptions = Gérer les abonnements

## Page

checkout-signin-or-create = 1. Connectez-vous ou créez un { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = ou
continue-signin-with-google-button = Continuer avec { -brand-google }
continue-signin-with-apple-button = Continuer avec { -brand-apple }
next-payment-method-header = Choisissez votre mode de paiement
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Vous devez d’abord approuver votre abonnement
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Sélectionnez votre pays et saisissez votre code postal <p>pour continuer le règlement de { $productName }</p>
location-banner-info = Nous n’avons pas pu détecter automatiquement votre emplacement
location-required-disclaimer = Ces informations nous permettent uniquement de calculer les taxes et les devises.
location-banner-currency-change = Changement de devise non pris en charge. Pour continuer, sélectionnez le pays qui correspond à votre devise de facturation actuelle.

## Page - Upgrade page

upgrade-page-payment-information = Informations de paiement
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Votre forfait changera immédiatement et un montant calculé au prorata vous sera facturé aujourd’hui pour le reste du cycle de facturation. À partir du { $nextInvoiceDate }, le montant total vous sera facturé.

## Authentication Error page

auth-error-page-title = Nous n’avons pas pu vous connecter
checkout-error-boundary-retry-button = Réessayer
checkout-error-boundary-basic-error-message = Quelque chose s’est mal passé. Veuillez réessayer ou <contactSupportLink>contacter l’assistance.</contactSupportLink>
amex-logo-alt-text = Logo { -brand-amex }
diners-logo-alt-text = Logo { -brand-diner }
discover-logo-alt-text = Logo { -brand-discover }
jcb-logo-alt-text = Logo { -brand-jcb }
mastercard-logo-alt-text = Logo { -brand-mastercard }
paypal-logo-alt-text = Logo { -brand-paypal }
unionpay-logo-alt-text = Logo { -brand-unionpay }
visa-logo-alt-text = Logo { -brand-visa }
# Alt text for generic payment card logo
unbranded-logo-alt-text = Logo sans marque
link-logo-alt-text = Logo { -brand-link }
apple-pay-logo-alt-text = Logo { -brand-apple-pay }
google-pay-logo-alt-text = Logo { -brand-google-pay }

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Gérer mon abonnement
next-iap-blocked-contact-support = Vous avez un abonnement intégré pour mobile qui est en conflit avec ce produit. Veuillez contacter l’assistance afin que nous puissions vous aider.
next-payment-error-retry-button = Veuillez réessayer
next-basic-error-message = Une erreur est survenue. Merci de réessayer plus tard.
checkout-error-contact-support-button = Contacter l’assistance
checkout-error-not-eligible = Vous n’avez pas le droit de vous abonner à ce produit. Veuillez contacter notre équipe d’assistance afin que nous puissions vous aider.
checkout-error-already-subscribed = Vous êtes déjà abonné·e à ce produit.
checkout-error-contact-support = Veuillez contacter l’assistance afin que nous puissions vous aider.
cart-error-currency-not-determined = Nous n’avons pas pu déterminer la devise pour cet achat, veuillez réessayer.
checkout-processing-general-error = Une erreur inattendue s’est produite lors du traitement de votre paiement, veuillez réessayer.
cart-total-mismatch-error = Le montant de la facture a changé. Veuillez réessayer.

## Error pages - Payment method failure messages

intent-card-error = La transaction n’a pas pu être traitée. Veuillez vérifier les informations relatives à votre carte bancaire et réessayez.
intent-expired-card-error = Il semble que votre carte bancaire ait expiré. Essayez avec une autre carte.
intent-payment-error-try-again = Hum, une erreur s’est produite lors de l’autorisation du paiement. Réessayez ou contactez l’émetteur de votre carte.
intent-payment-error-get-in-touch = Hum, une erreur s’est produite lors de l’autorisation du paiement. Contactez l’émetteur de votre carte.
intent-payment-error-generic = Une erreur inattendue s’est produite lors du traitement de votre paiement, veuillez réessayer.
intent-payment-error-insufficient-funds = Il semble que votre carte bancaire ne dispose pas de fonds suffisants. Essayez avec une autre carte.
general-paypal-error = Une erreur inattendue s’est produite lors du traitement de votre paiement, veuillez réessayer.
paypal-active-subscription-no-billing-agreement-error = Il semble qu’il y ait eu un problème lors de la facturation de votre compte { -brand-paypal }. Veuillez réactiver les paiements automatiques pour votre abonnement.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Veuillez patienter pendant le traitement de votre paiement…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Merci, consultez à présent vos e-mails !
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Vous recevrez un message à l’adresse { $email } avec des instructions pour votre abonnement, ainsi que vos informations de paiement.
next-payment-confirmation-order-heading = Détails de la commande
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Facture n°{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Informations de paiement

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Continuer vers le téléchargement

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Carte se terminant par { $last4 }

## Not found page

not-found-title-subscriptions = Abonnement introuvable
not-found-description-subscriptions = Nous n’avons pas pu trouver votre abonnement. Veuillez réessayer ou contacter l’assistance.
not-found-button-back-to-subscriptions = Retour aux abonnements

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = Aucun moyen de paiement ajouté
subscription-management-page-banner-warning-link-no-payment-method = Ajouter un moyen de paiement
subscription-management-subscriptions-heading = Abonnements
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = Atteindre
subscription-management-nav-payment-details = Informations de paiement
subscription-management-nav-active-subscriptions = Abonnements actifs
subscription-management-payment-details-heading = Informations de paiement
subscription-management-email-label = Adresse e-mail
subscription-management-credit-balance-label = Solde créditeur
subscription-management-credit-balance-message = Le crédit sera automatiquement appliqué aux prochaines factures
subscription-management-payment-method-label = Moyen de paiement
subscription-management-button-add-payment-method-aria = Ajouter un moyen de paiement
subscription-management-button-add-payment-method = Ajouter
subscription-management-page-warning-message-no-payment-method = Veuillez ajouter un moyen de paiement pour éviter l’interruption de vos abonnements.
subscription-management-button-manage-payment-method-aria = Gérer le moyen de paiement
subscription-management-button-manage-payment-method = Gérer
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Carte se terminant par { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Expiration : { $expirationDate }
subscription-management-active-subscriptions-heading = Abonnements actifs
subscription-management-you-have-no-active-subscriptions = Vous n’avez aucun abonnement actif
subscription-management-new-subs-will-appear-here = Les nouveaux abonnements apparaîtront ici.
subscription-management-your-active-subscriptions-aria = Vos abonnements actifs
subscription-management-button-support = Obtenir de l’aide
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = Obtenir de l’aide pour { $productName }
subscription-management-your-apple-iap-subscriptions-aria = Vos abonnements { -brand-apple } via l’application
subscription-management-apple-in-app-purchase-2 = Achat intégré { -brand-apple }
subscription-management-your-google-iap-subscriptions-aria = Vos abonnements { -brand-google } via l’application
subscription-management-google-in-app-purchase-2 = Achat intégré { -brand-google }
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Date d’expiration : { $date }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = Gérer l’abonnement pour { $productName }
subscription-management-button-manage-subscription-1 = Gérer l’abonnement
error-payment-method-banner-title-expired-card = Carte expirée
error-payment-method-banner-message-add-new-card = Ajoutez une nouvelle carte ou un nouveau moyen de paiement pour éviter l’interruption de vos abonnements.
error-payment-method-banner-label-update-payment-method = Mettre à jour le moyen de paiement
error-payment-method-expired-card = Votre carte a expiré. Veuillez ajouter une nouvelle carte ou un nouveau moyen de paiement pour éviter l’interruption de vos abonnements.
error-payment-method-banner-title-invalid-payment-information = Informations de paiement invalides
error-payment-method-banner-message-account-issue = Il y a un problème avec votre compte.
subscription-management-button-manage-payment-method-1 = Gérer le moyen de paiement
subscription-management-error-apple-pay = Il y a un problème avec votre compte { -brand-apple-pay }. Merci de le régler afin de garder vos abonnements actifs.
subscription-management-error-google-pay = Il y a un problème avec votre compte { -brand-google-pay }. Merci de le régler afin de garder vos abonnements actifs.
subscription-management-error-link = Il y a un problème avec votre compte { -brand-link }. Merci de le régler afin de garder vos abonnements actifs.
subscription-management-error-paypal-billing-agreement = Il y a un problème avec votre compte { -brand-paypal }. Merci de le régler afin de garder vos abonnements actifs.
subscription-management-error-payment-method = Il y a un problème avec votre moyen de paiement. Merci de le régler afin de garder vos abonnements actifs.
manage-payment-methods-heading = Gérer les moyens de paiement
paypal-payment-management-page-invalid-header = Informations de facturation invalides
paypal-payment-management-page-invalid-description = Il semble y avoir une erreur avec votre compte { -brand-paypal }. Veuillez prendre les mesures nécessaires pour résoudre ce problème de paiement.
# Page - Not Found
page-not-found-title = Page introuvable
page-not-found-description = La page demandée est introuvable. Nous en avons été informés et nous rétablirons les liens éventuellement cassés.
page-not-found-back-button = Retour
alert-dialog-title = Fenêtre d’alerte

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Accueil du compte
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Abonnements
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = Gérer les moyens de paiement
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = Retourner à { $page }

## CancelSubscription

subscription-cancellation-dialog-title = C’est triste de vous voir partir…
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Votre abonnement à { $name } a été résilié. Vous aurez encore accès à { $name } jusqu’au { $date }.
subscription-cancellation-dialog-aside = Vous avez des questions ? Consultez <LinkExternal>l’assistance de { -brand-mozilla }</LinkExternal>.
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
cancel-subscription-heading = Annuler l’abonnement à { $productName }

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = Vous ne pourrez plus utiliser { $productName } après le { $currentPeriodEnd }, le dernier jour de votre cycle de facturation.
subscription-content-cancel-access-message = Annuler mon accès et mes informations enregistrées dans { $productName } le { $currentPeriodEnd }

## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

cancel-subscription-button-cancel-subscription = Annuler l’abonnement
    .aria-label = Annuler votre abonnement à { $productName }
cancel-subscription-button-stay-subscribed = Conserver l’abonnement
    .aria-label = Rester abonné·e à { $productName }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = J’autorise { -brand-mozilla } à prélever via mon moyen de paiement le montant affiché, conformément aux <termsOfServiceLink>conditions d’utilisation</termsOfServiceLink> et à la <privacyNoticeLink>politique de confidentialité</privacyNoticeLink>, jusqu’à ce que je mette fin à mon abonnement.
next-payment-confirm-checkbox-error = Vous devez terminer cette étape avant de continuer

## Checkout Form

next-new-user-submit = S’abonner maintenant
next-pay-with-heading-paypal = Payer avec { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Saisissez le code
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Code promo
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Code promo appliqué
next-coupon-remove = Supprimer
next-coupon-submit = Appliquer

# Component - Header

payments-header-help =
    .title = Aide
    .aria-label = Aide
    .alt = Aide
payments-header-bento =
    .title = Produits { -brand-mozilla }
    .aria-label = Produits { -brand-mozilla }
    .alt = Logo { -brand-mozilla }
payments-header-bento-close =
    .alt = Fermer
payments-header-bento-tagline = Autres produits de { -brand-mozilla } qui protègent votre vie privée
payments-header-bento-firefox-desktop = Navigateur { -brand-firefox } pour ordinateur
payments-header-bento-firefox-mobile = Navigateur { -brand-firefox } pour mobile
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Conçu par { -brand-mozilla }
payments-header-avatar =
    .title = Menu { -product-mozilla-account(capitalization: "uppercase") }
payments-header-avatar-icon =
    .alt = Image de profil du compte
payments-header-avatar-expanded-signed-in-as = Connecté·e en tant que
payments-header-avatar-expanded-sign-out = Déconnexion
payments-client-loading-spinner =
    .aria-label = Chargement…
    .alt = Chargement…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Définir comme moyen de paiement par défaut
# Save button for saving a new payment method
payment-method-management-save-method = Enregistrer le moyen de paiement
manage-stripe-payments-title = Gérer les moyens de paiement

## Component - PurchaseDetails

next-plan-details-header = Détails du produit
next-plan-details-list-price = Prix courant
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = Prix au prorata pour { $productName }
next-plan-details-tax = Taxes et frais
next-plan-details-total-label = Total
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Avoir pour le temps non utilisé
purchase-details-subtotal-label = Sous-total
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Avoir appliqué
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Total
next-plan-details-hide-button = Masquer les détails
next-plan-details-show-button = Afficher les détails
next-coupon-success = Votre forfait sera automatiquement renouvelé au prix courant.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Votre forfait sera automatiquement renouvelé au bout de { $couponDurationDate } au prix courant.

## Select Tax Location

select-tax-location-title = Localisation
select-tax-location-edit-button = Modifier
select-tax-location-save-button = Enregistrer
select-tax-location-continue-to-checkout-button = Continuer vers le règlement
select-tax-location-country-code-label = Pays
select-tax-location-country-code-placeholder = Sélectionnez votre pays
select-tax-location-error-missing-country-code = Veuillez sélectionner votre pays
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } n’est pas disponible à cette adresse.
select-tax-location-postal-code-label = Code postal
select-tax-location-postal-code =
    .placeholder = Saisissez votre code postal
select-tax-location-error-missing-postal-code = Veuillez saisir votre code postal
select-tax-location-error-invalid-postal-code = Veuillez saisir un code postal valide
select-tax-location-successfully-updated = Votre localisation a été mise à jour.
select-tax-location-error-location-not-updated = Votre localisation n’a pas pu être mise à jour. Veuillez réessayer.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Votre compte est facturé en { $currencyDisplayName }. Sélectionnez un pays qui utilise la devise { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Sélectionnez un pays qui correspond à la devise de vos abonnements actifs.
select-tax-location-new-tax-rate-info = La mise à jour de votre localisation appliquera le nouveau taux de taxe à tous les abonnements actifs sur votre compte, à partir de votre prochain cycle de facturation.
signin-form-continue-button = Continuer
signin-form-email-input = Saisissez votre adresse e-mail
signin-form-email-input-missing = Veuillez saisir votre adresse e-mail
signin-form-email-input-invalid = Veuillez spécifier une adresse e-mail valide
next-new-user-subscribe-product-updates-mdnplus = Je souhaite recevoir des informations sur les produits et des actualités de { -product-mdn-plus } et { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Je souhaite recevoir des informations sur les produits et des actualités de { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = Je souhaite recevoir des informations sur la sécurité et la confidentialité et des actualités de { -brand-mozilla }
next-new-user-subscribe-product-assurance = Nous utilisons votre adresse e-mail uniquement pour créer votre compte. Nous ne la vendrons jamais à un tiers.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = Vous voulez continuer à utiliser { $productName } ?
stay-subscribed-access-will-continue = Vous conserverez l’accès à { $productName }, et votre cycle de facturation et moyen de paiement resteront les mêmes.
subscription-content-button-resubscribe = Se réabonner
    .aria-label = Se réabonner à { $productName }
resubscribe-success-dialog-title = Merci ! Tout est prêt.

## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.
## $last4 (String) - The last four digits of the default payment method card.
## $currentPeriodEnd (Date) - The date of the next charge.

stay-subscribed-next-charge-with-tax = Votre prochain paiement sera de { $nextInvoiceTotal } + { $taxDue } de taxes sur { $currentPeriodEnd }.
stay-subscribed-next-charge-no-tax = Votre prochain paiement sera de { $nextInvoiceTotal } le { $currentPeriodEnd }.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = La remise { $promotionName } sera appliquée
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Dernière facture • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } de taxes
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = Voir la facture
subscription-management-link-view-invoice-aria = Voir la facture pour { $productName }
subscription-content-expires-on-expiry-date = Date d’expiration : { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Prochaine facture • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } de taxes
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = Conserver l’abonnement
    .aria-label = Conserver l’abonnement à { $productName }
subscription-content-button-cancel-subscription = Annuler l’abonnement
    .aria-label = Annuler votre abonnement à { $productName }

##

dialog-close = Fermer la boîte de dialogue
button-back-to-subscriptions = Retour aux abonnements
subscription-content-cancel-action-error = Une erreur inattendue s’est produite. Veuillez réessayer.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } par jour
plan-price-interval-weekly = { $amount } par semaine
plan-price-interval-monthly = { $amount } par mois
plan-price-interval-halfyearly = { $amount } tous les 6 mois
plan-price-interval-yearly = { $amount } par an

## Component - SubscriptionTitle

next-subscription-create-title = Configuration de votre abonnement
next-subscription-success-title = Confirmation d’abonnement
next-subscription-processing-title = Confirmation de l’abonnement…
next-subscription-error-title = Erreur lors de la confirmation de l’abonnement…
subscription-title-sub-exists = Vous êtes déjà abonné·e
subscription-title-plan-change-heading = Passez en revue vos modifications
subscription-title-not-supported = Ce changement de forfait d’abonnement n’est pas pris en charge
next-sub-guarantee = Garantie de remboursement de 30 jours

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Conditions d’utilisation
next-privacy = Politique de confidentialité
next-terms-download = Télécharger les conditions
terms-and-privacy-stripe-label = { -brand-mozilla } utilise { -brand-name-stripe } pour le traitement sécurisé des paiements.
terms-and-privacy-stripe-link = Politique de confidentialité de { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } utilise { -brand-paypal } pour le traitement sécurisé des paiements.
terms-and-privacy-paypal-link = Politique de confidentialité de { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } utilise { -brand-name-stripe } et { -brand-paypal } pour le traitement sécurisé des paiements.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Forfait actuel
upgrade-purchase-details-new-plan-label = Nouveau forfait
upgrade-purchase-details-promo-code = Code promo
upgrade-purchase-details-tax-label = Taxes et frais
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Avoir crédité au compte
upgrade-purchase-details-credit-will-be-applied = L’avoir sera crédité à votre compte et utilisé pour vos prochaines factures.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (quotidien)
upgrade-purchase-details-new-plan-weekly = { $productName } (hebdomadaire)
upgrade-purchase-details-new-plan-monthly = { $productName } (mensuel)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 mois)
upgrade-purchase-details-new-plan-yearly = { $productName } (annuel)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Paiement | { $productTitle }
metadata-description-checkout-start = Saisissez vos informations de paiement pour terminer votre achat.
# Checkout processing
metadata-title-checkout-processing = Traitement en cours | { $productTitle }
metadata-description-checkout-processing = Veuillez patienter pendant que nous terminons de traiter votre paiement.
# Checkout error
metadata-title-checkout-error = Erreur | { $productTitle }
metadata-description-checkout-error = Une erreur s’est produite lors du traitement de votre abonnement. Si le problème persiste, veuillez contacter l’assistance.
# Checkout success
metadata-title-checkout-success = Terminé | { $productTitle }
metadata-description-checkout-success = Félicitations ! Vous avez terminé votre achat.
# Checkout needs_input
metadata-title-checkout-needs-input = Action requise | { $productTitle }
metadata-description-checkout-needs-input = Veuillez effectuer les actions nécessaires pour réaliser votre paiement.
# Upgrade start
metadata-title-upgrade-start = Mise à niveau | { $productTitle }
metadata-description-upgrade-start = Saisissez vos informations de paiement pour terminer la mise à niveau.
# Upgrade processing
metadata-title-upgrade-processing = Traitement en cours | { $productTitle }
metadata-description-upgrade-processing = Veuillez patienter pendant que nous terminons de traiter votre paiement.
# Upgrade error
metadata-title-upgrade-error = Erreur | { $productTitle }
metadata-description-upgrade-error = Une erreur s’est produite lors du traitement de votre mise à niveau. Si le problème persiste, veuillez contacter l’assistance.
# Upgrade success
metadata-title-upgrade-success = Terminé | { $productTitle }
metadata-description-upgrade-success = Félicitations ! Vous avez effectué la mise à niveau.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Action requise | { $productTitle }
metadata-description-upgrade-needs-input = Veuillez effectuer les actions nécessaires pour réaliser votre paiement.
# Default
metadata-title-default = Page introuvable | { $productTitle }
metadata-description-default = La page demandée n’a pas été trouvée.

## Coupon Error Messages

next-coupon-error-cannot-redeem = Le code que vous avez saisi ne peut être utilisé : votre compte est déjà abonné à l’un de nos services.
next-coupon-error-expired = Le code que vous avez saisi a expiré.
next-coupon-error-generic = Une erreur s’est produite lors du traitement du code. Veuillez réessayer.
next-coupon-error-invalid = Le code que vous avez saisi est invalide.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = Le code saisi a dépassé sa limite d’utilisation.

## Stay Subscribed Error Messages

stay-subscribed-error-expired = Cette offre a expiré.
stay-subscribed-error-discount-used = Code de réduction déjà appliqué.
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = Cette réduction est uniquement disponible pour les abonnés actuels à { $productTitle }.
stay-subscribed-error-still-active = Votre abonnement à { $productTitle } est toujours actif.
stay-subscribed-error-general = Un problème est survenu lors du renouvellement de votre abonnement.
