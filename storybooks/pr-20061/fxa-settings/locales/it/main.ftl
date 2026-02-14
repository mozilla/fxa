



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $capitalization ->
        [uppercase] Account Firefox
       *[lowercase] account Firefox
    }
-product-mozilla-account =
    { $capitalization ->
        [uppercase] Account Mozilla
       *[lowercase] account Mozilla
    }
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Account Mozilla
       *[lowercase] account Mozilla
    }
-product-firefox-account =
    { $capitalization ->
        [uppercase] Account Firefox
       *[lowercase] account Firefox
    }
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

app-general-err-heading = Errore generale dell’applicazione
app-general-err-message = Si è verificato un problema. Riprova più tardi.
app-query-parameter-err-heading = Richiesta non valida: parametri della query non validi


app-footer-mozilla-logo-label = Logo { -brand-mozilla }
app-footer-privacy-notice = Informativa sulla privacy del sito web
app-footer-terms-of-service = Condizioni di utilizzo del servizio


app-default-title-2 = { -product-mozilla-accounts(capitalization: "uppercase") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(capitalization: "uppercase") }


link-sr-new-window = Si apre in una nuova finestra


app-loading-spinner-aria-label-loading = Caricamento in corso…


app-logo-alt-3 =
    .alt = Logo con la m di  { -brand-mozilla }



resend-code-success-banner-heading = È stato inviato un nuovo codice alla tua email.
resend-link-success-banner-heading = È stato inviato un nuovo link al tuo indirizzo email.
resend-success-banner-description = Aggiungi { $accountsEmail } ai tuoi contatti per garantire una consegna senza problemi.


brand-banner-dismiss-button-2 =
    .aria-label = Chiudi banner
brand-prelaunch-title = Gli { -product-firefox-accounts } cambieranno nome in { -product-mozilla-accounts } dal 1° novembre
brand-prelaunch-subtitle = Continuerai ad accedere con lo stesso nome utente e password e non ci saranno altre modifiche ai prodotti che utilizzi.
brand-postlaunch-title = Abbiamo cambiato il nome degli { -product-firefox-accounts } in { -product-mozilla-accounts }. Continuerai ad accedere con lo stesso nome utente e password e non ci saranno altre modifiche ai prodotti che utilizzi.
brand-learn-more = Ulteriori informazioni
brand-close-banner =
    .alt = Chiudi banner
brand-m-logo =
    .alt = Logo con la m di  { -brand-mozilla }


button-back-aria-label = Indietro
button-back-title = Indietro


recovery-key-download-button-v3 = Scarica e continua
    .title = Scarica e continua
recovery-key-pdf-heading = Chiave di recupero dell’account
recovery-key-pdf-download-date = Generata: { $date }
recovery-key-pdf-key-legend = Chiave di recupero dell’account
recovery-key-pdf-instructions = Questa chiave consente di recuperare i dati crittati del browser (inclusi password, segnalibri e cronologia) se si dimentica la password dell’account. Conservala in un posto facile da ricordare.
recovery-key-pdf-storage-ideas-heading = Luoghi in cui conservare la chiave
recovery-key-pdf-support = Ulteriori informazioni sulla chiave di recupero dell’account
recovery-key-pdf-download-error = Siamo spiacenti, si è verificato un problema durante il download della chiave di recupero dell’account.


button-passkey-signin = Accedi con passkey
button-passkey-signin-loading = Accesso sicuro in corso…


choose-newsletters-prompt-2 = Ottieni di più da { -brand-mozilla }:
choose-newsletters-option-latest-news =
    .label = Ricevi le ultime notizie e gli aggiornamenti sui prodotti
choose-newsletters-option-test-pilot =
    .label = Accesso in anteprima per testare nuovi prodotti
choose-newsletters-option-reclaim-the-internet =
    .label = Inviti all’azione per riprendere il controllo di Internet


datablock-download =
    .message = Scaricato
datablock-copy =
    .message = Copiato
datablock-print =
    .message = Stampato


datablock-copy-success =
    { $count ->
        [one] Codice copiato
       *[other] Codici copiati
    }
datablock-download-success =
    { $count ->
        [one] Codice scaricato
       *[other] Codici scaricati
    }
datablock-print-success =
    { $count ->
        [one] Codice stampato
       *[other] Codici stampati
    }


datablock-inline-copy =
    .message = Copiato


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (stimato)
device-info-block-location-region-country = { $region }, { $country } (stimato)
device-info-block-location-city-country = { $city }, { $country } (stimato)
device-info-block-location-country = { $country } (stimato)
device-info-block-location-unknown = Posizione sconosciuta
device-info-browser-os = { $browserName } su { $genericOSName }
device-info-ip-address = Indirizzo IP: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Password
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ripeti password
form-password-with-inline-criteria-signup-submit-button = Crea un account
form-password-with-inline-criteria-reset-new-password =
    .label = Nuova password
form-password-with-inline-criteria-confirm-password =
    .label = Conferma password
form-password-with-inline-criteria-reset-submit-button = Crea nuova password
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Password
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Ripeti password
form-password-with-inline-criteria-set-password-submit-button = Avvia la sincronizzazione
form-password-with-inline-criteria-match-error = Le password non corrispondono
form-password-with-inline-criteria-sr-too-short-message = La password deve contenere almeno 8 caratteri.
form-password-with-inline-criteria-sr-not-email-message = La password non deve contenere il tuo indirizzo email.
form-password-with-inline-criteria-sr-not-common-message = La password non deve essere una password di uso comune.
form-password-with-inline-criteria-sr-requirements-met = La password inserita rispetta tutti i requisiti per le password.
form-password-with-inline-criteria-sr-passwords-match = Le password inserite corrispondono.


form-verify-code-default-error = Campo obbligatorio


form-verify-totp-disabled-button-title-numeric = Inserisci un codice di { $codeLength } cifre per continuare
form-verify-totp-disabled-button-title-alphanumeric = Inserisci un codice di { $codeLength } caratteri per continuare


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Chiave di recupero dell’account { -brand-firefox }
get-data-trio-title-backup-verification-codes = Codici di autenticazione di backup
get-data-trio-download-2 =
    .title = Scarica
    .aria-label = Scarica
get-data-trio-copy-2 =
    .title = Copia
    .aria-label = Copia
get-data-trio-print-2 =
    .title = Stampa
    .aria-label = Stampa


alert-icon-aria-label =
    .aria-label = Avviso
icon-attention-aria-label =
    .aria-label = Attenzione
icon-warning-aria-label =
    .aria-label = Attenzione
authenticator-app-aria-label =
    .aria-label = Applicazione di autenticazione
backup-codes-icon-aria-label-v2 =
    .aria-label = Codici di autenticazione di backup attivati
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Codici di autenticazione di backup disattivati
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS di recupero attivato
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS di recupero disattivato
canadian-flag-icon-aria-label =
    .aria-label = Bandiera del Canada
checkmark-icon-aria-label =
    .aria-label = Spunta
checkmark-success-icon-aria-label =
    .aria-label = Completato
checkmark-enabled-icon-aria-label =
    .aria-label = Attivo
close-icon-aria-label =
    .aria-label = Chiudi messaggio
code-icon-aria-label =
    .aria-label = Codice
error-icon-aria-label =
    .aria-label = Errore
info-icon-aria-label =
    .aria-label = Informazioni
usa-flag-icon-aria-label =
    .aria-label = Bandiera degli Stati Uniti
icon-loading-arrow-aria-label =
    .aria-label = Caricamento in corso…
icon-passkey-aria-label =
    .aria-label = Passkey


hearts-broken-image-aria-label =
    .aria-label = Un computer, un telefono cellulare e l’immagine di un cuore spezzato su ciascuno
hearts-verified-image-aria-label =
    .aria-label = Un computer, un telefono cellulare e un tablet con un cuore pulsante su ciascuno
signin-recovery-code-image-description =
    .aria-label = Documento che contiene testo nascosto.
signin-totp-code-image-label =
    .aria-label = Un dispositivo con un codice nascosto a 6 cifre.
confirm-signup-aria-label =
    .aria-label = Una busta contenente un link
security-shield-aria-label =
    .aria-label = Illustrazione per rappresentare una chiave di recupero dell’account.
recovery-key-image-aria-label =
    .aria-label = Illustrazione per rappresentare una chiave di recupero dell’account.
password-image-aria-label =
    .aria-label = Un’illustrazione per rappresentare la digitazione di una password.
lightbulb-aria-label =
    .aria-label = Illustrazione per rappresentare la creazione di un suggerimento per l’archiviazione.
email-code-image-aria-label =
    .aria-label = Illustrazione per rappresentare un’email contenente un codice.
recovery-phone-image-description =
    .aria-label = Dispositivo mobile che riceve un codice tramite SMS.
recovery-phone-code-image-description =
    .aria-label = Codice ricevuto su un dispositivo mobile.
backup-recovery-phone-image-aria-label =
    .aria-label = Dispositivo mobile con funzionalità SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Schermo del dispositivo con codici
sync-clouds-image-aria-label =
    .aria-label = Nuvole con un’icona che rappresenta la sincronizzazione
confetti-falling-image-aria-label =
    .aria-label = Animazione con coriandoli che cadono


inline-recovery-key-setup-signed-in-firefox-2 = Hai effettuato l’accesso a { -brand-firefox }.
inline-recovery-key-setup-create-header = Proteggi il tuo account
inline-recovery-key-setup-create-subheader = Hai un minuto per proteggere i tuoi dati?
inline-recovery-key-setup-info = Genera una chiave di recupero dell’account in modo da poter ripristinare i dati di navigazione sincronizzati nel caso in cui dimenticassi la password.
inline-recovery-key-setup-start-button = Genera una chiave di recupero dell’account
inline-recovery-key-setup-later-button = Più tardi


input-password-hide = Nascondi password
input-password-show = Mostra password
input-password-hide-aria-2 = La password è attualmente visibile sullo schermo.
input-password-show-aria-2 = La password è attualmente nascosta.
input-password-sr-only-now-visible = La password è ora visibile sullo schermo.
input-password-sr-only-now-hidden = La password è ora nascosta.


input-phone-number-country-list-aria-label = Scegli la nazione
input-phone-number-enter-number = Inserire il numero di telefono
input-phone-number-country-united-states = Stati Uniti
input-phone-number-country-canada = Canada
legal-back-button = Indietro


reset-pwd-link-damaged-header = Link per la reimpostazione della password danneggiato
signin-link-damaged-header = Il link di conferma è danneggiato
report-signin-link-damaged-header = Il link non è valido
reset-pwd-link-damaged-message = Nel link su cui hai fatto clic mancano alcuni caratteri, probabilmente è un problema causato dal client di posta elettronica. Riprova assicurandoti di selezionare e copiare con cura il link.


link-expired-new-link-button = Ricevi un nuovo link


remember-password-text = Ricordi la password?
remember-password-signin-link = Accedi


primary-email-confirmation-link-reused = L’indirizzo email primario è già stato confermato
signin-confirmation-link-reused = L’accesso è già stato confermato
confirmation-link-reused-message = Questo link di conferma è già stato utilizzato (e può essere utilizzato una sola volta).


locale-toggle-select-label = Scegli lingua
locale-toggle-browser-default = Predefinita del browser
error-bad-request = Richiesta non valida


password-info-balloon-why-password-info = Questa password è necessaria per accedere ai dati crittati che salviamo per te.
password-info-balloon-reset-risk-info = Un ripristino potrebbe comportare la perdita di dati come password e segnalibri.


password-strength-long-instruction = Scegli una password complessa che non hai utilizzato su altri siti. Assicurati che soddisfi i requisiti di sicurezza:
password-strength-short-instruction = Scegli una password complessa:
password-strength-inline-min-length = Almeno 8 caratteri
password-strength-inline-not-email = Non uguale al tuo indirizzo email
password-strength-inline-not-common = Non una password di uso comune
password-strength-inline-confirmed-must-match = La conferma corrisponde alla nuova password
password-strength-inline-passwords-match = Le password corrispondono


account-recovery-notification-cta = Genera
account-recovery-notification-header-value = Non perdere i tuoi dati se dimentichi la password
account-recovery-notification-header-description = Genera una chiave di recupero dell’account in modo da poter ripristinare i dati di navigazione sincronizzati nel caso in cui dimenticassi la password.
recovery-phone-promo-cta = Aggiungi telefono per il recupero dell’account
recovery-phone-promo-heading = Aggiungi ulteriore protezione al tuo account con un telefono per il recupero dell’account
recovery-phone-promo-description = Ora puoi accedere con una password monouso via SMS se non puoi utilizzare l’app di autenticazione in due passaggi.
recovery-phone-promo-info-link = Ulteriori informazioni sul recupero e sui rischi legati a “SIM swap”
promo-banner-dismiss-button =
    .aria-label = Chiudi banner


ready-complete-set-up-instruction = Per completare la configurazione inserisci la nuova password sugli altri dispositivi { -brand-firefox }.
manage-your-account-button = Gestisci il tuo account
ready-use-service = Ora puoi utilizzare { $serviceName }
ready-use-service-default = Ora è possibile utilizzare le impostazioni dell’account
ready-account-ready = Il tuo account è pronto!
ready-continue = Continua
sign-in-complete-header = Accesso confermato
sign-up-complete-header = Account confermato
primary-email-verified-header = Indirizzo email primario confermato


flow-recovery-key-download-storage-ideas-heading-v2 = Luoghi in cui conservare la chiave:
flow-recovery-key-download-storage-ideas-folder-v2 = Cartella su un dispositivo sicuro
flow-recovery-key-download-storage-ideas-cloud = Spazio di archiviazione su cloud affidabile
flow-recovery-key-download-storage-ideas-print-v2 = Copia cartacea
flow-recovery-key-download-storage-ideas-pwd-manager = Gestore di password


flow-recovery-key-hint-header-v2 = Aggiungi un suggerimento per trovare la chiave
flow-recovery-key-hint-message-v3 = Questo suggerimento dovrebbe aiutarti a ricordare dove hai memorizzato la chiave di recupero dell’account. Possiamo mostrartelo durante la reimpostazione della password per recuperare i tuoi dati.
flow-recovery-key-hint-input-v2 =
    .label = Inserisci un suggerimento (facoltativo)
flow-recovery-key-hint-cta-text = Fine
flow-recovery-key-hint-char-limit-error = Il suggerimento deve contenere meno di 255 caratteri.
flow-recovery-key-hint-unsafe-char-error = Il suggerimento non può contenere caratteri Unicode non sicuri. Sono consentiti solo lettere, numeri, segni di punteggiatura e simboli.


password-reset-warning-icon = Attenzione
password-reset-chevron-expanded = Comprimi avviso
password-reset-chevron-collapsed = Espandi avviso
password-reset-data-may-not-be-recovered = Potrebbe non essere possibile recuperare i dati del browser
password-reset-previously-signed-in-device-2 = Hai un dispositivo su cui hai effettuato l’accesso in precedenza?
password-reset-data-may-be-saved-locally-2 = I dati del browser potrebbero essere salvati su quel dispositivo. Reimposta la password, quindi accedi per ripristinare e sincronizzare i tuoi dati.
password-reset-no-old-device-2 = Hai un nuovo dispositivo ma non hai accesso a nessuno dei tuoi dispositivi precedenti?
password-reset-encrypted-data-cannot-be-recovered-2 = Siamo spiacenti, non è possibile recuperare i dati crittati del tuo browser sui server { -brand-firefox }.
password-reset-warning-have-key = Hai una chiave di recupero dell’account?
password-reset-warning-use-key-link = Usala ora per reimpostare la password e conservare i tuoi dati


alert-bar-close-message = Chiudi messaggio


avatar-your-avatar =
    .alt = Il tuo avatar
avatar-default-avatar =
    .alt = Avatar predefinito




bento-menu-title-3 = Prodotti { -brand-mozilla }
bento-menu-tagline = Altri prodotti { -brand-mozilla } che proteggono la tua privacy
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Browser { -brand-firefox } per desktop
bento-menu-firefox-mobile = Browser { -brand-firefox } per dispositivi mobili
bento-menu-made-by-mozilla = Realizzato da { -brand-mozilla }


connect-another-fx-mobile = Ottieni { -brand-firefox } sul cellulare o tablet
connect-another-find-fx-mobile-2 = Trova { -brand-firefox } in { -google-play } e { -app-store }.
connect-another-play-store-image-2 =
    .alt = Scarica { -brand-firefox } su { -google-play }
connect-another-app-store-image-3 =
    .alt = Scarica { -brand-firefox } su { -app-store }


cs-heading = Servizi connessi
cs-description = Tutti i servizi ai quali hai effettuato l’accesso e che stai utilizzando.
cs-cannot-refresh = Siamo spiacenti, si è verificato un problema durante l’aggiornamento della lista dei servizi connessi.
cs-cannot-disconnect = Client non trovato, impossibile effettuare la disconnessione
cs-logged-out-2 = Disconnesso da { $service }
cs-refresh-button =
    .title = Aggiorna i servizi connessi
cs-missing-device-help = Elementi duplicati o mancanti?
cs-disconnect-sync-heading = Disconnetti da Sync


cs-disconnect-sync-content-3 = I dati relativi alla navigazione rimarranno nel dispositivo <span>{ $device }</span>, ma non verranno più sincronizzati con il tuo account.
cs-disconnect-sync-reason-3 = Per quale motivo stai disconnettendo <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = Il dispositivo è:
cs-disconnect-sync-opt-suspicious = Sospetto
cs-disconnect-sync-opt-lost = Perso o rubato
cs-disconnect-sync-opt-old = Vecchio o sostituito
cs-disconnect-sync-opt-duplicate = Duplicato
cs-disconnect-sync-opt-not-say = Preferisco non rispondere


cs-disconnect-advice-confirm = OK
cs-disconnect-lost-advice-heading = Dispositivo perso o rubato disconnesso
cs-disconnect-lost-advice-content-3 = Poiché il tuo dispositivo è stato smarrito o rubato, per mantenere le tue informazioni al sicuro è consigliato cambiare la password dell’{ -product-mozilla-account } nelle impostazioni. Dovresti anche verificare con il produttore del tuo dispositivo come cancellare i dati da remoto.
cs-disconnect-suspicious-advice-heading = Dispositivo sospetto disconnesso
cs-disconnect-suspicious-advice-content-2 = Se il dispositivo disconnesso è effettivamente sospetto, ti consigliamo di modificare la password dell’{ -product-mozilla-account } nelle impostazioni del tuo account per mantenere le tue informazioni al sicuro. Ti consigliamo anche modificare qualsiasi altra password salvata in { -brand-firefox } digitando about:logins nelle barra degli indirizzi.
cs-sign-out-button = Disconnetti


dc-heading = Raccolta e utilizzo dati
dc-subheader-moz-accounts = { -product-mozilla-accounts(capitalization: "uppercase") }
dc-subheader-ff-browser = Browser { -brand-firefox }
dc-subheader-content-2 = Consenti al servizio di { -product-mozilla-accounts } di inviare a { -brand-mozilla } dati tecnici e di interazione.
dc-subheader-ff-content = Per controllare o aggiornare le impostazioni relative ai dati tecnici e di interazione del browser { -brand-firefox }, apri le impostazioni di { -brand-firefox } e accedi a Privacy e sicurezza.
dc-opt-out-success-2 = Disattivazione riuscita. Il servizio di { -product-mozilla-accounts } non invierà a { -brand-mozilla } dati tecnici o di interazione.
dc-opt-in-success-2 = Grazie! La condivisione di questi dati ci aiuta a migliorare gli { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Siamo spiacenti, si è verificato un problema durante la modifica delle preferenze relative alla raccolta dati
dc-learn-more = Ulteriori informazioni


drop-down-menu-title-2 = Menu { -product-mozilla-account }
drop-down-menu-signed-in-as-v2 = Accesso effettuato come
drop-down-menu-sign-out = Disconnetti
drop-down-menu-sign-out-error-2 = Si è verificato un problema durante la disconnessione


flow-container-back = Indietro


flow-recovery-key-confirm-pwd-heading-v2 = Reinserire la password per motivi di sicurezza
flow-recovery-key-confirm-pwd-input-label = Inserire la password
flow-recovery-key-confirm-pwd-submit-button = Genera una chiave di recupero dell’account
flow-recovery-key-confirm-pwd-submit-button-change-key = Genera una nuova chiave di recupero dell’account


flow-recovery-key-download-heading-v2 = Chiave di recupero dell’account generata: scaricala e salvala subito
flow-recovery-key-download-info-v2 = Questa chiave consente di recuperare i propri dati se si dimentica la password. Scaricala adesso e conservala in un luogo facile da ricordare (non sarà possibile ritornare a questa pagina).
flow-recovery-key-download-next-link-v2 = Continua senza scaricare


flow-recovery-key-success-alert = La chiave di recupero dell’account è stata generata


flow-recovery-key-info-header = Genera una chiave di recupero dell’account nel caso in cui dimentichi la password
flow-recovery-key-info-header-change-key = Modifica la chiave di recupero dell’account
flow-recovery-key-info-shield-bullet-point-v2 = Crittiamo i dati di navigazione: password, segnalibri e altro ancora. È ottimo per la privacy, ma potresti perdere i tuoi dati se dimentichi la password.
flow-recovery-key-info-key-bullet-point-v2 = Ecco perché è così importante generare una chiave di recupero dell’account: puoi usarla per ripristinare i tuoi dati.
flow-recovery-key-info-cta-text-v3 = Inizia
flow-recovery-key-info-cancel-link = Annulla


flow-setup-2fa-qr-heading = Connettiti all’app di autenticazione
flow-setup-2a-qr-instruction = <strong>Passaggio 1:</strong> scansiona questo codice QR utilizzando un’app di autenticazione, come Duo o Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = Codice QR per impostare l’autenticazione in due passaggi. Scansionalo o scegli “Non riesci a scansionare il codice QR?” per ottenere una chiave segreta di configurazione.
flow-setup-2fa-cant-scan-qr-button = Non riesci a scansionare il codice QR?
flow-setup-2fa-manual-key-heading = Inserisci il codice manualmente
flow-setup-2fa-manual-key-instruction = <strong>Passaggio 1:</strong> inserisci questo codice nell’app di autenticazione che preferisci.
flow-setup-2fa-scan-qr-instead-button = Vuoi scansionare il codice QR?
flow-setup-2fa-more-info-link = Ulteriori informazioni sulle app di autenticazione
flow-setup-2fa-button = Continua
flow-setup-2fa-step-2-instruction = <strong>Passaggio 2:</strong> inserisci il codice dall’app di autenticazione.
flow-setup-2fa-input-label = Inserisci il codice a 6 cifre
flow-setup-2fa-code-error = Codice non valido o scaduto. Controlla l’app di autenticazione e riprova.


flow-setup-2fa-backup-choice-heading = Scegli un metodo di recupero
flow-setup-2fa-backup-choice-description = Questo ti consente di completare l’accesso se non riesci ad accedere al tuo dispositivo mobile o all’app di autenticazione.
flow-setup-2fa-backup-choice-phone-title = Telefono per il recupero dell’account
flow-setup-2fa-backup-choice-phone-badge = Più semplice
flow-setup-2fa-backup-choice-phone-info = Ricevi un codice di recupero via SMS. Attualmente disponibile negli Stati Uniti e in Canada.
flow-setup-2fa-backup-choice-code-title = Codici di autenticazione di backup
flow-setup-2fa-backup-choice-code-badge = Più sicuro
flow-setup-2fa-backup-choice-code-info = Crea e salva codici di autenticazione monouso.
flow-setup-2fa-backup-choice-learn-more-link = Ulteriori informazioni sul recupero e i rischi legati al SIM swap


flow-setup-2fa-backup-code-confirm-heading = Digita il codice di autenticazione di backup
flow-setup-2fa-backup-code-confirm-confirm-saved = Conferma di aver salvato i codici inserendone uno. Senza questi codici potresti non essere in grado di accedere se non hai accesso all’app di autenticazione.
flow-setup-2fa-backup-code-confirm-code-input = Inserire il codice di 10 caratteri
flow-setup-2fa-backup-code-confirm-button-finish = Fine


flow-setup-2fa-backup-code-dl-heading = Salva i codici di autenticazione di backup
flow-setup-2fa-backup-code-dl-save-these-codes = Conservali in un posto facile da ricordare. Se non hai accesso alla tua app di autenticazione, dovrai inserirne uno per accedere.
flow-setup-2fa-backup-code-dl-button-continue = Continua


flow-setup-2fa-inline-complete-success-banner = Autenticazione in due passaggi attivata
flow-setup-2fa-inline-complete-success-banner-description = Per proteggere tutti i tuoi dispositivi connessi, devi disconnetterti da tutti i dispositivi in cui stai utilizzando questo account, quindi accedere nuovamente utilizzando la nuova autenticazione in due passaggi.
flow-setup-2fa-inline-complete-backup-code = Codici di autenticazione di backup
flow-setup-2fa-inline-complete-backup-phone = Telefono per il recupero dell’account
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } codice rimanente
       *[other] { $count } codici rimanenti
    }
flow-setup-2fa-inline-complete-backup-code-description = Questo è il metodo di recupero più sicuro se non riesci ad accedere con il tuo dispositivo mobile o l’app di autenticazione.
flow-setup-2fa-inline-complete-backup-phone-description = Questo è il metodo di recupero più semplice se non riesci ad accedere con l’app di autenticazione.
flow-setup-2fa-inline-complete-learn-more-link = Come aiuta a proteggere il tuo account
flow-setup-2fa-inline-complete-continue-button = Continua su { $serviceName }
flow-setup-2fa-prompt-heading = Configura l’autenticazione in due passaggi
flow-setup-2fa-prompt-description = { $serviceName } richiede la configurazione dell’autenticazione in due passaggi per mantenere il tuo account al sicuro.
flow-setup-2fa-prompt-use-authenticator-apps = Per procedere puoi utilizzare una di <authenticationAppsLink>queste app di autenticazione</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Continua


flow-setup-phone-confirm-code-heading = Inserisci il codice di verifica
flow-setup-phone-confirm-code-instruction = È stato inviato un codice di sei cifre a <span>{ $phoneNumber }</span> tramite SMS. Questo codice scade dopo 5 minuti.
flow-setup-phone-confirm-code-input-label = Inserisci il codice a 6 cifre
flow-setup-phone-confirm-code-button = Conferma
flow-setup-phone-confirm-code-expired = Codice scaduto?
flow-setup-phone-confirm-code-resend-code-button = Invia di nuovo il codice
flow-setup-phone-confirm-code-resend-code-success = Codice inviato
flow-setup-phone-confirm-code-success-message-v2 = Aggiunto telefono per il recupero dell’account
flow-change-phone-confirm-code-success-message = Modificato telefono per il recupero dell’account


flow-setup-phone-submit-number-heading = Verifica il tuo numero di telefono
flow-setup-phone-verify-number-instruction = Riceverai un SMS da { -brand-mozilla } con un codice per verificare il tuo numero. Non condividere questo codice con nessuno.
flow-setup-phone-submit-number-info-message-v2 = Il telefono per il recupero dell’account è disponibile solo negli Stati Uniti e in Canada. I numeri VoIP e gli alias telefonici non sono consigliati.
flow-setup-phone-submit-number-legal = Fornendo il tuo numero, accetti che venga salvato in modo che possiamo inviarti un messaggio solo per la verifica dell’account. Potrebbero essere applicate tariffe per messaggi e traffico dati.
flow-setup-phone-submit-number-button = Invia codice


header-menu-open = Chiudi menu
header-menu-closed = Menu di navigazione del sito
header-back-to-top-link =
    .title = Torna su
header-back-to-settings-link =
    .title = Torna alle impostazioni di { -product-mozilla-account }
header-title-2 = { -product-mozilla-account(capitalization: "uppercase") }
header-help = Aiuto


la-heading = Account collegati
la-description = Hai autorizzato l’accesso ai seguenti account.
la-unlink-button = Scollega
la-unlink-account-button = Scollega
la-set-password-button = Imposta password
la-unlink-heading = Scollega da account di terze parti
la-unlink-content-3 = Sei sicuro di voler scollegare il tuo account? Scollegando il tuo account non verrai disconnesso automaticamente dai servizi attualmente connessi. Per farlo dovrai disconnetterti manualmente dalla sezione Servizi connessi.
la-unlink-content-4 = Prima di scollegare il tuo account, devi impostare una password. Senza una password, non è più possibile accedere dopo aver scollegato il proprio account.
nav-linked-accounts = { la-heading }


modal-close-title = Chiudi
modal-cancel-button = Annulla
modal-default-confirm-button = Conferma


modal-mfa-protected-title = Inserisci il codice di conferma
modal-mfa-protected-subtitle = Aiutaci a verificare che sia davvero tu a modificare le informazioni del tuo account
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Inserisci il codice che è stato inviato a <email>{ $email }</email> entro { $expirationTime } minuto.
       *[other] Inserisci il codice che è stato inviato a <email>{ $email }</email> entro { $expirationTime } minuti.
    }
modal-mfa-protected-input-label = Inserisci il codice a 6 cifre
modal-mfa-protected-cancel-button = Annulla
modal-mfa-protected-confirm-button = Conferma
modal-mfa-protected-code-expired = Codice scaduto?
modal-mfa-protected-resend-code-link = Invia email con nuovo codice.


mvs-verify-your-email-2 = Conferma il tuo indirizzo email
mvs-enter-verification-code-2 = Inserisci il codice di conferma
mvs-enter-verification-code-desc-2 = Inserisci entro 5 minuti il codice di conferma che è stato inviato a <email>{ $email }</email>.
msv-cancel-button = Annulla
msv-submit-button-2 = Conferma


nav-settings = Impostazioni
nav-profile = Profilo
nav-security = Sicurezza
nav-connected-services = Servizi connessi
nav-data-collection = Raccolta e utilizzo dati
nav-paid-subs = Abbonamenti a pagamento
nav-email-comm = Comunicazioni via email


page-2fa-change-title = Modifica l’autenticazione in due passaggi
page-2fa-change-success = L’autenticazione in due passaggi è stata aggiornata
page-2fa-change-success-additional-message = Per proteggere tutti i tuoi dispositivi connessi, devi disconnetterti da tutti i dispositivi in cui stai utilizzando questo account, quindi accedere nuovamente utilizzando la nuova autenticazione in due passaggi.
page-2fa-change-totpinfo-error = Si è verificato un errore durante la sostituzione dell’app per l’autenticazione in due passaggi. Riprova più tardi.
page-2fa-change-qr-instruction = <strong>Passaggio 1:</strong> scansiona questo codice QR utilizzando un’app di autenticazione, come Duo o Google Authenticator. Questa operazione crea una nuova connessione; tutte le connessioni esistenti smetteranno di funzionare.


tfa-backup-codes-page-title = Codici di autenticazione di backup
tfa-replace-code-error-3 = Si è verificato un problema durante la sostituzione dei codici di autenticazione di backup
tfa-create-code-error = Si è verificato un problema durante la generazione dei codici di autenticazione di backup
tfa-replace-code-success-alert-4 = Codici di autenticazione di backup aggiornati
tfa-create-code-success-alert = Codici di autenticazione di backup generati
tfa-replace-code-download-description = Conservali in un posto facile da ricordare. I codici precedenti verranno sostituiti al termine del passaggio successivo.
tfa-replace-code-confirm-description = Conferma di aver salvato i codici inserendone uno. I precedenti codici di autenticazione di backup verranno disattivati al termine di questo passaggio.
tfa-incorrect-recovery-code-1 = Codice di autenticazione di backup errato


page-2fa-setup-title = Autenticazione in due passaggi
page-2fa-setup-totpinfo-error = Si è verificato un errore durante la configurazione dell’autenticazione in due passaggi. Riprova più tardi.
page-2fa-setup-incorrect-backup-code-error = Il codice non è corretto. Riprova.
page-2fa-setup-success = L’autenticazione in due passaggi è stata attivata
page-2fa-setup-success-additional-message = Per proteggere tutti i tuoi dispositivi connessi, devi disconnetterti da tutti i dispositivi in cui stai utilizzando questo account, quindi accedere nuovamente utilizzando l’autenticazione in due passaggi.


avatar-page-title =
    .title = Immagine del profilo
avatar-page-add-photo = Aggiungi un’immagine
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Scatta una foto
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Elimina immagine
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Scatta una nuova foto
avatar-page-cancel-button = Annulla
avatar-page-save-button = Salva
avatar-page-saving-button = Salvataggio in corso…
avatar-page-zoom-out-button =
    .title = Riduci zoom
avatar-page-zoom-in-button =
    .title = Aumenta zoom
avatar-page-rotate-button =
    .title = Ruota
avatar-page-camera-error = Impossibile inizializzare la fotocamera
avatar-page-new-avatar =
    .alt = nuova immagine del profilo
avatar-page-file-upload-error-3 = Si è verificato un problema durante il caricamento dell’immagine del profilo
avatar-page-delete-error-3 = Si è verificato un problema durante l’eliminazione dell’immagine del profilo
avatar-page-image-too-large-error-2 = Il file dell’immagine è troppo grande e non può essere caricato


pw-change-header =
    .title = Modifica password
pw-8-chars = Almeno 8 caratteri
pw-not-email = Non uguale al tuo indirizzo email
pw-change-must-match = La nuova password corrisponde alla conferma
pw-commonly-used = Non una password di uso comune
pw-tips = Rimani al sicuro: non riutilizzare la stessa password in servizi diversi. Scopri altri suggerimenti per <linkExternal>generare password complesse</linkExternal>.
pw-change-cancel-button = Annulla
pw-change-save-button = Salva
pw-change-forgot-password-link = Password dimenticata?
pw-change-current-password =
    .label = Inserire la password attuale
pw-change-new-password =
    .label = Inserire una nuova password
pw-change-confirm-password =
    .label = Conferma la nuova password
pw-change-success-alert-2 = Password aggiornata


pw-create-header =
    .title = Creazione password
pw-create-success-alert-2 = Password impostata
pw-create-error-2 = Spiacenti, si è verificato un problema durante l’impostazione della password


delete-account-header =
    .title = Elimina account
delete-account-step-1-2 = Passaggio 1 di 2
delete-account-step-2-2 = Passaggio 2 di 2
delete-account-confirm-title-4 = Potresti aver connesso il tuo { -product-mozilla-account } a uno o più dei seguenti prodotti o servizi { -brand-mozilla } che ti garantiscono un’esperienza sul Web sicura e produttiva:
delete-account-product-mozilla-account = { -product-mozilla-account(capitalization: "uppercase") }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Sincronizzazione dati in { -brand-firefox }
delete-account-product-firefox-addons = Componenti aggiuntivi in { -brand-firefox }
delete-account-acknowledge = Cancellando il tuo account riconosci che:
delete-account-chk-box-1-v4 =
    .label = Eventuali abbonamenti a pagamento saranno annullati
delete-account-chk-box-2 =
    .label = Potresti perdere alcuni dati e funzionalità che fanno parte dei prodotti { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Anche riattivando l’account con l’indirizzo email corrente, potrebbe non essere possibile ripristinare i dati salvati
delete-account-chk-box-4 =
    .label = Tutte le estensioni e i temi da te pubblicati su addons.mozilla.org verranno eliminati
delete-account-continue-button = Continua
delete-account-password-input =
    .label = Inserire la password
delete-account-cancel-button = Annulla
delete-account-delete-button-2 = Elimina


display-name-page-title =
    .title = Nome visualizzato
display-name-input =
    .label = Inserire il nome visualizzato
submit-display-name = Salva
cancel-display-name = Annulla
display-name-update-error-2 = Si è verificato un problema durante l’aggiornamento del nome visualizzato
display-name-success-alert-2 = Il nome visualizzato è stato aggiornato


recent-activity-title = Attività recente dell”account
recent-activity-account-create-v2 = Account creato
recent-activity-account-disable-v2 = Account disattivato
recent-activity-account-enable-v2 = Account attivato
recent-activity-account-login-v2 = Accesso all’account iniziato
recent-activity-account-reset-v2 = Reimpostazione password iniziata
recent-activity-emails-clearBounces-v2 = Notifiche per mancato recapito delle email cancellate
recent-activity-account-login-failure = Tentativo di accesso all’account non riuscito
recent-activity-account-two-factor-added = Autenticazione in due passaggi attivata
recent-activity-account-two-factor-requested = Autenticazione in due passaggi richiesta
recent-activity-account-two-factor-failure = Autenticazione in due passaggi non riuscita
recent-activity-account-two-factor-success = Autenticazione in due passaggi completata correttamente
recent-activity-account-two-factor-removed = Autenticazione in due passaggi disattivata
recent-activity-account-password-reset-requested = Richiesta la reimpostazione della password per l’account
recent-activity-account-password-reset-success = Reimpostazione password dell’account completata correttamente
recent-activity-account-recovery-key-added = Chiave di recupero dell’account attivata
recent-activity-account-recovery-key-verification-failure = Verifica della chiave di recupero dell’account non riuscita
recent-activity-account-recovery-key-verification-success = Verifica della chiave di recupero dell’account completata correttamente
recent-activity-account-recovery-key-removed = Eliminata chiave di recupero dell’account
recent-activity-account-password-added = Nuova password aggiunta
recent-activity-account-password-changed = Password modificata
recent-activity-account-secondary-email-added = Indirizzo email secondario aggiunto
recent-activity-account-secondary-email-removed = Indirizzo email secondario rimosso
recent-activity-account-emails-swapped = Indirizzo email principale e secondario scambiati
recent-activity-session-destroy = Disconnesso dalla sessione
recent-activity-account-recovery-phone-send-code = Il codice è stato inviato al telefono per il recupero dell’account
recent-activity-account-recovery-phone-setup-complete = Configurazione del telefono per il recupero dell’account completata
recent-activity-account-recovery-phone-signin-complete = Completato accesso con telefono per il recupero dell’account
recent-activity-account-recovery-phone-signin-failed = Accesso con telefono per il recupero dell’account non riuscito
recent-activity-account-recovery-phone-removed = Il telefono per il recupero dell’account è stato rimosso
recent-activity-account-recovery-codes-replaced = Sostituiti codici di recupero
recent-activity-account-recovery-codes-created = Creati codici di recupero
recent-activity-account-recovery-codes-signin-complete = L’accesso è stato completato con i codici di recupero
recent-activity-password-reset-otp-sent = Inviato codice di conferma per reimpostare la password
recent-activity-password-reset-otp-verified = Verificato codice di conferma per reimpostare la password
recent-activity-must-reset-password = È richiesta la reimpostazione della password
recent-activity-unknown = Altre attività dell’account


recovery-key-create-page-title = Chiave di recupero dell’account
recovery-key-create-back-button-title = Torna alle impostazioni


recovery-phone-remove-header = Rimuovi telefono per il recupero dell’account
settings-recovery-phone-remove-info = Questo rimuoverà <strong>{ $formattedFullPhoneNumber }</strong> come telefono per il recupero dell’account.
settings-recovery-phone-remove-recommend = Ti consigliamo di mantenere questo metodo perché è più semplice rispetto al salvataggio dei codici di autenticazione di backup.
settings-recovery-phone-remove-recovery-methods = Se lo elimini, assicurati di avere ancora i codici di autenticazione di backup salvati. <linkExternal>Confronta i metodi di recupero</linkExternal>
settings-recovery-phone-remove-button = Rimuovi numero di telefono
settings-recovery-phone-remove-cancel = Annulla
settings-recovery-phone-remove-success = Il telefono per il recupero dell’account è stato rimosso


page-setup-recovery-phone-heading = Aggiungi telefono per il recupero dell’account
page-change-recovery-phone = Cambio il telefono per il recupero dell’account
page-setup-recovery-phone-back-button-title = Torna alle impostazioni
page-setup-recovery-phone-step2-back-button-title = Cambia numero di telefono


add-secondary-email-step-1 = Passaggio 1 di 2
add-secondary-email-error-2 = Si è verificato un problema durante la creazione di questa email
add-secondary-email-page-title =
    .title = Email secondaria
add-secondary-email-enter-address =
    .label = Inserisci il tuo indirizzo email
add-secondary-email-cancel-button = Annulla
add-secondary-email-save-button = Salva
add-secondary-email-mask = Non è possibile utilizzare alias di posta elettronica come indirizzo email secondario.


add-secondary-email-step-2 = Passaggio 2 di 2
verify-secondary-email-page-title =
    .title = Email secondaria
verify-secondary-email-verification-code-2 =
    .label = Inserisci il codice di conferma
verify-secondary-email-cancel-button = Annulla
verify-secondary-email-verify-button-2 = Conferma
verify-secondary-email-please-enter-code-2 = Inserisci entro 5 minuti il codice di conferma che è stato inviato a <strong>{ $email }</strong>.
verify-secondary-email-success-alert-2 = Indirizzo { $email } aggiunto correttamente
verify-secondary-email-resend-code-button = Invia nuovamente il codice di conferma


delete-account-link = Elimina account
inactive-update-status-success-alert = Accesso effettuato correttamente. Il tuo { -product-mozilla-account } e i tuoi dati rimarranno attivi.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Scopri dove sono esposte le tue informazioni personali e riprendine il controllo
product-promo-monitor-cta = Ottieni una scansione gratuita


profile-heading = Profilo
profile-picture =
    .header = Immagine
profile-display-name =
    .header = Nome visualizzato
profile-primary-email =
    .header = Email principale


progress-bar-aria-label-v2 = Passaggio { $currentStep } di { $numberOfSteps }.


security-heading = Sicurezza
security-password =
    .header = Password
security-password-created-date = Data di creazione: { $date }
security-not-set = Non impostata
security-action-create = Crea
security-set-password = Imposta una password per sincronizzare e utilizzare specifiche funzioni di sicurezza dell’account.
security-recent-activity-link = Visualizza l’attività recente dell’account
signout-sync-header = Sessione scaduta
signout-sync-session-expired = Si è verificato un errore. Disconnettiti dal menu del browser e riprova.


tfa-row-backup-codes-title = Codici di autenticazione di backup
tfa-row-backup-codes-not-available = Nessun codice disponibile
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } codice rimanente
       *[other] { $numCodesAvailable } codici rimanenti
    }
tfa-row-backup-codes-get-new-cta-v2 = Crea nuovi codici
tfa-row-backup-codes-add-cta = Aggiungi
tfa-row-backup-codes-description-2 = Questo è il metodo di recupero più sicuro se non puoi utilizzare il tuo dispositivo mobile o l’app di autenticazione.
tfa-row-backup-phone-title-v2 = Telefono per il recupero dell’account
tfa-row-backup-phone-not-available-v2 = Nessun numero di telefono configurato
tfa-row-backup-phone-change-cta = Modifica
tfa-row-backup-phone-add-cta = Aggiungi
tfa-row-backup-phone-delete-button = Rimuovi
tfa-row-backup-phone-delete-title-v2 = Rimuovi telefono per il recupero dell’account
tfa-row-backup-phone-delete-restriction-v2 = Se desideri rimuovere il telefono per il recupero dell’account, aggiungi i codici di autenticazione di backup o disattiva l’autenticazione in due passaggi per evitare di rimanere bloccato fuori dal tuo account.
tfa-row-backup-phone-description-v2 = Questo è il metodo di recupero più semplice se non puoi utilizzare l’app di autenticazione.
tfa-row-backup-phone-sim-swap-risk-link = Ulteriori informazioni sul rischio legato allo scambio di SIM (SIM swap)


switch-turn-off = Disattiva
switch-turn-on = Attiva
switch-submitting = Invio in corso…
switch-is-on = attivo
switch-is-off = disattivato


row-defaults-action-add = Aggiungi
row-defaults-action-change = Modifica
row-defaults-action-disable = Disattiva
row-defaults-status = Nessuno


rk-header-1 = Chiave di recupero dell’account
rk-enabled = Attiva
rk-not-set = Non impostato
rk-action-create = Crea
rk-action-change-button = Modifica
rk-action-remove = Rimuovi
rk-key-removed-2 = Eliminata chiave di recupero account
rk-cannot-remove-key = Non è possibile rimuovere la chiave di recupero dell’account.
rk-refresh-key-1 = Aggiorna la chiave di recupero dell’account
rk-content-explain = Ripristina i dati in caso di password dimenticata.
rk-cannot-verify-session-4 = Si è verificato un problema durante la conferma della sessione
rk-remove-modal-heading-1 = Rimuovere la chiave di recupero dell’account?
rk-remove-modal-content-1 = Se decidi di reimpostare la password, non potrai utilizzare la chiave di recupero dell’account per accedere ai tuoi dati. Questa azione è irreversibile.
rk-remove-error-2 = Non è possibile rimuovere la chiave di recupero dell’account.
unit-row-recovery-key-delete-icon-button-title = Elimina la chiave di recupero dell’account


se-heading = Email secondaria
    .header = Email secondaria
se-cannot-refresh-email = Si è verificato un problema durante l’aggiornamento dell’email.
se-cannot-resend-code-3 = Si è verificato un problema durante il nuovo invio del codice di conferma
se-set-primary-successful-2 = { $email } è ora la tua email principale
se-set-primary-error-2 = Si è verificato un problema durante la modifica dell’email principale
se-delete-email-successful-2 = { $email } eliminata correttamente
se-delete-email-error-2 = Si è verificato un problema durante l’eliminazione dell’email
se-verify-session-3 = È necessario confermare la sessione in corso per effettuare questa operazione
se-verify-session-error-3 = Si è verificato un problema durante la conferma della sessione
se-remove-email =
    .title = Rimuovi l’email
se-refresh-email =
    .title = Aggiorna l’email
se-unverified-2 = non confermato
se-resend-code-2 = Da confermare. <button>Invia di nuovo il codice di conferma</button> se non lo trovi nella casella di posta in arrivo o nello spam.
se-make-primary = Rendi principale
se-default-content = Usala per accedere all’account se non riesci a effettuare l’accesso con l’email principale.
se-content-note-1 = Attenzione: non è possibile ripristinare i dati attraverso l’email secondaria. Per questa operazione è necessaria una <a>chiave di recupero dell’account</a>.
se-secondary-email-none = Nessuna


tfa-row-header = Autenticazione in due passaggi
tfa-row-enabled = Attiva
tfa-row-disabled-status = Disattivata
tfa-row-action-add = Aggiungi
tfa-row-action-disable = Disattiva
tfa-row-action-change = Modifica
tfa-row-button-refresh =
    .title = Ripristina l’autenticazione in due passaggi
tfa-row-cannot-refresh = Si è verificato un problema durante l’aggiornamento dell’autenticazione in due passaggi.
tfa-row-enabled-description = Il tuo account è protetto dall’autenticazione in due passaggi. Quando accedi al tuo { -product-mozilla-account } dovrai inserire un codice monouso dall’app di autenticazione.
tfa-row-enabled-info-link = Come aiuta a proteggere il tuo account
tfa-row-disabled-description-v2 = Proteggi il tuo account utilizzando un’app di autenticazione di terze parti come secondo passaggio per accedere.
tfa-row-cannot-verify-session-4 = Si è verificato un problema durante la conferma della sessione
tfa-row-disable-modal-heading = Disattivare l’autenticazione in due passaggi?
tfa-row-disable-modal-confirm = Disattiva
tfa-row-disable-modal-explain-1 =
    Questa azione è irreversibile.
    In alternativa, puoi <linkExternal>sostituire i codici di autenticazione di backup</linkExternal>.
tfa-row-disabled-2 = Autenticazione in due passaggi disattivata
tfa-row-cannot-disable-2 = Impossibile disattivare l’autenticazione in due passaggi.
tfa-row-verify-session-info = È necessario confermare la sessione corrente per impostare l’autenticazione in due passaggi


terms-privacy-agreement-intro-3 = Proseguendo, accetti:
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>condizioni di utilizzo del servizio</termsLink> e <privacyLink>informativa sulla privacy</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") }: <mozillaAccountsTos>condizioni di utilizzo del servizio</mozillaAccountsTos> e <mozillaAccountsPrivacy>informativa sulla privacy</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = Proseguendo accetti le <mozillaAccountsTos>condizioni di utilizzo del servizio</mozillaAccountsTos> e l’<mozillaAccountsPrivacy>informativa sulla privacy</mozillaAccountsPrivacy>.


third-party-auth-options-or = Oppure
third-party-auth-options-sign-in-with = Accedi con
continue-with-google-button = Continua con { -brand-google }
continue-with-apple-button = Continua con { -brand-apple }


auth-error-102 = Account sconosciuto
auth-error-103 = Password errata
auth-error-105-2 = Codice di conferma non valido
auth-error-110 = Token non valido
auth-error-114-generic = Hai effettuato troppi tentativi. Riprova più tardi.
auth-error-114 = Hai effettuato troppi tentativi errati. Riprova { $retryAfter }.
auth-error-125 = La richiesta è stata bloccata per motivi di sicurezza
auth-error-129-2 = Hai inserito un numero di telefono non valido. Controlla e riprova.
auth-error-138-2 = Sessione non confermata
auth-error-139 = L’email secondaria deve essere diversa dall’email principale associata all’account
auth-error-144 = Questo indirizzo email è già utilizzato da un altro account. Riprova più tardi o utilizza un altro indirizzo email.
auth-error-155 = Token TOTP non trovato
auth-error-156 = Codice di autenticazione di backup non trovato
auth-error-159 = Chiave di recupero dell’account non valida
auth-error-183-2 = Codice di conferma non valido o scaduto
auth-error-202 = Caratteristica non attiva
auth-error-203 = Il sistema non è disponibile, riprova tra qualche secondo
auth-error-206 = Impossibile creare la password, la password è già stata impostata
auth-error-214 = Il telefono per il recupero dell’account è già presente
auth-error-215 = Il telefono per il recupero dell’account non esiste
auth-error-216 = È stato raggiunto il limite di messaggi di testo
auth-error-218 = Impossibile rimuovere il telefono per il recupero dell’account, codici di autenticazione di backup non presenti.
auth-error-219 = Questo numero di telefono è stato registrato con troppi account. Prova con un numero diverso.
auth-error-999 = Errore imprevisto
auth-error-1001 = Tentativo di accesso annullato
auth-error-1002 = La sessione è scaduta. Accedi per continuare.
auth-error-1003 = L’archiviazione locale o i cookie sono ancora disattivati
auth-error-1008 = La nuova password deve essere diversa
auth-error-1010 = È necessario inserire una password valida
auth-error-1011 = È necessario inserire un indirizzo email valido
auth-error-1018 = L’email di conferma è stata respinta. Verifica di aver digitato correttamente l’indirizzo email.
auth-error-1020 = Hai inserito l’email sbagliata? firefox.com non è un servizio di posta elettronica valido
auth-error-1031 = Per completare la registrazione devi inserire la tua età
auth-error-1032 = Per completare la registrazione inserire un’età valida
auth-error-1054 = Codice di autenticazione in due passaggi non valido
auth-error-1056 = Codice di autenticazione di backup non valido
auth-error-1062 = Reindirizzamento non valido
auth-error-1064 = Hai inserito l’email sbagliata? { $domain } non è un servizio di posta elettronica valido
auth-error-1066 = Non è possibile utilizzare alias di posta elettronica per creare un account.
auth-error-1067 = C’è un errore di battitura nell’indirizzo email?
recovery-phone-number-ending-digits = Numero che termina con { $lastFourPhoneNumber }
oauth-error-1000 = Qualcosa è andato storto. Chiudi questa scheda e riprova.


connect-another-device-signed-in-header = Hai eseguito l’accesso a { -brand-firefox }
connect-another-device-email-confirmed-banner = Indirizzo email confermato
connect-another-device-signin-confirmed-banner = Accesso confermato
connect-another-device-signin-to-complete-message = Accedi a questo { -brand-firefox } per completare la configurazione
connect-another-device-signin-link = Accedi
connect-another-device-still-adding-devices-message = Vuoi aggiungere altri dispositivi? Per completare la configurazione accedi a { -brand-firefox } su un altro dispositivo
connect-another-device-signin-another-device-to-complete-message = Accedi a { -brand-firefox } su un altro dispositivo per completare la configurazione
connect-another-device-get-data-on-another-device-message = Vuoi avere a disposizione schede, segnalibri e password su un altro dispositivo?
connect-another-device-cad-link = Connetti un altro dispositivo
connect-another-device-not-now-link = Non adesso
connect-another-device-android-complete-setup-message = Per completare la configurazione accedi a { -brand-firefox } per Android
connect-another-device-ios-complete-setup-message = Per completare la configurazione accedi a { -brand-firefox } per iOS


cookies-disabled-header = È necessario attivare archiviazione locale e cookie
cookies-disabled-enable-prompt-2 = Attiva i cookie e l’archiviazione locale nel browser per accedere all’{ -product-mozilla-account }. In questo modo verranno attivate funzioni come la memorizzazione dell’utente tra una sessione e l’altra.
cookies-disabled-button-try-again = Riprova
cookies-disabled-learn-more = Ulteriori informazioni


index-header = Inserisci la tua email
index-sync-header = Passa al tuo { -product-mozilla-account }
index-sync-subheader = Sincronizza password, schede e segnalibri ovunque utilizzi { -brand-firefox }.
index-relay-header = Crea un alias di posta elettronica
index-relay-subheader = Fornisci l’indirizzo email a cui desideri inoltrare le email dal tuo alias di posta elettronica.
index-subheader-with-servicename = Continua su { $serviceName }
index-subheader-default = Passa alle impostazioni dell’account
index-cta = Registrati o accedi
index-account-info = Un { -product-mozilla-account } consente inoltre di accedere ad altri prodotti { -brand-mozilla } per la protezione della privacy.
index-email-input =
    .label = Inserisci la tua email
index-account-delete-success = L’account è stato correttamente eliminato
index-email-bounced = L’email di conferma è stata respinta. Verifica di aver digitato correttamente l’indirizzo email.


inline-recovery-key-setup-create-error = Oops! Impossibile creare la chiave di recupero dell’account. Riprova più tardi.
inline-recovery-key-setup-recovery-created = La chiave di recupero dell’account è stata generata
inline-recovery-key-setup-download-header = Proteggi il tuo account
inline-recovery-key-setup-download-subheader = Scaricala e salvala adesso
inline-recovery-key-setup-download-info = Conserva questa chiave in un posto facile da ricordare: non potrai tornare a questa pagina più tardi.
inline-recovery-key-setup-hint-header = Raccomandazione di sicurezza


inline-totp-setup-cancel-setup-button = Annulla configurazione
inline-totp-setup-continue-button = Continua
inline-totp-setup-add-security-link = Aggiungi un livello di sicurezza al tuo account richiedendo i codici di autenticazione da una di <authenticationAppsLink>queste app di autenticazione</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Attiva l’autenticazione in due passaggi <span>per continuare con le impostazioni dell’account</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Attiva l’autenticazione in due passaggi <span>per continuare su { $serviceName }</span>
inline-totp-setup-ready-button = Pronto
inline-totp-setup-show-qr-custom-service-header-2 = Scansiona il codice di autenticazione <span>per continuare su { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Inserisci il codice manualmente <span>per continuare su { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Scansiona il codice di autenticazione <span>per continuare con le impostazioni dell’account</span>
inline-totp-setup-no-qr-default-service-header-2 = Inserisci il codice manualmente <span>per continuare con le impostazioni dell’account</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Digita questa chiave segreta nell’app di autenticazione. <toggleToQRButton>Oppure preferisci fare la scansione del codice QR?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Scansiona il codice QR nell’app di autenticazione e inserisci il codice fornito. <toggleToManualModeButton>Non è possibile eseguire la scansione del codice?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Una volta completato, inizierà a generare codici di autenticazione da inserire.
inline-totp-setup-security-code-placeholder = Codice di autenticazione
inline-totp-setup-code-required-error = Codice di autenticazione richiesto
tfa-qr-code-alt = Utilizza il codice { $code } per impostare l’autenticazione in due passaggi nelle applicazioni supportate.
inline-totp-setup-page-title = Autenticazione in due passaggi


legal-header = Note legali
legal-terms-of-service-link = Condizioni di utilizzo del servizio
legal-privacy-link = Informativa sulla privacy


legal-privacy-heading = Informativa sulla privacy


legal-terms-heading = Condizioni di utilizzo del servizio


pair-auth-allow-heading-text = Hai appena effettuato l’accesso a { -product-firefox }?
pair-auth-allow-confirm-button = Sì, approva il dispositivo
pair-auth-allow-refuse-device-link = Se questa operazione non è stata eseguita da te, <link>cambia la password</link>


pair-auth-complete-heading = Dispositivo connesso
pair-auth-complete-now-syncing-device-text = Ora stai sincronizzando con: { $deviceFamily } su { $deviceOS }
pair-auth-complete-sync-benefits-text = Ora puoi accedere alle schede aperte, alle password e ai segnalibri su tutti i tuoi dispositivi.
pair-auth-complete-see-tabs-button = Visualizza schede da altri dispositivi sincronizzati
pair-auth-complete-manage-devices-link = Gestisci dispositivi


auth-totp-heading-w-default-service = Inserisci il codice di autenticazione <span>per continuare con le impostazioni dell’account</span>
auth-totp-heading-w-custom-service = Inserisci il codice di autenticazione <span>per continuare su { $serviceName }</span>
auth-totp-instruction = Apri l’app di autenticazione e inserisci il codice di autenticazione ottenuto.
auth-totp-input-label = Inserisci il codice a 6 cifre
auth-totp-confirm-button = Conferma
auth-totp-code-required-error = Codice di autenticazione richiesto


pair-wait-for-supp-heading-text = È ora richiesta l’approvazione <span>dall’altro dispositivo</span>


pair-failure-header = Associazione non riuscita
pair-failure-message = Processo di installazione interrotto.


pair-sync-header = Sincronizza { -brand-firefox } sul tuo telefono o tablet
pair-cad-header = Connetti { -brand-firefox } su un altro dispositivo
pair-already-have-firefox-paragraph = Utilizzi già { -brand-firefox } su un telefono o tablet?
pair-sync-your-device-button = Sincronizza il tuo dispositivo
pair-or-download-subheader = Oppure scaricalo
pair-scan-to-download-message = Scansiona per scaricare { -brand-firefox } per dispositivi mobili oppure invia un <linkExternal>link per il download</linkExternal>.
pair-not-now-button = Non adesso
pair-take-your-data-message = Porta con te schede, segnalibri e password ovunque utilizzi { -brand-firefox }.
pair-get-started-button = Inizia
pair-qr-code-aria-label = Codice QR


pair-success-header-2 = Dispositivo connesso
pair-success-message-2 = Associazione completata.


pair-supp-allow-heading-text = Conferma associazione <span>per { $email }</span>
pair-supp-allow-confirm-button = Conferma associazione
pair-supp-allow-cancel-link = Annulla


pair-wait-for-auth-heading-text = È ora richiesta l’approvazione <span>dall’altro dispositivo</span>


pair-unsupported-header = Associa utilizzando un’app
pair-unsupported-message = Hai utilizzato la fotocamera di sistema? Bisogna effettuare l’associazione da un’app { -brand-firefox }.




set-password-heading-v2 = Crea una password per sincronizzare
set-password-info-v2 = Questa operazione critta i tuoi dati. Deve essere diversa dalla password del tuo account { -brand-google } o { -brand-apple }.


third-party-auth-callback-message = Attendere, si sta per essere reindirizzati all’applicazione autorizzata.


account-recovery-confirm-key-heading = Inserisci la chiave di recupero dell’account
account-recovery-confirm-key-instruction = Questa chiave ti permette di recuperare i dati di navigazione crittati, come password e segnalibri, dai server di { -brand-firefox }.
account-recovery-confirm-key-input-label =
    .label = Inserisci la chiave di recupero dell’account di 32 caratteri
account-recovery-confirm-key-hint = Il tuo suggerimento per l’archiviazione è:
account-recovery-confirm-key-button-2 = Continua
account-recovery-lost-recovery-key-link-2 = Non riesci a trovare la chiave di recupero dell’account?


complete-reset-pw-header-v2 = Crea una nuova password
complete-reset-password-success-alert = Password impostata
complete-reset-password-error-alert = Si è verificato un problema durante l’impostazione della password
complete-reset-pw-recovery-key-link = Utilizza la chiave di recupero dell’account
reset-password-complete-banner-heading = La password è stata reimpostata.
reset-password-complete-banner-message = Non dimenticare di generare una nuova chiave di recupero dell’account dalle impostazioni del tuo { -product-mozilla-account } per evitare problemi di accesso in futuro.
complete-reset-password-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.


confirm-backup-code-reset-password-input-label = Inserire il codice di 10 caratteri
confirm-backup-code-reset-password-confirm-button = Conferma
confirm-backup-code-reset-password-subheader = Digita il codice di autenticazione di backup
confirm-backup-code-reset-password-instruction = Inserisci uno dei codici monouso salvati durante la configurazione dell’autenticazione in due passaggi.
confirm-backup-code-reset-password-locked-out-link = Sei rimasto bloccato fuori dal tuo account?


confirm-reset-password-with-code-heading = Controlla la tua email
confirm-reset-password-with-code-instruction = Abbiamo inviato un codice di conferma a <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Inserire il codice di 8 cifre entro 10 minuti
confirm-reset-password-otp-submit-button = Continua
confirm-reset-password-otp-resend-code-button = Invia di nuovo il codice
confirm-reset-password-otp-different-account-link = Utilizza un altro account


confirm-totp-reset-password-header = Reimpostazione della password
confirm-totp-reset-password-subheader-v2 = Inserire il codice di autenticazione in due passaggi
confirm-totp-reset-password-instruction-v2 = Controlla l’<strong>app di autenticazione</strong> per reimpostare la password.
confirm-totp-reset-password-trouble-code = Problemi a inserire il codice?
confirm-totp-reset-password-confirm-button = Conferma
confirm-totp-reset-password-input-label-v2 = Inserire il codice a 6 cifre
confirm-totp-reset-password-use-different-account = Utilizza un altro account


password-reset-flow-heading = Reimpostazione della password
password-reset-body-2 = Per mantenere il tuo account al sicuro, ti chiederemo alcune informazioni che solo tu conosci.
password-reset-email-input =
    .label = Inserisci la tua email
password-reset-submit-button-2 = Continua


reset-password-complete-header = La password è stata reimpostata
reset-password-confirmed-cta = Continua su { $serviceName }




password-reset-recovery-method-header = Reimpostazione della password
password-reset-recovery-method-subheader = Scegli un metodo di recupero
password-reset-recovery-method-details = Verifichiamo che sia davvero tu a utilizzare i metodi di recupero.
password-reset-recovery-method-phone = Telefono per il recupero dell’account
password-reset-recovery-method-code = Codici di autenticazione di backup
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } codice rimanente
       *[other] { $numBackupCodes } codici rimanenti
    }
password-reset-recovery-method-send-code-error-heading = Si è verificato un problema durante l’invio del codice al telefono per il recupero dell’account
password-reset-recovery-method-send-code-error-description = Riprova più tardi o utilizza i codici di autenticazione di backup.


reset-password-recovery-phone-flow-heading = Reimpostazione della password
reset-password-recovery-phone-heading = Inserisci il codice di recupero
reset-password-recovery-phone-instruction-v3 = È stato inviato un codice di 6 cifre al numero di telefono che termina con <span>{ $lastFourPhoneDigits }</span> tramite SMS. Questo codice scade dopo 5 minuti. Non condividere questo codice con nessuno.
reset-password-recovery-phone-input-label = Inserisci il codice a 6 cifre
reset-password-recovery-phone-code-submit-button = Conferma
reset-password-recovery-phone-resend-code-button = Invia di nuovo il codice
reset-password-recovery-phone-resend-success = Codice inviato
reset-password-recovery-phone-locked-out-link = Sei rimasto bloccato fuori dal tuo account?
reset-password-recovery-phone-send-code-error-heading = Si è verificato un problema durante l’invio del codice
reset-password-recovery-phone-code-verification-error-heading = Si è verificato un problema durante la verifica del codice
reset-password-recovery-phone-general-error-description = Riprovare più tardi.
reset-password-recovery-phone-invalid-code-error-description = Il codice non è valido o è scaduto.
reset-password-recovery-phone-invalid-code-error-link = Utilizzare invece i codici di autenticazione di backup?
reset-password-with-recovery-key-verified-page-title = Password reimpostata correttamente
reset-password-complete-new-password-saved = Nuova password salvata.
reset-password-complete-recovery-key-created = È stata creata una nuova chiave di recupero dell’account. Scaricala e salvala subito.
reset-password-complete-recovery-key-download-info = Questa chiave è essenziale per il recupero dei dati se si dimentica la password. <b>Scaricala subito e salvala in modo sicuro, in quanto non potrai più accedere a questa pagina in seguito.</b>


error-label = Errore:
validating-signin = Convalida accesso…
complete-signin-error-header = Errore nella conferma
signin-link-expired-header = Il link di conferma è scaduto
signin-link-expired-message-2 = Il link su cui hai fatto clic è scaduto o è già stato utilizzato.


signin-password-needed-header-2 = Inserisci la password <span>per il tuo { -product-mozilla-account }</span>
signin-subheader-without-logo-with-servicename = Continua su { $serviceName }
signin-subheader-without-logo-default = Passa alle impostazioni dell’account
signin-button = Accedi
signin-header = Accedi
signin-use-a-different-account-link = Utilizza un altro account
signin-forgot-password-link = Password dimenticata?
signin-password-button-label = Password
signin-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.
signin-code-expired-error = Codice scaduto. Effettua nuovamente l’accesso.
signin-recovery-error = Si è verificato un errore. Effettua nuovamente l’accesso.
signin-account-locked-banner-heading = Reimpostazione della password
signin-account-locked-banner-description = Abbiamo bloccato il tuo account per proteggerlo da attività sospette.
signin-account-locked-banner-link = Reimposta la password per accedere


report-signin-link-damaged-body = Nel link su cui hai fatto clic mancano alcuni caratteri, probabilmente è un problema causato dal client di posta elettronica. Riprova assicurandoti di selezionare e copiare con cura il link.
report-signin-header = Vuoi segnalare questo accesso non autorizzato?
report-signin-body = Hai ricevuto un’email relativa a un tentativo di accesso al tuo account. Vuoi segnalare questa attività come sospetta?
report-signin-submit-button = Segnala attività sospetta
report-signin-support-link = Che cosa sta succedendo?
report-signin-error = Siamo spiacenti, si è verificato un problema durante l’invio della segnalazione.
signin-bounced-header = Spiacenti, l’account è stato bloccato.
signin-bounced-message = L’email di conferma che abbiamo inviato all’indirizzo { $email } è tornata indietro. L’account è stato bloccato per proteggere i dati in { -brand-firefox }.
signin-bounced-help = Se questo è un indirizzo email valido, <linkExternal>contattaci</linkExternal> e ti aiuteremo a sbloccare il tuo account.
signin-bounced-create-new-account = Non controlli più questo indirizzo email? Crea un nuovo account
back = Indietro


signin-push-code-heading-w-default-service = Verifica queste credenziali <span>per passare alle impostazioni dell’account</span>
signin-push-code-heading-w-custom-service = Verifica questo accesso <span>per continuare su { $serviceName }</span>
signin-push-code-instruction = Controlla gli altri dispositivi e approva questo accesso dal browser { -brand-firefox }.
signin-push-code-did-not-recieve = Non hai ricevuto la notifica?
signin-push-code-send-email-link = Invia codice per email


signin-push-code-confirm-instruction = Conferma il tuo accesso
signin-push-code-confirm-description = È stato rilevato un tentativo di accesso dal seguente dispositivo. Se sei stato tu, conferma l’accesso
signin-push-code-confirm-verifying = Verifica in corso
signin-push-code-confirm-login = Conferma l’accesso
signin-push-code-confirm-wasnt-me = Non sono stato io, cambia la password.
signin-push-code-confirm-login-approved = Il tuo accesso è stato approvato. Chiudi questa finestra.
signin-push-code-confirm-link-error = Il link è danneggiato. Riprova.


signin-recovery-method-header = Accedi
signin-recovery-method-subheader = Scegli un metodo di recupero
signin-recovery-method-details = Verifichiamo che sia davvero tu a utilizzare i metodi di recupero.
signin-recovery-method-phone = Telefono per il recupero dell’account
signin-recovery-method-code-v2 = Codici di autenticazione di backup
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } codice rimanente
       *[other] { $numBackupCodes } codici rimanenti
    }
signin-recovery-method-send-code-error-heading = Si è verificato un problema durante l’invio del codice al telefono per il recupero dell’account
signin-recovery-method-send-code-error-description = Riprova più tardi o utilizza i codici di autenticazione di backup.


signin-recovery-code-heading = Accedi
signin-recovery-code-sub-heading = Digita il codice di autenticazione di backup
signin-recovery-code-instruction-v3 = Inserisci uno dei codici monouso salvati durante la configurazione dell’autenticazione in due passaggi.
signin-recovery-code-input-label-v2 = Inserire il codice di 10 caratteri
signin-recovery-code-confirm-button = Conferma
signin-recovery-code-phone-link = Utilizza il telefono per il recupero dell’account
signin-recovery-code-support-link = Sei rimasto bloccato fuori dal tuo account?
signin-recovery-code-required-error = È necessario inserire il codice di autenticazione di backup
signin-recovery-code-use-phone-failure = Si è verificato un problema durante l’invio del codice al telefono per il recupero dell’account
signin-recovery-code-use-phone-failure-description = Riprova più tardi.


signin-recovery-phone-flow-heading = Accedi
signin-recovery-phone-heading = Inserisci il codice di recupero
signin-recovery-phone-instruction-v3 = È stato inviato un codice di sei cifre al numero di telefono che termina con <span>{ $lastFourPhoneDigits }</span> tramite SMS. Questo codice scade dopo 5 minuti. Non condividere questo codice con nessuno.
signin-recovery-phone-input-label = Inserisci il codice a 6 cifre
signin-recovery-phone-code-submit-button = Conferma
signin-recovery-phone-resend-code-button = Invia di nuovo il codice
signin-recovery-phone-resend-success = Codice inviato
signin-recovery-phone-locked-out-link = Sei rimasto bloccato fuori dal tuo account?
signin-recovery-phone-send-code-error-heading = Si è verificato un problema durante l’invio del codice
signin-recovery-phone-code-verification-error-heading = Si è verificato un problema durante la verifica del codice
signin-recovery-phone-general-error-description = Riprova più tardi.
signin-recovery-phone-invalid-code-error-description = Il codice non è valido o è scaduto.
signin-recovery-phone-invalid-code-error-link = Utilizzare invece i codici di autenticazione di backup?
signin-recovery-phone-success-message = Accesso effettuato correttamente. Se utilizzi nuovamente il tuo telefono per il recupero dell’account, potrebbero essere applicati dei limiti.


signin-reported-header = Grazie per la tua attenzione
signin-reported-message = Il nostro team ha ricevuto la segnalazione. La tua collaborazione ci aiuta a tenere alla larga gli intrusi.


signin-token-code-heading-2 = Inserisci il codice di conferma<span> per il tuo { -product-mozilla-account }</span>
signin-token-code-instruction-v2 = Inserisci entro 5 minuti il codice che è stato inviato a <email>{ $email }</email>.
signin-token-code-input-label-v2 = Inserisci il codice a 6 cifre
signin-token-code-confirm-button = Conferma
signin-token-code-code-expired = Codice scaduto?
signin-token-code-resend-code-link = Invia email con nuovo codice.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Invia un nuovo codice via email tra { $seconds } secondo
       *[other] Invia un nuovo codice via email tra { $seconds } secondi
    }
signin-token-code-required-error = Codice di conferma obbligatorio
signin-token-code-resend-error = Si è verificato un problema. Impossibile inviare un nuovo codice.
signin-token-code-instruction-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.


signin-totp-code-header = Accedi
signin-totp-code-subheader-v2 = Inserire il codice di autenticazione in due passaggi
signin-totp-code-instruction-v4 = Controlla l’<strong>app di autenticazione</strong> per confermare l’accesso.
signin-totp-code-input-label-v4 = Inserire il codice a 6 cifre
signin-totp-code-aal-banner-header = Perché ti viene chiesto di autenticarti?
signin-totp-code-aal-banner-content = Hai configurato l’autenticazione in due passaggi per il tuo account, ma non hai ancora effettuato l’accesso con un codice su questo dispositivo.
signin-totp-code-aal-sign-out = Disconnettersi su questo dispositivo
signin-totp-code-aal-sign-out-error = Si è verificato un problema durante la disconnessione
signin-totp-code-confirm-button = Conferma
signin-totp-code-other-account-link = Utilizza un altro account
signin-totp-code-recovery-code-link = Problemi a inserire il codice?
signin-totp-code-required-error = Codice di autenticazione richiesto
signin-totp-code-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.


signin-unblock-header = Autorizza questo accesso
signin-unblock-body = Controlla la tua casella di posta: il codice di autorizzazione è stato inviato a { $email }.
signin-unblock-code-input = Digita il codice di autorizzazione
signin-unblock-submit-button = Continua
signin-unblock-code-required-error = È necessario inserire il codice di autorizzazione
signin-unblock-code-incorrect-length = Il codice di autorizzazione deve contenere 8 caratteri
signin-unblock-code-incorrect-format-2 = Il codice di autorizzazione può contenere solo lettere e/o numeri
signin-unblock-resend-code-button = Il messaggio non si trova nella posta in arrivo e neppure nello spam? Invia nuovamente il link
signin-unblock-support-link = Che cosa sta succedendo?
signin-unblock-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.




confirm-signup-code-page-title = Inserisci il codice di conferma
confirm-signup-code-heading-2 = Inserisci il codice di conferma <span>per il tuo { -product-mozilla-account }</span>
confirm-signup-code-instruction-v2 = Inserisci entro 5 minuti il codice che è stato inviato a <email>{ $email }</email>.
confirm-signup-code-input-label = Inserisci il codice a 6 cifre
confirm-signup-code-confirm-button = Conferma
confirm-signup-code-sync-button = Avvia la sincronizzazione
confirm-signup-code-code-expired = Codice scaduto?
confirm-signup-code-resend-code-link = Invia email con nuovo codice.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Invia un nuovo codice via email tra { $seconds } secondo
       *[other] Invia un nuovo codice via email tra { $seconds } secondi
    }
confirm-signup-code-success-alert = L’account è stato confermato correttamente
confirm-signup-code-is-required-error = Codice di conferma obbligatorio
confirm-signup-code-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.


signup-heading-v2 = Crea una password
signup-relay-info = È necessaria una password per gestire in modo sicuro i tuoi alias di posta elettronica e accedere agli strumenti di sicurezza di { -brand-mozilla }.
signup-sync-info = Sincronizza password, segnalibri e altro ancora ovunque utilizzi { -brand-firefox }.
signup-sync-info-with-payment = Sincronizza password, metodi di pagamento, segnalibri e altro ancora ovunque utilizzi { -brand-firefox }.
signup-change-email-link = Cambia e-mail


signup-confirmed-sync-header = La sincronizzazione è attiva
signup-confirmed-sync-success-banner = { -product-mozilla-account } confermato
signup-confirmed-sync-button = Inizia a navigare
signup-confirmed-sync-description-with-payment-v2 = Password, metodi di pagamento, indirizzi, segnalibri, cronologia e altro ancora possono essere sincronizzati ovunque utilizzi { -brand-firefox }.
signup-confirmed-sync-description-v2 = Password, indirizzi, segnalibri, cronologia e altro ancora possono essere sincronizzati ovunque utilizzi { -brand-firefox }.
signup-confirmed-sync-add-device-link = Aggiungi un altro dispositivo
signup-confirmed-sync-manage-sync-button = Gestisci sincronizzazione
signup-confirmed-sync-set-password-success-banner = Password di sincronizzazione creata
