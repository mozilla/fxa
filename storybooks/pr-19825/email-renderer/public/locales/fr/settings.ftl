# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Un nouveau code a été envoyé à votre adresse e-mail.
resend-link-success-banner-heading = Un nouveau lien a été envoyé à votre adresse e-mail.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Ajoutez { $accountsEmail } à vos contacts pour assurer la bonne réception des messages.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Fermer la bannière
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = Les { -product-firefox-accounts } seront renommés { -product-mozilla-accounts } le 1er novembre
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Vous pourrez toujours vous connecter avec le même nom d’utilisateur et le même mot de passe, et il n’y aura aucun autre changement concernant les produits que vous utilisez.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Nous avons renommé les { -product-firefox-accounts } en { -product-mozilla-accounts }. Vous pourrez toujours vous connecter avec le même nom d’utilisateur et le même mot de passe, et il n’y aura aucun autre changement concernant les produits que vous utilisez.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = En savoir plus
# Alt text for close banner image
brand-close-banner =
    .alt = Fermer la bannière
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo { -brand-mozilla } m

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Retour
button-back-title = Retour

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Télécharger et continuer
    .title = Télécharger et continuer
recovery-key-pdf-heading = Clé de récupération du compte
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Générée le : { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Clé de récupération du compte
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Cette clé vous permet de récupérer les données chiffrées de votre navigateur (y compris les mots de passe, les marque-pages et l’historique) si vous oubliez votre mot de passe. Conservez-la à un endroit dont vous vous souviendrez.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Où conserver votre clé :
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = En savoir plus sur la clé de récupération de compte
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Un problème est survenu lors du téléchargement de la clé de récupération de votre compte.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Recevez plus d’informations de la part de { -brand-mozilla } :
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Recevoir nos dernières actualités et actualités produit
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Accès en avant-première pour tester de nouveaux produits
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Actions pour reprendre le contrôle d’Internet

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Téléchargé
datablock-copy =
    .message = Copié
datablock-print =
    .message = Imprimé

## Success banners for datablock actions.
## $count – number of codes

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

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Copié

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (approximatif)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (approximatif)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (approximatif)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (approximatif)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Lieu inconnu
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } sur { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Adresse IP : { $ipAddress }

## FormPasswordInlineCriteria

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

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Ce champ est requis.

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Saisissez le code à { $codeLength } chiffres pour continuer
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Saisissez le code de { $codeLength } caractères pour continuer

# GetDataTrio component, part of Account Recovery Key flow

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

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Alerte
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Attention
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Avertissement
authenticator-app-aria-label =
    .aria-label = Authentificateur
backup-codes-icon-aria-label-v2 =
    .aria-label = Codes d’authentification de secours activés
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Codes d’authentification de secours désactivés
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS de récupération activé
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS de récupération désactivé
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Drapeau canadien
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Sélectionner
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Effectué
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Activé
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Fermer le message
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Code
error-icon-aria-label =
    .aria-label = Erreur
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informations
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Drapeau des États-Unis

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

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
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Illustration représentant une clé de récupération de compte.
# Used for an image of a single key.
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

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Vous êtes connecté·e à { -brand-firefox }.
inline-recovery-key-setup-create-header = Sécurisez votre compte
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Avez-vous une minute pour protéger vos données ?
inline-recovery-key-setup-info = Créez une clé de récupération de compte afin de pouvoir restaurer vos données de navigation synchronisées si jamais vous oubliez votre mot de passe.
inline-recovery-key-setup-start-button = Créer une clé de récupération de compte
inline-recovery-key-setup-later-button = Le faire plus tard

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Masquer le mot de passe
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Afficher le mot de passe
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Votre mot de passe est actuellement visible à l’écran.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Votre mot de passe est actuellement masqué.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Votre mot de passe est désormais visible à l’écran.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Votre mot de passe est maintenant masqué.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Sélectionnez un pays
input-phone-number-enter-number = Saisissez un numéro de téléphone
input-phone-number-country-united-states = États-Unis
input-phone-number-country-canada = Canada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Retour

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Le lien de réinitialisation du mot de passe est endommagé
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Lien de confirmation altéré
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Lien endommagé
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Le lien sur lequel vous avez cliqué était incomplet, probablement à cause de votre client de messagerie. Veuillez vous assurer de copier l’adresse complète puis réessayez.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Recevoir un nouveau lien

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Vous vous souvenez de votre mot de passe ?
# link navigates to the sign in page
remember-password-signin-link = Connectez-vous

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Adresse e-mail principale déjà confirmée
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Connexion déjà confirmée
confirmation-link-reused-message = Ce lien de confirmation a déjà été utilisé et ne peut être utilisé qu’une seule fois.

## Locale Toggle Component

locale-toggle-select-label = Choisir la langue
locale-toggle-browser-default = Navigateur par défaut
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Requête incorrecte

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Vous avez besoin de ce mot de passe pour accéder aux données chiffrées que vous stockez chez nous.
password-info-balloon-reset-risk-info = Une réinitialisation implique potentiellement la perte de données telles que les mots de passe et les marque-pages.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Choisissez un mot de passe compliqué que vous n’avez pas utilisé sur d’autres sites. Assurez-vous qu’il répond aux exigences de sécurité :
password-strength-short-instruction = Choisissez un mot de passe compliqué :
password-strength-inline-min-length = Au moins 8 caractères
password-strength-inline-not-email = Pas votre adresse e-mail
password-strength-inline-not-common = Pas un mot de passe trop commun
password-strength-inline-confirmed-must-match = La confirmation correspond au nouveau mot de passe
password-strength-inline-passwords-match = Les mots de passe correspondent

## Notification Promo Banner component

account-recovery-notification-cta = Créer
account-recovery-notification-header-value = Ne perdez pas vos données si vous oubliez votre mot de passe
account-recovery-notification-header-description = Créez une clé de récupération de compte pour restaurer vos données de navigation synchronisées si jamais vous oubliez votre mot de passe.
recovery-phone-promo-cta = Ajouter un numéro de téléphone de secours
recovery-phone-promo-heading = Ajoutez une protection supplémentaire à votre compte avec un numéro de téléphone de secours
recovery-phone-promo-description = Vous pouvez désormais vous connecter par SMS avec un mot de passe à usage unique si vous ne pouvez pas utiliser votre application d’authentification en deux étapes.
recovery-phone-promo-info-link = En savoir plus sur la récupération et les risques d’échange de SIM
promo-banner-dismiss-button =
    .aria-label = Fermer la bannière

## Ready component

ready-complete-set-up-instruction = Terminez la configuration en saisissant votre nouveau mot de passe sur vos autres appareils { -brand-firefox }.
manage-your-account-button = Gérer votre compte
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = { $serviceName } est maintenant prêt à être utilisé.
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Vous pouvez maintenant accéder aux paramètres du compte
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Votre compte est prêt !
ready-continue = Continuer
sign-in-complete-header = Connexion confirmée
sign-up-complete-header = Compte confirmé
primary-email-verified-header = Adresse e-mail principale confirmée

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Où conserver votre clé :
flow-recovery-key-download-storage-ideas-folder-v2 = Un dossier sur un appareil sécurisé
flow-recovery-key-download-storage-ideas-cloud = Stockage cloud fiable
flow-recovery-key-download-storage-ideas-print-v2 = Une copie papier
flow-recovery-key-download-storage-ideas-pwd-manager = Gestionnaire de mots de passe

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Ajouter un indice pour vous aider à retrouver votre clé
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Cet indice a pour but de vous aider à vous souvenir où vous avez stocké la clé de récupération de votre compte. Nous pourrons vous l’afficher lors de la réinitialisation du mot de passe afin de récupérer vos données.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Saisir un indice (facultatif)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Terminer
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = L’indice doit contenir moins de 225 caractères.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = L’indice ne peut pas contenir de caractères Unicode non sûrs. Seuls les lettres, les nombres, les signes de ponctuation et les symboles sont autorisés.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

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

## Alert Bar

alert-bar-close-message = Fermer le message

## User's avatar

avatar-your-avatar =
    .alt = Votre avatar
avatar-default-avatar =
    .alt = Avatar par défaut

##


# BentoMenu component

bento-menu-title-3 = Produits { -brand-mozilla }
bento-menu-tagline = Autres produits de { -brand-mozilla } qui protègent votre vie privée
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Navigateur { -brand-firefox } pour ordinateur
bento-menu-firefox-mobile = Navigateur { -brand-firefox } pour mobile
bento-menu-made-by-mozilla = Conçu par { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Installez { -brand-firefox } sur mobile ou tablette
connect-another-find-fx-mobile-2 = Recherchez { -brand-firefox } sur { -google-play } et l’{ -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Télécharger { -brand-firefox } sur { -google-play }
connect-another-app-store-image-3 =
    .alt = Télécharger { -brand-firefox } sur l’{ -app-store }

## Connected services section

cs-heading = Services connectés
cs-description = Tout ce que vous utilisez et auquel vous vous êtes connecté·e.
cs-cannot-refresh = Désolé, un problème est survenu lors de l’actualisation de la liste des services connectés.
cs-cannot-disconnect = Client introuvable, impossible de se déconnecter
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Déconnecté·e de { $service }.
cs-refresh-button =
    .title = Actualiser les services connectés
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Éléments manquants ou dupliqués ?
cs-disconnect-sync-heading = Se déconnecter de Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = Vos données de navigation seront conservées sur <span>{ $device }</span>, mais elles ne seront plus synchronisées avec votre compte.
cs-disconnect-sync-reason-3 = Quelle est la raison principale de la déconnexion de <span>{ $device }</span> ?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = L’appareil est :
cs-disconnect-sync-opt-suspicious = Suspect
cs-disconnect-sync-opt-lost = Perdu ou volé
cs-disconnect-sync-opt-old = Ancien ou remplacé
cs-disconnect-sync-opt-duplicate = Un doublon
cs-disconnect-sync-opt-not-say = Je préfère ne rien indiquer

##

cs-disconnect-advice-confirm = J’ai compris
cs-disconnect-lost-advice-heading = L’appareil perdu ou volé a été déconnecté
cs-disconnect-lost-advice-content-3 = Puisque votre appareil a été perdu ou volé, vous devriez changer le mot de passe de votre { -product-mozilla-account } dans les paramètres du compte afin de protéger vos informations. Vous devriez également vous informer auprès du fabricant de l’appareil pour savoir comment effacer vos données à distance.
cs-disconnect-suspicious-advice-heading = L’appareil suspect est déconnecté.
cs-disconnect-suspicious-advice-content-2 = Si l’appareil déconnecté est effectivement suspect, pour protéger vos informations, vous devez modifier le mot de passe de votre { -product-mozilla-account } dans les paramètres de votre compte. Vous devriez également modifier tout autre mot de passe que vous auriez enregistré dans { -brand-firefox } en tapant about:logins dans la barre d’adresse.
cs-sign-out-button = Se déconnecter

## Data collection section

dc-heading = Collecte et utilisation de données
dc-subheader-moz-accounts = { -product-mozilla-accounts(capitalization: "uppercase") }
dc-subheader-ff-browser = Navigateur { -brand-firefox }
dc-subheader-content-2 = Autoriser les { -product-mozilla-accounts } à envoyer des données techniques et d’interaction à { -brand-mozilla }.
dc-subheader-ff-content = Pour consulter ou mettre à jour les paramètres des données techniques et d’interaction de votre navigateur { -brand-firefox }, ouvrez les paramètres de { -brand-firefox } et accédez à la section Vie privée et sécurité.
dc-opt-out-success-2 = Désactivation réussie. Les { -product-mozilla-accounts } n’enverront plus de données techniques ou d’interaction à { -brand-mozilla }.
dc-opt-in-success-2 = Merci ! Le partage de ces données nous aide à améliorer les { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Un problème est survenu lors de la modification de vos préférences en matière de collecte de données
dc-learn-more = En savoir plus

# DropDownAvatarMenu component

drop-down-menu-title-2 = Menu { -product-mozilla-account(capitalization: "uppercase") }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Connecté·e en tant que
drop-down-menu-sign-out = Déconnexion
drop-down-menu-sign-out-error-2 = Un problème est survenu lors de votre déconnexion

## Flow Container

flow-container-back = Retour

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Saisissez à nouveau votre mot de passe par sécurité
flow-recovery-key-confirm-pwd-input-label = Saisissez votre mot de passe
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Créer une clé de récupération de compte
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Créer une nouvelle clé de récupération de compte

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Clé de récupération de compte créée — Téléchargez-la et conservez-la maintenant
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Cette clé vous permet de récupérer vos données si vous oubliez votre mot de passe. Téléchargez-la maintenant et conservez-la en lieu sûr — vous ne pourrez pas revenir sur cette page ultérieurement.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Continuer sans télécharger

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Clé de récupération de compte créée

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Créez une clé de récupération de compte au cas où vous oublieriez votre mot de passe
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Modifier la clé de récupération de votre compte
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Nous chiffrons les données de navigation (mots de passe, marque-pages, etc.). C’est excellent pour la vie privée, mais vous risquez de perdre vos données si vous oubliez votre mot de passe.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = C’est pourquoi créer une clé de récupération de compte est si important : vous pouvez l’utiliser pour restaurer vos données.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Commencer
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Annuler

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Connectez-vous à votre application d’authentification
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Étape 1 :</strong> scannez ce code QR en utilisant n’importe quelle application d’authentification, comme Duo ou Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Code QR pour configurer l’authentification en deux étapes. Scannez-le, ou choisissez « Impossible de scanner le code QR ? » pour obtenir une clé secrète d’installation à la place.
flow-setup-2fa-cant-scan-qr-button = Impossible de scanner le code QR ?
flow-setup-2fa-manual-key-heading = Saisissez le code manuellement
flow-setup-2fa-manual-key-instruction = <strong>Étape 1 :</strong> saisissez ce code dans votre application d’authentification préférée.
flow-setup-2fa-scan-qr-instead-button = Scanner plutôt un code QR ?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = En savoir plus sur les applications d’authentification
flow-setup-2fa-button = Continuer
flow-setup-2fa-step-2-instruction = <strong>Étape 2 :</strong> saisissez le code de votre application d’authentification.
flow-setup-2fa-input-label = Saisissez le code à 6 chiffres
flow-setup-2fa-code-error = Code invalide ou expiré. Consultez votre application d’authentification et réessayez.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Choisissez une méthode de récupération
flow-setup-2fa-backup-choice-description = Cela vous permet de vous connecter si vous ne pouvez pas accéder à votre appareil mobile ou à votre application d’authentification.
flow-setup-2fa-backup-choice-phone-title = Numéro de téléphone de secours
flow-setup-2fa-backup-choice-phone-badge = Le plus facile
flow-setup-2fa-backup-choice-phone-info = Recevez un code de secours par SMS. Actuellement disponible aux États-Unis et au Canada.
flow-setup-2fa-backup-choice-code-title = Codes d’authentification de secours
flow-setup-2fa-backup-choice-code-badge = Le plus sûr
flow-setup-2fa-backup-choice-code-info = Créez et enregistrez des codes d’authentification à usage unique.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = En savoir plus sur la récupération et les risques d’échange de SIM

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Saisissez un code d’authentification de secours
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Confirmez que vous avez enregistré vos codes en en saisissant un. Sans ces codes, vous ne pourrez peut-être pas vous connecter si vous ne disposez pas de votre application d’authentification.
flow-setup-2fa-backup-code-confirm-code-input = Saisissez le code de 10 caractères
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Terminer

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Enregistrez vos codes d’authentification de secours
flow-setup-2fa-backup-code-dl-save-these-codes = Conservez-les en lieu sûr. Si vous n’avez pas accès à votre application d’authentification, vous devrez en saisir un pour vous connecter.
flow-setup-2fa-backup-code-dl-button-continue = Continuer

##

flow-setup-2fa-inline-complete-success-banner = Authentification en deux étapes activée
flow-setup-2fa-inline-complete-success-banner-description = Afin de protéger tous vos appareils connectés, vous devriez vous déconnecter partout où vous utilisez ce compte, puis vous reconnecter en utilisant votre nouvelle authentification en deux étapes.
flow-setup-2fa-inline-complete-backup-code = Codes d’authentification de secours
flow-setup-2fa-inline-complete-backup-phone = Numéro de téléphone de secours
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } code restant
       *[other] { $count } codes restants
    }
flow-setup-2fa-inline-complete-backup-code-description = Il s’agit de la méthode de récupération la plus sûre si vous ne pouvez pas vous connecter avec votre appareil mobile ou l’application d’authentification.
flow-setup-2fa-inline-complete-backup-phone-description = Il s’agit de la méthode de récupération la plus simple si vous ne pouvez pas vous connecter avec votre application d’authentification.
flow-setup-2fa-inline-complete-learn-more-link = En quoi cela protège votre compte
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Continuer vers { $serviceName }
flow-setup-2fa-prompt-heading = Configurer l’authentification en deux étapes
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } vous demande de configurer l’authentification en deux étapes pour protéger votre compte.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Vous pouvez utiliser <authenticationAppsLink>n’importe laquelle de ces applications d’authentification</authenticationAppsLink> pour continuer.
flow-setup-2fa-prompt-continue-button = Continuer

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Saisissez le code de vérification
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Un code à six chiffres a été envoyé au <span>{ $phoneNumber }</span> par SMS. Ce code expire au bout de 5 minutes.
flow-setup-phone-confirm-code-input-label = Saisissez le code à 6 chiffres
flow-setup-phone-confirm-code-button = Confirmer
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Code expiré ?
flow-setup-phone-confirm-code-resend-code-button = Renvoyer le code
flow-setup-phone-confirm-code-resend-code-success = Code envoyé
flow-setup-phone-confirm-code-success-message-v2 = Numéro de téléphone de secours ajouté
flow-change-phone-confirm-code-success-message = Numéro de téléphone de secours modifié

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Vérifiez votre numéro de téléphone
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Vous recevrez un SMS de { -brand-mozilla } avec un code pour vérifier votre numéro. Ne partagez pas ce code avec qui que ce soit.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Le numéro de téléphone de secours est uniquement disponible aux États-Unis et au Canada. Les numéros VoIP et les alias de numéro de téléphone ne sont pas recommandés.
flow-setup-phone-submit-number-legal = En fournissant votre numéro, vous acceptez que nous le conservions pour vous envoyer des SMS dans l’unique but de vérifier votre compte. Des frais de communication peuvent s’appliquer.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Envoyer le code

## HeaderLockup component, the header in account settings

header-menu-open = Fermer le menu
header-menu-closed = Menu de navigation du site
header-back-to-top-link =
    .title = Haut de la page
header-back-to-settings-link =
    .title = Retour aux paramètres du { -product-mozilla-account }
header-title-2 = { -product-mozilla-account(capitalization: "uppercase") }
header-help = Aide

## Linked Accounts section

la-heading = Comptes liés
la-description = Vous avez autorisé l’accès aux comptes suivants.
la-unlink-button = Dissocier
la-unlink-account-button = Dissocier
la-set-password-button = Définir un mot de passe
la-unlink-heading = Dissocier du compte tiers
la-unlink-content-3 = Voulez-vous vraiment dissocier votre compte ? La dissociation de votre compte ne vous déconnecte pas automatiquement de vos Services connectés. Pour ce faire, vous devrez vous déconnecter manuellement depuis la section Services connectés.
la-unlink-content-4 = Avant de dissocier votre compte, vous devez définir un mot de passe. Sans mot de passe, vous ne pourrez plus vous connecter après avoir dissocié votre compte.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Fermer
modal-cancel-button = Annuler
modal-default-confirm-button = Confirmer

## ModalMfaProtected

modal-mfa-protected-title = Saisissez le code de confirmation
modal-mfa-protected-subtitle = Aidez-nous à nous assurer que vous êtes à l’origine de la modification des informations de votre compte
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Saisissez le code envoyé à <email>{ $email }</email> d’ici { $expirationTime } minute.
       *[other] Saisissez le code envoyé à <email>{ $email }</email> dans les { $expirationTime } minutes.
    }
modal-mfa-protected-input-label = Saisissez le code à 6 chiffres
modal-mfa-protected-cancel-button = Annuler
modal-mfa-protected-confirm-button = Confirmer
modal-mfa-protected-code-expired = Code expiré ?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Envoyez un nouveau code.

## Modal Verify Session

mvs-verify-your-email-2 = Confirmez votre adresse e-mail
mvs-enter-verification-code-2 = Saisissez votre code de confirmation
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Veuillez saisir au cours des 5 prochaines minutes le code de confirmation envoyé à <email>{ $email }</email>.
msv-cancel-button = Annuler
msv-submit-button-2 = Confirmer

## Settings Nav

nav-settings = Paramètres
nav-profile = Profil
nav-security = Sécurité
nav-connected-services = Services connectés
nav-data-collection = Collecte et utilisation de données
nav-paid-subs = Abonnements payants
nav-email-comm = Communications électroniques

## Page2faChange

page-2fa-change-title = Modifier l’authentification en deux étapes
page-2fa-change-success = L’authentification en deux étapes a été mise à jour
page-2fa-change-success-additional-message = Afin de protéger tous vos appareils connectés, vous devriez vous déconnecter partout où vous utilisez ce compte, puis vous reconnecter en utilisant votre nouvelle authentification en deux étapes.
page-2fa-change-totpinfo-error = Une erreur s’est produite lors du remplacement de votre application d’authentification en deux étapes. Réessayez plus tard.
page-2fa-change-qr-instruction = <strong>Étape 1 :</strong> scannez ce code QR en utilisant n’importe quelle application d’authentification, comme Duo ou Google Authenticator. Ceci crée une nouvelle connexion, les anciennes connexions ne fonctionneront plus.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Codes d’authentification de secours
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Un problème est survenu lors du remplacement de vos codes d’authentification de secours
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Un problème est survenu lors de la création de vos codes d’authentification de secours
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Codes d’authentification de secours mis à jour
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Codes d’authentification de secours créés
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Conservez-les en lieu sûr. Vos anciens codes seront remplacés à la fin de l’étape suivante.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Saisissez-en un après avoir enregistré vos codes. Vos anciens codes d’authentification de secours seront désactivés une fois cette étape terminée.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Code d’authentification de secours incorrect

## Page2faSetup

page-2fa-setup-title = Authentification en deux étapes
page-2fa-setup-totpinfo-error = Une erreur s’est produite lors de la configuration de l’authentification en deux étapes. Réessayez plus tard.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Ce code est incorrect. Veuillez réessayer.
page-2fa-setup-success = L’authentification en deux étapes a été activée
page-2fa-setup-success-additional-message = Afin de protéger tous vos appareils connectés, vous devriez vous déconnecter partout où vous utilisez ce compte, puis vous reconnecter en utilisant l’authentification en deux étapes.

## Avatar change page

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

## Password change page

pw-change-header =
    .title = Changement de mot de passe
pw-8-chars = Au moins 8 caractères
pw-not-email = Pas votre adresse e-mail
pw-change-must-match = Le nouveau mot de passe correspond à la confirmation
pw-commonly-used = Pas un mot de passe trop commun
# linkExternal is a link to a mozilla.org support article on password strength
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

## Password create page

pw-create-header =
    .title = Créer un mot de passe
pw-create-success-alert-2 = Mot de passe défini
pw-create-error-2 = Un problème est survenu lors de la création de votre mot de passe

## Delete account page

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

## Display name page

display-name-page-title =
    .title = Nom d’affichage
display-name-input =
    .label = Saisissez le nom à afficher
submit-display-name = Enregistrer
cancel-display-name = Annuler
display-name-update-error-2 = Un problème est survenu lors de la mise à jour de votre nom d’affichage.
display-name-success-alert-2 = Nom d’affichage mis à jour

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Activité récente du compte
recent-activity-account-create-v2 = Compte créé
recent-activity-account-disable-v2 = Compte désactivé
recent-activity-account-enable-v2 = Compte activé
recent-activity-account-login-v2 = Connexion au compte initiée
recent-activity-account-reset-v2 = Réinitialisation du mot de passe initiée
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
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
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Autre activité du compte

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Clé de récupération de compte
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Retour aux paramètres

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Supprimer le numéro de téléphone de secours
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Le numéro de téléphone de secours <strong>{ $formattedFullPhoneNumber }</strong> sera supprimé.
settings-recovery-phone-remove-recommend = Nous vous recommandons de conserver cette méthode, car elle est plus facile à utiliser que d’enregistrer des codes d’authentification de secours.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Si vous supprimez cette méthode, assurez-vous de conserver les codes d’authentification de secours que vous avez enregistrés. <linkExternal>Comparer les méthodes de récupération</linkExternal>
settings-recovery-phone-remove-button = Supprimer le numéro de téléphone
settings-recovery-phone-remove-cancel = Annuler
settings-recovery-phone-remove-success = Le numéro de téléphone de secours a été supprimé

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Ajoutez un numéro de téléphone de secours
page-change-recovery-phone = Modifier le numéro de téléphone de secours
page-setup-recovery-phone-back-button-title = Retour aux paramètres
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Modifier le numéro de téléphone

## Add secondary email page

add-secondary-email-step-1 = Étape 1 sur 2
add-secondary-email-error-2 = Un problème est survenu lors de la création de cette adresse e-mail
add-secondary-email-page-title =
    .title = Adresse e-mail secondaire
add-secondary-email-enter-address =
    .label = Saisissez votre adresse e-mail
add-secondary-email-cancel-button = Annuler
add-secondary-email-save-button = Enregistrer
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Les alias de messagerie ne peuvent pas être utilisés comme adresse e-mail secondaire

## Verify secondary email page

add-secondary-email-step-2 = Étape 2 sur 2
verify-secondary-email-page-title =
    .title = Adresse e-mail secondaire
verify-secondary-email-verification-code-2 =
    .label = Saisissez votre code de confirmation
verify-secondary-email-cancel-button = Annuler
verify-secondary-email-verify-button-2 = Confirmer
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Veuillez saisir au cours des 5 prochaines minutes le code de confirmation envoyé à <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = L’adresse { $email } a bien été ajoutée
verify-secondary-email-resend-code-button = Renvoyer le code de confirmation

##

# Link to delete account on main Settings page
delete-account-link = Supprimer le compte
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Connexion réussie. Votre { -product-mozilla-account } et vos données resteront actifs.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Découvrez où vos informations personnelles ont fuité et reprenez le contrôle
# Links out to the Monitor site
product-promo-monitor-cta = Effectuer un scan gratuit

## Profile section

profile-heading = Profil
profile-picture =
    .header = Photo
profile-display-name =
    .header = Nom d’affichage
profile-primary-email =
    .header = Adresse e-mail principale

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Étape { $currentStep } sur { $numberOfSteps }.

## Security section of Setting

security-heading = Sécurité
security-password =
    .header = Mot de passe
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Créé le { $date }
security-not-set = Non défini
security-action-create = Créer
security-set-password = Définissez un mot de passe pour synchroniser et utiliser certaines fonctionnalités de sécurité du compte.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Voir l’activité récente du compte
signout-sync-header = Session expirée
signout-sync-session-expired = Désolé, une erreur s’est produite. Veuillez vous déconnecter depuis le menu du navigateur puis réessayer.

## SubRow component

tfa-row-backup-codes-title = Codes d’authentification de secours
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Aucun code disponible
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } code restant
       *[other] { $numCodesAvailable } codes restants
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Créer de nouveaux codes
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Ajouter
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Il s’agit de la méthode de récupération la plus sûre si vous ne pouvez pas utiliser votre appareil mobile ou votre application d’authentification.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Numéro de téléphone de secours
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Aucun numéro de téléphone ajouté
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Modifier
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Ajouter
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Supprimer
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Supprimer le numéro de téléphone de secours
tfa-row-backup-phone-delete-restriction-v2 = Si vous souhaitez supprimer votre numéro de téléphone de secours, ajoutez des codes d’authentification de secours ou désactivez d’abord l’authentification en deux étapes pour éviter de perdre l’accès à votre compte.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = C’est la méthode de récupération la plus simple si vous ne pouvez pas utiliser votre application d’authentification.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = En savoir plus sur le risque lié à l’échange de SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Désactiver
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Activer
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Envoi…
switch-is-on = activé
switch-is-off = désactivé

## Sub-section row Defaults

row-defaults-action-add = Ajouter
row-defaults-action-change = Modifier
row-defaults-action-disable = Désactiver
row-defaults-status = Aucun

## Account recovery key sub-section on main Settings page

rk-header-1 = Clé de récupération de compte
rk-enabled = Activée
rk-not-set = Non définie
rk-action-create = Créer
# Button to delete the existing account recovery key and create a new one
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
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Supprimer la clé de récupération du compte

## Secondary email sub-section on main Settings page

se-heading = Adresse e-mail secondaire
    .header = Adresse e-mail secondaire
se-cannot-refresh-email = Un problème est survenu lors de l’actualisation de cette adresse.
se-cannot-resend-code-3 = Un problème est survenu lors de la réexpédition du code de confirmation
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } est désormais votre adresse e-mail principale
se-set-primary-error-2 = Un problème est survenu lors de la modification de votre adresse e-mail principale
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = L’adresse { $email } a été supprimée
se-delete-email-error-2 = Un problème est survenu lors de la suppression de cette adresse
se-verify-session-3 = Vous devrez confirmer votre session en cours pour effectuer cette action
se-verify-session-error-3 = Un problème est survenu lors de la confirmation de votre session
# Button to remove the secondary email
se-remove-email =
    .title = Supprimer l’adresse
# Button to refresh secondary email status
se-refresh-email =
    .title = Actualiser l’adresse
se-unverified-2 = non confirmée
se-resend-code-2 =
    Confirmation nécessaire. <button>Renvoyer le code de confirmation</button>
    si celui-ci n’est pas dans votre boîte de réception ou votre dossier de spam.
# Button to make secondary email the primary
se-make-primary = En faire l’adresse principale
se-default-content = Accédez à votre compte si vous ne pouvez pas vous connecter à votre messagerie principale.
se-content-note-1 =
    Remarque : une adresse secondaire ne permettra pas de restaurer vos informations — vous
    aurez besoin d’une <a>clé de récupération du compte</a> pour cela.
# Default value for the secondary email
se-secondary-email-none = Aucune

## Two Step Auth sub-section on Settings main page

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
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = En quoi cela protège votre compte
tfa-row-disabled-description-v2 = Aidez-nous à sécuriser votre compte en utilisant une application d’authentification tierce en tant que deuxième facteur pour vous connecter.
tfa-row-cannot-verify-session-4 = Un problème est survenu lors de la confirmation de votre session
tfa-row-disable-modal-heading = Désactiver l’authentification en deux étapes ?
tfa-row-disable-modal-confirm = Désactiver
tfa-row-disable-modal-explain-1 =
    Vous ne pourrez pas annuler cette action. Vous avez également
    la possibilité de <linkExternal>remplacer vos code d’authentification de secours</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Authentification en deux étapes désactivée
tfa-row-cannot-disable-2 = L’authentification en deux étapes n’a pas pu être désactivée
tfa-row-verify-session-info = Vous devez confirmer votre session en cours pour configurer l’authentification en deux étapes

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = En poursuivant, vous acceptez :
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = Les <mozSubscriptionTosLink>conditions d’utilisation</mozSubscriptionTosLink> et la <mozSubscriptionPrivacyLink>politique de confidentialité</mozSubscriptionPrivacyLink> des services d’abonnement de { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = Les <mozillaAccountsTos>conditions d’utilisation</mozillaAccountsTos> et la <mozillaAccountsPrivacy>politique de confidentialité</mozillaAccountsPrivacy> des { -product-mozilla-accounts }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = En continuant, vous acceptez les <mozillaAccountsTos>Conditions d’utilisation</mozillaAccountsTos> et la <mozillaAccountsPrivacy>Politique de confidentialité</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = ou
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Se connecter avec
continue-with-google-button = Continuer avec { -brand-google }
continue-with-apple-button = Continuer avec { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Compte inconnu
auth-error-103 = Mot de passe incorrect
auth-error-105-2 = Code de confirmation invalide
auth-error-110 = Jeton invalide
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Vous avez effectué trop d’essais. Veuillez réessayer plus tard.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Vous avez effectué trop d’essais. Veuillez réessayer { $retryAfter }.
auth-error-125 = La requête a été bloquée par mesure de sécurité.
auth-error-129-2 = Vous avez saisi un numéro de téléphone invalide. Veuillez le vérifier puis réessayer.
auth-error-138-2 = Session non confirmée
auth-error-139 = L’adresse alternative doit être différente de l’adresse de votre compte
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Cette adresse e-mail est réservée par un autre compte. Réessayez plus tard ou utilisez une autre adresse e-mail.
auth-error-155 = Jeton TOTP introuvable
# Error shown when the user submits an invalid backup authentication code
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
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Y a-t-il une faute de frappe dans l’adresse e-mail ? { $domain } n’est pas un service de messagerie valide
auth-error-1066 = Les alias de messagerie ne peuvent pas être utilisés pour créer un compte.
auth-error-1067 = Y a-t-il une faute de frappe dans l’adresse e-mail ?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Numéro se terminant par { $lastFourPhoneNumber }
oauth-error-1000 = Une erreur s’est produite. Veuillez fermer cet onglet et réessayer.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Connexion à { -brand-firefox } établie
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Adresse e-mail confirmée
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Connexion confirmée
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Connectez-vous via cette instance de { -brand-firefox } pour terminer la configuration
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Connexion
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Vous souhaitez ajouter d’autres appareils ? Connectez-vous via { -brand-firefox } depuis d’autres appareils pour achever la configuration.
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Connectez-vous via { -brand-firefox } sur un autre appareil pour terminer la configuration
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Voulez-vous retrouver onglets, marque-pages et mots de passe sur un autre appareil ?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Connecter un autre appareil
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Plus tard
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Connectez-vous via { -brand-firefox } pour Android pour terminer la configuration
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Connectez-vous via { -brand-firefox } pour iOS pour terminer la configuration

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Le stockage local et les cookies sont nécessaires
cookies-disabled-enable-prompt-2 = Veuillez activer les cookies et le stockage local de votre navigateur afin d’accéder à votre { -product-mozilla-account }. Cela permettra notamment de mémoriser vos informations entre deux sessions.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Réessayer
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = En savoir plus

## Index / home page

index-header = Saisissez votre adresse e-mail
index-sync-header = Continuer vers votre { -product-mozilla-account }
index-sync-subheader = Synchronisez vos mots de passe, onglets et marque-pages partout où vous utilisez { -brand-firefox }.
index-relay-header = Créer un alias de messagerie
index-relay-subheader = Veuillez indiquer l’adresse e-mail à laquelle vous souhaitez transférer les e-mails de votre alias de messagerie.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Continuez vers { $serviceName }
index-subheader-default = Continuer vers les paramètres du compte
index-cta = S’inscrire ou se connecter
index-account-info = Un { -product-mozilla-account } donne également accès à davantage de produits de { -brand-mozilla } qui protègent votre vie privée.
index-email-input =
    .label = Saisissez votre adresse e-mail
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Le compte a été supprimé
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Votre message de confirmation nous a été renvoyé. Vérifiez que votre adresse e-mail est correcte.

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Oups ! Nous n’avons pas pu créer la clé de récupération de votre compte. Veuillez réessayer plus tard.
inline-recovery-key-setup-recovery-created = Clé de récupération de compte créée
inline-recovery-key-setup-download-header = Sécurisez votre compte
inline-recovery-key-setup-download-subheader = Téléchargez-la et stockez-la maintenant
inline-recovery-key-setup-download-info = Conservez cette clé dans un endroit où vous vous en souviendrez ; vous ne pourrez pas rouvrir cette page plus tard.
inline-recovery-key-setup-hint-header = Recommandation de sécurité

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Annuler la configuration
inline-totp-setup-continue-button = Continuer
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Ajoutez une couche de sécurité supplémentaire en exigeant un code d’authentification depuis <authenticationAppsLink>l’une de ces applications d’authentification</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Activez l’authentification en deux étapes <span>pour accéder aux paramètres du compte</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Activez l’authentification en deux étapes <span>pour continuer vers { $serviceName }</span>
inline-totp-setup-ready-button = Prêt·e
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Scannez le code d’authentification <span>pour continuer vers { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Saisissez le code manuellement <span>pour continuer vers { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Scannez le code d’authentification <span>pour accéder aux paramètres du compte</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Saisissez le code manuellement <span>pour accéder aux paramètres du compte</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Saisissez cette clé secrète dans votre application d’authentification. <toggleToQRButton>Scanner le code QR à la place ?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Scannez le code QR dans votre application d’authentification, puis saisissez le code d’authentification fourni. <toggleToManualModeButton>Impossible de scanner le code ?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Ensuite, des codes d’authentification à saisir commenceront à être générés.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Code d’authentification
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Code d’authentification requis
tfa-qr-code-alt = Utilisez le code { $code } pour configurer l’authentification en deux étapes dans les applications prises en charge.
inline-totp-setup-page-title = Authentification en deux étapes

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Mentions légales
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Conditions d’utilisation
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Politique de confidentialité

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Politique de confidentialité

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Conditions d’utilisation

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Venez-vous de vous connecter à { -product-firefox } ?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Oui, approuver l’appareil
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = S’il ne s’agissait pas de vous, <link>changez de mot de passe</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Appareil connecté
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = La synchronisation est désormais effective avec : { $deviceFamily } sur { $deviceOS }
pair-auth-complete-sync-benefits-text = Vous pouvez désormais accéder à vos onglets ouverts, vos mots de passe et vos marque-pages sur tous vos appareils.
pair-auth-complete-see-tabs-button = Afficher les onglets des appareils synchronisés
pair-auth-complete-manage-devices-link = Gérer les appareils

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Saisissez le code d’authentification <span>pour accéder aux paramètres du compte</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Saisissez le code d’authentification <span>pour continuer vers { $serviceName }</span>
auth-totp-instruction = Ouvrez l’application d’authentification et saisissez le code d’authentification fourni.
auth-totp-input-label = Saisissez le code à 6 chiffres
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Confirmer
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Code d’authentification requis

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = L’approbation est maintenant nécessaire <span>sur votre autre appareil</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Échec de l’association
pair-failure-message = Processus d’installation interrompu.

## Pair index page

pair-sync-header = Synchroniser { -brand-firefox } sur votre téléphone ou votre tablette
pair-cad-header = Connecter { -brand-firefox } sur un autre appareil
pair-already-have-firefox-paragraph = Vous avez déjà { -brand-firefox } installé sur un téléphone ou une tablette ?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Synchronisez vos appareils
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = ou téléchargez Firefox
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Scannez pour télécharger { -brand-firefox } pour mobile, ou envoyez-vous un <linkExternal>lien de téléchargement</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Plus tard
pair-take-your-data-message = Emportez onglets, marque-pages et mots de passe partout où vous utilisez { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Commencer
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR code

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Appareil connecté
pair-success-message-2 = Association réussie.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Confirmer l’association <span>pour { $email }</span>
pair-supp-allow-confirm-button = Confirmer l’association
pair-supp-allow-cancel-link = Annuler

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = L’approbation est maintenant nécessaire <span>sur votre autre appareil</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Associer en utilisant une application
pair-unsupported-message = Avez-vous utilisé la caméra du système ? L’association doit être effectuée depuis une application { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Créez un mot de passe pour la synchronisation
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Cela permet de chiffrer vos données. Il doit être différent du mot de passe de votre compte { -brand-google } ou { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Veuillez patienter, vous allez être redirigé·e vers l’application autorisée.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Saisissez la clé de récupération de votre compte
account-recovery-confirm-key-instruction = Cette clé récupère vos données de navigation chiffrées, telles que les mots de passe et les marque-pages, sur les serveurs de { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Saisissez votre clé de récupération de compte de 32 caractères
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Votre indice de stockage est :
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Continuer
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Vous ne trouvez pas la clé de récupération de votre compte ?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Créer un nouveau mot de passe
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Mot de passe défini
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Un problème est survenu lors de la création de votre mot de passe
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Utiliser la clé de récupération du compte
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Votre mot de passe à été réinitialisé.
reset-password-complete-banner-message = N’oubliez pas de générer une nouvelle clé de récupération de compte à partir des paramètres de votre { -product-mozilla-account } pour éviter tout problème de connexion ultérieur.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Saisissez le code de 10 caractères
confirm-backup-code-reset-password-confirm-button = Confirmer
confirm-backup-code-reset-password-subheader = Saisissez un code d’authentification de secours
confirm-backup-code-reset-password-instruction = Saisissez l’un des codes à usage unique que vous avez enregistrés lors de la configuration de l’authentification en deux étapes.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Vous ne parvenez pas à accéder à votre compte ?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Consultez vos e-mails
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Nous avons envoyé un code de confirmation à <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Saisissez le code à 8 chiffres dans les 10 minutes
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Continuer
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Renvoyer le code
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Utiliser un autre compte

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Réinitialiser le mot de passe
confirm-totp-reset-password-subheader-v2 = Saisissez le code d’authentification en deux étapes
confirm-totp-reset-password-instruction-v2 = Consultez votre <strong>application d’authentification</strong> pour réinitialiser votre mot de passe.
confirm-totp-reset-password-trouble-code = Un problème pour saisir le code ?
confirm-totp-reset-password-confirm-button = Confirmer
confirm-totp-reset-password-input-label-v2 = Saisissez le code à 6 chiffres
confirm-totp-reset-password-use-different-account = Utiliser un autre compte

## ResetPassword start page

password-reset-flow-heading = Réinitialiser le mot de passe
password-reset-body-2 = Nous vous demanderons d’effectuer certaines opérations pour assurer la sécurité de votre compte.
password-reset-email-input =
    .label = Saisissez votre adresse e-mail
password-reset-submit-button-2 = Continuer

## ResetPasswordConfirmed

reset-password-complete-header = Votre mot de passe a été réinitialisé
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Continuer vers { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Réinitialisez votre mot de passe
password-reset-recovery-method-subheader = Choisissez une méthode de récupération
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Assurons-nous qu’il s’agit bien de vous à l’aide de vos méthodes de récupération.
password-reset-recovery-method-phone = Numéro de téléphone de secours
password-reset-recovery-method-code = Codes d’authentification de secours
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } code restant
       *[other] { $numBackupCodes } codes restants
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Un problème est survenu lors de l’envoi d’un code à votre numéro de téléphone de secours
password-reset-recovery-method-send-code-error-description = Veuillez réessayer plus tard ou utiliser vos codes d’authentification de secours.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Réinitialisez votre mot de passe
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Saisissez le code de récupération
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Un code à six chiffres a été envoyé au numéro de téléphone se terminant par <span>{ $lastFourPhoneDigits }</span> par SMS. Ce code expire au bout de 5 minutes. Ne partagez pas ce code avec qui que ce soit.
reset-password-recovery-phone-input-label = Saisissez le code à 6 chiffres
reset-password-recovery-phone-code-submit-button = Confirmer
reset-password-recovery-phone-resend-code-button = Renvoyer le code
reset-password-recovery-phone-resend-success = Code envoyé
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Vous ne parvenez pas à accéder à votre compte ?
reset-password-recovery-phone-send-code-error-heading = Un problème est survenu lors de l’envoi d’un code
reset-password-recovery-phone-code-verification-error-heading = Un problème est survenu lors de la vérification de votre code
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Veuillez réessayer plus tard.
reset-password-recovery-phone-invalid-code-error-description = Le code est invalide ou a expiré.
reset-password-recovery-phone-invalid-code-error-link = Utiliser plutôt des codes d’authentification de secours ?
reset-password-with-recovery-key-verified-page-title = Mot de passe réinitialisé
reset-password-complete-new-password-saved = Nouveau mot de passe enregistré !
reset-password-complete-recovery-key-created = Nouvelle clé de récupération de compte créée. Téléchargez-la et stockez-la maintenant.
reset-password-complete-recovery-key-download-info = Cette clé est essentielle pour la récupération des données si vous oubliez votre mot de passe. <b>Téléchargez-la et conservez-la en lieu sûr, car vous ne pourrez plus accéder à cette page plus tard.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Erreur :
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Validation de la connexion…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Erreur de confirmation
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Lien de confirmation expiré
signin-link-expired-message-2 = Le lien sur lequel vous avez cliqué a expiré ou a déjà été utilisé.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Saisissez le mot de passe <span>de votre { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Continuez vers { $serviceName }
signin-subheader-without-logo-default = Continuer vers les paramètres du compte
signin-button = Connexion
signin-header = Connexion
signin-use-a-different-account-link = Utiliser un autre compte
signin-forgot-password-link = Mot de passe oublié ?
signin-password-button-label = Mot de passe
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.
signin-code-expired-error = Code expiré. Veuillez vous reconnecter.
signin-account-locked-banner-heading = Réinitialisez votre mot de passe
signin-account-locked-banner-description = Nous avons verrouillé votre compte pour le protéger des activités suspectes.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Réinitialisez votre mot de passe pour vous connecter

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Le lien sur lequel vous avez cliqué était incomplet, probablement à cause de votre client de messagerie. Veuillez vous assurer de copier l’adresse complète puis réessayez.
report-signin-header = Signaler une connexion non autorisée ?
report-signin-body = Vous avez reçu un e-mail concernant une tentative d’accès à votre compte. Voulez-vous signaler cette activité comme suspecte ?
report-signin-submit-button = Signaler cette activité
report-signin-support-link = Que se passe-t-il ?
report-signin-error = Un problème est survenu lors de l’envoi du rapport.
signin-bounced-header = Désolé, nous avons bloqué votre compte.
# $email (string) - The user's email.
signin-bounced-message = Le message de confirmation que nous avons envoyé à { $email } a été renvoyé et nous avons verrouillé votre compte pour protéger vos données { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Si cette adresse e-mail est valide, <linkExternal>dites-le-nous</linkExternal> et nous pourrons vous aider à débloquer votre compte.
signin-bounced-create-new-account = Vous n’avez plus le contrôle de cette adresse e-mail ? Créez un nouveau compte
back = Retour

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Vérifiez cet identifiant <span>pour accéder aux paramètres du compte</span>
signin-push-code-heading-w-custom-service = Vérifiez cet identifiant <span>pour continuer vers { $serviceName }</span>
signin-push-code-instruction = Consultez vos autres appareils pour approuver cette connexion depuis votre navigateur { -brand-firefox }.
signin-push-code-did-not-recieve = Vous n’avez pas reçu de notification ?
signin-push-code-send-email-link = Envoyer un code par e-mail

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Confirmez votre identifiant
signin-push-code-confirm-description = Nous avons détecté une tentative de connexion depuis l’appareil suivant. S’il s’agit de vous, veuillez approuver la connexion
signin-push-code-confirm-verifying = Vérification
signin-push-code-confirm-login = Confirmer la connexion
signin-push-code-confirm-wasnt-me = Il ne s’agissait pas de moi, changer le mot de passe.
signin-push-code-confirm-login-approved = Votre connexion a été approuvée. Veuillez fermer cette fenêtre.
signin-push-code-confirm-link-error = Le lien est altéré. Veuillez réessayer.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Connexion
signin-recovery-method-subheader = Choisissez une méthode de récupération
signin-recovery-method-details = Assurons-nous qu’il s’agit bien de vous à l’aide de vos méthodes de récupération.
signin-recovery-method-phone = Numéro de téléphone de secours
signin-recovery-method-code-v2 = Codes d’authentification de secours
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } code restant
       *[other] { $numBackupCodes } codes restants
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Un problème est survenu lors de l’envoi d’un code à votre numéro de téléphone de secours
signin-recovery-method-send-code-error-description = Veuillez réessayer plus tard ou utiliser vos codes d’authentification de secours.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Connexion
signin-recovery-code-sub-heading = Saisissez un code d’authentification de secours
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Saisissez l’un des codes à usage unique que vous avez enregistrés lors de la configuration de l’authentification en deux étapes.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Saisissez le code de 10 caractères
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Confirmer
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Utiliser le numéro de téléphone de secours
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Vous ne parvenez pas à accéder à votre compte ?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Code d’authentification de secours requis
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Un problème est survenu lors de l’envoi d’un code à votre téléphone de secours
signin-recovery-code-use-phone-failure-description = Veuillez réessayer plus tard.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Connexion
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Saisissez le code de récupération
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Un code à six chiffres a été envoyé au numéro de téléphone se terminant par <span>{ $lastFourPhoneDigits }</span> par SMS. Ce code expire au bout de 5 minutes. Ne partagez pas ce code avec qui que ce soit.
signin-recovery-phone-input-label = Saisissez le code à 6 chiffres
signin-recovery-phone-code-submit-button = Confirmer
signin-recovery-phone-resend-code-button = Renvoyer le code
signin-recovery-phone-resend-success = Code envoyé
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Vous ne parvenez pas à accéder à votre compte ?
signin-recovery-phone-send-code-error-heading = Un problème est survenu lors de l’envoi d’un code
signin-recovery-phone-code-verification-error-heading = Un problème est survenu lors de la vérification de votre code
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Veuillez réessayer plus tard.
signin-recovery-phone-invalid-code-error-description = Le code est invalide ou a expiré.
signin-recovery-phone-invalid-code-error-link = Utiliser plutôt des codes d’authentification de secours ?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Connexion réussie. Des limites peuvent s’appliquer si vous utilisez à nouveau votre numéro de téléphone de secours.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Merci pour votre vigilance
signin-reported-message = Notre équipe a été informée. Les signalements comme celui-ci nous aident à repousser les intrus.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Saisissez le code de confirmation <span>pour votre { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Saisissez le code envoyé à <email>{ $email }</email> dans les 5 prochaines minutes.
signin-token-code-input-label-v2 = Saisissez le code à 6 chiffres
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Confirmer
signin-token-code-code-expired = Code expiré ?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Envoyer un nouveau code.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Code de confirmation requis
signin-token-code-resend-error = Une erreur s’est produite. Impossible d’envoyer un nouveau code.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Connexion
signin-totp-code-subheader-v2 = Saisissez le code d’authentification en deux étapes
signin-totp-code-instruction-v4 = Consultez votre <strong>application d’authentification</strong> pour confirmer votre connexion.
signin-totp-code-input-label-v4 = Saisissez le code à 6 chiffres
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Pour quelle raison vous demande-t-on de vous authentifier ?
signin-totp-code-aal-banner-content = Vous avez configuré l’authentification en deux étapes pour votre compte, mais vous ne vous êtes pas encore connecté·e avec un code sur cet appareil.
signin-totp-code-aal-sign-out = Se déconnecter sur cet appareil
signin-totp-code-aal-sign-out-error = Un problème est survenu lors de votre déconnexion
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Confirmer
signin-totp-code-other-account-link = Utiliser un autre compte
signin-totp-code-recovery-code-link = Un problème pour saisir le code ?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Code d’authentification requis
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Autoriser cette connexion
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Consultez votre boîte de réception pour accéder au code d’autorisation envoyé à { $email }.
signin-unblock-code-input = Saisissez le code d’autorisation
signin-unblock-submit-button = Continuer
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Code d’autorisation requis
signin-unblock-code-incorrect-length = Le code d’autorisation doit contenir 8 caractères
signin-unblock-code-incorrect-format-2 = Le code d’autorisation ne peut contenir que des lettres et/ou des chiffres
signin-unblock-resend-code-button = Vous ne voyez rien dans votre boîte de réception ni dans le dossier des indésirables ? Renvoyez le message
signin-unblock-support-link = Que se passe-t-il ?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Saisissez le code de confirmation
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Saisissez le code de confirmation <span>pour votre { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Saisissez le code envoyé à <email>{ $email }</email> dans les 5 prochaines minutes.
confirm-signup-code-input-label = Saisissez le code à 6 chiffres
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Confirmer
confirm-signup-code-sync-button = Démarrer la synchronisation
confirm-signup-code-code-expired = Code expiré ?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Envoyer un nouveau code.
confirm-signup-code-success-alert = Compte confirmé avec succès
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Le code de confirmation est requis
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = Une fois connecté·e, { -brand-firefox } tentera de vous renvoyer vers l’onglet d’origine pour utiliser un alias de messagerie.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Créer un mot de passe
signup-relay-info = Un mot de passe est nécessaire pour gérer en toute sécurité vos alias de messagerie et accéder aux outils de sécurité de { -brand-mozilla }.
signup-sync-info = Synchronisez vos mots de passe, marque-pages, et d’autres données, partout où vous utilisez { -brand-firefox }.
signup-sync-info-with-payment = Synchronisez vos mots de passe, modes de paiement, marque-pages et bien d’autres choses partout où vous utilisez { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Changer d’adresse e-mail

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = La synchronisation est activée
signup-confirmed-sync-success-banner = { -product-mozilla-account(capitalization: "uppercase") } confirmé
signup-confirmed-sync-button = Commencer la navigation
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Vos mots de passe, modes de paiement, adresses, marque-pages, historique, et plus encore peuvent être synchronisés partout où vous utilisez { -brand-firefox }.
signup-confirmed-sync-description-v2 = Vos mots de passe, adresses, marque-pages, historique, et plus encore peuvent être synchronisés partout où vous utilisez { -brand-firefox }.
signup-confirmed-sync-add-device-link = Ajouter un autre appareil
signup-confirmed-sync-manage-sync-button = Gérer la synchronisation
signup-confirmed-sync-set-password-success-banner = Mot de passe de synchronisation créé
