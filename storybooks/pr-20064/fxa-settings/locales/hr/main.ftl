



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox računi
-product-mozilla-account = Mozilla račun
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Mozilla računi
       *[lowercase] Mozilla računi
    }
-product-firefox-account = Firefox račun
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla centri
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

app-general-err-heading = Opća greška programa
app-general-err-message = Nešto nije u redu. Pokušaj kasnije ponovo.
app-query-parameter-err-heading = Loš zahtjev: nevažeći parametri upita


app-footer-mozilla-logo-label = { -brand-mozilla } logotip
app-footer-privacy-notice = Napomena o privatnosti web stranice
app-footer-terms-of-service = Uvjeti usluge


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Otvara se u novom prozoru


app-loading-spinner-aria-label-loading = Učitavanje …


app-logo-alt-3 =
    .alt = { -brand-mozilla } m logotip



resend-code-success-banner-heading = Na tvoju e-mail adresu je poslan novi kod.
resend-link-success-banner-heading = Na tvoju e-mail adresu je poslana nova poveznica.
resend-success-banner-description = Dodaj { $accountsEmail } svojim kontaktima kako bi se osigurala ispravna isporuka.


brand-banner-dismiss-button-2 =
    .aria-label = Zatvori natpis
brand-prelaunch-title = { -product-firefox-accounts } će se preimenovati u { -product-mozilla-accounts } 1. studenoga
brand-prelaunch-subtitle = I dalje ćeš se prijavljivati s istim korisničkim imenom i lozinkom i ništa se neće promijeniti u proizvodima koje koristiš.
brand-postlaunch-title = Preimenovali smo { -product-firefox-accounts } u { -product-mozilla-accounts }. I dalje ćeš se prijavljivati s istim korisničkim imenom i lozinkom te nema drugih promjena u proizvodima koje koristiš.
brand-learn-more = Saznaj više
brand-close-banner =
    .alt = Zatvori natpis
brand-m-logo =
    .alt = { -brand-mozilla } m logotip


button-back-aria-label = Natrag
button-back-title = Natrag


recovery-key-download-button-v3 = Preuzmi i nastavi
    .title = Preuzmi i nastavi
recovery-key-pdf-heading = Ključ za obnavljanje računa
recovery-key-pdf-download-date = Stvoreno: { $date }
recovery-key-pdf-key-legend = Ključ za obnavljanje računa
recovery-key-pdf-instructions = Ovaj ključ omogućuje obnavljanje šifriranih podataka preglednika (uključujući lozinke, zabilješke i povijest) ako zaboraviš lozinku. Spremi ga na mjesto kojeg ćeš se sjećati.
recovery-key-pdf-storage-ideas-heading = Mjesta za spremanje tvog ključa
recovery-key-pdf-support = Saznaj više o ključu za obnavljanje računa
recovery-key-pdf-download-error = Žao nam je. Došlo je do greške prilikom preuzimanja ključa za obnavljanje računa.


choose-newsletters-prompt-2 = Dobij više uz { -brand-mozilla }:
choose-newsletters-option-latest-news =
    .label = Dobij naše najnovije vijesti i aktualiziranja proizvoda
choose-newsletters-option-test-pilot =
    .label = Rani pristup za testiranje novih proizvoda
choose-newsletters-option-reclaim-the-internet =
    .label = Upozorenja radnji za vraćanje interneta


datablock-download =
    .message = Preuzeto
datablock-copy =
    .message = Kopirano
datablock-print =
    .message = Ispisano


datablock-copy-success =
    { $count ->
        [one] kod kopiran
        [few] koda kopirana
       *[other] kodova kopirano
    }
datablock-download-success =
    { $count ->
        [one] kod preuzet
        [few] koda preuzeta
       *[other] kodova preuzeto
    }
datablock-print-success =
    { $count ->
        [one] kod ispisan
        [few] koda ispisana
       *[other] kodova ispisao
    }


datablock-inline-copy =
    .message = Kopirano


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (procijenjeno)
device-info-block-location-region-country = { $region }, { $country } (procijenjeno)
device-info-block-location-city-country = { $city }, { $country } (procijenjeno)
device-info-block-location-country = { $country } (procijenjeno)
device-info-block-location-unknown = Lokacija nije poznata
device-info-browser-os = { $browserName } na { $genericOSName }
device-info-ip-address = IP adresa: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Lozinka
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ponovi lozinku
form-password-with-inline-criteria-signup-submit-button = Otvori račun
form-password-with-inline-criteria-reset-new-password =
    .label = Nova lozinka
form-password-with-inline-criteria-confirm-password =
    .label = Potvrdi lozinku
form-password-with-inline-criteria-reset-submit-button = Stvori novu lozinku
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Lozinka
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Ponovi lozinku
form-password-with-inline-criteria-set-password-submit-button = Započni sinkronizaciju
form-password-with-inline-criteria-match-error = Lozinke se ne podudaraju
form-password-with-inline-criteria-sr-too-short-message = Lozinka mora sadržati barem 8 znakova.
form-password-with-inline-criteria-sr-not-email-message = Lozinka ne smije sadržati tvoju e-mail adresu.
form-password-with-inline-criteria-sr-not-common-message = Lozinka ne smije biti često korištena lozinka.
form-password-with-inline-criteria-sr-requirements-met = Upisana lozinka poštuje sve zahtjeve za lozinku.
form-password-with-inline-criteria-sr-passwords-match = Upisane lozinke se podudaraju.


form-verify-code-default-error = Ovo je obavezno polje


form-verify-totp-disabled-button-title-numeric = Upiši { $codeLength }-znamenkasti kod
form-verify-totp-disabled-button-title-alphanumeric = Upiši { $codeLength }-znakovni kod


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Ključ za obnavljanje { -brand-firefox } računa
get-data-trio-title-backup-verification-codes = Rezervni kodovi za autentifikaciju
get-data-trio-download-2 =
    .title = Preuzmi
    .aria-label = Preuzmi
get-data-trio-copy-2 =
    .title = Kopiraj
    .aria-label = Kopiraj
get-data-trio-print-2 =
    .title = Ispiši
    .aria-label = Ispiši


alert-icon-aria-label =
    .aria-label = Upozorenje
icon-attention-aria-label =
    .aria-label = Pažnja
icon-warning-aria-label =
    .aria-label = Upozorenje
authenticator-app-aria-label =
    .aria-label = Aplikacija za autentifikaciju
backup-codes-icon-aria-label-v2 =
    .aria-label = Rezervni kodovi za autentifikaciju aktivirani
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Rezervni kodovi za autentifikaciju deaktivirani
backup-recovery-sms-icon-aria-label =
    .aria-label = Obnavljanje SMS-om aktivirano
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Obnavljanje SMS-om deaktivirano
canadian-flag-icon-aria-label =
    .aria-label = Kanadska zastava
checkmark-icon-aria-label =
    .aria-label = Kvačica
checkmark-success-icon-aria-label =
    .aria-label = Uspjeh
checkmark-enabled-icon-aria-label =
    .aria-label = Aktivirano
close-icon-aria-label =
    .aria-label = Zatvori poruku
code-icon-aria-label =
    .aria-label = Kod
error-icon-aria-label =
    .aria-label = Greška
info-icon-aria-label =
    .aria-label = Informacije
usa-flag-icon-aria-label =
    .aria-label = Zastava Sjedinjenih Američkih Država


hearts-broken-image-aria-label =
    .aria-label = Računalo i mobitel sa slikom slomljenog srca
hearts-verified-image-aria-label =
    .aria-label = Računalo i mobitel sa slikom pulsirajućeg srca
signin-recovery-code-image-description =
    .aria-label = Dokument koji sadrži skriveni tekst.
signin-totp-code-image-label =
    .aria-label = Uređaj sa skrivenim 6-znamenkastim kodom.
confirm-signup-aria-label =
    .aria-label = Kuverta koja sadrži poveznicu
security-shield-aria-label =
    .aria-label = Ilustracija za ključ za obnavljanje računa.
recovery-key-image-aria-label =
    .aria-label = Ilustracija za ključ za obnavljanje računa.
password-image-aria-label =
    .aria-label = Ilustracija za tipkanje lozinke.
lightbulb-aria-label =
    .aria-label = Ilustracija za stvaranje savjeta za spremanje ključa.
email-code-image-aria-label =
    .aria-label = Ilustracija za e-mail koji sadrži kod.
recovery-phone-image-description =
    .aria-label = Mobilni uređaj koji prima kod putem SMS poruke.
recovery-phone-code-image-description =
    .aria-label = Kod je primljen na mobilnom uređaju.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilni uređaj s mogućnostima slanja SMS poruka
backup-authentication-codes-image-aria-label =
    .aria-label = Ekran uređaja s kodovima
sync-clouds-image-aria-label =
    .aria-label = Oblaci s ikonom sinkronizacije
confetti-falling-image-aria-label =
    .aria-label = Animirani padajući konfeti


inline-recovery-key-setup-signed-in-firefox-2 = Prijavljen/na si na { -brand-firefox }.
inline-recovery-key-setup-create-header = Zaštiti svoj račun
inline-recovery-key-setup-start-button = Stvori ključ za obnavljanje računa
inline-recovery-key-setup-later-button = Učini to kasnije


input-password-hide = Sakrij lozinku
input-password-show = Prikaži lozinku
input-password-hide-aria-2 = Tvoja je lozinka trenutačno vidljiva na ekranu.
input-password-show-aria-2 = Tvoja je lozinka trenutačno skrivena.
input-password-sr-only-now-visible = Tvoja je lozinka sada vidljiva na ekranu.
input-password-sr-only-now-hidden = Tvoja je lozinka sada skrivena.


input-phone-number-country-list-aria-label = Odaberi zemlju
input-phone-number-enter-number = Upiši broj telefona
input-phone-number-country-united-states = Sjedinjene Američke Države
input-phone-number-country-canada = Kanada
legal-back-button = Natrag


reset-pwd-link-damaged-header = Poveznica za resetiranje lozinke je oštećena
signin-link-damaged-header = Poveznica potvrde je oštećena
report-signin-link-damaged-header = Poveznica je oštećena
reset-pwd-link-damaged-message = Poveznici na koju si kliknuo/la nedostaju neki znakovi ili ju je tvoj klijent e-pošte pokvario. Kopiraj poveznicu i pokušaj ponovo.


link-expired-new-link-button = Primi novu poveznicu


remember-password-text = Zapamtiti tvoju lozinku?
remember-password-signin-link = Prijavi se


primary-email-confirmation-link-reused = Primarna e-mail adresa je već potvrđena
signin-confirmation-link-reused = Prijava je već potvrđena
confirmation-link-reused-message = Ta poveznica za potvrdu već je korištena i može se koristiti samo jednom.


locale-toggle-select-label = Odaberi jezik
locale-toggle-browser-default = Zadana postavka preglednika
error-bad-request = Neispravan zahtjev


password-info-balloon-why-password-info = Ovu lozinku trebaš za pristup svim šifriranim podacima koje kod nas spremaš.
password-info-balloon-reset-risk-info = Resetiranje znači potencijalno gubljenje podataka poput lozinki i zabilješki.


password-strength-short-instruction = Odaberi snažnu lozinku:
password-strength-inline-min-length = Barem 8 znakova
password-strength-inline-not-email = Nije tvoja e-mail adresa
password-strength-inline-not-common = Nije često korištena lozinka
password-strength-inline-confirmed-must-match = Potvrda odgovara novoj lozinci
password-strength-inline-passwords-match = Lozinke se podudaraju


account-recovery-notification-cta = Stvori
recovery-phone-promo-cta = Dodaj telefonski broj za obnavljanje
recovery-phone-promo-heading = Dodaj dodatnu zaštitu svom računu pomoću telefona za oporavak
promo-banner-dismiss-button =
    .aria-label = Ukloni natpis


ready-complete-set-up-instruction = Završi postavljanje upisom tvoje nove lozinke na tvojim drugim { -brand-firefox } uređajima.
manage-your-account-button = Upravljaj svojim računom
ready-use-service = Sada možeš koristiti { $serviceName }
ready-use-service-default = Sada možeš koristiti postavke računa
ready-account-ready = Tvoj je račun spreman!
ready-continue = Nastavi
sign-in-complete-header = Prijava je potvrđena
sign-up-complete-header = Račun potvrđen
primary-email-verified-header = Primarna e-mail adresa potvrđena


flow-recovery-key-download-storage-ideas-heading-v2 = Mjesta za spremanje tvog ključa:
flow-recovery-key-download-storage-ideas-folder-v2 = Mapa na sigurnom uređaju
flow-recovery-key-download-storage-ideas-cloud = Pouzdano spremište u oblaku
flow-recovery-key-download-storage-ideas-print-v2 = Ispisan fizički primjerak
flow-recovery-key-download-storage-ideas-pwd-manager = Upravljač lozinki


flow-recovery-key-hint-header-v2 = Dodaj savjet za pronalaženje ključa
flow-recovery-key-hint-input-v2 =
    .label = Upiši savjet (opcionalno)
flow-recovery-key-hint-cta-text = Završi
flow-recovery-key-hint-char-limit-error = Savjet mora sadržati manje od 255 znakova.


password-reset-warning-icon = Upozorenje
password-reset-chevron-expanded = Sklopi upozorenje
password-reset-chevron-collapsed = Rasklopi upozorenje
password-reset-data-may-not-be-recovered = Podaci tvog preglednika se možda neće oporaviti
password-reset-previously-signed-in-device-2 = Imaš neki uređaj na kojem si se prethodno prijavio/la?
password-reset-warning-have-key = Imaš ključ za obnavljanje računa?
password-reset-warning-use-key-link = Upotrijebi ga sada za ponovno postavljanje lozinke i zadržavanje podataka


alert-bar-close-message = Zatvori poruku


avatar-your-avatar =
    .alt = Tvoj avatar
avatar-default-avatar =
    .alt = Zadani avatar




bento-menu-title-3 = { -brand-mozilla } proizvodi
bento-menu-tagline = Daljnji { -brand-mozilla } proizvodi koji štite tvoju privatnost
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Preglednik { -brand-firefox } za računala
bento-menu-firefox-mobile = Preglednik { -brand-firefox } za mobilne uređaje
bento-menu-made-by-mozilla = Stvorila { -brand-mozilla }


connect-another-fx-mobile = Nabavi { -brand-firefox } na mobitelu ili tabletu
connect-another-find-fx-mobile-2 = Pronađi { -brand-firefox } u { -google-play } i { -app-store }.
connect-another-play-store-image-2 =
    .alt = Preuzmi { -brand-firefox } na { -google-play }
connect-another-app-store-image-3 =
    .alt = Preuzmi { -brand-firefox } na { -app-store }


cs-heading = Povezane usluge
cs-description = Sve što koristiš i gdje je tvoj račun prijavljen.
cs-cannot-refresh =
    Žao nam je. Došlo je do greške prilikom osvježavanja popisa
    povezanih usluga.
cs-cannot-disconnect = Klijent nije pronađen; nije moguće prekinuti vezu
cs-logged-out-2 = Odjavljen/a si s usluge { $service }
cs-refresh-button =
    .title = Osvježi povezane usluge
cs-missing-device-help = Nedostajuće ili duplicirane stavke?
cs-disconnect-sync-heading = Prekini vezu sa Syncom


cs-disconnect-sync-content-3 =
    Tvoji podaci pregledavanja će ostati na tvom <span>{ $device }</span> uređaju,
     ali se više neće sinkronizirati s tvojim računom.
cs-disconnect-sync-reason-3 = Koji je glavni razlog za odspajanje <span>{ $device }</span> uređaja?


cs-disconnect-sync-opt-prefix = Uređaj je:
cs-disconnect-sync-opt-suspicious = Sumnjivo
cs-disconnect-sync-opt-lost = Izgubljeno ili ukradeno
cs-disconnect-sync-opt-old = Staro ili zamijenjeno
cs-disconnect-sync-opt-duplicate = Duplikat
cs-disconnect-sync-opt-not-say = Ne želim reći


cs-disconnect-advice-confirm = U redu, razumijem
cs-disconnect-lost-advice-heading = Prekinuta veza s izgubljenim ili ukradenim uređajem
cs-disconnect-suspicious-advice-heading = Prekinuta veza sa sumnjivim uređajem
cs-sign-out-button = Odjava


dc-heading = Prikupljanje i upotreba podataka
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } preglednik
dc-subheader-content-2 = Dozvoli da { -product-mozilla-accounts } šalju tehničke podatke i podatke o interakciji na { -brand-mozilla }.
dc-opt-out-success-2 = Isključivanje uspjelo. { -product-mozilla-accounts } neće slati tehničke podatke ili podatke o interakciji na { -brand-mozilla }.
dc-opt-in-success-2 = Hvala! Dijeljenje ovih podataka nam pomaže poboljšati { -product-mozilla-accounts }.
dc-learn-more = Saznaj više


drop-down-menu-title-2 = Izbornik za { -product-mozilla-account }
drop-down-menu-signed-in-as-v2 = Prijavljen/a si kao
drop-down-menu-sign-out = Odjava
drop-down-menu-sign-out-error-2 = Žao nam je. Došlo je do greške prilikom odjave


flow-container-back = Natrag


flow-recovery-key-confirm-pwd-heading-v2 = Iz sigurnosnih razloga ponovo upiši lozinku
flow-recovery-key-confirm-pwd-input-label = Upiši lozinku
flow-recovery-key-confirm-pwd-submit-button = Stvori ključ za obnavljanje računa
flow-recovery-key-confirm-pwd-submit-button-change-key = Stvori novi ključ za obnavljanje računa


flow-recovery-key-download-heading-v2 = Ključ za obnavljanje računa je stvoren – preuzmi i spremi ga sada
flow-recovery-key-download-next-link-v2 = Nastavi bez preuzimanja


flow-recovery-key-success-alert = Ključ za obnavljanje računa je stvoren


flow-recovery-key-info-header-change-key = Promijeni ključ za obnavljanje računa
flow-recovery-key-info-cta-text-v3 = Započni
flow-recovery-key-info-cancel-link = Odustani


flow-setup-2fa-qr-heading = Poveži se s aplikacijom za autentifikaciju
flow-setup-2fa-cant-scan-qr-button = Ne možeš snimiti QR kod?
flow-setup-2fa-manual-key-heading = Upiši kod ručno
flow-setup-2fa-scan-qr-instead-button = Umjesto toga snimiti QR kod?
flow-setup-2fa-button = Nastavi


flow-setup-2fa-backup-choice-phone-title = Telefon za oporavak
flow-setup-2fa-backup-choice-phone-badge = Najjednostavnije
flow-setup-2fa-backup-choice-code-badge = Najsigurnije


flow-setup-2fa-backup-code-confirm-code-input = Upiši deseteroznamenkasti kod
flow-setup-2fa-backup-code-confirm-button-finish = Završi


flow-setup-2fa-backup-code-dl-button-continue = Nastavi


flow-setup-2fa-inline-complete-success-banner = Dvofaktorska autentifikacija je omogućena
flow-setup-2fa-inline-complete-backup-code = Autentifikacijski kodovi za sigurnosno kopiranje
flow-setup-2fa-inline-complete-backup-phone = Telefon za oporavak
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Preostao je { $count } kod
        [few] Preostala su { $count } koda
       *[other] Preostalo je { $count } kodova
    }


flow-setup-phone-confirm-code-input-label = Upiši šesteroznamenkasti kod
flow-setup-phone-confirm-code-button = Potvrdi
flow-setup-phone-confirm-code-expired = Kod je istekao?
flow-setup-phone-confirm-code-resend-code-button = Ponovo pošalji kod
flow-setup-phone-confirm-code-resend-code-success = Kod je poslan
flow-setup-phone-confirm-code-success-message-v2 = Telefonski broj za oporavak je dodan
flow-change-phone-confirm-code-success-message = Telefonski broj za oporavak je promijenjen


flow-setup-phone-submit-number-heading = Potvrdi svoj broj telefona
flow-setup-phone-submit-number-button = Pošalji kod


header-menu-open = Zatvori izbornik
header-menu-closed = Izbornik navigacije stranicom
header-back-to-top-link =
    .title = Natrag na vrh
header-title-2 = { -product-mozilla-account }
header-help = Pomoć


la-heading = Povezani računi
la-description = Autorizirao/la si pristup sljedećim računima.
la-unlink-button = Odspoji
la-unlink-account-button = Odspoji
la-set-password-button = Postavi lozinku
la-unlink-content-4 = Prije odspajanja tvog računa moraš postaviti lozinku. Bez lozinke se ne možeš prijaviti nakon odspajanja tvog računa.
nav-linked-accounts = { la-heading }


modal-close-title = Zatvori
modal-cancel-button = Odustani
modal-default-confirm-button = Potvrdi


mvs-verify-your-email-2 = Potvrdi svoju e-mail adresu
mvs-enter-verification-code-2 = Upiši svoj kod za potvrdu
mvs-enter-verification-code-desc-2 = Upiši svoj kod za potvrdu koji je poslan na <email>{ $email }</email> u roku od 5 minuta.
msv-cancel-button = Odustani
msv-submit-button-2 = Potvrdi


nav-settings = Postavke
nav-profile = Profil
nav-security = Sigurnost
nav-connected-services = Povezane usluge
nav-data-collection = Prikupljanje i uportreba podataka
nav-paid-subs = Plaćene pretplate
nav-email-comm = Komunikacija e-poštom


avatar-page-title =
    .title = Profilna slika
avatar-page-add-photo = Dodaj sliku
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Snimi sliku
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Ukloni sliku
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Ponovno snimi sliku
avatar-page-cancel-button = Odustani
avatar-page-save-button = Spremi
avatar-page-saving-button = Spremanje…
avatar-page-zoom-out-button =
    .title = Smanji
avatar-page-zoom-in-button =
    .title = Povećaj
avatar-page-rotate-button =
    .title = Rotiraj
avatar-page-camera-error = Nije moguće inicijalizirati kameru
avatar-page-new-avatar =
    .alt = nova profilna slika
avatar-page-file-upload-error-3 = Dogodila se greška tijekom prijenosa tvoje slike profila
avatar-page-delete-error-3 = Dogodila se greška tijekom brisanja tvoje slike profila
avatar-page-image-too-large-error-2 = Slika je prevelika za prijenos


pw-change-header =
    .title = Promijeni lozinku
pw-8-chars = Barem 8 znakova
pw-not-email = Nije tvoja e-mail adresa
pw-change-must-match = Nova lozinka podudara se s potvrdom
pw-commonly-used = Nije često korištena lozinka
pw-tips = Zaštiti se – nemoj koristiti već korištene lozinke. Pogledaj savjete za <linkExternal>stvaranje jakih lozinki</linkExternal>.
pw-change-cancel-button = Odustani
pw-change-save-button = Spremi
pw-change-forgot-password-link = Zaboravio/la si lozinku?
pw-change-current-password =
    .label = Unesi trenutnu lozinku
pw-change-new-password =
    .label = Unesi novu lozinku
pw-change-confirm-password =
    .label = Potvrdi novu lozinku
pw-change-success-alert-2 = Lozinka je aktualizirana


pw-create-header =
    .title = Stvori lozinku
pw-create-success-alert-2 = Lozinka je postavljena
pw-create-error-2 = Žao nam je. Došlo je do greške prilikom postavljanja tvoje lozinke


delete-account-header =
    .title = Izbriši račun
delete-account-step-1-2 = Korak 1 od 2
delete-account-step-2-2 = Korak 2 od 2
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Sinkroniziranje { -brand-firefox } podataka
delete-account-product-firefox-addons = { -brand-firefox } dodaci
delete-account-acknowledge = Brisanjem računa potvrđuješ da će:
delete-account-chk-box-2 =
    .label = Možda ćeš izgubiti spremljene informacije i funkcije u { -brand-mozilla } proizvodima
delete-account-chk-box-3 =
    .label = Ponovna aktivacija ovom e-poštom možda neće vratiti tvoje spremljene informacije
delete-account-chk-box-4 =
    .label = Sva proširenja i teme koja objaviš na addons.mozilla.org će se izbrisati
delete-account-continue-button = Nastavi
delete-account-password-input =
    .label = Upiši lozinku
delete-account-cancel-button = Odustani
delete-account-delete-button-2 = Izbriši


display-name-page-title =
    .title = Prikazano ime
display-name-input =
    .label = Unesi prikazano ime
submit-display-name = Spremi
cancel-display-name = Odustani
display-name-success-alert-2 = Prikazano ime je aktualizirano


recent-activity-title = Nedavna aktivnost računa
recent-activity-account-create-v2 = Račun je stvoren
recent-activity-account-disable-v2 = Račun je deaktiviran
recent-activity-account-enable-v2 = Račun je aktiviran
recent-activity-account-login-v2 = Pokrenuta je prijava na račun
recent-activity-account-reset-v2 = Pokrenuto je resetiranje lozinke
recent-activity-account-login-failure = Pokušaj prijave na račun nije uspio
recent-activity-account-two-factor-added = Dvofaktorska autentifikacija aktivirana
recent-activity-account-two-factor-requested = Dvofaktorska autentifikacija potrebna
recent-activity-account-two-factor-failure = Dvofaktorska autentifikacija neuspjela
recent-activity-account-two-factor-success = Dvofaktorska autentifikacija uspjela
recent-activity-account-two-factor-removed = Dvofaktorska autentifikacija uklonjena
recent-activity-account-password-reset-requested = Račun je zatražio resetiranje lozinke
recent-activity-account-password-reset-success = Lozinka računa uspješno resetirana
recent-activity-account-recovery-key-added = Ključ za obnavljanje računa aktiviran
recent-activity-account-recovery-key-verification-failure = Potvrda ključa za obnavljanje računa neuspjela
recent-activity-account-recovery-key-verification-success = Potvrda ključa za obnavljanje računa uspjela
recent-activity-account-recovery-key-removed = Ključ za obnavljanje računa uklonjen
recent-activity-account-password-added = Nova lozinka dodana
recent-activity-account-password-changed = Lozinka spremljena
recent-activity-account-secondary-email-added = Sekundarna e-mail adresa dodana
recent-activity-account-secondary-email-removed = Sekundarna e-mail adresa uklonjena
recent-activity-account-emails-swapped = Primarna i sekundarna e-mail adresa zamijenjene
recent-activity-unknown = Druga aktivnost na računu


recovery-key-create-page-title = Ključ za obnavljanje računa
recovery-key-create-back-button-title = Natrag na postavke


settings-recovery-phone-remove-button = Ukloni telefonski broj
settings-recovery-phone-remove-cancel = Odustani


page-setup-recovery-phone-back-button-title = Natrag na postavke


add-secondary-email-step-1 = Korak 1 od 2
add-secondary-email-error-2 = Dogodila se greška prilikom stvaranja ove e-mail adrese
add-secondary-email-page-title =
    .title = Sekundarna e-mail adresa
add-secondary-email-enter-address =
    .label = Upiši e-mail adresu
add-secondary-email-cancel-button = Odustani
add-secondary-email-save-button = Spremi
add-secondary-email-mask = Maske za e-mail adrese se ne mogu koristiti kao sekundarne e-mail adrese


add-secondary-email-step-2 = Korak 2 od 2
verify-secondary-email-page-title =
    .title = Sekundarna adresa e-pošte
verify-secondary-email-verification-code-2 =
    .label = Upiši svoj kod za potvrdu
verify-secondary-email-cancel-button = Odustani
verify-secondary-email-verify-button-2 = Potvrdi
verify-secondary-email-please-enter-code-2 = Upiši potvrdni kod koji je poslan na <strong>{ $email }</strong> u roku od 5 minuta.
verify-secondary-email-success-alert-2 = E-mail adresa { $email } je uspješno dodana


delete-account-link = Izbriši račun


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-cta = Nabavi besplatno snimanje


profile-heading = Profil
profile-picture =
    .header = Slika
profile-display-name =
    .header = Prikazano ime
profile-primary-email =
    .header = Primarna adresa e-pošte


progress-bar-aria-label-v2 = Korak { $currentStep } od { $numberOfSteps }.


security-heading = Sigurnost
security-password =
    .header = Lozinka
security-password-created-date = Stvoreno { $date }
security-not-set = Nije postavljeno
security-action-create = Stvori
security-set-password = Postavi lozinku za sinkronizaciju i korištenje određenih sigurnosnih funkcija računa.
security-recent-activity-link = Pogledaj nedavnu aktivnost računa
signout-sync-header = Sesija je istekla
signout-sync-session-expired = Oprosti, nešto nije u redu. Odjavi se u izborniku preglednika i pokušaj ponovo.


tfa-row-backup-codes-not-available = Nema dostupnih kodova
tfa-row-backup-codes-add-cta = Dodaj
tfa-row-backup-phone-change-cta = Promijeni
tfa-row-backup-phone-add-cta = Dodaj
tfa-row-backup-phone-delete-button = Ukloni


switch-turn-off = Isključi
switch-turn-on = Uključi
switch-submitting = Slanje …
switch-is-on = uključeno
switch-is-off = isključeno


row-defaults-action-add = Dodaj
row-defaults-action-change = Promijeni
row-defaults-action-disable = Onemogući
row-defaults-status = Ništa


rk-header-1 = Ključ za obnavljanje računa
rk-enabled = Omogućeno
rk-not-set = Nije postavljeno
rk-action-create = Stvori
rk-action-change-button = Promijeni
rk-action-remove = Ukloni
rk-key-removed-2 = Ključ za obnavljanje računa je uklonjen
rk-cannot-remove-key = Nije moguće ukloniti tvoj ključ za obnavljanje računa.
rk-refresh-key-1 = Aktualiziraj ključ za obnavljanje računa
rk-content-explain = Obnovi tvoje informacije kada zaboraviš svoju lozinku.
rk-cannot-verify-session-4 = Žao nam je. Došlo je do greške prilikom potvrđivanja tvoje sesije
rk-remove-modal-heading-1 = Ukloniti ključ za obnavljanje računa?
rk-remove-modal-content-1 = U slučaju da resetiraš lozinku, nećeš moći koristiti ključ za oporavak računa za pristup tvojim podacima. Ovo je nepovratna radnja.
rk-remove-error-2 = Nije moguće ukloniti tvoj ključ za obnavljanje računa
unit-row-recovery-key-delete-icon-button-title = Izbriši ključ za obnavljanje računa


se-heading = Sekundarna adresa e-pošte
    .header = Sekundarna adresa e-pošte
se-cannot-refresh-email = Oprosti, dogodila se greška prilikom aktualiziranja te e-mail adrese.
se-cannot-resend-code-3 = Žao nam je, došlo je do problema prilikom ponovnog slanja potvrdnog koda
se-set-primary-successful-2 = { $email } je sada tvoja primarna e-mail adresa
se-set-primary-error-2 = Oprosti, dogodila se greška prilikom mijenjanja tvoje primarne e-mail adrese
se-delete-email-successful-2 = E-mail adresa { $email } je uspješno izrisana
se-delete-email-error-2 = Oprosti, dogodila se greška prilikom brisanja ove e-mail adrese
se-verify-session-3 = Morat ćeš potvrditi svoju trenutačnu sesiju za izvršenje ove radnje
se-verify-session-error-3 = Žao nam je. Došlo je do greške prilikom potvrđivanja tvoje sesije
se-remove-email =
    .title = Ukloni e-poštu
se-refresh-email =
    .title = Osvježi e-poštu
se-unverified-2 = nepotvrđeno
se-resend-code-2 =
    Potrebna je potvrda. <button>Ponovo pošalji kod za potvrdu</button>
    ako nije u tvom ulaznom sandučiću niti u sandučiću neželjenih e-mailova.
se-make-primary = Postavi primarnom
se-default-content = Pristupi svom računu kada se ne možeš prijaviti na svoju primarnu e-poštu.
se-content-note-1 = Napomena: sekundarna e-mail adresa neće obnoviti tvoje podatke – za to ćeš trebati <a>ključ za obnavljanje računa</a>.
se-secondary-email-none = Nema


tfa-row-header = Dvofaktorska autentifikacija
tfa-row-enabled = Omogućeno
tfa-row-disabled-status = Deaktivirano
tfa-row-action-add = Dodaj
tfa-row-action-disable = Onemogući
tfa-row-button-refresh =
    .title = Osvježi dvofaktorsku autentifikaciju
tfa-row-disable-modal-heading = Onemogućiti dvofaktorsku autentifikaciju?
tfa-row-disable-modal-confirm = Onemogući
tfa-row-disabled-2 = Autentifikacija u dva koraka je deaktivirana
tfa-row-cannot-disable-2 = Nije bilo moguće deaktivirati autentifikaciju u dva koraka


terms-privacy-agreement-default-2 = Ako nastaviš, prihvaćaš <mozillaAccountsTos>uvjete usluge</mozillaAccountsTos> i <mozillaAccountsPrivacy>napomene o privatnosti</mozillaAccountsPrivacy>.


third-party-auth-options-or = ili
continue-with-google-button = Nastavi s { -brand-google }
continue-with-apple-button = Nastavi s { -brand-apple }


auth-error-102 = Nepoznati račun
auth-error-103 = Netočna lozinka
auth-error-105-2 = Neispravan potvrdni kod
auth-error-110 = Nevažeći token
auth-error-114 = Previše pokušaja. Pokušaj ponovo { $retryAfter }.
auth-error-138-2 = Nepotvrđena sesija
auth-error-139 = Sekundarna e-mail adresa mora biti drugačija od e-mail adrese računa
auth-error-155 = TOTP token nije pronađen
auth-error-159 = Neispravan ključ za obnavljanje računa
auth-error-183-2 = Neispravan ili istekao potvrdni kod
auth-error-202 = Funkcija nije aktivirana
auth-error-203 = Sustav nije dostupan, pokušaj ponovo malo kasnije
auth-error-999 = Neočekivana greška
auth-error-1001 = Pokušaj prijave je prekinut
auth-error-1002 = Vrijeme sesije je isteklo. Prijavi se za nastavljanje.
auth-error-1003 = Lokalno spremište ili kolačići su i dalje deaktivirani
auth-error-1008 = Tvoja nova lozinka mora biti drugačija
auth-error-1010 = Potrebna je ispravna lozinka
auth-error-1011 = Potrebna je ispravna e-mail adresa
auth-error-1031 = Za prijavu moraš upisati svoju dob
auth-error-1032 = Za registraciju moraš upisati ispravnu dob
auth-error-1054 = Neispravan kod dvofaktorske autentikacije
auth-error-1062 = Neispravno preusmjeravanje
oauth-error-1000 = Dogodila se greška. Zatvori ovu karticu i pokušaj ponovo.


connect-another-device-signed-in-header = Prijavljen/na si na { -brand-firefox }
connect-another-device-email-confirmed-banner = E-mail adresa je potvrđena
connect-another-device-signin-confirmed-banner = Prijava je potvrđena
connect-another-device-signin-to-complete-message = Prijavi se na ovaj { -brand-firefox } za dovršavanje postavljanja
connect-another-device-signin-link = Prijavi se
connect-another-device-still-adding-devices-message = Još uvijek dodaješ uređaj? Prijavi se u { -brand-firefox } na jednom drugom uređaju za završavanje postavljanja
connect-another-device-signin-another-device-to-complete-message = Prijavi se u { -brand-firefox } na jednom drugom uređaju za završavanje postavljanja
connect-another-device-get-data-on-another-device-message = Želiš li dobiti tvoje kartice, zabilješke i lozinke na jednom drugom uređaju?
connect-another-device-cad-link = Poveži jedan drugi uređaj
connect-another-device-not-now-link = Ne sada
connect-another-device-android-complete-setup-message = Prijavi se na { -brand-firefox } za Android za dovršavanje postavljanja
connect-another-device-ios-complete-setup-message = Prijavi se na { -brand-firefox } za iOS za dovršavanje postavljanja


cookies-disabled-button-try-again = Pokušaj ponovo
cookies-disabled-learn-more = Saznaj više


index-header = Upiši svoju e-mail adresu
index-subheader-with-servicename = Nastavi na { $serviceName }
index-subheader-default = Nastavi na postavke računa
index-cta = Registriraj se ili se prijavi
index-email-input =
    .label = Upiši svoju e-mail adresu


inline-recovery-key-setup-download-header = Zaštiti svoj račun
inline-recovery-key-setup-download-subheader = Preuzmi i spremi sada


inline-totp-setup-cancel-setup-button = Prekini postavljanje
inline-totp-setup-continue-button = Nastavi
inline-totp-setup-ready-button = Spremno
inline-totp-setup-security-code-placeholder = Kod za autentifikaciju
inline-totp-setup-code-required-error = Potreban je kod autentifikacije


legal-header = Pravno
legal-terms-of-service-link = Uvjeti usluge
legal-privacy-link = Napomena o privatnosti


legal-privacy-heading = Napomena o privatnosti


legal-terms-heading = Uvjeti usluge


pair-auth-allow-confirm-button = Da, odobri uređaj
pair-auth-allow-refuse-device-link = Ako to nisi bio/la ti, <link>promijeni lozinku</link>


pair-auth-complete-heading = Uređaj je povezan
pair-auth-complete-sync-benefits-text = Sada možeš pristupiti tvojim otvorenim karticama, lozinkama i zabilješkama na svim tvojim uređajima.
pair-auth-complete-see-tabs-button = Pogledaj kartice od sinkroniziranih uređaja
pair-auth-complete-manage-devices-link = Upravljaj uređajima


auth-totp-input-label = Upiši šesteroznamenkasti kod
auth-totp-confirm-button = Potvrdi


pair-sync-header = Sinkroniziraj { -brand-firefox } na svom telefonu ili tabletu
pair-cad-header = Poveži { -brand-firefox } na jednom drugom uređaju
pair-sync-your-device-button = Sinkroniziraj svoj uređaj
pair-or-download-subheader = Ili preuzmi
pair-not-now-button = Ne sada
pair-take-your-data-message = Ponesi svoje kartice, zabilješke i lozinke gdje god koristiš { -brand-firefox }.
pair-get-started-button = Započni
pair-qr-code-aria-label = QR kod


pair-success-header-2 = Uređaj je povezan


pair-supp-allow-cancel-link = Odustani


third-party-auth-callback-message = Pričekaj, preusmjeravamo te na ovlaštenu aplikaciju.


account-recovery-confirm-key-button-2 = Nastavi


complete-reset-pw-header-v2 = Stvori novu lozinku
complete-reset-password-success-alert = Lozinka je postavljena
complete-reset-password-error-alert = Žao nam je. Došlo je do greške prilikom postavljanja tvoje lozinke
reset-password-complete-banner-heading = Tvoja je lozinka resetirana.




confirm-reset-password-with-code-heading = Provjeri tvoju e-mail adresu
confirm-reset-password-with-code-instruction = Poslali smo kod za potvrđivanje na <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Upiši 8-znamenkasti kod u roku od 10 minuta
confirm-reset-password-otp-submit-button = Nastavi
confirm-reset-password-otp-resend-code-button = Ponovo pošalji kod
confirm-reset-password-otp-different-account-link = Koristi jedan drugi račun


confirm-totp-reset-password-header = Resetiraj tvoju lozinku
confirm-totp-reset-password-confirm-button = Potvrdi
confirm-totp-reset-password-input-label-v2 = Upiši šesteroznamenkasti kod
confirm-totp-reset-password-use-different-account = Koristi jedan drugi račun


password-reset-flow-heading = Resetiraj tvoju lozinku
password-reset-email-input =
    .label = Upiši tvoju e-mail adresu
password-reset-submit-button-2 = Nastavi


reset-password-complete-header = Tvoja je lozinka resetirana


reset-password-with-recovery-key-verified-page-title = Resetiranje lozinke je uspjelo
reset-password-complete-new-password-saved = Nova lozinka je spremljena!


error-label = Greška:
complete-signin-error-header = Greška potvrde
signin-link-expired-header = Poveznica potvrde je oštećena


signin-password-needed-header-2 = Upiši svoju lozinku <span>za tvoj { -product-mozilla-account }</span>
signin-subheader-without-logo-with-servicename = Nastavi na { $serviceName }
signin-subheader-without-logo-default = Nastavi na postavke računa
signin-button = Prijavi se
signin-header = Prijavi se
signin-use-a-different-account-link = Koristi jedan drugi račun
signin-forgot-password-link = Zaboravio/la si lozinku?
signin-password-button-label = Lozinka


report-signin-header = Prijaviti neautoriziranu prijavu?
report-signin-submit-button = Prijavi aktivnost
report-signin-support-link = Zašto se ovo događa?
signin-bounced-message = Potvrdni e-mail koji smo poslali na { $email } je vraćen i zaključali smo tvoj račun, kako bismo zaštitili tvoje { -brand-firefox } podatke.
back = Natrag


signin-push-code-confirm-instruction = Potvrdi tvoju prijavu
signin-push-code-confirm-login = Potvrdi prijavu


signin-recovery-method-header = Prijavi se


signin-recovery-code-heading = Prijavi se
signin-recovery-code-confirm-button = Potvrdi
signin-recovery-code-use-phone-failure-description = Pokušaj ponovo kasnije.


signin-recovery-phone-flow-heading = Prijavi se
signin-recovery-phone-input-label = Upiši šesteroznamenkasti kod
signin-recovery-phone-code-submit-button = Potvrdi
signin-recovery-phone-resend-code-button = Ponovo pošalji kod
signin-recovery-phone-resend-success = Kod je poslan
signin-recovery-phone-send-code-error-heading = Došlo je do greške prilikom slanja koda
signin-recovery-phone-code-verification-error-heading = Došlo je do greške prilikom provjere tvog koda
signin-recovery-phone-general-error-description = Pokušaj ponovo kasnije.


signin-token-code-heading-2 = Upiši potvrdni kod<span> za tvoj { -product-mozilla-account }</span>
signin-token-code-input-label-v2 = Upiši šesteroznamenkasti kod
signin-token-code-confirm-button = Potvrdi
signin-token-code-code-expired = Kod je istekao?
signin-token-code-resend-code-link = Pošalji e-mailom novi kod.
signin-token-code-required-error = Potreban je potvrdni kod


signin-totp-code-header = Prijavi se
signin-totp-code-input-label-v4 = Upiši šesteroznamenkasti kod
signin-totp-code-confirm-button = Potvrdi
signin-totp-code-other-account-link = Koristi jedan drugi račun
signin-totp-code-recovery-code-link = Problem s unosom koda?
signin-totp-code-required-error = Potreban je kod autentifikacije
signin-totp-code-desktop-relay = { -brand-firefox } će te pokušati vratiti na karticu kako bi koristio/la masku e-mail adrese nakon što se prijaviš.


signin-unblock-header = Autoriziraj ovu prijavu
signin-unblock-body = Pregledaj e-poštu za autorizacijskim kodom koji je poslan na { $email }.
signin-unblock-code-input = Upiši kod za autorizaciju
signin-unblock-submit-button = Nastavi
signin-unblock-code-required-error = Potreban je kod autorizacije
signin-unblock-code-incorrect-length = Kod za autorizaciju mora sadržati 8 znakova
signin-unblock-code-incorrect-format-2 = Kod za autorizaciju smije sadržati samo slova i/ili brojke
signin-unblock-resend-code-button = Nije u sandučiću dolazne pošte niti u sandučiću neželjenih e-mailova? Pošalji ponovo
signin-unblock-support-link = Zašto se ovo događa?
signin-unblock-desktop-relay = { -brand-firefox } će te pokušati vratiti na karticu kako bi koristio/la masku e-mail adrese nakon što se prijaviš.




confirm-signup-code-page-title = Upiši potvrdni kod
confirm-signup-code-heading-2 = Upiši potvrdni kod<span> za tvoj { -product-mozilla-account }</span>
confirm-signup-code-input-label = Upiši šesteroznamenkasti kod
confirm-signup-code-confirm-button = Potvrdi
confirm-signup-code-code-expired = Kod je istekao?
confirm-signup-code-resend-code-link = Pošalji e-mailom novi kod.
confirm-signup-code-success-alert = Račun je uspješno potvrđen
confirm-signup-code-is-required-error = Potreban je potvrdni kod
confirm-signup-code-desktop-relay = { -brand-firefox } će te pokušati vratiti na karticu kako bi koristio/la masku e-mail adrese nakon što se prijaviš.


signup-relay-info = Za sigurno upravljanje tvojim maskiranim e-mail adresama i pristup sigurnosnim { -brand-mozilla } alatima je potrebna lozinka.
signup-change-email-link = Promijeni e-mail adresu
