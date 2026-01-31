



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $case ->
        [definite-article]
            { $capitalization ->
                [upper] Conturile Firefox
               *[lower] conturile Firefox
            }
        [genitive-or-dative]
            { $capitalization ->
                [upper] Conturilor Firefox
               *[lower] conturilor Firefox
            }
       *[indefinite-article]
            { $capitalization ->
                [upper] Conturi Firefox
               *[lower] conturi Firefox
            }
    }
-product-mozilla-account = Cont Mozilla
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Conturi Mozilla
       *[lowercase] conturi Mozilla
    }
-product-firefox-account =
    { $case ->
        [definite-article]
            { $capitalization ->
                [upper] Contul Firefox
               *[lower] contul Firefox
            }
        [genitive-or-dative]
            { $capitalization ->
                [upper] Contului Firefox
               *[lower] contului Firefox
            }
       *[indefinite-article]
            { $capitalization ->
                [upper] Cont Firefox
               *[lower] cont Firefox
            }
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

app-general-err-heading = Eroare generală de aplicație
app-general-err-message = Ceva nu a funcționat. Te rugăm să încerci mai târziu.
app-query-parameter-err-heading = Cerere greșită: Parametri de interogare nevalizi


app-footer-mozilla-logo-label = Sigla { -brand-mozilla }
app-footer-privacy-notice = Notificare privind confidențialitatea site-ului web
app-footer-terms-of-service = Condiții de utilizare a serviciilor


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Se deschide în fereastră nouă


app-loading-spinner-aria-label-loading = Se încarcă…


app-logo-alt-3 =
    .alt = Logo { -brand-mozilla } m



resend-code-success-banner-heading = Ți-am trimis un cod nou pe adresa ta de e-mail.
resend-link-success-banner-heading = Ți-am trimis un link nou pe adresa ta de e-mail.
resend-success-banner-description = Adaugă { $accountsEmail } la contacte ca să te asiguri de o livrare fără probleme.


brand-banner-dismiss-button-2 =
    .aria-label = Închide bannerul
brand-prelaunch-title = { -product-firefox-accounts } va fi redenumit { -product-mozilla-accounts } începând cu 1 nov
brand-prelaunch-subtitle = Te vei autentifica în cont cu același nume de utilizator și aceeași parolă și nu mai sunt alte modificări aduse produselor pe care le utilizezi.
brand-postlaunch-title = Am redenumit { -product-firefox-accounts } cu { -product-mozilla-accounts }. Te vei autentifica în continuare în cont cu același nume de utilizator și aceeași adresă și nu mai sunt alte modificări aduse produselor pe care le utilizezi.
brand-learn-more = Află mai multe
brand-close-banner =
    .alt = Închide bannerul
brand-m-logo =
    .alt = Logo { -brand-mozilla } m


button-back-aria-label = Înapoi
button-back-title = Înapoi


recovery-key-download-button-v3 = Descarcă și continuă
    .title = Descarcă și continuă
recovery-key-pdf-heading = Cheie de recuperare a contului
recovery-key-pdf-download-date = Generată la: { $date }
recovery-key-pdf-key-legend = Cheie de recuperare a contului
recovery-key-pdf-instructions = Această cheie îți permite să îți recuperezi datele criptate din browser (inclusiv parole, marcaje și istoric) în cazul în care îți uiți parola. Păstreaz-o într-un loc de care îți aduci aminte.
recovery-key-pdf-storage-ideas-heading = Unde să-ți păstrezi cheia
recovery-key-pdf-support = Află mai multe despre cheia ta de recuperare a contului
recovery-key-pdf-download-error = Ne pare rău, a apărut o problemă la descărcarea cheii tale de recuperare a contului


choose-newsletters-prompt-2 = Obține mai multe de la { -brand-mozilla }:
choose-newsletters-option-latest-news =
    .label = Obține cele mai recente știri și actualizări de produse
choose-newsletters-option-test-pilot =
    .label = Acces timpuriu pentru a testa produse noi
choose-newsletters-option-reclaim-the-internet =
    .label = Alerte de acțiune pentru revendicarea internetului


datablock-download =
    .message = Descărcat
datablock-copy =
    .message = Copiat
datablock-print =
    .message = Printat


datablock-copy-success =
    { $count ->
        [one] Cod copiat
       *[other] Coduri copiate
    }
datablock-download-success =
    { $count ->
        [one] Cod descărcat
       *[other] Coduri descărcate
    }
datablock-print-success =
    { $count ->
        [one] Cod printat
       *[other] Coduri printate
    }


datablock-inline-copy =
    .message = Copiat


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimate)
device-info-block-location-region-country = { $region }, { $country } (estimate)
device-info-block-location-city-country = { $city }, { $country } (estimate)
device-info-block-location-country = { $country } (estimată)
device-info-block-location-unknown = Locație necunoscută
device-info-browser-os = { $browserName } pe { $genericOSName }
device-info-ip-address = Adresă IP: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Parolă
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Repetă parola
form-password-with-inline-criteria-signup-submit-button = Creează un cont
form-password-with-inline-criteria-reset-new-password =
    .label = Parolă nouă
form-password-with-inline-criteria-confirm-password =
    .label = Confirmă parola
form-password-with-inline-criteria-reset-submit-button = Creează o parolă nouă
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Parolă
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Repetă parola
form-password-with-inline-criteria-set-password-submit-button = Începe sincronizarea
form-password-with-inline-criteria-match-error = Parolele nu se potrivesc
form-password-with-inline-criteria-sr-too-short-message = Parola trebuie să aibă cel puțin 8 caractere.
form-password-with-inline-criteria-sr-not-email-message = Parola nu trebuie să conțină adresa ta de e-mail.
form-password-with-inline-criteria-sr-not-common-message = Parola nu trebuie să fie o parolă utilizată în mod obișnuit.
form-password-with-inline-criteria-sr-requirements-met = Parola introdusă respectă toate cerințele pentru parole.
form-password-with-inline-criteria-sr-passwords-match = Parolele introduse se potrivesc.


form-verify-code-default-error = Câmp obligatoriu


form-verify-totp-disabled-button-title-numeric = Introdu codul de { $codeLength } cifre pentru a continua
form-verify-totp-disabled-button-title-alphanumeric = Introdu codul de { $codeLength } caractere pentru a continua


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Cheie de recuperare a contului { -brand-firefox }
get-data-trio-title-backup-verification-codes = Coduri de autentificare de rezervă
get-data-trio-download-2 =
    .title = Descarcă
    .aria-label = Descarcă
get-data-trio-copy-2 =
    .title = Copiază
    .aria-label = Copiază
get-data-trio-print-2 =
    .title = Printează
    .aria-label = Printează


alert-icon-aria-label =
    .aria-label = Alertă
icon-attention-aria-label =
    .aria-label = Atenție
icon-warning-aria-label =
    .aria-label = Avertisment
authenticator-app-aria-label =
    .aria-label = Aplicație de autentificare
backup-codes-icon-aria-label-v2 =
    .aria-label = Coduri de rezervă de autentificare activate
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Coduri de rezervă de autentificare dezactivate
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS de recuperare activat
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS de recuperare dezactivat
canadian-flag-icon-aria-label =
    .aria-label = Drapelul canadian
checkmark-icon-aria-label =
    .aria-label = Bifează
checkmark-success-icon-aria-label =
    .aria-label = Succes
checkmark-enabled-icon-aria-label =
    .aria-label = Activat
close-icon-aria-label =
    .aria-label = Închide mesajul
code-icon-aria-label =
    .aria-label = Cod
error-icon-aria-label =
    .aria-label = Eroare
info-icon-aria-label =
    .aria-label = Informații
usa-flag-icon-aria-label =
    .aria-label = Steagul Statelor Unite


hearts-broken-image-aria-label =
    .aria-label = Un calculator și un telefon mobil și o imagine a unei inimi frânte pe fiecare
hearts-verified-image-aria-label =
    .aria-label = Un calculator, un telefon mobil și o tabletă cu câte o inimă pulsând pe fiecare
signin-recovery-code-image-description =
    .aria-label = Document care conține text ascuns.
signin-totp-code-image-label =
    .aria-label = Un dispozitiv cu un cod ascuns de 6 cifre.
confirm-signup-aria-label =
    .aria-label = Un plic care conține un link
security-shield-aria-label =
    .aria-label = Ilustrație care reprezintă o cheie de recuperare a contului.
recovery-key-image-aria-label =
    .aria-label = Ilustrație care reprezintă o cheie de recuperare a contului.
password-image-aria-label =
    .aria-label = O ilustrație care reprezintă tastarea unei parole.
lightbulb-aria-label =
    .aria-label = Ilustrație care reprezintă crearea unui indiciu de stocare.
email-code-image-aria-label =
    .aria-label = Ilustrație care reprezintă un e-mail care conține un cod.
recovery-phone-image-description =
    .aria-label = Dispozitiv mobil care primește un cod prin mesaj text.
recovery-phone-code-image-description =
    .aria-label = Cod primit pe un dispozitiv mobil.
backup-recovery-phone-image-aria-label =
    .aria-label = Dispozitiv mobil cu funcții de trimitere mesaje text SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Ecranul dispozitivului cu coduri
sync-clouds-image-aria-label =
    .aria-label = Nori cu o pictogramă de sincronizare
confetti-falling-image-aria-label =
    .aria-label = Confeti animate care cad


inline-recovery-key-setup-signed-in-firefox-2 = Ești autentificat(ă) în { -brand-firefox }.
inline-recovery-key-setup-create-header = Securizează-ți contul
inline-recovery-key-setup-create-subheader = Ai un minut să-ți protejezi datele?
inline-recovery-key-setup-info = Creează o cheie de recuperare a contului pentru a-ți restaura datele de navigare sincronizate dacă uiți parola.
inline-recovery-key-setup-start-button = Creează o cheie de recuperare a contului
inline-recovery-key-setup-later-button = Fă-o mai târziu


input-password-hide = Ascunde parola
input-password-show = Afișează parola
input-password-hide-aria-2 = Parola ta este vizibilă acum pe ecran.
input-password-show-aria-2 = Parola ta este ascunsă acum.
input-password-sr-only-now-visible = Parola ta este vizibilă acum pe ecran.
input-password-sr-only-now-hidden = Parola ta este ascunsă acum.


input-phone-number-country-list-aria-label = Selectează țara
input-phone-number-enter-number = Introdu numărul de telefon
input-phone-number-country-united-states = Statele Unite
input-phone-number-country-canada = Canada
legal-back-button = Înapoi


reset-pwd-link-damaged-header = Link de resetare a parolei corupt
signin-link-damaged-header = Link de confirmare corupt
report-signin-link-damaged-header = Link corupt
reset-pwd-link-damaged-message = Linkul pe care ai dat clic avea caractere lipsă și este posibil să fi fost corupt de către clientul de e-mail. Copiază adresa cu grijă și încearcă din nou.


link-expired-new-link-button = Primește un link nou


remember-password-text = Îți amintești parola?
remember-password-signin-link = Intră în cont


primary-email-confirmation-link-reused = Adresă de e-mail primară deja confirmată
signin-confirmation-link-reused = Autentificare deja confirmată
confirmation-link-reused-message = Linkul de confirmare a fost deja folosit și nu poate fi reutilizat.


locale-toggle-select-label = Selectează limba
locale-toggle-browser-default = Implicit în browser
error-bad-request = Cerere nereușită


password-info-balloon-why-password-info = Ai nevoie de această parolă pentru a accesa orice date criptate pe care le stochezi la noi.
password-info-balloon-reset-risk-info = O resetare înseamnă pierderea potențială a unor date precum parole și marcaje.


password-strength-long-instruction = Alege o parolă puternică pe care nu ai mai folosit-o pe alte site-uri. Asigură-te că îndeplinește cerințele de securitate:
password-strength-short-instruction = Alege o parolă puternică:
password-strength-inline-min-length = Cel puțin 8 caractere
password-strength-inline-not-email = Nu adresa ta de e-mail
password-strength-inline-not-common = Nu o parolă utilizată frecvent
password-strength-inline-confirmed-must-match = Confirmarea corespunde cu noua parolă
password-strength-inline-passwords-match = Parolele se potrivesc


account-recovery-notification-cta = Creează
account-recovery-notification-header-value = Nu-ți pierde datele dacă uiți parola
account-recovery-notification-header-description = Creează o cheie de recuperare a contului pentru a-ți restaura datele de navigare sincronizate dacă uiți parola.
recovery-phone-promo-cta = Adaugă un număr de telefon de recuperare
recovery-phone-promo-heading = Adaugă protecție suplimentară contului tău cu un număr de telefon de recuperare
recovery-phone-promo-description = Acum te poți autentifica cu o parolă de unică folosință prin SMS dacă nu poți folosi aplicația de autentificare în doi pași.
recovery-phone-promo-info-link = Află mai multe despre recuperare și riscul de schimbare a cartelei SIM
promo-banner-dismiss-button =
    .aria-label = Închide bannerul


ready-complete-set-up-instruction = Finalizează configurarea prin introducerea noii parole pe celelalte dispozitive { -brand-firefox }.
manage-your-account-button = Gestionează-ți contul
ready-use-service = Acum ești gata să utilizezi { $serviceName }
ready-use-service-default = Acum ești gata să utilizezi setările contului
ready-account-ready = Contul tău este gata!
ready-continue = Continuă
sign-in-complete-header = Autentificare confirmată
sign-up-complete-header = Cont confirmat
primary-email-verified-header = Adresă de e-mail primară confirmată


flow-recovery-key-download-storage-ideas-heading-v2 = Locuri unde poți păstra cheia:
flow-recovery-key-download-storage-ideas-folder-v2 = Dosar pe dispozitiv securizat
flow-recovery-key-download-storage-ideas-cloud = Stocare de încredere în cloud
flow-recovery-key-download-storage-ideas-print-v2 = Copie fizică scoasă la imprimantă
flow-recovery-key-download-storage-ideas-pwd-manager = Manager de parole


flow-recovery-key-hint-header-v2 = Adaugă un indiciu pentru a te ajuta să-ți găsești cheia
flow-recovery-key-hint-message-v3 = Indiciul ar trebui să te ajute să-ți amintești unde ai stocat cheia de recuperare a contului. Ți-l putem arăta în timpul resetării parolei pentru a-ți recupera datele.
flow-recovery-key-hint-input-v2 =
    .label = Introdu un indiciu (opțional)
flow-recovery-key-hint-cta-text = Finalizează
flow-recovery-key-hint-char-limit-error = Indiciul trebuie să conțină mai puțin de 255 de caractere.
flow-recovery-key-hint-unsafe-char-error = Indiciul nu poate conține caractere Unicode nesigure. Sunt permise doar litere, cifre, semne de punctuație și simboluri.


password-reset-warning-icon = Avertisment
password-reset-chevron-expanded = Restrânge avertismentul
password-reset-chevron-collapsed = Extinde avertismentul
password-reset-data-may-not-be-recovered = Este posibil să nu se poată recupera datele din browser
password-reset-previously-signed-in-device-2 = Ai vreun dispozitiv pe care te-ai conectat anterior?
password-reset-data-may-be-saved-locally-2 = Este posibil să ai datele din browser salvate pe dispozitivul respectiv. Resetează-ți parola, apoi intră în cont pe dispozitiv ca să îți restaurezi și să îți sincronizezi datele.
password-reset-no-old-device-2 = Ai un dispozitiv nou, dar nu ai acces la niciunul dintre cele anterioare?
password-reset-encrypted-data-cannot-be-recovered-2 = Ne pare rău, dar datele criptate ale browserului tău nu pot fi recuperate de pe serverele { -brand-firefox }.
password-reset-warning-have-key = Ai o cheie de recuperare a contului?
password-reset-warning-use-key-link = Folosește-o acum ca să resetezi parola și să-ți păstrezi datele


alert-bar-close-message = Închide mesajul


avatar-your-avatar =
    .alt = Avatarul tău
avatar-default-avatar =
    .alt = Avatar implicit




bento-menu-title-3 = Produse { -brand-mozilla }
bento-menu-tagline = Mai multe produse de la { -brand-mozilla } care îți protejează confidențialitatea
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Browserul { -brand-firefox } pentru desktop
bento-menu-firefox-mobile = Browserul { -brand-firefox } pentru dispozitiv mobil
bento-menu-made-by-mozilla = Realizat de { -brand-mozilla }


connect-another-fx-mobile = Obține { -brand-firefox } pe dispozitivul mobil sau tabletă
connect-another-find-fx-mobile-2 = Caută { -brand-firefox } în { -google-play } și { -app-store }.
connect-another-play-store-image-2 =
    .alt = Descarcă { -brand-firefox } din { -google-play }
connect-another-app-store-image-3 =
    .alt = Descarcă { -brand-firefox } din { -app-store }


cs-heading = Servicii conectate
cs-description = Tot ce folosești și în care ești autentificat.
cs-cannot-refresh =
    Ne pare rău, a apărut o problemă la actualizarea listei de servicii
    conectate.
cs-cannot-disconnect = Clientul nu a fost găsit, imposibil de deconectat
cs-logged-out-2 = Deconectat de la { $service }
cs-refresh-button =
    .title = Reîmprospătează serviciile conectate
cs-missing-device-help = Obiecte lipsă sau duplicate?
cs-disconnect-sync-heading = Deconectare de la Sync


cs-disconnect-sync-content-3 =
    Datele de navigare vor rămâne pe <span>{ $device }</span>, 
    însă nu se vor mai sincroniza cu contul tău.
cs-disconnect-sync-reason-3 = Care este principalul motiv pentru deconectarea <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = Dispozitivul este:
cs-disconnect-sync-opt-suspicious = Suspect
cs-disconnect-sync-opt-lost = Pierdut sau furat
cs-disconnect-sync-opt-old = Vechi sau înlocuit
cs-disconnect-sync-opt-duplicate = Duplicat
cs-disconnect-sync-opt-not-say = Prefer să nu spun


cs-disconnect-advice-confirm = OK, am înțeles
cs-disconnect-lost-advice-heading = Dispozitiv pierdut sau furat deconectat
cs-disconnect-lost-advice-content-3 = Întrucât dispozitivul a fost pierdut sau furat, pentru a-ți păstra informațiile în siguranță, ar trebui să schimbi parola { -product-mozilla-account } în setările contului. De asemenea, ar trebui să cauți informații de la producătorul dispozitivului despre ștergerea datelor de la distanță.
cs-disconnect-suspicious-advice-heading = Dispozitiv suspect deconectat
cs-disconnect-suspicious-advice-content-2 = Dacă dispozitivul deconectat este într-adevăr suspect, pentru a-ți păstra în siguranță informațiile, ar trebui să îți schimbi parola { -product-mozilla-account } în setările contului. Ar trebui să schimbi și orice alte parole pe care le-ai salvat în { -brand-firefox } tastând about:logins în bara de adrese.
cs-sign-out-button = Ieși din cont


dc-heading = Colectarea și utilizarea datelor
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Browser { -brand-firefox }
dc-subheader-content-2 = Permite ca { -product-mozilla-accounts } să trimită informații tehnice și de interacțiune către { -brand-mozilla }.
dc-subheader-ff-content = Pentru revizuirea sau actualizarea setărilor tehnice și de interacțiune ale browserului { -brand-firefox }, deschide setările { -brand-firefox } și mergi la Confidențialitate și securitate.
dc-opt-out-success-2 = Dezactivare realizată cu succes. { -product-mozilla-accounts } nu va trimite date tehnice sau de interacțiune către { -brand-mozilla }.
dc-opt-in-success-2 = Îți mulțumim! Partajarea acestor date ne ajută să îmbunătățim { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Ne pare rău, a apărut o problemă la modificarea preferințelor de colectare a datelor
dc-learn-more = Află mai multe


drop-down-menu-title-2 = Meniu { -product-mozilla-account }
drop-down-menu-signed-in-as-v2 = Autentificat(ă) ca
drop-down-menu-sign-out = Ieși din cont
drop-down-menu-sign-out-error-2 = Ne pare rău, a apărut o problemă la deconectare


flow-container-back = Înapoi


flow-recovery-key-confirm-pwd-heading-v2 = Reintrodu parola pentru securitate
flow-recovery-key-confirm-pwd-input-label = Introdu parola
flow-recovery-key-confirm-pwd-submit-button = Creează o cheie de recuperare a contului
flow-recovery-key-confirm-pwd-submit-button-change-key = Creează o cheie nouă de recuperare a contului


flow-recovery-key-download-heading-v2 = Cheia de recuperare a contului a fost creată — Descarc-o și salveaz-o acum
flow-recovery-key-download-info-v2 = Cheia îți permite să îți recuperezi datele dacă uiți parola. Descarc-o acum și stocheaz-o undeva unde să ții minte că ai pus-o — nu veți putea reveni la această pagină mai târziu.
flow-recovery-key-download-next-link-v2 = Continuă fără descărcare


flow-recovery-key-success-alert = Cheia de recuperare a contului a fost creată


flow-recovery-key-info-header = Creează o cheie de recuperare a contului pentru cazul în care uiți parola
flow-recovery-key-info-header-change-key = Schimbă-ți cheia de recuperare a contului
flow-recovery-key-info-shield-bullet-point-v2 = Criptăm datele de navigare –– parole, marcaje și multe altele. Este excelent pentru confidențialitate, dar îți poți pierde datele dacă uiți parola.
flow-recovery-key-info-key-bullet-point-v2 = De aceea, crearea unei chei de recuperare a contului este atât de importantă –– o poți folosi pentru restaurarea datelor.
flow-recovery-key-info-cta-text-v3 = Începe
flow-recovery-key-info-cancel-link = Anulează


flow-setup-2fa-qr-heading = Conectează-te la aplicația ta de autentificare
flow-setup-2a-qr-instruction = <strong>Pasul 1:</strong> Scanează acest cod QR folosind orice aplicație de autentificare, cum ar fi Duo sau Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = Cod QR pentru configurarea autentificării în doi pași. Scanează-l sau alege „Nu poți scana codul QR?” pentru a obține în schimb o cheie secretă de configurare.
flow-setup-2fa-cant-scan-qr-button = Nu poți scana codul QR?
flow-setup-2fa-manual-key-heading = Introdu codul manual
flow-setup-2fa-manual-key-instruction = <strong>Pasul 1:</strong> Introdu codul din aplicația de autentificare preferată.
flow-setup-2fa-scan-qr-instead-button = Scanezi codul QR în schimb?
flow-setup-2fa-more-info-link = Află mai multe despre aplicațiile de autentificare
flow-setup-2fa-button = Continuă
flow-setup-2fa-step-2-instruction = <strong>Pasul 2:</strong> Introdu codul din aplicația de autentificare.
flow-setup-2fa-input-label = Introdu codul de 6 cifre
flow-setup-2fa-code-error = Cod nevalid sau expirat. Verifică aplicația de autentificare și încearcă din nou.


flow-setup-2fa-backup-choice-heading = Alege o metodă de recuperare
flow-setup-2fa-backup-choice-description = Îți permite să te conectezi dacă nu poți accesa dispozitivul mobil sau aplicația de autentificare.
flow-setup-2fa-backup-choice-phone-title = Număr de telefon de recuperare
flow-setup-2fa-backup-choice-phone-badge = Cel mai ușor
flow-setup-2fa-backup-choice-phone-info = Primește un cod de recuperare prin mesaj text. Disponibil în SUA și Canada.
flow-setup-2fa-backup-choice-code-title = Coduri de autentificare de rezervă
flow-setup-2fa-backup-choice-code-badge = Cel mai sigur
flow-setup-2fa-backup-choice-code-info = Creează și salvează coduri de autentificare de unică folosință.
flow-setup-2fa-backup-choice-learn-more-link = Află despre recuperare și riscul de schimbare a cartelei SIM


flow-setup-2fa-backup-code-confirm-heading = Introdu codul de autentificare de rezervă
flow-setup-2fa-backup-code-confirm-confirm-saved = Confirmă că ai salvat codurile introducând unul. Fără aceste coduri, este posibil să nu poți intra în cont dacă nu ai aplicația de autentificare.
flow-setup-2fa-backup-code-confirm-code-input = Introdu codul de 10 caractere
flow-setup-2fa-backup-code-confirm-button-finish = Termină


flow-setup-2fa-backup-code-dl-heading = Salvează codurile de autentificare de rezervă
flow-setup-2fa-backup-code-dl-save-these-codes = Păstrează-le într-un loc pe care să îl ții minte. Dacă nu ai acces la aplicația de autentificare, va trebui să introduci unul ca să intri în cont.
flow-setup-2fa-backup-code-dl-button-continue = Continuă


flow-setup-2fa-inline-complete-success-banner = Autentificare în doi pași activată
flow-setup-2fa-inline-complete-success-banner-description = Pentru a-ți proteja toate dispozitivele conectate, trebuie să ieși din cont de peste tot pe unde îl folosești și apoi să intri iar în cont utilizând noua autentificare în doi pași.
flow-setup-2fa-inline-complete-backup-code = Coduri de autentificare de rezervă
flow-setup-2fa-inline-complete-backup-phone = Număr de telefon de recuperare
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } cod rămas
        [few] { $count } coduri rămase
       *[other] { $count } de coduri rămase
    }
flow-setup-2fa-inline-complete-backup-code-description = Este cea mai sigură metodă de recuperare dacă nu poți intra în cont cu dispozitivul mobil sau aplicația de autentificare.
flow-setup-2fa-inline-complete-backup-phone-description = Este cea mai ușoară metodă de recuperare dacă nu poți intra în cont cu aplicația de autentificare.
flow-setup-2fa-inline-complete-learn-more-link = Cum îți protejează contul
flow-setup-2fa-inline-complete-continue-button = Continuă cu { $serviceName }
flow-setup-2fa-prompt-heading = Configurează autentificarea în doi pași
flow-setup-2fa-prompt-description = { $serviceName } necesită configurarea autentificării în doi pași ca să îți menții contul în siguranță.
flow-setup-2fa-prompt-use-authenticator-apps = Poți folosi oricare dintre <authenticationAppsLink>aceste aplicații de autentificare</authenticationAppsLink> pentru a continua.
flow-setup-2fa-prompt-continue-button = Continuă


flow-setup-phone-confirm-code-heading = Introdu codul de verificare
flow-setup-phone-confirm-code-instruction = A fost trimis prin SMS un cod de 6 cifre la <span>{ $phoneNumber }</span>. Codul expiră după 5 minute.
flow-setup-phone-confirm-code-input-label = Introdu codul de 6 cifre
flow-setup-phone-confirm-code-button = Confirmă
flow-setup-phone-confirm-code-expired = Codul a expirat?
flow-setup-phone-confirm-code-resend-code-button = Retrimite codul
flow-setup-phone-confirm-code-resend-code-success = Cod trimis
flow-setup-phone-confirm-code-success-message-v2 = Număr de telefon de recuperare adăugat
flow-change-phone-confirm-code-success-message = Număr de telefon de recuperare modificat


flow-setup-phone-submit-number-heading = Verifică numărul de telefon
flow-setup-phone-verify-number-instruction = Vei primi un mesaj text de la { -brand-mozilla } cu un cod pentru verificarea numărului. Nu-l distribui nimănui.
flow-setup-phone-submit-number-info-message-v2 = Numărul de telefon pentru recuperare este disponibil numai în Statele Unite și Canada. Numerele VoIP și măștile telefonice nu sunt recomandate.
flow-setup-phone-submit-number-legal = Prin furnizarea numărului, ești de acord să îl stocăm pentru a-ți putea trimite mesaje text doar pentru verificarea contului. Se pot aplica tarife pentru mesaje și date.
flow-setup-phone-submit-number-button = Trimite codul


header-menu-open = Închide meniul
header-menu-closed = Meniu de navigare pe site
header-back-to-top-link =
    .title = Înapoi în partea de sus
header-back-to-settings-link =
    .title = Înapoi la setările { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Ajutor


la-heading = Conturi asociate
la-description = Ai acces autorizat la următoarele conturi.
la-unlink-button = Anulează asocierea
la-unlink-account-button = Anulează asocierea
la-set-password-button = Setează parola
la-unlink-heading = Anulează asocierea cu contul terț
la-unlink-content-3 = Sigur vrei să anulezi asocierea contului? Anularea asocierii nu te deconectează automat de la Serviciile Conectate. Pentru asta va trebui să te deconectezi manual din secțiunea Servicii Conectate.
la-unlink-content-4 = Înainte de anularea asocierii contului, trebuie să setezi o parolă. Fără parolă nu ai cum să te autentifici după anularea asocierii contului.
nav-linked-accounts = { la-heading }


modal-close-title = Închide
modal-cancel-button = Anulează
modal-default-confirm-button = Confirmă


modal-mfa-protected-title = Introdu codul de confirmare
modal-mfa-protected-subtitle = Ajută-ne să ne asigurăm că tu ești cel/cea care modifici informațiile contului
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Introdu codul trimis la <email>{ $email }</email> în { $expirationTime } minut
        [few] Introdu codul trimis la <email>{ $email }</email> în { $expirationTime } minute
       *[other] Introdu codul trimis la <email>{ $email }</email> în { $expirationTime } de minute
    }
modal-mfa-protected-input-label = Introdu codul de 6 cifre
modal-mfa-protected-cancel-button = Anulează
modal-mfa-protected-confirm-button = Confirmă
modal-mfa-protected-code-expired = Cod expirat?
modal-mfa-protected-resend-code-link = Trimite un cod nou prin e-mail.


mvs-verify-your-email-2 = Confirmă adresa de e-mail
mvs-enter-verification-code-2 = Introdu codul de confirmare
mvs-enter-verification-code-desc-2 = Te rugăm să introduci, în termen de 5 minute, codul de confirmare trimis către <email>{ $email }</email>.
msv-cancel-button = Anulează
msv-submit-button-2 = Confirmă


nav-settings = Setări
nav-profile = Profil
nav-security = Securitate
nav-connected-services = Servicii conectate
nav-data-collection = Colectarea și utilizarea datelor
nav-paid-subs = Abonamente cu plată
nav-email-comm = Comunicări prin e-mail


page-2fa-change-title = Modifică autentificarea în doi pași
page-2fa-change-success = Autentificarea în doi pași a fost actualizată
page-2fa-change-success-additional-message = Pentru a-ți proteja toate dispozitivele conectate, trebuie să ieși din cont de peste tot pe unde îl folosești și apoi să intri iar în cont utilizând noua autentificare în doi pași.
page-2fa-change-totpinfo-error = A apărut o eroare la înlocuirea aplicației de autentificare în doi pași. Încearcă din nou mai târziu.
page-2fa-change-qr-instruction = <strong>Pasul 1:</strong> Scanează acest cod QR folosind orice aplicație de autentificare, cum ar fi Duo sau Google Authenticator. Creează o conexiune nouă; orice conexiune veche nu va mai funcționa.


tfa-backup-codes-page-title = Coduri de autentificare de rezervă
tfa-replace-code-error-3 = A apărut o problemă la înlocuirea codurilor de autentificare de rezervă
tfa-create-code-error = A apărut o problemă la crearea codurilor de autentificare de rezervă
tfa-replace-code-success-alert-4 = Codurile de autentificare de rezervă au fost actualizate
tfa-create-code-success-alert = Coduri de autentificare de rezervă create
tfa-replace-code-download-description = Păstrează-le într-un loc pe care să îl ții minte. Vechile coduri vor fi înlocuite după ce termini pasul următor.
tfa-replace-code-confirm-description = Confirmă că ți-ai salvat codurile introducând unul. Vechile coduri de autentificare de rezervă vor fi dezactivate după finalizarea acestui pas.
tfa-incorrect-recovery-code-1 = Cod de autentificare de rezervă incorect


page-2fa-setup-title = Autentificare în doi pași
page-2fa-setup-totpinfo-error = A apărut o eroare la setarea autentificării în doi pași. Încearcă din nou mai târziu.
page-2fa-setup-incorrect-backup-code-error = Codul nu este corect. Încearcă din nou.
page-2fa-setup-success = Autentificarea în doi pași a fost activată
page-2fa-setup-success-additional-message = Pentru a-ți proteja toate dispozitivele conectate, trebuie să ieși din cont de peste tot pe unde îl folosești și apoi să intri iar în cont utilizând noua autentificare în doi pași.


avatar-page-title =
    .title = Poză de profil
avatar-page-add-photo = Adaugă o fotografie
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fă o fotografie
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Elimină fotografia
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Refă fotografia
avatar-page-cancel-button = Anulează
avatar-page-save-button = Salvează
avatar-page-saving-button = Se salvează…
avatar-page-zoom-out-button =
    .title = Micșorează
avatar-page-zoom-in-button =
    .title = Mărește
avatar-page-rotate-button =
    .title = Rotește
avatar-page-camera-error = Nu s-a putut inițializa camera
avatar-page-new-avatar =
    .alt = poză de profil nouă
avatar-page-file-upload-error-3 = A apărut o problemă la încărcarea fotografiei de profil
avatar-page-delete-error-3 = A apărut o problemă la ștergerea fotografiei de profil
avatar-page-image-too-large-error-2 = Fișierul de imagine este prea mare și nu poate fi încărcat


pw-change-header =
    .title = Schimbă parola
pw-8-chars = Cel puțin 8 caractere
pw-not-email = Nu adresa ta de e-mail
pw-change-must-match = Noua parolă să se potrivească cu confirmarea
pw-commonly-used = Nu o parolă utilizată frecvent
pw-tips = Rămâi în siguranță — nu reutiliza parolele. Vezi mai multe ponturi despre <linkExternal>cum să creezi parole puternice</linkExternal>.
pw-change-cancel-button = Anulează
pw-change-save-button = Salvează
pw-change-forgot-password-link = Ți-ai uitat parola?
pw-change-current-password =
    .label = Introdu parola actuală
pw-change-new-password =
    .label = Introdu parola nouă
pw-change-confirm-password =
    .label = Confirmă noua parolă
pw-change-success-alert-2 = Parolă actualizată


pw-create-header =
    .title = Creează parola
pw-create-success-alert-2 = Parolă setată
pw-create-error-2 = Ne pare rău, a apărut o problemă la setarea parolei


delete-account-header =
    .title = Șterge contul
delete-account-step-1-2 = Pasul 1 din 2
delete-account-step-2-2 = Pasul 2 din 2
delete-account-confirm-title-4 = Este posibil să îți fi conectat { -product-mozilla-account } la unul sau mia multe dintre următoarele produse sau servicii { -brand-mozilla } care te mențin în siguranță și îți asigură productivitatea pe web:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Se sincronizează datele { -brand-firefox }
delete-account-product-firefox-addons = Suplimente { -brand-firefox }
delete-account-acknowledge = Te rugăm să iei la cunoștință că prin ștergerea contului:
delete-account-chk-box-1-v4 =
    .label = Orice abonamente cu plată pe care le ai vor fi anulate
delete-account-chk-box-2 =
    .label = Este posibil să pierzi informațiile și funcțiile salvate în cadrul produselor { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Reactivarea cu acest e-mail este posibil să nu îți restabilească informațiile salvate
delete-account-chk-box-4 =
    .label = Orice extensie și temă pe care le-ai publicat pe addons.mozilla.org vor fi șterse
delete-account-continue-button = Continuă
delete-account-password-input =
    .label = Introdu parola
delete-account-cancel-button = Anulează
delete-account-delete-button-2 = Șterge


display-name-page-title =
    .title = Nume afișat
display-name-input =
    .label = Introdu numele afișat
submit-display-name = Salvează
cancel-display-name = Anulează
display-name-update-error-2 = A apărut o problemă la actualizarea numelui tău afișat
display-name-success-alert-2 = Nume afișat actualizat


recent-activity-title = Activitate recentă în cont
recent-activity-account-create-v2 = Cont creat
recent-activity-account-disable-v2 = Cont dezactivat
recent-activity-account-enable-v2 = Cont activat
recent-activity-account-login-v2 = Autentificarea în cont a fost inițiată
recent-activity-account-reset-v2 = Resetarea parolei a fost inițiată
recent-activity-emails-clearBounces-v2 = Respingerile de e-mail au fost eliminate
recent-activity-account-login-failure = Încercarea de autentificare în cont a eșuat
recent-activity-account-two-factor-added = Autentificare în doi pași activată
recent-activity-account-two-factor-requested = Autentificare în doi pași solicitată
recent-activity-account-two-factor-failure = Autentificare în doi pași a eșuat
recent-activity-account-two-factor-success = Autentificare în doi pași reușită
recent-activity-account-two-factor-removed = Autentificarea în doi pași a fost eliminată
recent-activity-account-password-reset-requested = Contul a solicitat resetarea parolei
recent-activity-account-password-reset-success = Parolă cont resetată cu succes
recent-activity-account-recovery-key-added = Cheie de recuperare a contului activată
recent-activity-account-recovery-key-verification-failure = Verificarea cheii de recuperare a contului a eșuat
recent-activity-account-recovery-key-verification-success = Cheie de recuperare a contului verificată cu succes
recent-activity-account-recovery-key-removed = Cheie de recuperare a contului eliminată
recent-activity-account-password-added = Parolă nouă adăugată
recent-activity-account-password-changed = Parolă modificată
recent-activity-account-secondary-email-added = Adresă de e-mail secundară adăugată
recent-activity-account-secondary-email-removed = Adresă de e-mail secundară eliminată
recent-activity-account-emails-swapped = Adresele de e-mail principală și secundară au fost schimbate între ele
recent-activity-session-destroy = Deconectat(ă) de la sesiune
recent-activity-account-recovery-phone-send-code = Cod de număr de telefon de recuperare trimis
recent-activity-account-recovery-phone-setup-complete = Configurare număr de telefon de recuperare finalizată
recent-activity-account-recovery-phone-signin-complete = Autentificare cu număr de telefon de recuperare finalizată
recent-activity-account-recovery-phone-signin-failed = Autentificarea nu numărul de telefon de recuperare a eșuat
recent-activity-account-recovery-phone-removed = Număr de telefon de recuperare eliminat
recent-activity-account-recovery-codes-replaced = Coduri de recuperare înlocuite
recent-activity-account-recovery-codes-created = Codurile de recuperare au fost create
recent-activity-account-recovery-codes-signin-complete = Autentificare cu coduri de recuperare finalizată
recent-activity-password-reset-otp-sent = Codul de confirmare a resetării parolei a fost trimis
recent-activity-password-reset-otp-verified = Codul de confirmare a resetării parolei a fost verificat
recent-activity-must-reset-password = Necesită resetarea parolei
recent-activity-unknown = Alte activități din cont


recovery-key-create-page-title = Cheie de recuperare a contului
recovery-key-create-back-button-title = Înapoi la setări


recovery-phone-remove-header = Elimină numărul de telefon de recuperare
settings-recovery-phone-remove-info = Va elimina <strong>{ $formattedFullPhoneNumber }</strong> ca număr de telefon de recuperare.
settings-recovery-phone-remove-recommend = Îți recomandăm să păstrezi această metodă pentru că e mai ușoară decât să salvezi coduri de autentificare de rezervă.
settings-recovery-phone-remove-recovery-methods = Dacă îl ștergi, asigură-te că mai ai codurile de autentificare de rezervă salvate. <linkExternal>Compară metodele de recuperare</linkExternal>
settings-recovery-phone-remove-button = Elimină numărul de telefon
settings-recovery-phone-remove-cancel = Anulează
settings-recovery-phone-remove-success = Număr de telefon de recuperare eliminat


page-setup-recovery-phone-heading = Adaugă un număr de telefon de recuperare
page-change-recovery-phone = Schimbă numărul de telefon de recuperare
page-setup-recovery-phone-back-button-title = Înapoi la setări
page-setup-recovery-phone-step2-back-button-title = Schimbă numărul de telefon


add-secondary-email-step-1 = Pasul 1 din 2
add-secondary-email-error-2 = A apărut o problemă la crearea acestui e-mail
add-secondary-email-page-title =
    .title = E-mail secundar
add-secondary-email-enter-address =
    .label = Introdu adresa de e-mail
add-secondary-email-cancel-button = Anulează
add-secondary-email-save-button = Salvează
add-secondary-email-mask = Măștile de e-mail nu pot fi folosite ca adresă de e-mail secundară


add-secondary-email-step-2 = Pasul 2 din 2
verify-secondary-email-page-title =
    .title = E-mail secundar
verify-secondary-email-verification-code-2 =
    .label = Introdu codul de confirmare
verify-secondary-email-cancel-button = Anulează
verify-secondary-email-verify-button-2 = Confirmă
verify-secondary-email-please-enter-code-2 = Te rugăm să introduci în 5 minute codul de confirmare trimis la <strong>{ $email }</strong>.
verify-secondary-email-success-alert-2 = { $email } adăugată cu succes
verify-secondary-email-resend-code-button = Retrimite codul de confirmare


delete-account-link = Șterge contul
inactive-update-status-success-alert = Autentificare reușită. { -product-mozilla-account } și datele vor rămâne active.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Află unde sunt expuse informațiile tale private și preia controlul
product-promo-monitor-cta = Obține o scanare gratuită


profile-heading = Profil
profile-picture =
    .header = Fotografie
profile-display-name =
    .header = Nume afișat
profile-primary-email =
    .header = E-mail principal


progress-bar-aria-label-v2 = Pasul { $currentStep } din { $numberOfSteps }.


security-heading = Securitate
security-password =
    .header = Parolă
security-password-created-date = Creată în { $date }
security-not-set = Nu este setat
security-action-create = Creează
security-set-password = Setează o parolă pentru sincronizare și folosirea anumitor funcții de securitate ale contului.
security-recent-activity-link = Vezi activitatea recentă din cont
signout-sync-header = Sesiune expirată
signout-sync-session-expired = Ne pare rău, ceva nu a mers. Te rugăm să ieși din cont, din meniul browserului, și să încerci din nou.


tfa-row-backup-codes-title = Coduri de autentificare de rezervă
tfa-row-backup-codes-not-available = Nu sunt disponibile coduri
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } cod rămas
        [few] { $numCodesAvailable } coduri rămase
       *[other] { $numCodesAvailable } de coduri rămase
    }
tfa-row-backup-codes-get-new-cta-v2 = Creează coduri noi
tfa-row-backup-codes-add-cta = Adaugă
tfa-row-backup-codes-description-2 = Este cea mai sigură metodă de recuperare dacă nu îți poți folosi dispozitivul mobil sau aplicația de autentificare.
tfa-row-backup-phone-title-v2 = Număr de telefon de recuperare
tfa-row-backup-phone-not-available-v2 = Nu a fost adăugat niciun număr de telefon
tfa-row-backup-phone-change-cta = Modifică
tfa-row-backup-phone-add-cta = Adaugă
tfa-row-backup-phone-delete-button = Elimină
tfa-row-backup-phone-delete-title-v2 = Elimină numărul de telefon de recuperare
tfa-row-backup-phone-delete-restriction-v2 = Dacă vrei să elimini numărul de telefon de recuperare, adaugă mai întâi coduri de autentificare de rezervă sau dezactivează autentificarea în doi pași ca să eviți blocarea accesului la cont.
tfa-row-backup-phone-description-v2 = Este cea mai simplă metodă de recuperare dacă nu poți folosi aplicația de autentificare.
tfa-row-backup-phone-sim-swap-risk-link = Află despre riscul de schimbare a cartelei SIM


switch-turn-off = Oprește
switch-turn-on = Pornește
switch-submitting = Se trimite…
switch-is-on = pornit
switch-is-off = oprit


row-defaults-action-add = Adaugă
row-defaults-action-change = Modifică
row-defaults-action-disable = Dezactivează
row-defaults-status = Niciunul


rk-header-1 = Cheie de recuperare a contului
rk-enabled = Activat
rk-not-set = Nu este setată
rk-action-create = Creează
rk-action-change-button = Modifică
rk-action-remove = Elimină
rk-key-removed-2 = Cheie de recuperare a contului eliminată
rk-cannot-remove-key = Cheia de recuperare a contului nu a putut fi eliminată.
rk-refresh-key-1 = Reîmprospătează cheia de recuperare a contului
rk-content-explain = Restaurează-ți informațiile când uiți parola.
rk-cannot-verify-session-4 = Ne pare rău, a apărut o problemă la confirmarea sesiunii
rk-remove-modal-heading-1 = Elimini cheia de recuperare a contului?
rk-remove-modal-content-1 =
    Dacă îți resetezi parola, nu vei mai putea
    utiliza cheia de recuperare a contului ca să îți accesezi datele. Acțiunea este ireversibilă.
rk-remove-error-2 = Cheia de recuperare a contului nu a putut fi eliminată
unit-row-recovery-key-delete-icon-button-title = Șterge cheia de recuperare a contului


se-heading = E-mail secundar
    .header = E-mail secundar
se-cannot-refresh-email = Ne pare rău, a apărut o problemă la reîmprospătarea acestui e-mail.
se-cannot-resend-code-3 = Ne pare rău, a apărut o problemă la retrimiterea codului de confirmare
se-set-primary-successful-2 = { $email } este acum adresa ta de e-mail primară
se-set-primary-error-2 = Ne pare rău, a apărut o problemă la modificarea adresei principale de e-mail
se-delete-email-successful-2 = { $email } ștearsă cu succes
se-delete-email-error-2 = Ne pare rău, a apărut o problemă la ștergerea adresei de e-mail
se-verify-session-3 = Va trebui să îți confirmi sesiunea actuală pentru a efectua această acțiune.
se-verify-session-error-3 = Ne pare rău, a apărut o problemă la confirmarea sesiunii
se-remove-email =
    .title = Elimină adresa de e-mail
se-refresh-email =
    .title = Reîmprospătează e-mailul
se-unverified-2 = neconfirmată
se-resend-code-2 =
    Necesită confirmare. <button>Retrimite codul de confirmare</button>
    dacă nu se află în dosarul de mesaje primite sau spam.
se-make-primary = Setează ca e-mail principal
se-default-content = Accesează contul dacă nu te poți autentifica în e-mailul principal.
se-content-note-1 =
    Notă: o adresă secundară de e-mail nu îți va restabili informațiile — vei
    avea nevoie de o <a>cheie de recuperare a contului</a>.
se-secondary-email-none = Niciunul


tfa-row-header = Autentificare în doi pași
tfa-row-enabled = Activat
tfa-row-disabled-status = Dezactivat
tfa-row-action-add = Adaugă
tfa-row-action-disable = Dezactivează
tfa-row-action-change = Modifică
tfa-row-button-refresh =
    .title = Reîmprospătează autentificarea în doi pași
tfa-row-cannot-refresh =
    Ne pare rău, a apărut o problemă la reîmprospătarea
    autentificării în doi pași.
tfa-row-enabled-description = Contul este protejat prin autentificare în doi pași. Va trebui să introduci o parolă de unică folosință din aplicația de autentificare când vrei să intri în { -product-mozilla-account }.
tfa-row-enabled-info-link = Cum îți protejează contul
tfa-row-disabled-description-v2 = Securizează-ți contul utilizând o aplicație de autentificare terță ca al doilea pas pentru autentificare.
tfa-row-cannot-verify-session-4 = Ne pare rău, a apărut o problemă la confirmarea sesiunii
tfa-row-disable-modal-heading = Dezactivezi autentificarea în doi pași?
tfa-row-disable-modal-confirm = Dezactivează
tfa-row-disable-modal-explain-1 =
    Acțiunea este ireversibilă. Mai ai și
    opțiunea <linkExternal>să înlocuiești codurile de autentificare de rezervă</linkExternal>.
tfa-row-disabled-2 = Autentificare în doi pași dezactivată
tfa-row-cannot-disable-2 = Autentificarea în doi pași nu a putut fi dezactivată
tfa-row-verify-session-info = Trebuie să confirmi sesiunea curentă pentru a configura autentificarea în doi pași


terms-privacy-agreement-intro-3 = Prin continuare, ești de acord cu următoarele:
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>Condiții de utilizare</termsLink> și <privacyLink>Notificare privind confidențialitatea</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") }: <mozillaAccountsTos>Condiții de utilizare</mozillaAccountsTos> și <mozillaAccountsPrivacy>Notificare privind confidențialitatea</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = Prin continuare, ești de acord cu <mozillaAccountsTos>Condițiile de utilizare a serviciilor</mozillaAccountsTos> și <mozillaAccountsPrivacy>Notificarea privind confidențialitatea</mozillaAccountsPrivacy>.


third-party-auth-options-or = sau
third-party-auth-options-sign-in-with = Intră în cont cu
continue-with-google-button = Continuă cu { -brand-google }
continue-with-apple-button = Continuă cu { -brand-apple }


auth-error-102 = Cont necunoscut
auth-error-103 = Parolă incorectă
auth-error-105-2 = Cod de confirmare nevalid
auth-error-110 = Jeton nevalid
auth-error-114-generic = Ai încercat de prea multe ori. Te rugăm să încerci din nou mai târziu.
auth-error-114 = Ai încercat de prea multe ori. Te rugăm să încerci din nou { $retryAfter }.
auth-error-125 = Cererea a fost blocată din motive de securitate
auth-error-129-2 = Ai introdus un număr de telefon nevalid. Te rugăm să îl verifici și să încerci din nou.
auth-error-138-2 = Sesiune neconfirmată
auth-error-139 = Adresa de e-mail secundară trebuie să fie diferită de adresa de e-mail a contului
auth-error-144 = Această adresă de e-mail este rezervată de alt cont. Încearcă din nou mai târziu sau folosește altă adresă de e-mail.
auth-error-155 = Jetonul TOTP nu a fost găsit
auth-error-156 = Cod de autentificare de rezervă negăsit
auth-error-159 = Cheie nevalidă de recuperare a contului
auth-error-183-2 = Cod de confirmare nevalid sau expirat
auth-error-202 = Funcționalitate neactivată
auth-error-203 = Sistem indisponibil; încearcă din nou mai târziu
auth-error-206 = Nu se poate crea o parolă, parola este deja setată.
auth-error-214 = Numărul de telefon de recuperare există deja
auth-error-215 = Numărul de telefon de recuperare nu există
auth-error-216 = Ai atins limita pentru mesaje text
auth-error-218 = Nu se poate elimina numărul de telefon de recuperare, lipsesc codurile de autentificare de rezervă.
auth-error-219 = Acest număr de telefon a fost înregistrat cu prea multe conturi. Te rugăm să încerci alt număr.
auth-error-999 = Eroare neașteptată
auth-error-1001 = Încercare de autentificare anulată
auth-error-1002 = Sesiune expirată. Intră în cont pentru a continua.
auth-error-1003 = Stocarea locală sau cookie-urile sunt încă dezactivate
auth-error-1008 = Noua ta parolă trebuie să fie diferită
auth-error-1010 = Este necesară o parolă validă
auth-error-1011 = Este necesară o adresă de e-mail validă
auth-error-1018 = Mesajul de confirmare pe e-mail tocmai a fost returnat. Ai scris corect adresa?
auth-error-1020 = Ai scris greșit adresa de e-mail? firefox.com nu e un serviciu valid de poștă electronică
auth-error-1031 = Trebuie să introduci vârsta ca să îți faci cont
auth-error-1032 = Trebuie să introduci o vârstă validă ca să îți faci cont
auth-error-1054 = Cod de autentificare în doi pași nevalid
auth-error-1056 = Cod de autentificare de rezervă nevalid
auth-error-1062 = Redirecționare nevalidă
auth-error-1064 = Ai scris greșit adresa de e-mail? { $domain } nu e un serviciu valid de poștă electronică
auth-error-1066 = Măștile de e-mail nu pot fi folosite la creat conturi.
auth-error-1067 = Ai scris greșit adresa de e-mail?
recovery-phone-number-ending-digits = Număr care se termină în { $lastFourPhoneNumber }
oauth-error-1000 = Ceva nu a mers. Închide fila și încearcă din nou.


connect-another-device-signed-in-header = Ești autentificat(ă) în { -brand-firefox }
connect-another-device-email-confirmed-banner = Adresă de e-mail confirmată
connect-another-device-signin-confirmed-banner = Autentificare confirmată
connect-another-device-signin-to-complete-message = Autentifică-te în acest { -brand-firefox } pentru a finaliza configurarea
connect-another-device-signin-link = Intră în cont
connect-another-device-still-adding-devices-message = Încă adaugi dispozitive? Autentifică-te în { -brand-firefox } de pe alt dispozitiv pentru a finaliza configurarea
connect-another-device-signin-another-device-to-complete-message = Autentifică-te în { -brand-firefox } de pe alt dispozitiv pentru a finaliza configurarea
connect-another-device-get-data-on-another-device-message = Vrei să îți salvezi filele, marcajele și parolele pe un alt dispozitiv?
connect-another-device-cad-link = Conectează alt dispozitiv
connect-another-device-not-now-link = Nu acum
connect-another-device-android-complete-setup-message = Autentifică-te în { -brand-firefox } pentru Android pentru a finaliza configurarea
connect-another-device-ios-complete-setup-message = Autentifică-te în { -brand-firefox } pentru iOS pentru a finaliza configurarea


cookies-disabled-header = Necesită stocare locală și cookie-uri
cookies-disabled-enable-prompt-2 = Te rugăm să activezi în browser cookie-urile și stocarea locală pentru a acces la { -product-mozilla-account }. Astfel, va fi activată funcționalitatea de a ține minte contul între sesiuni.
cookies-disabled-button-try-again = Încearcă din nou
cookies-disabled-learn-more = Află mai multe


index-header = Introdu adresa ta de e-mail
index-sync-header = Continuă spre { -product-mozilla-account }
index-sync-subheader = Sincronizează-ți parolele, filele și marcajele oriunde folosești { -brand-firefox }.
index-relay-header = Creează o mască de e-mail
index-relay-subheader = Te rugăm să ne dai adresa de e-mail la care vrei să îți redirecționezi mesajele de la adresa de e-mail mascată.
index-subheader-with-servicename = Continuă cu { $serviceName }
index-subheader-default = Continuă spre setările contului
index-cta = Fă-ți un cont sau intră în cont
index-account-info = Un { -product-mozilla-account } îți deblochează și accesul la mai multe produse de la { -brand-mozilla } care îți protejează confidențialitatea.
index-email-input =
    .label = Introdu adresa ta de e-mail
index-account-delete-success = Cont șters cu succes
index-email-bounced = Mesajul de confirmare pe e-mail tocmai a fost returnat. Ai scris corect adresa?


inline-recovery-key-setup-create-error = Ups! Nu am putut crea cheia de recuperare a contului. Te rugăm să încerci mai târziu.
inline-recovery-key-setup-recovery-created = Cheia de recuperare a contului a fost creată
inline-recovery-key-setup-download-header = Securizează-ți contul
inline-recovery-key-setup-download-subheader = Descarcă și salveaz-o acum
inline-recovery-key-setup-download-info = Păstrează această cheie într-un loc pe care să îl ții minte — nu vei putea reveni la această pagină mai târziu.
inline-recovery-key-setup-hint-header = Recomandare de securitate


inline-totp-setup-cancel-setup-button = Anulează configurarea
inline-totp-setup-continue-button = Continuă
inline-totp-setup-add-security-link = Adaugă un plus de securitate contului prin solicitarea de coduri de autentificare de la una dintre aceste <authenticationAppsLink>aplicații de autentificare</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Activează autentificarea în doi pași <span>pentru a continua cu setările contului</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Activează autentificarea în doi pași <span>pentru a continua cu { $serviceName }</span>
inline-totp-setup-ready-button = Gata
inline-totp-setup-show-qr-custom-service-header-2 = Scanează codul de autentificare <span>pentru a continua cu { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Introdu manual codul <span>pentru a continua cu { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Scanează codul de autentificare <span>pentru a continua cu setările contului</span>
inline-totp-setup-no-qr-default-service-header-2 = Introdu manual codul <span>pentru a continua cu setările contului</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Tastează această cheie secretă în aplicația de autentificare. <toggleToQRButton>Scanei codul QR în schimb?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Scanează codul QR în aplicația de autentificare și apoi introdu codul de autentificare furnizat. <toggleToManualModeButton>Nu poți scana codul?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Când ai terminat, va începe să genereze coduri de autentificare pe care să le introduci.
inline-totp-setup-security-code-placeholder = Cod de autentificare
inline-totp-setup-code-required-error = Necesită cod de autentificare
tfa-qr-code-alt = Folosește codul { $code } și configurează autentificarea în doi pași în aplicațiile acceptate.
inline-totp-setup-page-title = Autentificare în doi pași


legal-header = Mențiuni legale
legal-terms-of-service-link = Condiții de utilizare a serviciilor
legal-privacy-link = Notificare privind confidențialitatea


legal-privacy-heading = Notificare privind confidențialitatea


legal-terms-heading = Condiții de utilizare a serviciilor


pair-auth-allow-heading-text = Tocmai te-ai autentificat în { -product-firefox }?
pair-auth-allow-confirm-button = Da, aprobă dispozitivul
pair-auth-allow-refuse-device-link = Dacă nu ai fost tu, <link>schimbă-ți parola</link>


pair-auth-complete-heading = Dispozitiv conectat
pair-auth-complete-now-syncing-device-text = Acum te sincronizezi cu: { $deviceFamily } pe { $deviceOS }
pair-auth-complete-sync-benefits-text = Acum poți accesa filele deschise, parolele și marcajele pe toate dispozitivele tale.
pair-auth-complete-see-tabs-button = Vezi file de pe dispozitivele sincronizate
pair-auth-complete-manage-devices-link = Gestionează dispozitivele


auth-totp-heading-w-default-service = Introdu codul de autentificare <span>pentru a continua cu setările contului</span>
auth-totp-heading-w-custom-service = Introdu codul de autentificare <span>pentru a continua cu { $serviceName }</span>
auth-totp-instruction = Deschide aplicația de autentificare și introdu codul de autentificare furnizat.
auth-totp-input-label = Introdu codul de 6 cifre
auth-totp-confirm-button = Confirmă
auth-totp-code-required-error = Necesită cod de autentificare


pair-wait-for-supp-heading-text = Acum este necesară aprobarea <span>de pe celălalt dispozitiv</span>


pair-failure-header = Asociere eșuată
pair-failure-message = Procesul de configurare a fost întrerupt.


pair-sync-header = Sincronizează { -brand-firefox } pe telefon sau tabletă
pair-cad-header = Conectează { -brand-firefox } pe alt dispozitiv
pair-already-have-firefox-paragraph = Ai deja { -brand-firefox } pe telefon sau tabletă?
pair-sync-your-device-button = Sincronizează-ți dispozitivul
pair-or-download-subheader = Sau descarcă
pair-scan-to-download-message = Scanează ca să descarci { -brand-firefox } pentru mobil sau trimite-ți un <linkExternal>link de descărcare</linkExternal>.
pair-not-now-button = Nu acum
pair-take-your-data-message = Ia cu tine filele, marcajele și parolele oriunde folosești { -brand-firefox }.
pair-get-started-button = Începe
pair-qr-code-aria-label = Cod QR


pair-success-header-2 = Dispozitiv conectat
pair-success-message-2 = Asociere reușită.


pair-supp-allow-heading-text = Confirmă asocierea <span>pentru { $email }</span>
pair-supp-allow-confirm-button = Confirmă asocierea
pair-supp-allow-cancel-link = Anulează


pair-wait-for-auth-heading-text = Acum este necesară aprobarea <span>de pe celălalt dispozitiv</span>


pair-unsupported-header = Asociere folosind o aplicație
pair-unsupported-message = Ai folosit camera sistemului? Trebuie să efectuezi o asociere dintr-o aplicație { -brand-firefox }.




set-password-heading-v2 = Creează o parolă pentru sincronizare
set-password-info-v2 = Îți criptează datele. Trebuie să fie diferită de parola contului { -brand-google } sau { -brand-apple }.


third-party-auth-callback-message = Te rugăm să aștepți, ești redirecționat(ă) către aplicația autorizată.


account-recovery-confirm-key-heading = Introdu cheia de recuperare a contului
account-recovery-confirm-key-instruction = Cheia recuperează datele de navigare criptate, cum ar fi parolele și marcajele, de pe serverele { -brand-firefox }.
account-recovery-confirm-key-input-label =
    .label = Introdu cheia de recuperare a contului din 32 de caractere
account-recovery-confirm-key-hint = Sugestia ta de stocare:
account-recovery-confirm-key-button-2 = Continuă
account-recovery-lost-recovery-key-link-2 = Nu găsești cheia de recuperare a contului?


complete-reset-pw-header-v2 = Creează o parolă nouă
complete-reset-password-success-alert = Parolă setată
complete-reset-password-error-alert = Ne pare rău, a apărut o problemă la setarea parolei
complete-reset-pw-recovery-key-link = Folosește cheia de recuperare a contului
reset-password-complete-banner-heading = Parola a fost resetată.
reset-password-complete-banner-message = Nu uita să generezi o cheie nouă de recuperare a contului din setările { -product-mozilla-account } pentru a preveni viitoare probleme la intrarea în cont.
complete-reset-password-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.


confirm-backup-code-reset-password-input-label = Introdu codul de 10 caractere
confirm-backup-code-reset-password-confirm-button = Confirmă
confirm-backup-code-reset-password-subheader = Introdu codul de autentificare de rezervă
confirm-backup-code-reset-password-instruction = Introdu unul dintre codurile de unică folosință pe care le-ai salvat când ai configurat autentificarea în doi pași.
confirm-backup-code-reset-password-locked-out-link = Ți-ai blocat accesul la cont?


confirm-reset-password-with-code-heading = Verifică-ți e-mailul
confirm-reset-password-with-code-instruction = Am trimis un cod de confirmare la adresa <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Introdu în 10 minute codul din 8 cifre
confirm-reset-password-otp-submit-button = Continuă
confirm-reset-password-otp-resend-code-button = Retrimite codul
confirm-reset-password-otp-different-account-link = Folosește alt cont


confirm-totp-reset-password-header = Resetează-ți parola
confirm-totp-reset-password-subheader-v2 = Introdu codul de autentificare în doi pași
confirm-totp-reset-password-instruction-v2 = Verifică-ți <strong>aplicația de autentificare</strong> pentru resetarea parolei.
confirm-totp-reset-password-trouble-code = Ai probleme cu introducerea codului?
confirm-totp-reset-password-confirm-button = Confirmă
confirm-totp-reset-password-input-label-v2 = Introdu codul de 6 cifre
confirm-totp-reset-password-use-different-account = Folosește alt cont


password-reset-flow-heading = Resetează-ți parola
password-reset-body-2 =
    Te vom întreba câteva chestii pe care numai tu le știi ca să îți menținem contul
    în siguranță.
password-reset-email-input =
    .label = Introdu adresa de e-mail
password-reset-submit-button-2 = Continuă


reset-password-complete-header = Parola a fost resetată
reset-password-confirmed-cta = Continuă cu { $serviceName }




password-reset-recovery-method-header = Resetează-ți parola
password-reset-recovery-method-subheader = Alege o metodă de recuperare
password-reset-recovery-method-details = Hai să ne asigurăm că tu folosești metodele de recuperare.
password-reset-recovery-method-phone = Număr de telefon de recuperare
password-reset-recovery-method-code = Coduri de autentificare de rezervă
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $count } cod rămas
        [few] { $count } coduri rămase
       *[other] { $count } de coduri rămase
    }
password-reset-recovery-method-send-code-error-heading = A apărut o problemă la trimiterea unui cod către numărul tău de telefon de recuperare
password-reset-recovery-method-send-code-error-description = Te rugăm să încerci din nou mai târziu sau să folosești codurile de autentificare de rezervă.


reset-password-recovery-phone-flow-heading = Resetează-ți parola
reset-password-recovery-phone-heading = Introdu codul de recuperare
reset-password-recovery-phone-instruction-v3 = A fost trimis prin SMS un cod de 6 cifre la numărul de telefon care se termină în <span>{ $lastFourPhoneDigits }</span>. Codul expiră după 5 minute. Nu distribui acest cod nimănui.
reset-password-recovery-phone-input-label = Introdu codul de 6 cifre
reset-password-recovery-phone-code-submit-button = Confirmă
reset-password-recovery-phone-resend-code-button = Retrimite codul
reset-password-recovery-phone-resend-success = Cod trimis
reset-password-recovery-phone-locked-out-link = Ți-ai blocat accesul la cont?
reset-password-recovery-phone-send-code-error-heading = A apărut o problemă la trimiterea unui cod
reset-password-recovery-phone-code-verification-error-heading = A apărut o problemă la verificarea codului
reset-password-recovery-phone-general-error-description = Te rugăm să încerci mai târziu.
reset-password-recovery-phone-invalid-code-error-description = Codul este nevalid sau expirat.
reset-password-recovery-phone-invalid-code-error-link = Folosești în schimb coduri de autentificare de rezervă?
reset-password-with-recovery-key-verified-page-title = Parolă resetată cu succes
reset-password-complete-new-password-saved = Parolă nouă salvată!
reset-password-complete-recovery-key-created = Cheia nouă de recuperare a contului a fost creată. Descarc-o și salveaz-o acum.
reset-password-complete-recovery-key-download-info =
    Cheia este esențială pentru
    recuperarea datelor în caz că uiți parola. <b>Descarc-o acum și salveaz-o în siguranță
    pentru că nu vei mai avea acces mai târziu la această pagină.</b>


error-label = Eroare:
validating-signin = Se validează autentificarea în cont…
complete-signin-error-header = Eroare de confirmare
signin-link-expired-header = Link de confirmare expirat
signin-link-expired-message-2 = Linkul pe care ai dat clic a expirat sau a fost deja utilizat.


signin-password-needed-header-2 = Introdu parola <span> pentru contul { -product-mozilla-account }</span>
signin-subheader-without-logo-with-servicename = Continuă cu { $serviceName }
signin-subheader-without-logo-default = Continuă spre setările contului
signin-button = Intră în cont
signin-header = Intră în cont
signin-use-a-different-account-link = Folosește alt cont
signin-forgot-password-link = Ți-ai uitat parola?
signin-password-button-label = Parolă
signin-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.
signin-code-expired-error = Codul a expirat. Te rugăm să intri din nou în cont.
signin-account-locked-banner-heading = Resetează-ți parola
signin-account-locked-banner-description = Ți-am blocat contul pentru a-l proteja de activități suspecte.
signin-account-locked-banner-link = Resetează-ți parola ca să intri în cont


report-signin-link-damaged-body = Linkul pe care ai dat clic avea caractere lipsă și este posibil să fi fost corupt de către clientul de e-mail. Copiază adresa cu grijă și încearcă din nou.
report-signin-header = Raportezi autentificarea neautorizată?
report-signin-body = Ai primit un mesaj pe e-mail cu privire la o tentativă de acces la cont. Vrei să raportezi activitatea ca suspicioasă?
report-signin-submit-button = Raportează activitatea
report-signin-support-link = De ce s-a întâmplat asta?
report-signin-error = Ne pare rău, a apărut o problemă la trimiterea raportului.
signin-bounced-header = Ne pare rău. Ți-am blocat contul.
signin-bounced-message = Mesajul de confirmare trimis pe e-mail la { $email } a fost returnat și ți-am blocat contul pentru a-ți proteja datele { -brand-firefox }.
signin-bounced-help = Dacă este o adresă de e-mail validă, <linkExternal>anunță-ne</linkExternal> și te putem ajuta să-ți deblochezi contul.
signin-bounced-create-new-account = Nu mai deții adresa de e-mail? Creează un cont nou
back = Înapoi


signin-push-code-heading-w-default-service = Verifică această autentificare în cont <span>pentru a continua cu setările contului</span>
signin-push-code-heading-w-custom-service = Verifică această autentificare în cont <span>pentru a continua cu { $serviceName }</span>
signin-push-code-instruction = Te rugăm să verifici celelalte dispozitive și să aprobi această autentificare în cont din browserul { -brand-firefox }.
signin-push-code-did-not-recieve = Nu ai primit notificarea?
signin-push-code-send-email-link = Trimite codul pe e-mail


signin-push-code-confirm-instruction = Confirmă intrarea în cont
signin-push-code-confirm-description = Am depistat o tentativă de intrare în cont de pe următorul dispozitiv. Dacă ai fost tu, te rugăm să aprobi autentificarea în cont
signin-push-code-confirm-verifying = Se verifică
signin-push-code-confirm-login = Confirmă intrarea în cont
signin-push-code-confirm-wasnt-me = Nu am fost eu. Schimbă parola.
signin-push-code-confirm-login-approved = Intrarea în cont a fost aprobată. Te rugăm să închizi această fereastră.
signin-push-code-confirm-link-error = Linkul este corupt. Te rugăm să încerci din nou.


signin-recovery-method-header = Intră în cont
signin-recovery-method-subheader = Alege o metodă de recuperare
signin-recovery-method-details = Hai să ne asigurăm că tu folosești metodele de recuperare.
signin-recovery-method-phone = Număr de telefon de recuperare
signin-recovery-method-code-v2 = Coduri de autentificare de rezervă
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } cod rămas
        [few] { $numBackupCodes } coduri rămase
       *[other] { $numBackupCodes } de coduri rămase
    }
signin-recovery-method-send-code-error-heading = A apărut o problemă la trimiterea unui cod către numărul tău de telefon de recuperare
signin-recovery-method-send-code-error-description = Te rugăm să încerci din nou mai târziu sau să folosești codurile de autentificare de rezervă.


signin-recovery-code-heading = Intră în cont
signin-recovery-code-sub-heading = Introdu codul de autentificare de rezervă
signin-recovery-code-instruction-v3 = Introdu unul dintre codurile de unică folosință pe care le-ai salvat când ai configurat autentificarea în doi pași.
signin-recovery-code-input-label-v2 = Introdu codul de 10 caractere
signin-recovery-code-confirm-button = Confirmă
signin-recovery-code-phone-link = Folosește numărul de telefon de recuperare
signin-recovery-code-support-link = Ți-ai blocat accesul la cont?
signin-recovery-code-required-error = Necesită cod de autentificare de rezervă
signin-recovery-code-use-phone-failure = A apărut o problemă la trimiterea unui cod către numărul tău de telefon de recuperare
signin-recovery-code-use-phone-failure-description = Te rugăm să încerci mai târziu.


signin-recovery-phone-flow-heading = Intră în cont
signin-recovery-phone-heading = Introdu codul de recuperare
signin-recovery-phone-instruction-v3 = A fost trimis prin SMS un cod de 6 cifre la numărul de telefon care se termină în <span>{ $lastFourPhoneDigits }</span>. Codul expiră după 5 minute. Nu distribui acest cod nimănui.
signin-recovery-phone-input-label = Introdu codul de 6 cifre
signin-recovery-phone-code-submit-button = Confirmă
signin-recovery-phone-resend-code-button = Retrimite codul
signin-recovery-phone-resend-success = Cod trimis
signin-recovery-phone-locked-out-link = Ți-ai blocat accesul la cont?
signin-recovery-phone-send-code-error-heading = A apărut o problemă la trimiterea unui cod
signin-recovery-phone-code-verification-error-heading = A apărut o problemă la verificarea codului
signin-recovery-phone-general-error-description = Te rugăm să încerci mai târziu.
signin-recovery-phone-invalid-code-error-description = Codul este nevalid sau expirat.
signin-recovery-phone-invalid-code-error-link = Folosești în schimb coduri de autentificare de rezervă?
signin-recovery-phone-success-message = Autentificare cu succes. Este posibil să se aplice limite dacă îți folosești iar numărul de telefon de recuperare.


signin-reported-header = Îți mulțumim pentru vigilență
signin-reported-message = Echipa noastră a fost notificată. Raporturi precum acestea ne ajută să ținem departe intrușii.


signin-token-code-heading-2 = Introdu codul de confirmare<span> pentru contul { -product-mozilla-account }</span>
signin-token-code-instruction-v2 = Introdu în 5 minute codul trimis la <email>{ $email }</email>.
signin-token-code-input-label-v2 = Introdu codul de 6 cifre
signin-token-code-confirm-button = Confirmă
signin-token-code-code-expired = A expirat codul?
signin-token-code-resend-code-link = Trimite un cod nou pe e-mail.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Trimite codul nou prin e-mail în { $seconds } secundă
        [few] Trimite codul nou prin e-mail în { $seconds } secunde
       *[other] Trimite codul nou prin e-mail în { $seconds } de secunde
    }
signin-token-code-required-error = Necesită cod de confirmare
signin-token-code-resend-error = Ceva nu a mers bine. Nu s-a putut trimite un cod nou.
signin-token-code-instruction-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.


signin-totp-code-header = Intră în cont
signin-totp-code-subheader-v2 = Introdu codul de autentificare în doi pași
signin-totp-code-instruction-v4 = Verifică-ți <strong>aplicația de autentificare</strong> pentru confirmarea intrării în cont.
signin-totp-code-input-label-v4 = Introdu codul de 6 cifre
signin-totp-code-aal-banner-header = De ce ți se cere să te autentifici?
signin-totp-code-aal-banner-content = Ai configurat autentificarea în doi pași în cont, dar nu te-ai conectat încă cu un cod pe acest dispozitiv.
signin-totp-code-aal-sign-out = Ieși din cont pe acest dispozitiv
signin-totp-code-aal-sign-out-error = Ne pare rău, a apărut o problemă la ieșirea din cont
signin-totp-code-confirm-button = Confirmă
signin-totp-code-other-account-link = Folosește un alt cont
signin-totp-code-recovery-code-link = Ai probleme cu introducerea codului?
signin-totp-code-required-error = Necesită cod de autentificare
signin-totp-code-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.


signin-unblock-header = Autorizează această autentificare
signin-unblock-body = Verifică-ți căsuța de e-mail pentru codul de autorizare trimis către { $email }.
signin-unblock-code-input = Introdu codul de autorizare
signin-unblock-submit-button = Continuă
signin-unblock-code-required-error = Necesită cod de autorizare
signin-unblock-code-incorrect-length = Codul de autorizare trebuie să conțină 8 caractere
signin-unblock-code-incorrect-format-2 = Codul de autorizare poate conține doar litere și/sau cifre
signin-unblock-resend-code-button = Nu e în căsuța poștală sau în dosarul de spam? Retrimite
signin-unblock-support-link = De ce s-a întâmplat asta?
signin-unblock-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.




confirm-signup-code-page-title = Introdu codul de confirmare
confirm-signup-code-heading-2 = Introdu codul de confirmare <span>pentru contul { -product-mozilla-account }</span>
confirm-signup-code-instruction-v2 = Introdu în 5 minute codul trimis la <email>{ $email }</email>.
confirm-signup-code-input-label = Introdu codul de 6 cifre
confirm-signup-code-confirm-button = Confirmă
confirm-signup-code-sync-button = Începe sincronizarea
confirm-signup-code-code-expired = A expirat codul?
confirm-signup-code-resend-code-link = Trimite codul nou prin e-mail.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Trimite codul nou prin e-mail în { $seconds } secundă
        [few] Trimite codul nou prin e-mail în { $seconds } secunde
       *[other] Trimite codul nou prin e-mail în { $seconds } de secunde
    }
confirm-signup-code-success-alert = Cont confirmat cu succes
confirm-signup-code-is-required-error = Necesită cod de confirmare
confirm-signup-code-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.


signup-heading-v2 = Creează o parolă
signup-relay-info = Necesită parolă pentru gestionarea în siguranță a adreselor de e-mail mascate și pentru accesarea instrumentelor de securitate { -brand-mozilla }.
signup-sync-info = Sincronizează-ți parolele, marcajele și multe altele oriunde folosești { -brand-firefox }.
signup-sync-info-with-payment = Sincronizează-ți parolele, metodele de plată, marcajele și multe altele oriunde folosești { -brand-firefox }.
signup-change-email-link = Schimbă e-mailul


signup-confirmed-sync-header = Sincronizarea este activată
signup-confirmed-sync-success-banner = { -product-mozilla-account } confirmat
signup-confirmed-sync-button = Începe să navighezi
signup-confirmed-sync-description-with-payment-v2 = Parolele, metodele de plată, adresele, marcajele, istoricul și multe altele se pot sincroniza oriunde folosești { -brand-firefox }.
signup-confirmed-sync-description-v2 = Parolele, adresele, marcajele, istoricul și multe altele se pot sincroniza oriunde folosești { -brand-firefox }.
signup-confirmed-sync-add-device-link = Adaugă alt dispozitiv
signup-confirmed-sync-manage-sync-button = Gestionează sincronizarea
signup-confirmed-sync-set-password-success-banner = Parola de sincronizare a fost creată
