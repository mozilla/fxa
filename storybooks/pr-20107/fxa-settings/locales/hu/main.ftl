



-brand-mozilla =
    { $case ->
        [accusative] Mozillát
        [instrumental] Mozillával
       *[nominative] Mozilla
    }
-brand-firefox =
    { $case ->
        [accusative] Firefoxot
        [dative] Firefoxnak
        [genitive] Firefoxé
        [instrumental] Firefoxszal
        [causal] Firefoxért
        [translative] Firefoxszá
        [terminative] Firefoxig
        [illative] Firefoxba
        [adessive] Firefoxnál
        [ablative] Firefoxtól
        [elative] Firefoxból
        [sublative] Firefoxra
        [inessive] Firefoxban
        [superessive] Firefoxon
        [delative] Firefoxról
       *[nominative] Firefox
    }
-product-firefox-accounts = Firefox-fiókok
-product-mozilla-account = Mozilla-fiók
-product-mozilla-accounts = Mozilla-fiókok
-product-firefox-account = Firefox-fiók
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
-app-store =
    { $case ->
        [accusative] App Store-t
        [inessive] App Store-ban
        [instrumental] App Store-ral
        [elative] App Store-ból
       *[nominative] App Store
    }
-google-play =
    { $case ->
        [accusative] Google Playt
        [inessive] Google Playben
        [instrumental] Google Playjel
        [elative] Google Playből
       *[nominative] Google Play
    }

app-general-err-heading = Általános alkalmazáshiba
app-general-err-message = Hiba történt, próbálja újra később.
app-query-parameter-err-heading = Hibás kérés: érvénytelen lekérdezési paraméterek


app-footer-mozilla-logo-label = { -brand-mozilla } logó
app-footer-privacy-notice = Webhely adatvédelmi nyilatkozata
app-footer-terms-of-service = A szolgáltatás feltételei


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Új ablakban nyílik meg


app-loading-spinner-aria-label-loading = Betöltés…


app-logo-alt-3 =
    .alt = { -brand-mozilla } m logó



resend-code-success-banner-heading = Új kód lett küldve az e-mail-címére.
resend-link-success-banner-heading = Új hivatkozás lett küldve az e-mail-címére.
resend-success-banner-description = Adja hozzá az { $accountsEmail } címet a névjegyei közé, a sima kézbesítés érdekében.


brand-banner-dismiss-button-2 =
    .aria-label = Banner bezárása
brand-prelaunch-title = A { -product-firefox-accounts } új neve { -product-mozilla-accounts } lesz november 1-jén
brand-prelaunch-subtitle = Továbbra is ugyanazzal a felhasználónévvel és jelszóval fog bejelentkezni, és nincs más változás a használt termékekben.
brand-postlaunch-title = Átneveztük a { -product-firefox-accounts }at { -product-mozilla-accounts }ra. Továbbra is ugyanazzal a felhasználónévvel és jelszóval fog bejelentkezni, és nincs más változás a használt termékekben.
brand-learn-more = További tudnivalók
brand-close-banner =
    .alt = Banner bezárása
brand-m-logo =
    .alt = { -brand-mozilla } m logó


button-back-aria-label = Vissza
button-back-title = Vissza


recovery-key-download-button-v3 = Letöltés és folytatás
    .title = Letöltés és folytatás
recovery-key-pdf-heading = Fiók-helyreállítási kulcs
recovery-key-pdf-download-date = Előállítva: { $date }
recovery-key-pdf-key-legend = Fiók-helyreállítási kulcs
recovery-key-pdf-instructions = Ez a kulcs lehetővé teszi a titkosított böngészőadatok (beleértve a jelszavakat, könyvjelzőket és az előzményeket) helyreállítását, ha elfelejti a jelszavát. Tárolja olyan helyen, amelyre emlékezni fog.
recovery-key-pdf-storage-ideas-heading = Helyek a kulcsok tárolására
recovery-key-pdf-support = Tudjon meg többet a fiók-helyreállítási kulcsról
recovery-key-pdf-download-error = Sajnos probléma merült fel a fiók-helyreállítási kulcs letöltése során.


button-passkey-signin = Jelentkezzen be jelkulcs segítségével
button-passkey-signin-loading = Biztonságos bejelentkezés…


choose-newsletters-prompt-2 = Kapjon többet a { -brand-mozilla(ending: "accented") }ból:
choose-newsletters-option-latest-news =
    .label = Iratkozzon fel a legfrissebb híreinkre és termékeinkre
choose-newsletters-option-test-pilot =
    .label = Korai hozzáférés az új termékek teszteléséhez
choose-newsletters-option-reclaim-the-internet =
    .label = Felhívások az internet visszaszerzésére


datablock-download =
    .message = Letöltve
datablock-copy =
    .message = Másolva
datablock-print =
    .message = Kinyomtatva


datablock-copy-success =
    { $count ->
        [one] Kód másolva
       *[other] Kódok másolva
    }
datablock-download-success =
    { $count ->
        [one] Kód letöltve
       *[other] Kódok letöltve
    }
datablock-print-success =
    { $count ->
        [one] Kód kinyomtatva
       *[other] Kódok kinyomtatva
    }


datablock-inline-copy =
    .message = Másolva


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (becsült)
device-info-block-location-region-country = { $region }, { $country } (becsült)
device-info-block-location-city-country = { $city }, { $country } (becsült)
device-info-block-location-country = { $country } (becsült)
device-info-block-location-unknown = Hely ismeretlen
device-info-browser-os = { $browserName } ezen: { $genericOSName }
device-info-ip-address = IP-cím: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Jelszó
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Jelszó megismétlése
form-password-with-inline-criteria-signup-submit-button = Fiók létrehozása
form-password-with-inline-criteria-reset-new-password =
    .label = Új jelszó
form-password-with-inline-criteria-confirm-password =
    .label = Jelszó megerősítése
form-password-with-inline-criteria-reset-submit-button = Új jelszó létrehozása
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Jelszó
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Jelszó megismétlése
form-password-with-inline-criteria-set-password-submit-button = Szinkronizálás indítása
form-password-with-inline-criteria-match-error = A jelszavak nem egyeznek
form-password-with-inline-criteria-sr-too-short-message = A jelszónak legalább 8 karakterből kell állnia.
form-password-with-inline-criteria-sr-not-email-message = A jelszó nem tartalmazhatja az e-mail-címét.
form-password-with-inline-criteria-sr-not-common-message = A jelszó nem lehet gyakran használt jelszó.
form-password-with-inline-criteria-sr-requirements-met = A megadott jelszó betartja az összes jelszókövetelményt.
form-password-with-inline-criteria-sr-passwords-match = A megadott jelszavak egyeznek.


form-verify-code-default-error = Ez a mező kötelező


form-verify-totp-disabled-button-title-numeric = A folytatáshoz adja meg a { $codeLength } számjegyű kódot
form-verify-totp-disabled-button-title-alphanumeric = A folytatáshoz adja meg a { $codeLength } karakteres kódot


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } fiók-helyreállítási kulcs
get-data-trio-title-backup-verification-codes = Tartalék hitelesítési kódok
get-data-trio-download-2 =
    .title = Letöltés
    .aria-label = Letöltés
get-data-trio-copy-2 =
    .title = Másolás
    .aria-label = Másolás
get-data-trio-print-2 =
    .title = Nyomtatás
    .aria-label = Nyomtatás


alert-icon-aria-label =
    .aria-label = Figyelmeztetés
icon-attention-aria-label =
    .aria-label = Figyelem
icon-warning-aria-label =
    .aria-label = Figyelmeztetés
authenticator-app-aria-label =
    .aria-label = Hitelesítő alkalmazás
backup-codes-icon-aria-label-v2 =
    .aria-label = Tartalék hitelesítési kódok engedélyezve
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Tartalék hitelesítési kódok letiltva
backup-recovery-sms-icon-aria-label =
    .aria-label = Helyreállító SMS engedélyezve
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Helyreállító SMS letiltva
canadian-flag-icon-aria-label =
    .aria-label = Kanadai zászló
checkmark-icon-aria-label =
    .aria-label = Pipa
checkmark-success-icon-aria-label =
    .aria-label = Sikeres
checkmark-enabled-icon-aria-label =
    .aria-label = Engedélyezve
close-icon-aria-label =
    .aria-label = Üzenet bezárása
code-icon-aria-label =
    .aria-label = Kód
error-icon-aria-label =
    .aria-label = Hiba
info-icon-aria-label =
    .aria-label = Információ
usa-flag-icon-aria-label =
    .aria-label = Egyesült Államok zászlaja
icon-loading-arrow-aria-label =
    .aria-label = Betöltés
icon-passkey-aria-label =
    .aria-label = Jelkulcs


hearts-broken-image-aria-label =
    .aria-label = Egy számítógép és egy mobiltelefon, mindkettőn egy összetört szív képe
hearts-verified-image-aria-label =
    .aria-label = Egy számítógép, egy mobiltelefon és egy táblagép, mindegyiken egy dobogó szívvel
signin-recovery-code-image-description =
    .aria-label = Rejtett szöveget tartalmazó dokumentum.
signin-totp-code-image-label =
    .aria-label = Egy eszköz egy rejtett 6 számjegyű kóddal.
confirm-signup-aria-label =
    .aria-label = Egy hivatkozást tartalmazó boríték
security-shield-aria-label =
    .aria-label = Az illusztráció egy fiók-helyreállítási kulcsot reprezentál.
recovery-key-image-aria-label =
    .aria-label = Az illusztráció egy fiók-helyreállítási kulcsot reprezentál.
password-image-aria-label =
    .aria-label = Egy jelszó beírását ábrázoló illusztráció.
lightbulb-aria-label =
    .aria-label = A tárolási tipp létrehozását jelképező illusztráció.
email-code-image-aria-label =
    .aria-label = Egy kódot tartalmazó e-mail ábrája.
recovery-phone-image-description =
    .aria-label = Mobileszköz, amely kódot kap SMS-ben.
recovery-phone-code-image-description =
    .aria-label = Mobileszközön kapott kód.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobileszköz SMS lehetőséggel
backup-authentication-codes-image-aria-label =
    .aria-label = Eszközképernyő kódokkal
sync-clouds-image-aria-label =
    .aria-label = Felhők egy szinkronizálási ikonnal
confetti-falling-image-aria-label =
    .aria-label = Animált hulló konfetti


inline-recovery-key-setup-signed-in-firefox-2 = Bejelentkezett a { -brand-firefox(case: "illative") } .
inline-recovery-key-setup-create-header = Biztosítsa fiókját
inline-recovery-key-setup-create-subheader = Van egy perce az adatai megvédésére?
inline-recovery-key-setup-info = Hozzon létre egy fiók-helyreállítási kulcsot, hogy helyreállítsa a szinkronizált böngészési adatait, ha elfelejtené a jelszavát.
inline-recovery-key-setup-start-button = Fiók-helyreállítási kulcs létrehozása
inline-recovery-key-setup-later-button = Tegye meg később


input-password-hide = Jelszó elrejtése
input-password-show = Jelszó megjelenítése
input-password-hide-aria-2 = A jelszava jelenleg látható a képernyőn.
input-password-show-aria-2 = A jelszava jelenleg rejtett.
input-password-sr-only-now-visible = A jelszava most már látható a képernyőn.
input-password-sr-only-now-hidden = A jelszava most már rejtett.


input-phone-number-country-list-aria-label = Válasszon országot
input-phone-number-enter-number = Adja meg a telefonszámot
input-phone-number-country-united-states = Egyesült Államok
input-phone-number-country-canada = Kanada
legal-back-button = Vissza


reset-pwd-link-damaged-header = A jelszó-visszaállítási hivatkozás sérült
signin-link-damaged-header = A megerősítő hivatkozás sérült
report-signin-link-damaged-header = Sérült hivatkozás
reset-pwd-link-damaged-message = A hivatkozásból karakterek hiányoztak, ezt az e-mail kliense ronthatta el. Másolja be a címet körültekintően, és próbálja újra.


link-expired-new-link-button = Új hivatkozás kérése


remember-password-text = Emlékszik a jelszavára?
remember-password-signin-link = Bejelentkezés


primary-email-confirmation-link-reused = Az elsődleges e-mail már meg lett erősítve
signin-confirmation-link-reused = A bejelentkezés már meg lett erősítve
confirmation-link-reused-message = A megerősítési hivatkozás már volt használva, és csak egyszer használható.


locale-toggle-select-label = Válasszon nyelvet
locale-toggle-browser-default = Böngésző alapértelmezése
error-bad-request = Hibás kérés


password-info-balloon-why-password-info = Erre a jelszóra van szüksége a nálunk tárolt titkosított adatok eléréséhez.
password-info-balloon-reset-risk-info = Az alaphelyzetbe állítás azt jelenti, hogy elvesztheti az adatait, például a jelszavait és könyvjelzőit.


password-strength-long-instruction = Válasszon erős jelszót, melyet más oldalakon nem használt. Győződjön meg róla, hogy megfelel a biztonsági követelményeknek:
password-strength-short-instruction = Válasszon erős jelszót:
password-strength-inline-min-length = Legalább 8 karakter
password-strength-inline-not-email = Nem az Ön e-mail-címe
password-strength-inline-not-common = Nem gyakran használt jelszó
password-strength-inline-confirmed-must-match = A megerősítés egyezik az új jelszóval
password-strength-inline-passwords-match = A jelszavak egyeznek


account-recovery-notification-cta = Létrehozás
account-recovery-notification-header-value = Ne veszítse el adatait, ha elfelejti a jelszavát
account-recovery-notification-header-description = Hozzon létre egy fiók-helyreállítási kulcsot, hogy helyreállítsa a szinkronizált böngészési adatait, ha elfelejtené a jelszavát.
recovery-phone-promo-cta = Helyreállítási telefonszám hozzáadása
recovery-phone-promo-heading = Adjon további védelmet a fiókjának egy helyreállítási telefonszámmal
recovery-phone-promo-description = Mostantól bejelentkezhet egy egyszer használatos jelszóval SMS-ben, ha nem tudja használni a kétlépcsős hitelesítő alkalmazását.
recovery-phone-promo-info-link = Tudjon meg többet a helyreállítás és a SIM-csere kockázatáról
promo-banner-dismiss-button =
    .aria-label = Banner eltüntetése


ready-complete-set-up-instruction = Fejezze be a beállítást az új jelszó megadásával a többi { -brand-firefox(case: "accusative") } használó eszközén.
manage-your-account-button = Saját fiók kezelése
ready-use-service = Most már készen áll a { $serviceName } használatára
ready-use-service-default = Most már készen áll a fiókbeállítások használatára
ready-account-ready = A fiókja elkészült!
ready-continue = Folytatás
sign-in-complete-header = Bejelentkezés megerősítve
sign-up-complete-header = Fiók megerősítve
primary-email-verified-header = Elsődleges e-mail-cím megerősítve


flow-recovery-key-download-storage-ideas-heading-v2 = Kulcstároló helyek:
flow-recovery-key-download-storage-ideas-folder-v2 = Mappa egy biztonságos eszközön
flow-recovery-key-download-storage-ideas-cloud = Megbízható felhős tároló
flow-recovery-key-download-storage-ideas-print-v2 = Kinyomtatott fizikai másolat
flow-recovery-key-download-storage-ideas-pwd-manager = Jelszókezelő


flow-recovery-key-hint-header-v2 = Tipp hozzáadása, amely segít megtalálni a kulcsát
flow-recovery-key-hint-message-v3 = Ez a tipp segít megjegyezni, hogy hol tárolta a fiók-helyreállítási kulcsot. Meg tudjuk jeleníteni a jelszó-visszaállításkor, hogy helyreállítsuk az adatait.
flow-recovery-key-hint-input-v2 =
    .label = Adjon meg egy tippet (nem kötelező)
flow-recovery-key-hint-cta-text = Befejezés
flow-recovery-key-hint-char-limit-error = A tippnek 255 karakternél rövidebbnek kell lennie.
flow-recovery-key-hint-unsafe-char-error = A tipp nem tartalmazhat nem biztonságos Unicode karaktereket. Csak betűk, számok, írásjelek és szimbólumok engedélyezettek.


password-reset-warning-icon = Figyelmeztetés
password-reset-chevron-expanded = Figyelmeztetés összecsukása
password-reset-chevron-collapsed = Figyelmeztetés kinyitása
password-reset-data-may-not-be-recovered = Előfordulhat, hogy a böngészési adatok nem állíthatók helyre
password-reset-previously-signed-in-device-2 = Van olyan eszköze, amelyre korábban bejelentkezett?
password-reset-data-may-be-saved-locally-2 = Előfordulhat, hogy a böngésző adatai vannak mentve azon az eszközön. Állítsa vissza a jelszavát, majd jelentkezzen be ott az adatai helyreállításához és szinkronizálásához.
password-reset-no-old-device-2 = Új eszköze van, de a korábbiakhoz már nem fér hozzá?
password-reset-encrypted-data-cannot-be-recovered-2 = Sajnáljuk, de a { -brand-firefox } kiszolgálókon lévő titkosított böngészőadatai nem állíthatók helyre.
password-reset-warning-have-key = Van fiók-helyreállítási kulcsa?
password-reset-warning-use-key-link = Használja most a jelszó helyreállításához és az adatok megtartásához


alert-bar-close-message = Üzenet bezárása


avatar-your-avatar =
    .alt = Saját profilkép
avatar-default-avatar =
    .alt = Alapértelmezett profilkép




bento-menu-title-3 = { -brand-mozilla } termékek
bento-menu-tagline = A { -brand-mozilla } további termékei, amelyek védik a magánszféráját
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } asztali böngésző
bento-menu-firefox-mobile = { -brand-firefox } mobilböngésző
bento-menu-made-by-mozilla = A { -brand-mozilla } készítette


connect-another-fx-mobile = Töltse le a { -brand-firefox }ot mobilra vagy táblagépre
connect-another-find-fx-mobile-2 = Keresse meg a { -brand-firefox(case: "accusative") } a { -google-play(case: "inessive") } és az { -app-store(case: "inessive") }.
connect-another-play-store-image-2 =
    .alt = A { -brand-firefox } letöltése a { -google-play(case: "elative") }
connect-another-app-store-image-3 =
    .alt = A { -brand-firefox } letöltése az { -app-store(case: "elative") }


cs-heading = Kapcsolódó szolgáltatások
cs-description = Minden, amit használ, és ahová bejelentkezett.
cs-cannot-refresh =
    Sajnos probléma merült fel a kapcsolódó szolgáltatások
    frissítésekor.
cs-cannot-disconnect = A kliens nem található, a leválasztás sikertelen
cs-logged-out-2 = Kijelentkezett innen: { $service }
cs-refresh-button =
    .title = Kapcsolódó szolgáltatások frissítése
cs-missing-device-help = Hiányzó vagy ismétlődő elemek?
cs-disconnect-sync-heading = Leválás a Syncről


cs-disconnect-sync-content-3 =
    Böngészési adatai megmaradnak a(z) <span>{ $device }</span> eszközön,
    de nem szinkronizálódnak a fiókjával.
cs-disconnect-sync-reason-3 = Mi a fő oka a(z) <span>{ $device }</span> eszköz leválasztásának?


cs-disconnect-sync-opt-prefix = Az eszköz:
cs-disconnect-sync-opt-suspicious = Gyanús
cs-disconnect-sync-opt-lost = Elvesztette vagy ellopták
cs-disconnect-sync-opt-old = Régi vagy lecserélte
cs-disconnect-sync-opt-duplicate = Másolat
cs-disconnect-sync-opt-not-say = Inkább nem mondja meg


cs-disconnect-advice-confirm = Rendben, értem
cs-disconnect-lost-advice-heading = Az elveszett vagy ellopott eszköz leválasztva
cs-disconnect-lost-advice-content-3 =
    Mivel az eszközét elvesztette vagy ellopták, ezért hogy biztonságban tartsa az információit, változtassa meg a { -product-mozilla-account }ja
    jelszavát a fiókbeállításokban. Érdemes megkeresni az eszköz gyártójának leírását az adatok távoli törléséről.
cs-disconnect-suspicious-advice-heading = Gyanús eszköz leválasztva
cs-disconnect-suspicious-advice-content-2 =
    Ha a leválasztott eszköz valóban gyanús, akkor hogy biztonságban tartsa az információt, változtassa meg a { -product-mozilla-account }ja
    jelszavát a fiókbeállításokban. Érdemes módosítania az összes, a { -brand-firefox(case: "inessive") } mentett jelszavát is, az about:logins beírásával a címsávba.
cs-sign-out-button = Kijelentkezés


dc-heading = Adatgyűjtés és -felhasználás
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } böngésző
dc-subheader-content-2 = Engedélyezés, hogy a { -product-mozilla-accounts } műszaki és interakciós adatokat küldjön a { -brand-mozilla(ending: "accented") }nak.
dc-subheader-ff-content = A { -brand-firefox } böngészője műszaki és interakciós adatai beállításainak áttekintéséhez vagy frissítéséhez nyissa meg a { -brand-firefox } beállításait, és navigáljon az Adatvédelem és biztonság oldalra.
dc-opt-out-success-2 = Sikeres leiratkozás. A { -product-mozilla-accounts } nem fog műszaki vagy interakciós adatokat küldeni a { -brand-mozilla(ending: "accented") }nak.
dc-opt-in-success-2 = Köszönjük! Ezen adatok megosztása segít nekünk a { -product-mozilla-accounts } fejlesztésében.
dc-opt-in-out-error-2 = Sajnos probléma merült fel az adatgyűjtési beállítás megváltoztatásakor
dc-learn-more = További tudnivalók


drop-down-menu-title-2 = { -product-mozilla-account } menü
drop-down-menu-signed-in-as-v2 = Bejelentkezve mint
drop-down-menu-sign-out = Kijelentkezés
drop-down-menu-sign-out-error-2 = Sajnos probléma merült fel a kijelentkezésekor


flow-container-back = Vissza


flow-recovery-key-confirm-pwd-heading-v2 = Biztonsági okokból adja meg újra a jelszavát
flow-recovery-key-confirm-pwd-input-label = Írja be a jelszavát
flow-recovery-key-confirm-pwd-submit-button = Fiók-helyreállítási kulcs létrehozása
flow-recovery-key-confirm-pwd-submit-button-change-key = Új fiók-helyreállítási kulcs létrehozása


flow-recovery-key-download-heading-v2 = Fiók-helyreállítási kulcs létrehozva – Töltse le és tárolja most
flow-recovery-key-download-info-v2 = Ez a kulcs lehetővé teszi az adatok helyreállítását, ha elfelejti a jelszavát. Töltse le most, és tárolja olyan helyen, amelyre emlékezni fog – később nem fog tudni visszatérni erre az oldalra.
flow-recovery-key-download-next-link-v2 = Folytatás letöltés nélkül


flow-recovery-key-success-alert = Fiók-helyreállítási kulcs létrehozva


flow-recovery-key-info-header = Hozzon létre egy fiók-helyreállítási kulcsot arra az esetre, ha elfelejtené a jelszavát
flow-recovery-key-info-header-change-key = A fiók-helyreállítási kulcs módosítása
flow-recovery-key-info-shield-bullet-point-v2 = Titkosítjuk a böngészési adatokat – a jelszavakat, könyvjelzőket és egyebeket. Nagyszerű az adatvédelem szempontjából, de elvesztheti az adatait, ha elfelejti a jelszavát.
flow-recovery-key-info-key-bullet-point-v2 = Ezért olyan fontos a fiók-helyreállítási kulcs létrehozása – felhasználhatja az adatai visszaszerzésére.
flow-recovery-key-info-cta-text-v3 = Kezdő lépések
flow-recovery-key-info-cancel-link = Mégse


flow-setup-2fa-qr-heading = Csatlakoztassa a hitelesítő alkalmazásához
flow-setup-2a-qr-instruction = <strong>1. lépés:</strong> Olvassa le ezt a QR-kódot bármely hitelesítő alkalmazással, például a Duo vagy a Google Hitelesítő segítségével.
flow-setup-2fa-qr-alt-text =
    .alt = QR-kód a kétlépcsős hitelesítés beállításához. Olvassa le, vagy válassza a „Nem tudja leolvasni a QR kódot?” lehetőséget. hogy helyette egy beállítási titkos kulcsot kapjon.
flow-setup-2fa-cant-scan-qr-button = Nem tudja leolvasni a QR-kódot?
flow-setup-2fa-manual-key-heading = Írja be a kódot kézzel
flow-setup-2fa-manual-key-instruction = <strong>1. lépés:</strong> Írja be ezt a kódot a kiválasztott hitelesítő alkalmazásban.
flow-setup-2fa-scan-qr-instead-button = Inkább leolvassa a QR-kódot?
flow-setup-2fa-more-info-link = Tudjon meg többet a hitelesítő alkalmazásokról
flow-setup-2fa-button = Folytatás
flow-setup-2fa-step-2-instruction = <strong>2. lépés:</strong> Adja meg a hitelesítő alkalmazásból származó kódot.
flow-setup-2fa-input-label = Adja meg a 6 számjegyű kódot
flow-setup-2fa-code-error = Érvénytelen vagy lejárt kód. Ellenőrizze a hitelesítő alkalmazást, és próbálja újra.


flow-setup-2fa-backup-choice-heading = Válasszon helyreállítási módot
flow-setup-2fa-backup-choice-description = Ez lehetővé teszi, hogy bejelentkezzen, ha nem tudja elérni mobileszközét vagy hitelesítő alkalmazását.
flow-setup-2fa-backup-choice-phone-title = Helyreállítási telefonszám
flow-setup-2fa-backup-choice-phone-badge = Legkönnyebb
flow-setup-2fa-backup-choice-phone-info = Kapjon helyreállítási kódot szöveges üzenetben. Jelenleg az Amerikai Egyesült Államokban és Kanadában érhető el.
flow-setup-2fa-backup-choice-code-title = Tartalék hitelesítési kódok
flow-setup-2fa-backup-choice-code-badge = Legbiztonságosabb
flow-setup-2fa-backup-choice-code-info = Egyszeri hitelesítési kódok létrehozása és mentése.
flow-setup-2fa-backup-choice-learn-more-link = Tudjon meg többet a helyreállításról és a SIM-csere kockázatáról


flow-setup-2fa-backup-code-confirm-heading = Adjon meg egy tartalék hitelesítési kódot
flow-setup-2fa-backup-code-confirm-confirm-saved = Egy kód beírásával erősítse meg, hogy elmentette a kódokat. Ezen kódok nélkül lehet, hogy nem fog tudni bejelentkezni, ha nem rendelkezik a hitelesítő alkalmazással.
flow-setup-2fa-backup-code-confirm-code-input = Adja meg a 10 karakteres kódot
flow-setup-2fa-backup-code-confirm-button-finish = Befejezés


flow-setup-2fa-backup-code-dl-heading = Tartalék hitelesítési kódok mentése
flow-setup-2fa-backup-code-dl-save-these-codes = Tartsa ezeket egy olyan helyen, amelyre emlékezni fog. Ha nincs hozzáférése a hitelesítő alkalmazáshoz, akkor meg kell adnia egyet a bejelentkezéshez.
flow-setup-2fa-backup-code-dl-button-continue = Folytatás


flow-setup-2fa-inline-complete-success-banner = Kétlépcsős hitelesítés engedélyezve
flow-setup-2fa-inline-complete-success-banner-description = A csatlakoztatott eszközeinek védelme érdekében ki kell jelentkeznie mindenhol, ahol ezt a fiókot használja, majd jelentkezzen be újra az új kétlépcsős hitelesítésével.
flow-setup-2fa-inline-complete-backup-code = Tartalék hitelesítési kódok
flow-setup-2fa-inline-complete-backup-phone = Helyreállítási telefonszám
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } kód maradt
       *[other] { $count } kód maradt
    }
flow-setup-2fa-inline-complete-backup-code-description = Ez a legbiztonságosabb helyreállítási módszer, ha nem tud bejelentkezni mobileszközével vagy hitelesítő alkalmazással.
flow-setup-2fa-inline-complete-backup-phone-description = Ez a legegyszerűbb helyreállítási módszer, ha nem tud bejelentkezni a hitelesítő alkalmazással.
flow-setup-2fa-inline-complete-learn-more-link = Hogyan védi ez a fiókját
flow-setup-2fa-inline-complete-continue-button = Tovább erre: { $serviceName }
flow-setup-2fa-prompt-heading = Állítsa be a kétlépcsős hitelesítést
flow-setup-2fa-prompt-description = A(z) { $serviceName } szolgáltatáshoz be kell állítania a kétlépcsős hitelesítést, hogy biztonságban tartsa a fiókját.
flow-setup-2fa-prompt-use-authenticator-apps = A folytatáshoz <authenticationAppsLink>ezen hitelesítő alkalmazások</authenticationAppsLink> bármelyikét használhatja.
flow-setup-2fa-prompt-continue-button = Folytatás


flow-setup-phone-confirm-code-heading = Adja meg az ellenőrzőkódot
flow-setup-phone-confirm-code-instruction = SMS-ben egy hatjegyű kód lett küldve a <span>{ $phoneNumber }</span> telefonszámra. Ez a kód 5 perc után lejár.
flow-setup-phone-confirm-code-input-label = Adja meg a 6 számjegyű kódot
flow-setup-phone-confirm-code-button = Megerősítés
flow-setup-phone-confirm-code-expired = A kód lejárt?
flow-setup-phone-confirm-code-resend-code-button = Kód újraküldése
flow-setup-phone-confirm-code-resend-code-success = Kód elküldve
flow-setup-phone-confirm-code-success-message-v2 = Helyreállítási telefonszám hozzáadva
flow-change-phone-confirm-code-success-message = A helyreállítási telefonszám megváltozott


flow-setup-phone-submit-number-heading = Ellenőrizze a telefonszámát
flow-setup-phone-verify-number-instruction = Kapni fog egy SMS-t a { -brand-mozilla(ending: "accented") }tól, amely egy kódot tartalmaz a száma ellenőrzéséhez. Ne ossza meg ezt a kódot másokkal.
flow-setup-phone-submit-number-info-message-v2 = A helyreállítási telefonszám csak az Egyesült Államokban és Kanadában érhető el. A VoIP számok és a telefonmaszkok nem ajánlottak.
flow-setup-phone-submit-number-legal = A telefonszám megadásával beleegyezik, hogy tároljuk, de csak fiók-ellenőrzési SMS-eket küldhetünk. Üzenet- és adatforgalmi költségek merülhetnek fel.
flow-setup-phone-submit-number-button = Kód küldése


header-menu-open = Menü bezárása
header-menu-closed = Webhely navigációs menü
header-back-to-top-link =
    .title = Vissza a tetejére
header-back-to-settings-link =
    .title = Vissza a(z) { -product-mozilla-account } beállításaihoz
header-title-2 = { -product-mozilla-account }
header-help = Súgó


la-heading = Összekapcsolt fiókok
la-description = A következő fiókokhoz való hozzáférést engedélyezte.
la-unlink-button = Leválasztás
la-unlink-account-button = Leválasztás
la-set-password-button = Jelszó beállítása
la-unlink-heading = Leválasztás egy harmadik féltől származó fiókról
la-unlink-content-3 = Biztos, hogy leválasztja a fiókját? A fiók leválasztásával nem jelentkezik ki automatikusan a kapcsolódó szolgáltatásokból. Ehhez kézileg kell kijelentkeznie a Kapcsolódó szolgáltatások szakaszban.
la-unlink-content-4 = A fiók leválasztása előtt meg kell adnia egy jelszót. Jelszó nélkül a fiók leválasztása után nincs lehetősége bejelentkezni.
nav-linked-accounts = { la-heading }


modal-close-title = Bezárás
modal-cancel-button = Mégse
modal-default-confirm-button = Megerősítés


modal-mfa-protected-title = Adja meg a megerősítő kódot
modal-mfa-protected-subtitle = Segítsen nekünk megbizonyosodni arról, hogy megváltoztattuk-e a fiókadatait
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Adja meg a(z) <email>{ $email }</email> címre küldött kódot { $expirationTime } percen belül.
       *[other] Adja meg a(z) <email>{ $email }</email> címre küldött kódot { $expirationTime } percen belül.
    }
modal-mfa-protected-input-label = Adja meg a 6 számjegyű kódot
modal-mfa-protected-cancel-button = Mégse
modal-mfa-protected-confirm-button = Megerősítés
modal-mfa-protected-code-expired = A kód lejárt?
modal-mfa-protected-resend-code-link = Új kód elküldése e-mailben.


mvs-verify-your-email-2 = Erősítse meg az e-mail-címét
mvs-enter-verification-code-2 = Adja meg a megerősítő kódját
mvs-enter-verification-code-desc-2 = Adja meg 5 percen belül a(z) <email>{ $email }</email> címre küldött megerősítő kódot.
msv-cancel-button = Mégse
msv-submit-button-2 = Megerősítés


nav-settings = Beállítások
nav-profile = Profil
nav-security = Biztonság
nav-connected-services = Kapcsolódó szolgáltatások
nav-data-collection = Adatgyűjtés és -felhasználás
nav-paid-subs = Előfizetések
nav-email-comm = E-mail kommunikáció


page-2fa-change-title = Kétlépcsős hitelesítés módosítása
page-2fa-change-success = A kétlépcsős hitelesítés frissítve lett
page-2fa-change-success-additional-message = A csatlakoztatott eszközeinek védelme érdekében ki kell jelentkeznie mindenhol, ahol ezt a fiókot használja, majd jelentkezzen be újra az új kétlépcsős hitelesítésével.
page-2fa-change-totpinfo-error = Hiba történt a kétlépcsős hitelesítő alkalmazás cseréjekor. Próbálja újra később.
page-2fa-change-qr-instruction = <strong>1. lépés:</strong> Olvassa le ezt a QR-kódot bármely hitelesítő alkalmazással, például a Duo vagy a Google Hitelesítő segítségével. Ez egy új kapcsolatot hoz létre, a régi kapcsolatok nem fognak működni.


tfa-backup-codes-page-title = Tartalék hitelesítési kódok
tfa-replace-code-error-3 = Hiba történt a tartalék hitelesítési kódok cseréje során
tfa-create-code-error = Hiba történt a tartalék hitelesítési kódok létrehozásakor
tfa-replace-code-success-alert-4 = A tartalék hitelesítési kódok frissítve
tfa-create-code-success-alert = Tartalék hitelesítési kódok létrehozva
tfa-replace-code-download-description = Tartsa ezeket egy olyan helyen, amelyre emlékezni fog. A régi kódok le lesznek cserélve a következő lépés befejezése után.
tfa-replace-code-confirm-description = Erősítse meg a kódok elmentését az egyik beírásával. A lépés befejeztével a régi tartalék hitelesítési kódok le lesznek tiltva.
tfa-incorrect-recovery-code-1 = Érvénytelen tartalék hitelesítési kód


page-2fa-setup-title = Kétlépcsős hitelesítés
page-2fa-setup-totpinfo-error = Hiba történt a kétlépcsős hitelesítés beállításakor. Próbálja újra később.
page-2fa-setup-incorrect-backup-code-error = Ez a kód nem helyes. Próbálja újra.
page-2fa-setup-success = A kétlépcsős hitelesítés engedélyezve lett
page-2fa-setup-success-additional-message = Az összes csatlakoztatott eszközének védelme érdekében ki kell jelentkeznie mindenhol, ahol ezt a fiókot használja, majd jelentkezzen be újra a kétlépcsős hitelesítéssel.


avatar-page-title =
    .title = Profilkép
avatar-page-add-photo = Fénykép hozzáadása
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fénykép készítése
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Fénykép eltávolítása
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Fénykép újbóli elkészítése
avatar-page-cancel-button = Mégse
avatar-page-save-button = Mentés
avatar-page-saving-button = Mentés…
avatar-page-zoom-out-button =
    .title = Kicsinyítés
avatar-page-zoom-in-button =
    .title = Nagyítás
avatar-page-rotate-button =
    .title = Forgatás
avatar-page-camera-error = A kamera nem készíthető elő
avatar-page-new-avatar =
    .alt = új profilkép
avatar-page-file-upload-error-3 = Hiba történt a profilkép feltöltésekor
avatar-page-delete-error-3 = Hiba történt a profilkép törlésekor
avatar-page-image-too-large-error-2 = A képfájl mérete túl nagy a feltöltéshez


pw-change-header =
    .title = Jelszó módosítása
pw-8-chars = Legalább 8 karakter
pw-not-email = Nem az Ön e-mail-címe
pw-change-must-match = Az új jelszó megegyezik a megerősítő szöveggel
pw-commonly-used = Nem gyakran használt jelszó
pw-tips = Maradjon biztonságban – ne használja újra a jelszavakat. Nézzen meg további tippeket az <linkExternal>erős jelszavak létrehozásához</linkExternal>.
pw-change-cancel-button = Mégse
pw-change-save-button = Mentés
pw-change-forgot-password-link = Elfelejtette a jelszót?
pw-change-current-password =
    .label = Írja be a jelenlegi jelszavát
pw-change-new-password =
    .label = Írja be az új jelszót
pw-change-confirm-password =
    .label = Erősítse meg az új jelszót
pw-change-success-alert-2 = Jelszó frissítve


pw-create-header =
    .title = Jelszó létrehozása
pw-create-success-alert-2 = Jelszó megadva
pw-create-error-2 = Sajnos probléma merült fel a jelszó megadásakor


delete-account-header =
    .title = Fiók törlése
delete-account-step-1-2 = 1. / 2. lépés
delete-account-step-2-2 = 2. / 2. lépés
delete-account-confirm-title-4 = Előfordulhat, hogy a { -product-mozilla-account }ját a következő { -brand-mozilla } termékekhez vagy szolgáltatásokhoz kapcsolta, amelyek segítségével biztonságban lehet és hatékonyabb lehet az interneten:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = A { -brand-firefox } adatainak szinkronizálása
delete-account-product-firefox-addons = { -brand-firefox } Kiegészítők
delete-account-acknowledge = Erősítse meg ezt a fiókja a törlésével:
delete-account-chk-box-1-v4 =
    .label = Az összes előfizetése lemondásra kerül
delete-account-chk-box-2 =
    .label = Elveszítheti a { -brand-mozilla } termékekben elmentett információkat és szolgáltatásokat
delete-account-chk-box-3 =
    .label = Az ezzel az e-mail címmel történő újraaktiválás nem biztos, hogy visszaállítja a mentett információit
delete-account-chk-box-4 =
    .label = Az addons.mozilla.org-on közzétett kiegészítők és témák törölve lesznek
delete-account-continue-button = Folytatás
delete-account-password-input =
    .label = Adja meg a jelszót
delete-account-cancel-button = Mégse
delete-account-delete-button-2 = Törlés


display-name-page-title =
    .title = Megjelenő név
display-name-input =
    .label = Írja be a megjelenő nevet
submit-display-name = Mentés
cancel-display-name = Mégse
display-name-update-error-2 = Hiba történt a megjelenő név frissítésekor
display-name-success-alert-2 = A megjelenő név frissítve


recent-activity-title = Legutóbbi fióktevékenység
recent-activity-account-create-v2 = Fiók létrehozva
recent-activity-account-disable-v2 = Fiók letiltva
recent-activity-account-enable-v2 = Fiók engedélyezve
recent-activity-account-login-v2 = Fiókbejelentkezés kezdeményezve
recent-activity-account-reset-v2 = Jelszó-visszaállítás kezdeményezve
recent-activity-emails-clearBounces-v2 = Az e-mail visszapattanások törölve
recent-activity-account-login-failure = A fiók bejelentkezési kísérlete sikertelen
recent-activity-account-two-factor-added = Kétlépcsős hitelesítés engedélyezve
recent-activity-account-two-factor-requested = Kétlépcsős hitelesítés kérve
recent-activity-account-two-factor-failure = Kétlépcsős hitelesítés sikertelen
recent-activity-account-two-factor-success = Kétlépcsős hitelesítés sikeres
recent-activity-account-two-factor-removed = Kétlépcsős hitelesítés eltávolítva
recent-activity-account-password-reset-requested = A fiók jelszó-visszaállítást kért
recent-activity-account-password-reset-success = A fiókjelszó visszaállítása sikeres
recent-activity-account-recovery-key-added = Fiók-helyreállítási kulcs engedélyezve
recent-activity-account-recovery-key-verification-failure = A fiók-helyreállítási kulcs ellenőrzése sikertelen
recent-activity-account-recovery-key-verification-success = A fiók-helyreállítási kulcs ellenőrzése sikeres
recent-activity-account-recovery-key-removed = Fiók-helyreállítási kulcs eltávolítva
recent-activity-account-password-added = Új jelszó hozzáadva
recent-activity-account-password-changed = A jelszó megváltozott
recent-activity-account-secondary-email-added = Másodlagos e-mail-cím hozzáadva
recent-activity-account-secondary-email-removed = Másodlagos e-mail-cím eltávolítva
recent-activity-account-emails-swapped = Elsődleges és másodlagos e-mail címek felcserélve
recent-activity-session-destroy = Kijelentkezett a munkamenetből
recent-activity-account-recovery-phone-send-code = Helyreállítási telefonszám elküldve
recent-activity-account-recovery-phone-setup-complete = Helyreállítási telefonszám beállítása befejezve
recent-activity-account-recovery-phone-signin-complete = Bejelentkezés a helyreállítási telefonszámmal befejezve
recent-activity-account-recovery-phone-signin-failed = Nem sikerült bejelentkezni a helyreállítási telefonszámmal
recent-activity-account-recovery-phone-removed = Helyreállítási telefonszám eltávolítva
recent-activity-account-recovery-codes-replaced = Helyreállítási kódok lecserélve
recent-activity-account-recovery-codes-created = Helyreállítási kódok létrehozva
recent-activity-account-recovery-codes-signin-complete = Bejelentkezés a helyreállítási kódokkal befejezve
recent-activity-password-reset-otp-sent = Jelszó-visszaállítási megerősítő kód elküldve
recent-activity-password-reset-otp-verified = Jelszó-visszaállítási megerősítő kód ellenőrizve
recent-activity-must-reset-password = Jelszó-visszaállítás szükséges
recent-activity-unknown = Egyéb fióktevékenység


recovery-key-create-page-title = Fiók-helyreállítási kulcs
recovery-key-create-back-button-title = Vissza a beállításokhoz


recovery-phone-remove-header = Helyreállítási telefonszám eltávolítása
settings-recovery-phone-remove-info = Ez eltávolítja a(z) <strong>{ $formattedFullPhoneNumber }</strong> telefonszámot helyreállítási telefonszámként.
settings-recovery-phone-remove-recommend = Javasoljuk, hogy tartsa meg ezt a módszert, mert könnyebb, mint a tartalék hitelesítési kódok elmentése.
settings-recovery-phone-remove-recovery-methods = Ha törli, győződjön meg róla, hogy megvannak-e még az elmentett tartalék hitelesítési kódjai. <linkExternal>Helyreállítási módszerek összehasonlítása</linkExternal>
settings-recovery-phone-remove-button = Telefonszám eltávolítása
settings-recovery-phone-remove-cancel = Mégse
settings-recovery-phone-remove-success = Helyreállítási telefonszám eltávolítva


page-setup-recovery-phone-heading = Helyreállítási telefonszám hozzáadása
page-change-recovery-phone = Helyreállítási telefonszám módosítása
page-setup-recovery-phone-back-button-title = Vissza a beállításokhoz
page-setup-recovery-phone-step2-back-button-title = Telefonszám módosítása


add-secondary-email-step-1 = 1. / 2. lépés
add-secondary-email-error-2 = Hiba történt az e-mail létrehozásakor
add-secondary-email-page-title =
    .title = Másodlagos e-mail
add-secondary-email-enter-address =
    .label = Adja meg az e-mail-címet
add-secondary-email-cancel-button = Mégse
add-secondary-email-save-button = Mentés
add-secondary-email-mask = Az e-mail-maszkok nem használhatók másodlagos e-mail-címként


add-secondary-email-step-2 = 2. / 2. lépés
verify-secondary-email-page-title =
    .title = Másodlagos e-mail
verify-secondary-email-verification-code-2 =
    .label = Adja meg a megerősítő kódját
verify-secondary-email-cancel-button = Mégse
verify-secondary-email-verify-button-2 = Megerősítés
verify-secondary-email-please-enter-code-2 = Adja meg 5 percen belül a(z) <strong>{ $email }</strong> címre küldött megerősítő kódot.
verify-secondary-email-success-alert-2 = A(z) { $email } sikeresen hozzáadva
verify-secondary-email-resend-code-button = Megerősítő kód újraküldése


delete-account-link = Fiók törlése
inactive-update-status-success-alert = Sikeresen bejelentkezett. A { -product-mozilla-account }ja és adatai aktívak maradnak.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Találja meg, hol kerülnek ki a személyes adatai, és vegye kezébe az irányítást
product-promo-monitor-cta = Ingyenes vizsgálat kérése


profile-heading = Profil
profile-picture =
    .header = Kép
profile-display-name =
    .header = Megjelenő név
profile-primary-email =
    .header = Elsődleges e-mail


progress-bar-aria-label-v2 = { $currentStep }. / { $numberOfSteps } lépés.


security-heading = Biztonság
security-password =
    .header = Jelszó
security-password-created-date = Létrehozva: { $date }
security-not-set = Nincs beállítva
security-action-create = Létrehozás
security-set-password = Állítson be jelszót a szinkronizáláshoz és bizonyos fiókbiztonsági funkciók használatához.
security-recent-activity-link = Legutóbbi fióktevékenységek megtekintése
signout-sync-header = A munkamenet lejárt
signout-sync-session-expired = Elnézést, hiba történt. Jelentkezzen ki a böngésző menüjéből, és próbálja újra.


tfa-row-backup-codes-title = Tartalék hitelesítési kódok
tfa-row-backup-codes-not-available = Nem érhetők el kódok
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } kód maradt
       *[other] { $numCodesAvailable } kód maradt
    }
tfa-row-backup-codes-get-new-cta-v2 = Új kódok létrehozása
tfa-row-backup-codes-add-cta = Hozzáadás
tfa-row-backup-codes-description-2 = Ez a legbiztonságosabb helyreállítási módszer, ha nem tudja használni a mobileszközét vagy a hitelesítő alkalmazást.
tfa-row-backup-phone-title-v2 = Helyreállítási telefonszám
tfa-row-backup-phone-not-available-v2 = Nincs telefonszám hozzáadva
tfa-row-backup-phone-change-cta = Módosítás
tfa-row-backup-phone-add-cta = Hozzáadás
tfa-row-backup-phone-delete-button = Eltávolítás
tfa-row-backup-phone-delete-title-v2 = Helyreállítási telefonszám eltávolítása
tfa-row-backup-phone-delete-restriction-v2 = Ha el akarja távolítani a helyreállítási telefonszámát, adjon hozzá tartalék hitelesítési kódokat vagy először kapcsolja ki a kétlépcsős hitelesítést, hogy elkerülje azt, hogy kizárja magát a fiókjából.
tfa-row-backup-phone-description-v2 = Ez a legkönnyebb helyreállítási módszer, ha nem tudja használni a hitelesítő alkalmazást.
tfa-row-backup-phone-sim-swap-risk-link = Tudjon meg többet a SIM-csere kockázatáról
passkey-sub-row-created-date = Létrehozva: { $createdDate }
passkey-sub-row-last-used-date = Utoljára használva: { $lastUsedDate }
passkey-sub-row-sign-in-only = Csak bejelentkezés. Nem használható szinkronizáláshoz.
passkey-sub-row-delete-title = Jelkulcs törlése
passkey-delete-modal-heading = Törli a jelkulcsot?
passkey-delete-modal-content = Ez a jelkulcs el lesz távolítva a fiókjából. Másik módszerrel kell bejelentkeznie.
passkey-delete-modal-cancel-button = Mégse
passkey-delete-modal-confirm-button = Jelkulcs törlése
passkey-delete-success = Jelkulcs törölve
passkey-delete-error = Hiba történt a jelkulcs törlésekor. Próbálja újra néhány perc múlva.


switch-turn-off = Kikapcsolás
switch-turn-on = Bekapcsolás
switch-submitting = Beküldés…
switch-is-on = be
switch-is-off = ki


row-defaults-action-add = Hozzáadás
row-defaults-action-change = Módosítás
row-defaults-action-disable = Letiltás
row-defaults-status = Nincs


passkey-row-header = Jelkulcsok
passkey-row-enabled = Engedélyezve
passkey-row-not-set = Nincs beállítva
passkey-row-action-create = Létrehozás
passkey-row-description = Tegye könnyebbé és biztonságosabbá a bejelentkezést a telefonjával vagy más támogatott eszközével, hogy belépjen a fiókjába.
passkey-row-info-link = Hogyan védi ez a fiókját


rk-header-1 = Fiók-helyreállítási kulcs
rk-enabled = Engedélyezve
rk-not-set = Nincs beállítva
rk-action-create = Létrehozás
rk-action-change-button = Módosítás
rk-action-remove = Eltávolítás
rk-key-removed-2 = Fiók-helyreállítási kulcs eltávolítva
rk-cannot-remove-key = A fiók-helyreállítási kulcsot nem sikerült eltávolítani.
rk-refresh-key-1 = Fiók-helyreállítási kulcs frissítése
rk-content-explain = Állítsa vissza adatait, ha elfelejtette jelszavát.
rk-cannot-verify-session-4 = Sajnos probléma merült fel a munkamenet megerősítésekor
rk-remove-modal-heading-1 = Eltávolítja a fiók-helyreállítási kulcsot?
rk-remove-modal-content-1 =
    Ha visszaállítja jelszavát, akkor nem fogja tudni használni
    a fiók-helyreállítási kulcsot az adatai eléréséhez. Ezt a műveletet nem lehet visszavonni.
rk-remove-error-2 = A fiók-helyreállítási kulcsot nem sikerült eltávolítani
unit-row-recovery-key-delete-icon-button-title = Fiók-helyreállítási kulcs törlése


se-heading = Másodlagos e-mail
    .header = Másodlagos e-mail
se-cannot-refresh-email = Sajnos probléma merült fel az e-mail frissítésekor.
se-cannot-resend-code-3 = Sajnos probléma merült fel a megerősítő kód újraküldésekor
se-set-primary-successful-2 = A(z) { $email } az elsődleges e-mail-címe
se-set-primary-error-2 = Sajnos probléma merült fel az elsődleges e-mail-cím megváltoztatásakor
se-delete-email-successful-2 = A(z) { $email } sikeresen törölve
se-delete-email-error-2 = Sajnos probléma merült fel az e-mail-cím törlésekor
se-verify-session-3 = A művelet végrehajtásához meg kell erősítenie a jelenlegi munkamenetet
se-verify-session-error-3 = Sajnos probléma merült fel a munkamenet megerősítésekor
se-remove-email =
    .title = E-mail-cím eltávolítása
se-refresh-email =
    .title = E-mail-cím frissítése
se-unverified-2 = nem megerősített
se-resend-code-2 =
    Megerősítés szükséges. <button>Küldje újra a megerősítő kódot</button>,
    ha nincs a beérkezett levelek vagy a levélszemét mappában.
se-make-primary = Elsődlegessé tétel
se-default-content = Érje el a fiókját, ha nem tud bejelentkezni az elsődleges e-mail-fiókjába.
se-content-note-1 =
    Megjegyzés: a másodlagos e-mail-címe nem fogja visszaállítani az
    adatait – ahhoz <a>fiók-helyreállítási kulcs</a> szükséges.
se-secondary-email-none = Nincs


tfa-row-header = Kétlépcsős hitelesítés
tfa-row-enabled = Engedélyezve
tfa-row-disabled-status = Letiltva
tfa-row-action-add = Hozzáadás
tfa-row-action-disable = Letiltás
tfa-row-action-change = Módosítás
tfa-row-button-refresh =
    .title = Kétlépcsős hitelesítés frissítése
tfa-row-cannot-refresh =
    Sajnos probléma merült fel a kétlépéses hitelesítés
    frissítésekor.
tfa-row-enabled-description = Fiókját kétlépcsős hitelesítés védi. Meg kell adnia egy egyszer használatos jelkódot a hitelesítő alkalmazásból, amikor bejelentkezik a { -product-mozilla-account }jába.
tfa-row-enabled-info-link = Hogyan védi ez a fiókját
tfa-row-disabled-description-v2 = Segítsen biztonságban tartani fiókját azzal, hogy a bejelentkezés második lépéseként egy harmadik féltől származó hitelesítő alkalmazást használ.
tfa-row-cannot-verify-session-4 = Sajnos probléma merült fel a munkamenet megerősítésekor
tfa-row-disable-modal-heading = Letiltja a kétlépcsős hitelesítést?
tfa-row-disable-modal-confirm = Letiltás
tfa-row-disable-modal-explain-1 =
    Ezt a műveletet nem fogja tudni visszavonni. Arra is van
    lehetősége, hogy <linkExternal>lecserélje a tartalék hitelesítési kódjait</linkExternal>.
tfa-row-disabled-2 = Kétlépcsős hitelesítés letiltva
tfa-row-cannot-disable-2 = A kétlépcsős hitelesítést nem lehetett letiltani
tfa-row-verify-session-info = A kétlépcsős hitelesítés beállításához meg kell erősítenie a jelenlegi munkamenetet


terms-privacy-agreement-intro-3 = A továbblépéssel elfogadja a következőket:
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>Szolgáltatási feltételek</termsLink> és <privacyLink>Adatvédelmi nyilatkozat</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts }: <mozillaAccountsTos>Szolgáltatási feltételek</mozillaAccountsTos> és<mozillaAccountsPrivacy>Adatvédelmi nyilatkozat</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = A folytatással elfogadja a <mozillaAccountsTos>Szolgáltatási feltételeket</mozillaAccountsTos> és az <mozillaAccountsPrivacy>Adatvédelmi nyilatkozatot</mozillaAccountsPrivacy>.


third-party-auth-options-or = Vagy
third-party-auth-options-sign-in-with = Bejelentkezés ezzel:
continue-with-google-button = Folytatás a { -brand-google }-lel
continue-with-apple-button = Folytatás az { -brand-apple }-lel


auth-error-102 = Ismeretlen fiók
auth-error-103 = Helytelen jelszó
auth-error-105-2 = Érvénytelen megerősítő kód!
auth-error-110 = Érvénytelen token
auth-error-114-generic = Túl sokszor próbálkozott. Próbálja újra később.
auth-error-114 = Túl sokszor próbálkozott. Próbálja újra { $retryAfter }.
auth-error-125 = A kérés biztonsági okokból blokkolva lett
auth-error-129-2 = Érvénytelen telefonszámot adott meg. Ellenőrizze, és próbálja újra.
auth-error-138-2 = Meg nem erősített munkamenet
auth-error-139 = A másodlagos e-mail-címnek különböznie kell a fiók e-mail-címétől
auth-error-144 = Ezt az e-mail-címet egy másik fiók foglalta le. Próbálja újra később, vagy adjon meg egy másik e-mail-címet.
auth-error-155 = A TOTP token nem található
auth-error-156 = Nem található tartalék hitelesítési kód
auth-error-159 = Érvénytelen fiók-helyreállítási kulcs
auth-error-183-2 = Érvénytelen vagy lejárt megerősítő kód
auth-error-202 = A funkció nem engedélyezett
auth-error-203 = A rendszer nem érhető el, próbálja újra később
auth-error-206 = Nem hozható létre jelszó, mert már be van állítva egy
auth-error-214 = A helyreállítási telefonszám már létezik
auth-error-215 = A helyreállítási telefonszám nem létezik
auth-error-216 = Az SMS-ek korlátja elérve
auth-error-218 = Nem távolítható el a helyreállítási telefonszám, hiányoznak a tartalék hitelesítési kódok.
auth-error-219 = Ez a telefonszám túl sok fiókkal lett regisztrálva. Próbálkozzon egy másik számmal.
auth-error-999 = Nem várt hiba
auth-error-1001 = Bejelentkezési kísérlet megszakítva
auth-error-1002 = A munkamenet lejárt. Jelentkezzen be a folytatáshoz.
auth-error-1003 = A helyi tároló vagy a sütik továbbra is le vannak tiltva
auth-error-1008 = Az új jelszónak különbözőnek kell lennie
auth-error-1010 = Érvényes jelszó szükséges
auth-error-1011 = Érvényes e-mail-cím szükséges
auth-error-1018 = A megerősítő e-mail visszapattant. Talán elgépelte az e-mail-címét?
auth-error-1020 = Elírta az e-mail-címet? A firefox.com nem érvényes levelezőszolgáltatás.
auth-error-1031 = A regisztrációhoz meg kell adnia az életkorát
auth-error-1032 = A regisztrációhoz érvényes életkort kell megadnia
auth-error-1054 = Érvénytelen kétlépcsős hitelesítési kód
auth-error-1056 = Érvénytelen tartalék hitelesítési kód
auth-error-1062 = Érvénytelen átirányítás
auth-error-1064 = Elírta az e-mail-címet? A(z) { $domain } nem érvényes levelezőszolgáltatás.
auth-error-1066 = Az e-mail-maszkok nem használhatók fiók létrehozásához.
auth-error-1067 = Elírta az e-mail-címet?
recovery-phone-number-ending-digits = { $lastFourPhoneNumber } végű szám
oauth-error-1000 = Hiba történt. Zárja be ezt a lapot, és próbálja újra.


connect-another-device-signed-in-header = Bejelentkezett a { -brand-firefox(case: "illative") }
connect-another-device-email-confirmed-banner = E-mail-cím megerősítve
connect-another-device-signin-confirmed-banner = Bejelentkezés megerősítve
connect-another-device-signin-to-complete-message = Jelentkezzen be ebbe a { -brand-firefox(case: "illative") } a beállítás befejezéséhez
connect-another-device-signin-link = Bejelentkezés
connect-another-device-still-adding-devices-message = Még ad hozzá eszközöket? Jelentkezzen be a { -brand-firefox(case: "illative") } egy másik eszközről a beállítás befejezéséhez
connect-another-device-signin-another-device-to-complete-message = Jelentkezzen be a { -brand-firefox(case: "illative") } egy másik eszközről a beállítás befejezéséhez
connect-another-device-get-data-on-another-device-message = Szeretné átvinni lapjait, könyvjelzőit és jelszavait egy másik eszközre?
connect-another-device-cad-link = Másik eszköz csatlakoztatása
connect-another-device-not-now-link = Most nem
connect-another-device-android-complete-setup-message = Jelentkezzen be a { -brand-firefox } for Androidba a beállítás befejezéséhez
connect-another-device-ios-complete-setup-message = Jelentkezzen be a { -brand-firefox } for iOS-be a beállítás befejezéséhez


cookies-disabled-header = Helyi tároló és sütik szükségesek
cookies-disabled-enable-prompt-2 = Kérjük, engedélyezze a sütiket és a helyi tárolást a böngészőjében, hogy elérje a { -product-mozilla-account }ját. Ezzel lehetővé válik olyan funkciók, mint az adatok megjegyzése a munkamenetek között.
cookies-disabled-button-try-again = Próbálja újra
cookies-disabled-learn-more = További tudnivalók


index-header = Adja meg az e-mail-címét
index-sync-header = Tovább a { -product-mozilla-account }jához
index-sync-subheader = Szinkronizálja jelszavait, lapjait és könyvjelzőit mindenütt, ahol { -brand-firefox(case: "accusative") } használ.
index-relay-header = Hozzon létre egy e-mail-maszkot
index-relay-subheader = Adja meg azt az e-mail-címet, ahová a maszkolt e-mail-címből érkező leveleket továbbítani szeretné.
index-subheader-with-servicename = Tovább erre: { $serviceName }
index-subheader-default = Folytatás a fiókbeállításokhoz
index-cta = Regisztráljon vagy jelentkezzen be
index-account-info = Egy { -product-mozilla-account } a { -brand-mozilla } további adatvédelmi termékeihez is hozzáférést biztosít.
index-email-input =
    .label = Adja meg az e-mail-címét
index-account-delete-success = Fiók sikeresen törölve
index-email-bounced = A megerősítő e-mail visszapattant. Talán elgépelte az e-mail-címét?


inline-recovery-key-setup-create-error = Hoppá! Nem tudtuk létrehozni a fiók-helyreállítási kulcsát. Próbálja újra később.
inline-recovery-key-setup-recovery-created = Fiók-helyreállítási kulcs létrehozva
inline-recovery-key-setup-download-header = Biztosítsa fiókját
inline-recovery-key-setup-download-subheader = Töltse le és tegye el most
inline-recovery-key-setup-download-info = Tárolja Olyan helyen ezt a kulcsot, amelyre emlékezni fog – később nem fog tudni visszatérni erre az oldalra.
inline-recovery-key-setup-hint-header = Biztonsági javaslat


inline-totp-setup-cancel-setup-button = Beállítás megszakítása
inline-totp-setup-continue-button = Folytatás
inline-totp-setup-add-security-link = Adjon egy biztonsági réteget a fiókjához az <authenticationAppsLink>ezen hitelesítő alkalmazások</authenticationAppsLink> egyikéből származó hitelesítési kódok megkövetelésével.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Engedélyezze a kétlépcsős hitelesítést, <span>a fiókbeállításokhoz való továbblépéshez</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Engedélyezze a kétlépcsős hitelesítést <span>a következőhöz való továbblépéshez: { $serviceName }</span>
inline-totp-setup-ready-button = Kész
inline-totp-setup-show-qr-custom-service-header-2 = Olvassa le a hitelesítési kódot <span>a következőhöz való továbblépéshez: { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Adja meg kézileg a kódot <span>a következőhöz való továbblépéshez: { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Olvassa le a hitelesítési kódot <span>a fiókbeállításokhoz való továbblépéshez</span>
inline-totp-setup-no-qr-default-service-header-2 = Adja meg kézileg a kódot <span>a fiókbeállításokhoz való továbblépéshez</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Írja be ezt a titkos kulcsot a hitelesítő alkalmazásba. <toggleToQRButton>Inkább beolvassa a QR-kódot?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Olvassa be a QR-kódot a hitelesítő alkalmazásában, és adja meg az általa biztosított hitelesítési kódot. <toggleToManualModeButton>Nem tudja leolvasni a kódot?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Ha kész, megkezdi az Ön hitelesítési kódjainak előállítását.
inline-totp-setup-security-code-placeholder = Hitelesítési kód
inline-totp-setup-code-required-error = Hitelesítési kód szükséges
tfa-qr-code-alt = Használja a(z) { $code } kódot a kétlépcsős hitelesítés beállításához a támogatott alkalmazásokban.
inline-totp-setup-page-title = Kétlépcsős hitelesítés


legal-header = Jogi információk
legal-terms-of-service-link = Szolgáltatási feltételek
legal-privacy-link = Adatvédelmi nyilatkozat


legal-privacy-heading = Adatvédelmi nyilatkozat


legal-terms-heading = Szolgáltatási feltételek


pair-auth-allow-heading-text = Most jelentkezett be a { -product-firefox }ba?
pair-auth-allow-confirm-button = Igen, jóváhagyom az eszközt
pair-auth-allow-refuse-device-link = Ha nem Ön volt az, <link>változtassa meg jelszavát</link>


pair-auth-complete-heading = Eszköz csatlakoztatva
pair-auth-complete-now-syncing-device-text = Most már szinkronizál a következővel: { $deviceFamily } a következőn: { $deviceOS }
pair-auth-complete-sync-benefits-text = Mostantól az összes eszközén elérheti nyitott lapjait, jelszavait és könyvjelzőit.
pair-auth-complete-see-tabs-button = Lapok megtekintése más szinkronizált eszközökről
pair-auth-complete-manage-devices-link = Eszközök kezelése


auth-totp-heading-w-default-service = Adja meg a hitelesítési kódot <span>a fiókbeállításokhoz való továbblépéshez</span>
auth-totp-heading-w-custom-service = Adja meg a hitelesítési kódot <span>a következőhöz való továbblépéshez: { $serviceName }</span>
auth-totp-instruction = Nyissa meg a hitelesítő alkalmazását, és adja meg az általa adott hitelesítési kódot.
auth-totp-input-label = Adja meg a 6 számjegyű kódot
auth-totp-confirm-button = Megerősítés
auth-totp-code-required-error = Hitelesítési kód szükséges


pair-wait-for-supp-heading-text = Most jóváhagyás szükséges <span>a másik eszközéről</span>


pair-failure-header = A párosítás sikertelen
pair-failure-message = A beállítási folyamat megszakításra került.


pair-sync-header = Szinkronizálja a { -brand-firefox(case: "accusative") } a telefonján vagy táblagépén
pair-cad-header = Csatlakoztassa a { -brand-firefox(case: "accusative") } egy másik eszközön
pair-already-have-firefox-paragraph = Már van { -brand-firefox } a telefonján vagy a táblagépén?
pair-sync-your-device-button = Szinkronizálja az eszközét
pair-or-download-subheader = Vagy töltse le
pair-scan-to-download-message = Olvassa be a { -brand-firefox } mobilra történő letöltéséhez, vagy küldjön magának egy <linkExternal>letöltési hivatkozást</linkExternal>.
pair-not-now-button = Most nem
pair-take-your-data-message = Vigye el lapjait, könyvjelzőit és jelszavait bárhová, ahol { -brand-firefox(case: "accusative") } használ.
pair-get-started-button = Kezdő lépések
pair-qr-code-aria-label = QR-kód


pair-success-header-2 = Eszköz csatlakoztatva
pair-success-message-2 = A párosítás sikeres volt.


pair-supp-allow-heading-text = Párosítás megerősítése<span> a következővel: { $email }</span>
pair-supp-allow-confirm-button = Párosítás megerősítése
pair-supp-allow-cancel-link = Mégse


pair-wait-for-auth-heading-text = Most jóváhagyás szükséges <span>a másik eszközéről</span>


pair-unsupported-header = Párosítás egy alkalmazás segítségével
pair-unsupported-message = Használta a rendszerkamerát? Párosítania kell egy { -brand-firefox } alkalmazásból.




set-password-heading-v2 = Jelszó létrehozása a szinkronizáláshoz
set-password-info-v2 = Ez titkosítja az adatait. Különböznie kell a { -brand-google } vagy { -brand-apple }-fiókjához tartozó jelszavától.


third-party-auth-callback-message = Kis türelmet, át lesz irányítva az engedélyezett alkalmazáshoz.


account-recovery-confirm-key-heading = Adja meg a fiók-helyreállítási kulcsát
account-recovery-confirm-key-instruction = Ez a kulcs helyreállítja a titkosított böngészési adatait, mint a jelszavak és a könyvjelzők, a { -brand-firefox } kiszolgálóiról.
account-recovery-confirm-key-input-label =
    .label = Adja meg a 32 karakteres fiók-helyreállítási kulcsát
account-recovery-confirm-key-hint = A tárolási emlékeztető:
account-recovery-confirm-key-button-2 = Folytatás
account-recovery-lost-recovery-key-link-2 = Nem találja a fiók-helyreállítási kulcsát?


complete-reset-pw-header-v2 = Új jelszó létrehozása
complete-reset-password-success-alert = Jelszó megadva
complete-reset-password-error-alert = Sajnos probléma merült fel a jelszó megadásakor
complete-reset-pw-recovery-key-link = Fiók-helyreállítási kulcs használata
reset-password-complete-banner-heading = A mesterjelszó törölve
reset-password-complete-banner-message = Ne felejtsen el egy új fiók-helyreállítási kulcsot előállítani a { -product-mozilla-account } beállításaiban, hogy megakadályozza a jövőbeli bejelentkezési problémákat.
complete-reset-password-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.


confirm-backup-code-reset-password-input-label = Adja meg a 10 karakteres kódot
confirm-backup-code-reset-password-confirm-button = Megerősítés
confirm-backup-code-reset-password-subheader = Adjon meg egy tartalék hitelesítési kódot
confirm-backup-code-reset-password-instruction = Adja meg a kétlépcsős hitelesítés beállításakor mentett egyszer használatos kódok egyikét.
confirm-backup-code-reset-password-locked-out-link = Kizárta magát?


confirm-reset-password-with-code-heading = Ellenőrizze a leveleit
confirm-reset-password-with-code-instruction = Elküldtünk egy megerősítő kódot a következő címre: <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Adja meg a 8 számjegyű kódot 10 percen belül
confirm-reset-password-otp-submit-button = Folytatás
confirm-reset-password-otp-resend-code-button = Kód újraküldése
confirm-reset-password-otp-different-account-link = Másik fiók használata


confirm-totp-reset-password-header = Jelszó visszaállítása
confirm-totp-reset-password-subheader-v2 = Adja meg a kétlépcsős hitelesítési kódot
confirm-totp-reset-password-instruction-v2 = Ellenőrizze a <strong>hitelesítő alkalmazását</strong>, hogy visszaállítsa a jelszavát.
confirm-totp-reset-password-trouble-code = Nem tudja beírni a kódot?
confirm-totp-reset-password-confirm-button = Megerősítés
confirm-totp-reset-password-input-label-v2 = Adja meg a 6 számjegyű kódot
confirm-totp-reset-password-use-different-account = Másik fiók használata


password-reset-flow-heading = Jelszó visszaállítása
password-reset-body-2 = Kérdezünk néhány dolgot, melyet csak Ön tud, hogy biztonságban tartsa a fiókját.
password-reset-email-input =
    .label = Adja meg az e-mail-címét
password-reset-submit-button-2 = Folytatás


reset-password-complete-header = A jelszó vissza lett állítva
reset-password-confirmed-cta = Tovább erre: { $serviceName }




password-reset-recovery-method-header = Jelszó visszaállítása
password-reset-recovery-method-subheader = Válasszon helyreállítási módot
password-reset-recovery-method-details = A helyreállítási módok segítségével meggyőződünk arról, hogy Ön az.
password-reset-recovery-method-phone = Helyreállítási telefonszám
password-reset-recovery-method-code = Tartalék hitelesítési kódok
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kód maradt
       *[other] { $numBackupCodes } kód maradt
    }
password-reset-recovery-method-send-code-error-heading = Hiba történt a kód helyreállítási telefonra küldésekor
password-reset-recovery-method-send-code-error-description = Próbálja meg később, vagy használja a tartalék hitelesítési kódjait.


reset-password-recovery-phone-flow-heading = Jelszó visszaállítása
reset-password-recovery-phone-heading = Adja meg a helyreállítási kódot
reset-password-recovery-phone-instruction-v3 = SMS-ben egy 6 számjegyű kód lett küldve a(z) <span>{ $lastFourPhoneDigits }</span> végű telefonszámra. Ez a kód 5 perc után lejár. Ne ossza meg ezt a kódot másokkal.
reset-password-recovery-phone-input-label = Adja meg a 6 számjegyű kódot
reset-password-recovery-phone-code-submit-button = Megerősítés
reset-password-recovery-phone-resend-code-button = Kód újraküldése
reset-password-recovery-phone-resend-success = Kód elküldve
reset-password-recovery-phone-locked-out-link = Kizárta magát?
reset-password-recovery-phone-send-code-error-heading = Hiba történt a kód küldésekor
reset-password-recovery-phone-code-verification-error-heading = Hiba történt a kód ellenőrzésekor
reset-password-recovery-phone-general-error-description = Próbálja meg újra később.
reset-password-recovery-phone-invalid-code-error-description = A kód érvénytelen vagy lejárt.
reset-password-recovery-phone-invalid-code-error-link = Inkább tartalék hitelesítési kódokat használ?
reset-password-with-recovery-key-verified-page-title = Jelszó sikeresen visszaállítva
reset-password-complete-new-password-saved = Új jelszó elmentve!
reset-password-complete-recovery-key-created = Új fiók-helyreállítási kulcs létrehozva. Töltse le és tárolja most.
reset-password-complete-recovery-key-download-info =
    Ez a kulcs elengedhetetlen az adat-helyreállításhoz,
    ha elfelejti a jelszavát. <b>Töltse le és tárolja biztonságosan most,
    mert később nem fogja tudni újra elérni ezt az oldalt.</b>


error-label = Hiba:
validating-signin = Bejelentkezés ellenőrzése…
complete-signin-error-header = Megerősítési hiba
signin-link-expired-header = A megerősítő hivatkozás lejárt
signin-link-expired-message-2 = A hivatkozás, amelyre kattintott, lejárt, vagy már használták.


signin-password-needed-header-2 = Adja meg a <span>{ -product-mozilla-account }</span> jelszavát
signin-subheader-without-logo-with-servicename = Tovább erre: { $serviceName }
signin-subheader-without-logo-default = Folytatás a fiókbeállításokhoz
signin-button = Bejelentkezés
signin-header = Bejelentkezés
signin-use-a-different-account-link = Másik fiók használata
signin-forgot-password-link = Elfelejtette a jelszót?
signin-password-button-label = Jelszó
signin-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.
signin-code-expired-error = A kód lejárt. Jelentkezzen be újra.
signin-recovery-error = Hiba történt. Jelentkezzen be újra.
signin-account-locked-banner-heading = Jelszó visszaállítása
signin-account-locked-banner-description = Fiókját zároltuk, hogy biztonságban legyen a gyanús tevékenységektől.
signin-account-locked-banner-link = A bejelentkezéshez állítsa vissza a jelszavát


report-signin-link-damaged-body = A hivatkozásból karakterek hiányoztak, ezt az e-mail-kliense ronthatta el. Másolja be a címet körültekintően, és próbálja újra.
report-signin-header = Jelenti a jogosulatlan bejelentkezést?
report-signin-body = Levelet kapott arról, hogy megpróbáltak hozzáférni a fiókjához. Szeretné gyanúsnak jelenteni ezt a tevékenységet?
report-signin-submit-button = Tevékenység jelentése
report-signin-support-link = Miért történik ez?
report-signin-error = Elnézést, hiba történt a jelentés beküldésekor.
signin-bounced-header = Sajnáljuk. A fiókját zároltuk.
signin-bounced-message = A megerősítő e-mail elküldésre került ide: { $email }, de az visszatért, így zároltuk a fiókját, hogy megvédjük a { -brand-firefox(case: "inessive") } tárolt adatait.
signin-bounced-help = Ha ez egy érvényes e-mail-cím, <linkExternal>tudassa velünk</linkExternal>, és segítünk feloldani a fiókját.
signin-bounced-create-new-account = Már nem az Öné az e-mail-cím? Hozzon létre új fiókot
back = Vissza


signin-passkey-fallback-header = Bejelentkezés befejezése
signin-passkey-fallback-heading = Adja meg a jelszavát a szinkronizáláshoz
signin-passkey-fallback-body = Hogy adatait biztonságban tartsa, meg kell adnia a jelszavát, amikor ezt a jelkulcsot használja.
signin-passkey-fallback-password-label = Jelszó
signin-passkey-fallback-go-to-settings = Ugrás a beállításokhoz
signin-passkey-fallback-continue = Folytatás


signin-push-code-heading-w-default-service = Ellenőrizze ezt a bejelentkezést <span>a fiókbeállításokhoz való továbblépéshez</span>
signin-push-code-heading-w-custom-service = Erősítse meg ezt a bejelentkezést <span>a következőhöz való továbblépéshez: { $serviceName }</span>
signin-push-code-instruction = Ellenőrizze a többi eszközét, és hagyja jóvá ezt a bejelentkezést a { -brand-firefox } böngészőjéből.
signin-push-code-did-not-recieve = Nem kapta meg az értesítést?
signin-push-code-send-email-link = E-mail-kód


signin-push-code-confirm-instruction = Erősítse meg a bejelentkezését
signin-push-code-confirm-description = Bejelentkezési kísérletet észleltünk a következő eszközről. Ha ez Ön volt, hagyja jóvá a bejelentkezését
signin-push-code-confirm-verifying = Ellenőrzés
signin-push-code-confirm-login = Bejelentkezés megerősítése
signin-push-code-confirm-wasnt-me = Nem én voltam, a jelszó megváltoztatása.
signin-push-code-confirm-login-approved = A bejelentkezése jóvá lett hagyva. Zárja be ezt az ablakot.
signin-push-code-confirm-link-error = A hivatkozás sérült. Próbálja meg újra.


signin-recovery-method-header = Bejelentkezés
signin-recovery-method-subheader = Válasszon helyreállítási módot
signin-recovery-method-details = A helyreállítási módok segítségével meggyőződünk arról, hogy Ön az.
signin-recovery-method-phone = Helyreállítási telefonszám
signin-recovery-method-code-v2 = Tartalék hitelesítési kódok
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kód maradt
       *[other] { $numBackupCodes } kód maradt
    }
signin-recovery-method-send-code-error-heading = Hiba történt a kód helyreállítási telefonra küldésekor
signin-recovery-method-send-code-error-description = Próbálja meg később, vagy használja a tartalék hitelesítési kódjait.


signin-recovery-code-heading = Bejelentkezés
signin-recovery-code-sub-heading = Adjon meg egy tartalék hitelesítési kódot
signin-recovery-code-instruction-v3 = Adja meg a kétlépcsős hitelesítés beállításakor mentett egyszer használatos kódok egyikét.
signin-recovery-code-input-label-v2 = Adja meg a 10 karakteres kódot
signin-recovery-code-confirm-button = Megerősítés
signin-recovery-code-phone-link = Helyreállítási telefonszám használata
signin-recovery-code-support-link = Kizárta magát?
signin-recovery-code-required-error = Tartalék hitelesítési kód szükséges
signin-recovery-code-use-phone-failure = Hiba történt a kód helyreállítási telefonra küldésekor
signin-recovery-code-use-phone-failure-description = Próbálja meg újra később.


signin-recovery-phone-flow-heading = Bejelentkezés
signin-recovery-phone-heading = Adja meg a helyreállítási kódot
signin-recovery-phone-instruction-v3 = SMS-ben egy hatjegyű kód lett küldve a(z) <span>{ $lastFourPhoneDigits }</span> végű telefonszámra. Ez a kód 5 perc után lejár. Ne ossza meg ezt a kódot másokkal.
signin-recovery-phone-input-label = Adja meg a 6 számjegyű kódot
signin-recovery-phone-code-submit-button = Megerősítés
signin-recovery-phone-resend-code-button = Kód újraküldése
signin-recovery-phone-resend-success = Kód elküldve
signin-recovery-phone-locked-out-link = Kizárta magát?
signin-recovery-phone-send-code-error-heading = Hiba történt a kód küldésekor
signin-recovery-phone-code-verification-error-heading = Hiba történt a kód ellenőrzésekor
signin-recovery-phone-general-error-description = Próbálja meg újra később.
signin-recovery-phone-invalid-code-error-description = A kód érvénytelen vagy lejárt.
signin-recovery-phone-invalid-code-error-link = Inkább tartalék hitelesítési kódokat használ?
signin-recovery-phone-success-message = Sikeresen bejelentkezett. Korlátozások merülhetnek fel, ha újra használja a helyreállítási telefonszámát.


signin-reported-header = Köszönjük az éberségét
signin-reported-message = Értesítette csapatunkat. Az ilyen jelentések segítenek kivédeni a behatolókat.


signin-token-code-heading-2 = Adja meg a megerősítő kódot<span> a { -product-mozilla-account }</span> számára
signin-token-code-instruction-v2 = Adja meg 5 percen belül a(z) <email>{ $email }</email> címre küldött kódot.
signin-token-code-input-label-v2 = Adja meg a 6 számjegyű kódot
signin-token-code-confirm-button = Megerősítés
signin-token-code-code-expired = A kód lejárt?
signin-token-code-resend-code-link = Új kód elküldése e-mailben.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Új kód elküldése e-mailben { $seconds } másodperc múlva
       *[other] Új kód elküldése e-mailben { $seconds } másodperc múlva
    }
signin-token-code-required-error = Megerősítési kód szükséges
signin-token-code-resend-error = Hiba történt. Nem sikerült új kódot küldeni.
signin-token-code-instruction-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.


signin-totp-code-header = Bejelentkezés
signin-totp-code-subheader-v2 = Adja meg a kétlépcsős hitelesítési kódot
signin-totp-code-instruction-v4 = Ellenőrizze a <strong>hitelesítő alkalmazását</strong>, hogy megerősítse bejelentkezését.
signin-totp-code-input-label-v4 = Adja meg a 6 számjegyű kódot
signin-totp-code-aal-banner-header = Miért kérjük, hogy hitelesítsen?
signin-totp-code-aal-banner-content = Beállította a kétlépcsős hitelesítést a fiókjában, de még nem jelentkezett be kóddal ezen az eszközön.
signin-totp-code-aal-sign-out = Jelentkezzen ki ezen az eszközön
signin-totp-code-aal-sign-out-error = Sajnos probléma merült fel a kijelentkezésekor
signin-totp-code-confirm-button = Megerősítés
signin-totp-code-other-account-link = Másik fiók használata
signin-totp-code-recovery-code-link = Nem tudja beírni a kódot?
signin-totp-code-required-error = Hitelesítési kód szükséges
signin-totp-code-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.


signin-unblock-header = Engedélyezze ezt a bejelentkezést
signin-unblock-body = Ellenőrizze a leveleit, hogy megérkezett-e az ide küldött engedélyezési kód: { $email }.
signin-unblock-code-input = Adja meg az engedélyezési kódot
signin-unblock-submit-button = Folytatás
signin-unblock-code-required-error = Engedélyezési kód szükséges
signin-unblock-code-incorrect-length = Az engedélyezési kódnak 8 karakterből kell állnia
signin-unblock-code-incorrect-format-2 = Az engedélyezési kód csak betűket és/vagy számokat tartalmazhat
signin-unblock-resend-code-button = Nincs a beérkezett vagy a levélszemét mappában? Újraküldés
signin-unblock-support-link = Miért történik ez?
signin-unblock-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.




confirm-signup-code-page-title = Adja meg a megerősítő kódot
confirm-signup-code-heading-2 = Adja meg a megerősítő kódot <span>a { -product-mozilla-account }</span> számára
confirm-signup-code-instruction-v2 = Adja meg 5 percen belül a(z) <email>{ $email }</email> címre küldött kódot.
confirm-signup-code-input-label = Adja meg a 6 számjegyű kódot
confirm-signup-code-confirm-button = Megerősítés
confirm-signup-code-sync-button = Szinkronizálás indítása
confirm-signup-code-code-expired = A kód lejárt?
confirm-signup-code-resend-code-link = Új kód elküldése e-mailben.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Új kód elküldése e-mailben { $seconds } másodperc múlva
       *[other] Új kód elküldése e-mailben { $seconds } másodperc múlva
    }
confirm-signup-code-success-alert = A fiók sikeresen megerősítve
confirm-signup-code-is-required-error = Megerősítési kód szükséges
confirm-signup-code-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.


signup-heading-v2 = Jelszó létrehozása
signup-relay-info = Egy jelszóra van szükség a maszkolt e-mailek biztonságos kezeléséhez és a { -brand-mozilla } biztonsági eszközeinek eléréséhez.
signup-sync-info = Szinkronizálja jelszavait, könyvjelzőit és egyebeket mindenhol, ahol a { -brand-firefox }ot használja.
signup-sync-info-with-payment = Szinkronizálja jelszavait, fizetési módjait, könyvjelzőit és egyebeket mindenhol, ahol a { -brand-firefox }ot használja.
signup-change-email-link = E-mail-cím módosítása


signup-confirmed-sync-header = A szinkronizálás be van kapcsolva
signup-confirmed-sync-success-banner = A { -product-mozilla-account } megerősítve
signup-confirmed-sync-button = Böngészés megkezdése
signup-confirmed-sync-description-with-payment-v2 = Jelszavai, fizetési módjai, címei, könyvjelzői, előzményei és egyebei mindenhol szinkronizálhatóak, ahol a { -brand-firefox }ot használja.
signup-confirmed-sync-description-v2 = Jelszavai, címei, könyvjelzői, előzményei és egyebei mindenhol szinkronizálhatóak, ahol a { -brand-firefox }ot használja.
signup-confirmed-sync-add-device-link = További eszköz hozzáadása
signup-confirmed-sync-manage-sync-button = Szinkronizálás kezelése
signup-confirmed-sync-set-password-success-banner = Szinkronizálási jelszó létrehozva
