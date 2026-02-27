



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox-kontoer
-product-mozilla-account = Mozilla-konto
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Mozilla-kontoer
       *[lowercase] Mozilla-kontoer
    }
-product-firefox-account = Firefox-konto
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

app-general-err-heading = Generell programfeil
app-general-err-message = Noe gikk galt. Prøv igjen senere.
app-query-parameter-err-heading = Ugyldig forespørsel: Ugyldige søkeparametere


app-footer-mozilla-logo-label = { -brand-mozilla }-logo
app-footer-privacy-notice = Nettstedets personvernerklæring
app-footer-terms-of-service = Bruksvilkår


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Blir åpnet i et nytt vindu


app-loading-spinner-aria-label-loading = Laster …


app-logo-alt-3 =
    .alt = { -brand-mozilla } m-logo



resend-code-success-banner-heading = En ny kode ble sendt til e-posten din.
resend-link-success-banner-heading = En ny lenke ble sendt til e-posten din.
resend-success-banner-description = Legg til { $accountsEmail } i kontaktene dine for å sikre en problemfri levering.


brand-banner-dismiss-button-2 =
    .aria-label = Lukk banner
brand-prelaunch-title = { -product-firefox-accounts } vil bli omdøpt til { -product-mozilla-accounts } 1. november
brand-prelaunch-subtitle = Du vil fortsatt logge inn med samme brukernavn og passord, og det er ingen andre endringer i produktene du bruker.
brand-postlaunch-title = Vi har endret navn på { -product-firefox-accounts } til { -product-mozilla-accounts }. Du vil fortsatt logge på med samme brukernavn og passord, og det er ingen andre endringer i produktene du bruker.
brand-learn-more = Les mer
brand-close-banner =
    .alt = Lukk banner
brand-m-logo =
    .alt = { -brand-mozilla } m-logo


button-back-aria-label = Tilbake
button-back-title = Tilbake


recovery-key-download-button-v3 = Last ned og fortsett
    .title = Last ned og fortsett
recovery-key-pdf-heading = Kontogjenopprettingsnøkkel
recovery-key-pdf-download-date = Opprettet den { $date }
recovery-key-pdf-key-legend = Kontogjenopprettingsnøkkel
recovery-key-pdf-instructions = Denne nøkkelen lar deg gjenopprette krypterte nettleserdata (inkludert passord, bokmerker og historikk) hvis du glemmer passordet. Oppbevar det på et sted du husker.
recovery-key-pdf-storage-ideas-heading = Steder å oppbevare nøkkelen din
recovery-key-pdf-support = Les mer om kontogjenopprettingsnøkkel
recovery-key-pdf-download-error = Beklager, det oppstod et problem da kontogjenopprettingsnøkkelen skulle lastes ned.


button-passkey-signin = Logg inn med passnøkkel
button-passkey-signin-loading = Logger inn sikkert …


choose-newsletters-prompt-2 = Få mer fra { -brand-mozilla }:
choose-newsletters-option-latest-news =
    .label = Få våre siste nyheter og produktoppdateringer
choose-newsletters-option-test-pilot =
    .label = Tidlig tilgang til å teste nye produkter
choose-newsletters-option-reclaim-the-internet =
    .label = Handlingsvarsler for å vinne tilbake internett


datablock-download =
    .message = Lastet ned
datablock-copy =
    .message = Kopiert
datablock-print =
    .message = Skrevet ut


datablock-copy-success =
    { $count ->
        [one] Kode kopiert
       *[other] Koder kopiert
    }
datablock-download-success =
    { $count ->
        [one] Kode lastet ned
       *[other] Koder lastet ned
    }
datablock-print-success =
    { $count ->
        [one] Kode skrevet ut
       *[other] Koder skrevet ut
    }


datablock-inline-copy =
    .message = Kopiert


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (anslått)
device-info-block-location-region-country = { $region }, { $country } (anslått)
device-info-block-location-city-country = { $city }, { $country } (anslått)
device-info-block-location-country = { $country } (anslått)
device-info-block-location-unknown = Ukjent plassering
device-info-browser-os = { $browserName } på { $genericOSName }
device-info-ip-address = IP-adresse: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Passord
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Gjenta passord
form-password-with-inline-criteria-signup-submit-button = Opprett konto
form-password-with-inline-criteria-reset-new-password =
    .label = Nytt passord
form-password-with-inline-criteria-confirm-password =
    .label = Bekreft passord
form-password-with-inline-criteria-reset-submit-button = Lag nytt passord
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Passord
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Gjenta passord
form-password-with-inline-criteria-set-password-submit-button = Start synkronisering
form-password-with-inline-criteria-match-error = Passordene er ikke like
form-password-with-inline-criteria-sr-too-short-message = Passordet må inneholde minst 8 tegn.
form-password-with-inline-criteria-sr-not-email-message = Passordet kan ikke inneholde e-postadressen din.
form-password-with-inline-criteria-sr-not-common-message = Passordet kan ikke være et typisk brukt passord.
form-password-with-inline-criteria-sr-requirements-met = Det angitte passordet følger alle passordkrav.
form-password-with-inline-criteria-sr-passwords-match = De angitte passordene samsvarer.


form-verify-code-default-error = Dette feltet er obligatorisk


form-verify-totp-disabled-button-title-numeric = Skriv inn { $codeLength }-sifret kode for å fortsette
form-verify-totp-disabled-button-title-alphanumeric = Skriv inn koden på { $codeLength } tegn for å fortsette


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox }-kontogjenopprettingsnøkkel
get-data-trio-title-backup-verification-codes = Reserve-autentiseringskoder
get-data-trio-download-2 =
    .title = Last ned
    .aria-label = Last ned
get-data-trio-copy-2 =
    .title = Kopier
    .aria-label = Kopier
get-data-trio-print-2 =
    .title = Skriv ut
    .aria-label = Skriv ut


alert-icon-aria-label =
    .aria-label = Varsel
icon-attention-aria-label =
    .aria-label = Merk
icon-warning-aria-label =
    .aria-label = Advarsel
authenticator-app-aria-label =
    .aria-label = Autentiseringsapplikasjon
backup-codes-icon-aria-label-v2 =
    .aria-label = Reserve-autentiseringskoder aktivert
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Reserve-autentiseringskoder deaktivert
backup-recovery-sms-icon-aria-label =
    .aria-label = Gjenopprettings-SMS slått på
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Gjenopprettings-SMS slått av
canadian-flag-icon-aria-label =
    .aria-label = Canadisk flagg
checkmark-icon-aria-label =
    .aria-label = Valgt
checkmark-success-icon-aria-label =
    .aria-label = Suksess
checkmark-enabled-icon-aria-label =
    .aria-label = Slått på
close-icon-aria-label =
    .aria-label = Lukk melding
code-icon-aria-label =
    .aria-label = Kode
error-icon-aria-label =
    .aria-label = Feil
info-icon-aria-label =
    .aria-label = Informasjon
usa-flag-icon-aria-label =
    .aria-label = Amerikansk flagg
icon-loading-arrow-aria-label =
    .aria-label = Laster
icon-passkey-aria-label =
    .aria-label = Passnøkkel


hearts-broken-image-aria-label =
    .aria-label = En datamaskin og en mobiltelefon og et bilde av et knust hjerte på hver av dem
hearts-verified-image-aria-label =
    .aria-label = En datamaskin, en mobiltelefon og et nettbrett med et pulserende hjerte på hver av dem.
signin-recovery-code-image-description =
    .aria-label = Dokument som inneholder skjult tekst.
signin-totp-code-image-label =
    .aria-label = En enhet med en skjult 6-sifret kode.
confirm-signup-aria-label =
    .aria-label = En konvolutt som inneholder en lenke
security-shield-aria-label =
    .aria-label = Illustrasjon som representerer en kontogjenopprettingsnøkkel.
recovery-key-image-aria-label =
    .aria-label = Illustrasjon som representerer en kontogjenopprettingsnøkkel.
password-image-aria-label =
    .aria-label = En illustrasjon av en inntasting av et passord.
lightbulb-aria-label =
    .aria-label = Illustrasjon av hvordan du lager et oppbevaringshint.
email-code-image-aria-label =
    .aria-label = Illustrasjon av en e-post som inneholder en kode.
recovery-phone-image-description =
    .aria-label = Mobilenhet som mottar en kode via tekstmelding.
recovery-phone-code-image-description =
    .aria-label = Kode mottatt på en mobilenhet.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilenhet med SMS-funksjonalitet
backup-authentication-codes-image-aria-label =
    .aria-label = Enhetsskjerm med koder
sync-clouds-image-aria-label =
    .aria-label = Skyer med et synkroniseringsikon
confetti-falling-image-aria-label =
    .aria-label = Animert fallende konfetti


inline-recovery-key-setup-signed-in-firefox-2 = Du er logget inn på { -brand-firefox }.
inline-recovery-key-setup-create-header = Sikre kontoen din
inline-recovery-key-setup-create-subheader = Har du et minutt til å beskytte dataene dine?
inline-recovery-key-setup-info = Opprett en kontogjenopprettingsnøkkel slik at du kan gjenopprette synkroniserte nettleserdata hvis du glemmer passordet ditt.
inline-recovery-key-setup-start-button = Opprett kontogjenopprettingsnøkkel
inline-recovery-key-setup-later-button = Gjør det senere


input-password-hide = Skjul passord
input-password-show = Vis passord
input-password-hide-aria-2 = Passordet ditt er for øyeblikket synlig på skjermen.
input-password-show-aria-2 = Passordet ditt er for øyeblikket skjult.
input-password-sr-only-now-visible = Passordet ditt er nå synlig på skjermen.
input-password-sr-only-now-hidden = Passordet ditt er nå skjult.


input-phone-number-country-list-aria-label = Velg land
input-phone-number-enter-number = Skriv inn telefonnummer
input-phone-number-country-united-states = USA
input-phone-number-country-canada = Canada
legal-back-button = Tilbake


reset-pwd-link-damaged-header = Lenke for tilbakestilling av passordet er skadet
signin-link-damaged-header = Bekreftelseslenken er skadet
report-signin-link-damaged-header = Ødelagt lenke
reset-pwd-link-damaged-message = Lenken du klikket på mangler noen tegn, og kan ha blitt forandret av e-postklienten. Sjekk at du kopierte riktig, og prøv igjen.


link-expired-new-link-button = Motta en ny lenke


remember-password-text = Husker du passordet ditt?
remember-password-signin-link = Logg inn


primary-email-confirmation-link-reused = Primær e-post allerede bekreftet
signin-confirmation-link-reused = Innlogging allerede bekreftet
confirmation-link-reused-message = Den bekreftelseslenken ble allerede brukt, og kan bare brukes én gang.


locale-toggle-select-label = Velg språk
locale-toggle-browser-default = Nettleser-standard
error-bad-request = Ugyldig forespørsel


password-info-balloon-why-password-info = Du trenger dette passordet for å få tilgang til krypterte data du lagrer hos oss.
password-info-balloon-reset-risk-info = En tilbakestilling betyr potensielt tap av data som passord og bokmerker.


password-strength-long-instruction = Velg et sterkt passord du ikke har brukt på andre nettsteder. Sørg for at det oppfyller sikkerhetskravene:
password-strength-short-instruction = Velg et sterkt passord:
password-strength-inline-min-length = Minst 8 tegn
password-strength-inline-not-email = Ikke e-postadressen din
password-strength-inline-not-common = Ikke et typisk brukt passord
password-strength-inline-confirmed-must-match = Bekreftelsen samsvarer med det nye passordet
password-strength-inline-passwords-match = Passordene samsvarer


account-recovery-notification-cta = Opprett
account-recovery-notification-header-value = Ikke mist dataene dine hvis du glemmer passordet ditt
account-recovery-notification-header-description = Opprett en kontogjenopprettingsnøkkel for å gjenopprette synkroniserte nettleserdata hvis du glemmer passordet ditt.
recovery-phone-promo-cta = Legg til gjenopprettingstelefon
recovery-phone-promo-heading = Legg til ekstra beskyttelse for kontoen din med en gjenopprettingstelefon
recovery-phone-promo-description = Nå kan du logge på med et engangspassord via SMS hvis du ikke kan bruke totrinnsautentiseringsappen din.
recovery-phone-promo-info-link = Les mer om gjenoppretting og SIM-swapping-risiko
promo-banner-dismiss-button =
    .aria-label = Avvis banner


ready-complete-set-up-instruction = Fullfør oppsettet ved å skrive inn det nye passordet ditt på de andre { -brand-firefox }-enhetene dine.
manage-your-account-button = Behandle kontoen din
ready-use-service = Du er nå klar til å bruke { $serviceName }
ready-use-service-default = Du er nå klar til å bruke kontoinnstillingene
ready-account-ready = Kontoen din er klar!
ready-continue = Fortsett
sign-in-complete-header = Innlogging bekreftet
sign-up-complete-header = Konto bekreftet
primary-email-verified-header = Primær e-postadresse bekreftet


flow-recovery-key-download-storage-ideas-heading-v2 = Steder å oppbevare nøkkelen din:
flow-recovery-key-download-storage-ideas-folder-v2 = Mappe på sikker enhet
flow-recovery-key-download-storage-ideas-cloud = Pålitelig skylagring
flow-recovery-key-download-storage-ideas-print-v2 = Utskreven fysisk kopi
flow-recovery-key-download-storage-ideas-pwd-manager = Passordbehandler


flow-recovery-key-hint-header-v2 = Legg til et hint for å finne nøkkelen din
flow-recovery-key-hint-message-v3 = Dette hintet skal hjelpe deg med å huske hvor du lagret kontogjenopprettingsnøkkelen din. Vi kan vise den til deg under tilbakestillingen av passordet for å gjenopprette dataene dine.
flow-recovery-key-hint-input-v2 =
    .label = Skriv inn et hint (valgfritt)
flow-recovery-key-hint-cta-text = Fullfør
flow-recovery-key-hint-char-limit-error = Hintet må inneholde færre enn 255 tegn.
flow-recovery-key-hint-unsafe-char-error = Hintet kan ikke inneholde usikre unicode-tegn. Bare bokstaver, tall, tegnsettingstegn og symboler er tillatt.


password-reset-warning-icon = Advarsel
password-reset-chevron-expanded = Skjul advarsel
password-reset-chevron-collapsed = Vis advarsel
password-reset-data-may-not-be-recovered = Nettleserdataene dine kan kanskje ikke gjenopprettes
password-reset-previously-signed-in-device-2 = Har du en enhet du tidligere har logget på?
password-reset-data-may-be-saved-locally-2 = Nettleserdataene dine kan være lagret på den enheten. Tilbakestill passordet ditt, og logg deretter inn der for å gjenopprette og synkronisere dataene dine.
password-reset-no-old-device-2 = Har du en ny enhet, men har ikke tilgang til noen av de gamle?
password-reset-encrypted-data-cannot-be-recovered-2 = Beklager, men de krypterte nettleserdataene dine på { -brand-firefox }-serverne kan ikke gjenopprettes.
password-reset-warning-have-key = Har du en kontogjenopprettingsnøkkel?
password-reset-warning-use-key-link = Bruk den nå for å tilbakestille passordet ditt og beholde dataene dine


alert-bar-close-message = Lukk melding


avatar-your-avatar =
    .alt = Avataren din
avatar-default-avatar =
    .alt = Standardavatar




bento-menu-title-3 = { -brand-mozilla }-produkter
bento-menu-tagline = Flere produkter fra { -brand-mozilla } som beskytter personvernet ditt
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox }-nettleser for datamaskiner
bento-menu-firefox-mobile = { -brand-firefox }-nettleser for mobil
bento-menu-made-by-mozilla = Utviklet av { -brand-mozilla }


connect-another-fx-mobile = Få { -brand-firefox } på mobil eller nettbrett
connect-another-find-fx-mobile-2 = Finn { -brand-firefox } i { -google-play } og { -app-store }.
connect-another-play-store-image-2 =
    .alt = Last ned { -brand-firefox } på { -google-play }
connect-another-app-store-image-3 =
    .alt = Last ned { -brand-firefox } på { -app-store }


cs-heading = Tilknyttede tjenester
cs-description = Alt du bruker og er innlogget på.
cs-cannot-refresh = Beklager, det oppstod ett problem under oppdatering av listen over tilkoblede tjenester.
cs-cannot-disconnect = Klienten ble ikke funnet, kan ikke koble fra
cs-logged-out-2 = Logget ut av { $service }
cs-refresh-button =
    .title = Oppdater tilkoblede tjenester
cs-missing-device-help = Manglende eller duplikatelement?
cs-disconnect-sync-heading = Koble fra Sync


cs-disconnect-sync-content-3 =
    Nettleserdataene dine vil forbli på <span>{ $device }</span>,
    men de vil ikke lenger synkroniseres med kontoen din.
cs-disconnect-sync-reason-3 = Hva er hovedårsaken for å koble fra <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = Enheten er:
cs-disconnect-sync-opt-suspicious = Mistenkelig
cs-disconnect-sync-opt-lost = Mistet eller stjålet
cs-disconnect-sync-opt-old = Gammel eller erstattet
cs-disconnect-sync-opt-duplicate = Duplikat
cs-disconnect-sync-opt-not-say = Vil helst ikke fortelle


cs-disconnect-advice-confirm = Ok, jeg forstår
cs-disconnect-lost-advice-heading = Tapt eller stjålet enhet frakoblet
cs-disconnect-lost-advice-content-3 = Siden enheten din ble tapt eller stjålet, bør du endre passordet for { -product-mozilla-account } i kontoinnstillingene dine for å holde informasjonen din trygg. Du bør også se etter informasjon fra enhetsprodusenten om fjernsletting av dine data.
cs-disconnect-suspicious-advice-heading = Mistenkelig enhet frakoblet
cs-disconnect-suspicious-advice-content-2 = Hvis den frakoblede enheten virkelig er mistenkelig, bør du endre passordet for { -product-mozilla-account } i kontoinnstillingene dine for å holde informasjonen din trygg. Du bør også endre eventuelle andre passord du har lagret i { -brand-firefox } ved å skrive about:logins i adresselinjen.
cs-sign-out-button = Logg ut


dc-heading = Datainnsamling og -bruk
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox }-nettleser
dc-subheader-content-2 = Tillate { -product-mozilla-accounts } å sende tekniske- og interaksjonsdata til { -brand-mozilla }?
dc-subheader-ff-content = For å se gjennom eller oppdatere tekniske data og interaksjonsdata-innstillinger i { -brand-firefox }-nettleseren, åpne innstillingene for { -brand-firefox } og naviger til Personvern og sikkerhet.
dc-opt-out-success-2 = Fravalget vellykket. { -product-mozilla-accounts } sender ikke tekniske data eller interaksjonsdata til { -brand-mozilla }.
dc-opt-in-success-2 = Takk! Deling av disse data hjelper oss med å forbedre { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Dessverre oppstod det et problem under endring av innstillingene for datainnsamling
dc-learn-more = Les mer


drop-down-menu-title-2 = { -product-mozilla-account }-meny
drop-down-menu-signed-in-as-v2 = Logget inn som
drop-down-menu-sign-out = Logg ut
drop-down-menu-sign-out-error-2 = Beklager, det oppstod et problem med å logge deg av


flow-container-back = Tilbake


flow-recovery-key-confirm-pwd-heading-v2 = Skriv inn passordet ditt på nytt for å øke sikkerheten
flow-recovery-key-confirm-pwd-input-label = Skriv inn passordet ditt
flow-recovery-key-confirm-pwd-submit-button = Opprett kontogjenopprettingsnøkkel
flow-recovery-key-confirm-pwd-submit-button-change-key = Opprett en ny kontogjenopprettingsnøkkel


flow-recovery-key-download-heading-v2 = Kontogjenopprettingsnøkkelen ble opprettet — Last ned og lagre den nå
flow-recovery-key-download-info-v2 = Denne nøkkelen lar deg gjenopprette dataene dine hvis du glemmer passordet ditt. Last den ned nå og oppbevar den et sted du husker — du vil ikke kunne gå tilbake til denne siden senere.
flow-recovery-key-download-next-link-v2 = Fortsett uten å laste ned


flow-recovery-key-success-alert = Kontogjenopprettingsnøkkel opprettet


flow-recovery-key-info-header = Opprett en kontogjenopprettingsnøkkel i tilfelle du glemmer passordet ditt
flow-recovery-key-info-header-change-key = Endre din kontogjenopprettingsnøkkel
flow-recovery-key-info-shield-bullet-point-v2 = Vi krypterer nettleserdata –– passord, bokmerker og mer. Det er flott for personvernet, men du kan miste dataene dine hvis du glemmer passordet ditt.
flow-recovery-key-info-key-bullet-point-v2 = Derfor er det så viktig å opprette en kontogjenopprettingsnøkkel –– du kan bruke den til å gjenopprette dataene dine.
flow-recovery-key-info-cta-text-v3 = Kom i gang
flow-recovery-key-info-cancel-link = Avbryt


flow-setup-2fa-qr-heading = Koble til autentiseringsappen din
flow-setup-2a-qr-instruction = <strong>Trinn 1:</strong> Skann denne QR-koden med en hvilken som helst autentiseringsapp, som Duo eller Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = QR-kode for å sette opp totrinns-autentisering. Skann den, eller velg «Kan ikke skanne QR-koden?» for å få en hemmelig nøkkel for oppsett i stedet.
flow-setup-2fa-cant-scan-qr-button = Kan du ikke skanne QR-koden?
flow-setup-2fa-manual-key-heading = Skriv inn kode manuelt
flow-setup-2fa-manual-key-instruction = <strong>Trinn 1:</strong> Skriv inn denne koden i din foretrukne autentiseringsapp.
flow-setup-2fa-scan-qr-instead-button = Skanne QR-kode i stedet?
flow-setup-2fa-more-info-link = Les mer om autentiseringsapper
flow-setup-2fa-button = Fortsett
flow-setup-2fa-step-2-instruction = <strong>Trinn 2:</strong> Skriv inn koden fra autentiseringsappen din.
flow-setup-2fa-input-label = Skriv inn 6-sifret kode
flow-setup-2fa-code-error = Ugyldig eller utløpt kode. Sjekk autentiseringsappen din og prøv på nytt.


flow-setup-2fa-backup-choice-heading = Velg en gjenopprettingsmetode
flow-setup-2fa-backup-choice-description = Dette lar deg logge inn hvis du ikke har tilgang til mobilenheten eller autentiseringsappen din.
flow-setup-2fa-backup-choice-phone-title = Gjenopprettingstelefon
flow-setup-2fa-backup-choice-phone-badge = Enklest
flow-setup-2fa-backup-choice-phone-info = Få en gjenopprettingskode via tekstmelding. For øyeblikket tilgjengelig i USA og Canada.
flow-setup-2fa-backup-choice-code-title = Reserve-autentiseringskoder
flow-setup-2fa-backup-choice-code-badge = Tryggest
flow-setup-2fa-backup-choice-code-info = Opprett og lagre engangsautentiseringskoder.
flow-setup-2fa-backup-choice-learn-more-link = Les mer om gjenoppretting og SIM-swapping-risiko


flow-setup-2fa-backup-code-confirm-heading = Skriv inn reserve-autentiseringskode
flow-setup-2fa-backup-code-confirm-confirm-saved = Bekreft at du har lagret kodene dine ved å skrive inn en. Uten disse kodene kan du kanskje ikke logge på hvis du ikke har autentiseringsappen din.
flow-setup-2fa-backup-code-confirm-code-input = Skriv inn kode på 10 tegn
flow-setup-2fa-backup-code-confirm-button-finish = Fullfør


flow-setup-2fa-backup-code-dl-heading = Lagre reserve-autentiseringskoder
flow-setup-2fa-backup-code-dl-save-these-codes = Oppbevar disse på et sted du husker. Hvis du ikke har tilgang til autentiseringsappen din, må du oppgi en for å logge på.
flow-setup-2fa-backup-code-dl-button-continue = Fortsett


flow-setup-2fa-inline-complete-success-banner = Totrinns-autentisering aktivert
flow-setup-2fa-inline-complete-success-banner-description = For å beskytte alle tilkoblede enheter bør du logge ut overalt hvor du bruker denne kontoen, og deretter logge på igjen med den nye totrinnsautentiseringen din.
flow-setup-2fa-inline-complete-backup-code = Reserve-autentiseringskoder
flow-setup-2fa-inline-complete-backup-phone = Gjenopprettingstelefon
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } kode igjen
       *[other] { $count } koder igjen
    }
flow-setup-2fa-inline-complete-backup-code-description = Dette er den sikreste gjenopprettingsmetoden hvis du ikke kan logge på med mobilenheten eller autentiseringsappen din.
flow-setup-2fa-inline-complete-backup-phone-description = Dette er den enkleste gjenopprettingsmetoden hvis du ikke kan logge på med autentiseringsappen din.
flow-setup-2fa-inline-complete-learn-more-link = Slik beskytter dette kontoen din
flow-setup-2fa-inline-complete-continue-button = Fortsett til { $serviceName }
flow-setup-2fa-prompt-heading = Konfigurer totrinns-autentisering
flow-setup-2fa-prompt-description = { $serviceName } krever at du konfigurerer totrinns-autentisering for å holde kontoen din trygg.
flow-setup-2fa-prompt-use-authenticator-apps = Du kan bruke hvilken som helst av <authenticationAppsLink>disse autentiseringsappene</authenticationAppsLink> for å fortsette.
flow-setup-2fa-prompt-continue-button = Fortsett


flow-setup-phone-confirm-code-heading = Skriv inn bekreftelseskode
flow-setup-phone-confirm-code-instruction = En 6-sifret kode ble sendt til <span>{ $phoneNumber }</span> via tekstmelding. Denne koden utløper etter 5 minutter.
flow-setup-phone-confirm-code-input-label = Skriv inn 6-sifret kode
flow-setup-phone-confirm-code-button = Bekreft
flow-setup-phone-confirm-code-expired = Har koden utløpt?
flow-setup-phone-confirm-code-resend-code-button = Send koden på nytt
flow-setup-phone-confirm-code-resend-code-success = Kode sendt
flow-setup-phone-confirm-code-success-message-v2 = Gjenopprettingstelefon lagt til
flow-change-phone-confirm-code-success-message = Gjenopprettingstelefon endret


flow-setup-phone-submit-number-heading = Bekreft telefonnummeret ditt
flow-setup-phone-verify-number-instruction = Du vil motta en tekstmelding fra { -brand-mozilla } med en kode for å bekrefte nummeret ditt. Ikke del denne koden med noen.
flow-setup-phone-submit-number-info-message-v2 = Gjenopprettingstelefon er bare tilgjengelig i USA og Canada. VoIP-numre og telefonalias anbefales ikke.
flow-setup-phone-submit-number-legal = Ved å oppgi nummeret ditt, samtykker du i at vi lagrer det slik at vi kun kan sende deg tekstmeldinger for kontoverifisering. Meldings- og datatakster kan gjelde.
flow-setup-phone-submit-number-button = Send kode


header-menu-open = Lukk meny
header-menu-closed = Meny for nettstednavigering
header-back-to-top-link =
    .title = Tilbake til toppen
header-back-to-settings-link =
    .title = Tilbake til { -product-mozilla-account }-innstillinger
header-title-2 = { -product-mozilla-account }
header-help = Hjelp


la-heading = Tilknyttede kontoer
la-description = Du har autorisert tilgang til følgende kontoer.
la-unlink-button = Fjern tilknytning
la-unlink-account-button = Fjern tilknytning
la-set-password-button = Velg passord
la-unlink-heading = Fjern tilknyting til tredjepartskonto
la-unlink-content-3 = Er du sikker på at du vil fjerne tilknytningen til kontoen din? Det at du fjerner tilknytningen til kontoen din, logger deg ikke automatisk ut av de tilkoblede tjenestene dine. For å gjøre det må du logge deg ut manuelt fra seksjonen Tilkoblede tjenester.
la-unlink-content-4 = Før du fjerner tilknytningen til kontoen din, må du angi et passord. Uten et passord kan du ikke logge inn etter at du har fjernet tilknytningen til kontoen.
nav-linked-accounts = { la-heading }


modal-close-title = Lukk
modal-cancel-button = Avbryt
modal-default-confirm-button = Bekreft


modal-mfa-protected-title = Skriv inn bekreftelseskode
modal-mfa-protected-subtitle = Hjelp oss å forsikre oss om at det er du som endrer kontoinformasjonen din
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Skriv inn koden som ble sendt til <email>{ $email }</email> innen { $expirationTime } minutt.
       *[other] Skriv inn koden som ble sendt til <email>{ $email }</email> innen { $expirationTime } minutter.
    }
modal-mfa-protected-input-label = Skriv inn 6-sifret kode
modal-mfa-protected-cancel-button = Avbryt
modal-mfa-protected-confirm-button = Bekreft
modal-mfa-protected-code-expired = Har koden utløpt?
modal-mfa-protected-resend-code-link = Send ny kode på e-post.


mvs-verify-your-email-2 = Bekreft e-postadressen din
mvs-enter-verification-code-2 = Skriv inn bekreftelseskode
mvs-enter-verification-code-desc-2 = Skriv inn bekreftelseskoden som ble sendt til <email>{ $email }</email> innen 5 minutter.
msv-cancel-button = Avbryt
msv-submit-button-2 = Bekreft


nav-settings = Innstillinger
nav-profile = Profil
nav-security = Sikkerhet
nav-connected-services = Tilknyttede tjenester
nav-data-collection = Datainnsamling og -bruk
nav-paid-subs = Betalte abonnement
nav-email-comm = E-postkommunikasjon


page-2fa-change-title = Endre totrinns-autentisering
page-2fa-change-success = Totrinns-autentisering er oppdatert
page-2fa-change-success-additional-message = For å beskytte alle tilkoblede enheter bør du logge ut overalt hvor du bruker denne kontoen, og deretter logge på igjen med den nye totrinnsautentiseringen din.
page-2fa-change-totpinfo-error = Det oppstod en feil ved bytte av totrinns-autentiseringsappen. Prøv igjen senere.
page-2fa-change-qr-instruction = <strong>Trinn 1:</strong> Skann denne QR-koden med en autentiseringsapp, for eksempel Duo eller Google Authenticator. Dette oppretter en ny tilkobling, og eventuelle gamle tilkoblinger vil ikke lenger fungere.


tfa-backup-codes-page-title = Reserve-autentiseringskoder
tfa-replace-code-error-3 = Det oppstod et problem med å erstatte dine reserve-autentiseringskoder
tfa-create-code-error = Det oppstod et problem med å opprette dine reserve-autentiseringskoder
tfa-replace-code-success-alert-4 = Reserve-autentiseringskoder oppdatert
tfa-create-code-success-alert = Reserve-autentiseringskoder opprettet
tfa-replace-code-download-description = Oppbevar disse på et sted du husker. De gamle kodene dine vil bli erstattet etter at du har fullført neste trinn.
tfa-replace-code-confirm-description = Bekreft at du har lagret kodene dine ved å skrive inn en. De gamle reserve-autentiseringskodene dine vil bli deaktivert når dette trinnet er fullført.
tfa-incorrect-recovery-code-1 = Feil reserve-autentiseringskode


page-2fa-setup-title = Totrinns-autentisering
page-2fa-setup-totpinfo-error = Det oppstod en feil under oppsett av totrinns-autentisering. Prøv på nytt senere.
page-2fa-setup-incorrect-backup-code-error = Den koden er ikke riktig. Prøv på nytt.
page-2fa-setup-success = Totrinns-autentisering er aktivert
page-2fa-setup-success-additional-message = For å beskytte alle tilkoblede enheter bør du logge ut overalt hvor du bruker denne kontoen, og deretter logge på igjen med totrinnsautentisering.


avatar-page-title =
    .title = Profilbilde
avatar-page-add-photo = Legg til bilde
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Ta bilde
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Fjern bilde
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Ta bildet på nytt
avatar-page-cancel-button = Avbryt
avatar-page-save-button = Lagre
avatar-page-saving-button = Lagrer …
avatar-page-zoom-out-button =
    .title = Zoom ut
avatar-page-zoom-in-button =
    .title = Zoom inn
avatar-page-rotate-button =
    .title = Rotere
avatar-page-camera-error = Kunne ikke starte kameraet
avatar-page-new-avatar =
    .alt = nytt profilbilde
avatar-page-file-upload-error-3 = Det oppstod et problem med å laste opp profilbildet ditt.
avatar-page-delete-error-3 = Det oppstod et problem med å slette profilbildet ditt
avatar-page-image-too-large-error-2 = Bildefilen er for stor til å lastes opp


pw-change-header =
    .title = Endre passord
pw-8-chars = Minst 8 tegn
pw-not-email = Ikke e-postadressen din
pw-change-must-match = Nytt passord samsvarer med bekreftelsen
pw-commonly-used = Ikke et typisk brukt passord
pw-tips = Vær trygg — Ikke bruk passord på nytt. Se flere tips for å <linkExternal>lage sterke passord</linkExternal>.
pw-change-cancel-button = Avbryt
pw-change-save-button = Lagre
pw-change-forgot-password-link = Glemt passord?
pw-change-current-password =
    .label = Skriv inn nåværende passord
pw-change-new-password =
    .label = Skriv inn nytt passord
pw-change-confirm-password =
    .label = Bekreft nytt passord
pw-change-success-alert-2 = Passordet er oppdatert


pw-create-header =
    .title = Opprett passord
pw-create-success-alert-2 = Passord satt
pw-create-error-2 = Beklager, det oppstod et problem med å angi passordet ditt


delete-account-header =
    .title = Slett konto
delete-account-step-1-2 = Trinn 1 av 2
delete-account-step-2-2 = Trinn 2 av 2
delete-account-confirm-title-4 = Du kan ha koblet { -product-mozilla-account } til ett eller flere av følgende { -brand-mozilla }-produkter eller -tjenester som holder deg sikker og produktiv på nettet:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synkroniserer { -brand-firefox }-data
delete-account-product-firefox-addons = { -brand-firefox }-tillegg
delete-account-acknowledge = Bekreft at når du sletter kontoen din:
delete-account-chk-box-1-v4 =
    .label = Alle betalte abonnement du har vil bli sagt opp
delete-account-chk-box-2 =
    .label = Du kan miste lagret informasjon og funksjoner i { -brand-mozilla }-produkter
delete-account-chk-box-3 =
    .label = Gjenaktivering med denne e-postadressen vil kanskje ikke gjenopprette den lagrede informasjonen
delete-account-chk-box-4 =
    .label = Eventuelle utvidelser og temaer som du har publisert til addons.mozilla.org blir slettet
delete-account-continue-button = Fortsett
delete-account-password-input =
    .label = Skriv inn passord
delete-account-cancel-button = Avbryt
delete-account-delete-button-2 = Slett


display-name-page-title =
    .title = Visningsnavn
display-name-input =
    .label = Skriv inn visningsnavn
submit-display-name = Lagre
cancel-display-name = Avbryt
display-name-update-error-2 = Det oppstod et problem med å oppdatere visningsnavnet ditt.
display-name-success-alert-2 = Visningsnavn oppdatert


recent-activity-title = Nylig kontoaktivitet
recent-activity-account-create-v2 = Konto opprettet
recent-activity-account-disable-v2 = Konto deaktivert
recent-activity-account-enable-v2 = Konto aktivert
recent-activity-account-login-v2 = Kontoinnlogging startet
recent-activity-account-reset-v2 = Tilbakestilling av passord startet
recent-activity-emails-clearBounces-v2 = E-postavvisinger fjernet
recent-activity-account-login-failure = Forsøk på kontoinnlogging mislyktes
recent-activity-account-two-factor-added = Totrinns-autentisering aktivert
recent-activity-account-two-factor-requested = Totrinns-autentisering forespurt
recent-activity-account-two-factor-failure = Totrinns-autentisering mislyktes
recent-activity-account-two-factor-success = Totrinns-autentisering vellykket
recent-activity-account-two-factor-removed = Totrinns-autentisering fjernet
recent-activity-account-password-reset-requested = Kontoen forespurte tilbakestilling av passord
recent-activity-account-password-reset-success = Tilbakestilling av kontopassordet var vellykket
recent-activity-account-recovery-key-added = Kontogjenopprettingsnøkkel aktivert
recent-activity-account-recovery-key-verification-failure = Bekreftelse av kontogjenopprettingsnøkkel mislyktes
recent-activity-account-recovery-key-verification-success = Bekreftelse av kontogjenopprettingsnøkkel var vellykket
recent-activity-account-recovery-key-removed = Gjenopprettingsnøkkel for konto fjernet
recent-activity-account-password-added = Nytt passord lagt til
recent-activity-account-password-changed = Passordet er endret
recent-activity-account-secondary-email-added = Sekundær e-postadresse lagt til
recent-activity-account-secondary-email-removed = Sekundær e-postadesse fjernet
recent-activity-account-emails-swapped = Primær og sekundær e-postadresse byttet om
recent-activity-session-destroy = Logget ut av økten
recent-activity-account-recovery-phone-send-code = Gjenopprettingstelefon-kode sendt
recent-activity-account-recovery-phone-setup-complete = Konfigurasjonen av gjenopprettingstelefon er fullført
recent-activity-account-recovery-phone-signin-complete = Innlogging med gjenopprettingstelefon fullført
recent-activity-account-recovery-phone-signin-failed = Innlogging med gjenopprettingstelefon mislyktes
recent-activity-account-recovery-phone-removed = Gjenopprettingstelefonen er fjernet
recent-activity-account-recovery-codes-replaced = Gjenopprettingskoder erstattet
recent-activity-account-recovery-codes-created = Gjenopprettingskoder opprettet
recent-activity-account-recovery-codes-signin-complete = Innlogging med gjenopprettingskoder fullført
recent-activity-password-reset-otp-sent = Bekreftelseskode for tilbakestilling av passord sendt
recent-activity-password-reset-otp-verified = Bekreftelseskode for tilbakestilling av passord bekreftet
recent-activity-must-reset-password = Tilbakestilling av passord kreves
recent-activity-unknown = Annen kontoaktivitet


recovery-key-create-page-title = Kontogjenopprettingsnøkkel
recovery-key-create-back-button-title = Tilbake til innstillingene


recovery-phone-remove-header = Fjern gjenopprettingstelefonnummeret
settings-recovery-phone-remove-info = Dette vil fjerne <strong>{ $formattedFullPhoneNumber }</strong> som gjenopprettingstelefonnummeret ditt.
settings-recovery-phone-remove-recommend = Vi anbefaler at du beholder denne metoden fordi den er enklere enn å lagre reserve-autentiseringskoder.
settings-recovery-phone-remove-recovery-methods = Hvis du sletter den, må du sørge for at du fortsatt har dine lagrede reserve-autentiseringskoder. <linkExternal>Sammenlign gjenopprettingsmetoder</linkExternal>
settings-recovery-phone-remove-button = Fjern telefonnummeret
settings-recovery-phone-remove-cancel = Avbryt
settings-recovery-phone-remove-success = Gjenopprettingstelefonen er fjernet


page-setup-recovery-phone-heading = Legg til gjenopprettingstelefon
page-change-recovery-phone = Endre gjenopprettingstelefon
page-setup-recovery-phone-back-button-title = Tilbake til innstillinger
page-setup-recovery-phone-step2-back-button-title = Endre telefonnummer


add-secondary-email-step-1 = Trinn 1 av 2
add-secondary-email-error-2 = Det oppstod et problem med å opprette denne e-posten.
add-secondary-email-page-title =
    .title = Sekundær e-postadresse
add-secondary-email-enter-address =
    .label = Skriv inn e-postadresse
add-secondary-email-cancel-button = Avbryt
add-secondary-email-save-button = Lagre
add-secondary-email-mask = E-postalias kan ikke brukes som en sekundær e-postadresse


add-secondary-email-step-2 = Trinn 2 av 2
verify-secondary-email-page-title =
    .title = Sekundær e-postadresse
verify-secondary-email-verification-code-2 =
    .label = Skriv inn bekreftelseskoden din
verify-secondary-email-cancel-button = Avbryt
verify-secondary-email-verify-button-2 = Bekreft
verify-secondary-email-please-enter-code-2 = Skriv inn bekreftelseskoden som ble sendt til <strong>{ $email }</strong> innen 5 minutter.
verify-secondary-email-success-alert-2 = { $email } lagt til
verify-secondary-email-resend-code-button = Send bekreftelseskoden på nytt


delete-account-link = Slett kontoen
inactive-update-status-success-alert = Innlogget. { -product-mozilla-account }-en og dataene dine vil forbli aktive.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Finn ut hvor din private informasjon er eksponert og ta kontroll
product-promo-monitor-cta = Få gratis skanning


profile-heading = Profil
profile-picture =
    .header = Bilde
profile-display-name =
    .header = Visningsnavn
profile-primary-email =
    .header = Primær e-post


progress-bar-aria-label-v2 = Trinn { $currentStep } av { $numberOfSteps }.


security-heading = Sikkerhet
security-password =
    .header = Passord
security-password-created-date = Opprettet den { $date }
security-not-set = Ikke angitt
security-action-create = Opprett
security-set-password = Angi et passord for å synkronisere og bruke visse sikkerhetsfunksjoner for kontoen.
security-recent-activity-link = Vis nylig kontoaktivitet
signout-sync-header = Økten har utløpt
signout-sync-session-expired = Beklager, noe gikk galt. Logg ut fra nettlesermenyen og prøv på nytt.


tfa-row-backup-codes-title = Reserve-autentiseringskoder
tfa-row-backup-codes-not-available = Ingen koder er tilgjengelige
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } kode igjen
       *[other] { $numCodesAvailable } koder igjen
    }
tfa-row-backup-codes-get-new-cta-v2 = Opprett nye koder
tfa-row-backup-codes-add-cta = Legg til
tfa-row-backup-codes-description-2 = Dette er den sikreste gjenopprettingsmetoden hvis du ikke kan bruke mobilenheten eller autentiseringsappen din.
tfa-row-backup-phone-title-v2 = Gjenopprettingstelefon
tfa-row-backup-phone-not-available-v2 = Ingen telefonnummer lagt til
tfa-row-backup-phone-change-cta = Endre
tfa-row-backup-phone-add-cta = Legg til
tfa-row-backup-phone-delete-button = Fjern
tfa-row-backup-phone-delete-title-v2 = Fjern gjenopprettingstelefonnummeret
tfa-row-backup-phone-delete-restriction-v2 = Hvis du vil fjerne gjenopprettingstelefonen din, må du legge til reserve-autentiseringskoder eller deaktivere totrinns-autentisering først for å unngå å bli låst ute av kontoen din.
tfa-row-backup-phone-description-v2 = Dette er den enkleste gjenopprettingsmetoden hvis du ikke kan bruke autentiseringsappen din.
tfa-row-backup-phone-sim-swap-risk-link = Les mer om SIM-swapping-risiko
passkey-sub-row-created-date = Opprettet: { $createdDate }
passkey-sub-row-last-used-date = Sist brukt: { $lastUsedDate }
passkey-sub-row-sign-in-only = Kun pålogging. Kan ikke brukes til synkronisering.
passkey-sub-row-delete-title = Slett passnøkkel
passkey-delete-modal-heading = Slette passnøkkelen din?
passkey-delete-modal-content = Denne passnøkkelen vil bli fjernet fra kontoen din. Du må logge inn på en annen måte.
passkey-delete-modal-cancel-button = Avbryt
passkey-delete-modal-confirm-button = Slett passnøkkel
passkey-delete-success = Passnøkkel slettet
passkey-delete-error = Det oppsto et problem med å slette passnøkkelen din. Prøv igjen om noen minutter.


switch-turn-off = Slå av
switch-turn-on = Slå på
switch-submitting = Sender inn…
switch-is-on = på
switch-is-off = av


row-defaults-action-add = Legg til
row-defaults-action-change = Endre
row-defaults-action-disable = Slå av
row-defaults-status = Ingen


passkey-row-header = Passnøkkler
passkey-row-enabled = Påslått
passkey-row-not-set = Ikke angitt
passkey-row-action-create = Opprett
passkey-row-description = Gjør innlogging enklere og sikrere ved å bruke telefonen din eller en annen støttet enhet for å få tilgang til kontoen din.
passkey-row-info-link = Slik beskytter dette kontoen din


rk-header-1 = Kontogjenopprettingsnøkkel
rk-enabled = Slått på
rk-not-set = Ikke angitt
rk-action-create = Opprett
rk-action-change-button = Endre
rk-action-remove = Fjern
rk-key-removed-2 = Kontogjenopprettingsnøkkelen er fjernet
rk-cannot-remove-key = Kunne ikke fjerne kontogjenopprettingsnøkkelen.
rk-refresh-key-1 = Oppdater kontogjenopprettingsnøkkelen
rk-content-explain = Gjenopprett informasjonen din når du glemmer passordet ditt.
rk-cannot-verify-session-4 = Beklager, det oppstod et problem med å bekrefte økten din
rk-remove-modal-heading-1 = Fjerne kontogjenopprettingsnøkkel?
rk-remove-modal-content-1 = Hvis du tilbakestiller passordet ditt, vil du ikke kunne bruke kontogjenopprettingsnøkkelen din til å få tilgang til dataene dine. Du kan ikke angre denne handlingen.
rk-remove-error-2 = Kunne ikke fjerne kontogjenopprettingsnøkkelen
unit-row-recovery-key-delete-icon-button-title = Slett kontogjenopprettingsnøkkelen


se-heading = Sekundær e-postadresse
    .header = Sekundær e-postadresse
se-cannot-refresh-email = Dessverre oppstod det et problem med å oppdatere e-postadressen.
se-cannot-resend-code-3 = Beklager, det oppstod et problem med å sende bekreftelseskoden
se-set-primary-successful-2 = { $email } er nå din primære e-postadresse
se-set-primary-error-2 = Beklager, det oppstod et problem med å endre den primære e-postadressen din.
se-delete-email-successful-2 = { $email } er slettet
se-delete-email-error-2 = Beklager, det oppstod et problem med å slette denne e-postadressen.
se-verify-session-3 = Du må bekrefte din nåværende økt for å utføre denne handlingen.
se-verify-session-error-3 = Beklager, det oppstod et problem med å bekrefte økten din
se-remove-email =
    .title = Fjern e-postadresse
se-refresh-email =
    .title = Oppdater e-postadresse
se-unverified-2 = ubekreftet
se-resend-code-2 = Bekreftelse kreves. <button>Send bekreftelseskoden på nytt</button> hvis den ikke er i innboksen eller spam-mappen din.
se-make-primary = Gjør til primær
se-default-content = Få tilgang til kontoen din hvis du ikke kan logge inn med den primære e-postadressen din.
se-content-note-1 = Merk: En sekundær e-postadresse gjenoppretter ikke informasjonen din — du trenger en <a>kontogjenopprettingsnøkkel</a> for det.
se-secondary-email-none = Ingen


tfa-row-header = Totrinns-autentisering
tfa-row-enabled = Slått på
tfa-row-disabled-status = Slått av
tfa-row-action-add = Legg til
tfa-row-action-disable = Slå av
tfa-row-action-change = Endre
tfa-row-button-refresh =
    .title = Oppdater totrinns-autentisering
tfa-row-cannot-refresh = Dessverre oppstod det et problem med å oppdatere totrinns-autentisering.
tfa-row-enabled-description = Kontoen din er beskyttet av totrinns-autentisering. Du må oppgi en engangskode fra autentiseringsappen din når du logger deg på { -product-mozilla-account }.
tfa-row-enabled-info-link = Slik beskytter dette kontoen din
tfa-row-disabled-description-v2 = Bidra til å sikre kontoen din ved å bruke en tredjeparts autentiseringsapp som et andre trinn for å logge inn.
tfa-row-cannot-verify-session-4 = Beklager, det oppstod et problem med å bekrefte økten din
tfa-row-disable-modal-heading = Slå av totrinns-autentisering
tfa-row-disable-modal-confirm = Slå av
tfa-row-disable-modal-explain-1 = Du kan ikke angre denne handlingen. Du har også muligheten til å <linkExternal>erstatte reserve-autentiseringskodene dine</linkExternal>.
tfa-row-disabled-2 = Totrinns-autentisering deaktivert
tfa-row-cannot-disable-2 = Totrinns-autentisering kunne ikke deaktiveres
tfa-row-verify-session-info = Du må bekrefte din nåværende økt for å konfigurere totrinns-autentisering


terms-privacy-agreement-intro-3 = Ved å fortsette godtar du følgende:
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>Bruksvilkår</termsLink> og <privacyLink>personvernerklæring</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") }: <mozillaAccountsTos>bruksvilkår</mozillaAccountsTos> og <mozillaAccountsPrivacy>personvernerklæring</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = Ved å fortsette godtar du <mozillaAccountsTos>bruksvilkårene</mozillaAccountsTos> og <mozillaAccountsPrivacy>personvernerklæringen</mozillaAccountsPrivacy>.


third-party-auth-options-or = eller
third-party-auth-options-sign-in-with = Logg inn med
continue-with-google-button = Fortsett med { -brand-google }
continue-with-apple-button = Fortsett med { -brand-apple }


auth-error-102 = Ukjent konto
auth-error-103 = Feil passord
auth-error-105-2 = Ugyldig bekreftelseskode
auth-error-110 = Ugyldig token
auth-error-114-generic = Du har prøvd for mange ganger. Prøv igjen senere.
auth-error-114 = Du har prøvd for mange ganger. Prøv igjen { $retryAfter }.
auth-error-125 = Forespørselen ble blokkert av sikkerhetsmessige årsaker
auth-error-129-2 = Du skrev inn et ugyldig telefonnummer. Sjekk det og prøv på nytt.
auth-error-138-2 = Ubekreftet økt
auth-error-139 = Sekundær e-postadresse må være forskjellig fra e-postadressen til din konto
auth-error-144 = Denne e-postadressen er reservert av en annen konto. Prøv igjen senere, eller bruk en annen e-postadresse.
auth-error-155 = TOTP-token ikke funnet
auth-error-156 = Fant ikke reserve-autentiseringskode
auth-error-159 = Ugyldig kontogjenopprettingsnøkkel
auth-error-183-2 = Ugyldig eller utløpt bekreftelseskode
auth-error-202 = Funksjonen er ikke slått på
auth-error-203 = Systemet er utilgjengelig, prøv igjen senere
auth-error-206 = Kan ikke opprette passord, passordet er allerede angitt
auth-error-214 = Telefonnummeret for gjenoppretting finnes allerede
auth-error-215 = Telefonnummeret for gjenoppretting finnes ikke
auth-error-216 = Grensen for tekstmeldinger er nådd
auth-error-218 = Kan ikke fjerne gjenopprettingstelefonen, mangler reserve-autentiseringskoder.
auth-error-219 = Dette telefonnummeret er registrert med for mange kontoer. Prøv et annet nummer.
auth-error-999 = Uventet feil
auth-error-1001 = Innloggingsforsøk avbrutt
auth-error-1002 = Økt utløpt. Logg inn for å fortsette.
auth-error-1003 = Lokal lagring eller infokapsler er fortsatt slått av
auth-error-1008 = Ditt nye passord må være forskjellig
auth-error-1010 = Gyldig passord kreves
auth-error-1011 = Gyldig e-postadresse er nødvendig
auth-error-1018 = Bekreftelsesmeldingen kom i retur. Feilstavet e-postadresse?
auth-error-1020 = Feilstavet e-postadresse? firefox.com er ikke en gyldig e-posttjeneste
auth-error-1031 = Du må oppgi alder for å registrere deg
auth-error-1032 = Du må skrive inn en gyldig alder for å registrere deg
auth-error-1054 = Feil totrinns-autentiseringskode
auth-error-1056 = Ugyldig reserve-autentiseringskode
auth-error-1062 = Ugyldig omdirigering
auth-error-1064 = Feilstavet e-postadresse? { $domain } er ikke en gyldig e-posttjeneste
auth-error-1066 = E-postaliaser kan ikke brukes til å opprette en konto.
auth-error-1067 = Feilskreven e-postadresse?
recovery-phone-number-ending-digits = Nummer som slutter på { $lastFourPhoneNumber }
oauth-error-1000 = Noe gikk galt. Lukk denne fanen og prøv på nytt.


connect-another-device-signed-in-header = Du er logget inn på { -brand-firefox }
connect-another-device-email-confirmed-banner = E-post bekreftet
connect-another-device-signin-confirmed-banner = Innlogging bekreftet
connect-another-device-signin-to-complete-message = Logg inn på denne { -brand-firefox } for å fullføre oppsettet
connect-another-device-signin-link = Logg inn
connect-another-device-still-adding-devices-message = Vil du fortsatt legge til enheter? Logg inn på { -brand-firefox } på en annen enhet for å fullføre oppsettet
connect-another-device-signin-another-device-to-complete-message = Logg inn på { -brand-firefox } på en annen enhet for å fullføre oppsettet.
connect-another-device-get-data-on-another-device-message = Vil du ha fanene, bokmerkene og passordene dine på en annen enhet?
connect-another-device-cad-link = Koble til en annen enhet
connect-another-device-not-now-link = Ikke nå
connect-another-device-android-complete-setup-message = Logg inn på { -brand-firefox } for Android for å fullføre oppsettet.
connect-another-device-ios-complete-setup-message = Logg inn på { -brand-firefox } for iOS for å fullføre oppsettet.


cookies-disabled-header = Lokal lagring og infokapsler er påkrevd
cookies-disabled-enable-prompt-2 = Slå på infokapsler og lokal lagring i nettleseren din for å få tilgang til din { -product-mozilla-account }. Dette vil aktivere funksjonalitet som for eksempel å huske deg mellom økter.
cookies-disabled-button-try-again = Prøv igjen
cookies-disabled-learn-more = Les mer


index-header = Skriv inn e-postadressen din
index-sync-header = Fortsett til din { -product-mozilla-account }
index-sync-subheader = Synkroniser passordene, fanene og bokmerkene dine overalt hvor du bruker { -brand-firefox }.
index-relay-header = Opprett et e-postalias
index-relay-subheader = Oppgi e-postadressen du vil videresende e-poster til fra den maskerte e-postadressen din.
index-subheader-with-servicename = Fortsett til { $serviceName }
index-subheader-default = Fortsett til kontoinnstillingene
index-cta = Registrer deg eller logg inn
index-account-info = En { -product-mozilla-account } gir også tilgang til flere personvernbeskyttende produkter fra { -brand-mozilla }.
index-email-input =
    .label = Skriv inn e-postadressen din
index-account-delete-success = Kontoen er nå slettet
index-email-bounced = Bekreftelsesmeldingen kom i retur. Feilstavet e-postadresse?


inline-recovery-key-setup-create-error = Beklager! Vi kunne ikke opprette kontogjenopprettingsnøkkelen din. Prøv på nytt senere.
inline-recovery-key-setup-recovery-created = Kontogjenopprettingsnøkkel opprettet
inline-recovery-key-setup-download-header = Sikre kontoen din
inline-recovery-key-setup-download-subheader = Last ned og oppbevar den nå
inline-recovery-key-setup-download-info = Oppbevar denne nøkkelen et sted du husker — du vil ikke kunne komme tilbake til denne siden senere.
inline-recovery-key-setup-hint-header = Sikkerhetsanbefaling


inline-totp-setup-cancel-setup-button = Avbryt oppsett
inline-totp-setup-continue-button = Fortsett
inline-totp-setup-add-security-link = Legg til et ekstra sikkerhetslag til kontoen din ved å kreve sikkerhetskoder fra en av <authenticationAppsLink>disse godkjenningsappene</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Aktiver totrinns-autentisering <span>for å fortsette til kontoinnstillingene</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Aktiver totrinns-autentisering <span>for å fortsette til { $serviceName }</span>
inline-totp-setup-ready-button = Klar
inline-totp-setup-show-qr-custom-service-header-2 = Skann autentiseringskoden <span>for å fortsette til { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Skriv inn koden manuelt <span>for å fortsette til { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Skann autentiseringskoden <span>for å fortsette til kontoinnstillingene</span>
inline-totp-setup-no-qr-default-service-header-2 = Skriv inn koden manuelt <span>for å fortsette til kontoinnstillingene</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Skriv inn denne hemmelige nøkkelen i autentiseringsappen din. <toggleToQRButton>Skanne QR-koden i stedet?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Skann QR-koden i autentiseringsappen din, og skriv deretter inn autentiseringskoden den oppgir. <toggleToManualModeButton>Kan ikke skanne koden?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Når det er ferdig, vil det begynne å generere autentiseringskoder som du må taste inn.
inline-totp-setup-security-code-placeholder = Autentiseringskode
inline-totp-setup-code-required-error = Autentiseringskode kreves
tfa-qr-code-alt = Bruk koden { $code } for å sette opp totrinns-autentisering i støttede apper.
inline-totp-setup-page-title = Totrinns-autentisering


legal-header = Juridisk
legal-terms-of-service-link = Bruksvilkår
legal-privacy-link = Personvernerklæring


legal-privacy-heading = Personvernerklæring


legal-terms-heading = Bruksvilkår


pair-auth-allow-heading-text = Logget du akkurat inn på { -product-firefox }?
pair-auth-allow-confirm-button = Ja, godkjenn enheten
pair-auth-allow-refuse-device-link = Hvis det ikke var deg, <link>endre passordet ditt</link>


pair-auth-complete-heading = Enhet tilkoblet
pair-auth-complete-now-syncing-device-text = Du synkroniserer nå med: { $deviceFamily } på { $deviceOS }
pair-auth-complete-sync-benefits-text = Nå kan du få tilgang til åpne faner, passord og bokmerker på alle enhetene dine.
pair-auth-complete-see-tabs-button = Se faner fra synkroniserte enheter
pair-auth-complete-manage-devices-link = Behandle enheter


auth-totp-heading-w-default-service = Skriv inn autentiseringskoden <span>for å fortsette til kontoinnstillingene</span>
auth-totp-heading-w-custom-service = Skriv inn autentiseringskoden <span>for å fortsette til { $serviceName }</span>
auth-totp-instruction = Åpne autentiseringsappen din og skriv inn autentiseringskoden den oppgir.
auth-totp-input-label = Skriv inn 6-sifret kode
auth-totp-confirm-button = Bekreft
auth-totp-code-required-error = Autentiseringskode kreves


pair-wait-for-supp-heading-text = Godkjenning kreves nå <span>fra den andre enheten din</span>


pair-failure-header = Paring mislyktes
pair-failure-message = Installasjonsprosessen ble avsluttet.


pair-sync-header = Synkroniser { -brand-firefox } på telefonen eller nettbrettet ditt
pair-cad-header = Koble til { -brand-firefox } på en annen enhet
pair-already-have-firefox-paragraph = Har du allerede { -brand-firefox } på en telefon eller et nettbrett?
pair-sync-your-device-button = Synkroniser enheten din
pair-or-download-subheader = Eller last ned
pair-scan-to-download-message = Skann for å laste ned { -brand-firefox } for mobil, eller send deg selv en <linkExternal>nedlastingslenke</linkExternal>.
pair-not-now-button = Ikke nå
pair-take-your-data-message = Ta med deg faner, bokmerker og passord hvor enn du bruker { -brand-firefox }.
pair-get-started-button = Kom i gang
pair-qr-code-aria-label = QR-kode


pair-success-header-2 = Enhet tilkoblet
pair-success-message-2 = Paring vellykket.


pair-supp-allow-heading-text = Bekreft paring <span>for { $email }</span>
pair-supp-allow-confirm-button = Bekreft paring
pair-supp-allow-cancel-link = Avbryt


pair-wait-for-auth-heading-text = Godkjenning kreves nå <span>fra den andre enheten din</span>


pair-unsupported-header = Paring via en app
pair-unsupported-message = Brukte du systemkameraet? Du må koble til fra en { -brand-firefox }-app.




set-password-heading-v2 = Opprett passord for å synkronisere
set-password-info-v2 = Dette krypterer dataene dine. Det må være forskjellig fra passordet til { -brand-google }- eller { -brand-apple }-kontoen din.


third-party-auth-callback-message = Vent litt, du blir omdirigert til det autoriserte programmet.


account-recovery-confirm-key-heading = Skriv inn kontogjenopprettingsnøkkelen din
account-recovery-confirm-key-instruction = Denne nøkkelen gjenoppretter krypterte nettleserdata, for eksempel passord og bokmerker, fra { -brand-firefox }-servere.
account-recovery-confirm-key-input-label =
    .label = Skriv inn kontogjenopprettingsnøkkelen din på 32 tegn
account-recovery-confirm-key-hint = Oppbevaringshintet ditt er:
account-recovery-confirm-key-button-2 = Fortsett
account-recovery-lost-recovery-key-link-2 = Finner du ikke kontogjenopprettingsnøkkelen din?


complete-reset-pw-header-v2 = Opprett et nytt passord
complete-reset-password-success-alert = Passord angitt
complete-reset-password-error-alert = Beklager, det oppstod et problem med å angi passordet ditt
complete-reset-pw-recovery-key-link = Bruk kontogjenopprettingsnøkkel
reset-password-complete-banner-heading = Passordet ditt har blitt tilbakestilt.
reset-password-complete-banner-message = Ikke glem å generere en ny kontogjenopprettingsnøkkel fra innstillingene dine for { -product-mozilla-account } for å forhindre fremtidige innloggingsproblemer.
complete-reset-password-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.


confirm-backup-code-reset-password-input-label = Skriv inn kode på 10 tegn
confirm-backup-code-reset-password-confirm-button = Bekreft
confirm-backup-code-reset-password-subheader = Skriv inn reserve-autentiseringskode
confirm-backup-code-reset-password-instruction = Skriv inn en av engangskodene du lagret da du konfigurerte totrinns-autentisering.
confirm-backup-code-reset-password-locked-out-link = Er du utestengt?


confirm-reset-password-with-code-heading = Sjekk e-posten din
confirm-reset-password-with-code-instruction = Vi sendte en bekreftelseskode til <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Skriv inn 8-sifret kode innen 10 minutter
confirm-reset-password-otp-submit-button = Fortsett
confirm-reset-password-otp-resend-code-button = Send koden på nytt
confirm-reset-password-otp-different-account-link = Bruk en annen konto


confirm-totp-reset-password-header = Tilbakestill passordet ditt
confirm-totp-reset-password-subheader-v2 = Skriv inn totrinns-autentiseringskode
confirm-totp-reset-password-instruction-v2 = Sjekk <strong>autentiseringsappen</strong> din for å tilbakestille passordet ditt.
confirm-totp-reset-password-trouble-code = Har du problemer med å oppgi kode?
confirm-totp-reset-password-confirm-button = Bekreft
confirm-totp-reset-password-input-label-v2 = Skriv inn 6-sifret kode
confirm-totp-reset-password-use-different-account = Bruk en annen konto


password-reset-flow-heading = Tilbakestill passordet ditt
password-reset-body-2 =
    Vi ber om et par ting som bare du vet for å holde kontoen din
    trygg.
password-reset-email-input =
    .label = Skriv inn e-postadressen din
password-reset-submit-button-2 = Fortsett


reset-password-complete-header = Passordet ditt er tilbakestilt
reset-password-confirmed-cta = Fortsett til { $serviceName }




password-reset-recovery-method-header = Tilbakestill passord
password-reset-recovery-method-subheader = Velg en gjenopprettingsmetode
password-reset-recovery-method-details = La oss forsikre oss om at det er du som bruker gjenopprettingsmetodene dine.
password-reset-recovery-method-phone = Gjenopprettingstelefon
password-reset-recovery-method-code = Reserve-autentiseringskoder
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kode igjen
       *[other] { $numBackupCodes } koder igjen
    }
password-reset-recovery-method-send-code-error-heading = Det oppstod et problem da en kode skulle sendes til gjenopprettingstelefonen din
password-reset-recovery-method-send-code-error-description = Prøv igjen senere, eller bruk reserve-autentiseringskodene dine.


reset-password-recovery-phone-flow-heading = Tilbakestill passord
reset-password-recovery-phone-heading = Oppgi gjenopprettingskode
reset-password-recovery-phone-instruction-v3 = En 6-sifret kode ble sendt til telefonnummeret som slutter på <span>{ $lastFourPhoneDigits }</span> via tekstmelding. Denne koden utløper etter 5 minutter. Ikke del denne koden med noen.
reset-password-recovery-phone-input-label = Skriv inn 6-sifret kode
reset-password-recovery-phone-code-submit-button = Bekreft
reset-password-recovery-phone-resend-code-button = Send koden på nytt
reset-password-recovery-phone-resend-success = Kode sendt
reset-password-recovery-phone-locked-out-link = Er du utestengt?
reset-password-recovery-phone-send-code-error-heading = Det oppstod et problem med å sende en kode
reset-password-recovery-phone-code-verification-error-heading = Det oppstod et problem med å bekrefte koden din.
reset-password-recovery-phone-general-error-description = Prøv igjen senere.
reset-password-recovery-phone-invalid-code-error-description = Koden er ugyldig eller utløpt.
reset-password-recovery-phone-invalid-code-error-link = Bruk reserve-autentiseringskoder i stedet?
reset-password-with-recovery-key-verified-page-title = Passordet er tilbakestilt
reset-password-complete-new-password-saved = Nytt passord lagret!
reset-password-complete-recovery-key-created = Ny kontogjenopprettingsnøkkel er opprettet. Last ned og oppbevar den nå.
reset-password-complete-recovery-key-download-info =
    Denne nøkkelen er viktig for
    datagjenoppretting hvis du glemmer passordet ditt. <b>Last ned og lagre den sikkert
    nå, da du ikke vil kunne få tilgang til denne siden igjen senere.</b>


error-label = Feil:
validating-signin = Validerer innlogging …
complete-signin-error-header = Bekreftelsesfeil
signin-link-expired-header = Bekreftelseslenken er utløpt
signin-link-expired-message-2 = Lenken du klikket på er utløpt eller har allerede blitt brukt.


signin-password-needed-header-2 = Skriv inn passordet ditt <span>for { -product-mozilla-account } din</span>
signin-subheader-without-logo-with-servicename = Fortsett til { $serviceName }
signin-subheader-without-logo-default = Fortsett til kontoinnstillingene
signin-button = Logg inn
signin-header = Logg inn
signin-use-a-different-account-link = Bruk en annen konto
signin-forgot-password-link = Glemt passord?
signin-password-button-label = Passord
signin-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.
signin-code-expired-error = Koden er utløpt. Logg inn på nytt.
signin-recovery-error = Noe gikk galt. Logg inn på nytt.
signin-account-locked-banner-heading = Tilbakestill passord
signin-account-locked-banner-description = Vi låste kontoen din for å beskytte den mot mistenkelig aktivitet.
signin-account-locked-banner-link = Tilbakestill passordet ditt for å logge inn


report-signin-link-damaged-body = Lenken du klikket på mangler noen tegn, og kan ha blitt forandret av e-postklienten. Sjekk at du kopierte riktig, og prøv igjen.
report-signin-header = Rapporter uautorisert innlogging?
report-signin-body = Du har fått e-post om forsøk på å få tilgang til kontoen din. Vil du rapportere denne aktiviteten som mistenkelig?
report-signin-submit-button = Rapporter aktivitet
report-signin-support-link = Hvorfor skjer dette?
report-signin-error = Beklager, det oppstod et problem under innsending av rapporten.
signin-bounced-header = Beklager. Vi har låst kontoen din.
signin-bounced-message = Bekreftelsesmeldingen vi sendte til { $email } ble returnert, og vi har låst kontoen din for å beskytte dataene dine i { -brand-firefox }.
signin-bounced-help = Om dette er en gyldig e-postadresse, <linkExternal>la oss få vite det</linkExternal> slik at vi kan hjelpe deg med å låse opp kontoen din.
signin-bounced-create-new-account = Har du ikke lenger denne e-postadressen? Lag en ny konto
back = Tilbake


signin-push-code-heading-w-default-service = Bekreft denne innloggingen <span>for å fortsette til kontoinnstillingene</span>
signin-push-code-heading-w-custom-service = Bekreft denne innloggingen <span>for å fortsette til { $serviceName }</span>
signin-push-code-instruction = Sjekk de andre enhetene dine og godkjenn denne påloggingen fra { -brand-firefox }-nettleseren din.
signin-push-code-did-not-recieve = Har du ikke mottatt varselet?
signin-push-code-send-email-link = E-postkode


signin-push-code-confirm-instruction = Bekreft innloggingen din
signin-push-code-confirm-description = Vi oppdaget et påloggingsforsøk fra følgende enhet. Hvis dette var deg, godkjenn påloggingen.
signin-push-code-confirm-verifying = Kontrollerer
signin-push-code-confirm-login = Bekreft innlogging
signin-push-code-confirm-wasnt-me = Det var ikke meg, endre passordet.
signin-push-code-confirm-login-approved = Påloggingen din er godkjent. Lukk dette vinduet.
signin-push-code-confirm-link-error = Lenken er skadet. Prøv på nytt.


signin-recovery-method-header = Logg inn
signin-recovery-method-subheader = Velg en gjenopprettingsmetode
signin-recovery-method-details = La oss forsikre oss om at det er du som bruker gjenopprettingsmetodene dine.
signin-recovery-method-phone = Gjenopprettingstelefon
signin-recovery-method-code-v2 = Reserve-autentiseringskoder
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kode igjen
       *[other] { $numBackupCodes } koder igjen
    }
signin-recovery-method-send-code-error-heading = Det oppstod et problem da en kode skulle sendes til gjenopprettingstelefonen din
signin-recovery-method-send-code-error-description = Prøv igjen senere, eller bruk reserve-autentiseringskodene dine.


signin-recovery-code-heading = Logg inn
signin-recovery-code-sub-heading = Skriv inn reserve-autentiseringskode
signin-recovery-code-instruction-v3 = Skriv inn en av engangskodene du lagret da du konfigurerte totrinns-autentisering.
signin-recovery-code-input-label-v2 = Skriv inn kode på 10 tegn
signin-recovery-code-confirm-button = Bekreft
signin-recovery-code-phone-link = Bruk gjenopprettingstelefonnummer
signin-recovery-code-support-link = Er du utestengt?
signin-recovery-code-required-error = Reserve-autentiseringskode påkrevd
signin-recovery-code-use-phone-failure = Det oppstod et problem da en kode skulle sendes til gjenopprettingstelefonen din
signin-recovery-code-use-phone-failure-description = Prøv igjen senere.


signin-recovery-phone-flow-heading = Logg inn
signin-recovery-phone-heading = Oppgi gjenopprettingskode
signin-recovery-phone-instruction-v3 = En 6-sifret kode ble sendt til telefonnummeret som slutter på <span>{ $lastFourPhoneDigits }</span> via tekstmelding. Denne koden utløper etter 5 minutter. Ikke del denne koden med noen.
signin-recovery-phone-input-label = Skriv inn 6-sifret kode
signin-recovery-phone-code-submit-button = Bekreft
signin-recovery-phone-resend-code-button = Send koden på nytt
signin-recovery-phone-resend-success = Kode sendt
signin-recovery-phone-locked-out-link = Er du utestengt?
signin-recovery-phone-send-code-error-heading = Det oppstod et problem med å sende en kode
signin-recovery-phone-code-verification-error-heading = Det oppstod et problem med å bekrefte koden din.
signin-recovery-phone-general-error-description = Prøv igjen senere.
signin-recovery-phone-invalid-code-error-description = Koden er ugyldig eller utløpt.
signin-recovery-phone-invalid-code-error-link = Bruk reserve-autentiseringskoder i stedet?
signin-recovery-phone-success-message = Logget inn. Begrensninger kan gjelde hvis du bruker gjenopprettingstelefonen din igjen.


signin-reported-header = Takk for din årvåkenhet
signin-reported-message = Teamet vårt er varslet. Rapporter som denne hjelper oss med å avverge inntrengere.


signin-token-code-heading-2 = Skriv inn bekreftelseskoden<span> for { -product-mozilla-account }en din</span>
signin-token-code-instruction-v2 = Skriv inn koden som ble sendt til <email>{ $email }</email> innen 5 minutter.
signin-token-code-input-label-v2 = Skriv inn 6-sifret kode
signin-token-code-confirm-button = Bekreft
signin-token-code-code-expired = Har koden utløpt?
signin-token-code-resend-code-link = Send ny kode på e-post.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Send ny kode på e-post om { $seconds } sekund
       *[other] Send ny kode på e-post om { $seconds } sekunder
    }
signin-token-code-required-error = Bekreftelseskode kreves
signin-token-code-resend-error = Noe gikk galt. En ny kode kunne ikke sendes.
signin-token-code-instruction-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.


signin-totp-code-header = Logg inn
signin-totp-code-subheader-v2 = Skriv inn totrinns-autentiseringskode
signin-totp-code-instruction-v4 = Sjekk <strong>autentiseringsappen</strong> din for å bekrefte innloggingen din.
signin-totp-code-input-label-v4 = Skriv inn 6-sifret kode
signin-totp-code-aal-banner-header = Hvorfor blir du bedt om å autentisere deg?
signin-totp-code-aal-banner-content = Du har konfigurert totrinnsautentisering på kontoen din, men har ikke logget på med en kode på denne enheten ennå.
signin-totp-code-aal-sign-out = Logg ut på denne enheten
signin-totp-code-aal-sign-out-error = Beklager, det oppstod et problem med å logge deg av
signin-totp-code-confirm-button = Bekreft
signin-totp-code-other-account-link = Bruk en annen konto
signin-totp-code-recovery-code-link = Har du problemer med å oppgi kode?
signin-totp-code-required-error = Autentiseringskode kreves
signin-totp-code-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.


signin-unblock-header = Godkjenn denne innloggingen
signin-unblock-body = Sjekk e-posten din for godkjenningskoden som ble sendt til { $email }.
signin-unblock-code-input = Skriv inn godkjenningskode
signin-unblock-submit-button = Fortsett
signin-unblock-code-required-error = Godkjenningskode kreves
signin-unblock-code-incorrect-length = Godkjenningskoden må inneholde 8 tegn
signin-unblock-code-incorrect-format-2 = Godkjenningskoden kan bare inneholde bokstaver og/eller tall
signin-unblock-resend-code-button = Ikke i innboks eller mappen for uønsket e-post (spam)? Send på nytt
signin-unblock-support-link = Hvorfor skjer dette?
signin-unblock-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.




confirm-signup-code-page-title = Skriv inn bekreftelseskode
confirm-signup-code-heading-2 = Skriv inn bekreftelseskoden <span>for { -product-mozilla-account }en din</span>
confirm-signup-code-instruction-v2 = Skriv inn koden som ble sendt til <email>{ $email }</email> innen 5 minutter.
confirm-signup-code-input-label = Skriv inn 6-sifret kode
confirm-signup-code-confirm-button = Bekreft
confirm-signup-code-sync-button = Start synkronisering
confirm-signup-code-code-expired = Har koden utløpt?
confirm-signup-code-resend-code-link = Send ny kode på e-post.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Send ny kode på e-post om { $seconds } sekund
       *[other] Send ny kode på e-post om { $seconds } sekunder
    }
confirm-signup-code-success-alert = Konto bekreftet
confirm-signup-code-is-required-error = Bekreftelseskode kreves
confirm-signup-code-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.


signup-heading-v2 = Opprett et passord
signup-relay-info = Et passord er nødvendig for å administrere e-postalias på en sikker måte og få tilgang til sikkerhetsverktøyene til { -brand-mozilla }.
signup-sync-info = Synkroniser passordene, bokmerkene og mer overalt hvor du bruker { -brand-firefox }.
signup-sync-info-with-payment = Synkroniser passordene, betalingsmåter, bokmerkene og mer overalt hvor du bruker { -brand-firefox }.
signup-change-email-link = Endre e-postadresse


signup-confirmed-sync-header = Synkronisering er slått på
signup-confirmed-sync-success-banner = { -product-mozilla-account } bekreftet
signup-confirmed-sync-button = Begynn å surfe
signup-confirmed-sync-description-with-payment-v2 = Passordene dine, betalingsmåtene, adressene, bokmerkene, historikken din og mer kan synkroniseres overalt hvor du bruker { -brand-firefox }.
signup-confirmed-sync-description-v2 = Passordene, adressene, bokmerkene, historikken og mer kan synkroniseres overalt hvor du bruker { -brand-firefox }.
signup-confirmed-sync-add-device-link = Legg til en annen enhet
signup-confirmed-sync-manage-sync-button = Behandle synkronisering
signup-confirmed-sync-set-password-success-banner = Synkroniseringspassord opprettet
