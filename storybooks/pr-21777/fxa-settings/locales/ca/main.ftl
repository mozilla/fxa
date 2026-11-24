



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Comptes del Firefox
-product-mozilla-account =
    { $capitalization ->
        [uppercase] Compte de Mozilla
       *[lowercase] compte de Mozilla
    }
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Comptes de Mozilla
       *[lowercase] comptes de Mozilla
    }
-product-firefox-account = Compte del Firefox
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
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
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-something-went-wrong-heading = Hi ha hagut un problema
app-something-went-wrong-message = Se'ns ha notificat el problema. Actualitzeu la pàgina per tornar-ho a provar.
app-error-id = ID d'error: { $errorId }
app-error-details-summary = Detalls de l'error
app-query-parameter-err-heading = Sol·licitud incorrecta: Paràmetres de consulta no vàlids


app-footer-mozilla-logo-label = Logotip del { -brand-mozilla }
app-footer-privacy-notice = Avís de privadesa del lloc web
app-footer-terms-of-service = Condicions del servei


app-default-title-2 = { -product-mozilla-accounts(capitalization: "uppercase") }


link-sr-new-window = S'obre en una finestra nova


app-loading-spinner-aria-label-loading = S'està carregant…


app-logo-alt-3 =
    .alt = Logotip m de { -brand-mozilla }



resend-code-success-banner-heading = S'ha enviat un codi nou al vostre correu electrònic.
resend-link-success-banner-heading = S'ha enviat un enllaç nou al vostre correu electrònic.
resend-success-banner-description = Afegiu { $accountsEmail } als vostres contactes per a garantir un lliurament sense problemes.


brand-banner-dismiss-button-2 =
    .aria-label = Tanca el bàner
brand-prelaunch-title = Els { -product-firefox-accounts } canviaran el nom a { -product-mozilla-accounts } l'1 de novembre
brand-learn-more = Més informació
brand-close-banner =
    .alt = Tanca el bàner
brand-m-logo =
    .alt = Logotip m de { -brand-mozilla }


button-back-aria-label = Enrere
button-back-title = Enrere


recovery-key-download-button-v4 = Baixa i continua


button-passkey-signin-loading = S'està iniciant la sessió de manera segura…


choose-newsletters-prompt-2 = Obteniu més de { -brand-mozilla }:


dark-mode-toggle-light = Clar
dark-mode-toggle-dark = Fosc
dark-mode-toggle-system = Sistema
dark-mode-toggle-label = Canvia el tema


datablock-download =
    .message = S'ha baixat
datablock-copy =
    .message = S'ha copiat
datablock-print =
    .message = S'ha imprès


datablock-copy-success =
    { $count ->
        [one] S'ha copiat el codi
       *[other] S'han copiat els codis
    }
datablock-download-success =
    { $count ->
        [one] S'ha baixat el codi
       *[other] S'han baixat els codis
    }
datablock-print-success =
    { $count ->
        [one] S'ha imprés el codi
       *[other] S'han imprès els codis
    }


datablock-inline-copy =
    .message = S'ha copiat


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimació)
device-info-block-location-region-country = { $region }, { $country } (estimació)
device-info-block-location-city-country = { $city }, { $country } (estimació)
device-info-block-location-country = { $country } (estimació)
device-info-block-location-unknown = Ubicació desconeguda
device-info-browser-os = { $browserName } en { $genericOSName }
device-info-browser-device = { $browserName } en { $deviceName }
device-info-ip-address = Adreça IP: { $ipAddress }


firefox-promo-banner-mobile-cta = Connecta un dispositiu
firefox-promo-banner-switch-cta = Canvieu al { -brand-firefox }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Contrasenya
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Repetiu la contrasenya
form-password-with-inline-criteria-signup-submit-button = Crea un compte
form-password-with-inline-criteria-reset-new-password =
    .label = Contrasenya nova
form-password-with-inline-criteria-confirm-password =
    .label = Confirma la contrasenya
form-password-with-inline-criteria-reset-submit-button = Crea una contrasenya nova
form-password-with-inline-criteria-old-password-label =
    .label = Contrasenya antiga
form-password-with-inline-criteria-change-password-submit-button = Canvia la contrasenya
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Contrasenya
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Repetiu la contrasenya
form-password-with-inline-criteria-set-password-submit-button = Inicia la sincronització
form-password-with-inline-criteria-match-error = Les contrasenyes no coincideixen
form-password-with-inline-criteria-sr-too-short-message = La contrasenya ha de tenir almenys 8 caràcters.
form-password-with-inline-criteria-sr-not-email-message = La contrasenya no pot contenir la vostra adreça electrònica.
form-password-with-inline-criteria-sr-not-common-message = La contrasenya no pot ser una contrasenya d'ús comú.
form-password-with-inline-criteria-sr-requirements-met = La contrasenya introduïda respecta tots els requisits de contrasenya.
form-password-with-inline-criteria-sr-passwords-match = Les contrasenyes introduïdes coincideixen.


form-verify-code-default-error = Aquest camp és obligatori


form-verify-totp-disabled-button-title-numeric = Introduïu el codi de { $codeLength } dígits per a continuar
form-verify-totp-disabled-button-title-alphanumeric = Introduïu el codi de { $codeLength } caràcters per a continuar
get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Clau de recuperació del compte del { -brand-firefox }
get-data-trio-title-backup-verification-codes = Codis d'autenticació de recuperació
get-data-trio-download-2 =
    .aria-label = Baixa
    .title = Baixa
get-data-trio-copy-2 =
    .aria-label = Copia
    .title = Copia
get-data-trio-print-2 =
    .aria-label = Imprimeix
    .title = Imprimeix


alert-icon-aria-label =
    .aria-label = Alerta
icon-attention-aria-label =
    .aria-label = Atenció
icon-warning-aria-label =
    .aria-label = Avís
authenticator-app-aria-label =
    .aria-label = Aplicació d'autenticació
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS de recuperació activat
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS de recuperació desactivat
canadian-flag-icon-aria-label =
    .aria-label = Bandera canadenca
checkmark-icon-aria-label =
    .aria-label = Marca
checkmark-success-icon-aria-label =
    .aria-label = Correcte
checkmark-enabled-icon-aria-label =
    .aria-label = Activat
close-icon-aria-label =
    .aria-label = Tanca el missatge
code-icon-aria-label =
    .aria-label = Codi
edit-icon-aria-label =
    .aria-label = Edita
error-icon-aria-label =
    .aria-label = Error
info-icon-aria-label =
    .aria-label = Informació
usa-flag-icon-aria-label =
    .aria-label = Bandera dels Estats Units
icon-loading-arrow-aria-label =
    .aria-label = S'està carregant
signin-recovery-code-image-description =
    .aria-label = Document que conté text ocult.
signin-totp-code-image-label =
    .aria-label = Un dispositiu amb un codi de 6 dígits ocult.
security-shield-aria-label =
    .aria-label = Il·lustració per a representar una clau de recuperació del compte.
recovery-key-image-aria-label =
    .aria-label = Il·lustració per a representar una clau de recuperació del compte.
password-image-aria-label =
    .aria-label = Una il·lustració per a representar l'escriptura d'una contrasenya.
firefox-wordmark-image-aria-label =
    .aria-label = Logotip del { -brand-firefox }


inline-recovery-key-setup-signed-in-firefox-2 = Heu iniciat la sessió al { -brand-firefox }.
inline-recovery-key-setup-create-header = Protegiu el vostre compte
inline-recovery-key-setup-create-subheader = Teniu un minut per a protegir les vostres dades?
inline-recovery-key-setup-later-button = Més tard


input-password-hide = Amaga la contrasenya
input-password-show = Mostra la contrasenya


input-phone-number-country-list-aria-label = Trieu el país
input-phone-number-country-united-states = Estats Units
input-phone-number-country-canada = Canadà


reset-pwd-link-damaged-header = L'enllaç per reiniciar la contrasenya està malmès
report-signin-link-damaged-header = L'enllaç no funciona


link-expired-new-link-button = Rebeu un enllaç nou


remember-password-signin-link = Inicia la sessió


primary-email-confirmation-link-reused = Ja s’ha confirmat l’adreça electrònica principal


locale-toggle-select-label = Trieu una llengua
locale-toggle-browser-default = Opció per defecte del navegador
error-bad-request = Sol·licitud incorrecta
error-bad-request-page-title = Sol·licitud incorrecta


pair-unsupported-hint-step-close-page = Tanca aquesta pàgina
pair-unsupported-hint-step-app-menu = Toca el <b>menú de l'aplicació</b>
pair-unsupported-hint-learn-more-link = Més informació


password-strength-inline-min-length = 8 caràcters com a mínim
password-strength-inline-not-email = No pot ser la vostra adreça electrònica
password-strength-inline-not-common = No pot ser una contrasenya d'ús comú
password-strength-inline-passwords-match = Les contrasenyes coincideixen


account-recovery-notification-cta = Crea
promo-banner-dismiss-button =
    .aria-label = Descarta el bàner


ready-account-ready = Ja teniu el compte a punt.
ready-continue = Continua
sign-in-complete-header = S'ha confirmat l'inici de sessió
sign-up-complete-header = Compte confirmat
sign-in-complete-page-title = S'ha confirmat l'inici de sessió
sign-up-complete-page-title = Compte confirmat


flow-recovery-key-hint-cta-text = Finalitza


password-reset-warning-icon = Avís


alert-bar-close-message = Tanca el missatge


avatar-your-avatar =
    .alt = El vostre avatar
avatar-default-avatar =
    .alt = Avatar per defecte


bento-menu-title-3 = Productes de { -brand-mozilla }
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Navegador { -brand-firefox } per a l'escriptori
bento-menu-firefox-mobile = Navegador { -brand-firefox } per al mòbil
bento-menu-made-by-mozilla = Creat per { -brand-mozilla }


connect-another-fx-mobile = Obteniu el { -brand-firefox } per a mòbils o tauletes


cs-heading = Serveis connectats
cs-description = Tots els serveis que utilitzeu i en els quals heu iniciat la sessió.
cs-cannot-refresh = Hi ha hagut un problema en actualitzar la llista de serveis connectats.
cs-cannot-disconnect = No s'ha trobat el client; no s'ha pogut desconnectar
cs-logged-out-2 = S'ha tancat la sessió del { $service }
cs-refresh-button =
    .title = Actualitza els serveis connectats
cs-connect-device-button = Connecta un dispositiu
cs-missing-device-help = Hi ha elements duplicats o que falten?
cs-disconnect-sync-heading = Desconnecta del Sync


cs-disconnect-sync-opt-prefix = Aquest dispositiu és:
cs-disconnect-sync-opt-suspicious = Sospitós
cs-disconnect-sync-opt-lost = Perdut o robat
cs-disconnect-sync-opt-old = Antic o reemplaçat
cs-disconnect-sync-opt-duplicate = Duplicat
cs-disconnect-sync-opt-not-say = Prefereixo no respondre


cs-disconnect-advice-confirm = Entesos
cs-disconnect-lost-advice-heading = S'ha desconnectat el dispositiu perdut o robat
cs-disconnect-suspicious-advice-heading = S'ha desconnectat el dispositiu sospitós
cs-sign-out-button = Tanca la sessió


cs-scope-firefox-vpn = VPN integrada del { -brand-firefox }


dc-heading = Ús i recollida de dades
dc-subheader-moz-accounts = { -product-mozilla-accounts(capitalization: "uppercase") }
dc-subheader-ff-browser = Navegador { -brand-firefox }
dc-learn-more = Més informació
drop-down-menu-sign-out = Tanca la sessió


flow-container-back = Enrere


flow-recovery-key-confirm-pwd-input-label = Introduïu la vostra contrasenya


flow-recovery-key-info-cta-text-v3 = Primers passos
flow-recovery-key-info-cancel-link = Cancel·la


flow-setup-2fa-manual-key-instruction = <strong>Pas 1:</strong> Introduïu aquest codi a la vostra aplicació d'autenticació preferida.
flow-setup-2fa-more-info-link = Més informació sobre les aplicacions d'autenticació
flow-setup-2fa-button = Continua
flow-setup-2fa-step-2-instruction = <strong>Pas 2:</strong> Introduïu el codi des de l'aplicació d'autenticació.
flow-setup-2fa-input-label = Introduïu el codi de 6 dígits


flow-setup-2fa-backup-choice-heading = Trieu un mètode de recuperació
flow-setup-2fa-backup-choice-description = Això us permet iniciar la sessió si no podeu accedir al vostre dispositiu mòbil o a l'aplicació d'autenticació.
flow-setup-2fa-backup-choice-phone-title = Telèfon de recuperació
flow-setup-2fa-backup-choice-phone-badge = Més fàcil
flow-setup-2fa-backup-choice-code-title = Codis d'autenticació de recuperació
flow-setup-2fa-backup-choice-code-badge = Més segur
flow-setup-2fa-backup-choice-code-info = Creeu i deseu codis d'autenticació d'un sol ús.


flow-setup-2fa-backup-code-confirm-heading = Introduïu el codi d'autenticació de recuperació
flow-setup-2fa-backup-code-confirm-code-input = Introduïu el codi de 10 caràcters
flow-setup-2fa-backup-code-confirm-button-finish = Finalitza


flow-setup-2fa-backup-code-dl-heading = Desa els codis d'autenticació de recuperació
flow-setup-2fa-backup-code-dl-button-continue = Continua


flow-setup-2fa-inline-complete-success-banner = S’ha habilitat l‘autenticació en dos passos
flow-setup-2fa-inline-complete-backup-code = Codis d'autenticació de recuperació
flow-setup-2fa-inline-complete-backup-phone = Telèfon de recuperació
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } codi restant
       *[other] { $count } codis restants
    }
flow-setup-2fa-prompt-continue-button = Continua


flow-setup-phone-confirm-code-heading = Introduïu el codi de verificació
flow-setup-phone-confirm-code-input-label = Introduïu el codi de 6 dígits
flow-setup-phone-confirm-code-button = Confirmació
flow-setup-phone-confirm-code-expired = El codi ha caducat?
flow-setup-phone-confirm-code-resend-code-button = Torna a enviar el codi
flow-setup-phone-confirm-code-resend-code-success = S'ha enviat el codi
flow-setup-phone-confirm-code-success-message-v2 = S'ha afegit el telèfon de recuperació
flow-change-phone-confirm-code-success-message = S'ha canviat el telèfon de recuperació
flow-setup-phone-submit-number-heading = Verifiqueu el vostre número de telèfon
flow-setup-phone-verify-number-instruction = Rebreu un missatge de text de { -brand-mozilla } amb un codi per a verificar el vostre número. No compartiu aquest codi amb ningú.
flow-setup-phone-submit-number-info-message-v2 = El telèfon de recuperació només està disponible als Estats Units i Canadà. No es recomanen números de VoIP ni màscares de telèfon.
flow-setup-phone-submit-number-button = Envia el codi


header-menu-open = Tanca el menú
header-menu-closed = Menú de navegació del lloc
header-back-to-top-link =
    .title = Torna a dalt
header-back-to-settings-link =
    .title = Torna a la configuració del { -product-mozilla-account }
header-title-2 = { -product-mozilla-account(capitalization: "uppercase") }
header-help = Ajuda


la-heading = Comptes enllaçats
la-description = Heu autoritzat l'accés als comptes següents.
la-unlink-button = Desenllaça
la-unlink-account-button = Desenllaça
la-set-password-button = Defineix una contrasenya
la-unlink-heading = Desenllaça d'un compte de tercers
la-unlink-content-3 = Esteu segur que voleu desenllaçar el compte? Si el desenllaceu, no se us tancaran les sessions dels serveis actualment connectats. Per fer-ho, caldrà que tanqueu la sessió manualment en la secció de Serveis connectats.
nav-linked-accounts = { la-heading }


modal-close-title = Tanca
modal-cancel-button = Cancel·la
modal-default-confirm-button = Confirma


modal-mfa-protected-title = Introduïu el codi de confirmació
modal-mfa-protected-input-label = Introduïu el codi de 6 dígits
modal-mfa-protected-cancel-button = Cancel·la
modal-mfa-protected-confirm-button = Confirma
modal-mfa-protected-code-expired = El codi ha caducat?
modal-mfa-protected-resend-code-link = Envia el codi nou per correu electrònic.


mvs-verify-your-email-2 = Confirmeu l'adreça electrònica
mvs-enter-verification-code-2 = Introduïu el codi de confirmació
mvs-enter-verification-code-desc-2 = Introduïu el codi de confirmació que s'ha enviat a <email>{ $email }</email> en els pròxims 5 minuts.
msv-cancel-button = Cancel·la
msv-submit-button-2 = Confirma


nav-settings = Paràmetres
nav-profile = Perfil
nav-security = Seguretat
nav-connected-services = Serveis connectats
nav-data-collection = Ús i recollida de dades
nav-paid-subs = Subscripcions de pagament


page-2fa-change-title = Canvieu l'autenticació en dos passos
page-2fa-change-success = S'ha actualitzat l'autenticació en dos passos


tfa-backup-codes-page-title = Codis d'autenticació de recuperació


page-2fa-setup-title = Autenticació en dos passos


avatar-page-title =
    .title = Foto de perfil
avatar-page-add-photo = Afegeix una foto
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fes una foto
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Elimina la foto
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Torna a fer la foto
avatar-page-cancel-button = Cancel·la
avatar-page-save-button = Desa
avatar-page-saving-button = S'està desant…
avatar-page-zoom-out-button =
    .title = Redueix
avatar-page-zoom-in-button =
    .title = Amplia
avatar-page-rotate-button =
    .title = Gira
avatar-page-camera-error = No s'ha pogut inicialitzar la càmera
avatar-page-new-avatar =
    .alt = foto de perfil nova
avatar-page-file-upload-error-3 = S'ha produït un problema en pujar la vostra foto de perfil
avatar-page-delete-error-3 = S'ha produït un problema en suprimir la vostra foto de perfil
avatar-page-image-too-large-error-2 = La mida de la imatge és massa gran per pujar-la


pw-change-header =
    .title = Canvia la contrasenya
pw-8-chars = 8 caràcters com a mínim
pw-not-email = No pot ser la vostra adreça electrònica
pw-change-must-match = La contrasenya nova coincideix amb la confirmació
pw-commonly-used = No pot ser una contrasenya d'ús comú
pw-tips = Protegiu-vos: no reutilitzeu les contrasenyes. Vegeu més consells per a la <linkExternal>creació de contrasenyes segures</linkExternal>.
pw-change-cancel-button = Cancel·la
pw-change-save-button = Desa
pw-change-forgot-password-link = Heu oblidat la contrasenya?
pw-change-current-password =
    .label = Introduïu la contrasenya actual
pw-change-new-password =
    .label = Introduïu una contrasenya nova
pw-change-confirm-password =
    .label = Confirmeu la contrasenya nova
pw-change-success-alert-2 = S'ha actualitzat la contrasenya


pw-create-header =
    .title = Creeu una contrasenya
pw-create-success-alert-2 = S'ha definit la contrasenya
pw-create-error-2 = S'ha produït un problema en definir la contrasenya


delete-account-header =
    .title = Suprimeix el compte
delete-account-step-1-2 = Pas 1 de 2
delete-account-step-2-2 = Pas 2 de 2
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-acknowledge = Tingueu en compte que, en suprimir el vostre compte:
delete-account-chk-box-1-v4 =
    .label = Es cancel·laran totes les subscripcions de pagament
delete-account-chk-box-2 =
    .label = És possible que perdeu la informació desada i la funcionalitat dels productes de { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Si reactiveu aquesta adreça electrònica, no recuperareu la vostra informació desada
delete-account-chk-box-4 =
    .label = S'esborraran totes les extensions i temes que hàgiu publicat a addons.mozilla.org
delete-account-continue-button = Continua
delete-account-delete-button-passwordless = Suprimeix el compte
delete-account-password-input =
    .label = Introduïu la contrasenya
delete-account-cancel-button = Cancel·la
delete-account-delete-button-2 = Suprimeix


display-name-page-title =
    .title = Nom a mostrar
display-name-input =
    .label = Introduïu el nom a mostrar
submit-display-name = Desa
cancel-display-name = Cancel·la
display-name-update-error-2 = S'ha produït un problema en actualitzar el vostre nom a mostrar
display-name-success-alert-2 = S'ha actualitzat el nom a mostrar


page-passkey-add-cancel = Cancel·la


recent-activity-show-more-button = Mostra'n més
recent-activity-account-create-v2 = S'ha creat el compte
recent-activity-account-disable-v2 = Compte desactivat
recent-activity-account-two-factor-added = S’ha habilitat l‘autenticació en dos passos
recent-activity-account-two-factor-removed = S'ha eliminat l'autenticació en dos passos
recent-activity-account-recovery-key-removed = S’ha eliminat una clau de recuperació del compte
recent-activity-account-password-added = S'ha afegit una contrasenya nova
recent-activity-account-password-changed = S'ha canviat la contrasenya


settings-recovery-phone-remove-cancel = Cancel·la


add-secondary-email-step-1 = Pas 1 de 2
add-secondary-email-error-2 = S'ha produït un problema en crear aquesta adreça electrònica
add-secondary-email-page-title =
    .title = Adreça electrònica secundària
add-secondary-email-enter-address =
    .label = Escriviu una adreça electrònica
add-secondary-email-cancel-button = Cancel·la
add-secondary-email-save-button = Desa


add-secondary-email-step-2 = Pas 2 de 2
verify-secondary-email-page-title =
    .title = Adreça electrònica secundària
verify-secondary-email-verification-code-2 =
    .label = Introduïu el codi de confirmació
verify-secondary-email-cancel-button = Cancel·la
verify-secondary-email-verify-button-2 = Confirma


delete-account-link = Suprimeix el compte


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-vpn =
    .alt = { -product-mozilla-vpn }
product-promo-vpn-description = Descobriu una capa addicional de protecció i navegació anònima.


profile-heading = Perfil
profile-picture =
    .header = Imatge
profile-display-name =
    .header = Nom a mostrar
profile-primary-email =
    .header = Adreça electrònica principal


security-heading = Seguretat
security-password =
    .header = Contrasenya
security-password-created-date = Data de creació: { $date }
security-not-set = No s'ha definit
security-action-create = Crea
signout-sync-page-title = La sessió ha caducat


tfa-row-backup-codes-add-cta = Afegeix
tfa-row-backup-phone-change-cta = Canvia
tfa-row-backup-phone-add-cta = Afegeix
passkey-delete-modal-cancel-button = Cancel·la
passkey-delete-error = S'ha produït un problema en suprimir la clau d'accés. Torneu-ho a provar d'aquí a uns minuts.
passkey-rename-save-button = Desa
passkey-rename-cancel-button = Cancel·la


switch-turn-off = Desactiva
switch-turn-on = Activa
switch-submitting = S'està enviant…
switch-is-on = activat
switch-is-off = desactivat


row-defaults-action-add = Afegeix
row-defaults-action-change = Canvia
row-defaults-action-disable = Desactiva
row-defaults-status = Cap


passkey-row-header = Claus d'accés
passkey-row-enabled = Activada
passkey-row-action-create = Crea
passkey-row-info-link-2 = Més informació


rk-enabled = Activada
rk-not-set = No definida
rk-action-create = Crea
rk-action-change-button = Canvia
rk-action-remove = Elimina
rk-key-removed-2 = S’ha eliminat una clau de recuperació del compte
rk-cannot-remove-key = No s'ha pogut eliminar la clau de recuperació del compte.
rk-content-explain = Restaureu la vostra informació en cas que oblideu la contrasenya.


se-heading = Adreça electrònica secundària
    .header = Adreça electrònica secundària
se-cannot-refresh-email = S'ha produït un error en actualitzar aquesta adreça electrònica.
se-remove-email =
    .title = Elimina l'adreça electrònica
se-refresh-email =
    .title = Actualitza l'adreça electrònica
se-make-primary = Converteix en principal
se-default-content = Accediu al compte si no podeu iniciar la sessió amb l'adreça electrònica principal.
se-secondary-email-none = Cap


tfa-row-header = Autenticació en dos passos
tfa-row-enabled = Activada
tfa-row-action-add = Afegeix
tfa-row-action-disable = Desactiva
tfa-row-action-change = Canvia
tfa-row-button-refresh =
    .title = Actualitza l'autenticació en dos passos
tfa-row-cannot-refresh = S'ha produït un error en actualitzar la verificació en dos passos.
tfa-row-disable-modal-heading = Voleu desactivar l'autenticació en dos passos?
tfa-row-disable-modal-confirm = Desactiva
tfa-row-disabled-2 = S'ha inhabilitat l'autenticació en dos passos


auth-error-102 = El compte és desconegut
auth-error-103 = Contrasenya incorrecta
auth-error-110 = El testimoni no és vàlid
auth-error-114-generic = Heu fet massa intents. Torneu-ho a provar més tard.
auth-error-114 = Heu fet massa intents. Torneu-ho a provar { $retryAfter }.
auth-error-125 = La sol·licitud s'ha blocat per raons de seguretat
auth-error-138-2 = Sessió no confirmada
auth-error-139 = L'adreça electrònica secundària ha de ser diferent de l'adreça electrònica del compte
auth-error-155 = No s'ha trobat el testimoni TOTP
auth-error-156 = No s'ha trobat el codi d'autenticació de recuperació
auth-error-159 = La clau de recuperació del compte no és vàlida
auth-error-202 = La funció no està activada
auth-error-203 = El sistema no està disponible; torneu-ho a intentar més tard
auth-error-240 = Aquest compte s'ha desactivat
auth-error-999 = Error inesperat
auth-error-1001 = S'ha cancel·lat l'intent d'inici de sessió
auth-error-1002 = La sessió ha caducat. Inicieu la sessió per continuar.
auth-error-1008 = La contrasenya nova ha de ser diferent
auth-error-1010 = Cal una contrasenya vàlida
auth-error-1011 = Cal una adreça electrònica vàlida
auth-error-1031 = Heu d'introduir la vostra edat per registrar-vos
auth-error-1032 = Heu d'introduir una edat vàlida per registrar-vos
auth-error-1054 = El codi d'autenticació en dos passos no és vàlid
auth-error-1062 = Redirecció no vàlida
oauth-error-1000 = Hi ha hagut un problema. Tanqueu aquesta pestanya i torneu-ho a provar.


passkey-registration-canceled-link = Més informació
passkey-registration-error-not-supported-link = Més informació
passkey-registration-error-could-not-complete-link = Més informació


connect-another-device-signin-confirmed-banner = S'ha confirmat l'inici de sessió
connect-another-device-signin-link = Inicia la sessió
connect-another-device-cad-link = Connecteu un altre dispositiu
connect-another-device-not-now-link = Ara no
connect-another-device-page-title = Connecteu un altre dispositiu


cookies-disabled-button-try-again = Torna-ho a provar
cookies-disabled-learn-more = Més informació


index-header = Introduïu la vostra adreça electrònica
index-cta = Inici de sessió o registre
index-email-input =
    .label = Introduïu la vostra adreça electrònica
index-account-delete-success = El compte s'ha suprimit correctament


inline-passwordless-sync-setup-page-title = Voleu ometre la contrasenya la pròxima vegada?
inline-passwordless-sync-setup-heading = Voleu ometre la contrasenya la pròxima vegada?
inline-passwordless-sync-setup-not-now-button = Ara no
inline-passwordless-sync-setup-error-cancelled-description = Confirmeu amb la vostra clau d'accés per a ometre la contrasenya la pròxima vegada.
inline-passwordless-sync-setup-error-generic-v2 = No hem pogut activar aquesta clau d'accés per a iniciar la sessió i la sincronització. La pròxima vegada haureu d'introduir la contrasenya.


inline-recovery-setup-choice-page-title = Trieu un mètode de recuperació


inline-totp-setup-cancel-setup-button = Cancel·la la configuració
inline-totp-setup-continue-button = Continua
inline-totp-setup-ready-button = Preparat
inline-totp-setup-security-code-placeholder = Codi d'autenticació
inline-totp-setup-page-title = Autenticació en dos passos


page-not-found-heading = No s'ha trobat la pàgina
page-not-found-home-button = Inici
page-not-found-page-title = No s'ha trobat la pàgina


pair-auth-complete-manage-devices-link = Gestiona els dispositius


auth-totp-confirm-button = Confirmació


pair-failure-try-again-link = Torna-ho a provar


pair-cad-header-v2 = Connecteu un altre dispositiu
pair-not-now-button = Ara no
pair-get-started-button = Primers passos
pair-qr-code-aria-label = Codi QR


pair-choice-continue-button = Continua


pair-choice-page-title = Connecteu un altre dispositiu


pair-success-message-2 = S'ha aparellat correctament.


pair-supp-allow-cancel-link = Cancel·la


pair-unsupported-learn-more-link-v2 = Més informació
pair-unsupported-desktop-firefox-fallback-page-title = Hi ha hagut un problema


pair2-authority-continue-on-mobile-cancel-button = Cancel·la


pair2-authority-scan-qr-skip-button = Omet per ara


pair2-authority-sync-success-sync-settings-button-v2 = Gestiona els paràmetres de sincronització


pair2-authority-timeout-and-cancel-try-again-button = Torna-ho a provar
pair2-authority-timeout-and-cancel-sync-settings-button = Paràmetres de sincronització
pair2-authority-timeout-and-cancel-timeout-page-title = S'ha esgotat el temps d'espera de la connexió


pair2-supplicant-approve-sign-in-cancel-button = Cancel·la


pair2-supplicant-connect-this-device-connect-button = Connecta
pair2-supplicant-connect-this-device-cancel-button = Cancel·la


pair2-supplicant-download-firefox-learn-more-link = Més informació


pair2-supplicant-ready-to-scan-learn-more-link = Més informació
pair2-supplicant-ready-to-scan-page-title = Llest per escanejar


pair2-supplicant-timeout-and-cancel-timeout-page-title = S'ha esgotat el temps d'espera de la connexió


permissions-label-email = Adreça electrònica
permissions-label-display-name = Nom a mostrar
permissions-label-avatar = Imatge del compte
permissions-continue-button = Continua
permissions-cancel-button = Cancel·la


force-password-change-page-title = Canvieu la contrasenya


service-welcome-vpn-page-title = Activa la VPN


account-recovery-confirm-key-button-2 = Continua


complete-reset-password-success-alert = S'ha definit la contrasenya
complete-reset-password-error-alert = S'ha produït un problema en definir la contrasenya
reset-password-complete-banner-heading = S'ha reiniciat la vostra contrasenya.
confirm-backup-code-reset-password-confirm-button = Confirmació


confirm-reset-password-with-code-heading = Comproveu el correu electrònic
confirm-reset-password-otp-submit-button = Continua
confirm-reset-password-otp-different-account-link = Utilitza un altre compte


confirm-totp-reset-password-header = Reinicia la contrasenya
confirm-totp-reset-password-confirm-button = Confirmació
confirm-totp-reset-password-use-different-account = Utilitza un altre compte


password-reset-flow-heading = Reinicia la contrasenya
password-reset-forgot-heading = Heu oblidat la contrasenya?
password-reset-email-input =
    .label = Introduïu la vostra adreça electrònica
password-reset-submit-button-2 = Continua
password-reset-flow-page-title = Reinicia la contrasenya


reset-password-complete-header = S'ha reiniciat la vostra contrasenya


password-reset-recovery-method-header = Reinicia la contrasenya


reset-password-recovery-phone-flow-heading = Reinicia la contrasenya
reset-password-recovery-phone-heading = Introduïu el codi de recuperació
reset-password-recovery-phone-code-submit-button = Confirmació
reset-password-recovery-phone-general-error-description = Torneu-ho a provar més tard.


server-error-heading = Error 500
server-error-home-button = Inici


error-label = Error:


signin-password-page-title = Introduïu la vostra contrasenya
signin-cached-page-title = Inicia la sessió
signin-button-start-syncing = Inicia la sincronització
signin-button = Inicia la sessió
signin-header = Inicia la sessió
signin-use-a-different-account-link = Utilitza un altre compte
signin-forgot-password-link = Heu oblidat la contrasenya?
signin-password-button-label = Contrasenya
signin-account-locked-banner-heading = Reinicia la contrasenya


back = Enrere


signin-passkey-fallback-password-label = Contrasenya
signin-passkey-fallback-continue = Continua
signin-passkey-fallback-forgot-password-link = Heu oblidat la contrasenya?
signin-passkey-fallback-wrap-unusable-link = Més informació


signin-passwordless-code-heading = Introduïu el codi de confirmació
signin-passwordless-code-confirm-button = Confirmació
signin-passwordless-code-other-account-link = Utilitza un altre compte


signin-recovery-method-header = Inicia la sessió


signin-recovery-code-heading = Inicia la sessió
signin-recovery-code-confirm-button = Confirmació
signin-recovery-code-use-phone-failure-description = Torneu-ho a provar més tard.


signin-recovery-phone-flow-heading = Inicia la sessió
signin-recovery-phone-heading = Introduïu el codi de recuperació
signin-recovery-phone-code-submit-button = Confirmació
signin-recovery-phone-general-error-description = Torneu-ho a provar més tard.


signin-token-code-confirm-button = Confirmació


signin-totp-code-header = Inicia la sessió
signin-totp-code-confirm-button = Confirmació
signin-totp-code-other-account-link = Utilitza un altre compte


signin-unblock-code-input = Introdueix un codi d'autorització
signin-unblock-submit-button = Continua
signin-unblock-code-required-error = Cal un codi d'autorització
signin-unblock-resend-code-button = No és a la safata d'entrada o al correu brossa? Torna'l a enviar


confirm-signup-code-page-title-2 = Confirmeu l'adreça electrònica
confirm-signup-code-confirm-button = Confirmació
confirm-signup-code-sync-button = Inicia la sincronització
confirm-signup-code-success-alert = El compte s'ha confirmat correctament


signup-heading-v2 = Creeu una contrasenya
signup-page-title = Crea un compte


signup-confirmed-sync-header = La sincronització està activada
signup-confirmed-sync-button = Comença a navegar
signup-confirmed-sync-add-device-link = Afegeix un altre dispositiu
signup-confirmed-sync-page-title = La sincronització està activada


update-firefox-download-button = Baixa l'última versió
