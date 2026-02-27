



-brand-mozilla =
    { $sklon ->
        [rodilnik] Mozille
        [dajalnik] Mozilli
        [tozilnik] Mozillo
        [mestnik] Mozilli
        [orodnik] Mozillo
       *[imenovalnik] Mozilla
    }
-brand-firefox =
    { $sklon ->
        [rodilnik] Firefoxa
        [dajalnik] Firefoxu
        [tozilnik] Firefox
        [mestnik] Firefoxu
        [orodnik] Firefoxom
       *[imenovalnik] Firefox
    }
-product-firefox-accounts =
    { $sklon ->
        [rodilnik] Firefox računov
        [dajalnik] Firefox računom
        [tozilnik] Firefox račune
        [mestnik] Firefox računih
        [orodnik] Firefox računi
       *[imenovalnik] Firefox računi
    }
-product-mozilla-account =
    { $sklon ->
        [rodilnik]
            { $zacetnica ->
                [velika] Računa Mozilla
               *[mala] računa Mozilla
            }
        [dajalnik]
            { $zacetnica ->
                [velika] Računu Mozilla
               *[mala] računu Mozilla
            }
        [tozilnik]
            { $zacetnica ->
                [velika] Račun Mozilla
               *[mala] račun Mozilla
            }
        [mestnik]
            { $zacetnica ->
                [velika] Računu Mozilla
               *[mala] računu Mozilla
            }
        [orodnik]
            { $zacetnica ->
                [velika] Računom Mozilla
               *[mala] računom Mozilla
            }
       *[imenovalnik]
            { $zacetnica ->
                [velika] Račun Mozilla
               *[mala] račun Mozilla
            }
    }
-product-mozilla-accounts =
    { $sklon ->
        [rodilnik]
            { $zacetnica ->
                [velika] Računov Mozilla
               *[mala] računov Mozilla
            }
        [dajalnik]
            { $zacetnica ->
                [velika] Računom Mozilla
               *[mala] računom Mozilla
            }
        [tozilnik]
            { $zacetnica ->
                [velika] Račune Mozilla
               *[mala] račune Mozilla
            }
        [mestnik]
            { $zacetnica ->
                [velika] Računih Mozilla
               *[mala] računih Mozilla
            }
        [orodnik]
            { $zacetnica ->
                [velika] Računi Mozilla
               *[mala] računi Mozilla
            }
       *[imenovalnik]
            { $zacetnica ->
                [velika] Računi Mozilla
               *[mala] računi Mozilla
            }
    }
-product-firefox-account =
    { $sklon ->
        [rodilnik] Firefox računa
        [dajalnik] Firefox računu
        [tozilnik] Firefox račun
        [mestnik] Firefox računu
        [orodnik] Firefox računom
       *[imenovalnik] Firefox račun
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor =
    { $sklon ->
        [rodilnik] Mozilla Monitorja
        [dajalnik] Mozilla Monitorju
        [tozilnik] Mozilla Monitor
        [mestnik] Mozilla Monitorju
        [orodnik] Mozilla Monitorjem
       *[imenovalnik] Mozilla Monitor
    }
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple =
    { $sklon ->
        [rodilnik] Appla
        [dajalnik] Applu
        [tozilnik] Apple
        [mestnik] Applu
        [orodnik] Applom
       *[imenovalnik] Apple
    }
-brand-apple-pay = Apple Pay
-brand-google =
    { $sklon ->
        [rodilnik] Googla
        [dajalnik] Googlu
        [tozilnik] Google
        [mestnik] Googlu
        [orodnik] Googlom
       *[imenovalnik] Google
    }
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

app-general-err-heading = Splošna napaka aplikacije
app-general-err-message = Prišlo je do napake. Poskusite znova pozneje.
app-query-parameter-err-heading = Nepravilna zahteva: neveljavni parametri poizvedbe


app-footer-mozilla-logo-label = Logotip { -brand-mozilla(sklon: "rodilnik") }
app-footer-privacy-notice = Obvestilo o zasebnosti spletnega mesta
app-footer-terms-of-service = Pogoji storitve


app-default-title-2 = { -product-mozilla-accounts(zacetnica: "velika") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(zacetnica: "velika") }


link-sr-new-window = Odpre se v novem oknu


app-loading-spinner-aria-label-loading = Nalaganje …


app-logo-alt-3 =
    .alt = Logotip { -brand-mozilla(sklon: "rodilnik") } "m"



resend-code-success-banner-heading = Na vaš e-poštni naslov je bila poslana nova koda.
resend-link-success-banner-heading = Na vaš e-poštni naslov je bila poslana nova povezava.
resend-success-banner-description = Dodajte { $accountsEmail } med stike, da zagotovite nemoteno dostavo.


brand-banner-dismiss-button-2 =
    .aria-label = Zapri pasico
brand-prelaunch-title = { -product-firefox-accounts(zacetnica: "velika") } se bodo s 1. novembrom preimenovali v { -product-mozilla-accounts(sklon: "tozilnik") }
brand-prelaunch-subtitle = Še vedno se boste prijavljali z istim uporabniškim imenom in geslom, izdelki, ki jih uporabljate, pa se ne bodo spremenili.
brand-postlaunch-title = { -product-firefox-accounts(sklon: "tozilnik") } smo preimenovali v { -product-mozilla-accounts(sklon: "tozilnik") }. Prijavite se lahko z istim uporabniškim imenom in geslom kot doslej, prav tako pa se niso spremenili izdelki, ki jih uporabljate.
brand-learn-more = Več o tem
brand-close-banner =
    .alt = Zapri pasico
brand-m-logo =
    .alt = Logotip { -brand-mozilla(sklon: "rodilnik") } "m"


button-back-aria-label = Nazaj
button-back-title = Nazaj


recovery-key-download-button-v3 = Prenesi in nadaljuj
    .title = Prenesi in nadaljuj
recovery-key-pdf-heading = Ključ za obnovitev računa
recovery-key-pdf-download-date = Ustvarjen: { $date }
recovery-key-pdf-key-legend = Ključ za obnovitev računa
recovery-key-pdf-instructions = Ta ključ vam omogoča obnovitev šifriranih podatkov brskalnika (vključno z gesli, zaznamki in zgodovino), če pozabite geslo. Shranite ga na mesto, ki si ga boste zapomnili.
recovery-key-pdf-storage-ideas-heading = Mesta za shranjevanje ključev
recovery-key-pdf-support = Preberite več o ključu za obnovitev računa
recovery-key-pdf-download-error = Pri prenosu ključa za obnovitev računa je prišlo do težave.


choose-newsletters-prompt-2 = Izkoristite { -brand-mozilla(sklon: "tozilnik") }:
choose-newsletters-option-latest-news =
    .label = Bodite na tekočem z našimi novicami in posodobitvami izdelkov
choose-newsletters-option-test-pilot =
    .label = Zgodnji dostop za preizkušanje novih izdelkov
choose-newsletters-option-reclaim-the-internet =
    .label = Pozivi k ukrepanju za povrnitev interneta


datablock-download =
    .message = Preneseno
datablock-copy =
    .message = Kopirano
datablock-print =
    .message = Natisnjeno


datablock-copy-success =
    { $count ->
        [one] Koda kopirana
        [two] Kodi kopirani
        [few] Kode kopirane
       *[other] Kode kopirane
    }
datablock-download-success =
    { $count ->
        [one] Koda prenesena
        [two] Kodi preneseni
        [few] Kode prenesene
       *[other] Kode prenesene
    }
datablock-print-success =
    { $count ->
        [one] Koda natisnjena
        [two] Kodi natisnjeni
        [few] Kode natisnjene
       *[other] Kode natisnjene
    }


datablock-inline-copy =
    .message = Kopirano


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (ocena)
device-info-block-location-region-country = { $region }, { $country } (ocena)
device-info-block-location-city-country = { $city }, { $country } (ocena)
device-info-block-location-country = { $country } (ocena)
device-info-block-location-unknown = Neznana lokacija
device-info-browser-os = { $browserName } v { $genericOSName }
device-info-ip-address = Naslov IP: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Geslo
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ponovite geslo
form-password-with-inline-criteria-signup-submit-button = Ustvari račun
form-password-with-inline-criteria-reset-new-password =
    .label = Novo geslo
form-password-with-inline-criteria-confirm-password =
    .label = Potrdite geslo
form-password-with-inline-criteria-reset-submit-button = Ustvarite novo geslo
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Geslo
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Ponovite geslo
form-password-with-inline-criteria-set-password-submit-button = Začni s sinhronizacijo
form-password-with-inline-criteria-match-error = Gesli se ne ujemata
form-password-with-inline-criteria-sr-too-short-message = Geslo mora vsebovati vsaj 8 znakov.
form-password-with-inline-criteria-sr-not-email-message = Geslo ne sme vsebovati vašega e-poštnega naslova.
form-password-with-inline-criteria-sr-not-common-message = Ne smete uporabiti pogosto uporabljenega gesla.
form-password-with-inline-criteria-sr-requirements-met = Vneseno geslo izpolnjuje vse zahteve.
form-password-with-inline-criteria-sr-passwords-match = Vneseni gesli se ujemata.


form-verify-code-default-error = To polje je obvezno


form-verify-totp-disabled-button-title-numeric = Za nadaljevanje vnesite { $codeLength }-mestno kodo
form-verify-totp-disabled-button-title-alphanumeric = Za nadaljevanje vnesite { $codeLength }-znakovno kodo


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Ključ za obnovitev { -brand-firefox } Računa
get-data-trio-title-backup-verification-codes = Rezervne overitvene kode
get-data-trio-download-2 =
    .title = Prenesi
    .aria-label = Prenesi
get-data-trio-copy-2 =
    .title = Kopiraj
    .aria-label = Kopiraj
get-data-trio-print-2 =
    .title = Natisni
    .aria-label = Natisni


alert-icon-aria-label =
    .aria-label = Opozorilo
icon-attention-aria-label =
    .aria-label = Pozor
icon-warning-aria-label =
    .aria-label = Opozorilo
authenticator-app-aria-label =
    .aria-label = Aplikacija za overitev
backup-codes-icon-aria-label-v2 =
    .aria-label = Rezervne overitvene kode so omogočene
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Rezervne overitvene kode so onemogočene
backup-recovery-sms-icon-aria-label =
    .aria-label = Obnovitev z SMS omogočena
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Obnovitev z SMS onemogočena
canadian-flag-icon-aria-label =
    .aria-label = Kanadska zastava
checkmark-icon-aria-label =
    .aria-label = Kljukica
checkmark-success-icon-aria-label =
    .aria-label = Uspeh
checkmark-enabled-icon-aria-label =
    .aria-label = Omogočeno
close-icon-aria-label =
    .aria-label = Zapri sporočilo
code-icon-aria-label =
    .aria-label = Koda
error-icon-aria-label =
    .aria-label = Napaka
info-icon-aria-label =
    .aria-label = Informacija
usa-flag-icon-aria-label =
    .aria-label = Zastava ZDA


hearts-broken-image-aria-label =
    .aria-label = Računalnik in mobilni telefon ter na vsakem podoba zlomljenega srca
hearts-verified-image-aria-label =
    .aria-label = Računalnik, mobilni telefon in tablica ter na vsakem podoba utripajočega srca
signin-recovery-code-image-description =
    .aria-label = Dokument, ki vsebuje skrito besedilo.
signin-totp-code-image-label =
    .aria-label = Naprava s skrito 6-mestno kodo.
confirm-signup-aria-label =
    .aria-label = Ovojnica s povezavo
security-shield-aria-label =
    .aria-label = Slika, ki predstavlja ključ za obnovitev računa.
recovery-key-image-aria-label =
    .aria-label = Slika, ki predstavlja ključ za obnovitev računa.
password-image-aria-label =
    .aria-label = Ilustracija tipkanja gesla.
lightbulb-aria-label =
    .aria-label = Slika, ki predstavlja ustvarjanje namiga za shranjevanje.
email-code-image-aria-label =
    .aria-label = Ilustracija, ki upodablja e-poštno sporočilo s kodo.
recovery-phone-image-description =
    .aria-label = Mobilnik, ki prejme sporočilo s kodo.
recovery-phone-code-image-description =
    .aria-label = Koda, prejeta na mobilno napravo.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilnik z možnostjo prejemanja sporočil SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Zaslon naprave s kodami
sync-clouds-image-aria-label =
    .aria-label = Oblaki z ikono za sinhronizacijo
confetti-falling-image-aria-label =
    .aria-label = Animirani padajoči konfeti


inline-recovery-key-setup-signed-in-firefox-2 = Prijavljeni ste v { -brand-firefox }.
inline-recovery-key-setup-create-header = Zavarujte svoj račun
inline-recovery-key-setup-create-subheader = Imate minuto za zaščito svojih podatkov?
inline-recovery-key-setup-info = Ustvarite ključ za obnovitev računa, ki vam bo omogočal obnoviti sinhronizirane podatke v primeru, da kadarkoli pozabite geslo.
inline-recovery-key-setup-start-button = Ustvari ključ za obnovitev računa
inline-recovery-key-setup-later-button = Pozneje


input-password-hide = Skrij geslo
input-password-show = Pokaži geslo
input-password-hide-aria-2 = Vaše geslo je trenutno vidno na zaslonu.
input-password-show-aria-2 = Vaše geslo je trenutno skrito.
input-password-sr-only-now-visible = Vaše geslo je zdaj vidno na zaslonu.
input-password-sr-only-now-hidden = Vaše geslo je zdaj skrito.


input-phone-number-country-list-aria-label = Izberite državo
input-phone-number-enter-number = Vnesite telefonsko številko
input-phone-number-country-united-states = Združene države Amerike
input-phone-number-country-canada = Kanada
legal-back-button = Nazaj


reset-pwd-link-damaged-header = Povezava za ponastavitev gesla je poškodovana
signin-link-damaged-header = Potrditvena povezava je poškodovana
report-signin-link-damaged-header = Povezava poškodovana
reset-pwd-link-damaged-message = Povezavi, ki ste jo kliknili, so manjkali nekateri znaki. Morda jo je pokvaril vaš poštni odjemalec. Bodite previdni pri kopiranju in poskusite znova.


link-expired-new-link-button = Prejmi novo povezavo


remember-password-text = Se spomnite gesla?
remember-password-signin-link = Prijava


primary-email-confirmation-link-reused = Glavni e-poštni naslov je že potrjen
signin-confirmation-link-reused = Prijava je že potrjena
confirmation-link-reused-message = Ta potrditvena povezava je bila že uporabljena, uporabiti pa jo je mogoče le enkrat.


locale-toggle-select-label = Izberi jezik
locale-toggle-browser-default = Privzeti v brskalniku
error-bad-request = Zahteva z napako


password-info-balloon-why-password-info = To geslo potrebujete za dostop do šifriranih podatkov, ki jih shranjujete pri nas.
password-info-balloon-reset-risk-info = Ponastavitev lahko povzroči izgubo podatkov, kot so gesla in zaznamki.


password-strength-long-instruction = Izberite močno geslo, ki ga ne uporabljate na drugih spletnih mestih. Zagotovite, da ustreza varnostnim zahtevam:
password-strength-short-instruction = Izberite močno geslo:
password-strength-inline-min-length = vsebuje vsaj 8 znakov
password-strength-inline-not-email = ni vaš e-poštni naslov
password-strength-inline-not-common = ni eno od pogostih gesel
password-strength-inline-confirmed-must-match = Potrditev se ujema z novim geslom
password-strength-inline-passwords-match = Gesli se ujemata


account-recovery-notification-cta = Ustvari
account-recovery-notification-header-value = Ne izgubite podatkov, če pozabite geslo
account-recovery-notification-header-description = Ustvarite ključ, ki omogoča obnovitev sinhroniziranih podatkov iz računa v primeru, da kadarkoli pozabite geslo.
recovery-phone-promo-cta = Dodaj telefonsko številko za obnovitev
recovery-phone-promo-heading = Dodatno zaščitite svoj račun s telefonsko številko za obnovitev
recovery-phone-promo-description = Zdaj se lahko prijavite z enkratnim geslom preko sporočila SMS, če ne morete uporabiti aplikacije za overjanje v dveh korakih.
recovery-phone-promo-info-link = Preberite več o tveganju pri obnovi in zamenjavi SIM-kartice
promo-banner-dismiss-button =
    .aria-label = Skrij pasico


ready-complete-set-up-instruction = Dokončajte namestitev z vnosom novega gesla v drugih napravah { -brand-firefox }.
manage-your-account-button = Upravljajte račun
ready-use-service = Zdaj ste pripravljeni na uporabo storitve { $serviceName }
ready-use-service-default = Zdaj lahko uporabljate nastavitve računa
ready-account-ready = Vaš račun je pripravljen!
ready-continue = Nadaljuj
sign-in-complete-header = Prijava potrjena
sign-up-complete-header = Račun potrjen
primary-email-verified-header = Glavni e-poštni naslov potrjen


flow-recovery-key-download-storage-ideas-heading-v2 = Mesta za shranjevanje ključa:
flow-recovery-key-download-storage-ideas-folder-v2 = Mapa v varni napravi
flow-recovery-key-download-storage-ideas-cloud = zaupanja vredna shramba v oblaku
flow-recovery-key-download-storage-ideas-print-v2 = Natisnjena fizična kopija
flow-recovery-key-download-storage-ideas-pwd-manager = upravitelj gesel


flow-recovery-key-hint-header-v2 = Dodajte namig, da boste lažje našli svoj ključ
flow-recovery-key-hint-message-v3 = Ta namig si vam bo pomagal zapomniti, kje ste shranili ključ za obnovitev računa. Lahko vam ga pokažemo med ponastavljanjem gesla, da boste lahko obnovili svoje podatke.
flow-recovery-key-hint-input-v2 =
    .label = Vnesite namig (izbirno)
flow-recovery-key-hint-cta-text = Dokončaj
flow-recovery-key-hint-char-limit-error = Namig lahko vsebuje največ 255 znakov.
flow-recovery-key-hint-unsafe-char-error = Namig ne sme vsebovati nevarnih znakov unicode. Dovoljene so samo črke, številke, ločila in simboli.


password-reset-warning-icon = Opozorilo
password-reset-chevron-expanded = Skrči opozorilo
password-reset-chevron-collapsed = Razširi opozorilo
password-reset-data-may-not-be-recovered = Podatkov brskalnika morda ne bo mogoče obnoviti
password-reset-previously-signed-in-device-2 = Imate kakšno napravo, na kateri ste se že kdaj prej prijavili?
password-reset-data-may-be-saved-locally-2 = Podatki brskalnika so morda shranjeni na tej napravi. Ponastavite geslo, nato pa se prijavite, s čimer boste obnovili in sinhronizirali podatke.
password-reset-no-old-device-2 = Imate novo napravo, nimate pa dostopa do nobene izmed prejšnjih?
password-reset-encrypted-data-cannot-be-recovered-2 = Žal nam je, toda šifriranih podatkov brskalnika iz { -brand-firefox }ovih strežnikov ni mogoče obnoviti.
password-reset-warning-have-key = Imate ključ za obnovitev računa?
password-reset-warning-use-key-link = Uporabite ga za ponastavitev gesla in ohranitev podatkov


alert-bar-close-message = Zapri sporočilo


avatar-your-avatar =
    .alt = Vaš avatar
avatar-default-avatar =
    .alt = Privzeti avatar




bento-menu-title-3 = Izdelki { -brand-mozilla }
bento-menu-tagline = Več izdelkov { -brand-mozilla(sklon: "rodilnik") }, ki varujejo vašo zasebnost
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Brskalnik { -brand-firefox } za namizja
bento-menu-firefox-mobile = Mobilni brskalnik { -brand-firefox }
bento-menu-made-by-mozilla = Izpod rok { -brand-mozilla(sklon: "rodilnik") }


connect-another-fx-mobile = Prenesite si { -brand-firefox } na telefon ali tablični računalnik
connect-another-find-fx-mobile-2 = Poiščite { -brand-firefox } v trgovini { -google-play } in { -app-store }.
connect-another-play-store-image-2 =
    .alt = Prenesite { -brand-firefox(sklon: "tozilnik") } iz trgovine { -google-play }
connect-another-app-store-image-3 =
    .alt = Prenesite { -brand-firefox(sklon: "tozilnik") } iz trgovine { -app-store }


cs-heading = Povezane storitve
cs-description = Vse, kar uporabljate in kamor ste prijavljeni.
cs-cannot-refresh =
    Oprostite, prišlo je do težave pri osveževanju seznama povezanih
    storitev.
cs-cannot-disconnect = Odjemalec ni najden, povezave ni bilo mogoče prekiniti
cs-logged-out-2 = Odjavljeno iz storitve { $service }
cs-refresh-button =
    .title = Osveži povezane storitve
cs-missing-device-help = Manjkajoči ali podvojeni elementi?
cs-disconnect-sync-heading = Odklopi od Synca


cs-disconnect-sync-content-3 =
    Vaši podatki o brskanju bodo ostali v napravi <span>{ $device }</span>,
    vendar se ne bodo več sinhronizirali z vašim računom.
cs-disconnect-sync-reason-3 = Kaj je glavni razlog za prekinitev povezave z napravo <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = Naprava je:
cs-disconnect-sync-opt-suspicious = sumljiva
cs-disconnect-sync-opt-lost = izgubljena ali ukradena
cs-disconnect-sync-opt-old = stara ali zamenjana
cs-disconnect-sync-opt-duplicate = podvojena
cs-disconnect-sync-opt-not-say = raje ne bi povedal


cs-disconnect-advice-confirm = Razumem
cs-disconnect-lost-advice-heading = Povezava z izgubljeno/ukradeno napravo je prekinjena
cs-disconnect-lost-advice-content-3 = Ker je bila vaša naprava izgubljena oziroma ukradena, morate zaradi varnosti svojih podatkov spremeniti geslo { -product-mozilla-account(sklon: "rodilnik") } v nastavitvah. Prav tako pri proizvajalcu naprave preverite, ali obstaja možnost za izbris podatkov na daljavo.
cs-disconnect-suspicious-advice-heading = Povezava s sumljivo napravo je prekinjena
cs-disconnect-suspicious-advice-content-2 = Če je naprava, ki ste jo odklopili, res sumljiva, morate zaradi varnosti svojih podatkov spremeniti geslo { -product-mozilla-account(sklon: "rodilnik") } v nastavitvah. Spremeniti bi morali tudi vsa gesla, ki ste jih shranili v { -brand-firefox }, tako da v naslovno vrstico vtipkate about:logins.
cs-sign-out-button = Odjava


dc-heading = Zbiranje in uporaba podatkov
dc-subheader-moz-accounts = { -product-mozilla-accounts(zacetnica: "velika") }
dc-subheader-ff-browser = Brskalnik { -brand-firefox }
dc-subheader-content-2 = Dovoli { -product-mozilla-accounts(sklon: "dajalnik") } pošiljanje tehničnih in interakcijskih podatkov { -brand-mozilla(sklon: "dajalnik") }.
dc-subheader-ff-content = Nastavitve tehničnih in interakcijskih podatkov brskalnika { -brand-firefox } lahko pregledate ali spremenite v nastavitvah na zavihku Zasebnost in varnost.
dc-opt-out-success-2 = Odjava je uspela. { -product-mozilla-accounts } { -brand-mozilla(sklon: "rodilnik") } ne bodo pošiljali tehničnih ali interakcijskih podatkov.
dc-opt-in-success-2 = Hvala! Z deljenjem teh podatkov nam pomagate izboljševati { -product-mozilla-accounts(sklon: "tozilnik") }.
dc-opt-in-out-error-2 = Oprostite, pri spreminjanju nastavitve o zbiranju podatkov je prišlo do težave
dc-learn-more = Več o tem


drop-down-menu-title-2 = Meni { -product-mozilla-account(sklon: "rodilnik") }
drop-down-menu-signed-in-as-v2 = Prijavljeni kot
drop-down-menu-sign-out = Odjava
drop-down-menu-sign-out-error-2 = Oprostite, prišlo je do težave pri odjavljanju


flow-container-back = Nazaj


flow-recovery-key-confirm-pwd-heading-v2 = Iz varnostnih razlogov znova vnesite geslo
flow-recovery-key-confirm-pwd-input-label = Vnesite svoje geslo
flow-recovery-key-confirm-pwd-submit-button = Ustvari ključ za obnovitev računa
flow-recovery-key-confirm-pwd-submit-button-change-key = Ustvari nov ključ za obnovitev računa


flow-recovery-key-download-heading-v2 = Ključ za obnovitev računa ustvarjen – prenesite in shranite ga zdaj
flow-recovery-key-download-info-v2 = Ta ključ vam omogoča obnovitev podatkov v primeru, da pozabite geslo. Prenesite ga zdaj in ga shranite na kraj, ki si ga boste zapomnili – na to stran se pozneje ne boste mogli vrniti.
flow-recovery-key-download-next-link-v2 = Nadaljuj brez prenosa


flow-recovery-key-success-alert = Ključ za obnovitev računa ustvarjen


flow-recovery-key-info-header = Ustvarite ključ za obnovitev računa, če pozabite geslo
flow-recovery-key-info-header-change-key = Spremenite ključ za obnovitev računa
flow-recovery-key-info-shield-bullet-point-v2 = Podatke o brskanju – gesla, zaznamke in drugo – šifriramo. To je odlično z vidika varovanja zasebnosti, vendar hkrati pomeni, da so podatki izgubljeni, če pozabite geslo.
flow-recovery-key-info-key-bullet-point-v2 = Zato je ustvarjanje ključa za obnovitev računa tako pomembno – z njim lahko obnovite svoje podatke.
flow-recovery-key-info-cta-text-v3 = Začnite
flow-recovery-key-info-cancel-link = Prekliči


flow-setup-2fa-qr-heading = Povežite se z aplikacijo za overitev
flow-setup-2a-qr-instruction = <strong>1. korak:</strong> skenirajte to kodo QR s katerokoli aplikacijo za overjanje, kot sta na primer Duo in Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = QR-koda za nastavitev overjanja v dveh korakih. Skenirajte ali izberite "Ne morete prebrati kode QR?", če želite namesto tega dobiti tajni ključ za nastavitev.
flow-setup-2fa-cant-scan-qr-button = Ne morete prebrati kode QR?
flow-setup-2fa-manual-key-heading = Ročno vnesite kodo
flow-setup-2fa-manual-key-instruction = <strong>1. korak:</strong> vnesite to kodo v želeno aplikacijo za overjanje.
flow-setup-2fa-scan-qr-instead-button = Želite namesto tega skenirati QR-kodo?
flow-setup-2fa-more-info-link = Preberite več o aplikacijah za overjanje
flow-setup-2fa-button = Nadaljuj
flow-setup-2fa-step-2-instruction = <strong>2. korak:</strong> Vnesite kodo iz aplikacije za overitev.
flow-setup-2fa-input-label = Vnesite 6-mestno kodo
flow-setup-2fa-code-error = Neveljavna ali pretečena koda. Preverite v aplikaciji za overjanje in poskusite znova.


flow-setup-2fa-backup-choice-heading = Izberite način obnovitve
flow-setup-2fa-backup-choice-description = To vam omogoča prijavo, če nimate dostopa do mobilne naprave ali aplikacije za overjanje.
flow-setup-2fa-backup-choice-phone-title = Telefonska številka za obnovitev
flow-setup-2fa-backup-choice-phone-badge = Najenostavnejši
flow-setup-2fa-backup-choice-phone-info = Prejmite obnovitveno kodo v besedilnem sporočilu. Trenutno na voljo le v ZDA in Kanadi.
flow-setup-2fa-backup-choice-code-title = Rezervne overitvene kode
flow-setup-2fa-backup-choice-code-badge = Najvarnejši
flow-setup-2fa-backup-choice-code-info = Ustvarite in shranite enkratne overitvene kode.
flow-setup-2fa-backup-choice-learn-more-link = Spoznajte tveganje pri obnovi in zamenjavi SIM-kartice


flow-setup-2fa-backup-code-confirm-heading = Vnesite rezervno overitveno kodo
flow-setup-2fa-backup-code-confirm-confirm-saved = Z vnosom potrdite, da ste shranili kode. Brez teh kod se morda ne boste mogli prijaviti, če ne boste imeli aplikacije za overjanje.
flow-setup-2fa-backup-code-confirm-code-input = Vnesite 10-mestno kodo
flow-setup-2fa-backup-code-confirm-button-finish = Končaj


flow-setup-2fa-backup-code-dl-heading = Shrani rezervne overitvene kode
flow-setup-2fa-backup-code-dl-save-these-codes = Shranite jih na mestu, ki si jih boste zapomnili. Če nimate dostopa do aplikacije za overitev, jo boste morali za prijavo vnesti.
flow-setup-2fa-backup-code-dl-button-continue = Nadaljuj


flow-setup-2fa-inline-complete-success-banner = Overitev v dveh korakih je omogočena
flow-setup-2fa-inline-complete-success-banner-description = Za zaščito vseh povezanih naprav se odjavite na vseh mestih, kjer uporabljate ta račun, in se nato prijavite z novim overjanjem v dveh korakih.
flow-setup-2fa-inline-complete-backup-code = Rezervne overitvene kode
flow-setup-2fa-inline-complete-backup-phone = Telefonska številka za obnovitev
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Preostala je koda { $count }
        [two] Ostaja še { $count } kod
        [few] Ostaja še { $count } kod
       *[other] Ostaja še { $count } kod
    }
flow-setup-2fa-inline-complete-backup-code-description = To je najvarnejša metoda obnovitve, če nimate možnosti prijave z mobilno napravo ali z aplikacijo za overjanje.
flow-setup-2fa-inline-complete-backup-phone-description = To je najpreprostejša metoda obnovitve, če se nimate možnosti prijaviti v aplikacijo za overjanje.
flow-setup-2fa-inline-complete-learn-more-link = Kako to ščiti vaš račun
flow-setup-2fa-inline-complete-continue-button = Nadaljuj v { $serviceName }
flow-setup-2fa-prompt-heading = Nastavite overjanje v dveh korakih
flow-setup-2fa-prompt-description = { $serviceName } zahteva, da za varnost računa nastavite overjanje v dveh korakih.
flow-setup-2fa-prompt-use-authenticator-apps = Za nadaljevanje lahko uporabite katerokoli od <authenticationAppsLink>naslednjih aplikacij za overjanje</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Nadaljuj


flow-setup-phone-confirm-code-heading = Vnesite potrditveno kodo
flow-setup-phone-confirm-code-instruction = Na <span>{ $phoneNumber }</span> je bilo poslano sporočilo SMS s šestmestno kodo. Koda poteče po 5 minutah.
flow-setup-phone-confirm-code-input-label = Vnesite 6-mestno kodo
flow-setup-phone-confirm-code-button = Potrdi
flow-setup-phone-confirm-code-expired = Je koda potekla?
flow-setup-phone-confirm-code-resend-code-button = Znova pošlji kodo
flow-setup-phone-confirm-code-resend-code-success = Koda poslana
flow-setup-phone-confirm-code-success-message-v2 = Telefonska številka za obnovitev je dodana
flow-change-phone-confirm-code-success-message = Telefonska številka za obnovitev je spremenjena


flow-setup-phone-submit-number-heading = Potrdite svojo telefonsko številko
flow-setup-phone-verify-number-instruction = Od { -brand-mozilla(sklon: "rodilnik") } boste prejeli sporočilo SMS s kodo za potrditev številke. Kode ne pokažite nikomur drugemu.
flow-setup-phone-submit-number-info-message-v2 = Telefonska številka za obnovitev je na voljo samo v ZDA in Kanadi. Uporabe številk VoIP in telefonskih mask ne priporočamo.
flow-setup-phone-submit-number-legal = Z vnosom telefonske številke soglašate, da jo shranimo z izključnim namenom pošiljanja sporočil za potrditev računa. Nastanejo lahko stroški sporočil in prenosa podatkov.
flow-setup-phone-submit-number-button = Pošlji kodo


header-menu-open = Zapri meni
header-menu-closed = Meni za krmarjenje po strani
header-back-to-top-link =
    .title = Nazaj na vrh
header-back-to-settings-link =
    .title = Nazaj na nastavitve { -product-mozilla-account(sklon: "rodilnik") }
header-title-2 = { -product-mozilla-account }
header-help = Pomoč


la-heading = Povezani računi
la-description = Pooblastili ste dostop do naslednjih računov.
la-unlink-button = Odklopi
la-unlink-account-button = Odklopi
la-set-password-button = Nastavi geslo
la-unlink-heading = Odklopi od zunanjega računa
la-unlink-content-3 = Ali ste prepričani, da želite prekiniti povezavo s svojim računom? Odklop računa ne pomeni samodejne odjave iz povezanih storitev. Iz njih se lahko odjavite ročno v odseku Povezane storitve.
la-unlink-content-4 = Preden prekinete povezavo z računom, morate nastaviti geslo. Brez gesla se po prekinitvi povezave ne boste več mogli prijaviti.
nav-linked-accounts = { la-heading }


modal-close-title = Zapri
modal-cancel-button = Prekliči
modal-default-confirm-button = Potrdi


modal-mfa-protected-title = Vnesite potrditveno kodo
modal-mfa-protected-subtitle = Pomagajte nam preveriti, da ste vi spremenili podatke o računu
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] V { $expirationTime } minuti vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
        [two] V { $expirationTime } minutah vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
        [few] V { $expirationTime } minutah vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
       *[other] V { $expirationTime } minutah vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
    }
modal-mfa-protected-input-label = Vnesite 6-mestno kodo
modal-mfa-protected-cancel-button = Prekliči
modal-mfa-protected-confirm-button = Potrdi
modal-mfa-protected-code-expired = Je koda potekla?
modal-mfa-protected-resend-code-link = Pošlji novo kodo.


mvs-verify-your-email-2 = Potrdite e-poštni naslov
mvs-enter-verification-code-2 = Vnesite potrditveno kodo
mvs-enter-verification-code-desc-2 = Vnesite potrditveno kodo, ki smo jo poslali na <email>{ $email }</email>, v 5 minutah.
msv-cancel-button = Prekliči
msv-submit-button-2 = Potrdi


nav-settings = Nastavitve
nav-profile = Profil
nav-security = Varnost
nav-connected-services = Povezane storitve
nav-data-collection = Zbiranje in uporaba podatkov
nav-paid-subs = Plačljive naročnine
nav-email-comm = E-poštno obveščanje


page-2fa-change-title = Spremeni overjanje v dveh korakih
page-2fa-change-success = Overjanje v dveh korakih je bilo ponovno nastavljeno
page-2fa-change-success-additional-message = Za zaščito vseh povezanih naprav se odjavite na vseh mestih, kjer uporabljate ta račun, in se nato prijavite z novim overjanjem v dveh korakih.
page-2fa-change-totpinfo-error = Pri menjavi aplikacije za overjanje v dveh korakih je prišlo do napake. Poskusite znova pozneje.
page-2fa-change-qr-instruction = <strong>1. korak:</strong> skenirajte to kodo QR s katerokoli aplikacijo za overitev, kot je Duo ali Google Authenticator. To ustvari novo povezavo, vse stare povezave ne bodo več delovale.


tfa-backup-codes-page-title = Rezervne overitvene kode
tfa-replace-code-error-3 = Pri menjavi rezervnih overitvenih kod je prišlo do težave
tfa-create-code-error = Pri ustvarjanju rezervnih overitvenih kod je prišlo do težave
tfa-replace-code-success-alert-4 = Rezervne overitvene kode so posodobljene
tfa-create-code-success-alert = Rezervne overitvene kode so ustvarjene
tfa-replace-code-download-description = Shranite jih na mesto, ki si ga boste zapomnili. Vaše stare kode bodo nadomeščene, ko dokončate naslednji korak.
tfa-replace-code-confirm-description = Z vnosom ene izmed kod potrdite, da ste si jih shranili. Stare rezervne overitvene kode bodo po zaključku tega koraka prenehale veljati.
tfa-incorrect-recovery-code-1 = Nepravilna rezervna overitvena koda


page-2fa-setup-title = Overitev v dveh korakih
page-2fa-setup-totpinfo-error = Pri nastavljanju overjanja v dveh korakih je prišlo do napake. Poskusite znova pozneje.
page-2fa-setup-incorrect-backup-code-error = Ta koda ni pravilna. Poskusite znova.
page-2fa-setup-success = Overitev v dveh korakih je omogočena
page-2fa-setup-success-additional-message = Za zaščito vseh povezanih naprav se odjavite na vseh mestih, kjer uporabljate ta račun, in se nato prijavite z uporabo overjanja v dveh korakih.


avatar-page-title =
    .title = Slika profila
avatar-page-add-photo = Dodaj fotografijo
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fotografiraj
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Odstrani fotografijo
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Fotografiraj znova
avatar-page-cancel-button = Prekliči
avatar-page-save-button = Shrani
avatar-page-saving-button = Shranjevanje …
avatar-page-zoom-out-button =
    .title = Pomanjšaj
avatar-page-zoom-in-button =
    .title = Povečaj
avatar-page-rotate-button =
    .title = Zavrti
avatar-page-camera-error = Kamere ni bilo mogoče zagnati
avatar-page-new-avatar =
    .alt = nova slika profila
avatar-page-file-upload-error-3 = Prišlo je do napake pri nalaganju slike profila
avatar-page-delete-error-3 = Prišlo je do napake pri brisanju slike profila
avatar-page-image-too-large-error-2 = Datoteka s sliko je prevelika za nalaganje


pw-change-header =
    .title = Spremeni geslo
pw-8-chars = vsaj 8 znakov
pw-not-email = ni vaš e-poštni naslov
pw-change-must-match = se mora ujemati s potrditvijo
pw-commonly-used = ni eno od pogostih gesel
pw-tips = Ostanite varni – ne reciklirajte gesel. Oglejte si več nasvetov za <linkExternal>ustvarjanje močnih gesel</linkExternal>.
pw-change-cancel-button = Prekliči
pw-change-save-button = Shrani
pw-change-forgot-password-link = Ste pozabili geslo?
pw-change-current-password =
    .label = Vnesite trenutno geslo
pw-change-new-password =
    .label = Vnesite novo geslo
pw-change-confirm-password =
    .label = Potrdite novo geslo
pw-change-success-alert-2 = Geslo posodobljeno


pw-create-header =
    .title = Ustvari geslo
pw-create-success-alert-2 = Geslo nastavljeno
pw-create-error-2 = Oprostite, prišlo je do težave pri nastavljanju gesla


delete-account-header =
    .title = Izbriši račun
delete-account-step-1-2 = Korak 1 od 2
delete-account-step-2-2 = Korak 2 od 2
delete-account-confirm-title-4 = Morda ste svoj { -product-mozilla-account(sklon: "tozilnik") } povezali z enim ali več izmed naslednjih izdelkov ali storitev { -brand-mozilla(sklon: "rodilnik") }, ki vam zagotavljajo varnost in produktivnost na spletu:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Sinhronizacija podatkov { -brand-firefox(sklon: "tozilnik") }
delete-account-product-firefox-addons = Dodatki za { -brand-firefox }
delete-account-acknowledge = Zavedajte se, da boste z izbrisom računa:
delete-account-chk-box-1-v4 =
    .label = preklicali vse plačane naročnine
delete-account-chk-box-2 =
    .label = lahko izgubili shranjene podatke in možnosti v izdelkih { -brand-mozilla(sklon: "rodilnik") }
delete-account-chk-box-3 =
    .label = pri ponovni aktivaciji tega e-poštnega računa morda ne boste mogli obnoviti shranjenih podatkov
delete-account-chk-box-4 =
    .label = izbrisali vse razširitve in teme, ki ste jih objavili na addons.mozilla.org
delete-account-continue-button = Nadaljuj
delete-account-password-input =
    .label = Vnesite geslo
delete-account-cancel-button = Prekliči
delete-account-delete-button-2 = Izbriši


display-name-page-title =
    .title = Prikazno ime
display-name-input =
    .label = Vnesite prikazno ime
submit-display-name = Shrani
cancel-display-name = Prekliči
display-name-update-error-2 = Prišlo je do napake pri spremembi prikaznega imena
display-name-success-alert-2 = Prikazno ime posodobljeno


recent-activity-title = Nedavna dejavnost v računu
recent-activity-account-create-v2 = Račun ustvarjen
recent-activity-account-disable-v2 = Račun onemogočen
recent-activity-account-enable-v2 = Račun omogočen
recent-activity-account-login-v2 = Prijava v račun se je začela
recent-activity-account-reset-v2 = Ponastavitev gesla se je začela
recent-activity-emails-clearBounces-v2 = Zavrnjena e-pošta odstranjena
recent-activity-account-login-failure = Neuspel poskus prijave v račun
recent-activity-account-two-factor-added = Omogočena overitev v dveh korakih
recent-activity-account-two-factor-requested = Zahteva po overitvi v dveh korakih
recent-activity-account-two-factor-failure = Neuspela overitev v dveh korakih
recent-activity-account-two-factor-success = Uspešna overitev v dveh korakih
recent-activity-account-two-factor-removed = Overitev v dveh korakih odstranjena
recent-activity-account-password-reset-requested = Račun zahteva ponastavitev gesla
recent-activity-account-password-reset-success = Ponastavitev gesla za račun je bila uspešna
recent-activity-account-recovery-key-added = Omogočen ključ za obnovitev računa
recent-activity-account-recovery-key-verification-failure = Neuspelo preverjanje ključa za obnovitev računa
recent-activity-account-recovery-key-verification-success = Uspešno preverjanje ključa za obnovitev računa
recent-activity-account-recovery-key-removed = Odstranjen ključ za obnovitev računa
recent-activity-account-password-added = Dodano novo geslo
recent-activity-account-password-changed = Spremenjeno geslo
recent-activity-account-secondary-email-added = Dodan pomožni e-poštni naslov
recent-activity-account-secondary-email-removed = Odstranjen pomožni e-poštni naslov
recent-activity-account-emails-swapped = Zamenjana glavni in pomožni e-poštni naslov
recent-activity-session-destroy = Odjavljeno iz seje
recent-activity-account-recovery-phone-send-code = Telefonska koda za obnovitev poslana
recent-activity-account-recovery-phone-setup-complete = Nastavitev telefonske številke za obnovitev končana
recent-activity-account-recovery-phone-signin-complete = Prijava s telefonsko številko za obnovitev je končana
recent-activity-account-recovery-phone-signin-failed = Prijava z obnovitveno telefonsko številko ni uspela
recent-activity-account-recovery-phone-removed = Telefonska številka za obnovitev je odstranjena
recent-activity-account-recovery-codes-replaced = Obnovitvene kode so zamenjane
recent-activity-account-recovery-codes-created = Obnovitvene kode so ustvarjene
recent-activity-account-recovery-codes-signin-complete = Prijava z obnovitvenimi kodami dokončana
recent-activity-password-reset-otp-sent = Potrditvena koda za ponastavitev gesla poslana
recent-activity-password-reset-otp-verified = Potrditvena koda za ponastavitev gesla potrjena
recent-activity-must-reset-password = Zahtevana je ponastavitev gesla
recent-activity-unknown = Drugačna dejavnost v računu


recovery-key-create-page-title = Ključ za obnovitev računa
recovery-key-create-back-button-title = Nazaj na nastavitve


recovery-phone-remove-header = Odstrani telefonsko številko za obnovitev
settings-recovery-phone-remove-info = S tem boste odstranili telefonsko številko za obnovitev <strong>{ $formattedFullPhoneNumber }</strong>.
settings-recovery-phone-remove-recommend = Priporočamo vam, da to metodo ohranite, ker je preprostejša kot shranjevanje rezervnih overitvenih kod.
settings-recovery-phone-remove-recovery-methods = Če ga izbrišete, se prepričajte, da imate še vedno shranjene rezervne overitvene kode. <linkExternal>Primerjajte metode obnovitve</linkExternal>
settings-recovery-phone-remove-button = Odstrani telefonsko številko
settings-recovery-phone-remove-cancel = Prekliči
settings-recovery-phone-remove-success = Telefonska številka za obnovitev je odstranjena


page-setup-recovery-phone-heading = Dodaj telefonsko številko za obnovitev
page-change-recovery-phone = Spremeni telefonsko številko za obnovitev
page-setup-recovery-phone-back-button-title = Nazaj na nastavitve
page-setup-recovery-phone-step2-back-button-title = Spremeni telefonsko številko


add-secondary-email-step-1 = Korak 1 od 2
add-secondary-email-error-2 = Pri dodajanju tega e-poštnega naslova je prišlo do napake
add-secondary-email-page-title =
    .title = Pomožni e-poštni naslov
add-secondary-email-enter-address =
    .label = Vnesite e-poštni naslov
add-secondary-email-cancel-button = Prekliči
add-secondary-email-save-button = Shrani
add-secondary-email-mask = Za pomožni naslov ni mogoče uporabiti e-poštne maske


add-secondary-email-step-2 = Korak 2 od 2
verify-secondary-email-page-title =
    .title = Pomožni e-poštni naslov
verify-secondary-email-verification-code-2 =
    .label = Vnesite potrditveno kodo
verify-secondary-email-cancel-button = Prekliči
verify-secondary-email-verify-button-2 = Potrdi
verify-secondary-email-please-enter-code-2 = V roku 5 minut vnesite potrditveno kodo, ki je bila poslana na <strong>{ $email }</strong>.
verify-secondary-email-success-alert-2 = { $email } uspešno dodan
verify-secondary-email-resend-code-button = Ponovno pošlji potrditveno kodo


delete-account-link = Izbriši račun
inactive-update-status-success-alert = Prijava uspešna. Vaš { -product-mozilla-account } in podatki bodo ostali aktivni.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Ugotovite, kje so razkriti vaši zasebni podatki, in prevzemite nadzor
product-promo-monitor-cta = Zagotovite si brezplačen pregled


profile-heading = Profil
profile-picture =
    .header = Slika
profile-display-name =
    .header = Prikazno ime
profile-primary-email =
    .header = Glavna e-pošta


progress-bar-aria-label-v2 = Korak { $currentStep } od { $numberOfSteps }.


security-heading = Varnost
security-password =
    .header = Geslo
security-password-created-date = Ustvarjeno { $date }
security-not-set = Ni nastavljeno
security-action-create = Ustvari
security-set-password = Nastavite geslo za sinhronizacijo in uporabo nekaterih varnostnih možnosti računa.
security-recent-activity-link = Oglejte si nedavno dejavnost v računu
signout-sync-header = Seja je potekla
signout-sync-session-expired = Oprostite, prišlo je do napake. V meniju brskalnika se odjavite in poskusite znova.


tfa-row-backup-codes-title = Rezervne overitvene kode
tfa-row-backup-codes-not-available = Ni razpoložljivih kod
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } preostala koda
        [two] { $numCodesAvailable } preostali kodi
        [few] { $numCodesAvailable } preostale kode
       *[other] { $numCodesAvailable } preostalih kod
    }
tfa-row-backup-codes-get-new-cta-v2 = Ustvari nove kode
tfa-row-backup-codes-add-cta = Dodaj
tfa-row-backup-codes-description-2 = To je najvarnejša metoda obnovitve, če nimate možnosti uporabe mobilne naprave ali aplikacije za overitev.
tfa-row-backup-phone-title-v2 = Telefonska številka za obnovitev
tfa-row-backup-phone-not-available-v2 = Telefonska številka ni dodana
tfa-row-backup-phone-change-cta = Spremeni
tfa-row-backup-phone-add-cta = Dodaj
tfa-row-backup-phone-delete-button = Odstrani
tfa-row-backup-phone-delete-title-v2 = Odstranite telefonsko številko za obnovitev
tfa-row-backup-phone-delete-restriction-v2 = Če želite odstraniti telefonsko številko za obnovitev, najprej dodajte rezervne overitvene kode ali onemogočite overjanje v dveh korakih, da preprečite izgubo dostopa do računa.
tfa-row-backup-phone-description-v2 = To je najpreprostejša metoda obnovitve, če nimate možnosti uporabe aplikacije za overitev.
tfa-row-backup-phone-sim-swap-risk-link = Spoznajte tveganje zamenjave SIM


switch-turn-off = Izključi
switch-turn-on = Vključi
switch-submitting = Pošiljanje …
switch-is-on = vključeno
switch-is-off = izključeno


row-defaults-action-add = Dodaj
row-defaults-action-change = Spremeni
row-defaults-action-disable = Onemogoči
row-defaults-status = Brez


rk-header-1 = Ključ za obnovitev računa
rk-enabled = Omogočen
rk-not-set = Ni nastavljen
rk-action-create = Ustvari
rk-action-change-button = Spremeni
rk-action-remove = Odstrani
rk-key-removed-2 = Ključ za obnovitev računa odstranjen
rk-cannot-remove-key = Ključa za obnovitev računa ni bilo mogoče odstraniti.
rk-refresh-key-1 = Osveži ključ za obnovitev računa
rk-content-explain = Obnovite svoje podatke, če pozabite geslo.
rk-cannot-verify-session-4 = Oprostite, prišlo je do težave pri potrjevanju vaše seje
rk-remove-modal-heading-1 = Odstrani ključ za obnovitev računa?
rk-remove-modal-content-1 =
    V primeru, da ponastavite geslo, obnovitvenega ključa
    ne boste mogli uporabiti za dostop do podatkov. Tega dejanja ne morete razveljaviti.
rk-remove-error-2 = Ključa za obnovitev računa ni bilo mogoče odstraniti
unit-row-recovery-key-delete-icon-button-title = Izbriši ključ za obnovitev računa


se-heading = Pomožni e-poštni naslov
    .header = Pomožni e-poštni naslov
se-cannot-refresh-email = Oprostite, prišlo je do težave pri osveževanju e-poštnega naslova.
se-cannot-resend-code-3 = Prišlo je do napake pri ponovnem pošiljanju potrditvene kode
se-set-primary-successful-2 = { $email } je zdaj vaš glavni e-poštni naslov
se-set-primary-error-2 = Oprostite, pri spreminjanju glavnega e-poštnega naslova je prišlo do težave
se-delete-email-successful-2 = { $email } uspešno izbrisan
se-delete-email-error-2 = Oprostite, pri brisanju tega sporočila je prišlo do težave
se-verify-session-3 = Za izvedbo tega dejanja boste morali potrditi svojo trenutno sejo
se-verify-session-error-3 = Oprostite, prišlo je do težave pri potrjevanju vaše seje
se-remove-email =
    .title = Odstrani e-poštni naslov
se-refresh-email =
    .title = Osveži e-poštni naslov
se-unverified-2 = nepotrjeno
se-resend-code-2 =
    Potrebna je potrditev. <button>Ponovno pošlji potrditveno kodo</button>,
    če ni prispela med prejeto ali neželeno pošto.
se-make-primary = Nastavi kot glavno
se-default-content = Obdržite dostop do svojega računa v primeru, da se ne morete prijaviti v glavni e-poštni naslov.
se-content-note-1 =
    Opomba: pomožni e-poštni naslov ne bo obnovil vaših podatkov – za to
    boste potrebovali <a>ključ za obnovitev računa</a>.
se-secondary-email-none = Brez


tfa-row-header = Overitev v dveh korakih
tfa-row-enabled = Omogočena
tfa-row-disabled-status = Onemogočena
tfa-row-action-add = Dodaj
tfa-row-action-disable = Onemogoči
tfa-row-action-change = Spremeni
tfa-row-button-refresh =
    .title = Osveži overitev v dveh korakih
tfa-row-cannot-refresh =
    Oprostite, prišlo je do težave pri osveževanju
    overitve v dveh korakih.
tfa-row-enabled-description = Vaš račun je zaščiten s overjanjem v dveh korakih. Ob prijavi v { -product-mozilla-account(sklon: "tozilnik") } boste morali vnesti enkratno geslo iz aplikacije za overjanje.
tfa-row-enabled-info-link = Kako to ščiti vaš račun
tfa-row-disabled-description-v2 = Dodatno zavarujte svoj račun z uporabo zunanje aplikacije za overjanje kot drugega koraka pri prijavi.
tfa-row-cannot-verify-session-4 = Oprostite, prišlo je do težave pri potrjevanju vaše seje
tfa-row-disable-modal-heading = Ali želite onemogočiti overitev v dveh korakih?
tfa-row-disable-modal-confirm = Onemogoči
tfa-row-disable-modal-explain-1 =
    Tega dejanja ne morete razveljaviti. Imate tudi
    možnost <linkExternal>zamenjave rezervnih overitvenih kod</linkExternal>.
tfa-row-disabled-2 = Overitev v dveh korakih je onemogočena
tfa-row-cannot-disable-2 = Overitve v dveh korakih ni bilo mogoče izključiti
tfa-row-verify-session-info = Za nastavitev overjanja v dveh korakih morate potrditi svojo trenutno sejo


terms-privacy-agreement-intro-3 = Z nadaljevanjem se strinjate z naslednjim:
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>pogoji uporabe</termsLink> in <privacyLink>obvestilo o zasebnosti</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") }: <mozillaAccountsTos>pogoji uporabe</mozillaAccountsTos> in <mozillaAccountsPrivacy>obvestilo o zasebnosti</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = Z nadaljevanjem se strinjate s <mozillaAccountsTos>pogoji storitve</mozillaAccountsTos> in <mozillaAccountsPrivacy>obvestilom o zasebnosti</mozillaAccountsPrivacy>.


third-party-auth-options-or = ali
third-party-auth-options-sign-in-with = Prijava s ponudnikom
continue-with-google-button = Nadaljuj z { -brand-google(sklon: "orodnik") }
continue-with-apple-button = Nadaljuj z { -brand-apple(sklon: "orodnik") }


auth-error-102 = Neznan račun
auth-error-103 = Napačno geslo
auth-error-105-2 = Neveljavna potrditvena koda
auth-error-110 = Neveljaven žeton
auth-error-114-generic = Preveč poskusov. Poskusite znova pozneje.
auth-error-114 = Preveč poskusov. Poskusite znova { $retryAfter }.
auth-error-125 = Zahteva je bila zavrnjena iz varnostnih razlogov
auth-error-129-2 = Vnesli ste neveljavno telefonsko številko. Preverite in poskusite znova.
auth-error-138-2 = Nepotrjena seja
auth-error-139 = Pomožni e-poštni naslov mora biti drugačen od naslova računa
auth-error-144 = Ta e-poštni naslov je rezerviran za drug račun. Poskusite znova pozneje ali uporabite drug naslov.
auth-error-155 = Žetona TOTP ni mogoče najti
auth-error-156 = Rezervne overitvene kode ni bilo mogoče najti
auth-error-159 = Neveljaven ključ za obnovitev računa
auth-error-183-2 = Neveljavna ali pretečena potrditvena koda
auth-error-202 = Funkcija ni omogočena
auth-error-203 = Sistem ni dosegljiv, poskusite znova pozneje
auth-error-206 = Gesla ni mogoče ustvariti – geslo je že nastavljeno
auth-error-214 = Telefonska številka za obnovitev že obstaja
auth-error-215 = Telefonska številka za obnovitev ne obstaja
auth-error-216 = Dosežena omejitev števila besedilnih sporočil
auth-error-218 = Telefonske številke za obnovitev ni mogoče odstraniti, ker manjkajo rezervne overitvene kode.
auth-error-219 = To telefonsko številko je registriralo preveč računov. Poskusite z drugo številko.
auth-error-999 = Nepričakovana napaka
auth-error-1001 = Poskus prijave preklican
auth-error-1002 = Seja je potekla. Za nadaljevanje se prijavite.
auth-error-1003 = Lokalna shramba ali piškotki so še vedno onemogočeni
auth-error-1008 = Novo geslo mora biti drugačno
auth-error-1010 = Zahtevano je veljavno geslo
auth-error-1011 = Zahtevan je veljaven e-poštni naslov
auth-error-1018 = Vaša potrditvena e-pošta se je pravkar vrnila. Ste se zatipkali v e-poštnem naslovu?
auth-error-1020 = Napačen naslov? firefox.com ni veljaven ponudnik e-pošte
auth-error-1031 = Za registracijo morate vnesti svojo starost
auth-error-1032 = Za registracijo morate vnesti veljavno starost
auth-error-1054 = Neveljavna koda za overitev v dveh korakih
auth-error-1056 = Neveljavna rezervna overitvena koda
auth-error-1062 = Neveljavna preusmeritev
auth-error-1064 = Napačen naslov? { $domain } ni veljavna e-poštna storitev
auth-error-1066 = Za ustvaritev računa ni mogoče uporabiti e-poštne maske.
auth-error-1067 = Napačen e-poštni naslov?
recovery-phone-number-ending-digits = Številka, ki se končuje na { $lastFourPhoneNumber }
oauth-error-1000 = Nekaj je šlo narobe. Zaprite ta zavihek in poskusite znova.


connect-another-device-signed-in-header = Prijavljeni ste v { -brand-firefox }
connect-another-device-email-confirmed-banner = E-pošta potrjena
connect-another-device-signin-confirmed-banner = Prijava potrjena
connect-another-device-signin-to-complete-message = Za dokončanje namestitve se prijavite v ta { -brand-firefox }
connect-another-device-signin-link = Prijava
connect-another-device-still-adding-devices-message = Še vedno dodajate naprave? Za dokončanje namestitve se prijavite v { -brand-firefox } na drugi napravi
connect-another-device-signin-another-device-to-complete-message = Za dokončanje namestitve se prijavite v { -brand-firefox } na drugi napravi
connect-another-device-get-data-on-another-device-message = Želite prenesti svoje zavihke, zaznamke in gesla na drugo napravo?
connect-another-device-cad-link = Poveži drugo napravo
connect-another-device-not-now-link = Ne zdaj
connect-another-device-android-complete-setup-message = Za dokončanje namestitve se prijavite v { -brand-firefox } za Android
connect-another-device-ios-complete-setup-message = Za dokončanje namestitve se prijavite v { -brand-firefox } za iOS


cookies-disabled-header = Lokalna shramba in piškotki so zahtevani
cookies-disabled-enable-prompt-2 = Za dostop do { -product-mozilla-account(sklon: "rodilnik") } v brskalniku omogočite piškotke in lokalno shrambo. Na ta način boste med drugim omogočili, da si vas bo brskalnik zapomnil med sejami.
cookies-disabled-button-try-again = Poskusi znova
cookies-disabled-learn-more = Več o tem


index-header = Vnesite e-poštni naslov
index-sync-header = Nadaljujte v { -product-mozilla-account(sklon: "tozilnik") }
index-sync-subheader = Sinhronizirajte gesla, zavihke in zaznamke na vseh mestih, kjer uporabljate { -brand-firefox(sklon: "tozilnik") }.
index-relay-header = Ustvarite e-poštno masko
index-relay-subheader = Navedite e-poštni naslov, na katerega želite posredovati sporočila s svoje e-poštne maske.
index-subheader-with-servicename = Nadaljuj na { $serviceName }
index-subheader-default = Nadaljuj na nastavitve računa
index-cta = Registracija ali prijava
index-account-info = { -product-mozilla-account } omogoča tudi dostop do izdelkov { -brand-mozilla(sklon: "rodilnik") }, ki bolj varujejo zasebnost.
index-email-input =
    .label = Vnesite e-poštni naslov
index-account-delete-success = Račun je bil uspešno izbrisan
index-email-bounced = Vaša potrditvena e-pošta se je pravkar vrnila. Ste se zatipkali v e-poštnem naslovu?


inline-recovery-key-setup-create-error = Opla! Ključa za obnovitev računa ni bilo mogoče ustvariti. Poskusite znova pozneje.
inline-recovery-key-setup-recovery-created = Ključ za obnovitev računa ustvarjen
inline-recovery-key-setup-download-header = Zavarujte svoj račun
inline-recovery-key-setup-download-subheader = Prenesite in shranite ga zdaj
inline-recovery-key-setup-download-info = Shranite ta ključ na mesto, ki si ga boste zapomnili – pozneje se na to stran ne boste mogli vrniti.
inline-recovery-key-setup-hint-header = Varnostno priporočilo


inline-totp-setup-cancel-setup-button = Ne nastavi
inline-totp-setup-continue-button = Nadaljuj
inline-totp-setup-add-security-link = Okrepite varnost svojega računa z zahtevanjem overitvenih kod iz ene od <authenticationAppsLink>naslednjih aplikacij za overitev</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Omogočite overjanje v dveh korakih <span>za nadaljevanje na nastavitve računa</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Omogočite overjanje v dveh korakih <span>za nadaljevanje na { $serviceName }</span>
inline-totp-setup-ready-button = V stanju pripravljenosti.
inline-totp-setup-show-qr-custom-service-header-2 = Skenirajte overitveno kodo <span>za nadaljevanje na { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Ročno vnesite kodo <span>za nadaljevanje na { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Skenirajte overitveno kodo <span>za nadaljevanje v nastavitve računa</span>
inline-totp-setup-no-qr-default-service-header-2 = Ročno vnesite kodo <span>za nadaljevanje v nastavitve računa</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Vnesite ta skrivni ključ v aplikacijo za overjanje. <toggleToQRButton>Ali želite raje skenirati kodo QR?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Skenirajte kodo QR v svoji aplikaciji za overjanje in nato vnesite overitveno kodo, ki jo ponuja. <toggleToManualModeButton>Ne morete skenirati kode?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Ko bo končano, bo začelo ustvarjati overitvene kode, ki jih lahko vnesete.
inline-totp-setup-security-code-placeholder = Overitvena koda
inline-totp-setup-code-required-error = Zahtevana je overitvena koda
tfa-qr-code-alt = S pomočjo kode { $code } nastavite dvostopenjsko overjanje v podprtih aplikacijah.
inline-totp-setup-page-title = Overitev v dveh korakih


legal-header = Pravno obvestilo
legal-terms-of-service-link = Pogoji uporabe
legal-privacy-link = Obvestilo o zasebnosti


legal-privacy-heading = Obvestilo o zasebnosti


legal-terms-heading = Pogoji uporabe


pair-auth-allow-heading-text = Ste se pravkar prijavili v { -product-firefox }?
pair-auth-allow-confirm-button = Da, odobri napravo
pair-auth-allow-refuse-device-link = Če to niste bili vi, <link>spremenite geslo</link>


pair-auth-complete-heading = Naprava povezana
pair-auth-complete-now-syncing-device-text = Zdaj sinhronizirate z: { $deviceFamily } v sistemu { $deviceOS }
pair-auth-complete-sync-benefits-text = Zdaj lahko dostopate do odprtih zavihkov, gesel in zaznamkov na vseh svojih napravah.
pair-auth-complete-see-tabs-button = Prikaži zavihke s sinhroniziranih naprav
pair-auth-complete-manage-devices-link = Upravljanje naprav …


auth-totp-heading-w-default-service = Vnesite overitveno kodo <span>za nadaljevanje v nastavitve računa</span>
auth-totp-heading-w-custom-service = Vnesite overitveno kodo <span>za nadaljevanje na { $serviceName }</span>
auth-totp-instruction = Odprite aplikacijo za overjanje in vnesite kodo, ki jo predlaga.
auth-totp-input-label = Vnesite 6-mestno kodo
auth-totp-confirm-button = Potrdi
auth-totp-code-required-error = Zahtevana je overitvena koda


pair-wait-for-supp-heading-text = Zdaj je zahtevana odobritev <span>z vaše druge naprave</span>


pair-failure-header = Seznanjanje ni uspelo
pair-failure-message = Postopek nastavitve je bil prekinjen.


pair-sync-header = Sinhronizirajte { -brand-firefox } na telefonu ali tablici
pair-cad-header = Povežite { -brand-firefox } na drugi napravi
pair-already-have-firefox-paragraph = Že imate { -brand-firefox } na telefonu ali tablici?
pair-sync-your-device-button = Sinhronizirajte svojo napravo
pair-or-download-subheader = ali prenesite Firefox
pair-scan-to-download-message = Skenirajte in prenesite { -brand-firefox } za mobilne naprave ali si pošljite <linkExternal>povezavo za prenos</linkExternal>.
pair-not-now-button = Ne zdaj
pair-take-your-data-message = Vzemite zavihke, zaznamke in gesla kamorkoli greste s { -brand-firefox(sklon: "orodnik") }.
pair-get-started-button = Začni
pair-qr-code-aria-label = Koda QR


pair-success-header-2 = Naprava povezana
pair-success-message-2 = Seznanjanje uspešno.


pair-supp-allow-heading-text = Potrdi seznanitev <span>za { $email }</span>
pair-supp-allow-confirm-button = Potrdi seznanitev
pair-supp-allow-cancel-link = Prekliči


pair-wait-for-auth-heading-text = Zdaj je zahtevana odobritev <span>z vaše druge naprave</span>


pair-unsupported-header = Seznani s pomočjo aplikacije
pair-unsupported-message = Ste uporabili sistemsko kamero? Seznanitev morate opraviti v aplikaciji { -brand-firefox }.




set-password-heading-v2 = Ustvarite geslo za sinhronizacijo
set-password-info-v2 = S tem se vaši podatki šifrirajo. Geslo mora biti drugačno od gesla vašega računa { -brand-google } ali { -brand-apple }.


third-party-auth-callback-message = Počakajte, poteka preusmeritev na pooblaščeno aplikacijo.


account-recovery-confirm-key-heading = Vnesite ključ za obnovitev računa
account-recovery-confirm-key-instruction = Ta ključ obnovi podatke, kot so gesla in zaznamki, ki so šifrirani shranjeni v strežnikih { -brand-firefox(sklon: "rodilnik") }.
account-recovery-confirm-key-input-label =
    .label = Vnesite 32-mestni ključ za obnovitev računa
account-recovery-confirm-key-hint = Vaš namig za shranjevanje je:
account-recovery-confirm-key-button-2 = Nadaljuj
account-recovery-lost-recovery-key-link-2 = Ne najdete ključa za obnovitev računa?


complete-reset-pw-header-v2 = Ustvarite novo geslo
complete-reset-password-success-alert = Geslo je nastavljeno
complete-reset-password-error-alert = Pri nastavljanju gesla je prišlo do težave
complete-reset-pw-recovery-key-link = Uporabi ključ za obnovitev računa
reset-password-complete-banner-heading = Vaše geslo je bilo ponastavljeno.
reset-password-complete-banner-message = Ne pozabite v nastavitvah { -product-mozilla-account(sklon: "rodilnik") } ustvariti novega ključa za obnovitev računa, da se izognete nadaljnjim težavam pri prijavi.
complete-reset-password-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.


confirm-backup-code-reset-password-input-label = Vnesite 10-mestno kodo
confirm-backup-code-reset-password-confirm-button = Potrdi
confirm-backup-code-reset-password-subheader = Vnesite rezervno overitveno kodo
confirm-backup-code-reset-password-instruction = Vnesite eno izmed enkratnih kod, ki ste jih shranili ob nastavitvi overjanja v dveh korakih.
confirm-backup-code-reset-password-locked-out-link = Se ne morete prijaviti?


confirm-reset-password-with-code-heading = Preverite e-pošto
confirm-reset-password-with-code-instruction = Potrditveno kodo smo poslali na <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Vnesite 8-mestno kodo v 10 minutah
confirm-reset-password-otp-submit-button = Nadaljuj
confirm-reset-password-otp-resend-code-button = Znova pošlji kodo
confirm-reset-password-otp-different-account-link = Uporabi drug račun


confirm-totp-reset-password-header = Ponastavite geslo
confirm-totp-reset-password-subheader-v2 = Vnesite kodo za overjanje v dveh korakih
confirm-totp-reset-password-instruction-v2 = V <strong>aplikaciji za overjanje</strong> ponastavite geslo.
confirm-totp-reset-password-trouble-code = Imate težave pri vnosu kode?
confirm-totp-reset-password-confirm-button = Potrdi
confirm-totp-reset-password-input-label-v2 = Vnesite 6-mestno kodo
confirm-totp-reset-password-use-different-account = Uporabi drug račun


password-reset-flow-heading = Ponastavite geslo
password-reset-body-2 = Vprašali bomo za nekaj stvari, ki jih veste samo vi, da zavarujemo vaš račun.
password-reset-email-input =
    .label = Vnesite e-poštni naslov
password-reset-submit-button-2 = Nadaljuj


reset-password-complete-header = Vaše geslo je bilo ponastavljeno
reset-password-confirmed-cta = Nadaljuj na { $serviceName }




password-reset-recovery-method-header = Ponastavite geslo
password-reset-recovery-method-subheader = Izberite način obnovitve
password-reset-recovery-method-details = Prepričajmo se, da ste to naredili vi. Uporabite svoje metode za obnovitev.
password-reset-recovery-method-phone = Telefonska številka za obnovitev
password-reset-recovery-method-code = Rezervne overitvene kode
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } preostala koda
        [two] { $numBackupCodes } preostali kodi
        [few] { $numBackupCodes } preostale kode
       *[other] { $numBackupCodes } preostalih kod
    }
password-reset-recovery-method-send-code-error-heading = Pri pošiljanju kode na telefonsko številko za obnovitev je prišlo do težave
password-reset-recovery-method-send-code-error-description = Poskusite znova pozneje ali uporabite rezervne overitvene kode.


reset-password-recovery-phone-flow-heading = Ponastavite geslo
reset-password-recovery-phone-heading = Vnesite kodo za obnovitev
reset-password-recovery-phone-instruction-v3 = Na telefonsko številko, ki se končuje s <span>{ $lastFourPhoneDigits }</span>, je bila poslana 6-mestna koda v obliki sporočila SMS. Koda poteče po 5 minutah. Ne delite je z nikomer.
reset-password-recovery-phone-input-label = Vnesite 6-mestno kodo
reset-password-recovery-phone-code-submit-button = Potrdi
reset-password-recovery-phone-resend-code-button = Znova pošlji kodo
reset-password-recovery-phone-resend-success = Koda poslana
reset-password-recovery-phone-locked-out-link = Se ne morete prijaviti?
reset-password-recovery-phone-send-code-error-heading = Pri pošiljanju kode je prišlo do težave
reset-password-recovery-phone-code-verification-error-heading = Pri preverjanju kode je prišlo do težave
reset-password-recovery-phone-general-error-description = Poskusite znova kasneje.
reset-password-recovery-phone-invalid-code-error-description = Koda je neveljavna ali ji je potekla veljavnost.
reset-password-recovery-phone-invalid-code-error-link = Želite namesto tega uporabiti rezervne overitvene kode?
reset-password-with-recovery-key-verified-page-title = Ponastavitev gesla je uspela
reset-password-complete-new-password-saved = Novo geslo shranjeno!
reset-password-complete-recovery-key-created = Nov obnovitveni ključ za račun je ustvarjen. Prenesite in shranite ga zdaj.
reset-password-complete-recovery-key-download-info =
    Ta ključ je potreben za
    obnovitev podatkov, če pozabite geslo. <b>Prenesite ga in ga varno shranite
     zdaj, saj se pozneje ne boste več mogli vrniti na to stran.</b>


error-label = Napaka:
validating-signin = Potrjevanje prijave …
complete-signin-error-header = Napaka pri potrjevanju
signin-link-expired-header = Potrditvena povezava je potekla
signin-link-expired-message-2 = Povezavi, ki ste jo kliknili, je potekla veljavnost ali pa je bila že uporabljena.


signin-password-needed-header-2 = Vnesite geslo <span>za { -product-mozilla-account }</span>
signin-subheader-without-logo-with-servicename = Nadaljuj na { $serviceName }
signin-subheader-without-logo-default = Nadaljuj na nastavitve računa
signin-button = Prijava
signin-header = Prijava
signin-use-a-different-account-link = Uporabi drug račun
signin-forgot-password-link = Pozabljeno geslo?
signin-password-button-label = Geslo
signin-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.
signin-code-expired-error = Koda je potekla. Prijavite se znova.
signin-recovery-error = Nekaj je šlo narobe. Ponovno se prijavite.
signin-account-locked-banner-heading = Ponastavite geslo
signin-account-locked-banner-description = Vaš račun smo zaklenili, da bi ga zaščitili pred sumljivo dejavnostjo.
signin-account-locked-banner-link = Ponastavite geslo za prijavo


report-signin-link-damaged-body = Povezavi, ki ste jo kliknili, je manjkalo nekaj znakov. Morda jo je pokvaril vaš poštni odjemalec. Poskusite jo previdno kopirati še enkrat.
report-signin-header = Prijavi nepooblaščeno prijavo?
report-signin-body = Prejeli ste sporočilo o poskusu dostopa do vašega računa. Želite to dejavnost prijaviti kot sumljivo?
report-signin-submit-button = Prijavi sumljivo dejavnost
report-signin-support-link = Zakaj se to dogaja?
report-signin-error = Pri pošiljanju poročila je prišlo do napake.
signin-bounced-header = Oprostite. Zaklenili smo vaš račun.
signin-bounced-message = Potrditveno sporočilo, ki smo ga poslali na { $email }, je bilo vrnjeno, vaš račun pa smo zaradi zaščite vaših podatkov v { -brand-firefox(sklon: "mestnik") } zaklenili.
signin-bounced-help = Če je to veljaven e-poštni naslov, <linkExternal>nam to sporočite</linkExternal> in pomagali vam bomo odkleniti vaš račun.
signin-bounced-create-new-account = Ne uporabljate več tega naslova? Ustvarite nov račun
back = Nazaj


signin-push-code-heading-w-default-service = Potrdite to prijavo <span>za nadaljevanje v nastavitve računa</span>
signin-push-code-heading-w-custom-service = Potrdite to prijavo <span>za nadaljevanje v { $serviceName }</span>
signin-push-code-instruction = Preverite druge svoje naprave in odobrite to prijavo iz svojega brskalnika { -brand-firefox }.
signin-push-code-did-not-recieve = Niste prejeli obvestila?
signin-push-code-send-email-link = Pošlji kodo


signin-push-code-confirm-instruction = Potrdite prijavo
signin-push-code-confirm-description = Z naslednje naprave smo zaznali poskus prijave. Če ste bili to vi, odobrite prijavo
signin-push-code-confirm-verifying = Potrjevanje
signin-push-code-confirm-login = Potrdi prijavo
signin-push-code-confirm-wasnt-me = To nisem bil/-a jaz, spremeni geslo.
signin-push-code-confirm-login-approved = Vaša prijava je bila odobrena. Zaprite to okno.
signin-push-code-confirm-link-error = Povezava je poškodovana. Poskusite znova.


signin-recovery-method-header = Prijava
signin-recovery-method-subheader = Izberite način obnovitve
signin-recovery-method-details = Prepričajmo se, da ste to naredili vi. Uporabite svoje metode za obnovitev.
signin-recovery-method-phone = Telefonska številka za obnovitev
signin-recovery-method-code-v2 = Rezervne overitvene kode
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } preostala koda
        [two] { $numBackupCodes } preostali kodi
        [few] { $numBackupCodes } preostale kode
       *[other] { $numBackupCodes } preostalih kod
    }
signin-recovery-method-send-code-error-heading = Pri pošiljanju kode na telefonsko številko za obnovitev je prišlo do težave
signin-recovery-method-send-code-error-description = Poskusite znova pozneje ali uporabite rezervne overitvene kode.


signin-recovery-code-heading = Prijava
signin-recovery-code-sub-heading = Vnesite rezervno overitveno kodo
signin-recovery-code-instruction-v3 = Vnesite eno izmed enkratnih kod, ki ste jih shranili ob nastavitvi overjanja v dveh korakih.
signin-recovery-code-input-label-v2 = Vnesite 10-mestno kodo
signin-recovery-code-confirm-button = Potrdi
signin-recovery-code-phone-link = Uporabi telefonsko številko za obnovitev
signin-recovery-code-support-link = Se ne morete prijaviti?
signin-recovery-code-required-error = Zahtevana je rezervna overitvena koda
signin-recovery-code-use-phone-failure = Pri pošiljanju kode na telefonsko številko za obnovitev je prišlo do težave
signin-recovery-code-use-phone-failure-description = Poskusite znova kasneje.


signin-recovery-phone-flow-heading = Prijava
signin-recovery-phone-heading = Vnesite kodo za obnovitev
signin-recovery-phone-instruction-v3 = Na telefonsko številko, ki se končuje s <span>{ $lastFourPhoneDigits }</span>, je bila poslana 6-mestna koda v obliki sporočila SMS. Koda poteče po 5 minutah. Ne delite je z nikomer.
signin-recovery-phone-input-label = Vnesite 6-mestno kodo
signin-recovery-phone-code-submit-button = Potrdi
signin-recovery-phone-resend-code-button = Znova pošlji kodo
signin-recovery-phone-resend-success = Koda poslana
signin-recovery-phone-locked-out-link = Se ne morete prijaviti?
signin-recovery-phone-send-code-error-heading = Pri pošiljanju kode je prišlo do težave
signin-recovery-phone-code-verification-error-heading = Pri preverjanju kode je prišlo do težave
signin-recovery-phone-general-error-description = Poskusite znova kasneje.
signin-recovery-phone-invalid-code-error-description = Koda je neveljavna ali ji je potekla veljavnost.
signin-recovery-phone-invalid-code-error-link = Želite namesto tega uporabiti rezervne overitvene kode?
signin-recovery-phone-success-message = Prijava uspešna. Če ponovno uporabite telefonsko številko za obnovitev, lahko veljajo omejitve.


signin-reported-header = Hvala za vašo pozornost
signin-reported-message = Naša ekipa je bila obveščena. Takšna poročila nam pomagajo odgnati vsiljivce.


signin-token-code-heading-2 = Vnesite potrditveno kodo<span> za svoj { -product-mozilla-account }</span>
signin-token-code-instruction-v2 = V 5 minutah vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
signin-token-code-input-label-v2 = Vnesite 6-mestno kodo
signin-token-code-confirm-button = Potrdi
signin-token-code-code-expired = Je koda potekla?
signin-token-code-resend-code-link = Pošlji novo kodo.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Pošlji novo kodo čez { $seconds } sekundo
        [two] Pošlji novo kodo čez { $seconds } sekundi
        [few] Pošlji novo kodo čez { $seconds } sekunde
       *[other] Pošlji novo kodo čez { $seconds } sekund
    }
signin-token-code-required-error = Zahtevana je potrditvena koda
signin-token-code-resend-error = Prišlo je do napake. Nove kode ni bilo mogoče poslati.
signin-token-code-instruction-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.


signin-totp-code-header = Prijava
signin-totp-code-subheader-v2 = Vnesite kodo za overjanje v dveh korakih
signin-totp-code-instruction-v4 = V <strong>aplikaciji za overjanje</strong> potrdite prijavo.
signin-totp-code-input-label-v4 = Vnesite 6-mestno kodo
signin-totp-code-aal-banner-header = Zakaj se zahteva overjanje?
signin-totp-code-aal-banner-content = Za svoj račun ste nastavili overjanje v dveh korakih, vendar se na tej napravi še niste prijavili s kodo.
signin-totp-code-aal-sign-out = Odjava v tej napravi
signin-totp-code-aal-sign-out-error = Oprostite, prišlo je do težave pri odjavljanju
signin-totp-code-confirm-button = Potrdi
signin-totp-code-other-account-link = Uporabi drug račun
signin-totp-code-recovery-code-link = Imate težave pri vnosu kode?
signin-totp-code-required-error = Zahtevana je overitvena koda
signin-totp-code-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.


signin-unblock-header = Pooblasti to prijavo
signin-unblock-body = Med svojo e-pošto poiščite overitveno kodo, poslano na { $email }.
signin-unblock-code-input = Vnesite overitveno kodo
signin-unblock-submit-button = Nadaljuj
signin-unblock-code-required-error = Zahtevana je overitvena koda
signin-unblock-code-incorrect-length = Overitvena koda mora vsebovati 8 znakov
signin-unblock-code-incorrect-format-2 = Koda lahko vsebuje samo črke in/ali številke
signin-unblock-resend-code-button = Ni med prejeto ali vsiljeno pošto? Pošlji znova
signin-unblock-support-link = Zakaj se to dogaja?
signin-unblock-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.




confirm-signup-code-page-title = Vnesite potrditveno kodo
confirm-signup-code-heading-2 = Vnesite potrditveno kodo <span>za svoj { -product-mozilla-account }</span>
confirm-signup-code-instruction-v2 = V 5 minutah vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
confirm-signup-code-input-label = Vnesite 6-mestno kodo
confirm-signup-code-confirm-button = Potrdi
confirm-signup-code-sync-button = Začni s sinhronizacijo
confirm-signup-code-code-expired = Je koda potekla?
confirm-signup-code-resend-code-link = Pošlji novo kodo.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Pošljite novo kodo čez { $seconds } sekunde
        [two] Pošljite novo kodo čez { $seconds } sekund
        [few] Pošljite novo kodo čez { $seconds } sekund
       *[other] Pošljite novo kodo čez { $seconds } sekund
    }
confirm-signup-code-success-alert = Račun uspešno potrjen
confirm-signup-code-is-required-error = Zahtevana je potrditvena koda
confirm-signup-code-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.


signup-heading-v2 = Ustvarite geslo
signup-relay-info = Geslo je potrebno za varno upravljanje zamaskirane e-pošte in dostop do { -brand-mozilla(sklon: "rodilnik") } varnostnih orodij.
signup-sync-info = Sinhronizirajte gesla, zaznamke in ostale podatke povsod, kjer uporabljate { -brand-firefox(sklon: "tozilnik") }.
signup-sync-info-with-payment = Sinhronizirajte gesla, plačilna sredstva, zaznamke in ostale podatke povsod, kjer uporabljate { -brand-firefox(sklon: "tozilnik") }.
signup-change-email-link = Spremeni e-pošto


signup-confirmed-sync-header = Sinhronizacija je vključena
signup-confirmed-sync-success-banner = { -product-mozilla-account } potrjen
signup-confirmed-sync-button = Začnite z brskanjem
signup-confirmed-sync-description-with-payment-v2 = Vaša gesla, plačilna sredstva, naslovi, zaznamki, zgodovina in drugi podatki se lahko sinhronizirajo povsod, kjer uporabljate { -brand-firefox(sklon: "tozilnik") }.
signup-confirmed-sync-description-v2 = Vaša gesla, naslovi, zaznamki, zgodovina in drugi podatki se lahko sinhronizirajo povsod, kjer uporabljate { -brand-firefox(sklon: "tozilnik") }.
signup-confirmed-sync-add-device-link = Dodaj drugo napravo
signup-confirmed-sync-manage-sync-button = Upravljanje sinhronizacije
signup-confirmed-sync-set-password-success-banner = Geslo za sinhronizacijo ustvarjeno
