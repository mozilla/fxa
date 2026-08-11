## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logó">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Eszközök szinkronizálása">
body-devices-image = <img data-l10n-name="devices-image" alt="Eszközök">
fxa-privacy-url = { -brand-mozilla } adatvédelmi irányelvek
moz-accounts-privacy-url-2 = { -product-mozilla-accounts } adatvédelmi nyilatkozata
moz-accounts-terms-url = { -product-mozilla-accounts } szolgáltatási feltételei
account-deletion-info-block-communications = Ha a fiókját törli, akkor továbbra is kapni fogja a Mozilla Corporation és a Mozilla Foundation e-mailjeit, hacsak nem <a data-l10n-name="unsubscribeLink">kéri a leiratkozását</a>.
account-deletion-info-block-support = Ha bármilyen kérdése van, vagy segítségre van szüksége, nyugodtan forduljon <a data-l10n-name="supportLink">támogatási csapatunkhoz</a>.
account-deletion-info-block-communications-plaintext = Ha a fiókját törli, akkor továbbra is kapni fogja a Mozilla Corporation és a Mozilla Foundation e-mailjeit, hacsak nem kéri a leiratkozását:
account-deletion-info-block-support-plaintext = Ha bármilyen kérdése van, vagy segítségre van szüksége, nyugodtan forduljon támogatási csapatunkhoz:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ $productName } letöltése a { -google-play }ről">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ $productName } letöltése az { -app-store }ból">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = A { $productName } telepítése egy <a data-l10n-name="anotherDeviceLink">másik asztali eszközre</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = A { $productName } telepítése egy <a data-l10n-name="anotherDeviceLink">másik eszközre</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = A { $productName } beszerzése a Google Playen
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = A { $productName } letöltése az App Store-ból:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = A { $productName } telepítése egy másik eszközre:
automated-email-change-2 = Ha nem Ön tette meg ezt a műveletet, azonnal <a data-l10n-name="passwordChangeLink">változtassa meg jelszavát</a>.
automated-email-support = További információért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } Támogatást</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Ha nem Ön tette ezt a műveletet, azonnal változtassa meg a jelszavát:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = További információért keresse fel a { -brand-mozilla } Támogatást:
automated-email-inactive-account = Ez egy automatikus e-mail. Azért kapja, mert van { -product-mozilla-account }ja, és a legutóbbi bejelentkezése óta 2 év telt el.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } További információkért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } Támogatást</a>.
automated-email-no-action-plaintext = Ez egy automatizált e-mail. Ha tévedésből kapta, akkor nincs teendője.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Ez egy automatikus e-mail, ha nem Ön adott engedélyt erre a műveletre, akkor változtassa meg jelszavát:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Ez a kérés { $uaBrowser } böngészőtől érkezett, erről: { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Ez a kérés { $uaBrowser } böngészőtől érkezett, erről: { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Ez a kérés { $uaBrowser } böngészőtől érkezett.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = A kérés a következőtől érkezett: { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = A kérés a következőtől érkezett: { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Ha ez nem Ön volt, <a data-l10n-name="revokeAccountRecoveryLink">törölje az új kulcsot</a> és <a data-l10n-name="passwordChangeLink">változtassa meg a jelszavát</a>
automatedEmailRecoveryKey-change-pwd-only = Ha ez nem Ön volt, <a data-l10n-name="passwordChangeLink">változtassa meg a jelszavát</a>.
automatedEmailRecoveryKey-more-info = További információért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } Támogatást</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = A kérés a következőtől érkezett:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Ha ez nem Ön volt, törölje az új kulcsot:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Ha ez nem Ön volt, változtassa meg a jelszavát:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = és változtassa meg a jelszavát:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = További információért keresse fel a { -brand-mozilla } Támogatást:
automated-email-reset =
    Ez egy automatikus üzenet; ha nem engedélyezte ezt a műveletet, akkor <a data-l10n-name="resetLink">állítsa vissza a jelszavát</a>.
    További információkért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } támogatást</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Ha nem adott engedélyt erre a műveletre, akkor állítsa vissza a jelszavát itt: { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Ha nem Ön végezte ezt a műveletet, akkor azonnal <a data-l10n-name="resetLink">állítsa vissza a jelszavát</a> és a <a data-l10n-name="twoFactorSettingsLink">állítsa vissza a kétlépcsős hitelesítést</a>. További információkért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } Támogatást</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Ha nem Ön végezte ezt a műveletet, akkor azonnal állítsa vissza a jelszavát itt:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Állítsa vissza a kétlépcsős hitelesítést is itt:
automated-email-sign-in =
    Ez egy automatikus üzenet; ha nem engedélyezte ezt a műveletet, akkor <a data-l10n-name="securitySettingsLink">tekintse át a fiókja biztonsági beállításait</a>.
    További információkért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } támogatást</a>.
automated-email-sign-in-plaintext = Ha nem engedélyezte ezt a műveletet, akkor nézze át a fiókja biztonsági beállításait itt:
brand-banner-message = Tudta, hogy megváltoztattuk a nevünket { -product-firefox-accounts }ról { -product-mozilla-accounts }ra? <a data-l10n-name="learnMore">További tudnivalók</a>
change-password-plaintext = Ha azt gyanítja, hogy valaki más próbál hozzáférni fiókjához, kérjük változtassa meg jelszavát.
manage-account = Fiók kezelése
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = További információért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } Támogatást</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = További információkért keresse fel a { -brand-mozilla } Támogatást: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } ezen: { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } ezen: { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (becsült)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (becsült)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (becsült)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (becsült)
cadReminderFirst-subject-1 = Emlékeztető! Szinkronizálja a { -brand-firefox(case: "accusative") }
cadReminderFirst-action = Másik eszköz szinkronizálása
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = A szinkronizáláshoz két fél szükséges
cadReminderFirst-description-v2 = Vigye át lapjait az összes eszköze között. Vigye magával a könyvjelzőit, jelszavait és egyéb adatait mindenhová, ahol a { -brand-firefox(case: "accusative") } használja.
cadReminderSecond-subject-2 = Ne maradjon ki! Fejezze be a szinkronizálás beállítását.
cadReminderSecond-action = Másik eszköz szinkronizálása
cadReminderSecond-title-2 = Ne felejtsen el szinkronizálni!
cadReminderSecond-description-sync = Szinkronizálja a könyvjelzőket, a jelszavakat és még többet – bárhol is használja a { -brand-firefox(case: "accusative") }.
cadReminderSecond-description-plus = Ráadásul az adatok mindig titkosítva vannak. Csak Ön és az Ön által jóváhagyott eszközök láthatják.
inactiveAccountFinalWarning-subject = Utolsó lehetőség, hogy megtartsa a { -product-mozilla-account }ját
inactiveAccountFinalWarning-title = A { -brand-mozilla }-fiókja és az adatai törlésre kerülnek
inactiveAccountFinalWarning-preview = Jelentkezzen be a fiókja megtartásához
inactiveAccountFinalWarning-account-description = A { -product-mozilla-account } ja az ingyenes adatvédelmi és böngészési termékek elérésére használható, mint a { -brand-firefox } Sync, a { -product-mozilla-monitor }, a { -product-firefox-relay } és az { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Ha nem jelentkezik be, akkor fiókja és személyes adatai ekkor véglegesen törlésre kerülnek: <strong>{ $deletionDate }</strong>.
inactiveAccountFinalWarning-action = Jelentkezzen be a fiókja megtartásához
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Jelentkezzen be, hogy megtartsa a fiókját:
inactiveAccountFirstWarning-subject = Ne veszítse el fiókját
inactiveAccountFirstWarning-title = Megtartja a { -brand-mozilla }-fiókját és adatait?
inactiveAccountFirstWarning-account-description-v2 = A { -product-mozilla-account } ja az ingyenes adatvédelmi és böngészési termékek elérésére használható, mint a { -brand-firefox } Sync, a { -product-mozilla-monitor }, a { -product-firefox-relay } és az { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Észrevettük, hogy 2 éve nem jelentkezett be.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Mivel nem volt aktív, a fiókja és személyes adatai ekkor véglegesen törlésre kerülnek: <strong>{ $deletionDate }</strong>.
inactiveAccountFirstWarning-action = Jelentkezzen be a fiókja megtartásához
inactiveAccountFirstWarning-preview = Jelentkezzen be a fiókja megtartásához
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Jelentkezzen be, hogy megtartsa a fiókját:
inactiveAccountSecondWarning-subject = Művelet szükséges: Fióktörlés 7 napon belül
inactiveAccountSecondWarning-title = A { -brand-mozilla }-fiókja és az adatai 7 nap múlva törlésre kerülnek
inactiveAccountSecondWarning-account-description-v2 = A { -product-mozilla-account } ja az ingyenes adatvédelmi és böngészési termékek elérésére használható, mint a { -brand-firefox } Sync, a { -product-mozilla-monitor }, a { -product-firefox-relay } és az { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Mivel nem volt aktív, a fiókja és személyes adatai ekkor véglegesen törlésre kerülnek: <strong>{ $deletionDate }</strong>.
inactiveAccountSecondWarning-action = Jelentkezzen be a fiókja megtartásához
inactiveAccountSecondWarning-preview = Jelentkezzen be a fiókja megtartásához
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Jelentkezzen be, hogy megtartsa a fiókját:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Kifogyott a tartalék hitelesítési kódokból.
codes-reminder-title-one = Az utolsó tartalék hitelesítési kódjánál jár
codes-reminder-title-two = Itt az ideje, hogy új tartalék hitelesítési kódokat állítson elő
codes-reminder-description-part-one = A tartalék hitelesítési kódok segítenek helyreállítani adatait, ha elfelejti a jelszavát.
codes-reminder-description-part-two = Hozzon létre új kódokat most, hogy később ne veszítse el adatait.
codes-reminder-description-two-left = Már csak két kódja maradt.
codes-reminder-description-create-codes = Hozzon létre új tartalék hitelesítési kódokat, amelyek segítenek visszajutni fiókjába, ha kizárta magát.
lowRecoveryCodes-action-2 = Kódok létrehozása
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nem maradt tartalék hitelesítési kódja
        [one] Csak 1 tartalék hitelesítési kódja maradt
       *[other] Csak { $numberRemaining } tartalék hitelesítési kódja maradt
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Új bejelentkezés itt: { $clientName }
newDeviceLogin-subjectForMozillaAccount = Új bejelentkezés a { -product-mozilla-account }jába
newDeviceLogin-title-3 = Bejelentkeztek a { -product-mozilla-account }jával
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Nem Ön volt? <a data-l10n-name="passwordChangeLink">Változtassa meg a jelszavát</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Nem Ön volt? Változtassa meg a jelszavát:
newDeviceLogin-action = Fiók kezelése
passwordChangeRequired-subject = Gyanús tevékenység észlelve
passwordChangeRequired-preview = Azonnal változtassa meg a jelszavát
passwordChangeRequired-title-2 = Jelszó visszaállítása
passwordChangeRequired-suspicious-activity-3 = Fiókját zároltuk, hogy biztonságban legyen a gyanús tevékenységektől. Elővigyázatosságból ki lett jelentkeztetve az összes eszközéről, és a szinkronizált adatok törölve lettek.
passwordChangeRequired-sign-in-3 = Hogy újra bejelentkezzen a fiókjába, csak annyit kell tennie, hogy visszaállítja a jelszavát.
passwordChangeRequired-different-password-2 = <b>Fontos:</b> Válasszon egy erős jelszót, amely különbözik a korábban használttól.
passwordChangeRequired-different-password-plaintext-2 = Fontos: Válasszon egy erős jelszót, amely különbözik a múltban használttól.
passwordChangeRequired-action = Jelszó visszaállítása
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = A jelszó frissítve
passwordChanged-title = Jelszó sikeresen módosítva
passwordChanged-description-2 = A { -product-mozilla-account }jának jelszava sikeresen megváltoztatva erről az eszközről:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Használja a(z) { $code } kódot a jelszava módosításához
password-forgot-otp-preview = Ez a kód 10 perc múlva lejár
password-forgot-otp-title = Elfelejtette a jelszavát?
password-forgot-otp-request = A { -product-mozilla-account }ja jelszavának megváltoztatására vonatkozó kérést kaptunk a következőtől:
password-forgot-otp-code-2 = Ha ez Ön volt, akkor itt a megerősítő kódja a folytatáshoz:
password-forgot-otp-expiry-notice = Ez a kód 10 perc múlva lejár.
passwordReset-subject-2 = A jelszó vissza lett állítva
passwordReset-title-2 = A jelszó vissza lett állítva
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Visszaállította a { -product-mozilla-account }ja jelszavát ekkor:
passwordResetAccountRecovery-subject-2 = A jelszó vissza lett állítva
passwordResetAccountRecovery-title-3 = A jelszó vissza lett állítva
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = A fiók-helyreállítási kulcsát használta a { -product-mozilla-account }jához tartozó jelszavának visszaállításához a következőn:
passwordResetAccountRecovery-information = Kijelentkeztettük az összes szinkronizált eszközéről. Készítettünk egy új fiók-helyreállítási kulcsot a most használt kulcs helyett. Ezt a fiókbeállításokban módosíthatja.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Kijelentkeztettük az összes szinkronizált eszközéről. Készítettünk egy új fiók-helyreállítási kulcsot a most használt kulcs helyett. Ezt a fiókbeállításokban módosíthatja:
passwordResetAccountRecovery-action-4 = Fiók kezelése
passwordResetRecoveryPhone-subject = Helyreállítási telefonszám használva
passwordResetRecoveryPhone-preview = Ellenőrizze, hogy ez Ön volt-e
passwordResetRecoveryPhone-title = A helyreállítási telefonszáma egy jelszó-visszaállítás megerősítéséhez lett használva
passwordResetRecoveryPhone-device = Helyreállítási telefonszám innen használva:
passwordResetRecoveryPhone-action = Fiók kezelése
passwordResetWithRecoveryKeyPrompt-subject = A jelszó vissza lett állítva
passwordResetWithRecoveryKeyPrompt-title = A jelszó vissza lett állítva
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Visszaállította a { -product-mozilla-account }ja jelszavát ekkor:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Fiók-helyreállítási kulcs létrehozása
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Fiók-helyreállítási kulcs létrehozása:
passwordResetWithRecoveryKeyPrompt-cta-description = Újra be kell jelentkeznie az összes szinkronizált eszközén. Tartsa adatait biztonságban legközelebb egy fiók-helyreállítási kulccsal. Ez lehetővé teszi, hogy visszaállítsa az adatait, ha elfelejti a jelszavát.
postAddAccountRecovery-subject-3 = Új fiók-helyreállítási kulcs létrehozva
postAddAccountRecovery-title2 = Létrehozott egy új fiók-helyreállítási kulcsot
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Mentse el ezt a kulcsot – szüksége lesz rá a titkosított böngészési adatainak helyreállításához, ha elfelejtené a jelszavát.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Ez a kulcs csak egyszer használható. Miután felhasználta, automatikusan létrehozunk egy újat. Vagy bármikor létrehozhat egy újat a fiókbeállításokban.
postAddAccountRecovery-action = Fiók kezelése
postAddLinkedAccount-subject-2 = Új fiók kapcsolva a { -product-mozilla-account }jához
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName }-fiókja össze lett kapcsolva a { -product-mozilla-account }jával
postAddLinkedAccount-action = Fiók kezelése
postAddPasskey-subject = Jelkulcs létrehozva
postAddPasskey-preview = Most már használhatja eszközét a bejelentkezéshez
postAddPasskey-title = Létrehozott egy jelkulcsot
postAddPasskey-description = Most már bejelentkezhet vele az összes { -product-mozilla-account } szolgáltatásába.
postAddPasskey-sync-note = Felhívjuk figyelmét, hogy a jelszava továbbra is szükséges lesz a { -brand-firefox } szinkronizálási adatainak eléréséhez.
# Links out to a support article about passkeys and { -brand-firefox } sync
postAddPasskey-learn-more = További tudnivalók
postAddPasskey-requested-from = Ezt kérte a következőtől:
postAddPasskey-action = Fiók kezelése
postAddRecoveryPhone-subject = Helyreállítási telefonszám hozzáadva
postAddRecoveryPhone-preview = Kétlépcsős hitelesítéssel védett fiók
postAddRecoveryPhone-title-v2 = Hozzáadott egy helyreállítási telefonszámot
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Hozzáadta a(z) { $maskedLastFourPhoneNumber } helyreállítási telefonszámot
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Hogyan védi ez a fiókját
postAddRecoveryPhone-how-protect-plaintext = Hogyan védi ez a fiókját:
postAddRecoveryPhone-enabled-device = Innen engedélyezte:
postAddRecoveryPhone-action = Fiók kezelése
postAddTwoStepAuthentication-preview = A fiókja védve van
postAddTwoStepAuthentication-subject-v3 = A kétlépcsős hitelesítés be van kapcsolva
postAddTwoStepAuthentication-title-2 = Bekapcsolta a kétlépcsős hitelesítést
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Ezt kérte a következőtől:
postAddTwoStepAuthentication-action = Fiók kezelése
postAddTwoStepAuthentication-code-required-v4 = A hitelesítő alkalmazásból származó biztonsági kódok minden bejelentkezéskor szükségesek.
postAddTwoStepAuthentication-recovery-method-codes = Emellett tartalék hitelesítési kódokat adott meg helyreállítási módszerként.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Ezenkívül hozzáadta a(z) { $maskedPhoneNumber } helyreállítási telefonszámot.
postAddTwoStepAuthentication-how-protects-link = Hogyan védi ez a fiókját
postAddTwoStepAuthentication-how-protects-plaintext = Hogyan védi ez a fiókját:
postAddTwoStepAuthentication-device-sign-out-message = A csatlakoztatott eszközeinek védelme érdekében ki kell jelentkeznie mindenhol, ahol ezt a fiókot használja, majd jelentkezzen be újra a kétlépcsős hitelesítéssel.
postChangeAccountRecovery-subject = A fiók-helyreállítási kulcs megváltozott
postChangeAccountRecovery-title = Módosította a fiók-helyreállítási kulcsát
postChangeAccountRecovery-body-part1 = Új fiók-helyreállítási kulcsa van. Az előző kulcsát törölték.
postChangeAccountRecovery-body-part2 = Mentse biztonságos helyre ezt az új kulcsot – szüksége lesz rá a titkosított böngészési adatainak helyreállításához, ha elfelejtené a jelszavát.
postChangeAccountRecovery-action = Fiók kezelése
postChangePrimary-subject = Elsődleges e-mail frissítve
postChangePrimary-title = Új elsődleges e-mail cím
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Sikeresen megváltoztatta az elsődleges e-mail címét erre: { $email }. Ez az cím mostantól a felhasználóneve a { -product-mozilla-account }ba való bejelentkezéshez, illetve ide fognak érkezni a biztonsági értesítések, és a bejelentkezési visszaigazolások.
postChangePrimary-action = Fiók kezelése
postChangeRecoveryPhone-subject = Helyreállítási telefonszám frissítve
postChangeRecoveryPhone-preview = Kétlépcsős hitelesítéssel védett fiók
postChangeRecoveryPhone-title = Módosította a helyreállítási telefonszámát
postChangeRecoveryPhone-description = Új helyreállítási telefonszáma van. Az előző telefonszám törölve lett.
postChangeRecoveryPhone-requested-device = Innen kérte:
postChangeTwoStepAuthentication-preview = A fiókja védve van
postChangeTwoStepAuthentication-subject = Kétlépcsős hitelesítés frissítve
postChangeTwoStepAuthentication-title = A kétlépcsős hitelesítés frissítve lett
postChangeTwoStepAuthentication-use-new-account = Most már az új { -product-mozilla-account } bejegyzést kell használnia a hitelesítő alkalmazásban. A régi már nem fog működni, és eltávolíthatja.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Ezt kérte a következőtől:
postChangeTwoStepAuthentication-action = Fiók kezelése
postChangeTwoStepAuthentication-how-protects-link = Hogyan védi ez a fiókját
postChangeTwoStepAuthentication-how-protects-plaintext = Hogyan védi ez a fiókját:
postChangeTwoStepAuthentication-device-sign-out-message = A csatlakoztatott eszközeinek védelme érdekében ki kell jelentkeznie mindenhol, ahol ezt a fiókot használja, majd jelentkezzen be újra az új kétlépcsős hitelesítésével.
postConsumeRecoveryCode-title-3 = A tartalék hitelesítési kódját egy jelszó-visszaállítás megerősítéséhez használták
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kód innen használva:
postConsumeRecoveryCode-action = Fiók kezelése
postConsumeRecoveryCode-subject-v3 = Tartalék hitelesítési kód felhasználva
postConsumeRecoveryCode-preview = Ellenőrizze, hogy ez Ön volt-e
postNewRecoveryCodes-subject-2 = Új tartalék hitelesítési kódok létrehozva
postNewRecoveryCodes-title-2 = Új tartalék hitelesítési kódokat hozott létre
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = A következőn lettek létrehozva:
postNewRecoveryCodes-action = Fiók kezelése
postRemoveAccountRecovery-subject-2 = Fiók-helyreállítási kulcs törölve
postRemoveAccountRecovery-title-3 = Törölte a fiók-helyreállítási kulcsát
postRemoveAccountRecovery-body-part1 = A fiók-helyreállítási kulcsra szükség van a titkosított böngészési adatainak helyreállításához, ha elfelejti a jelszavát.
postRemoveAccountRecovery-body-part2 = Ha még nem tette, hozzon létre egy új fiók-helyreállítási kulcsot a fiókbeállításokban, hogy megakadályozza a mentett jelszavak, könyvjelzők, böngészési előzmények és egyebek elveszítését.
postRemoveAccountRecovery-action = Fiók kezelése
postRemovePasskey-subject = Jelkulcs törölve
postRemovePasskey-preview = Egy jelkulcsot eltávolítottak a fiókjából
postRemovePasskey-title = Törölte a jelkulcsot
postRemovePasskey-description = Másik módszert kell használnia a bejelentkezéshez.
postRemovePasskey-requested-from = Ezt kérte a következőtől:
postRemovePasskey-action = Fiók kezelése
postRemoveRecoveryPhone-subject = Helyreállítási telefonszám eltávolítva
postRemoveRecoveryPhone-preview = Kétlépcsős hitelesítéssel védett fiók
postRemoveRecoveryPhone-title = Helyreállítási telefonszám eltávolítva
postRemoveRecoveryPhone-description-v2 = A helyreállítási telefonszámát eltávolították a kétlépcsős hitelesítési beállítások közül.
postRemoveRecoveryPhone-description-extra = Továbbra is használhatja a tartalék hitelesítési kódjait a bejelentkezéshez, ha nem tudja használni a hitelesítő alkalmazást.
postRemoveRecoveryPhone-requested-device = Innen kérte:
postRemoveSecondary-subject = Másodlagos e-mail cím eltávolítva
postRemoveSecondary-title = Másodlagos e-mail cím eltávolítva
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Sikeresen eltávolította a következő másodlagos e-mail címet a { -product-mozilla-account }jából: { $secondaryEmail }. A biztonsági értesítések és a bejelentkezési megerősítések többé nem lesznek elküldve erre a címre.
postRemoveSecondary-action = Fiók kezelése
postRemoveTwoStepAuthentication-subject-line-2 = Kétlépcsős hitelesítés kikapcsolva
postRemoveTwoStepAuthentication-title-2 = Kikapcsolta a kétlépcsős hitelesítést
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Innen tiltotta le:
postRemoveTwoStepAuthentication-action = Fiók kezelése
postRemoveTwoStepAuthentication-not-required-2 = Már nincs szüksége biztonsági kódokra a hitelesítő alkalmazásból, amikor bejelentkezik.
postSigninRecoveryCode-subject = Bejelentkezéshez használt tartalék hitelesítési kód
postSigninRecoveryCode-preview = Fióktevékenység megerősítése
postSigninRecoveryCode-title = A tartalék hitelesítési kódját használták a bejelentkezéshez
postSigninRecoveryCode-description = Ha ezt nem Ön tette, akkor azonnal változtassa meg jelszavát, hogy biztonságban tudja a fiókját.
postSigninRecoveryCode-device = Bejelentkezett innen:
postSigninRecoveryCode-action = Fiók kezelése
postSigninRecoveryPhone-subject = A bejelentkezéshez használt helyreállítási telefonszám
postSigninRecoveryPhone-preview = Fióktevékenység megerősítése
postSigninRecoveryPhone-title = A helyreállítási telefonszámát bejelentkezéshez használták
postSigninRecoveryPhone-description = Ha ezt nem Ön tette, akkor azonnal változtassa meg jelszavát, hogy biztonságban tudja a fiókját.
postSigninRecoveryPhone-device = Bejelentkezett innen:
postSigninRecoveryPhone-action = Fiók kezelése
postVerify-sub-title-3 = Örülünk, hogy látjuk!
postVerify-title-2 = Két eszközön szeretné látni ugyanazt a lapot?
postVerify-description-2 = Könnyedén! Csak telepítse a { -brand-firefox(case: "accusative") } egy másik eszközre, és jelentkezzen be a szinkronizáláshoz. Olyan, mint a varázslat!
postVerify-sub-description = (Pszt… Ez azt is jelenti, hogy a könyvjelzőit, jelszavait és az egyéb a { -brand-firefox(case: "inessive") } tárolt adatait bárhol elérheti, ahol be van jelentkezve.)
postVerify-subject-4 = Üdvözli a { -brand-mozilla }!
postVerify-setup-2 = Másik eszköz csatlakoztatása:
postVerify-action-2 = Másik eszköz csatlakoztatása
postVerifySecondary-subject = Másodlagos e-mail hozzáadva
postVerifySecondary-title = Másodlagos e-mail hozzáadva
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Sikeresen megerősítette a(z) { $secondaryEmail } másodlagos e-mail-címet a { -product-mozilla-account }jához. A biztonsági értesítések és a bejelentkezési megerősítések most már mindkét címére el lesznek küldve.
postVerifySecondary-action = Fiók kezelése
recovery-subject = Jelszó visszaállítása
recovery-title-2 = Elfelejtette a jelszavát?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = A(z) { -product-mozilla-account }ja jelszavának megváltoztatására vonatkozó kérést kaptunk a következőtől:
recovery-new-password-button = Hozzon létre egy új jelszót az alábbi gombra kattintva. Ez a hivatkozás egy órán belül lejár.
recovery-copy-paste = Hozzon létre egy új jelszót az alábbi webcím másolásával és a böngészőbe történő beillesztésével. Ez a hivatkozás egy órán belül lejár.
recovery-action = Új jelszó létrehozása
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Használja a(z) { $unblockCode } kódot a bejelentkezéshez
unblockCode-preview = Ez a kód egy órán belül lejár
unblockCode-title = Ez az ön bejelentkezése?
unblockCode-prompt = Ha igen, akkor erre az engedélyezési kódra van szüksége:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Ha igen, akkor erre az engedélyezési kódra van szüksége: { $unblockCode }
unblockCode-report = Ha nem, akkor segítsen kivédeni a behatolókat, és <a data-l10n-name="reportSignInLink">jelentse nekünk.</a>
unblockCode-report-plaintext = Ha nem, akkor segítsen kivédeni a behatolókat, és jelentse nekünk.
verificationReminderFinal-subject = Végső emlékeztető, hogy erősítse meg a fiókját
verificationReminderFinal-description-2 = Néhány hete létrehozott egy { -product-mozilla-account }ot, de sosem erősítette meg. Az Ön biztonsága érdekében törölni fogjuk a fiókot, ha a következő 24 órán belül nem igazolja vissza.
confirm-account = Fiók megerősítése
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Emlékeztető, hogy erősítse meg a fiókját
verificationReminderFirst-title-3 = Üdvözli a { -brand-mozilla }!
verificationReminderFirst-description-3 = Néhány napja létrehozott egy { -product-mozilla-account }ot, de sosem erősítette meg. Az Ön biztonsága érdekében törölni fogjuk a fiókot, ha a következő 15 napon belül nem igazolja vissza.
verificationReminderFirst-sub-description-3 = Ne hagyja ki azt a böngészőt, amely Önt és a magánszféráját teszi az első helyre.
confirm-email-2 = Fiók megerősítése
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Fiók megerősítése
verificationReminderSecond-subject-2 = Emlékeztető, hogy erősítse meg a fiókját
verificationReminderSecond-title-3 = Ne hagyja ki a { -brand-mozilla(ending: "accented") }t!
verificationReminderSecond-description-4 = Néhány napja létrehozott egy { -product-mozilla-account }ot, de nem erősítette meg. A következő 10 napon belül erősítse meg fiókját, különben automatikusan törlésre kerül.
verificationReminderSecond-second-description-3 = A { -product-mozilla-account }ja segítségével szinkronizálhatja a { -brand-firefox(case: "accusative") } az eszközök között, és hozzáférést biztosít a { -brand-mozilla } további adatvédelmi termékeihez.
verificationReminderSecond-sub-description-2 = Legyen része küldetésünknek, hogy az internetet mindenki számára nyitott hellyé alakítsuk.
verificationReminderSecond-action-2 = Fiók megerősítése
verify-title-3 = Nyissa meg az internetet a { -brand-mozilla(ending: "accented") }val
verify-description-2 = Erősítse meg fiókját, és hozza ki a lehető legtöbbet a { -brand-mozilla(ending: "accented") }ból mindenhol, ahol bejelentkezik:
verify-subject = A fiókja létrehozásának befejezése
verify-action-2 = Fiók megerősítése
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Ezzel módosíthatja a fiókját: { $code }
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Ez a kód { $expirationTime } perc múlva lejár.
       *[other] Ez a kód { $expirationTime } perc múlva lejár.
    }
verifyAccountChange-title = Módosítja a fiókadatait?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Segítsen nekünk megőrizni fiókja biztonságát azzal, hogy jóváhagyja ezt a változást a következő napon:
verifyAccountChange-prompt = Ha igen, akkor itt az engedélyezési kódja:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] { $expirationTime } perc múlva lejár.
       *[other] { $expirationTime } perc múlva lejár.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Bejelentkezett a következőbe: { $clientName }?
verifyLogin-description-2 = Segítsen nekünk megőrizni fiókja biztonságát azzal, hogy megerősíti, hogy Ön jelentkezett be:
verifyLogin-subject-2 = Bejelentkezés megerősítése
verifyLogin-action = Bejelentkezés megerősítése
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Használja a(z) { $code } kódot a bejelentkezéshez
verifyLoginCode-preview = Ez a kód 5 perc múlva lejár.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Bejelentkezett a következőbe: { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Segítsen nekünk megőrizni fiókja biztonságát azzal, hogy jóváhagyja a bejelentkezését:
verifyLoginCode-prompt-3 = Ha igen, akkor itt az engedélyezési kódja:
verifyLoginCode-expiry-notice = 5 perc múlva lejár.
verifyPrimary-title-2 = Elsődleges e-mail-cím megerősítése
verifyPrimary-description = A kérés, hogy módosítsa a fiókját a következő eszközről lett elküldve:
verifyPrimary-subject = Elsődleges e-mail cím megerősítése
verifyPrimary-action-2 = E-mail-cím megerősítése
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Amint megerősíti, a fiókváltoztatások, mint a másodlagos e-mail-cím hozzáadása, lehetségesek lesznek erről az eszközről.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Használja a(z) { $code } kódot a másodlagos e-mail-cím megerősítéséhez
verifySecondaryCode-preview = Ez a kód 5 perc múlva lejár.
verifySecondaryCode-title-2 = Másodlagos e-mail-cím megerősítése
verifySecondaryCode-action-2 = E-mail-cím megerősítése
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = A kérés, hogy a(z) { $email } címet használja másodlagos e-mail-címként a következő { -product-mozilla-account }ból érkezett:
verifySecondaryCode-prompt-2 = Használja ezt a megerősítő kódot:
verifySecondaryCode-expiry-notice-2 = 5 perc múlva lejár. Ha megerősíti, akkor ez a cím meg fogja kapni a biztonsági értesítéseket és megerősítéseket.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Használja a(z) { $code } kódot a fiókja megerősítéséhez
verifyShortCode-preview-2 = Ez a kód 5 perc múlva lejár
verifyShortCode-title-3 = Nyissa meg az internetet a { -brand-mozilla(ending: "accented") }val
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Erősítse meg fiókját, és hozza ki a lehető legtöbbet a { -brand-mozilla(ending: "accented") }ból mindenhol, ahol bejelentkezik:
verifyShortCode-prompt-3 = Használja ezt a megerősítő kódot:
verifyShortCode-expiry-notice = 5 perc múlva lejár.
