



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



resend-code-success-banner-heading = Un nouveau code a été envoyé à votre adresse e-mail.
resend-link-success-banner-heading = Un nouveau lien a été envoyé à votre adresse e-mail.
resend-success-banner-description = Ajoutez { $accountsEmail } à vos contacts pour assurer la bonne réception des messages.


brand-banner-dismiss-button-2 =
    .aria-label = Fermer la bannière
brand-prelaunch-title = Les { -product-firefox-accounts } seront renommés { -product-mozilla-accounts } le 1er novembre
brand-prelaunch-subtitle = Vous pourrez toujours vous connecter avec le même nom d’utilisateur et le même mot de passe, et il n’y aura aucun autre changement concernant les produits que vous utilisez.
brand-postlaunch-title = Nous avons renommé les { -product-firefox-accounts } en { -product-mozilla-accounts }. Vous pourrez toujours vous connecter avec le même nom d’utilisateur et le même mot de passe, et il n’y aura aucun autre changement concernant les produits que vous utilisez.
brand-learn-more = En savoir plus
brand-close-banner =
    .alt = Fermer la bannière
brand-m-logo =
    .alt = Logo { -brand-mozilla } m


button-back-aria-label = Retour
button-back-title = Retour


recovery-key-download-button-v3 = Télécharger et continuer
    .title = Télécharger et continuer
recovery-key-pdf-heading = Clé de récupération du compte
recovery-key-pdf-download-date = Générée le : { $date }
recovery-key-pdf-key-legend = Clé de récupération du compte
recovery-key-pdf-instructions = Cette clé vous permet de récupérer les données chiffrées de votre navigateur (y compris les mots de passe, les marque-pages et l’historique) si vous oubliez votre mot de passe. Conservez-la à un endroit dont vous vous souviendrez.
recovery-key-pdf-storage-ideas-heading = Où conserver votre clé :
recovery-key-pdf-support = En savoir plus sur la clé de récupération de compte
recovery-key-pdf-download-error = Un problème est survenu lors du téléchargement de la clé de récupération de votre compte.


choose-newsletters-prompt-2 = Recevez plus d’informations de la part de { -brand-mozilla } :
choose-newsletters-option-latest-news =
    .label = Recevoir nos dernières actualités et actualités produit
choose-newsletters-option-test-pilot =
    .label = Accès en avant-première pour tester de nouveaux produits
choose-newsletters-option-reclaim-the-internet =
    .label = Actions pour reprendre le contrôle d’Internet


datablock-download =
    .message = Téléchargé
datablock-copy =
    .message = Copié
datablock-print =
    .message = Imprimé


datablock-copy-success =
    { $count ->
        [one] Code copié
       *[other] Codes copiés
    }
datablock-download-success =
    { $count ->
        [one] Code téléchargé
       *[other] Codes téléchargés
    }
datablock-print-success =
    { $count ->
        [one] Code imprimé
       *[other] Codes imprimés
    }


datablock-inline-copy =
    .message = Copié


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (approximatif)
device-info-block-location-region-country = { $region }, { $country } (approximatif)
device-info-block-location-city-country = { $city }, { $country } (approximatif)
device-info-block-location-country = { $country } (approximatif)
device-info-block-location-unknown = Lieu inconnu
device-info-browser-os = { $browserName } sur { $genericOSName }
device-info-ip-address = Adresse IP : { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Mot de passe
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Répéter le mot de passe
form-password-with-inline-criteria-signup-submit-button = Créer un compte
form-password-with-inline-criteria-reset-new-password =
    .label = Nouveau mot de passe
form-password-with-inline-criteria-confirm-password =
    .label = Confirmer le mot de passe
form-password-with-inline-criteria-reset-submit-button = Créer un nouveau mot de passe
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Mot de passe
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Répéter le mot de passe
form-password-with-inline-criteria-set-password-submit-button = Démarrer la synchronisation
form-password-with-inline-criteria-match-error = Les mots de passe ne correspondent pas
form-password-with-inline-criteria-sr-too-short-message = Le mot de passe doit contenir au moins 8 caractères.
form-password-with-inline-criteria-sr-not-email-message = Le mot de passe ne doit pas contenir votre adresse e-mail.
form-password-with-inline-criteria-sr-not-common-message = Le mot de passe ne doit pas être un mot de passe trop commun.
form-password-with-inline-criteria-sr-requirements-met = Le mot de passe saisi respecte toutes les exigences en matière de mots de passe.
form-password-with-inline-criteria-sr-passwords-match = Les mots de passe saisis correspondent.


form-verify-code-default-error = Ce champ est requis.


form-verify-totp-disabled-button-title-numeric = Saisissez le code à { $codeLength } chiffres pour continuer
form-verify-totp-disabled-button-title-alphanumeric = Saisissez le code de { $codeLength } caractères pour continuer


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Clé de récupération du compte { -brand-firefox }
get-data-trio-title-backup-verification-codes = Codes d’authentification de secours
get-data-trio-download-2 =
    .title = Télécharger
    .aria-label = Télécharger
get-data-trio-copy-2 =
    .title = Copier
    .aria-label = Copier
get-data-trio-print-2 =
    .title = Imprimer
    .aria-label = Imprimer


alert-icon-aria-label =
    .aria-label = Alerte
icon-attention-aria-label =
    .aria-label = Attention
icon-warning-aria-label =
    .aria-label = Avertissement
authenticator-app-aria-label =
    .aria-label = Authentificateur
backup-codes-icon-aria-label-v2 =
    .aria-label = Codes d’authentification de secours activés
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Codes d’authentification de secours désactivés
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS de récupération activé
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS de récupération désactivé
canadian-flag-icon-aria-label =
    .aria-label = Drapeau canadien
checkmark-icon-aria-label =
    .aria-label = Sélectionner
checkmark-success-icon-aria-label =
    .aria-label = Effectué
checkmark-enabled-icon-aria-label =
    .aria-label = Activé
close-icon-aria-label =
    .aria-label = Fermer le message
code-icon-aria-label =
    .aria-label = Code
error-icon-aria-label =
    .aria-label = Erreur
info-icon-aria-label =
    .aria-label = Informations
usa-flag-icon-aria-label =
    .aria-label = Drapeau des États-Unis


hearts-broken-image-aria-label =
    .aria-label = Un ordinateur, un téléphone portable et une image d’un cœur brisé sur chacun d’eux
hearts-verified-image-aria-label =
    .aria-label = Un ordinateur, un téléphone portable et une tablette avec un cœur qui bat sur chacun
signin-recovery-code-image-description =
    .aria-label = Document contenant du texte masqué.
signin-totp-code-image-label =
    .aria-label = Un appareil avec un code caché à 6 chiffres.
confirm-signup-aria-label =
    .aria-label = Une enveloppe contenant un lien
security-shield-aria-label =
    .aria-label = Illustration représentant une clé de récupération de compte.
recovery-key-image-aria-label =
    .aria-label = Illustration représentant une clé de récupération de compte.
password-image-aria-label =
    .aria-label = Une illustration pour représenter la saisie d’un mot de passe.
lightbulb-aria-label =
    .aria-label = Illustration représentant la création d’un indice de lieu de stockage.
email-code-image-aria-label =
    .aria-label = Illustration pour représenter un e-mail contenant un code.
recovery-phone-image-description =
    .aria-label = Appareil mobile qui reçoit un code par SMS.
recovery-phone-code-image-description =
    .aria-label = Code reçu sur un appareil mobile.
backup-recovery-phone-image-aria-label =
    .aria-label = Appareil mobile avec capacité d’envoi de SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Écran de l’appareil avec des codes
sync-clouds-image-aria-label =
    .aria-label = Nuages avec une icône de synchronisation
confetti-falling-image-aria-label =
    .aria-label = Animation de confettis qui tombent


inline-recovery-key-setup-signed-in-firefox-2 = Vous êtes connecté·e à { -brand-firefox }.
inline-recovery-key-setup-create-header = Sécurisez votre compte
inline-recovery-key-setup-create-subheader = Avez-vous une minute pour protéger vos données ?
inline-recovery-key-setup-info = Créez une clé de récupération de compte afin de pouvoir restaurer vos données de navigation synchronisées si jamais vous oubliez votre mot de passe.
inline-recovery-key-setup-start-button = Créer une clé de récupération de compte
inline-recovery-key-setup-later-button = Le faire plus tard


input-password-hide = Masquer le mot de passe
input-password-show = Afficher le mot de passe
input-password-hide-aria-2 = Votre mot de passe est actuellement visible à l’écran.
input-password-show-aria-2 = Votre mot de passe est actuellement masqué.
input-password-sr-only-now-visible = Votre mot de passe est désormais visible à l’écran.
input-password-sr-only-now-hidden = Votre mot de passe est maintenant masqué.


input-phone-number-country-list-aria-label = Sélectionnez un pays
input-phone-number-enter-number = Saisissez un numéro de téléphone
input-phone-number-country-united-states = États-Unis
input-phone-number-country-canada = Canada
legal-back-button = Retour


reset-pwd-link-damaged-header = Le lien de réinitialisation du mot de passe est endommagé
signin-link-damaged-header = Lien de confirmation altéré
report-signin-link-damaged-header = Lien endommagé
reset-pwd-link-damaged-message = Le lien sur lequel vous avez cliqué était incomplet, probablement à cause de votre client de messagerie. Veuillez vous assurer de copier l’adresse complète puis réessayez.


link-expired-new-link-button = Recevoir un nouveau lien


remember-password-text = Vous vous souvenez de votre mot de passe ?
remember-password-signin-link = Connectez-vous


primary-email-confirmation-link-reused = Adresse e-mail principale déjà confirmée
signin-confirmation-link-reused = Connexion déjà confirmée
confirmation-link-reused-message = Ce lien de confirmation a déjà été utilisé et ne peut être utilisé qu’une seule fois.


locale-toggle-select-label = Choisir la langue
locale-toggle-browser-default = Navigateur par défaut
error-bad-request = Requête incorrecte


password-info-balloon-why-password-info = Vous avez besoin de ce mot de passe pour accéder aux données chiffrées que vous stockez chez nous.
password-info-balloon-reset-risk-info = Une réinitialisation implique potentiellement la perte de données telles que les mots de passe et les marque-pages.


password-strength-long-instruction = Choisissez un mot de passe compliqué que vous n’avez pas utilisé sur d’autres sites. Assurez-vous qu’il répond aux exigences de sécurité :
password-strength-short-instruction = Choisissez un mot de passe compliqué :
password-strength-inline-min-length = Au moins 8 caractères
password-strength-inline-not-email = Pas votre adresse e-mail
password-strength-inline-not-common = Pas un mot de passe trop commun
password-strength-inline-confirmed-must-match = La confirmation correspond au nouveau mot de passe
password-strength-inline-passwords-match = Les mots de passe correspondent


account-recovery-notification-cta = Créer
account-recovery-notification-header-value = Ne perdez pas vos données si vous oubliez votre mot de passe
account-recovery-notification-header-description = Créez une clé de récupération de compte pour restaurer vos données de navigation synchronisées si jamais vous oubliez votre mot de passe.
recovery-phone-promo-cta = Ajouter un numéro de téléphone de secours
recovery-phone-promo-heading = Ajoutez une protection supplémentaire à votre compte avec un numéro de téléphone de secours
recovery-phone-promo-description = Vous pouvez désormais vous connecter par SMS avec un mot de passe à usage unique si vous ne pouvez pas utiliser votre application d’authentification en deux étapes.
recovery-phone-promo-info-link = En savoir plus sur la récupération et les risques d’échange de SIM
promo-banner-dismiss-button =
    .aria-label = Fermer la bannière


ready-complete-set-up-instruction = Terminez la configuration en saisissant votre nouveau mot de passe sur vos autres appareils { -brand-firefox }.
manage-your-account-button = Gérer votre compte
ready-use-service = { $serviceName } est maintenant prêt à être utilisé.
ready-use-service-default = Vous pouvez maintenant accéder aux paramètres du compte
ready-account-ready = Votre compte est prêt !
ready-continue = Continuer
sign-in-complete-header = Connexion confirmée
sign-up-complete-header = Compte confirmé
primary-email-verified-header = Adresse e-mail principale confirmée


flow-recovery-key-download-storage-ideas-heading-v2 = Où conserver votre clé :
flow-recovery-key-download-storage-ideas-folder-v2 = Un dossier sur un appareil sécurisé
flow-recovery-key-download-storage-ideas-cloud = Stockage cloud fiable
flow-recovery-key-download-storage-ideas-print-v2 = Une copie papier
flow-recovery-key-download-storage-ideas-pwd-manager = Gestionnaire de mots de passe


flow-recovery-key-hint-header-v2 = Ajouter un indice pour vous aider à retrouver votre clé
flow-recovery-key-hint-message-v3 = Cet indice a pour but de vous aider à vous souvenir où vous avez stocké la clé de récupération de votre compte. Nous pourrons vous l’afficher lors de la réinitialisation du mot de passe afin de récupérer vos données.
flow-recovery-key-hint-input-v2 =
    .label = Saisir un indice (facultatif)
flow-recovery-key-hint-cta-text = Terminer
flow-recovery-key-hint-char-limit-error = L’indice doit contenir moins de 225 caractères.
flow-recovery-key-hint-unsafe-char-error = L’indice ne peut pas contenir de caractères Unicode non sûrs. Seuls les lettres, les nombres, les signes de ponctuation et les symboles sont autorisés.


password-reset-warning-icon = Avertissement
password-reset-chevron-expanded = Réduire l’avertissement
password-reset-chevron-collapsed = Développer l’avertissement
password-reset-data-may-not-be-recovered = Les données de votre navigateur pourraient ne pas été récupérées
password-reset-previously-signed-in-device-2 = Vous disposez d’un appareil sur lequel vous vous êtes déjà connecté·e ?
password-reset-data-may-be-saved-locally-2 = Les données de votre navigateur sont peut-être enregistrées sur cet appareil. Réinitialisez votre mot de passe, puis connectez-vous pour restaurer et synchroniser vos données.
password-reset-no-old-device-2 = Vous avez un nouvel appareil mais vous n’avez plus accès à vos anciens appareils ?
password-reset-encrypted-data-cannot-be-recovered-2 = Nous sommes désolés, mais vos données de navigateur chiffrées sur les serveurs de { -brand-firefox } ne peuvent pas être récupérées.
password-reset-warning-have-key = Vous disposez d’une clé de récupération de compte ?
password-reset-warning-use-key-link = Utilisez-la maintenant pour réinitialiser votre mot de passe et conserver vos données


alert-bar-close-message = Fermer le message


avatar-your-avatar =
    .alt = Votre avatar
avatar-default-avatar =
    .alt = Avatar par défaut




bento-menu-title-3 = Produits { -brand-mozilla }
bento-menu-tagline = Autres produits de { -brand-mozilla } qui protègent votre vie privée
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Navigateur { -brand-firefox } pour ordinateur
bento-menu-firefox-mobile = Navigateur { -brand-firefox } pour mobile
bento-menu-made-by-mozilla = Conçu par { -brand-mozilla }


connect-another-fx-mobile = Installez { -brand-firefox } sur mobile ou tablette
connect-another-find-fx-mobile-2 = Recherchez { -brand-firefox } sur { -google-play } et l’{ -app-store }.
connect-another-play-store-image-2 =
    .alt = Télécharger { -brand-firefox } sur { -google-play }
connect-another-app-store-image-3 =
    .alt = Télécharger { -brand-firefox } sur l’{ -app-store }


cs-heading = Services connectés
cs-description = Tout ce que vous utilisez et auquel vous vous êtes connecté·e.
cs-cannot-refresh = Désolé, un problème est survenu lors de l’actualisation de la liste des services connectés.
cs-cannot-disconnect = Client introuvable, impossible de se déconnecter
cs-logged-out-2 = Déconnecté·e de { $service }.
cs-refresh-button =
    .title = Actualiser les services connectés
cs-missing-device-help = Éléments manquants ou dupliqués ?
cs-disconnect-sync-heading = Se déconnecter de Sync


cs-disconnect-sync-content-3 = Vos données de navigation seront conservées sur <span>{ $device }</span>, mais elles ne seront plus synchronisées avec votre compte.
cs-disconnect-sync-reason-3 = Quelle est la raison principale de la déconnexion de <span>{ $device }</span> ?


cs-disconnect-sync-opt-prefix = L’appareil est :
cs-disconnect-sync-opt-suspicious = Suspect
cs-disconnect-sync-opt-lost = Perdu ou volé
cs-disconnect-sync-opt-old = Ancien ou remplacé
cs-disconnect-sync-opt-duplicate = Un doublon
cs-disconnect-sync-opt-not-say = Je préfère ne rien indiquer


cs-disconnect-advice-confirm = J’ai compris
cs-disconnect-lost-advice-heading = L’appareil perdu ou volé a été déconnecté
cs-disconnect-lost-advice-content-3 = Puisque votre appareil a été perdu ou volé, vous devriez changer le mot de passe de votre { -product-mozilla-account } dans les paramètres du compte afin de protéger vos informations. Vous devriez également vous informer auprès du fabricant de l’appareil pour savoir comment effacer vos données à distance.
cs-disconnect-suspicious-advice-heading = L’appareil suspect est déconnecté.
cs-disconnect-suspicious-advice-content-2 = Si l’appareil déconnecté est effectivement suspect, pour protéger vos informations, vous devez modifier le mot de passe de votre { -product-mozilla-account } dans les paramètres de votre compte. Vous devriez également modifier tout autre mot de passe que vous auriez enregistré dans { -brand-firefox } en tapant about:logins dans la barre d’adresse.
cs-sign-out-button = Se déconnecter


dc-heading = Collecte et utilisation de données
dc-subheader-moz-accounts = { -product-mozilla-accounts(capitalization: "uppercase") }
dc-subheader-ff-browser = Navigateur { -brand-firefox }
dc-subheader-content-2 = Autoriser les { -product-mozilla-accounts } à envoyer des données techniques et d’interaction à { -brand-mozilla }.
dc-subheader-ff-content = Pour consulter ou mettre à jour les paramètres des données techniques et d’interaction de votre navigateur { -brand-firefox }, ouvrez les paramètres de { -brand-firefox } et accédez à la section Vie privée et sécurité.
dc-opt-out-success-2 = Désactivation réussie. Les { -product-mozilla-accounts } n’enverront plus de données techniques ou d’interaction à { -brand-mozilla }.
dc-opt-in-success-2 = Merci ! Le partage de ces données nous aide à améliorer les { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Un problème est survenu lors de la modification de vos préférences en matière de collecte de données
dc-learn-more = En savoir plus


drop-down-menu-title-2 = Menu { -product-mozilla-account(capitalization: "uppercase") }
drop-down-menu-signed-in-as-v2 = Connecté·e en tant que
drop-down-menu-sign-out = Déconnexion
drop-down-menu-sign-out-error-2 = Un problème est survenu lors de votre déconnexion


flow-container-back = Retour


flow-recovery-key-confirm-pwd-heading-v2 = Saisissez à nouveau votre mot de passe par sécurité
flow-recovery-key-confirm-pwd-input-label = Saisissez votre mot de passe
flow-recovery-key-confirm-pwd-submit-button = Créer une clé de récupération de compte
flow-recovery-key-confirm-pwd-submit-button-change-key = Créer une nouvelle clé de récupération de compte


flow-recovery-key-download-heading-v2 = Clé de récupération de compte créée — Téléchargez-la et conservez-la maintenant
flow-recovery-key-download-info-v2 = Cette clé vous permet de récupérer vos données si vous oubliez votre mot de passe. Téléchargez-la maintenant et conservez-la en lieu sûr — vous ne pourrez pas revenir sur cette page ultérieurement.
flow-recovery-key-download-next-link-v2 = Continuer sans télécharger


flow-recovery-key-success-alert = Clé de récupération de compte créée


flow-recovery-key-info-header = Créez une clé de récupération de compte au cas où vous oublieriez votre mot de passe
flow-recovery-key-info-header-change-key = Modifier la clé de récupération de votre compte
flow-recovery-key-info-shield-bullet-point-v2 = Nous chiffrons les données de navigation (mots de passe, marque-pages, etc.). C’est excellent pour la vie privée, mais vous risquez de perdre vos données si vous oubliez votre mot de passe.
flow-recovery-key-info-key-bullet-point-v2 = C’est pourquoi créer une clé de récupération de compte est si important : vous pouvez l’utiliser pour restaurer vos données.
flow-recovery-key-info-cta-text-v3 = Commencer
flow-recovery-key-info-cancel-link = Annuler


flow-setup-2fa-qr-heading = Connectez-vous à votre application d’authentification
flow-setup-2a-qr-instruction = <strong>Étape 1 :</strong> scannez ce code QR en utilisant n’importe quelle application d’authentification, comme Duo ou Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = Code QR pour configurer l’authentification en deux étapes. Scannez-le, ou choisissez « Impossible de scanner le code QR ? » pour obtenir une clé secrète d’installation à la place.
flow-setup-2fa-cant-scan-qr-button = Impossible de scanner le code QR ?
flow-setup-2fa-manual-key-heading = Saisissez le code manuellement
flow-setup-2fa-manual-key-instruction = <strong>Étape 1 :</strong> saisissez ce code dans votre application d’authentification préférée.
flow-setup-2fa-scan-qr-instead-button = Scanner plutôt un code QR ?
flow-setup-2fa-more-info-link = En savoir plus sur les applications d’authentification
flow-setup-2fa-button = Continuer
flow-setup-2fa-step-2-instruction = <strong>Étape 2 :</strong> saisissez le code de votre application d’authentification.
flow-setup-2fa-input-label = Saisissez le code à 6 chiffres
flow-setup-2fa-code-error = Code invalide ou expiré. Consultez votre application d’authentification et réessayez.


flow-setup-2fa-backup-choice-heading = Choisissez une méthode de récupération
flow-setup-2fa-backup-choice-description = Cela vous permet de vous connecter si vous ne pouvez pas accéder à votre appareil mobile ou à votre application d’authentification.
flow-setup-2fa-backup-choice-phone-title = Numéro de téléphone de secours
flow-setup-2fa-backup-choice-phone-badge = Le plus facile
flow-setup-2fa-backup-choice-phone-info = Recevez un code de secours par SMS. Actuellement disponible aux États-Unis et au Canada.
flow-setup-2fa-backup-choice-code-title = Codes d’authentification de secours
flow-setup-2fa-backup-choice-code-badge = Le plus sûr
flow-setup-2fa-backup-choice-code-info = Créez et enregistrez des codes d’authentification à usage unique.
flow-setup-2fa-backup-choice-learn-more-link = En savoir plus sur la récupération et les risques d’échange de SIM


flow-setup-2fa-backup-code-confirm-heading = Saisissez un code d’authentification de secours
flow-setup-2fa-backup-code-confirm-confirm-saved = Confirmez que vous avez enregistré vos codes en en saisissant un. Sans ces codes, vous ne pourrez peut-être pas vous connecter si vous ne disposez pas de votre application d’authentification.
flow-setup-2fa-backup-code-confirm-code-input = Saisissez le code de 10 caractères
flow-setup-2fa-backup-code-confirm-button-finish = Terminer


flow-setup-2fa-backup-code-dl-heading = Enregistrez vos codes d’authentification de secours
flow-setup-2fa-backup-code-dl-save-these-codes = Conservez-les en lieu sûr. Si vous n’avez pas accès à votre application d’authentification, vous devrez en saisir un pour vous connecter.
flow-setup-2fa-backup-code-dl-button-continue = Continuer


flow-setup-2fa-inline-complete-success-banner = Authentification en deux étapes activée
flow-setup-2fa-inline-complete-success-banner-description = Afin de protéger tous vos appareils connectés, vous devriez vous déconnecter partout où vous utilisez ce compte, puis vous reconnecter en utilisant votre nouvelle authentification en deux étapes.
flow-setup-2fa-inline-complete-backup-code = Codes d’authentification de secours
flow-setup-2fa-inline-complete-backup-phone = Numéro de téléphone de secours
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } code restant
       *[other] { $count } codes restants
    }
flow-setup-2fa-inline-complete-backup-code-description = Il s’agit de la méthode de récupération la plus sûre si vous ne pouvez pas vous connecter avec votre appareil mobile ou l’application d’authentification.
flow-setup-2fa-inline-complete-backup-phone-description = Il s’agit de la méthode de récupération la plus simple si vous ne pouvez pas vous connecter avec votre application d’authentification.
flow-setup-2fa-inline-complete-learn-more-link = En quoi cela protège votre compte
flow-setup-2fa-inline-complete-continue-button = Continuer vers { $serviceName }
flow-setup-2fa-prompt-heading = Configurer l’authentification en deux étapes
flow-setup-2fa-prompt-description = { $serviceName } vous demande de configurer l’authentification en deux étapes pour protéger votre compte.
flow-setup-2fa-prompt-use-authenticator-apps = Vous pouvez utiliser <authenticationAppsLink>n’importe laquelle de ces applications d’authentification</authenticationAppsLink> pour continuer.
flow-setup-2fa-prompt-continue-button = Continuer


flow-setup-phone-confirm-code-heading = Saisissez le code de vérification
flow-setup-phone-confirm-code-instruction = Un code à six chiffres a été envoyé au <span>{ $phoneNumber }</span> par SMS. Ce code expire au bout de 5 minutes.
flow-setup-phone-confirm-code-input-label = Saisissez le code à 6 chiffres
flow-setup-phone-confirm-code-button = Confirmer
flow-setup-phone-confirm-code-expired = Code expiré ?
flow-setup-phone-confirm-code-resend-code-button = Renvoyer le code
flow-setup-phone-confirm-code-resend-code-success = Code envoyé
flow-setup-phone-confirm-code-success-message-v2 = Numéro de téléphone de secours ajouté
flow-change-phone-confirm-code-success-message = Numéro de téléphone de secours modifié


flow-setup-phone-submit-number-heading = Vérifiez votre numéro de téléphone
flow-setup-phone-verify-number-instruction = Vous recevrez un SMS de { -brand-mozilla } avec un code pour vérifier votre numéro. Ne partagez pas ce code avec qui que ce soit.
flow-setup-phone-submit-number-info-message-v2 = Le numéro de téléphone de secours est uniquement disponible aux États-Unis et au Canada. Les numéros VoIP et les alias de numéro de téléphone ne sont pas recommandés.
flow-setup-phone-submit-number-legal = En fournissant votre numéro, vous acceptez que nous le conservions pour vous envoyer des SMS dans l’unique but de vérifier votre compte. Des frais de communication peuvent s’appliquer.
flow-setup-phone-submit-number-button = Envoyer le code


header-menu-open = Fermer le menu
header-menu-closed = Menu de navigation du site
header-back-to-top-link =
    .title = Haut de la page
header-back-to-settings-link =
    .title = Retour aux paramètres du { -product-mozilla-account }
header-title-2 = { -product-mozilla-account(capitalization: "uppercase") }
header-help = Aide


la-heading = Comptes liés
la-description = Vous avez autorisé l’accès aux comptes suivants.
la-unlink-button = Dissocier
la-unlink-account-button = Dissocier
la-set-password-button = Définir un mot de passe
la-unlink-heading = Dissocier du compte tiers
la-unlink-content-3 = Voulez-vous vraiment dissocier votre compte ? La dissociation de votre compte ne vous déconnecte pas automatiquement de vos Services connectés. Pour ce faire, vous devrez vous déconnecter manuellement depuis la section Services connectés.
la-unlink-content-4 = Avant de dissocier votre compte, vous devez définir un mot de passe. Sans mot de passe, vous ne pourrez plus vous connecter après avoir dissocié votre compte.
nav-linked-accounts = { la-heading }


modal-close-title = Fermer
modal-cancel-button = Annuler
modal-default-confirm-button = Confirmer


modal-mfa-protected-title = Saisissez le code de confirmation
modal-mfa-protected-subtitle = Aidez-nous à nous assurer que vous êtes à l’origine de la modification des informations de votre compte
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Saisissez le code envoyé à <email>{ $email }</email> d’ici { $expirationTime } minute.
       *[other] Saisissez le code envoyé à <email>{ $email }</email> dans les { $expirationTime } minutes.
    }
modal-mfa-protected-input-label = Saisissez le code à 6 chiffres
modal-mfa-protected-cancel-button = Annuler
modal-mfa-protected-confirm-button = Confirmer
modal-mfa-protected-code-expired = Code expiré ?
modal-mfa-protected-resend-code-link = Envoyez un nouveau code.


mvs-verify-your-email-2 = Confirmez votre adresse e-mail
mvs-enter-verification-code-2 = Saisissez votre code de confirmation
mvs-enter-verification-code-desc-2 = Veuillez saisir au cours des 5 prochaines minutes le code de confirmation envoyé à <email>{ $email }</email>.
msv-cancel-button = Annuler
msv-submit-button-2 = Confirmer


nav-settings = Paramètres
nav-profile = Profil
nav-security = Sécurité
nav-connected-services = Services connectés
nav-data-collection = Collecte et utilisation de données
nav-paid-subs = Abonnements payants
nav-email-comm = Communications électroniques


page-2fa-change-title = Modifier l’authentification en deux étapes
page-2fa-change-success = L’authentification en deux étapes a été mise à jour
page-2fa-change-success-additional-message = Afin de protéger tous vos appareils connectés, vous devriez vous déconnecter partout où vous utilisez ce compte, puis vous reconnecter en utilisant votre nouvelle authentification en deux étapes.
page-2fa-change-totpinfo-error = Une erreur s’est produite lors du remplacement de votre application d’authentification en deux étapes. Réessayez plus tard.
page-2fa-change-qr-instruction = <strong>Étape 1 :</strong> scannez ce code QR en utilisant n’importe quelle application d’authentification, comme Duo ou Google Authenticator. Ceci crée une nouvelle connexion, les anciennes connexions ne fonctionneront plus.


tfa-backup-codes-page-title = Codes d’authentification de secours
tfa-replace-code-error-3 = Un problème est survenu lors du remplacement de vos codes d’authentification de secours
tfa-create-code-error = Un problème est survenu lors de la création de vos codes d’authentification de secours
tfa-replace-code-success-alert-4 = Codes d’authentification de secours mis à jour
tfa-create-code-success-alert = Codes d’authentification de secours créés
tfa-replace-code-download-description = Conservez-les en lieu sûr. Vos anciens codes seront remplacés à la fin de l’étape suivante.
tfa-replace-code-confirm-description = Saisissez-en un après avoir enregistré vos codes. Vos anciens codes d’authentification de secours seront désactivés une fois cette étape terminée.
tfa-incorrect-recovery-code-1 = Code d’authentification de secours incorrect


page-2fa-setup-title = Authentification en deux étapes
page-2fa-setup-totpinfo-error = Une erreur s’est produite lors de la configuration de l’authentification en deux étapes. Réessayez plus tard.
page-2fa-setup-incorrect-backup-code-error = Ce code est incorrect. Veuillez réessayer.
page-2fa-setup-success = L’authentification en deux étapes a été activée
page-2fa-setup-success-additional-message = Afin de protéger tous vos appareils connectés, vous devriez vous déconnecter partout où vous utilisez ce compte, puis vous reconnecter en utilisant l’authentification en deux étapes.


avatar-page-title =
    .title = Image de profil
avatar-page-add-photo = Ajouter une photo
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Prendre une photo
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Supprimer la photo
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Prendre à nouveau une photo
avatar-page-cancel-button = Annuler
avatar-page-save-button = Enregistrer
avatar-page-saving-button = Enregistrement…
avatar-page-zoom-out-button =
    .title = Diminuer la taille
avatar-page-zoom-in-button =
    .title = Augmenter la taille
avatar-page-rotate-button =
    .title = Faire pivoter
avatar-page-camera-error = Impossible d’initialiser l’appareil photo
avatar-page-new-avatar =
    .alt = nouvelle image de profil
avatar-page-file-upload-error-3 = Un problème est survenu durant l’envoi de votre image de profil
avatar-page-delete-error-3 = Un problème est survenu lors de la suppression de votre image de profil
avatar-page-image-too-large-error-2 = Cette image est trop volumineuse pour être envoyée.


pw-change-header =
    .title = Changement de mot de passe
pw-8-chars = Au moins 8 caractères
pw-not-email = Pas votre adresse e-mail
pw-change-must-match = Le nouveau mot de passe correspond à la confirmation
pw-commonly-used = Pas un mot de passe trop commun
pw-tips = Protégez-vous — ne réutilisez pas vos mots de passe. Voici plus de conseils pour <linkexternal>créer des mots de passe robustes</linkexternal>.
pw-change-cancel-button = Annuler
pw-change-save-button = Enregistrer
pw-change-forgot-password-link = Mot de passe oublié ?
pw-change-current-password =
    .label = Saisissez votre mot de passe actuel
pw-change-new-password =
    .label = Saisissez le nouveau mot de passe
pw-change-confirm-password =
    .label = Confirmez le nouveau mot de passe
pw-change-success-alert-2 = Mot de passe mis à jour


pw-create-header =
    .title = Créer un mot de passe
pw-create-success-alert-2 = Mot de passe défini
pw-create-error-2 = Un problème est survenu lors de la création de votre mot de passe


delete-account-header =
    .title = Supprimer le compte
delete-account-step-1-2 = Étape 1 sur 2
delete-account-step-2-2 = Étape 2 sur 2
delete-account-confirm-title-4 = Votre { -product-mozilla-account } a pu être connecté à un ou plusieurs produits ou services { -brand-mozilla } qui vous permettent de naviguer de façon sécurisée et d’améliorer votre productivité sur le Web :
delete-account-product-mozilla-account = { -product-mozilla-account(capitalization: "uppercase") }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synchronisation des données { -brand-firefox }
delete-account-product-firefox-addons = Modules complémentaires { -brand-firefox }
delete-account-acknowledge = En supprimant votre compte, vous reconnaissez que :
delete-account-chk-box-1-v4 =
    .label = Tous les abonnements payants dont vous disposez seront résiliés
delete-account-chk-box-2 =
    .label = Vous risquez de perdre des informations enregistrées et des fonctionnalités dans les produits { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Réactiver le compte avec cette adresse e-mail peut ne pas restaurer vos informations enregistrées
delete-account-chk-box-4 =
    .label = Toutes les extensions et tous les thèmes que vous avez publiés sur addons.mozilla.org seront supprimés
delete-account-continue-button = Continuer
delete-account-password-input =
    .label = Saisissez votre mot de passe
delete-account-cancel-button = Annuler
delete-account-delete-button-2 = Supprimer


display-name-page-title =
    .title = Nom d’affichage
display-name-input =
    .label = Saisissez le nom à afficher
submit-display-name = Enregistrer
cancel-display-name = Annuler
display-name-update-error-2 = Un problème est survenu lors de la mise à jour de votre nom d’affichage.
display-name-success-alert-2 = Nom d’affichage mis à jour


recent-activity-title = Activité récente du compte
recent-activity-account-create-v2 = Compte créé
recent-activity-account-disable-v2 = Compte désactivé
recent-activity-account-enable-v2 = Compte activé
recent-activity-account-login-v2 = Connexion au compte initiée
recent-activity-account-reset-v2 = Réinitialisation du mot de passe initiée
recent-activity-emails-clearBounces-v2 = Alerte de refus d’e-mails supprimée
recent-activity-account-login-failure = Échec de tentative de connexion au compte
recent-activity-account-two-factor-added = Authentification en deux étapes activée
recent-activity-account-two-factor-requested = Authentification en deux étapes demandée
recent-activity-account-two-factor-failure = Échec de l’authentification en deux étapes
recent-activity-account-two-factor-success = Authentification en deux étapes réussie
recent-activity-account-two-factor-removed = Authentification en deux étapes désactivée
recent-activity-account-password-reset-requested = Réinitialisation du mot de passe demandée par le compte
recent-activity-account-password-reset-success = Le mot de passe du compte a été réinitialisé
recent-activity-account-recovery-key-added = Clé de récupération du compte activée
recent-activity-account-recovery-key-verification-failure = Échec de la vérification de la clé de récupération du compte
recent-activity-account-recovery-key-verification-success = Vérification de la clé de récupération du compte réussie
recent-activity-account-recovery-key-removed = Clé de récupération du compte supprimée
recent-activity-account-password-added = Nouveau mot de passe ajouté
recent-activity-account-password-changed = Mot de passe changé
recent-activity-account-secondary-email-added = Adresse e-mail secondaire ajoutée
recent-activity-account-secondary-email-removed = Adresse e-mail secondaire supprimée
recent-activity-account-emails-swapped = Les adresses e-mail principale et secondaire ont été interverties
recent-activity-session-destroy = Déconnecté·e de la session
recent-activity-account-recovery-phone-send-code = Code de secours envoyé au numéro de téléphone
recent-activity-account-recovery-phone-setup-complete = Configuration du numéro de téléphone de secours terminée
recent-activity-account-recovery-phone-signin-complete = Connexion avec le numéro de téléphone de secours effectuée
recent-activity-account-recovery-phone-signin-failed = Échec de connexion avec le numéro de téléphone de secours
recent-activity-account-recovery-phone-removed = Le numéro de téléphone de secours a été supprimé
recent-activity-account-recovery-codes-replaced = Codes de secours remplacés
recent-activity-account-recovery-codes-created = Codes de secours créés
recent-activity-account-recovery-codes-signin-complete = Connexion avec les codes de secours effectuée
recent-activity-password-reset-otp-sent = Code de confirmation de réinitialisation du mot de passe envoyé
recent-activity-password-reset-otp-verified = Code de confirmation de réinitialisation du mot de passe vérifié
recent-activity-must-reset-password = Réinitialisation du mot de passe nécessaire
recent-activity-unknown = Autre activité du compte


recovery-key-create-page-title = Clé de récupération de compte
recovery-key-create-back-button-title = Retour aux paramètres


recovery-phone-remove-header = Supprimer le numéro de téléphone de secours
settings-recovery-phone-remove-info = Le numéro de téléphone de secours <strong>{ $formattedFullPhoneNumber }</strong> sera supprimé.
settings-recovery-phone-remove-recommend = Nous vous recommandons de conserver cette méthode, car elle est plus facile à utiliser que d’enregistrer des codes d’authentification de secours.
settings-recovery-phone-remove-recovery-methods = Si vous supprimez cette méthode, assurez-vous de conserver les codes d’authentification de secours que vous avez enregistrés. <linkExternal>Comparer les méthodes de récupération</linkExternal>
settings-recovery-phone-remove-button = Supprimer le numéro de téléphone
settings-recovery-phone-remove-cancel = Annuler
settings-recovery-phone-remove-success = Le numéro de téléphone de secours a été supprimé


page-setup-recovery-phone-heading = Ajoutez un numéro de téléphone de secours
page-change-recovery-phone = Modifier le numéro de téléphone de secours
page-setup-recovery-phone-back-button-title = Retour aux paramètres
page-setup-recovery-phone-step2-back-button-title = Modifier le numéro de téléphone


add-secondary-email-step-1 = Étape 1 sur 2
add-secondary-email-error-2 = Un problème est survenu lors de la création de cette adresse e-mail
add-secondary-email-page-title =
    .title = Adresse e-mail secondaire
add-secondary-email-enter-address =
    .label = Saisissez votre adresse e-mail
add-secondary-email-cancel-button = Annuler
add-secondary-email-save-button = Enregistrer
add-secondary-email-mask = Les alias de messagerie ne peuvent pas être utilisés comme adresse e-mail secondaire


add-secondary-email-step-2 = Étape 2 sur 2
verify-secondary-email-page-title =
    .title = Adresse e-mail secondaire
verify-secondary-email-verification-code-2 =
    .label = Saisissez votre code de confirmation
verify-secondary-email-cancel-button = Annuler
verify-secondary-email-verify-button-2 = Confirmer
verify-secondary-email-please-enter-code-2 = Veuillez saisir au cours des 5 prochaines minutes le code de confirmation envoyé à <strong>{ $email }</strong>.
verify-secondary-email-success-alert-2 = L’adresse { $email } a bien été ajoutée
verify-secondary-email-resend-code-button = Renvoyer le code de confirmation


delete-account-link = Supprimer le compte
inactive-update-status-success-alert = Connexion réussie. Votre { -product-mozilla-account } et vos données resteront actifs.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Découvrez où vos informations personnelles ont fuité et reprenez le contrôle
product-promo-monitor-cta = Effectuer un scan gratuit


profile-heading = Profil
profile-picture =
    .header = Photo
profile-display-name =
    .header = Nom d’affichage
profile-primary-email =
    .header = Adresse e-mail principale


progress-bar-aria-label-v2 = Étape { $currentStep } sur { $numberOfSteps }.


security-heading = Sécurité
security-password =
    .header = Mot de passe
security-password-created-date = Créé le { $date }
security-not-set = Non défini
security-action-create = Créer
security-set-password = Définissez un mot de passe pour synchroniser et utiliser certaines fonctionnalités de sécurité du compte.
security-recent-activity-link = Voir l’activité récente du compte
signout-sync-header = Session expirée
signout-sync-session-expired = Désolé, une erreur s’est produite. Veuillez vous déconnecter depuis le menu du navigateur puis réessayer.


tfa-row-backup-codes-title = Codes d’authentification de secours
tfa-row-backup-codes-not-available = Aucun code disponible
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } code restant
       *[other] { $numCodesAvailable } codes restants
    }
tfa-row-backup-codes-get-new-cta-v2 = Créer de nouveaux codes
tfa-row-backup-codes-add-cta = Ajouter
tfa-row-backup-codes-description-2 = Il s’agit de la méthode de récupération la plus sûre si vous ne pouvez pas utiliser votre appareil mobile ou votre application d’authentification.
tfa-row-backup-phone-title-v2 = Numéro de téléphone de secours
tfa-row-backup-phone-not-available-v2 = Aucun numéro de téléphone ajouté
tfa-row-backup-phone-change-cta = Modifier
tfa-row-backup-phone-add-cta = Ajouter
tfa-row-backup-phone-delete-button = Supprimer
tfa-row-backup-phone-delete-title-v2 = Supprimer le numéro de téléphone de secours
tfa-row-backup-phone-delete-restriction-v2 = Si vous souhaitez supprimer votre numéro de téléphone de secours, ajoutez des codes d’authentification de secours ou désactivez d’abord l’authentification en deux étapes pour éviter de perdre l’accès à votre compte.
tfa-row-backup-phone-description-v2 = C’est la méthode de récupération la plus simple si vous ne pouvez pas utiliser votre application d’authentification.
tfa-row-backup-phone-sim-swap-risk-link = En savoir plus sur le risque lié à l’échange de SIM


switch-turn-off = Désactiver
switch-turn-on = Activer
switch-submitting = Envoi…
switch-is-on = activé
switch-is-off = désactivé


row-defaults-action-add = Ajouter
row-defaults-action-change = Modifier
row-defaults-action-disable = Désactiver
row-defaults-status = Aucun


rk-header-1 = Clé de récupération de compte
rk-enabled = Activée
rk-not-set = Non définie
rk-action-create = Créer
rk-action-change-button = Modifier
rk-action-remove = Supprimer
rk-key-removed-2 = La clé de récupération a été supprimée
rk-cannot-remove-key = La clé de récupération de votre compte n’a pas pu être supprimée.
rk-refresh-key-1 = Actualiser la clé de récupération du compte
rk-content-explain = Restauration de vos informations lorsque vous oubliez votre mot de passe.
rk-cannot-verify-session-4 = Un problème est survenu lors de la confirmation de votre session
rk-remove-modal-heading-1 = Supprimer la clé de récupération du compte ?
rk-remove-modal-content-1 = Si vous réinitialisez votre mot de passe, vous ne pourrez plus utiliser la clé de récupération de votre compte pour accéder à vos données. Cette action est irréversible.
rk-remove-error-2 = La clé de récupération de votre compte n’a pas pu être supprimée
unit-row-recovery-key-delete-icon-button-title = Supprimer la clé de récupération du compte


se-heading = Adresse e-mail secondaire
    .header = Adresse e-mail secondaire
se-cannot-refresh-email = Un problème est survenu lors de l’actualisation de cette adresse.
se-cannot-resend-code-3 = Un problème est survenu lors de la réexpédition du code de confirmation
se-set-primary-successful-2 = { $email } est désormais votre adresse e-mail principale
se-set-primary-error-2 = Un problème est survenu lors de la modification de votre adresse e-mail principale
se-delete-email-successful-2 = L’adresse { $email } a été supprimée
se-delete-email-error-2 = Un problème est survenu lors de la suppression de cette adresse
se-verify-session-3 = Vous devrez confirmer votre session en cours pour effectuer cette action
se-verify-session-error-3 = Un problème est survenu lors de la confirmation de votre session
se-remove-email =
    .title = Supprimer l’adresse
se-refresh-email =
    .title = Actualiser l’adresse
se-unverified-2 = non confirmée
se-resend-code-2 =
    Confirmation nécessaire. <button>Renvoyer le code de confirmation</button>
    si celui-ci n’est pas dans votre boîte de réception ou votre dossier de spam.
se-make-primary = En faire l’adresse principale
se-default-content = Accédez à votre compte si vous ne pouvez pas vous connecter à votre messagerie principale.
se-content-note-1 =
    Remarque : une adresse secondaire ne permettra pas de restaurer vos informations — vous
    aurez besoin d’une <a>clé de récupération du compte</a> pour cela.
se-secondary-email-none = Aucune


tfa-row-header = Authentification en deux étapes
tfa-row-enabled = Activée
tfa-row-disabled-status = Désactivée
tfa-row-action-add = Ajouter
tfa-row-action-disable = Désactiver
tfa-row-action-change = Modifier
tfa-row-button-refresh =
    .title = Actualiser l’authentification en deux étapes
tfa-row-cannot-refresh = Un problème est survenu lors de l’actualisation de l’authentification en deux étapes.
tfa-row-enabled-description = Votre compte est protégé par une authentification en deux étapes. Vous devrez saisir un code d’accès à usage unique provenant de votre application d’authentification lorsque vous vous connecterez à votre { -product-mozilla-account }.
tfa-row-enabled-info-link = En quoi cela protège votre compte
tfa-row-disabled-description-v2 = Aidez-nous à sécuriser votre compte en utilisant une application d’authentification tierce en tant que deuxième facteur pour vous connecter.
tfa-row-cannot-verify-session-4 = Un problème est survenu lors de la confirmation de votre session
tfa-row-disable-modal-heading = Désactiver l’authentification en deux étapes ?
tfa-row-disable-modal-confirm = Désactiver
tfa-row-disable-modal-explain-1 =
    Vous ne pourrez pas annuler cette action. Vous avez également
    la possibilité de <linkExternal>remplacer vos code d’authentification de secours</linkExternal>.
tfa-row-disabled-2 = Authentification en deux étapes désactivée
tfa-row-cannot-disable-2 = L’authentification en deux étapes n’a pas pu être désactivée
tfa-row-verify-session-info = Vous devez confirmer votre session en cours pour configurer l’authentification en deux étapes


terms-privacy-agreement-intro-3 = En poursuivant, vous acceptez ce qui suit :
terms-privacy-agreement-customized-terms = { $serviceName } : <termsLink>Conditions d’utilisation</termsLink> et <privacyLink>Politique de confidentialité</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") } : <mozillaAccountsTos>Conditions d’utilisation</mozillaAccountsTos> et <mozillaAccountsPrivacy>Politique de confidentialité</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = En continuant, vous acceptez les <mozillaAccountsTos>Conditions d’utilisation</mozillaAccountsTos> et la <mozillaAccountsPrivacy>Politique de confidentialité</mozillaAccountsPrivacy>.


third-party-auth-options-or = ou
third-party-auth-options-sign-in-with = Se connecter avec
continue-with-google-button = Continuer avec { -brand-google }
continue-with-apple-button = Continuer avec { -brand-apple }


auth-error-102 = Compte inconnu
auth-error-103 = Mot de passe incorrect
auth-error-105-2 = Code de confirmation invalide
auth-error-110 = Jeton invalide
auth-error-114-generic = Vous avez effectué trop d’essais. Veuillez réessayer plus tard.
auth-error-114 = Vous avez effectué trop d’essais. Veuillez réessayer { $retryAfter }.
auth-error-125 = La requête a été bloquée par mesure de sécurité.
auth-error-129-2 = Vous avez saisi un numéro de téléphone invalide. Veuillez le vérifier puis réessayer.
auth-error-138-2 = Session non confirmée
auth-error-139 = L’adresse alternative doit être différente de l’adresse de votre compte
auth-error-144 = Cette adresse e-mail est réservée par un autre compte. Réessayez plus tard ou utilisez une autre adresse e-mail.
auth-error-155 = Jeton TOTP introuvable
auth-error-156 = Code d’authentification de secours introuvable
auth-error-159 = Clé de récupération du compte non valide
auth-error-183-2 = Code de confirmation invalide ou expiré
auth-error-202 = Fonctionnalité inactive
auth-error-203 = Système indisponible, veuillez réessayer plus tard
auth-error-206 = Impossible de créer le mot de passe, un mot de passe est déjà défini
auth-error-214 = Le numéro de téléphone de secours existe déjà
auth-error-215 = Le numéro de téléphone de secours n’existe pas
auth-error-216 = Nombre maximum d’envois de SMS atteint
auth-error-218 = Impossible de supprimer le numéro de téléphone de secours, car les codes d’authentification de secours n’ont pas été créés.
auth-error-219 = Ce numéro de téléphone a été enregistré avec trop de comptes. Veuillez essayer avec un autre numéro.
auth-error-999 = Erreur inattendue
auth-error-1001 = Tentative de connexion annulée
auth-error-1002 = Votre session a expiré. Connectez-vous pour continuer.
auth-error-1003 = Le stockage local ou les cookies sont toujours désactivés
auth-error-1008 = Votre nouveau mot de passe doit être différent
auth-error-1010 = Mot de passe valide requis
auth-error-1011 = Adresse e-mail valide requise
auth-error-1018 = Votre message de confirmation nous a été renvoyé. Vérifiez que votre adresse e-mail est correcte.
auth-error-1020 = Y a-t-il une faute de frappe dans l’adresse e-mail ? firefox.com n’est pas un service de messagerie valide
auth-error-1031 = Vous devez renseigner votre âge pour créer un compte.
auth-error-1032 = Vous devez entrer un âge valide pour vous inscrire
auth-error-1054 = Code d’authentification en deux étapes incorrect
auth-error-1056 = Code d’authentification de secours non valide
auth-error-1062 = Redirection invalide
auth-error-1064 = Y a-t-il une faute de frappe dans l’adresse e-mail ? { $domain } n’est pas un service de messagerie valide
auth-error-1066 = Les alias de messagerie ne peuvent pas être utilisés pour créer un compte.
auth-error-1067 = Y a-t-il une faute de frappe dans l’adresse e-mail ?
recovery-phone-number-ending-digits = Numéro se terminant par { $lastFourPhoneNumber }
oauth-error-1000 = Une erreur s’est produite. Veuillez fermer cet onglet et réessayer.


connect-another-device-signed-in-header = Connexion à { -brand-firefox } établie
connect-another-device-email-confirmed-banner = Adresse e-mail confirmée
connect-another-device-signin-confirmed-banner = Connexion confirmée
connect-another-device-signin-to-complete-message = Connectez-vous via cette instance de { -brand-firefox } pour terminer la configuration
connect-another-device-signin-link = Connexion
connect-another-device-still-adding-devices-message = Vous souhaitez ajouter d’autres appareils ? Connectez-vous via { -brand-firefox } depuis d’autres appareils pour achever la configuration.
connect-another-device-signin-another-device-to-complete-message = Connectez-vous via { -brand-firefox } sur un autre appareil pour terminer la configuration
connect-another-device-get-data-on-another-device-message = Voulez-vous retrouver onglets, marque-pages et mots de passe sur un autre appareil ?
connect-another-device-cad-link = Connecter un autre appareil
connect-another-device-not-now-link = Plus tard
connect-another-device-android-complete-setup-message = Connectez-vous via { -brand-firefox } pour Android pour terminer la configuration
connect-another-device-ios-complete-setup-message = Connectez-vous via { -brand-firefox } pour iOS pour terminer la configuration


cookies-disabled-header = Le stockage local et les cookies sont nécessaires
cookies-disabled-enable-prompt-2 = Veuillez activer les cookies et le stockage local de votre navigateur afin d’accéder à votre { -product-mozilla-account }. Cela permettra notamment de mémoriser vos informations entre deux sessions.
cookies-disabled-button-try-again = Réessayer
cookies-disabled-learn-more = En savoir plus


index-header = Saisissez votre adresse e-mail
index-sync-header = Continuer vers votre { -product-mozilla-account }
index-sync-subheader = Synchronisez vos mots de passe, onglets et marque-pages partout où vous utilisez { -brand-firefox }.
index-relay-header = Créer un alias de messagerie
index-relay-subheader = Veuillez indiquer l’adresse e-mail à laquelle vous souhaitez transférer les e-mails de votre alias de messagerie.
index-subheader-with-servicename = Continuez vers { $serviceName }
index-subheader-default = Continuer vers les paramètres du compte
index-cta = S’inscrire ou se connecter
index-account-info = Un { -product-mozilla-account } donne également accès à davantage de produits de { -brand-mozilla } qui protègent votre vie privée.
index-email-input =
    .label = Saisissez votre adresse e-mail
index-account-delete-success = Le compte a été supprimé
index-email-bounced = Votre message de confirmation nous a été renvoyé. Vérifiez que votre adresse e-mail est correcte.


inline-recovery-key-setup-create-error = Oups ! Nous n’avons pas pu créer la clé de récupération de votre compte. Veuillez réessayer plus tard.
inline-recovery-key-setup-recovery-created = Clé de récupération de compte créée
inline-recovery-key-setup-download-header = Sécurisez votre compte
inline-recovery-key-setup-download-subheader = Téléchargez-la et stockez-la maintenant
inline-recovery-key-setup-download-info = Conservez cette clé dans un endroit où vous vous en souviendrez ; vous ne pourrez pas rouvrir cette page plus tard.
inline-recovery-key-setup-hint-header = Recommandation de sécurité


inline-totp-setup-cancel-setup-button = Annuler la configuration
inline-totp-setup-continue-button = Continuer
inline-totp-setup-add-security-link = Ajoutez une couche de sécurité supplémentaire en exigeant un code d’authentification depuis <authenticationAppsLink>l’une de ces applications d’authentification</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Activez l’authentification en deux étapes <span>pour accéder aux paramètres du compte</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Activez l’authentification en deux étapes <span>pour continuer vers { $serviceName }</span>
inline-totp-setup-ready-button = Prêt·e
inline-totp-setup-show-qr-custom-service-header-2 = Scannez le code d’authentification <span>pour continuer vers { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Saisissez le code manuellement <span>pour continuer vers { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Scannez le code d’authentification <span>pour accéder aux paramètres du compte</span>
inline-totp-setup-no-qr-default-service-header-2 = Saisissez le code manuellement <span>pour accéder aux paramètres du compte</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Saisissez cette clé secrète dans votre application d’authentification. <toggleToQRButton>Scanner le code QR à la place ?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Scannez le code QR dans votre application d’authentification, puis saisissez le code d’authentification fourni. <toggleToManualModeButton>Impossible de scanner le code ?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Ensuite, des codes d’authentification à saisir commenceront à être générés.
inline-totp-setup-security-code-placeholder = Code d’authentification
inline-totp-setup-code-required-error = Code d’authentification requis
tfa-qr-code-alt = Utilisez le code { $code } pour configurer l’authentification en deux étapes dans les applications prises en charge.
inline-totp-setup-page-title = Authentification en deux étapes


legal-header = Mentions légales
legal-terms-of-service-link = Conditions d’utilisation
legal-privacy-link = Politique de confidentialité


legal-privacy-heading = Politique de confidentialité


legal-terms-heading = Conditions d’utilisation


pair-auth-allow-heading-text = Venez-vous de vous connecter à { -product-firefox } ?
pair-auth-allow-confirm-button = Oui, approuver l’appareil
pair-auth-allow-refuse-device-link = S’il ne s’agissait pas de vous, <link>changez de mot de passe</link>


pair-auth-complete-heading = Appareil connecté
pair-auth-complete-now-syncing-device-text = La synchronisation est désormais effective avec : { $deviceFamily } sur { $deviceOS }
pair-auth-complete-sync-benefits-text = Vous pouvez désormais accéder à vos onglets ouverts, vos mots de passe et vos marque-pages sur tous vos appareils.
pair-auth-complete-see-tabs-button = Afficher les onglets des appareils synchronisés
pair-auth-complete-manage-devices-link = Gérer les appareils


auth-totp-heading-w-default-service = Saisissez le code d’authentification <span>pour accéder aux paramètres du compte</span>
auth-totp-heading-w-custom-service = Saisissez le code d’authentification <span>pour continuer vers { $serviceName }</span>
auth-totp-instruction = Ouvrez l’application d’authentification et saisissez le code d’authentification fourni.
auth-totp-input-label = Saisissez le code à 6 chiffres
auth-totp-confirm-button = Confirmer
auth-totp-code-required-error = Code d’authentification requis


pair-wait-for-supp-heading-text = L’approbation est maintenant nécessaire <span>sur votre autre appareil</span>


pair-failure-header = Échec de l’association
pair-failure-message = Processus d’installation interrompu.


pair-sync-header = Synchroniser { -brand-firefox } sur votre téléphone ou votre tablette
pair-cad-header = Connecter { -brand-firefox } sur un autre appareil
pair-already-have-firefox-paragraph = Vous avez déjà { -brand-firefox } installé sur un téléphone ou une tablette ?
pair-sync-your-device-button = Synchronisez vos appareils
pair-or-download-subheader = ou téléchargez Firefox
pair-scan-to-download-message = Scannez pour télécharger { -brand-firefox } pour mobile, ou envoyez-vous un <linkExternal>lien de téléchargement</linkExternal>.
pair-not-now-button = Plus tard
pair-take-your-data-message = Emportez onglets, marque-pages et mots de passe partout où vous utilisez { -brand-firefox }.
pair-get-started-button = Commencer
pair-qr-code-aria-label = QR code


pair-success-header-2 = Appareil connecté
pair-success-message-2 = Association réussie.


pair-supp-allow-heading-text = Confirmer l’association <span>pour { $email }</span>
pair-supp-allow-confirm-button = Confirmer l’association
pair-supp-allow-cancel-link = Annuler


pair-wait-for-auth-heading-text = L’approbation est maintenant nécessaire <span>sur votre autre appareil</span>


pair-unsupported-header = Associer en utilisant une application
pair-unsupported-message = Avez-vous utilisé la caméra du système ? L’association doit être effectuée depuis une application { -brand-firefox }.




set-password-heading-v2 = Créez un mot de passe pour la synchronisation
set-password-info-v2 = Cela permet de chiffrer vos données. Il doit être différent du mot de passe de votre compte { -brand-google } ou { -brand-apple }.


third-party-auth-callback-message = Veuillez patienter, vous allez être redirigé·e vers l’application autorisée.


account-recovery-confirm-key-heading = Saisissez la clé de récupération de votre compte
account-recovery-confirm-key-instruction = Cette clé récupère vos données de navigation chiffrées, telles que les mots de passe et les marque-pages, sur les serveurs de { -brand-firefox }.
account-recovery-confirm-key-input-label =
    .label = Saisissez votre clé de récupération de compte de 32 caractères
account-recovery-confirm-key-hint = Votre indice de stockage est :
account-recovery-confirm-key-button-2 = Continuer
account-recovery-lost-recovery-key-link-2 = Vous ne trouvez pas la clé de récupération de votre compte ?


complete-reset-pw-header-v2 = Créer un nouveau mot de passe
complete-reset-password-success-alert = Mot de passe défini
complete-reset-password-error-alert = Un problème est survenu lors de la création de votre mot de passe
complete-reset-pw-recovery-key-link = Utiliser la clé de récupération du compte
reset-password-complete-banner-heading = Votre mot de passe à été réinitialisé.
reset-password-complete-banner-message = N’oubliez pas de générer une nouvelle clé de récupération de compte à partir des paramètres de votre { -product-mozilla-account } pour éviter tout problème de connexion ultérieur.
complete-reset-password-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.


confirm-backup-code-reset-password-input-label = Saisissez le code de 10 caractères
confirm-backup-code-reset-password-confirm-button = Confirmer
confirm-backup-code-reset-password-subheader = Saisissez un code d’authentification de secours
confirm-backup-code-reset-password-instruction = Saisissez l’un des codes à usage unique que vous avez enregistrés lors de la configuration de l’authentification en deux étapes.
confirm-backup-code-reset-password-locked-out-link = Vous ne parvenez pas à accéder à votre compte ?


confirm-reset-password-with-code-heading = Consultez vos e-mails
confirm-reset-password-with-code-instruction = Nous avons envoyé un code de confirmation à <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Saisissez le code à 8 chiffres dans les 10 minutes
confirm-reset-password-otp-submit-button = Continuer
confirm-reset-password-otp-resend-code-button = Renvoyer le code
confirm-reset-password-otp-different-account-link = Utiliser un autre compte


confirm-totp-reset-password-header = Réinitialiser le mot de passe
confirm-totp-reset-password-subheader-v2 = Saisissez le code d’authentification en deux étapes
confirm-totp-reset-password-instruction-v2 = Consultez votre <strong>application d’authentification</strong> pour réinitialiser votre mot de passe.
confirm-totp-reset-password-trouble-code = Un problème pour saisir le code ?
confirm-totp-reset-password-confirm-button = Confirmer
confirm-totp-reset-password-input-label-v2 = Saisissez le code à 6 chiffres
confirm-totp-reset-password-use-different-account = Utiliser un autre compte


password-reset-flow-heading = Réinitialiser le mot de passe
password-reset-body-2 = Nous vous demanderons d’effectuer certaines opérations pour assurer la sécurité de votre compte.
password-reset-email-input =
    .label = Saisissez votre adresse e-mail
password-reset-submit-button-2 = Continuer


reset-password-complete-header = Votre mot de passe a été réinitialisé
reset-password-confirmed-cta = Continuer vers { $serviceName }




password-reset-recovery-method-header = Réinitialisez votre mot de passe
password-reset-recovery-method-subheader = Choisissez une méthode de récupération
password-reset-recovery-method-details = Assurons-nous qu’il s’agit bien de vous à l’aide de vos méthodes de récupération.
password-reset-recovery-method-phone = Numéro de téléphone de secours
password-reset-recovery-method-code = Codes d’authentification de secours
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } code restant
       *[other] { $numBackupCodes } codes restants
    }
password-reset-recovery-method-send-code-error-heading = Un problème est survenu lors de l’envoi d’un code à votre numéro de téléphone de secours
password-reset-recovery-method-send-code-error-description = Veuillez réessayer plus tard ou utiliser vos codes d’authentification de secours.


reset-password-recovery-phone-flow-heading = Réinitialisez votre mot de passe
reset-password-recovery-phone-heading = Saisissez le code de récupération
reset-password-recovery-phone-instruction-v3 = Un code à six chiffres a été envoyé au numéro de téléphone se terminant par <span>{ $lastFourPhoneDigits }</span> par SMS. Ce code expire au bout de 5 minutes. Ne partagez pas ce code avec qui que ce soit.
reset-password-recovery-phone-input-label = Saisissez le code à 6 chiffres
reset-password-recovery-phone-code-submit-button = Confirmer
reset-password-recovery-phone-resend-code-button = Renvoyer le code
reset-password-recovery-phone-resend-success = Code envoyé
reset-password-recovery-phone-locked-out-link = Vous ne parvenez pas à accéder à votre compte ?
reset-password-recovery-phone-send-code-error-heading = Un problème est survenu lors de l’envoi d’un code
reset-password-recovery-phone-code-verification-error-heading = Un problème est survenu lors de la vérification de votre code
reset-password-recovery-phone-general-error-description = Veuillez réessayer plus tard.
reset-password-recovery-phone-invalid-code-error-description = Le code est invalide ou a expiré.
reset-password-recovery-phone-invalid-code-error-link = Utiliser plutôt des codes d’authentification de secours ?
reset-password-with-recovery-key-verified-page-title = Mot de passe réinitialisé
reset-password-complete-new-password-saved = Nouveau mot de passe enregistré !
reset-password-complete-recovery-key-created = Nouvelle clé de récupération de compte créée. Téléchargez-la et stockez-la maintenant.
reset-password-complete-recovery-key-download-info = Cette clé est essentielle pour la récupération des données si vous oubliez votre mot de passe. <b>Téléchargez-la et conservez-la en lieu sûr, car vous ne pourrez plus accéder à cette page plus tard.</b>


error-label = Erreur :
validating-signin = Validation de la connexion…
complete-signin-error-header = Erreur de confirmation
signin-link-expired-header = Lien de confirmation expiré
signin-link-expired-message-2 = Le lien sur lequel vous avez cliqué a expiré ou a déjà été utilisé.


signin-password-needed-header-2 = Saisissez le mot de passe <span>de votre { -product-mozilla-account }</span>
signin-subheader-without-logo-with-servicename = Continuez vers { $serviceName }
signin-subheader-without-logo-default = Continuer vers les paramètres du compte
signin-button = Connexion
signin-header = Connexion
signin-use-a-different-account-link = Utiliser un autre compte
signin-forgot-password-link = Mot de passe oublié ?
signin-password-button-label = Mot de passe
signin-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.
signin-code-expired-error = Code expiré. Veuillez vous reconnecter.
signin-account-locked-banner-heading = Réinitialisez votre mot de passe
signin-account-locked-banner-description = Nous avons verrouillé votre compte pour le protéger des activités suspectes.
signin-account-locked-banner-link = Réinitialisez votre mot de passe pour vous connecter


report-signin-link-damaged-body = Le lien sur lequel vous avez cliqué était incomplet, probablement à cause de votre client de messagerie. Veuillez vous assurer de copier l’adresse complète puis réessayez.
report-signin-header = Signaler une connexion non autorisée ?
report-signin-body = Vous avez reçu un e-mail concernant une tentative d’accès à votre compte. Voulez-vous signaler cette activité comme suspecte ?
report-signin-submit-button = Signaler cette activité
report-signin-support-link = Que se passe-t-il ?
report-signin-error = Un problème est survenu lors de l’envoi du rapport.
signin-bounced-header = Désolé, nous avons bloqué votre compte.
signin-bounced-message = Le message de confirmation que nous avons envoyé à { $email } a été renvoyé et nous avons verrouillé votre compte pour protéger vos données { -brand-firefox }.
signin-bounced-help = Si cette adresse e-mail est valide, <linkExternal>dites-le-nous</linkExternal> et nous pourrons vous aider à débloquer votre compte.
signin-bounced-create-new-account = Vous n’avez plus le contrôle de cette adresse e-mail ? Créez un nouveau compte
back = Retour


signin-push-code-heading-w-default-service = Vérifiez cet identifiant <span>pour accéder aux paramètres du compte</span>
signin-push-code-heading-w-custom-service = Vérifiez cet identifiant <span>pour continuer vers { $serviceName }</span>
signin-push-code-instruction = Consultez vos autres appareils pour approuver cette connexion depuis votre navigateur { -brand-firefox }.
signin-push-code-did-not-recieve = Vous n’avez pas reçu de notification ?
signin-push-code-send-email-link = Envoyer un code par e-mail


signin-push-code-confirm-instruction = Confirmez votre identifiant
signin-push-code-confirm-description = Nous avons détecté une tentative de connexion depuis l’appareil suivant. S’il s’agit de vous, veuillez approuver la connexion
signin-push-code-confirm-verifying = Vérification
signin-push-code-confirm-login = Confirmer la connexion
signin-push-code-confirm-wasnt-me = Il ne s’agissait pas de moi, changer le mot de passe.
signin-push-code-confirm-login-approved = Votre connexion a été approuvée. Veuillez fermer cette fenêtre.
signin-push-code-confirm-link-error = Le lien est altéré. Veuillez réessayer.


signin-recovery-method-header = Connexion
signin-recovery-method-subheader = Choisissez une méthode de récupération
signin-recovery-method-details = Assurons-nous qu’il s’agit bien de vous à l’aide de vos méthodes de récupération.
signin-recovery-method-phone = Numéro de téléphone de secours
signin-recovery-method-code-v2 = Codes d’authentification de secours
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } code restant
       *[other] { $numBackupCodes } codes restants
    }
signin-recovery-method-send-code-error-heading = Un problème est survenu lors de l’envoi d’un code à votre numéro de téléphone de secours
signin-recovery-method-send-code-error-description = Veuillez réessayer plus tard ou utiliser vos codes d’authentification de secours.


signin-recovery-code-heading = Connexion
signin-recovery-code-sub-heading = Saisissez un code d’authentification de secours
signin-recovery-code-instruction-v3 = Saisissez l’un des codes à usage unique que vous avez enregistrés lors de la configuration de l’authentification en deux étapes.
signin-recovery-code-input-label-v2 = Saisissez le code de 10 caractères
signin-recovery-code-confirm-button = Confirmer
signin-recovery-code-phone-link = Utiliser le numéro de téléphone de secours
signin-recovery-code-support-link = Vous ne parvenez pas à accéder à votre compte ?
signin-recovery-code-required-error = Code d’authentification de secours requis
signin-recovery-code-use-phone-failure = Un problème est survenu lors de l’envoi d’un code à votre téléphone de secours
signin-recovery-code-use-phone-failure-description = Veuillez réessayer plus tard.


signin-recovery-phone-flow-heading = Connexion
signin-recovery-phone-heading = Saisissez le code de récupération
signin-recovery-phone-instruction-v3 = Un code à six chiffres a été envoyé au numéro de téléphone se terminant par <span>{ $lastFourPhoneDigits }</span> par SMS. Ce code expire au bout de 5 minutes. Ne partagez pas ce code avec qui que ce soit.
signin-recovery-phone-input-label = Saisissez le code à 6 chiffres
signin-recovery-phone-code-submit-button = Confirmer
signin-recovery-phone-resend-code-button = Renvoyer le code
signin-recovery-phone-resend-success = Code envoyé
signin-recovery-phone-locked-out-link = Vous ne parvenez pas à accéder à votre compte ?
signin-recovery-phone-send-code-error-heading = Un problème est survenu lors de l’envoi d’un code
signin-recovery-phone-code-verification-error-heading = Un problème est survenu lors de la vérification de votre code
signin-recovery-phone-general-error-description = Veuillez réessayer plus tard.
signin-recovery-phone-invalid-code-error-description = Le code est invalide ou a expiré.
signin-recovery-phone-invalid-code-error-link = Utiliser plutôt des codes d’authentification de secours ?
signin-recovery-phone-success-message = Connexion réussie. Des limites peuvent s’appliquer si vous utilisez à nouveau votre numéro de téléphone de secours.


signin-reported-header = Merci pour votre vigilance
signin-reported-message = Notre équipe a été informée. Les signalements comme celui-ci nous aident à repousser les intrus.


signin-token-code-heading-2 = Saisissez le code de confirmation <span>pour votre { -product-mozilla-account }</span>
signin-token-code-instruction-v2 = Saisissez le code envoyé à <email>{ $email }</email> dans les 5 prochaines minutes.
signin-token-code-input-label-v2 = Saisissez le code à 6 chiffres
signin-token-code-confirm-button = Confirmer
signin-token-code-code-expired = Code expiré ?
signin-token-code-resend-code-link = Envoyer un nouveau code.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Envoyer un nouveau code dans { $seconds } seconde
       *[other] Envoyer un nouveau code dans { $seconds } secondes
    }
signin-token-code-required-error = Code de confirmation requis
signin-token-code-resend-error = Une erreur s’est produite. Impossible d’envoyer un nouveau code.
signin-token-code-instruction-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.


signin-totp-code-header = Connexion
signin-totp-code-subheader-v2 = Saisissez le code d’authentification en deux étapes
signin-totp-code-instruction-v4 = Consultez votre <strong>application d’authentification</strong> pour confirmer votre connexion.
signin-totp-code-input-label-v4 = Saisissez le code à 6 chiffres
signin-totp-code-aal-banner-header = Pour quelle raison vous demande-t-on de vous authentifier ?
signin-totp-code-aal-banner-content = Vous avez configuré l’authentification en deux étapes pour votre compte, mais vous ne vous êtes pas encore connecté·e avec un code sur cet appareil.
signin-totp-code-aal-sign-out = Se déconnecter sur cet appareil
signin-totp-code-aal-sign-out-error = Un problème est survenu lors de votre déconnexion
signin-totp-code-confirm-button = Confirmer
signin-totp-code-other-account-link = Utiliser un autre compte
signin-totp-code-recovery-code-link = Un problème pour saisir le code ?
signin-totp-code-required-error = Code d’authentification requis
signin-totp-code-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.


signin-unblock-header = Autoriser cette connexion
signin-unblock-body = Consultez votre boîte de réception pour accéder au code d’autorisation envoyé à { $email }.
signin-unblock-code-input = Saisissez le code d’autorisation
signin-unblock-submit-button = Continuer
signin-unblock-code-required-error = Code d’autorisation requis
signin-unblock-code-incorrect-length = Le code d’autorisation doit contenir 8 caractères
signin-unblock-code-incorrect-format-2 = Le code d’autorisation ne peut contenir que des lettres et/ou des chiffres
signin-unblock-resend-code-button = Vous ne voyez rien dans votre boîte de réception ni dans le dossier des indésirables ? Renvoyez le message
signin-unblock-support-link = Que se passe-t-il ?
signin-unblock-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.




confirm-signup-code-page-title = Saisissez le code de confirmation
confirm-signup-code-heading-2 = Saisissez le code de confirmation <span>pour votre { -product-mozilla-account }</span>
confirm-signup-code-instruction-v2 = Saisissez le code envoyé à <email>{ $email }</email> dans les 5 prochaines minutes.
confirm-signup-code-input-label = Saisissez le code à 6 chiffres
confirm-signup-code-confirm-button = Confirmer
confirm-signup-code-sync-button = Démarrer la synchronisation
confirm-signup-code-code-expired = Code expiré ?
confirm-signup-code-resend-code-link = Envoyer un nouveau code.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Envoyer un nouveau code dans { $seconds } seconde
       *[other] Envoyer un nouveau code dans { $seconds } secondes
    }
confirm-signup-code-success-alert = Compte confirmé avec succès
confirm-signup-code-is-required-error = Le code de confirmation est requis
confirm-signup-code-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.


signup-heading-v2 = Créer un mot de passe
signup-relay-info = Un mot de passe est nécessaire pour gérer en toute sécurité vos alias de messagerie et accéder aux outils de sécurité de { -brand-mozilla }.
signup-sync-info = Synchronisez vos mots de passe, marque-pages, et d’autres données, partout où vous utilisez { -brand-firefox }.
signup-sync-info-with-payment = Synchronisez vos mots de passe, modes de paiement, marque-pages et bien d’autres choses partout où vous utilisez { -brand-firefox }.
signup-change-email-link = Changer d’adresse e-mail


signup-confirmed-sync-header = La synchronisation est activée
signup-confirmed-sync-success-banner = { -product-mozilla-account(capitalization: "uppercase") } confirmé
signup-confirmed-sync-button = Commencer la navigation
signup-confirmed-sync-description-with-payment-v2 = Vos mots de passe, modes de paiement, adresses, marque-pages, historique, et plus encore peuvent être synchronisés partout où vous utilisez { -brand-firefox }.
signup-confirmed-sync-description-v2 = Vos mots de passe, adresses, marque-pages, historique, et plus encore peuvent être synchronisés partout où vous utilisez { -brand-firefox }.
signup-confirmed-sync-add-device-link = Ajouter un autre appareil
signup-confirmed-sync-manage-sync-button = Gérer la synchronisation
signup-confirmed-sync-set-password-success-banner = Mot de passe de synchronisation créé
