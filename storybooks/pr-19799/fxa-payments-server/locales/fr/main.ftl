



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $capitalization ->
        [uppercase] Comptes Firefox
       *[lowercase] comptes Firefox
    }
-product-mozilla-account =
    { $capitalization ->
        [uppercase] Compte Mozilla
       *[lowercase] compte Mozilla
    }
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Comptes Mozilla
       *[lowercase] comptes Mozilla
    }
-product-firefox-account =
    { $capitalization ->
        [uppercase] Compte Firefox
       *[lowercase] compte Firefox
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Lien
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Erreur générale de l’application
app-general-err-message = Une erreur est survenue. Merci de réessayer plus tard.
app-query-parameter-err-heading = Requête incorrecte : paramètres de requête invalides


app-footer-mozilla-logo-label = Logo { -brand-mozilla }
app-footer-privacy-notice = Politique de confidentialité des sites web
app-footer-terms-of-service = Conditions d’utilisation


app-default-title-2 = { -product-mozilla-accounts(capitalization: "uppercase") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(capitalization: "uppercase") }


link-sr-new-window = S’ouvre dans une nouvelle fenêtre


app-loading-spinner-aria-label-loading = Chargement…


app-logo-alt-3 =
    .alt = Logo { -brand-mozilla } m



settings-home = Accueil du compte
settings-project-header-title = { -product-mozilla-account(capitalization: "uppercase") }


coupon-promo-code-applied = Code promo appliqué
coupon-submit = Appliquer
coupon-remove = Supprimer
coupon-error = Le code que vous avez saisi est invalide ou a expiré.
coupon-error-generic = Une erreur s’est produite lors du traitement du code. Veuillez réessayer.
coupon-error-expired = Le code que vous avez saisi a expiré.
coupon-error-limit-reached = Le code saisi a dépassé sa limite d’utilisation.
coupon-error-invalid = Le code que vous avez saisi est invalide.
coupon-enter-code =
    .placeholder = Saisissez le code


default-input-error = Ce champ est requis.
input-error-is-required = Le champ « { $label } » est nécessaire


brand-name-mozilla-logo = Logo { -brand-mozilla }


new-user-sign-in-link-2 = Vous avez déjà un { -product-mozilla-account } ? <a>Se connecter</a>
new-user-enter-email =
    .label = Saisissez votre adresse e-mail
new-user-confirm-email =
    .label = Confirmez votre adresse e-mail
new-user-subscribe-product-updates-mozilla = Je souhaite recevoir des informations sur les produits et des actualités de { -brand-mozilla }
new-user-subscribe-product-updates-snp = Je souhaite recevoir des informations sur la sécurité et la confidentialité et des actualités de { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Je souhaite recevoir des informations sur les produits et des actualités de { -product-mozilla-hubs } et { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Je souhaite recevoir des informations sur les produits et des actualités de { -product-mdn-plus } et { -brand-mozilla }
new-user-subscribe-product-assurance = Nous utilisons votre adresse e-mail uniquement pour créer votre compte. Nous ne la vendrons jamais à un tiers.
new-user-email-validate = L’adresse e-mail n’est pas valide
new-user-email-validate-confirm = Les adresses e-mail ne correspondent pas
new-user-already-has-account-sign-in = Vous avez déjà un compte. <a>Connectez-vous</a>
new-user-invalid-email-domain = Faute de frappe dans l’adresse e-mail ? { $domain } ne propose pas d’adresses e-mail.


payment-confirmation-thanks-heading = Merci !
payment-confirmation-thanks-heading-account-exists = Merci, consultez à présent vos e-mails !
payment-confirmation-thanks-subheading = Un e-mail de confirmation a été envoyé à { $email } avec les détails nécessaires pour savoir comment démarrer avec { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Vous recevrez un message à l’adresse { $email } avec des instructions pour configurer votre compte, ainsi que vos informations de paiement.
payment-confirmation-order-heading = Détails de la commande
payment-confirmation-invoice-number = Facture n°{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informations de paiement
payment-confirmation-amount = { $amount } par { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } par jour
       *[other] { $amount } tous les { $intervalCount } jours
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } par semaine
       *[other] { $amount } toutes les { $intervalCount } semaines
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } par mois
       *[other] { $amount } tous les { $intervalCount } mois
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } par an
       *[other] { $amount } tous les { $intervalCount } ans
    }
payment-confirmation-download-button = Continuer vers le téléchargement


payment-confirm-with-legal-links-static-3 = J’autorise { -brand-mozilla } à prélever via mon moyen de paiement le montant affiché, conformément aux <termsOfServiceLink>conditions d’utilisation</termsOfServiceLink> et à la <privacyNoticeLink>politique de confidentialité</privacyNoticeLink>, jusqu’à ce que je mette fin à mon abonnement.
payment-confirm-checkbox-error = Vous devez terminer cette étape avant de continuer


payment-error-retry-button = Veuillez réessayer
payment-error-manage-subscription-button = Gérer mon abonnement


iap-upgrade-already-subscribed-2 = Vous avez déjà un abonnement à { $productName } sur l’App Store de { -brand-google } ou d’{ -brand-apple }.
iap-upgrade-no-bundle-support = À présent, nous n’offrons pas de mises à niveau pour ces abonnements, mais nous le ferons bientôt.
iap-upgrade-contact-support = Vous pouvez tout de même obtenir ce produit ; veuillez contacter notre équipe d’assistance afin que nous puissions vous aider.
iap-upgrade-get-help-button = Obtenir de l’aide


payment-name =
    .placeholder = Nom complet
    .label = Nom apparaissant sur votre carte bancaire
payment-cc =
    .label = Votre carte bancaire
payment-cancel-btn = Annuler
payment-update-btn = Mettre à jour
payment-pay-btn = Payer
payment-pay-with-paypal-btn-2 = Payer avec { -brand-paypal }
payment-validate-name-error = Veuillez saisir votre nom


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } utilise { -brand-name-stripe } et { -brand-paypal } pour le traitement sécurisé des paiements.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Politique de confidentialité de { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Politique de confidentialité de { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } utilise { -brand-paypal } pour le traitement sécurisé des paiements.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Politique de confidentialité de { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } utilise { -brand-name-stripe } pour le traitement sécurisé des paiements.
payment-legal-link-stripe-3 = <stripePrivacyLink>Politique de confidentialité de { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Choisissez votre mode de paiement
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Vous devez d’abord approuver votre abonnement


payment-processing-message = Veuillez patienter pendant le traitement de votre paiement…


payment-confirmation-cc-card-ending-in = Carte se terminant par { $last4 }


pay-with-heading-paypal-2 = Payer avec { -brand-paypal }


plan-details-header = Détails du produit
plan-details-list-price = Prix courant
plan-details-show-button = Afficher les détails
plan-details-hide-button = Masquer les détails
plan-details-total-label = Total
plan-details-tax = Taxes et frais


product-no-such-plan = Aucun forfait de ce type pour ce produit.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } de taxes
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } par jour
       *[other] { $priceAmount } tous les { $intervalCount } jours
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } par jour
           *[other] { $priceAmount } tous les { $intervalCount } jours
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } par semaine
       *[other] { $priceAmount } toutes les { $intervalCount } semaines
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } par semaine
           *[other] { $priceAmount } toutes les { $intervalCount } semaines
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } par mois
       *[other] { $priceAmount } tous les { $intervalCount } mois
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } par mois
           *[other] { $priceAmount } tous les { $intervalCount } mois
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } par an
       *[other] { $priceAmount } tous les { $intervalCount } ans
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } par an
           *[other] { $priceAmount } tous les { $intervalCount } ans
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de taxes par jour
       *[other] { $priceAmount } + { $taxAmount } de taxes tous les { $intervalCount } jours
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de taxes par jour
           *[other] { $priceAmount } + { $taxAmount } de taxes tous les { $intervalCount } jours
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de taxes par semaine
       *[other] { $priceAmount } + { $taxAmount } de taxes toutes les { $intervalCount } semaines
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de taxes par semaine
           *[other] { $priceAmount } + { $taxAmount } de taxes toutes les { $intervalCount } semaines
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de taxes par mois
       *[other] { $priceAmount } + { $taxAmount } de taxes tous les { $intervalCount } mois
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de taxes par mois
           *[other] { $priceAmount } + { $taxAmount } de taxes tous les { $intervalCount } mois
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de taxes par an
       *[other] { $priceAmount } + { $taxAmount } de taxes tous les { $intervalCount } ans
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de taxes par an
           *[other] { $priceAmount } + { $taxAmount } de taxes tous les { $intervalCount } ans
        }


subscription-create-title = Configuration de votre abonnement
subscription-success-title = Confirmation d’abonnement
subscription-processing-title = Confirmation de l’abonnement…
subscription-error-title = Erreur lors de la confirmation de l’abonnement…
subscription-noplanchange-title = Ce changement de forfait d’abonnement n’est pas pris en charge
subscription-iapsubscribed-title = Déjà abonné·e
sub-guarantee = Garantie de remboursement de 30 jours


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Conditions d’utilisation
privacy = Politique de confidentialité
terms-download = Télécharger les conditions


document =
    .title = Comptes Firefox
close-aria =
    .aria-label = Fermer le dialogue
settings-subscriptions-title = Abonnements
coupon-promo-code = Code promo


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } par jour
       *[other] { $amount } tous les { $intervalCount } jours
    }
    .title =
        { $intervalCount ->
            [one] { $amount } par jour
           *[other] { $amount } tous les { $intervalCount } jours
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } par semaine
       *[other] { $amount } toutes les { $intervalCount } semaines
    }
    .title =
        { $intervalCount ->
            [one] { $amount } par semaine
           *[other] { $amount } toutes les { $intervalCount } semaines
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } par mois
       *[other] { $amount } tous les { $intervalCount } mois
    }
    .title =
        { $intervalCount ->
            [one] { $amount } par mois
           *[other] { $amount } tous les { $intervalCount } mois
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } par an
       *[other] { $amount } tous les { $intervalCount } ans
    }
    .title =
        { $intervalCount ->
            [one] { $amount } par an
           *[other] { $amount } tous les { $intervalCount } ans
        }


general-error-heading = Erreur générale de l’application
basic-error-message = Une erreur est survenue. Merci de réessayer plus tard.
payment-error-1 = Hum, une erreur s’est produite lors de l’autorisation du paiement. Réessayez ou contactez l’émetteur de votre carte.
payment-error-2 = Hum, une erreur s’est produite lors de l’autorisation du paiement. Contactez l’émetteur de votre carte.
payment-error-3b = Une erreur inattendue s’est produite lors du traitement de votre paiement, veuillez réessayer.
expired-card-error = Il semble que votre carte bancaire ait expiré. Essayez avec une autre carte.
insufficient-funds-error = Il semble que votre carte bancaire ne dispose pas de fonds suffisants. Essayez avec une autre carte.
withdrawal-count-limit-exceeded-error = Il semble que cette transaction dépasse votre limite de paiement. Essayez avec une autre carte.
charge-exceeds-source-limit = Il semble que cette transaction vous fera dépasser votre limite de paiement quotidienne. Réessayez avec une autre carte ou dans 24 heures.
instant-payouts-unsupported = Il semble que votre carte de débit n’est pas configurée pour les paiements instantanés. Essayez une autre carte de débit ou de crédit.
duplicate-transaction = Hum. Il semblerait qu’une transaction identique vienne d’être envoyée. Vérifiez votre historique de paiements.
coupon-expired = Il semble que ce code promotionnel a expiré.
card-error = La transaction n’a pas pu être traitée. Veuillez vérifier les informations relatives à votre carte de crédit et réessayez.
country-currency-mismatch = La devise de cet abonnement n’est pas valide pour le pays associé à votre paiement.
currency-currency-mismatch = Désolé. Vous ne pouvez pas basculer d’une devise à l’autre.
location-unsupported = Votre emplacement actuel n’est pas pris en charge selon nos conditions d’utilisation.
no-subscription-change = Désolé. Vous ne pouvez pas modifier votre forfait d’abonnement.
iap-already-subscribed = Vous êtes déjà abonné·e via { $mobileAppStore }.
fxa-account-signup-error-2 = Une erreur système a entraîné l’échec de votre inscription à { $productName }. Votre mode de paiement n’a pas été débité. Veuillez réessayer.
fxa-post-passwordless-sub-error = Votre abonnement est confirmé, mais la page de confirmation n’a pas pu être chargée. Veuillez consulter vos e-mails pour configurer votre compte.
newsletter-signup-error = Vous n’avez pas d’abonnement aux notifications par e-mail de mise à jour du produit. Vous pouvez réessayer dans les paramètres de votre compte.
product-plan-error =
    .title = Erreur de chargement des forfaits
product-profile-error =
    .title = Erreur de chargement de votre profil
product-customer-error =
    .title = Erreur de chargement du client
product-plan-not-found = Forfait introuvable
product-location-unsupported-error = Emplacement non pris en charge


coupon-success = Votre forfait sera automatiquement renouvelé au prix courant.
coupon-success-repeating = Votre forfait sera automatiquement renouvelé au bout de { $couponDurationDate } au prix courant.


new-user-step-1-2 = 1. Créez un { -product-mozilla-account }
new-user-card-title = Saisissez les informations de votre carte
new-user-submit = S’abonner maintenant


sub-update-payment-title = Informations de paiement


pay-with-heading-card-only = Payer par carte
product-invoice-preview-error-title = Erreur lors du chargement de l’aperçu de la facture
product-invoice-preview-error-text = Impossible de charger l’aperçu de la facture


subscription-iaperrorupgrade-title = Nous n’offrons pas encore cette mise à niveau


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Examinez vos modifications
sub-change-failed = La modification de votre forfait a échoué
sub-update-acknowledgment = Votre forfait changera immédiatement et un montant calculé au prorata vous sera facturé aujourd’hui pour le reste du cycle de facturation. À partir du { $startingDate }, le montant total vous sera facturé.
sub-change-submit = Confirmer la modification
sub-update-current-plan-label = Forfait actuel
sub-update-new-plan-label = Nouveau forfait
sub-update-total-label = Nouveau total
sub-update-prorated-upgrade = Mise à niveau calculée au prorata


sub-update-new-plan-daily = { $productName } (quotidien)
sub-update-new-plan-weekly = { $productName } (hebdomadaire)
sub-update-new-plan-monthly = { $productName } (mensuel)
sub-update-new-plan-yearly = { $productName } (annuel)
sub-update-prorated-upgrade-credit = Les soldes négatifs affichés seront crédités sur votre compte et utilisés pour vos prochaines factures.


sub-item-cancel-sub = Annuler l’abonnement
sub-item-stay-sub = Conserver l’abonnement


sub-item-cancel-msg = Vous ne pourrez plus utiliser { $name } après le { $period }, le dernier jour de votre cycle de facturation.
sub-item-cancel-confirm =
    Annuler mon accès et mes informations enregistrées dans
    { $name } le { $period }
sub-promo-coupon-applied = Bon de réduction { $promotion_name } appliqué : <priceDetails></priceDetails>
subscription-management-account-credit-balance = Ce paiement d’abonnement a entraîné un crédit sur le solde de votre compte : <priceDetails></priceDetails>


sub-route-idx-reactivating = Échec de la réactivation de l’abonnement
sub-route-idx-cancel-failed = Échec de l’annulation de l’abonnement
sub-route-idx-contact = Contacter l’assistance
sub-route-idx-cancel-msg-title = C’est triste de vous voir partir…
sub-route-idx-cancel-msg =
    Votre abonnement à { $name } a été résilié.
    <br />
    Vous aurez encore accès à { $name } jusqu’au { $date }.
sub-route-idx-cancel-aside-2 = Vous avez des questions ? Consultez <a>l’assistance de { -brand-mozilla }</a>.


sub-customer-error =
    .title = Erreur de chargement du client
sub-invoice-error =
    .title = Erreur de chargement des factures
sub-billing-update-success = Vos informations de facturation ont bien été mises à jour
sub-invoice-previews-error-title = Erreur lors du chargement des aperçus de factures
sub-invoice-previews-error-text = Impossible de charger les aperçus de factures


pay-update-change-btn = Changer
pay-update-manage-btn = Gérer


sub-next-bill = Prochaine facturation le { $date }
sub-next-bill-due-date = La prochaine facture est due le { $date }
sub-expires-on = Date d’expiration : { $date }




pay-update-card-exp = Expiration : { $expirationDate }
sub-route-idx-updating = Mise à jour des informations de facturation…
sub-route-payment-modal-heading = Informations de facturation invalides
sub-route-payment-modal-message-2 = Il semble y avoir une erreur avec votre compte { -brand-paypal }, veuillez prendre les mesures nécessaires pour résoudre ce problème de paiement.
sub-route-missing-billing-agreement-payment-alert = Informations de paiement invalides ; une erreur s’est produite avec votre compte. <div>Gérer</div>
sub-route-funding-source-payment-alert = Informations de paiement invalides ; une erreur s’est produite avec votre compte. Cette alerte peut prendre un certain temps à disparaitre après la mise à jour de vos informations. <div>Gérer</div>


sub-item-no-such-plan = Offre tarifaire inconnue pour cet abonnement.
invoice-not-found = Facture suivante introuvable
sub-item-no-such-subsequent-invoice = Facture suivante introuvable pour cet abonnement.
sub-invoice-preview-error-title = Aperçu de la facture introuvable
sub-invoice-preview-error-text = Aperçu de la facture introuvable pour cet abonnement


reactivate-confirm-dialog-header = Vous voulez continuer à utiliser { $name } ?
reactivate-confirm-copy = Vous garderez accès à { $name } et votre cycle de facturation et le paiement resteront les mêmes. Votre prochain paiement sera de { $amount } sur la carte se terminant par { $last } le { $endDate }.
reactivate-confirm-without-payment-method-copy = Vous garderez accès à { $name } et votre cycle de facturation et le paiement resteront les mêmes. Votre prochain paiement sera de { $amount } le { $endDate }.
reactivate-confirm-button = Se réabonner


reactivate-panel-copy = Vous perdrez l’accès à { $name } le <strong>{ $date }</strong>.
reactivate-success-copy = Merci ! Tout est prêt.
reactivate-success-button = Fermer


sub-iap-item-google-purchase-2 = { -brand-google } : achats via l’application
sub-iap-item-apple-purchase-2 = { -brand-apple } : inclut des achats intégrés
sub-iap-item-manage-button = Gérer
