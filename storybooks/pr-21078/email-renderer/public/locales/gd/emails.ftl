## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sioncronaich uidheaman">
body-devices-image = <img data-l10n-name="devices-image" alt="Uidheaman">
fxa-privacy-url = Poileasaidh prìobhaideachd { -brand-mozilla }
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Luchdaich a-nuas { $productName } air { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Luchdaich a-nuas { $productName } san { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Stàlaich { $productName } air <a data-l10n-name="anotherDeviceLink">uidheam desktop eile</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Stàlaich { $productName } air <a data-l10n-name="anotherDeviceLink">uidheam eile</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Faigh { $productName } air Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Luchdaich a-nuas { $productName } san App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Stàlaich { $productName } air uidheam eile:
automated-email-change-2 = Mura b’ e tusa a rinn seo, <a data-l10n-name="passwordChangeLink">atharraich am facal-faire agad</a> sa bhad.
automated-email-support = Airson barrachd fiosrachaidh, tadhail air <a data-l10n-name="supportLink">taic { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Mura b’ e tusa a rinn seo, atharraich am facal-faire agad sa bhad:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Airson barrachd fiosrachaidh, tadhail air taic { -brand-mozilla }:
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Airson barrachd fiosrachaidh, tadhail air <a data-l10n-name="supportLink">taic { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Seo post-d fèin-obrachail. Ma fhuair thu seo air mhearachd, cha leig thu leas dad a dhèanamh.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Seo post-d fèin-obrachail, mur bu tusa a cheadaich seo, atharraich am facal-faire agad:
automated-email-reset =
    Seo post-d fèin-obrachail, mur bu tusa a cheadaich seo, <a data-l10n-name="resetLink">ath-shuidhich am facal-faire agad</a>.
    Airson barrachd fiosrachaidh, tadhail air <a data-l10n-name="supportLink">taic { -brand-mozilla }</a>.
change-password-plaintext = Ma tha thu dhen bheachd gu bheil cuideigin a’ feuchainn ri briseadh a-steach dhan chunntas agad, atharraich am facal-faire agad.
manage-account = Stiùirich an cunntas
manage-account-plaintext = { manage-account }:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } air { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } air { $uaOS }
cadReminderFirst-subject-1 = Cuimhneachan! Sioncronaicheamaid { -brand-firefox }
cadReminderFirst-action = Sioncronaich uidheam eile
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Tha feum air dithis airson sioncronachadh
newDeviceLogin-action = Stiùirich an cunntas
passwordChanged-title = Chaidh am facal-faire atharrachadh
postAddAccountRecovery-action = Stiùirich an cunntas
postAddTwoStepAuthentication-action = Stiùirich an cunntas
postChangePrimary-title = Prìomh phost-d ùr
postChangePrimary-action = Stiùirich an cunntas
postConsumeRecoveryCode-action = Stiùirich an cunntas
postNewRecoveryCodes-action = Stiùirich an cunntas
postRemoveAccountRecovery-action = Stiùirich an cunntas
postRemoveSecondary-subject = Chaidh am post-d dàrnach a thoirt air falbh
postRemoveSecondary-title = Chaidh am post-d dàrnach a thoirt air falbh
postRemoveSecondary-action = Stiùirich an cunntas
postRemoveTwoStepAuthentication-action = Stiùirich an cunntas
postVerifySecondary-subject = Chaidh post-d dàrnach a chur ris
postVerifySecondary-title = Chaidh post-d dàrnach a chur ris
postVerifySecondary-action = Stiùirich an cunntas
recovery-action = Cruthaich facal-faire ùr
unblockCode-title = An tusa a tha a’ clàradh a-steach?
unblockCode-prompt = Mas e, seo an còd ùghdarachaidh a dh’fheumas tu:
unblockCode-report-plaintext = Mur e, cuidich leinn ’nar strì an aghaidh luchd-foill is cuir aithisg mu dhèidhinn thugainn.
verify-subject = Cuir crìoch air cruthachadh a’ chunntais agad
verifyLogin-action = Dearbh an clàradh a-steach
verifyPrimary-description = Chaidh iarrtas airson atharrachadh sa chunntas a dhèanamh air an uidheam a leanas:
verifyPrimary-subject = Dearbh am prìomh phost-d
