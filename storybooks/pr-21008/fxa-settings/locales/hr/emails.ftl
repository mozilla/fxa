## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logotip">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sinkroniziraj uređaje">
body-devices-image = <img data-l10n-name="devices-image" alt="Uređaji">
fxa-privacy-url = { -brand-mozilla } politika privatnosti
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } napomene o privatnosti
moz-accounts-terms-url = Uvjeti usluge za { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Ako je tvoj račun izbrisan, i dalje ćeš primati e-poštu od Mozilla Corporation i Mozilla Foundation, osim ako <a data-l10n-name="unsubscribeLink">zatražiš otkazivanje pretplate</a>.
account-deletion-info-block-support = Ako imaš pitanja ili trebaš pomoć, slobodno kontaktiraj naš <a data-l10n-name="supportLink">tim podrške</a>.
account-deletion-info-block-communications-plaintext = Ako je tvoj račun izbrisan, i dalje ćeš primati e-poštu od Mozilla Corporation i Mozilla Foundation, osim ako zatražiš otkazivanje pretplate:
account-deletion-info-block-support-plaintext = Ako imaš pitanja ili trebaš pomoć, slobodno kontaktiraj naš tim podrške:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Preuzmi { $productName } na { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Preuzmi { $productName } na { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instaliraj { $productName } na <a data-l10n-name="anotherDeviceLink">jedan drugi desktop uređaj</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instaliraj { $productName } na <a data-l10n-name="anotherDeviceLink">jedan drugi uređaj</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Preuzmi { $productName } na Google Playu:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Preuzmi { $productName } na App Storeu:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instaliraj { $productName } na jedan drugi uređaj:
automated-email-change-2 = Ako nisi poduzeo/la ovu radnju, odmah <a data-l10n-name="passwordChangeLink">promijeni lozinku</a>.
automated-email-support = Za više informacija posjeti stranicu <a data-l10n-name="supportLink">{ -brand-mozilla } podrške</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Ako nisi poduzeo/la ovu radnju, odmah promijeni lozinku:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Za više informacija posjeti stranicu { -brand-mozilla } podrške:
automated-email-inactive-account = Ovo je automatski generirana e-mail poruka. Poslana ti je jer imaš { -product-mozilla-account } i prošle su 2 godine od tvoje zadnje prijave.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Za više informacija posjeti stranicu <a data-l10n-name="supportLink">{ -brand-mozilla } podrške</a>.
automated-email-no-action-plaintext = Ovo je automatizirana e-mail poruka. Ako si je primio/la greškom, ne moraš ništa učiniti.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Ovo je automatizirana e-mail poruka; ako nisi odobrio/la ovu radnju, promijeni lozinku:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Ovaj je zahtjev došao od { $uaBrowser } na { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Ovaj je zahtjev došao od { $uaBrowser } na { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Ovaj je zahtjev došao od { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Ovaj je zahtjev došao od { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Ovaj je zahtjev došao od { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Ako to nisi bio/la ti, <a data-l10n-name="revokeAccountRecoveryLink">izbriši novi ključ</a> i <a data-l10n-name="passwordChangeLink">promijeni lozinku</a>.
automatedEmailRecoveryKey-change-pwd-only = Ako to nisi bio/la ti, <a data-l10n-name="passwordChangeLink">promijeni lozinku</a>.
automatedEmailRecoveryKey-more-info = Za više informacija posjeti stranicu <a data-l10n-name="supportLink">{ -brand-mozilla } podrške</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Ovaj je zahtjev došao od:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Ako to nisi bio/bila ti, izbriši novi ključ:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Ako to nisi bio/la ti, promijeni lozinku:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = i promijeni lozinku:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Za više informacija posjeti stranicu { -brand-mozilla } podrške:
automated-email-reset = Ovo je automatizirana e-mail poruka; ako nisi odobrio/la ovu radnju, <a data-l10n-name="resetLink">promijeni lozinku</a>. Za više informacija posjeti stranicu <a data-l10n-name="supportLink">{ -brand-mozilla } podrške</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Ako nisi odobrio/la ovu radnju, resetiraj lozinku sada na { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Ako nisi poduzeo/la ovu radnju, odmah <a data-l10n-name="resetLink">resetiraj lozinku</a> i <a data-l10n-name="twoFactorSettingsLink">resetiraj dvofaktorsku autentifikaciju</a>.
    Za više informacija posjeti stranicu <a data-l10n-name="supportLink">{ -brand-mozilla } podrške</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Ako nisi poduzeo/la ovu radnju, odmah resetiraj lozinku na:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Također resetiraj dvofaktorsku autentifikaciju na:
brand-banner-message = Znaš li da smo promijenili ime { -product-firefox-accounts } u { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Saznaj više</a>
change-password-plaintext = Ako sumnjaš da netko pokušava pristupiti tvom računu, promijeni lozinku.
manage-account = Upravljaj računom
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Za više informacija posjeti stranicu <a data-l10n-name="supportLink">{ -brand-mozilla } podrške</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Za više informacija posjeti stranicu { -brand-mozilla } podrške: { $supportUrl }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } na { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } na { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (procijenjeno)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (procijenjeno)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (procijenjeno)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (procijenjeno)
cadReminderFirst-subject-1 = Podsjetnik! Sinkronizirajmo { -brand-firefox }
cadReminderFirst-action = Sinkroniziraj jedan drugi uređaj
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Za sinkronizaciju su potrebna dva uređaja
cadReminderFirst-description-v2 = Koristi svoje kartice na svim tvojim uređajima. Dobij svoje zabilješke, lozinke i druge podatke svugdje gdje koristiš { -brand-firefox }.
cadReminderSecond-subject-2 = Nemoj ništa propustiti! Završimo tvoje postavljanje sinkronizacije
cadReminderSecond-action = Sinkroniziraj jedan drugi uređaj
cadReminderSecond-title-2 = Nemoj zaboraviti sinkronizirati!
cadReminderSecond-description-sync = Sinkroniziraj zabilješke, lozinke i ostalo gdje god koristiš { -brand-firefox }.
cadReminderSecond-description-plus = Osim toga, tvoji su podaci uvijek šifrirani. Podatke možeš vidjeti samo ti i uređaji koje odobriš.
inactiveAccountFinalWarning-subject = Zadnja prilika da zadržiš svoj { -product-mozilla-account }
inactiveAccountFinalWarning-title = Tvoj { -brand-mozilla } račun i podaci će se izbrisati
inactiveAccountFinalWarning-preview = Prijavi se za zadržavanje tvog računa
inactiveAccountFinalWarning-account-description = Tvoj se { -product-mozilla-account } koristi za pristup besplatnoj privatnosti i proizvodima za pregledavanje kao što su { -brand-firefox } sinkronizacija, { -product-mozilla-monitor }, { -product-firefox-relay } i { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> će se tvoj račun i tvoji osobni podaci trajno izbrisati ako se ne prijaviš.
inactiveAccountFinalWarning-action = Prijavi se za zadržavanje tvog računa
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Prijavi se za zadržavanje tvog računa:
inactiveAccountFirstWarning-subject = Nemoj izgubiti svoj račun
inactiveAccountFirstWarning-title = Želiđ li zadržati svoj { -brand-mozilla } račun i podatke?
inactiveAccountFirstWarning-account-description-v2 = Tvoj se { -product-mozilla-account } koristi za pristup besplatnoj privatnosti i proizvodima za pregledavanje kao što su { -brand-firefox } sinkronizacija, { -product-mozilla-monitor }, { -product-firefox-relay } i { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Primijetili smo da se nisi prijavio/la dvije godine.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Tvoj račun i tvoji osobni podaci će se zbog neaktivnosti trajno izbrisati <strong>{ $deletionDate }</strong>.
inactiveAccountFirstWarning-action = Prijavi se za zadržavanje tvog računa
inactiveAccountFirstWarning-preview = Prijavi se za zadržavanje tvog računa
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Prijavi se za zadržavanje tvog računa:
inactiveAccountSecondWarning-subject = Potrebna je radnja: Brisanje računa za 7 dana
inactiveAccountSecondWarning-title = Tvoj { -brand-mozilla } račun i podaci će se izbrisati za 7 dana
inactiveAccountSecondWarning-account-description-v2 = Tvoj se { -product-mozilla-account } koristi za pristup besplatnoj privatnosti i proizvodima za pregledavanje kao što su { -brand-firefox } sinkronizacija, { -product-mozilla-monitor }, { -product-firefox-relay } i { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Tvoj račun i tvoji osobni podaci će se zbog neaktivnosti trajno izbrisati <strong>{ $deletionDate }</strong>.
inactiveAccountSecondWarning-action = Prijavi se za zadržavanje tvog računa
inactiveAccountSecondWarning-preview = Prijavi se za zadržavanje tvog računa
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Prijavi se za zadržavanje tvog računa:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Preostalo ti je još samo par sigurnosnih kodova za autentifikaciju!
codes-reminder-title-one = Imaš još samo jedan sigurnosni kod za autentifikaciju!
codes-reminder-title-two = Vrijeme je za izradu dodatnih kodova za autentifikaciju
codes-reminder-description-part-one = Sigurnosni kodovi za autentifikaciju pomažu ti obnoviti tvoje podatke kada zaboraviš lozinku.
codes-reminder-description-part-two = Stvori nove kodove sada kako kasnije ne bi izgubio/la tvoje podatke.
codes-reminder-description-two-left = Imaš još samo dva koda.
codes-reminder-description-create-codes = Stvori nove sigurnosne kodove za autentifikaciju koji će ti pomoći da se vratiš na svoj račun ako ga izgubiš.
lowRecoveryCodes-action-2 = Stvori kodove
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nije preostao nijedan rezervni kod za autentifikaciju
        [one] Preostao je samo { $numberRemaining } rezervni kod za autentifikaciju
        [few] Preostala je samo { $numberRemaining } rezervna koda za autentifikaciju
       *[other] Preostalo je samo { $numberRemaining } rezervnih kodova za autentifikaciju
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nova prijava na { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nova prijava na tvoj { -product-mozilla-account }
newDeviceLogin-title-3 = Tvoj { -product-mozilla-account } je korišten za prijavu
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = To nisi ti? <a data-l10n-name="passwordChangeLink">Promijeni lozinku</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = To nisi ti? Promijeni lozinku:
newDeviceLogin-action = Upravljaj računom
passwordChangeRequired-subject = Otkrivena je sumnjiva aktivnost
passwordChangeRequired-preview = Odmah promijeni svoju lozinku
passwordChangeRequired-title-2 = Resetiraj svoju lozinku
passwordChangeRequired-suspicious-activity-3 = Zaključali smo tvoj račun kako bismo ga zaštitili od sumnjivih aktivnosti. Odjavljen/a si sa svih uređaja i svi sinkronizirani podaci su iz predostrožnosti izbrisani.
passwordChangeRequired-sign-in-3 = Za ponovnu prijavu na tvoj račun jednostavno resetiraj svoju lozinku.
passwordChangeRequired-different-password-2 = <b>Važno:</b> Odaberi snažnu lozinku koja se razlikuje od tvoje lozinke u prošlosti.
passwordChangeRequired-different-password-plaintext-2 = Važno: Odaberi snažnu lozinku koja se razlikuje od tvoje lozinke u prošlosti.
passwordChangeRequired-action = Resetiraj lozinku
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Lozinka aktualizirana
passwordChanged-title = Lozinka je uspješno promijenjena
passwordChanged-description-2 = Tvoja { -product-mozilla-account } lozinka je uspješno promijenjena sa sljedećeg uređaja:
password-forgot-otp-preview = Ovaj kod isteče za 10 minuta
password-forgot-otp-title = Zaboravio/la si lozinku?
password-forgot-otp-request = Primili smo zahtjev za promjenu lozinke na tvom { -product-mozilla-account } od:
password-forgot-otp-code-2 = Ako si to bio/la ti, ovo je tvoj potvrdni kod za nastavljanje:
password-forgot-otp-expiry-notice = Ovaj kod isteče za 10 minuta.
passwordReset-subject-2 = Tvoja je lozinka resetirana
passwordReset-title-2 = Tvoja je lozinka resetirana
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Resetirao/la si svoju { -product-mozilla-account } lozinku na:
passwordResetAccountRecovery-subject-2 = Tvoja lozinka je resetirana
passwordResetAccountRecovery-title-3 = Tvoja je lozinka resetirana
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Koristio/la si svoj ključ za obnavljanje računa za resetiranje { -product-mozilla-account } lozinke na:
passwordResetAccountRecovery-information = Odjavili smo te sa svih tvojih sinkroniziranih uređaja. Generirali smo novi ključ za obnavljanje računa koji će zamijeniti prijašnji ključ. Možeš ga promijeniti u postavkama računa.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Odjavili smo te sa svih tvojih sinkroniziranih uređaja. Generirali smo novi ključ za obnavljanje računa koji će zamijeniti prijašnji ključ. Možeš ga promijeniti u postavkama računa.
passwordResetAccountRecovery-action-4 = Upravljaj računom
passwordResetRecoveryPhone-subject = Telefonski broj za obnavljanje je korišten
passwordResetRecoveryPhone-preview = Provjeri jesi li to bio/la ti
passwordResetRecoveryPhone-title = Tvoj telefonski broj za obnavljanje je korišten za potvrđivanje resetiranja lozinke
passwordResetRecoveryPhone-device = Telefonski broj za obnavljanje je korišten s uređaja:
passwordResetRecoveryPhone-action = Upravljaj računom
passwordResetWithRecoveryKeyPrompt-subject = Tvoja je lozinka resetirana
passwordResetWithRecoveryKeyPrompt-title = Tvoja je lozinka resetirana
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Resetirao/la si svoju { -product-mozilla-account } lozinku na:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Stvori ključ za obnavljanje računa
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Stvori ključ za obnavljanje računa:
passwordResetWithRecoveryKeyPrompt-cta-description = Morat ćeš se ponovo prijaviti na svim svojim sinkroniziranim uređajima. Sljedeći put čuvaj svoje podatke sigurno pomoću ključa za obnavljanje računa. To omogućuje obnavljanje podataka ako zaboraviš lozinku.
postAddAccountRecovery-subject-3 = Novi ključ za obnavljanje računa stvoren
postAddAccountRecovery-title2 = Stvorio/la si novi ključ za obnavljanje računa
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Spremi ovaj ključ na sigurno mjesto – trebat će ti za obnavljanje šifriranih podataka pregledavanja ako zaboraviš lozinku.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Ovaj se ključ može koristiti samo jednom. Nakon što ga upotrijebiš, automatski ćemo izraditi novi ključ za tebe. Ili stvori novi ključ u bilo kojem trenutku u postavkama tvog računa.
postAddAccountRecovery-action = Upravljaj računom
postAddLinkedAccount-subject-2 = Novi račun je povezan s tvojim { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Tvoj { $providerName } račun je povezan s tvojim { -product-mozilla-account }
postAddLinkedAccount-action = Upravljaj računom
postAddRecoveryPhone-subject = Telefonski broj za obnavljanje je dodan
postAddRecoveryPhone-preview = Račun je zaštićen dvofaktorskom autentifikacijom
postAddRecoveryPhone-title-v2 = Dodao/la si telefonski broj za obnavljanje
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Kako ovo štiti tvoj račun
postAddRecoveryPhone-how-protect-plaintext = Kako ovo štiti tvoj račun:
postAddRecoveryPhone-enabled-device = Aktivirao/la si ga s uređaja:
postAddRecoveryPhone-action = Upravljaj računom
postAddTwoStepAuthentication-preview = Tvoj je račun zaštićen
postAddTwoStepAuthentication-subject-v3 = Dvofaktorska autentifikacija je uključena
postAddTwoStepAuthentication-title-2 = Aktivirao/la si dvofaktorsku autentifikaciju
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Zatražio/la si ovo s uređaja:
postAddTwoStepAuthentication-action = Upravljaj računom
postAddTwoStepAuthentication-recovery-method-codes = Dodao/la si i rezervne autentifikacijske kodove kao način obnavljanja.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Dodao/la si i { $maskedPhoneNumber } kao svoj telefonski broj za obnavljanje.
postAddTwoStepAuthentication-how-protects-link = Kako ovo štiti tvoj račun
postAddTwoStepAuthentication-how-protects-plaintext = Kako ovo štiti tvoj račun:
postChangeAccountRecovery-subject = Ključ za obnavljanje računa promijenjen
postChangeAccountRecovery-title = Promijenio/la si ključ za obnavljanje računa
postChangeAccountRecovery-body-part1 = Sada imaš novi ključ za obnavljanje računa. Tvoj prethodni ključ je izbrisan.
postChangeAccountRecovery-body-part2 = Spremi ovaj novi ključ na sigurno mjesto – trebat će ti za obnavljanje šifriranih podataka pregledavanja ako zaboraviš lozinku.
postChangeAccountRecovery-action = Upravljaj računom
postChangePrimary-subject = Primarna e-mail adresa aktualizirana
postChangePrimary-title = Nova primarna adresa e-pošte
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Uspješno si promijenio/la svoju primarnu e-mail adresu u { $email }. Ova je adresa sada tvoje korisničko ime za prijavu na tvoj { -product-mozilla-account }, kao i za primanje sigurnosnih obavijesti i potvrda prijava.
postChangePrimary-action = Upravljaj računom
postChangeRecoveryPhone-subject = Telefonski broj za obnavljanje je aktualiziran
postChangeRecoveryPhone-preview = Račun je zaštićen dvofaktorskom autentifikacijom
postChangeRecoveryPhone-title = Promijenio/la si telefonski broj za obnavljanje
postChangeRecoveryPhone-description = Sada imaš novi telefonski broj za obnavljanje. Tvoj prethodni telefonski broj je izbrisan.
postChangeRecoveryPhone-requested-device = Zatražio/la si to s uređaja:
postChangeTwoStepAuthentication-preview = Tvoj je račun zaštićen
postChangeTwoStepAuthentication-subject = Dvofaktorska autentifikacija je aktualizirana
postChangeTwoStepAuthentication-title = Dvofaktorska autentifikacija je aktualizirana
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Zatražio/la si to s:
postChangeTwoStepAuthentication-action = Upravljaj računom
postChangeTwoStepAuthentication-how-protects-link = Kako ovo štiti tvoj račun
postChangeTwoStepAuthentication-how-protects-plaintext = Kako ovo štiti tvoj račun:
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kod je korišten s uređaja:
postConsumeRecoveryCode-action = Upravljaj računom
postConsumeRecoveryCode-subject-v3 = Rezervni kod za autentifikaciju je korišten
postConsumeRecoveryCode-preview = Provjeri jesi li to bio/la ti
postNewRecoveryCodes-subject-2 = Stvoreni su novi kodovi autentifikacije za spremanje sigurnosnih kopija
postNewRecoveryCodes-title-2 = Stvorio/la si nove kodove autentifikacije za spremanje sigurnosnih kopija
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Stvoreni su:
postNewRecoveryCodes-action = Upravljaj računom
postRemoveAccountRecovery-subject-2 = Ključ za obnavljanje računa je izbrisan
postRemoveAccountRecovery-title-3 = Izbrisao/la si tvoj ključ za obnavljanje računa
postRemoveAccountRecovery-body-part1 = Tvoj ključ za obnavljanje računa je potreban za vraćanje šifriranih podataka pregledavanja ako zaboraviš lozinku.
postRemoveAccountRecovery-body-part2 = Ako već nisi, izradi novi ključ za obnavljanje računa u postavkama računa kako bi spriječio/la gubljenje spremljenih lozinki, zabilješki, povijesti pregledavanja i više.
postRemoveAccountRecovery-action = Upravljaj računom
postRemoveRecoveryPhone-subject = Telefonski broj za obnavljanje je uklonjen
postRemoveRecoveryPhone-preview = Račun je zaštićen dvofaktorskom autentifikacijom
postRemoveRecoveryPhone-title = Telefonski broj za obnavljanje je uklonjen
postRemoveRecoveryPhone-requested-device = Zatražio/la si to s uređaja:
postRemoveSecondary-subject = Sekundarna adresa e-pošte je uklonjena
postRemoveSecondary-title = Sekundarna adresa e-pošte je uklonjena
postRemoveSecondary-action = Upravljaj računom
postRemoveTwoStepAuthentication-subject-line-2 = Dvofaktorska autentifikacija je deaktivirana
postRemoveTwoStepAuthentication-title-2 = Deaktivirao/la si dvofaktorsku autentifikaciju
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Dektivirao/la si je s:
postRemoveTwoStepAuthentication-action = Upravljaj računom
postRemoveTwoStepAuthentication-not-required-2 = Više ne trebaš sigurnosne kodove od tvoje aplikacije za autentifikaciju kada se prijaviš.
postSigninRecoveryCode-preview = Potvrdi aktivnost računa
postSigninRecoveryCode-device = Prijavio/la si se s:
postSigninRecoveryCode-action = Upravljaj računom
postSigninRecoveryPhone-preview = Potvrdi aktivnost računa
postSigninRecoveryPhone-device = Prijavio/la si se s:
postSigninRecoveryPhone-action = Upravljaj računom
postVerify-sub-title-3 = Drago nam je što te vidimo!
postVerify-title-2 = Želiš vidjeti istu karticu na dva uređaja?
postVerify-description-2 = Ništa lakše od toga! Jednostavno instaliraj { -brand-firefox } na drugi uređaj i prijavi se za sinkronizaciju. To je poput magije!
postVerify-sub-description = (Psst … To također znači da možeš pristupiti tvojim zabilješkama, lozinkama i drugim { -brand-firefox } podacima gdje god si prijavljen/a.)
postVerify-subject-4 = Dobro došao, dobro došla u { -brand-mozilla }!
postVerify-setup-2 = Poveži jedan drugi uređaj:
postVerify-action-2 = Poveži jedan drugi uređaj
postVerifySecondary-subject = Dodana je sekundarna e-mail adresa
postVerifySecondary-title = Dodana je sekundarna e-mail adresa
postVerifySecondary-action = Upravljaj računom
recovery-subject = Resetiraj lozinku
recovery-title-2 = Zaboravio/la si lozinku?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Primili smo zahtjev za promjenu lozinke na tvom { -product-mozilla-account } od:
recovery-new-password-button = Stvori novu lozinku klikom na donji gumb. Ova će poveznica isteći za sat vremena.
recovery-action = Stvori novu lozinku
unblockCode-preview = Ovaj kod isteče za jedan sat
unblockCode-title = Je li ovo tvoja prijava?
unblockCode-prompt = Ako da, ovo je potrebni autorizacijski kôd:
unblockCode-report-plaintext = Ako ne, pomozi nam u sprječavanju neovlaštene prijave pomoću prijave problema.
verificationReminderFinal-subject = Posljednji podsjetnik za potvrđivanje tvog računa
confirm-account = Potvrdi račun
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Ne zaboravi potvrditi svoj račun
verificationReminderFirst-title-3 = Dobro došao, dobro došla u { -brand-mozilla }!
verificationReminderFirst-description-3 = Prije nekoliko dana si stvorio/la { -product-mozilla-account }, ali ga nikada nisi potvrdio/la. Potvrdi račun u sljedećih 15 dana ili će se račun automatski izbrisati.
confirm-email-2 = Potvrdi račun
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Potvrdi račun
verificationReminderSecond-subject-2 = Ne zaboravi potvrditi svoj račun
verificationReminderSecond-title-3 = Nemoj propustiti uslugu { -brand-mozilla }!
verificationReminderSecond-description-4 = Prije nekoliko dana si stvorio/la { -product-mozilla-account }, ali ga nikada nisi potvrdio/la. Potvrdi račun u sljedećih 10 dana ili će se račun automatski izbrisati.
verificationReminderSecond-sub-description-2 = Budi dio naše misije pretvaranja interneta u mjesto koje je otvoreno za sve.
verificationReminderSecond-action-2 = Potvrdi račun
verify-title-3 = Otvori internet s { -brand-mozilla }
verify-description-2 = Potvrdi svoj račun i izvuci maksimum iz { -brand-mozilla } gdje god se prijaviš počevši s:
verify-subject = Završi stvaranje računa
verify-action-2 = Potvrdi račun
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Ovaj kod isteče za { $expirationTime } minutu.
        [few] Ovaj kod isteče za { $expirationTime } minute.
       *[other] Ovaj kod isteče za { $expirationTime } minuta.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Jesi li se prijavio/la na { $clientName }?
verifyLogin-description-2 = Pomogni nam zaštiti tvoj račun potvrđivanjem da si se prijavio/la na:
verifyLogin-subject-2 = Potvrdi prijavu
verifyLogin-action = Potvrdi prijavu
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Koristi { $code } za prijavu
verifyLoginCode-preview = Ovaj kod isteče za 5 minuta.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Jesi li se prijavio/la na { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Pomogni nam zaštiti tvoj račun odobravanjem prijave na:
verifyLoginCode-prompt-3 = Ako da, ovdje je tvoj autorizacijski kod:
verifyLoginCode-expiry-notice = Isteče za 5 minuta.
verifyPrimary-title-2 = Potvrdi primarnu e-mail adresu
verifyPrimary-description = Zahtjev za izvršavanje promjene računa upućen je sa sljedećeg uređaja:
verifyPrimary-subject = Potvrdi primarnu e-mail adresu
verifyPrimary-action-2 = Potvrdi e-mail adresu
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Nakon potvrde, promjene računa poput dodavanja sekundarne e-mail adrese postat će moguće s ovog uređaja.
verifySecondaryCode-preview = Ovaj kod isteče za 5 minuta.
verifySecondaryCode-title-2 = Potvrdi sekundarnu e-mail adresu
verifySecondaryCode-action-2 = Potvrdi e-mail adresu
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Zahtjev za korištenje { $email } kao sekundarne e-mail adrese je podnesen sa sljedećeg { -product-mozilla-account }.
verifySecondaryCode-prompt-2 = Koristi ovaj potvrdni kod:
verifySecondaryCode-expiry-notice-2 = Isteče za 5 minuta. Nakon potvrde, ova će adresa početi primati sigurnosne obavijesti i potvrde.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Koristi { $code } za potvrđivanje tvog računa
verifyShortCode-preview-2 = Ovaj kod isteče za 5 minuta
verifyShortCode-title-3 = Otvori internet s { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Potvrdi svoj račun i izvuci maksimum iz { -brand-mozilla } gdje god se prijaviš počevši s:
verifyShortCode-prompt-3 = Koristi ovaj potvrdni kod:
verifyShortCode-expiry-notice = Isteče za 5 minuta.
