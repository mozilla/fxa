



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
app-page-title-2 = { $title } | { -product-mozilla-accounts(capitalization: "uppercase") }


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


button-passkey-signin-loading = S'està iniciant la sessió de manera segura...


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
confirm-signup-aria-label =
    .aria-label = Un sobre que conté un enllaç
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


input-password-hide = Amaga la contrasenya
input-password-show = Mostra la contrasenya


locale-toggle-select-label = Trieu una llengua
locale-toggle-browser-default = Opció per defecte del navegador
error-bad-request = Sol·licitud incorrecta


pair-unsupported-hint-step-close-page = Tanca aquesta pàgina
pair-unsupported-hint-step-app-menu = Toca el <b>menú de l'aplicació</b>
pair-unsupported-hint-learn-more-link = Més informació


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


flow-setup-phone-confirm-code-heading = Introduïu el codi de verificació
flow-setup-phone-confirm-code-input-label = Introduïu el codi de 6 dígits
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
delete-account-acknowledge = Tingueu en compte que, en suprimir el vostre compte:
delete-account-chk-box-2 =
    .label = És possible que perdeu la informació desada i la funcionalitat dels productes de { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Si reactiveu aquesta adreça electrònica, no recuperareu la vostra informació desada
delete-account-chk-box-4 =
    .label = S'esborraran totes les extensions i temes que hàgiu publicat a addons.mozilla.org
delete-account-continue-button = Continua
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


passkey-delete-error = S'ha produït un problema en suprimir la clau d'accés. Torneu-ho a provar d'aquí a uns minuts.


switch-turn-off = Desactiva
switch-turn-on = Activa
switch-submitting = S'està enviant…
switch-is-on = activat
switch-is-off = desactivat


row-defaults-action-add = Afegeix
row-defaults-action-change = Canvia
row-defaults-action-disable = Desactiva
row-defaults-status = Cap


rk-enabled = Activada
rk-not-set = No definida
rk-action-create = Crea
rk-action-remove = Elimina
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
tfa-row-button-refresh =
    .title = Actualitza l'autenticació en dos passos
tfa-row-cannot-refresh = S'ha produït un error en actualitzar la verificació en dos passos.
tfa-row-disable-modal-heading = Voleu desactivar l'autenticació en dos passos?
tfa-row-disable-modal-confirm = Desactiva


auth-error-102 = El compte és desconegut
auth-error-103 = Contrasenya incorrecta
auth-error-110 = El testimoni no és vàlid
auth-error-114-generic = Heu fet massa intents. Torneu-ho a provar més tard.
auth-error-114 = Heu fet massa intents. Torneu-ho a provar { $retryAfter }.
auth-error-125 = La sol·licitud s'ha blocat per raons de seguretat
auth-error-138-2 = Sessió no confirmada
auth-error-139 = L'adreça electrònica secundària ha de ser diferent de l'adreça electrònica del compte
auth-error-155 = No s'ha trobat el testimoni TOTP
auth-error-1008 = La contrasenya nova ha de ser diferent


connect-another-device-not-now-link = Ara no


inline-passwordless-sync-setup-page-title = Voleu ometre la contrasenya la pròxima vegada?
inline-passwordless-sync-setup-heading = Voleu ometre la contrasenya la pròxima vegada?
inline-passwordless-sync-setup-error-cancelled-description = Confirmeu amb la vostra clau d'accés per a ometre la contrasenya la pròxima vegada.
inline-passwordless-sync-setup-error-generic-v2 = No hem pogut activar aquesta clau d'accés per a iniciar la sessió i la sincronització. La pròxima vegada haureu d'introduir la contrasenya.


pair-not-now-button = Ara no
