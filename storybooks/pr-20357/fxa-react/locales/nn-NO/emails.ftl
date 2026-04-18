## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }-logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synkroniser einingar">3
body-devices-image = <img data-l10n-name="devices-image" alt="Einingar">
fxa-privacy-url = { -brand-mozilla } personvernpraksis
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } personvernfråsegn
moz-accounts-terms-url = Tenestevilkår for { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Dersom kontoen din vert sletta, vil du framleis få e-postar frå Mozilla Corporation og Mozilla Foundation, med mindre du <a data-l10n-name="unsubscribeLink">ber om å avslutte abonnementet</a>.
account-deletion-info-block-support = Dersom du har spørsmål eller treng hjelp, kan du gjerne kontakte <a data-l10n-name="supportLink">støtteteamet</a> vårt.
account-deletion-info-block-communications-plaintext = Dersom kontoen din vert sletta, vil du framleis få e-postar frå Mozilla Corporation og Mozilla Foundation, med mindre du ber om å avslutte abonnementet:
account-deletion-info-block-support-plaintext = Om du har spørsmål, eller treng hjelp, er det berre å kontakte brukarstøtteteamet vårt:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Last ned { $productName } i { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Last ned { $productName }  i { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installer { $productName } på <a data-l10n-name="anotherDeviceLink">ei anna datamaskin</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installer { $productName } på <a data-l10n-name="anotherDeviceLink">ei anna eining</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Last ned { $productName } frå Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Last ned { $productName } frå App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installer { $productName } på ei anna eining:
automated-email-change-2 = Om du ikkje gjorde denne handlinga, <a data-l10n-name="passwordChangeLink">endre passordet ditt</a> med ein gong.
automated-email-support = Gå til <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a> for meir informasjon.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Om du ikkje gjorde denne handlinga, endre passordet ditt med ein gong:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Gå til { -brand-mozilla } brukarstøtte for meir informasjon:
automated-email-inactive-account = Dette er ein automatisert e-post. Du får han fordi du har ein { -product-mozilla-account } og det har gått 2 år sidan sist pålogging.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Gå til <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a> for meir informasjon.
automated-email-no-action-plaintext = Denne e-posten vart sendt automatisk. Om du fekk den ved ein feil, treng du ikkje gjere noko.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Denne e-posten vart sendt automatisk; om du ikkje godkjende denne handlinga, må du endre passordet ditt:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Denne førespurnaden kom frå { $uaBrowser } på { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Denne førespurnaden kom frå { $uaBrowser } på { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Denne førespurnaden kom frå { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Denne førespurnaden kom frå { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Denne førespurnaden kom frå { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Viss dette ikkje var deg, <a data-l10n-name="revokeAccountRecoveryLink">slett den nye nøkkelen</a> og <a data-l10n-name="passwordChangeLink">endre passordet ditt</a>.
automatedEmailRecoveryKey-change-pwd-only = Viss dette ikkje var deg, <a data-l10n-name="passwordChangeLink">endre passordet ditt</a>.
automatedEmailRecoveryKey-more-info = Gå til <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a> for meir informasjon.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Denne førspurnaden kom frå:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Viss dette ikkje var deg, slett den nye nøkkelen:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Viss dette ikkje var deg, endre passordet ditt:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = og endre passordet ditt:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Gå til { -brand-mozilla } brukarstøtte for meir informasjon:
automated-email-reset =
    Denne e-posten vart sendt automatisk; om du ikkje godkjende denne handlinga, <a data-l10n-name="resetLink">må du tilbakestille passordet ditt</a>.
    Gå til <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a> for meir informasjon.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Om du ikkje godkjende denne handlinga, må du stille tilbake passordet ditt no på { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Om du ikkje utførte dette, må du <a data-l10n-name="resetLink">tilbakestille passordet ditt</a> og <a data-l10n-name="twoFactorSettingsLink">tilbakestille tostegs-autentisering</a> med ein gong.
    
    For meir informasjon, besøk <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Om du ikkje utførte dette, kan du tilbakestille passordet ditt med ein gong på:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Tilbakestill også tostegs-autentisering på:
brand-banner-message = Visste du at vi endra namnet vårt frå { -product-firefox-accounts } til { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Les meir</a>
change-password-plaintext = Om du mistenkjer at nokon prøver å få tilgang til kontoen din, må du endre passordet ditt.
manage-account = Handsam kontoen
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Gå til <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a> for meir informasjon.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = For meir informasjon, gå til { -brand-mozilla } brukarstøtte: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } på { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } på { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (estimert)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (estimert)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (estimert)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (estimert)
cadReminderFirst-subject-1 = Påminning! Byrje å synkronisere { -brand-firefox }
cadReminderFirst-action = Synkroniser ei anna eining
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Det må to til for å synkronisere
cadReminderFirst-description-v2 = Sjå fanene dine på alle einingane dine. Få tilgang til bokmerka, passorda og andre data overalt der du brukar { -brand-firefox }.
cadReminderSecond-subject-2 = Ikkje gå glipp av det! La oss fullføre synkroniseringsoppsettet
cadReminderSecond-action = Synkroniser ei anna eining
cadReminderSecond-title-2 = Ikkje gløym å synkronisere!
cadReminderSecond-description-sync = Synkroniser bokmerka dine, passord, opene faner og meir — overalt der du brukar { -brand-firefox }.
cadReminderSecond-description-plus = I tillegg er dataa dine alltid krypterte. Berre du og eininga du godkjenner kan sjå dei.
inactiveAccountFinalWarning-subject = Siste sjansje til å behalde { -product-mozilla-account }en din
inactiveAccountFinalWarning-title = { -brand-mozilla }-kontoen din og data vil bli sletta
inactiveAccountFinalWarning-preview = Logg inn for å behalde kontoen din
inactiveAccountFinalWarning-account-description = { -product-mozilla-account }en din vert brukt til å få tilgang til gratis personvern- og surfeprodukt som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = På <strong>{ $deletionDate }</strong> vil kontoen din og dei personlege dataa dsine bli sletta permanent med mindre du loggar inn.
inactiveAccountFinalWarning-action = Logg inn for å behalde kontoen din
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Logg inn for å behalde kontoen din:
inactiveAccountFirstWarning-subject = Ikkje mist kontoen din
inactiveAccountFirstWarning-title = Vil du behalde { -brand-mozilla }-kontoen og dataa dine?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account }en din vert brukt til å få tilgang til gratis personvern- og surfeprodukt som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Vi la merke til at du ikkje har logga på på 2 år.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Kontoen din og dei personlege dataa dine blir permanent sletta <strong>{ $deletionDate }</strong> fordi du ikkje har vore aktiv.
inactiveAccountFirstWarning-action = Logg inn for å behalde kontoen din
inactiveAccountFirstWarning-preview = Logg inn for å behalde kontoen din
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Logg inn for å behalde kontoen din:
inactiveAccountSecondWarning-subject = Handling påkravd: Sletting av kontoen om 7 dagar
inactiveAccountSecondWarning-title = { -brand-mozilla }-kontoen din og data vil bli sletta om 7 dagar
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account }en din vert brukt til å få tilgang til gratis personvern- og surfeprodukt som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Kontoen din og dei personlege dataa dine blir permanent sletta <strong>{ $deletionDate }</strong> fordi du ikkje har vore aktiv.
inactiveAccountSecondWarning-action = Logg inn for å behalde kontoen din
inactiveAccountSecondWarning-preview = Logg inn for å behalde kontoen din
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Logg inn for å behalde kontoen din:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Du er tom for reserve-autentiseringskodar!
codes-reminder-title-one = Du har kun éin reserve-autentiseringskode att
codes-reminder-title-two = På tide å lage fleire reserve-autentiseringskodar
codes-reminder-description-part-one = Reserve-autentiseringskodar hjelper deg med å gjenopprette informasjonen din når du gløymer passordet ditt.
codes-reminder-description-part-two = Opprett nye kodar no, slik at du ikkje mistar dataa dine seinare.
codes-reminder-description-two-left = Du har berre to kodar att.
codes-reminder-description-create-codes = Opprett nye reserve-autentiseringskodar for å hjelpe deg med å få tilgang til kontoen din dersom du vert låst ute.
lowRecoveryCodes-action-2 = Lag kodar
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Ingen reserve-autentiseringskodar att
        [one] Berre 1 reserve-autentiseringskode att
       *[other] Berre { $numberRemaining } reserve-autentiseringskodar att!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Ny inloggning på { $clientName }
newDeviceLogin-subjectForMozillaAccount = Ny innlogging på { -product-mozilla-account }-en din.
newDeviceLogin-title-3 = { -product-mozilla-account }en din vart brukt til å logge inn
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Ikkje deg? <a data-l10n-name="passwordChangeLink">Endre passordet ditt</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Ikkje deg? Endre passordet ditt:
newDeviceLogin-action = Handsam kontoen
passwordChangeRequired-subject = Mistenkt aktivitet oppdaga
passwordChangeRequired-preview = Endre passordet ditt med ein gong
passwordChangeRequired-title-2 = Tilbakestill passordet ditt
passwordChangeRequired-suspicious-activity-3 = Vi låste kontoen din for å verne han mot mistenkeleg aktivitet. Du er logga av alle einingane dine, og alle synkroniserte data er sletta som ein forholdsregel.
passwordChangeRequired-sign-in-3 = For å logge på kontoen din igjen, treng du berre å tilbakestille passordet ditt.
passwordChangeRequired-different-password-2 = <b>Viktig:</b> Vel eit sterkt passord som er ulikt frå eit du har brukt tidlegare.
passwordChangeRequired-different-password-plaintext-2 = Viktig: Vel eit sterkt passord som er ulikt frå eit du har brukt tidlegare.
passwordChangeRequired-action = Tilbakestill passordet
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Passord oppdatert
passwordChanged-title = Passordet er endra
passwordChanged-description-2 = Passordet til { -product-mozilla-account }-en din vart endra frå følgjande eining:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Bruk { $code } for å endre passordet ditt
password-forgot-otp-preview = Denne koden går ut om 10 minutt
password-forgot-otp-title = Gløymt passordet ditt?
password-forgot-otp-request = Vi fekk ein førespurnad om passordendring på { -product-mozilla-account }en din frå:
password-forgot-otp-code-2 = Viss dette var deg, her er stadfestingskoden for å halde fram:
password-forgot-otp-expiry-notice = Denne koden går ut om 10 minutt.
passwordReset-subject-2 = Passordet ditt er tilbakestilt
passwordReset-title-2 = Passordet ditt er tilbakestilt
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Du tilbakestiller passordet for { -product-mozilla-account } på:
passwordResetAccountRecovery-subject-2 = Passordet ditt er tilbakestilt
passwordResetAccountRecovery-title-3 = Passordet ditt er tilbakestilt
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Du brukte nøkkelen for kontogjenoppretting til å tilbakestille passordet for { -product-mozilla-account } på:
passwordResetAccountRecovery-information = Vi logga deg ut frå alle dei synkroniserte einingane dine. Vi oppretta ein ny kontogjenopprettingsnøkkel for å erstatte den du brukte. Du kan endre det i kontoinnstillingane.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Vi logga deg ut frå alle synkroniserte einingar. Vi oppretta ein ny kontogjenopprettingsnøkkel for å erstatte den du brukte. Du kan endre det i kontoinnstillingane dine:
passwordResetAccountRecovery-action-4 = Handsam kontoen
passwordResetRecoveryPhone-subject = Gjenopprettingstelefon brukt
passwordResetRecoveryPhone-preview = Kontroller at dette var deg
passwordResetRecoveryPhone-title = Telefonnummeret ditt for gjenopprettingvart brukt til å stadfeste tilbakestilling av passord
passwordResetRecoveryPhone-device = Gjenopprettingstelefon brukt frå:
passwordResetRecoveryPhone-action = Handsam kontoen
passwordResetWithRecoveryKeyPrompt-subject = Passordet ditt er tilbakestilt
passwordResetWithRecoveryKeyPrompt-title = Passordet ditt er tilbakestilt
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Du tilbakestiller passordet for { -product-mozilla-account } på:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Opprett kontogjenopprettingsnøkkel
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Opprett kontogjenopprettingsnøkkel:
passwordResetWithRecoveryKeyPrompt-cta-description = Du må logge inn igjen på alle dei synkroniserte einingane dine. Hald dataa dine trygge neste gong med ein kontogjenopprettingsnøkkel . Dette gjer at du kan stille tilbake dataa dine om du gløymer eit passord.
postAddAccountRecovery-subject-3 = Ny kontogjenopprettingsnøkkel oppretta
postAddAccountRecovery-title2 = Du oppretta ein ny kontogjenopprettingsnøkkel
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Lagre denne nøkkelen på ein trygg stad — du treng han for å gjenopprette dei krypterte nettlesardataa dine viss du gløymer passordet ditt.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Denne nøkkelen kan berre brukast éin gong. Etter at du har brukt han, opprettar vi automatisk ein ny for deg. Eller du kan opprette ein ny når som helst frå kontoinnstillingane dine.
postAddAccountRecovery-action = Handsam kontoen
postAddLinkedAccount-subject-2 = Ny konto knytt til { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName }-kontoen din er kopla til { -product-mozilla-account }-en din
postAddLinkedAccount-action = Handsam kontoen
postAddRecoveryPhone-subject = Gjenopprettingstelefon lagt til
postAddRecoveryPhone-preview = Kontoen er verna av tostegs-autentisering
postAddRecoveryPhone-title-v2 = Du la til eit gjenoprettingstelefonnummer
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Du la til { $maskedLastFourPhoneNumber } som gjenopprettingstelefonnummer
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Korleis dette vernar kontoen din
postAddRecoveryPhone-how-protect-plaintext = Korleis dette vernar kontoen din:
postAddRecoveryPhone-enabled-device = Du har aktivert det frå:
postAddRecoveryPhone-action = Handsam kontoen
postAddTwoStepAuthentication-preview = Kontoen din er beskytta
postAddTwoStepAuthentication-subject-v3 = Tostegs-autentisering er på
postAddTwoStepAuthentication-title-2 = Du slo på tostegs-autentisering
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Du ba om dette frå:
postAddTwoStepAuthentication-action = Handsam kontoen
postAddTwoStepAuthentication-code-required-v4 = Tryggingskodar frå autentiseringsappen din er påkravd no kvar gong du loggar på.
postAddTwoStepAuthentication-recovery-method-codes = Du har òg lagt til reserve-autentiseringskode som gjenopprettingsmetode.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Du la òg til { $maskedPhoneNumber } som telefonnummer for gjenoppretting.
postAddTwoStepAuthentication-how-protects-link = Korleis dette vernar kontoen din
postAddTwoStepAuthentication-how-protects-plaintext = Korleis dette vernar kontoen din:
postAddTwoStepAuthentication-device-sign-out-message = For å verne alle tilkopla einingar bør du logge ut overalt der du brukar denne kontoen, og deretter logge inn igjen med tostegs-autentisering.
postChangeAccountRecovery-subject = Kontogjenopprettingsnøkkel endra
postChangeAccountRecovery-title = Du endra kontogjenopprettingsnøkkelen
postChangeAccountRecovery-body-part1 = Du har no ein ny kontogjenopprettingsnøkkel. Den førre nøkkelen din vart sletta.
postChangeAccountRecovery-body-part2 = Lagre denne nye nøkkelen på ein trygg stad — du treng han for å gjenopprette dei krypterte nettlesardataa dine viss du gløymer passordet ditt.
postChangeAccountRecovery-action = Handsam kontoen
postChangePrimary-subject = Primær e-postadresse oppdatert
postChangePrimary-title = Ny primær e-postadresse
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Du har endra den primære e-postadressa di til { $email }. Denne adressa nyttar du som brukarnamn for å logge inn på { -product-mozilla-account }-en din, i tillegg til å ta imot sikkerheitsvarsel og stadfestingar på innloggingar.
postChangePrimary-action = Handsam kontoen
postChangeRecoveryPhone-subject = Gjenopprettingstelefon oppdatert
postChangeRecoveryPhone-preview = Kontoen er verna av tostegs-autentisering
postChangeRecoveryPhone-title = Du endra gjenopprettingstelefon
postChangeRecoveryPhone-description = Du har no ein ny gjenopprettingstelefon. Det førre telefon-nummeret ditt vart sletta.
postChangeRecoveryPhone-requested-device = Du ba om det frå:
postChangeTwoStepAuthentication-preview = Kontoen din er beskytta
postChangeTwoStepAuthentication-subject = Tostegs-autentisering, oppdatert
postChangeTwoStepAuthentication-title = Tostegs-autentisering er oppdatert
postChangeTwoStepAuthentication-use-new-account = Du må nå bruke den nye { -product-mozilla-account }-oppføringa i autentiseringsappen din. Den eldre vil ikkje lenger fungere, og du kan fjerne han.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Du ba om dette frå:
postChangeTwoStepAuthentication-action = Handsam kontoen
postChangeTwoStepAuthentication-how-protects-link = Korleis dette vernar kontoen din
postChangeTwoStepAuthentication-how-protects-plaintext = Korleis dette vernar kontoen din:
postChangeTwoStepAuthentication-device-sign-out-message = For å verne alle tilkopla einingar bør du logge ut overalt der du brukar denne kontoen, og deretter logge inn igjen med den nye tostegs-autentiseringa di.
postConsumeRecoveryCode-title-3 = Reserve-autentiseringskoden din vart brukt til å stadfeste tilbakestilling av passord
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kode brukt frå:
postConsumeRecoveryCode-action = Handsam kontoen
postConsumeRecoveryCode-subject-v3 = Reserve-autentiseringskode brukt
postConsumeRecoveryCode-preview = Kontroller at dette var deg
postNewRecoveryCodes-subject-2 = Nye reserve-autentiseringskodar oppretta
postNewRecoveryCodes-title-2 = Du oppretta nye reserve-autentiseringskodar
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Dei vart oppretta på:
postNewRecoveryCodes-action = Handsam kontoen
postRemoveAccountRecovery-subject-2 = Konto-gjenopprettingsnøkkel sletta
postRemoveAccountRecovery-title-3 = Du sletta kontogjenopprettingsnøkkelen din
postRemoveAccountRecovery-body-part1 = Kontogjenopprettingsnøkkelen din er påkravd for å gjenopprette dei krypterte nettlesardataa dine viss du gløymer passordet ditt.
postRemoveAccountRecovery-body-part2 = Viss du ikkje allereie har gjort det, kan du opprette ein ny kontogjenopprettingsnøkkel i kontoinnstillingane dine for å hindre at du mistar lagra passord, bokmerke, nettlesarhistorikk, og meir.
postRemoveAccountRecovery-action = Handsam kontoen
postRemoveRecoveryPhone-subject = Gjenopprettingstelefon fjerna
postRemoveRecoveryPhone-preview = Kontoen er verna av tostegs-autentisering
postRemoveRecoveryPhone-title = Gjenopprettingstelefon fjerna
postRemoveRecoveryPhone-description-v2 = Gjenopprettingstelefonen din er fjerna frå innstillingane dine for tostegs-autentisering.
postRemoveRecoveryPhone-description-extra = Du kan framleis bruke reserve-autentiseringskodar for å logge inn om du ikkje kan bruke autentiseringsappen din.
postRemoveRecoveryPhone-requested-device = Du ba om det frå:
postRemoveSecondary-subject = Sekundær e-postadesse fjerna
postRemoveSecondary-title = Sekundær e-postadesse fjerna
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Du har sletta { $secondaryEmail } som ei sekundær e-postadresse frå { -product-mozilla-account }en din. Tryggingsmeldingar og innloggingsstadfestingar vil ikkje lenger bli leverte til denne adressa.
postRemoveSecondary-action = Handsam kontoen
postRemoveTwoStepAuthentication-subject-line-2 = Tostegs-autentisering er slått av
postRemoveTwoStepAuthentication-title-2 = Du har slått av tostegs-autentisering
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Du har slått det av frå:
postRemoveTwoStepAuthentication-action = Handsam kontoen
postRemoveTwoStepAuthentication-not-required-2 = Du treng ikkje lenger sikkerheitskodar frå autentiseringsappen når du loggar inn.
postSigninRecoveryCode-subject = Reserve-autentiseringskode brukt for å logge inn
postSigninRecoveryCode-preview = Stadfest kontoaktivitet
postSigninRecoveryCode-title = Reserve-autentiseringskoden din vart brukt for å logge inn
postSigninRecoveryCode-description = Viss du ikkje gjorde dette, bør du endre passordet ditt omgåande for å halde kontoen din trygg.
postSigninRecoveryCode-device = Du logga inn frå:
postSigninRecoveryCode-action = Handsam kontoen
postSigninRecoveryPhone-subject = Gjenopprettingstelefon brukt for å logge inn
postSigninRecoveryPhone-preview = Stadfest kontoaktivitet
postSigninRecoveryPhone-title = Gjenopprettingstelefonen din vart brukt for å logge inn
postSigninRecoveryPhone-description = Viss du ikkje gjorde dette, bør du endre passordet ditt omgåande for å halde kontoen din trygg.
postSigninRecoveryPhone-device = Du logga inn frå:
postSigninRecoveryPhone-action = Handsam kontoen
postVerify-sub-title-3 = Vi er glade for å sjå deg!
postVerify-title-2 = Vil du sjå den same fana på to einingar?
postVerify-description-2 = Det er lett! Installer berre { -brand-firefox } på ei anna eining og logg på for å synkronisere. Det er som magi!
postVerify-sub-description = (Psst… Det betyr også at du kan få bokmerke, passord og andre { -brand-firefox }-data overalt der du er logga inn.)
postVerify-subject-4 = Velkomen til { -brand-mozilla }!
postVerify-setup-2 = Kople til ei anna eining:
postVerify-action-2 = Kople til ei anna eining
postVerifySecondary-subject = Sekundær e-post lagt til
postVerifySecondary-title = Sekundær e-post lagt til
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Du har bstadfesta { $secondaryEmail } som ei sekundær e-postadresse for { -product-mozilla-account }en din. Tyggingsmeldingar og innlogging-stadfestingar vil no bli leverte til begge e-postadressene.
postVerifySecondary-action = Handsam kontoen
recovery-subject = Tilbakestill passord
recovery-title-2 = Gløymt passordet ditt?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Vi fekk ein førespurnad om passordendring på { -product-mozilla-account }en din frå:
recovery-new-password-button = Opprett eit nytt passord ved å klikke på knappen nedanfor. Denne lenka vil gå ut innan den neste timen.
recovery-copy-paste = Opprett eit nytt passord ved å kopiere og lime inn nettadressa nedanfor i nettlesaren din. Denne lenka vil gåp ut innan den neste timen.
recovery-action = Lag nytt passord
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Bruk { $unblockCode } for å logge inn
unblockCode-preview = Denne koden går ut om éin time
unblockCode-title = Er det du som loggar inn?
unblockCode-prompt = Dersom ja, her er godkjenningskoden du treng:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Om ja, her er godkjenningskoden du treng: { $unblockCode }
unblockCode-report = Om ikkje, hjelp oss med å avverje inntrengarar og <a data-l10n-name="reportSignInLink">rapporter dette til oss</a>.
unblockCode-report-plaintext = Dersom nei, hjelp oss med å avverje inntrengarar og raporter dette til oss.
verificationReminderFinal-subject = Siste påminning om å stadfeste kontoen din.
verificationReminderFinal-description-2 = For eit par veker sidan oppretta du ein { -product-mozilla-account }, men stadfesta han aldri. For di sikkerheit vil vi slette kontoen om han ikkje vert stadfesta i løpet av dei neste 24 timane.
confirm-account = Stadfest kontoen
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Hugs å stadfeste kontoen din
verificationReminderFirst-title-3 = Velkomen til { -brand-mozilla }!
verificationReminderFirst-description-3 = For nokre dagar sidan oppretta du ein { -product-mozilla-account }, men stadfesta han aldri. Stadfest kontoen din i løpet av dei neste 15 dagane, elles vert han automatisk sletta.
verificationReminderFirst-sub-description-3 = Gå ikkje glipp av nettlesaren som set deg og ditt privatliv fremst.
confirm-email-2 = Stadfest kontoen
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Stadfest kontoen
verificationReminderSecond-subject-2 = Hugs å stadfeste kontoen din
verificationReminderSecond-title-3 = Ikkje gå glipp av { -brand-mozilla }!
verificationReminderSecond-description-4 = For nokre dagar sidan oppretta du ein { -product-mozilla-account }, men stadfesta han aldri. Stadfest kontoen din i løpet av dei neste 10 dagane, elles vert han automatisk sletta.
verificationReminderSecond-second-description-3 = { -product-mozilla-account }en din lèt deg synkronisere { -brand-firefox }-opplevinga di på tvers av einingar og låser opp tilgang til fleire personvernbeskyttande produkt frå { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Bli ein del av oppdraget vårt med å omforme internett til ein plass som er open for alle.
verificationReminderSecond-action-2 = Stadfest kontoen
verify-title-3 = Opne internett med { -brand-mozilla }
verify-description-2 = Stadfest kontoen din og få mest mogleg ut av { -brand-mozilla }, overalt der du loggar inn:
verify-subject = Fullfør opprettinga av kontoen din
verify-action-2 = Stadfest kontoen
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Bruk { $code } for å endre kontoen din
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Denne koden går ut om { $expirationTime } minutt.
       *[other] Denne koden går ut om { $expirationTime } minutt.
    }
verifyAccountChange-title = Endrar du kontoinformasjonen din?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Hjelp oss med å halde kontoen din trygg ved å godkjenne denne endringa på:
verifyAccountChange-prompt = Om ja, her er godkjenningskoden din:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Han går ut om { $expirationTime } minutt.
       *[other] Han går ut om { $expirationTime } minutt.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Logga du inn på { $clientName }?
verifyLogin-description-2 = Hjelp oss med å halde kontoen din trygg ved å stadfeste att du har logga inn på:
verifyLogin-subject-2 = Stadfest innlogging
verifyLogin-action = Stadfest innlogging
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Bruk { $code } for å logge inn
verifyLoginCode-preview = Denne koden går ut om 5 minutt
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Logga du inn på { $serviceName }
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Hjelp oss med å halde kontoen din trygg ved å godkjenne innlogginga di på:
verifyLoginCode-prompt-3 = Om ja, her er godkjenningskoden din:
verifyLoginCode-expiry-notice = Den går ut om 5 minutt.
verifyPrimary-title-2 = Stadfest primær e-postadresse
verifyPrimary-description = Ein førespurnad om å utføre ei kontoendring er gjort frå følgjande eining:
verifyPrimary-subject = Stadfest primær e-postadresse
verifyPrimary-action-2 = Stadfest e-postadressa
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Når stadfesta, vil endringar i kontoen, som å leggje til ein sekundær e-post, verte mogleg frå denne eininga.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Bruk { $code } for å stadfeste den sekundære e-postadressa di
verifySecondaryCode-preview = Denne koden går ut om 5 minutt
verifySecondaryCode-title-2 = Stadfest sekundær e-postadresse
verifySecondaryCode-action-2 = Stadfest e-postadressa
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Ein førespurnad om å bruke { $email } som ei sekundær e-postadresse er gjort frå følgjande { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Bruk denne stadfestingskoden:
verifySecondaryCode-expiry-notice-2 = Den går ut om 5 minutt. Når den er bekrefta, vil denne adressa få tryggingsvarsel og stadfestingar.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Bruk { $code } for å stadfeste kontoen din
verifyShortCode-preview-2 = Denne koden går ut om 5 minutt
verifyShortCode-title-3 =
    Opne internett med
     { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Stadfest kontoen din og få mest mogleg ut av { -brand-mozilla }, overalt der du loggar inn:
verifyShortCode-prompt-3 = Bruk denne stadfestingskoden
verifyShortCode-expiry-notice = Den går ut om 5 minutt.
