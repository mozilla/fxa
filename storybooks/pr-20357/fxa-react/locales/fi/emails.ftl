## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }n logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synkronoi laitteet">
body-devices-image = <img data-l10n-name="devices-image" alt="Laitteet">
fxa-privacy-url = { -brand-mozilla }n tietosuojakäytäntö
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } - tietosuojakäytäntö
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } -käyttöehdot
account-deletion-info-block-communications = Jos tilisi poistetaan, saat edelleen sähköposteja Mozilla Corporationilta ja Mozilla Foundationilta, ellet <a data-l10n-name="unsubscribeLink">pyydä tilauksen peruuttamista</a>.
account-deletion-info-block-support = Jos sinulla on kysyttävää tai tarvitset apua, ota rohkeasti yhteyttä <a data-l10n-name="supportLink">tukitiimiimme</a>.
account-deletion-info-block-communications-plaintext = Jos tilisi poistetaan, saat edelleen sähköposteja Mozilla Corporationilta ja Mozilla Foundationilta, ellet pyydä tilauksen peruuttamista:
account-deletion-info-block-support-plaintext = Jos sinulla on kysyttävää tai tarvitset apua, ota rohkeasti yhteyttä tukitiimiimme:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Lataa { $productName } { -google-play }sta">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Lataa { $productName } { -app-store }sta">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Asenna { $productName } <a data-l10n-name="anotherDeviceLink">toiselle työpöytälaitteelle</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Asenna { $productName } <a data-l10n-name="anotherDeviceLink">toiselle laitteelle</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Hanki { $productName } Google Playsta:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Lataa { $productName } App Storesta:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Asenna { $productName } toiselle laitteelle:
automated-email-change-2 = Jos et tehnyt tätä, <a data-l10n-name="passwordChangeLink">vaihda salasanasi</a> heti.
automated-email-support = Lisätietoja saat <a data-l10n-name="supportLink">{ -brand-mozilla }-tuesta</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Jos et tehnyt tätä, vaihda salasanasi heti:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Lisätietoja saat { -brand-mozilla }-tuesta:
automated-email-inactive-account = Tämä on automaattinen sähköposti. Saat sen, koska sinulla on { -product-mozilla-account } ja edellisestä kirjautumisestasi on kulunut kaksi vuotta.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Lisätietoja saat <a data-l10n-name="supportLink">{ -brand-mozilla }-tuesta</a>.
automated-email-no-action-plaintext = Tämä on automaattinen sähköposti. Jos sait sen vahingossa, sinun ei tarvitse tehdä mitään.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Tämä on automaattinen sähköpostiviesti; Jos et valtuuttanut tätä toimintoa, vaihda salasanasi:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Pyyntö lähetettiin selaimella { $uaBrowser } käyttöjärjestelmästä { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Pyyntö lähetettiin selaimesta { $uaBrowser } käyttöjärjestelmällä { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Pyyntö lähetettiin selaimesta { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Pyyntö lähetettiin käyttöjärjestelmästä { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Pyyntö lähetettiin käyttöjärjestelmästä { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Jos et ollut sinä, <a data-l10n-name="revokeAccountRecoveryLink">poista uusi avain</a> ja <a data-l10n-name="passwordChangeLink">vaihda salasanasi</a>.
automatedEmailRecoveryKey-change-pwd-only = Jos et ollut sinä, <a data-l10n-name="passwordChangeLink">vaihda salasanasi</a>.
automatedEmailRecoveryKey-more-info = Lisätietoja saat <a data-l10n-name="supportLink">{ -brand-mozilla }-tuesta</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Pyynnön lähde:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Jos et ollut sinä, poista uusi avain:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Jos et ollut sinä, vaihda salasanasi:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = ja vaihda salasanasi:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Lisätietoja saat { -brand-mozilla }-tuesta:
automated-email-reset =
    Tämä on automaattisesti lähetetty viesti. Jos et valtuuttanut tätä toimintoa, <a data-l10n-name="resetLink">vaihda salasanasi</a>.
    Lisätietoja saat <a data-l10n-name="supportLink">{ -brand-mozilla }n tuesta</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Jos et valtuuttanut tätä toimintoa, vaihda salasanasi nyt osoitteessa { $resetLink }
brand-banner-message = Tiesitkö, että { -product-firefox-accounts } nimettiin uudelleen, ja uusi nimi on { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Lisätietoja</a>
change-password-plaintext = Jos epäilet, että joku yrittää murtautua tilillesi, vaihda salasanasi.
manage-account = Hallinnoi tiliä
manage-account-plaintext = { manage-account }:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = Selain { $uaBrowser } käyttöjärjestelmällä { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = Selain { $uaBrowser } käyttöjärjestelmällä { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (arvio)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (arvio)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (arvio)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (arvio)
cadReminderFirst-subject-1 = Muistutus! Synkronoidaan { -brand-firefox }
cadReminderFirst-action = Synkronoi toinen laite
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Synkronointi vaatii kaksi
cadReminderFirst-description-v2 = Käytä välilehtiäsi kaikilla laitteillasi. Varmista pääsy kirjanmerkkeihin, salasanoihin ja muihin tietoihin kaikkialla, missä käytät { -brand-firefox }ia.
cadReminderSecond-subject-2 = Viimeistellään synkronoinnin määritys
cadReminderSecond-action = Synkronoi toinen laite
cadReminderSecond-title-2 = Älä unohda synkronoida!
cadReminderSecond-description-sync = Synkronoi kirjanmerkit, salasanat, avoimet välilehdet ja paljon muuta — missä tahansa käytät { -brand-firefox }ia.
cadReminderSecond-description-plus = Lisäksi tietosi ovat aina salattuja. Vain sinä ja hyväksymäsi laitteet näkevät tietosi.
inactiveAccountFinalWarning-subject = Viimeinen mahdollisuus säilyttää { -product-mozilla-account }
inactiveAccountFinalWarning-title = { -brand-mozilla }-tilisi ja tietosi poistetaan
inactiveAccountFinalWarning-preview = Kirjaudu sisään säilyttääksesi tilisi
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> tilisi ja henkilökohtaiset tietosi poistetaan pysyvästi, ellet kirjaudu sisään.
inactiveAccountFinalWarning-action = Kirjaudu sisään säilyttääksesi tilisi
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Kirjaudu sisään säilyttääksesi tilisi:
inactiveAccountFirstWarning-subject = Älä menetä tiliäsi
inactiveAccountFirstWarning-title = Haluatko säilyttää { -brand-mozilla }-tilisi ja tietosi?
inactiveAccountFirstWarning-inactive-status = Huomasimme, että et ole kirjautunut sisään kahteen vuoteen.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Tilisi ja henkilökohtaiset tietosi poistetaan pysyvästi <strong>{ $deletionDate }</strong>, koska et ole ollut aktiivinen.
inactiveAccountFirstWarning-action = Kirjaudu sisään säilyttääksesi tilisi
inactiveAccountFirstWarning-preview = Kirjaudu sisään säilyttääksesi tilisi
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Kirjaudu sisään säilyttääksesi tilisi:
inactiveAccountSecondWarning-subject = Toimenpiteitä vaaditaan: Tilin poistoon 7 päivää
inactiveAccountSecondWarning-title = { -brand-mozilla }-tilisi ja sen tiedot poistetaan 7 päivän kuluessa
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Tilisi ja henkilökohtaiset tietosi poistetaan pysyvästi <strong>{ $deletionDate }</strong>, koska et ole ollut aktiivinen.
inactiveAccountSecondWarning-action = Kirjaudu sisään säilyttääksesi tilisi
inactiveAccountSecondWarning-preview = Kirjaudu sisään säilyttääksesi tilisi
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Kirjaudu sisään säilyttääksesi tilisi:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Varatodennuskoodit ovat loppuneet!
codes-reminder-title-one = Käytät viimeistä varatodennuskoodiasi
codes-reminder-title-two = Aika luoda lisää varatodennuskoodeja
codes-reminder-description-part-one = Varatodennuskoodien avulla voit palauttaa tietosi, kun unohdat salasanasi.
codes-reminder-description-part-two = Luo uudet koodit nyt, jotta et menetä tietojasi myöhemmin.
codes-reminder-description-two-left = Sinulla on vain kaksi koodia jäljellä.
codes-reminder-description-create-codes = Luo uudet varatodennuskoodit, joiden avulla pääset takaisin tilillesi, jos se on lukittu tai salasana unohtunut.
lowRecoveryCodes-action-2 = Luo koodeja
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Varatodennuskoodeja ei ole jäljellä
        [one] Vain 1 varatodennuskoodi jäljellä
       *[other] Vain { $numberRemaining } varatodennuskoodia jäljellä!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Uusi kirjautuminen: { $clientName }
newDeviceLogin-subjectForMozillaAccount = Uusi kirjautuminen { -product-mozilla-account }llesi
newDeviceLogin-title-3 = { -product-mozilla-account }äsi käytettiin sisäänkirjautumiseen
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Etkö se ollut sinä? <a data-l10n-name="passwordChangeLink">Vaihda salasanasi</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Etkö se ollut sinä? Vaihda salasanasi:
newDeviceLogin-action = Hallinnoi tiliä
passwordChangeRequired-subject = Epäilyttävää toimintaa havaittu
passwordChangeRequired-preview = Vaihda salasanasi välittömästi
passwordChangeRequired-action = Nollaa salasana
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Salasana päivitetty
passwordChanged-title = Salasanan vaihtaminen onnistui
passwordChanged-description-2 = { -product-mozilla-account }si salasanasi vaihdettiin onnistuneesti seuraavalta laitteelta:
password-forgot-otp-preview = Tämä koodi vanhenee 10 minuutissa
password-forgot-otp-title = Unohditko salasanasi?
password-forgot-otp-request = Saimme { -product-mozilla-account }n salasanan vaihtopyynnön lähteestä:
password-forgot-otp-code-2 = Jos se olit sinä, tässä on vahvistuskoodi jatkaaksesi:
password-forgot-otp-expiry-notice = Tämä koodi vanhenee 10 minuutissa.
passwordReset-subject-2 = Salasanasi on nollattu
passwordReset-title-2 = Salasanasi on nollattu
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Nollasit { -product-mozilla-account }-salasanasi:
passwordResetAccountRecovery-subject-2 = Salasanasi on nollattu
passwordResetAccountRecovery-title-3 = Salasanasi on nollattu
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Käytit tilin palautusavainta { -product-mozilla-account }-salasanan nollaamiseen:
passwordResetAccountRecovery-information = Kirjasimme sinut ulos kaikista synkronoiduista laitteistasi. Loimme uuden tilin palautusavaimen korvaamaan käyttämäsi. Voit vaihtaa sen tilisi asetuksista.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Kirjasimme sinut ulos kaikista synkronoiduista laitteistasi. Loimme uuden tilin palautusavaimen korvaamaan käyttämäsi. Voit vaihtaa sen tilisi asetuksista:
passwordResetAccountRecovery-action-4 = Hallinnoi tiliä
passwordResetRecoveryPhone-action = Hallinnoi tiliä
passwordResetWithRecoveryKeyPrompt-subject = Salasanasi on nollattu
passwordResetWithRecoveryKeyPrompt-title = Salasanasi on nollattu
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Nollasit { -product-mozilla-account }-salasanasi:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Luo tilin palautusavain
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Luo tilin palautusavain:
passwordResetWithRecoveryKeyPrompt-cta-description = Sinun on kirjauduttava uudelleen sisään kaikilla synkronoiduilla laitteillasi. Pidä tietosi turvassa seuraavan kerran tilin palautusavaimella. Sen avulla voit palauttaa tietosi, jos unohdat salasanasi.
postAddAccountRecovery-subject-3 = Uusi tilin palautusavain luotu
postAddAccountRecovery-title2 = Loit uuden tilin palautusavaimen
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Tallenna tämä avain turvalliseen paikkaan – tarvitset sitä salattujen selaustietojesi palauttamiseen, jos unohdat salasanasi.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Tätä avainta on mahdollista käyttää vain kerran. Kun olet käyttänyt sen, luomme sinulle automaattisesti uuden avaimen. Tai voit luoda uuden avaimen milloin tahansa tilisi asetuksista.
postAddAccountRecovery-action = Hallinnoi tiliä
postAddLinkedAccount-subject-2 = Uusi tili yhdistetty { -product-mozilla-account }isi
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName }-tilisi on linkitetty { -product-mozilla-account }in
postAddLinkedAccount-action = Hallinnoi tiliä
postAddRecoveryPhone-subject = Palauttamisen puhelinnumero lisätty
postAddRecoveryPhone-preview = Tili suojattu kaksivaiheisella todennuksella
postAddRecoveryPhone-title-v2 = Lisäsit palauttamisen puhelinnumeron
postAddRecoveryPhone-action = Hallinnoi tiliä
postAddTwoStepAuthentication-preview = Tilisi on suojattu
postAddTwoStepAuthentication-subject-v3 = Kaksivaiheinen todennus on käytössä
postAddTwoStepAuthentication-title-2 = Otit kaksivaiheisen todennuksen käyttöön
postAddTwoStepAuthentication-action = Hallinnoi tiliä
postChangeAccountRecovery-subject = Tilin palautusavain vaihdettu
postChangeAccountRecovery-title = Vaihdoit tilisi palautusavaimen
postChangeAccountRecovery-body-part1 = Sinulla on nyt uusi tilin palautusavain. Edellinen avaimesi poistettiin.
postChangeAccountRecovery-body-part2 = Tallenna tämä uusi avain turvalliseen paikkaan – tarvitset sitä salattujen selaustietojesi palauttamiseen, jos unohdat salasanasi.
postChangeAccountRecovery-action = Hallitse tiliä
postChangePrimary-subject = Ensisijainen sähköpostiosoite päivitetty
postChangePrimary-title = Uusi ensisijainen sähköposti
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Olet vaihtanut ensisijaiseksi sähköpostiosoitteeksi { $email }. Tämä osoite on nyt käyttäjätunnuksesi { -product-mozilla-account }lle kirjautuessasi sekä osoite, johon tietoturvailmoitukset ja kirjautumisvahvistukset lähetetään.
postChangePrimary-action = Hallinnoi tiliä
postChangeRecoveryPhone-subject = Palauttamisen puhelinnumero päivitetty
postChangeRecoveryPhone-preview = Tili suojattu kaksivaiheisella todennuksella
postChangeRecoveryPhone-title = Vaihdoit palauttamisen puhelinnumerosi
postChangeRecoveryPhone-description = Sinulla on nyt uusi palautuspuhelinnumero. Edellinen puhelinnumerosi on poistettu.
postChangeTwoStepAuthentication-preview = Tilisi on suojattu
postChangeTwoStepAuthentication-subject = Kaksivaiheinen todennus päivitetty
postChangeTwoStepAuthentication-title = Kaksivaiheinen todennus on päivitetty
postChangeTwoStepAuthentication-action = Hallinnoi tiliä
postConsumeRecoveryCode-action = Hallinnoi tiliä
postNewRecoveryCodes-subject-2 = Uudet varatodennuskoodit luotu
postNewRecoveryCodes-title-2 = Loit uudet varatodennuskoodit
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Ne luotiin käyttäen:
postNewRecoveryCodes-action = Hallinnoi tiliä
postRemoveAccountRecovery-subject-2 = Tilin palautusavain poistettu
postRemoveAccountRecovery-title-3 = Poistit tilisi palautusavaimen
postRemoveAccountRecovery-body-part1 = Tilisi palautusavainta tarvitaan salattujen selaustietojesi palauttamiseen, jos unohdat salasanasi.
postRemoveAccountRecovery-body-part2 = Jos et vielä ole, niin luo uusi tilin palautusavain tilisi asetuksissa, jotta et menetä tallennettuja salasanojasi, kirjanmerkkejäsi, selaushistoriaasi ja paljon muuta.
postRemoveAccountRecovery-action = Hallinnoi tiliä
postRemoveRecoveryPhone-subject = Palauttamisen puhelinnumero poistettu
postRemoveRecoveryPhone-preview = Tili suojattu kaksivaiheisella todennuksella
postRemoveRecoveryPhone-title = Palauttamisen puhelinnumero poistettu
postRemoveSecondary-subject = Toissijainen sähköposti poistettiin
postRemoveSecondary-title = Toissijainen sähköposti poistettiin
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Olet poistanut toissijaisen sähköpostiosoitteen { $secondaryEmail } { -product-mozilla-account }ltäsi. Tietoturvailmoituksia ja kirjautumisvahvistuksia ei enää lähetetä tähän osoitteeseen.
postRemoveSecondary-action = Hallinnoi tiliä
postRemoveTwoStepAuthentication-subject-line-2 = Kaksivaiheinen todennus poistettu käytöstä
postRemoveTwoStepAuthentication-title-2 = Poistit kaksivaiheisen todennuksen käytöstä
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Poistit sen käytöstä käyttäen:
postRemoveTwoStepAuthentication-action = Hallinnoi tiliä
postRemoveTwoStepAuthentication-not-required-2 = Et tarvitse enää kertakäyttökoodeja todennussovelluksestasi kirjautuessasi sisään.
postSigninRecoveryCode-preview = Vahvista tilin toiminta
postSigninRecoveryCode-title = Varatodennuskoodiasi käytettiin kirjautumiseen
postSigninRecoveryCode-description = Jos se et ollut sinä, sinun tulee vaihtaa salasanasi välittömästi, jotta tilisi pysyy turvassa.
postSigninRecoveryCode-action = Hallinnoi tiliä
postSigninRecoveryPhone-preview = Vahvista tilin toiminta
postSigninRecoveryPhone-description = Jos se et ollut sinä, sinun tulee vaihtaa salasanasi välittömästi, jotta tilisi pysyy turvassa.
postSigninRecoveryPhone-action = Hallinnoi tiliä
postVerify-sub-title-3 = Mukava nähdä sinua!
postVerify-title-2 = Haluatko nähdä saman välilehden kahdessa laitteessa?
postVerify-description-2 = Se on helppoa! Asenna { -brand-firefox } toiseen laitteeseen ja kirjaudu sisään synkronointia varten. Se on kuin taikuutta!
postVerify-sub-description = (Psst… Se tarkoittaa myös, että saat kirjanmerkkisi, salasanasi ja muut { -brand-firefox }in tiedot kaikkialle, mihin olet kirjautunut sisään.)
postVerify-subject-4 = Tervetuloa { -brand-mozilla }an!
postVerify-setup-2 = Yhdistä toinen laite:
postVerify-action-2 = Yhdistä toinen laite
postVerifySecondary-subject = Toissijainen sähköpostiosoite lisätty
postVerifySecondary-title = Toissijainen sähköpostiosoite lisätty
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Olet vahvistanut osoitteen { $secondaryEmail } toissijaiseksi sähköpostiosoitteeksi { -product-mozilla-account }llesi. Tietoturvailmoitukset ja kirjautumisvahvistukset lähetetään nyt molempiin sähköpostiosoitteisiin.
postVerifySecondary-action = Hallinnoi tiliä
recovery-subject = Nollaa salasanasi
recovery-title-2 = Unohditko salasanasi?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Saimme { -product-mozilla-account }n salasanan vaihtopyynnön lähteestä:
recovery-new-password-button = Luo uusi salasana napsauttamalla alla olevaa painiketta. Tämä linkki vanhenee seuraavan tunnin sisällä.
recovery-copy-paste = Luo uusi salasana kopioimalla ja liittämällä alla oleva URL-osoite selaimeesi. Tämä linkki vanhenee seuraavan tunnin sisällä.
recovery-action = Luo uusi salasana
unblockCode-preview = Tämä koodi vanhenee tunnin kuluttua
unblockCode-title = Kirjaudutko sinä sisään?
unblockCode-prompt = Jos kirjaudut, tässä on tarvitsemasi valtuuskoodi:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Jos kyllä, tässä on tarvitsemasi valtuuskoodi: { $unblockCode }
unblockCode-report = Jos et, auta meitä torjumaan tunkeutujia ja <a data-l10n-name="reportSignInLink">ilmoita asiasta meille</a>.
unblockCode-report-plaintext = Jos et, auta meitä torjumaan tunkeutujia ja ilmoita asiasta meille.
verificationReminderFinal-subject = Viimeinen muistutus tilisi vahvistamisesta
verificationReminderFinal-description-2 = Loit pari viikkoa sitten { -product-mozilla-account }n, mutta et vahvistanut sitä. Turvallisuutesi vuoksi poistamme tilin, jos et vahvista sitä seuraavan 24 tunnin kuluessa.
confirm-account = Vahvista tili
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Muista vahvistaa tilisi
verificationReminderFirst-title-3 = Tervetuloa { -brand-mozilla }an!
verificationReminderFirst-description-3 = Loit muutama päivä sitten { -product-mozilla-account }n, mutta et vahvistanut sitä. Vahvista tilisi seuraavan 15 päivän kuluessa tai se poistetaan automaattisesti.
verificationReminderFirst-sub-description-3 = Älä jää paitsi selaimesta, joka asettaa sinut ja yksityisyytesi etusijalle.
confirm-email-2 = Vahvista tili
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Vahvista tili
verificationReminderSecond-subject-2 = Muista vahvistaa tilisi
verificationReminderSecond-title-3 = Älä jää paitsi { -brand-mozilla }sta!
verificationReminderSecond-description-4 = Loit muutama päivä sitten { -product-mozilla-account }n, mutta et vahvistanut sitä. Vahvista tilisi seuraavan 10 päivän kuluessa tai se poistetaan automaattisesti.
verificationReminderSecond-second-description-3 = { -product-mozilla-account }si avulla voit synkronoida { -brand-firefox }-kokemuksesi eri laitteiden välillä. Lisäksi se avaa pääsyn muihin yksityisyyttä suojaaviin { -brand-mozilla }-tuotteisiin.
verificationReminderSecond-sub-description-2 = Ole osa tehtäväämme muuttaa internet kaikille avoimeksi paikaksi.
verificationReminderSecond-action-2 = Vahvista tili
verify-title-3 = Avaa Internet { -brand-mozilla }lla
verify-description-2 = Vahvista tilisi ja ota kaikki hyöty irti { -brand-mozilla }sta kaikkialla missä kirjaudut sisään, aloittaen tästä:
verify-subject = Viimeistele tilisi luominen
verify-action-2 = Vahvista tili
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Tämä koodi vanhenee { $expirationTime } minuutin kuluttua.
       *[other] Tämä koodi vanhenee { $expirationTime } minuutin kuluttua.
    }
verifyAccountChange-title = Oletko muuttamassa tilitietojasi?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Auta meitä pitämään tilisi turvassa hyväksymällä tämä muutos:
verifyAccountChange-prompt = Jos kyllä, tässä on valtuutuskoodisi:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Se vanhenee { $expirationTime } minuutin kuluttua.
       *[other] Se vanhenee { $expirationTime } minuutin kuluttua.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Kirjauduitko { $clientName }iin?
verifyLogin-description-2 = Auta meitä pitämään tilisi turvassa vahvistamalla, että kirjauduit sisään:
verifyLogin-subject-2 = Vahvista sisäänkirjautuminen
verifyLogin-action = Vahvista kirjautuminen
verifyLoginCode-preview = Tämä koodi vanhenee viidessä minuutissa.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Kirjauduitko palveluun { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Auta meitä pitämään tilisi turvassa vahvistamalla, että kirjauduit sisään:
verifyLoginCode-prompt-3 = Jos kyllä, tässä on valtuutuskoodisi:
verifyLoginCode-expiry-notice = Se vanhenee viidessä minuutissa.
verifyPrimary-title-2 = Vahvista ensisijainen sähköpostiosoite
verifyPrimary-description = Tilin muutospyyntö on tehty laitteella:
verifyPrimary-subject = Vahvista ensisijainen sähköpostiosoite
verifyPrimary-action-2 = Vahvista sähköposti
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Vahvistuksen jälkeen tilimuutokset, kuten toissijaisen sähköpostiosoitteen lisääminen, ovat mahdollisia tällä laitteella.
verifySecondaryCode-preview = Tämä koodi vanhenee viidessä minuutissa.
verifySecondaryCode-title-2 = Vahvista toissijainen sähköpostiosoite
verifySecondaryCode-action-2 = Vahvista sähköposti
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Pyyntö käyttää osoitetta { $email } toissijaisena sähköpostina on tehty seuraavalta { -product-mozilla-account }ltä:
verifySecondaryCode-prompt-2 = Käytä tätä vahvistuskoodia:
verifySecondaryCode-expiry-notice-2 = Se vanhenee 5 minuutissa. Vahvistamisen jälkeen tämä osoite alkaa vastaanottamaan turvallisuusilmoituksia ja -vahvistuksia.
verifyShortCode-preview-2 = Tämä koodi vanhenee viidessä minuutissa
verifyShortCode-title-3 = Avaa Internet { -brand-mozilla }lla
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Vahvista tilisi ja ota kaikki hyöty irti { -brand-mozilla }sta kaikkialla missä kirjaudut sisään, aloittaen tästä:
verifyShortCode-prompt-3 = Käytä tätä vahvistuskoodia:
verifyShortCode-expiry-notice = Se vanhenee viidessä minuutissa.
