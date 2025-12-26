# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = ახალი კოდი გამოიგზავნა თქვენს ელფოსტაზე.
resend-link-success-banner-heading = ახალი ბმული გამოიგზავნა თქვენს ელფოსტაზე.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = დაამატეთ { $accountsEmail } ნაცნობ მისამართებში შეტყობინებების შეუფერხებლად მიღებისთვის.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = სარკმლის დახურვა
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts(case: "dat") } სახელი შეეცვლება და ერქმევა { -product-mozilla-accounts } 1 ნოემბრიდან.
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = კვლავ შეგეძლებათ შეხვიდეთ მომხმარებლის იმავე სახელითა და პაროლით, სხვა ცვლილება არ შეეხება პროდუქტებს, რომელთაც იყენებთ.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title =
    { -product-firefox-accounts(case: "dat") } სახელი შეეცვლება და ერქმევა { -product-mozilla-accounts }.
    კვლავ შეგეძლებათ შეხვიდეთ მომხმარებლის იმავე სახელითა და პაროლით, სხვა ცვლილება არ შეეხება პროდუქტებს, რომელთაც იყენებთ.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = ვრცლად
# Alt text for close banner image
brand-close-banner =
    .alt = სარკმლის დახურვა
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla }-m-ლოგო

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = უკან
button-back-title = უკან

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = ჩამოტვირთეთ და განაგრძეთ
    .title = ჩამოტვირთეთ და განაგრძეთ
recovery-key-pdf-heading = ანგარიშის აღდგენის გასაღები
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = შედგენილი: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = ანგარიშის აღდგენის გასაღები
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = ამ გასაღების მეშვეობით, შეძლებთ აღადგინოთ ბრაუზერის დაშიფრული მონაცემები (მათ შორის ანგარიშები, სანიშნები და ისტორი), თუ პაროლი დაგავიწყდებათ. შეინახეთ ადვილად დასამახსოვრებელ ადგილას.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = სათანადო ადგილი გასაღების შესანახად
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = ვრცლად ანგარიშის აღდგენის გასაღების შესახებ
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = სამწუხაროდ, ხარვეზი წარმოიშვა ანგარიშის აღდგენის გასაღების ჩამოტვირთვისას.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = მიიღეთ მეტი { -brand-mozilla }-სგან:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = გაეცანით ჩვენს ბოლო სიახლეებსა და განახლებულ პროდუქტებს.
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = ადრეული წვდომა ახალი პროდუქტების გამოსაცდელად
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = სამოქმედო ცნობები ინტერნეტის დასაბრუნებლად

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = ჩამოიტვირთა
datablock-copy =
    .message = ასლი აღებულია
datablock-print =
    .message = ამოიბეჭდა

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] კოდის ასლი აღებულია
       *[other] კოდების ასლი აღებულია
    }
datablock-download-success =
    { $count ->
        [one] კოდი ჩამოტვირთულია
       *[other] კოდები ჩამოტვირთულია
    }
datablock-print-success =
    { $count ->
        [one] კოდი ამობეჭდილია
       *[other] კოდები ამობეჭდილია
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = ასლი აღებულია

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (მიახლოებით)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (მიახლოებით)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (მიახლოებით)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (მიახლოებით)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = მდებარეობა უცნობია
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } სისტემაზე { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-მისამართი: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = პაროლი
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = გაიმეორეთ პაროლი
form-password-with-inline-criteria-signup-submit-button = ანგარიშის შექმნა
form-password-with-inline-criteria-reset-new-password =
    .label = ახალი პაროლი
form-password-with-inline-criteria-confirm-password =
    .label = დაადასტურეთ პაროლი
form-password-with-inline-criteria-reset-submit-button = შეიყვანეთ ახალი პაროლი
form-password-with-inline-criteria-set-password-new-password-label =
    .label = პაროლი
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = გაიმეორეთ პაროლი
form-password-with-inline-criteria-set-password-submit-button = დასინქ. დაწყება
form-password-with-inline-criteria-match-error = პაროლები არ ემთხვევა
form-password-with-inline-criteria-sr-too-short-message = პაროლი არანაკლებ 8 სიმბოლოსგან უნდა შედგებოდეს.
form-password-with-inline-criteria-sr-not-email-message = პაროლი არ უნდა შეიცავდეს თქვენს ელფოსტას.
form-password-with-inline-criteria-sr-not-common-message = პაროლი არ ემთხვეოდეს ხშირად გამოყენებულს.
form-password-with-inline-criteria-sr-requirements-met = შეყვანილი პაროლი აკმაყოფილებს ყველა მოთხოვნას.
form-password-with-inline-criteria-sr-passwords-match = შეყვანილი პაროლები ემთხვევა.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = ველის შევსება აუცილებელია

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = შეიყვანეთ { $codeLength }-ნიშნა კოდი, რომ განაგრძოთ
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = შეიყვანეთ { $codeLength }-სიმბოლოიანი კოდი, რომ განაგრძოთ

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox }-ანგარიშის აღდგენის გასაღები
get-data-trio-title-backup-verification-codes = შესვლის სამარქაფო კოდები
get-data-trio-download-2 =
    .title = ჩამოტვირთვა
    .aria-label = ჩამოტვირთვა
get-data-trio-copy-2 =
    .title = ასლი
    .aria-label = ასლი
get-data-trio-print-2 =
    .title = ამობეჭდვა
    .aria-label = ამობეჭდვა

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = ცნობა
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = ყურადღება
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = გაფრთხილება
authenticator-app-aria-label =
    .aria-label = დამმოწმებელი პროგრამა
backup-codes-icon-aria-label-v2 =
    .aria-label = შესვლის სამარქაფო კოდები ამოქმედებულია
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = შესვლის სამარქაფო კოდები გათიშულია
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = აღდგენის SMS ჩართულია
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = აღდგენის SMS გათიშულია
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = კანადის დროშა
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = მონიშვნა
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = შესრულდა
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = ჩართულია
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = შეტყობინების დახურვა
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = კოდი
error-icon-aria-label =
    .aria-label = შეცდომა
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = ცნობა
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = შეერთებული შტატების დროშა

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = კომპიუტერი, მობილური ტელეფონი და თითოეულ მათგანზე გამოსახული გატეხილი გული
hearts-verified-image-aria-label =
    .aria-label = კომპიუტერი, მობილური ტელეფონი, პლანშეტი და თითოეულ მათგანზე გამოსახული მფეთქავი გული
signin-recovery-code-image-description =
    .aria-label = დოკუმენტი დაფარული ტექსტით
signin-totp-code-image-label =
    .aria-label = მოწყობილობა დაფარული 6-ციფრიანი კოდით.
confirm-signup-aria-label =
    .aria-label = წერილის კონვერტი ბმულით
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = გამოსახულებაზე წარმოდგენილი ანგარიშის აღდგენის გასაღები.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = გამოსახულებაზე წარმოდგენილი ანგარიშის აღდგენის გასაღები.
password-image-aria-label =
    .aria-label = პაროლის აკრეფის გამოსახულება.
lightbulb-aria-label =
    .aria-label = გამოსახულებაზე წარმოდგენილია მინიშნების შექმნა საცავისთვის
email-code-image-aria-label =
    .aria-label = კოდის შემცველი ელფოსტის გამოსახულება.
recovery-phone-image-description =
    .aria-label = მობილური მოწყობილობა, რომელიც კოდს იღებს ტექსტური შეტყობინებით.
recovery-phone-code-image-description =
    .aria-label = მობილურ მოწყობილობაზე მიღებული კოდი.
backup-recovery-phone-image-aria-label =
    .aria-label = მობილური მოწყობილობა SMS-შეტყობინების მიღების შესაძლებლობით
backup-authentication-codes-image-aria-label =
    .aria-label = მოწყობილობის ეკრანი კოდებით
sync-clouds-image-aria-label =
    .aria-label = ღრუბლები სინქრონიზაციის ხატულით
confetti-falling-image-aria-label =
    .aria-label = მოძრავი ტკბილეულობის ცვენა

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = შესული ხართ, მოგესალმებათ { -brand-firefox }.
inline-recovery-key-setup-create-header = დაიცავით თქვენი ანგარიში
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = გცალიათ ორი წამი თქვენი მონაცემების დასაცავად?
inline-recovery-key-setup-info = შექმენით ანგარიშის აღდგენის გასაღები, რომ შეძლოთ ბრაუზერის დასინქრონებული მონაცემების აღდგენა, თუ დაგავიწყდებათ პაროლი.
inline-recovery-key-setup-start-button = ანგარიშის აღდგენის გასაღების შექმნა
inline-recovery-key-setup-later-button = შეხსენება მოგვიანებით

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = პაროლის დამალვა
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = პაროლის ჩვენება
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = თქვენი პაროლი ამჟამად ხილულია ეკრანზე.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = თქვენი პაროლი ამჟამად დაფარულია.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = თქვენი პაროლი ახლა ხილულია ეკრანზე.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = თქვენი პაროლი ახლა დაფარულია.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = ქვეყნის არჩევა
input-phone-number-enter-number = მიუთითეთ ტელეფონის ნომერი
input-phone-number-country-united-states = შეერთებული შტატები
input-phone-number-country-canada = კანადა
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = უკან

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = პაროლის გასანულებელი ბმული დაზიანებულია
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = დასადასტურებელი ბმული დაზიანებულია
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = ბმული დაზიანებულია
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = ბმულს, რომელზეც გადახვედით, აკლია სიმბოლოები ან დაზიანდა თქვენი ელფოსტის პროგრამიდან აღებისას. ყურადღებით გადმოიტანეთ მისამართი და კვლავ სცადეთ.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = ახალი ბმულის მიღება

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = გაგახსენდათ პაროლი?
# link navigates to the sign in page
remember-password-signin-link = შესვლა

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = მთავარი ელფოსტა უკვე დამოწმებულია
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = შესვლა უკვე დამოწმებულია
confirmation-link-reused-message = დადასტურების ბმული უკვე გამოყენებულია, მისი გამოყენება მხოლოდ ერთხელ შეიძლება.

## Locale Toggle Component

locale-toggle-select-label = ენის არჩევა
locale-toggle-browser-default = ბრაუზერის ნაგულისხმევი
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = გაუმართავი მოთხოვნა

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = პაროლი გესაჭიროებათ იმ დაშიფრულ მონაცემებთან წვდომისთვის, რომელთაც ჩვენთან ინახავთ.
password-info-balloon-reset-risk-info = განულების შედეგად, სავარაუდოდ, დაკარგავთ შენახულ მონაცემებს, მათ შორის პაროლებსა და სანიშნებს.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = აირჩიეთ ძლიერი პაროლი, რომელიც არ გამოგიყენებიათ სხვა საიტებზე. დარწმუნდით, რომ აკმაყოფილებს უსაფრთხოების მოთხოვნებს:
password-strength-short-instruction = აირჩიეთ მძლავრი პაროლი:
password-strength-inline-min-length = სულ მცირე 8 სიმბოლო
password-strength-inline-not-email = თქვენი ელფოსტის გარდა
password-strength-inline-not-common = ხშირად გამოყენებული პაროლის გარდა
password-strength-inline-confirmed-must-match = დამადასტურებელი ემთხვევა ახალ პაროლს
password-strength-inline-passwords-match = პაროლები ემთხვევა

## Notification Promo Banner component

account-recovery-notification-cta = შექმნა
account-recovery-notification-header-value = ნუ დაკარგავთ მონაცემებს პაროლის დავიწყებისას
account-recovery-notification-header-description = შექმენით ანგარიშის აღდგენის გასაღები და შეგეძლებათ ბრაუზერის დასინქრონებული მონაცემების აღდგენა, თუ დაგავიწყდებათ პაროლი.
recovery-phone-promo-cta = აღდგენის ტელეფონის დამატება
recovery-phone-promo-heading = გამოიყენეთ დაცვის დამატებითი დონე თქვენს ანგარიშზე აღდგენის ტელეფონით
recovery-phone-promo-description = ახლა უკვე შეგიძლიათ ანგარიშზე შესვლისთვის მიიღოთ ერთჯერადი პაროლი SMS-ის საშუალებით, თუ ვერ ახერხებთ ორბიჯიანი შესვლის დამმოწმებელი პროგრამით სარგებლობას.
recovery-phone-promo-info-link = იხილეთ ვრცლად აღდგენისა და SIM-ბარათის შენაცვლების საფრთხეების შესახებ
promo-banner-dismiss-button =
    .aria-label = ამ ცნობის აცილება

## Ready component

ready-complete-set-up-instruction = დაასრულეთ გამართვა ახალი პაროლის შეყვანით სხვა მოწყობილობაზე, რომელზეც აყენია { -brand-firefox }.
manage-your-account-button = ანგარიშის მართვა
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = ყველაფერი მზადაა, რომ გამოიყენოთ { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = ყველაფერი მზადაა ანგარიშის პარამეტრების გასამართად
# Message shown when the account is ready but the user is not signed in
ready-account-ready = თქვენი ანგარიში მზადაა!
ready-continue = განაგრძეთ
sign-in-complete-header = შესვლა დადასტურებულია
sign-up-complete-header = ანგარიში დადასტურებულია
primary-email-verified-header = მთავარი ელფოსტა დამოწმებულია

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = ადგილები გასაღების შესანახად:
flow-recovery-key-download-storage-ideas-folder-v2 = საქაღალდე დაცულ მოწყობილობაზე
flow-recovery-key-download-storage-ideas-cloud = სანდო ღრუბლოვანი საცავი
flow-recovery-key-download-storage-ideas-print-v2 = ფიზიკურად ამობეჭდილი ასლი
flow-recovery-key-download-storage-ideas-pwd-manager = პაროლების მმართველი

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = დაამატეთ მინიშნება გასაღების ადვილად საპოვნელად
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = ეს მინიშნება დაგეხმარებათ, გაიხსენოთ, სად შეინახეთ თქვენი ანგარიშის აღდგენის გასაღები. იხილავთ, პაროლის განულებისას მონაცემების აღსადგენად.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = შეიყვანეთ მინიშნება (არასავალდებულო)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = დასრულება
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = მინიშნება უნდა შეიცავდეს არაუმეტეს 255 სიმბოლოს.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = მინიშნება არ უნდა შეიცავდეს საფრთხის შემცველ უნიკოდ-სიმბოლოებს. მისაღებია მხოლოდ ასოები, ციფრები და სასვენი ნიშნები.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = გაფრთხილება
password-reset-chevron-expanded = გაფრთხილების აკეცვა
password-reset-chevron-collapsed = გაფრთხილების გაშლა
password-reset-data-may-not-be-recovered = თქვენი ბრაუზერის მონაცემები შესაძლოა, ვერ აღდგეს
password-reset-previously-signed-in-device-2 = გაქვთ მოწყობილობა, საიდანაც მანამდეც ყოფილხართ შესული?
password-reset-data-may-be-saved-locally-2 = თქვენი ბრაუზერის მონაცემები შესაძლოა, ამ მოწყობილობაზე ინახებოდეს. გაანულეთ პაროლი და შედით ანგარიშზე მონაცემების დასინქრონებისა და აღდგენისთვის.
password-reset-no-old-device-2 = გაქვთ ახალი მოწყობილობა, მაგრამ აღარ გაქვთ წვდომა ადრინდელზე?
password-reset-encrypted-data-cannot-be-recovered-2 = სამწუხაროდ, თქვენი დაშიფრული მონაცემები, რომელსაც { -brand-firefox } ინახავს სერვერებზე, ვეღარ აღდგება.
password-reset-warning-have-key = გაქვთ ანგარიშის აღდგენის გასაღების?
password-reset-warning-use-key-link = გამოიყენეთ პაროლის გასანულებლად მონაცემების დაკარგვის გარეშე

## Alert Bar

alert-bar-close-message = შეტყობინების დახურვა

## User's avatar

avatar-your-avatar =
    .alt = თქვენი ავატარი
avatar-default-avatar =
    .alt = ნაგულისხმევი ავატარი

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla }-ს ნაწარმი
bento-menu-tagline = { -brand-mozilla }-ს მეტი ნაწარმი თქვენი პირადულობის დასაცავად
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox }-ბრაუზერი კომპიუტერისთვის
bento-menu-firefox-mobile = { -brand-firefox }-ბრაუზერი მობილურისთვის
bento-menu-made-by-mozilla = ქმნის { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = მიიღეთ { -brand-firefox } მობილურზე ან ტაბლეტზე
connect-another-find-fx-mobile-2 = მონახეთ { -brand-firefox }, გახსენით { -google-play } და { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = ჩამოტვირთეთ { -brand-firefox }, იხილეთ { -google-play }
connect-another-app-store-image-3 =
    .alt = ჩამოტვირთეთ { -brand-firefox }, იხილეთ { -app-store }

## Connected services section

cs-heading = დაკავშირებული მომსახურებები
cs-description = ყველაფერი, რასაც იყენებთ და რაშიც შესული ხართ.
cs-cannot-refresh =
    სამწუხაროდ, რაღაც შეცდომა წარმოიშვა სიის განახლებისას დაკავშირებული 
    მომსახურებების.
cs-cannot-disconnect = კლიენტი ვერ მოიძებნა, გამოთიშვა შეუძლებელია
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = გამოთიშულია { $service }
cs-refresh-button =
    .title = დაკავშირებული მომსახურებების განახლება
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = აკლია რამე ან გამეორებულია?
cs-disconnect-sync-heading = გამოთიშვა სინქრონიზაციიდან

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    მონახულებული გვერდების მონაცემებს შეინარჩუნებს <span>{ $device }</span>,
    მაგრამ აღარ დასინქრონდება თქვენს ანგარიშთან.
cs-disconnect-sync-reason-3 = რის გამო გსურთ გამოთიშოთ <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = მოწყობილობა არის:
cs-disconnect-sync-opt-suspicious = საეჭვო
cs-disconnect-sync-opt-lost = დაკარგული ან მოპარული
cs-disconnect-sync-opt-old = ძველი ან შეცვლილი
cs-disconnect-sync-opt-duplicate = გამეორებულია
cs-disconnect-sync-opt-not-say = დუმილს ვამჯობინებ

##

cs-disconnect-advice-confirm = კარგი, გასაგებია
cs-disconnect-lost-advice-heading = დაკარგული ან მოპარული მოწყობილობა გამოთიშულია
cs-disconnect-lost-advice-content-3 = ვინაიდან თქვენი მოწყობილობა დაკარგული ან მოპარულია, მონაცემების უსაფრთხოებისთვის უმჯობესია შეცვალოთ { -product-mozilla-account(case: "gen") } პაროლი თქვენი პარამეტრებიდან. აგრეთვე სასურველია, გაეცნოთ თავად მოწყობილობის მწარმოებლისგან მითითებებს მონაცემების დაშორებულად წაშლის შესახებ.
cs-disconnect-suspicious-advice-heading = საეჭვო მოწყობილობა გამოთიშულია
cs-disconnect-suspicious-advice-content-2 = თუ გამოთიშული მოწყობილობა ნამდვილად საეჭვოა, თქვენი მონაცემების უსაფრთხოებისთვის უმჯობესია, შეცვალოთ { -product-mozilla-account(case: "gen") } პაროლი თქვენი პარამეტრებიდან. აგრეთვე სასურველია, მისამართების ველში გადახვიდეთ about:logins გვერდზე და შეცვალოთ ყველა დანარჩენი პაროლიც, რომელთაც ინახავს { -brand-firefox }.
cs-sign-out-button = გამოსვლა

## Data collection section

dc-heading = მონაცემთა აღრიცხვა და გამოყენება
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox }-ბრაუზერი
dc-subheader-content-2 = ნების დართვა, რომ { -product-mozilla-accounts } შეძლებს გაუგზავნოს { -brand-mozilla }-ს ტექნიკური და გამოყენების მონაცემები.
dc-subheader-ff-content = { -brand-firefox }-ბრაუზერის ტექნიკური და გამოყენების მონაცემების აღრიცხვის გადასახედად ან შესაცვლელად, გახსენით { -brand-firefox }-პარამეტრები, შემდეგ კი გადადით განყოფილებაში პირადულობა და უსაფრთხოება.
dc-opt-out-success-2 = უარი მიღებულია. { -product-mozilla-accounts } არ გაუგზავნის { -brand-mozilla }-ს ტექნიკურ და გამოყენების მონაცემებს.
dc-opt-in-success-2 = გმადლობთ! ამ მონაცემების გაზიარება მეტად წაადგება { -product-mozilla-accounts(case: "gen") } გაუმჯობესებას.
dc-opt-in-out-error-2 = სამწუხაროდ, ხარვეზი წარმოიშვა მონაცემთა აღრიცხვის პარამეტრის ცვლილებისას
dc-learn-more = ვრცლად

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account(case: "gen") } მენიუ
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = შესული ხართ, როგორც
drop-down-menu-sign-out = გამოსვლა
drop-down-menu-sign-out-error-2 = სამწუხაროდ, ხარვეზი წარმოიშვა გამოსვლისას.

## Flow Container

flow-container-back = უკან

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = კვლავ მიუთითეთ თქვენი უსაფრთხოებისთვის
flow-recovery-key-confirm-pwd-input-label = მიუთითეთ თქვენი პაროლი
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = ანგარიშის აღდგენის გასაღების შექმნა
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = ანგარიშის აღდგენის ახალი გასაღების შექმნა

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = შექმნილია ანგარიშის აღდგენის გასაღები — ჩამოტვირთეთ და შეინახეთ ახლავე
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = ეს გასაღები საშუალებას გაძლევთ, აღადგინოთ თქვენი მონაცემები, თუ დაგავიწყდებათ პაროლი. ჩამოტვირთეთ ახლავე და შეინახეთ დასამახსოვრებელ ადგილას — შემდგომ ვეღარ დაუბრუნდებით ამ გვერდს.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = განაგრძეთ ჩამოტვირთვის გარეშე

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = ანგარიშის აღდგენის გასაღები შექმნილია

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = შექმენით ანგარიშის აღდგენის გასაღები პაროლის დავიწყების შემთხვევისთვის
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = შეცვალეთ ანგარიშის აღდგენის გასაღები
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = ჩვენ დავშიფრავთ დათვალიერების მონაცემებს –– პაროლებს, სანიშნებს და სხვა. ეს შესანიშნავია პირადულობისთვის, მაგრამ სანაცვლოდ შეიძლება დაკარგოთ თქვენი მონაცემები, თუ დაგავიწყდებათ პაროლი.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = სწორედ ამიტომაა მეტად მნიშვნელოვანი ანგარიშის აღდგენის გასაღების შექმნა –– შეგიძლიათ გამოიყენოთ ეგ გასაღები თქვენი მონაცემების დასაბრუნებლად.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = დაიწყეთ
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = გაუქმება

## FlowSetup2faApp

flow-setup-2fa-qr-heading = თქვენი დამმოწმებელი პროგრამის დაკავშირება
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>ნაბიჯი 1:</strong> გადაუღეთ ამ QR-კოდს ნებისმიერი დამმოწმებელი პროგრამიდან, როგორიცაა Duo ან Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR-კოდი ორბიჯიანი დამოწმების გასამართად. გადაუღეთ ან სანაცვლოდ აირჩიეთ „ვერ კითხულობს QR-კოდს?“ საიდუმლო გასაღებით გასამართად.
flow-setup-2fa-cant-scan-qr-button = ვერ კითხულობს QR-კოდს?
flow-setup-2fa-manual-key-heading = კოდი ხელით შეყვანა
flow-setup-2fa-manual-key-instruction = <strong>ნაბიჯი 1:</strong> შეიყვანეთ ეს კოდი სასურველ დამმოწმებელ პროგრამაში.
flow-setup-2fa-scan-qr-instead-button = გსურთ სანაცვლოდ QR-კოდი წააკითხოთ?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = ვრცლად დამმოწმებელი პროგრამების შესახებ
flow-setup-2fa-button = განაგრძეთ
flow-setup-2fa-step-2-instruction = <strong>ნაბიჯი 2:</strong> შეიყვანეთ კოდი დამმოწმებელი პროგრამიდან.
flow-setup-2fa-input-label = შეიყვანეთ 6-ციფრიანი კოდი
flow-setup-2fa-code-error = უმართებულო ან ვადაგასული კოდი. შეამოწმეთ თქვენი დამმოწმებელი პროგრამა და სცადეთ ხელახლა.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = აირჩიეთ აღდგენის გზა
flow-setup-2fa-backup-choice-description = საშუალებას მოგცემთ, შეხვიდეთ ანგარიშზე მაშინაც კი, თუ აღარ გექნებათ წვდომა თქვენს მობილურ მოწყობილობასთან ან დამმოწმებელ პროგრამასთან.
flow-setup-2fa-backup-choice-phone-title = აღდგენის ტელეფონი
flow-setup-2fa-backup-choice-phone-badge = უადვილესი
flow-setup-2fa-backup-choice-phone-info = მიიღეთ აღდგენის კოდი ტექსტური შეტყობინებით. ამჟამად ხელმისაწვდომია შეერთებულ შტატებსა და კანადაში.
flow-setup-2fa-backup-choice-code-title = შესვლის სამარქაფო კოდები
flow-setup-2fa-backup-choice-code-badge = მეტად უსაფრთხო
flow-setup-2fa-backup-choice-code-info = შექმენით და შეინახეთ დამოწმების ერთჯერადი კოდები.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = იხილეთ აღდგენისა და SIM-ბარათის შენაცვლების საფრთხეების შესახებ

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = შეიყვანეთ შესვლის სამარქაფო კოდი
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = დაადასტურეთ, რომ შენახული გაქვთ კოდები, ერთ-ერთი მათგანის შეყვანით. ამ კოდების გარეშე შესაძლოა, ვეღარ შეხვიდეთ ანგარიშზე, თუ დაკარგავთ შესვლის დამმოწმებელ აპთან წვდომას.
flow-setup-2fa-backup-code-confirm-code-input = შეიყვანეთ 10-ნიშნა კოდი
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = დასრულება

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = დამოწმების სამარქაფო კოდების შენახვა
flow-setup-2fa-backup-code-dl-save-these-codes = შეინახეთ დასამახსოვრებელ ადგილას. თუ აღარ გექნებათ წვდომა თქვენს დამმოწმებელ პროგრამასთან, ერთ-ერთი მათგანის შეყვანით შეძლებთ შესვლას.
flow-setup-2fa-backup-code-dl-button-continue = განაგრძეთ

##

flow-setup-2fa-inline-complete-success-banner = ორბიჯიანი დამოწმება შესვლისას ჩართულია
flow-setup-2fa-inline-complete-success-banner-description = ყველა დაკავშირებული მოწყობილობის დასაცავად უნდა გამოხვიდეთ ამ ანგარიშით მოსარგებლე თითოეული მათგანიდან, შემდეგ კი კვლავ შეხვიდეთ ახლად შექმნილი ორბიჯიანი დამოწმებით.
flow-setup-2fa-inline-complete-backup-code = შესვლის სამარქაფო კოდები
flow-setup-2fa-inline-complete-backup-phone = აღდგენის ტელეფონი
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] დარჩენილია { $count } კოდი
       *[other] დარჩენილია { $count } კოდი
    }
flow-setup-2fa-inline-complete-backup-code-description = ესაა აღდგენის მეტად უსაფრთხო გზა, ანგარიშზე თუ ვერ შედიხართ თქვენი მობილური მოწყობილობით ან დამმოწმებელი პროგრამით.
flow-setup-2fa-inline-complete-backup-phone-description = ესაა აღდგენის მეტად იოლი გზა, ანგარიშზე თუ ვერ შედიხართ დამმოწმებელი პროგრამით.
flow-setup-2fa-inline-complete-learn-more-link = როგორ იცავს ეს თქვენს ანგარიშს
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = გაიხსნება { $serviceName }
flow-setup-2fa-prompt-heading = ორბიჯიანი დამოწმების გამართვა
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } ითხოვს ორბიჯიანი დამოწმების გამართვას შესვლისას ანგარიშის უსაფრთხოებისთვის.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = გასაგრძელებლად შეგიძლიათ გამოიყენოთ ნებისმიერი <authenticationAppsLink>ამ დამმოწმებელი პროგრამებიდან</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = განაგრძეთ

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = შეიყვანეთ დამადასტურებელი კოდი
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = ექვსციფრიანი კოდი გამოიგზავნა ნომერზე <span>{ $phoneNumber }</span> ტექსტური შეტყობინებით. კოდს ვადა გაუვა 5 წუთში.
flow-setup-phone-confirm-code-input-label = შეიყვანეთ 6-ციფრიანი კოდი
flow-setup-phone-confirm-code-button = დასტური
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = კოდი ვადაგასულია?
flow-setup-phone-confirm-code-resend-code-button = კოდის კვლავ გაგზავნა
flow-setup-phone-confirm-code-resend-code-success = კოდი გამოგზავნილია
flow-setup-phone-confirm-code-success-message-v2 = აღდგენის ტელეფონი დამატებულია
flow-change-phone-confirm-code-success-message = აღდგენის ტელეფონი შეცვლილია

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = ტელეფონის ნომრის დამოწმება
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = ტექსტურ შეტყობინებას გამოგიგზავნით { -brand-mozilla } თქვენი ნომრის დამადასტურებელი კოდით. არავის გაუზიაროთ ეგ კოდი.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = აღდგენის ტელეფონი ხელმისაწვდომია მხოლოდ შეერთებულ შტატებსა და კანადაში. VoIP-ნომრები და ტელეფონის შენიღბული ნომრები არასასურველია.
flow-setup-phone-submit-number-legal = თქვენი ნომრის მითითებით გვაძლევთ უფლებას, რომ შევინახოთ ანგარიშის დამადასტურებელი შეტყობინებების გამოსაგზავნად მხოლოდ. მიღებისას ან ფიჭური ინტერნეტის გამოყენებისას თანხა შეიძლება ჩამოგეჭრათ.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = კოდის გაგზავნა

## HeaderLockup component, the header in account settings

header-menu-open = მენიუს დახურვა
header-menu-closed = საიტზე გადაადგილების მენიუ
header-back-to-top-link =
    .title = დასაწყისში დაბრუნება
header-back-to-settings-link =
    .title = უკან { -product-mozilla-account } პარამეტრებით
header-title-2 = { -product-mozilla-account }
header-help = დახმარება

## Linked Accounts section

la-heading = მიბმული ანგარიშები
la-description = თქვენ ნებადართული გაქვთ წვდომა მოცემულ ანგარიშებზე.
la-unlink-button = გამოთიშვა
la-unlink-account-button = გამოთიშვა
la-set-password-button = პაროლის მითითება
la-unlink-heading = გამოთიშვა გარეშე ანგარიშიდან
la-unlink-content-3 = ნამდვილად გსურთ გამოთიშოთ თქვენი ანგარიში? შედეგად, მაინც დარჩებით შესული დაკავშირებულ მომსახურებებზე. საჭირო იქნება თითოეულიდან ცალ-ცალკე გამოსვლა აღნიშნული მომსახურებების განყოფილებაში.
la-unlink-content-4 = ანგარიშის გამოთიშვამდე პაროლი უნდა დააყენოთ. პაროლის გარეშე ვერ მოახერხებთ შესვლას გამოთიშვის შემდგომ.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = დახურვა
modal-cancel-button = გაუქმება
modal-default-confirm-button = თანხმობა

## ModalMfaProtected

modal-mfa-protected-title = შეიყვანეთ დადასტურების კოდი
modal-mfa-protected-subtitle = დაგვეხმარეთ დადასტურებაში, რომ ნამდვილად თქვენ ცდილობთ ანგარიშის მონაცემების ცვლილებას
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] შეიყვანეთ კოდი, რომელიც მოგივათ ელფოსტაზე <email>{ $email }</email> { $expirationTime } წუთის განმავლობაში.
       *[other] შეიყვანეთ კოდი, რომელიც მოგივათ ელფოსტაზე <email>{ $email }</email> { $expirationTime } წუთის განმავლობაში.
    }
modal-mfa-protected-input-label = შეიყვანეთ 6-ციფრიანი კოდი
modal-mfa-protected-cancel-button = გაუქმება
modal-mfa-protected-confirm-button = თანხმობა
modal-mfa-protected-code-expired = კოდი ვადაგასულია?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = ახალი კოდის გაგზავნა.

## Modal Verify Session

mvs-verify-your-email-2 = ელფოსტის დადასტურება
mvs-enter-verification-code-2 = შეიყვანეთ დადასტურების კოდი
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = გთხოვთ, 5 წუთის განმავლობაში შეიყვანოთ დადასტურების კოდი, რომელიც გამოგზავნილია მისამართზე <email>{ $email }</email>.
msv-cancel-button = გაუქმება
msv-submit-button-2 = დასტური

## Settings Nav

nav-settings = პარამეტრები
nav-profile = პროფილი
nav-security = უსაფრთხოება
nav-connected-services = დაკავშირებული მომსახურებები
nav-data-collection = მონაცემთა აღრიცხვა და გამოყენება
nav-paid-subs = ფასიანი გამოწერები
nav-email-comm = ელფოსტით კავშირები

## Page2faChange

page-2fa-change-title = შესვლისას ორბიჯიანი დამოწმების შეცვლა
page-2fa-change-success = ორბიჯიანი დამოწმება განახლებულია
page-2fa-change-success-additional-message = ყველა დაკავშირებული მოწყობილობის დასაცავად უნდა გამოხვიდეთ ამ ანგარიშით მოსარგებლე თითოეული მათგანიდან, შემდეგ კი კვლავ შეხვიდეთ ახლად შექმნილი ორბიჯიანი დამოწმებით.
page-2fa-change-totpinfo-error = შეცდომა წარმოიშვა ორბიჯიანი დამოწმების პროგრამის შეცვლისას. სცადეთ მოგვიანებით.
page-2fa-change-qr-instruction = <strong>ნაბიჯი 1:</strong> წააკითხეთ ეს QR-კოდი ნებისმიერ დამმოწმებელ პროგრამას, როგორიცაა Duo ან Google Authenticator. შეიქმნება ახალი კავშირი და წინათ დაკავშირებული აღარ იმუშავებს.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = შესვლის სამარქაფო კოდები
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = ხარვეზი წარმოიშვა თქვენი სამარქაფო კოდების ჩანაცვლებისას
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = ხარვეზი წარმოიშვა თქვენი სამარქაფო კოდების შედგენისას ანგარიშის დასამოწმებლად
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = შესვლის სამარქაფო კოდები განახლებულია
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = შესვლის სამარქაფო კოდები შექმნილია
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = შეინახეთ დასამახსოვრებელ ადგილას. თქვენი ძველი კოდები ჩანაცვლდება ამ ნაბიჯის ჩანაცვლებისას.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = დაადასტურეთ, რომ შენახული გაქვთ კოდები, ერთ-ერთი მათგანის შეყვანით. თქვენი ძველი სამარქაფო კოდები გაუქმდება ამ ნაბიჯის დასრულებისას.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = დამოწმების უმართებულო სამარქაფო კოდი

## Page2faSetup

page-2fa-setup-title = ორბიჯიანი დამოწმება
page-2fa-setup-totpinfo-error = შეცდომა წარმოიშვა ორბიჯიანი დამოწმების დაყენებისას. სცადეთ მოგვიანებით.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = ეს კოდი უმართებულოა. სცადეთ ხელახლა.
page-2fa-setup-success = ორბიჯიანი დამოწმება შესვლისას ჩართულია
page-2fa-setup-success-additional-message = ყველა დაკავშირებული მოწყობილობის დასაცავად უნდა გამოხვიდეთ ამ ანგარიშით მოსარგებლე თითოეული მათგანიდან, შემდეგ კი კვლავ შეხვიდეთ ორბიჯიანი დამოწმებით.

## Avatar change page

avatar-page-title =
    .title = პროფილის სურათი
avatar-page-add-photo = ფოტოს დამატება
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = სურათის გადაღება
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = ფოტოს მოცილება
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = ახლიდან გადაღება
avatar-page-cancel-button = გაუქმება
avatar-page-save-button = შენახვა
avatar-page-saving-button = ინახება…
avatar-page-zoom-out-button =
    .title = დაშორება
avatar-page-zoom-in-button =
    .title = მიახლოება
avatar-page-rotate-button =
    .title = მობრუნება
avatar-page-camera-error = კამერის ჩართვა ვერ მოხერხდა
avatar-page-new-avatar =
    .alt = პროფილის ახალი სურათი
avatar-page-file-upload-error-3 = ხარვეზი წარმოიშვა პროფილის სურათის განახლებისას
avatar-page-delete-error-3 = ხარვეზი წარმოიშვა პროფილის სურათის წაშლისას
avatar-page-image-too-large-error-2 = სურათის ფაილის ზომა ზედმეტად დიდია ატვირთვისთვის

## Password change page

pw-change-header =
    .title = პაროლის შეცვლა
pw-8-chars = სულ მცირე 8 სიმბოლო
pw-not-email = თქვენი ელფოსტის გარდა
pw-change-must-match = ახალი პაროლი ემთხვევა დასადასტურებელს
pw-commonly-used = ხშირად გამოყენებულის გარდა
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = დაიცავით უსაფრთხოება – ნუ გამოიყენებთ ერთსა და იმავე პაროლებს. ვრცლად იხილეთ რჩევები <linkExternal>ძლიერი პაროლის შესაქმნელად</linkExternal>.
pw-change-cancel-button = გაუქმება
pw-change-save-button = შენახვა
pw-change-forgot-password-link = დაგავიწყდათ პაროლი?
pw-change-current-password =
    .label = მიუთითეთ არსებული პაროლი
pw-change-new-password =
    .label = მიუთითეთ ახალი პაროლი
pw-change-confirm-password =
    .label = დაადასტურეთ პაროლი
pw-change-success-alert-2 = პაროლი განახლდა

## Password create page

pw-create-header =
    .title = პაროლის შექმნა
pw-create-success-alert-2 = პაროლი დაყენებულია
pw-create-error-2 = სამწუხაროდ, ხარვეზი წარმოიშვა პაროლის დაყენებისას

## Delete account page

delete-account-header =
    .title = ანგარიშის წაშლა
delete-account-step-1-2 = 1-ელი ნაბიჯი 2-დან
delete-account-step-2-2 = მე-2 ნაბიჯი 2-დან
delete-account-confirm-title-4 = შესაძლოა, თქვენი { -product-mozilla-account } დაკავშირებული იყოს რომელიმე { -brand-mozilla }-პროდუქტთან ან მომსახურებასთან, რომლებიც უზრუნველყოფს თქვენს უსაფრთხოებასა და შედეგიანობას ვებსივრცეში:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = სინქრონდება { -brand-firefox }-მონაცემები
delete-account-product-firefox-addons = { -brand-firefox } დამატებები
delete-account-acknowledge = გთხოვთ, გაითვალისწინოთ, რომ თქვენი ანგარიშის წაშლით:
delete-account-chk-box-1-v4 =
    .label = თქვენი ყველა ფასიანი გამოწერა გაუქმდება
delete-account-chk-box-2 =
    .label = შეიძლება დაკარგოთ შენახული ინფორმაცია და შესაძლებლობები { -brand-mozilla }-ს პროდუქტების
delete-account-chk-box-3 =
    .label = ამ ელფოსტის ხელახლა ამოქმედებით, თქვენი შენახული ინფორმაცია შეიძლება არ აღდგეს
delete-account-chk-box-4 =
    .label = ყველა გაფართოება და თემა, რომელიც addons.mozilla.org-ზე გამოგიქვეყნებიათ, წაიშლება
delete-account-continue-button = გაგრძელება
delete-account-password-input =
    .label = შეიყვანეთ პაროლი
delete-account-cancel-button = გაუქმება
delete-account-delete-button-2 = წაშლა

## Display name page

display-name-page-title =
    .title = გამოსაჩენი სახელი
display-name-input =
    .label = შეიყვანეთ გამოსაჩენი სახელი
submit-display-name = შენახვა
cancel-display-name = გაუქმება
display-name-update-error-2 = ხარვეზი წარმოიშვა თქვენი გამოსაჩენი სახელის განახლებისას
display-name-success-alert-2 = გამოსაჩენი სახელი განახლებულია

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = ანგარიშის ბოლო მოქმედებები
recent-activity-account-create-v2 = ანგარიში შეიქმნა
recent-activity-account-disable-v2 = ანგარიში გაითიშა
recent-activity-account-enable-v2 = ანგარიში ამოქმედდა
recent-activity-account-login-v2 = ანგარიშზე შესვლის წამოწყება
recent-activity-account-reset-v2 = პაროლის განულების წამოწყება
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = ელფოსტის დაბრუნებული წერილები გასუფთავდა
recent-activity-account-login-failure = ანგარიშში შესვლის უშედეგო მცდელობა
recent-activity-account-two-factor-added = ორბიჯიანი დამოწმება ჩაირთო
recent-activity-account-two-factor-requested = ორბიჯიანი დამოწმების მოთხოვნა
recent-activity-account-two-factor-failure = ორბიჯიანი დამოწმების უშედეგო მცდელობა
recent-activity-account-two-factor-success = ორბიჯიანი დამოწმების წარმატებული მცდელობა
recent-activity-account-two-factor-removed = ორბიჯიანი დამოწმება მოცილებულია
recent-activity-account-password-reset-requested = ანგარიშზე პაროლის განულების მოთხოვნა
recent-activity-account-password-reset-success = ანგარიშის პაროლის წარმატებით განულება
recent-activity-account-recovery-key-added = ანგარიშის აღდგენის გასაღები ამოქმედდა
recent-activity-account-recovery-key-verification-failure = ანგარიშის აღდგენის გასაღების უშედეგო დამოწმება
recent-activity-account-recovery-key-verification-success = ანგარიშის აღდგენის გასაღების წარმატებით დამოწმება
recent-activity-account-recovery-key-removed = ანგარიშის აღდგენის გასაღები მოცილდა
recent-activity-account-password-added = ახალი პაროლი დაემატა
recent-activity-account-password-changed = პაროლი შეიცვალა
recent-activity-account-secondary-email-added = ელფოსტის დამატებითი მისამართი დაერთო
recent-activity-account-secondary-email-removed = ელფოსტის დამატებითი მისამართი მოცილდა
recent-activity-account-emails-swapped = პირველადი და დამატებით ელფოსტა შენაცვლდა
recent-activity-session-destroy = გამოსულია სეანსიდან
recent-activity-account-recovery-phone-send-code = აღდგენის ტელეფონის კოდი გაიგზავნა
recent-activity-account-recovery-phone-setup-complete = აღდგენის ტელეფონის გამართვა დასრულდა
recent-activity-account-recovery-phone-signin-complete = აღდგენის ტელეფონით შესვლა დასრულდა
recent-activity-account-recovery-phone-signin-failed = აღდგენის ტელეფონით შესვლა ვერ მოხერხდა
recent-activity-account-recovery-phone-removed = აღდგენის ტელეფონი მოცილდა
recent-activity-account-recovery-codes-replaced = აღდგენის კოდები ჩანაცვლდა
recent-activity-account-recovery-codes-created = აღდგენის კოდები შეიქმნა
recent-activity-account-recovery-codes-signin-complete = აღდგენის კოდებით შესვლა დასრულდა
recent-activity-password-reset-otp-sent = პაროლის განულების დასადასტურებელი კოდი გამოგზავნილია
recent-activity-password-reset-otp-verified = პაროლის განულების დასადასტურებელი კოდი დამოწმებულია
recent-activity-must-reset-password = პაროლის განულება აუცილებელია
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = სხვა მოქმედებები ანგარიშზე

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = ანგარიშის აღდგენის გასაღები
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = პარამეტრებზე დაბრუნება

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = აღდგენის ტელეფონის მოცილება
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = შედეგად მოცილდება <strong>{ $formattedFullPhoneNumber }</strong> და აღარ იქნება გამოსადეგი აღდგენის ტელეფონად.
settings-recovery-phone-remove-recommend = ჩვენ გირჩევთ, ეს ხერხი დატოვოთ, ვინაიდან ეს მეტად ადვილი გზაა, ვიდრე სამარქაფო კოდების შენახვა.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = წაშლის შემთხვევაში დარწმუნდით, რომ ჯერ კიდევ გაქვთ შენახული შესვლის დამოწმების სამარქაფო კოდები. <linkExternal>შეადარეთ აღდგენის გზები</linkExternal>
settings-recovery-phone-remove-button = ტელეფონის ნომრის მოცილება
settings-recovery-phone-remove-cancel = გაუქმება
settings-recovery-phone-remove-success = აღდგენის ტელეფონი მოცილებულია

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = აღდგენის ტელეფონის დამატება
page-change-recovery-phone = აღდგენის ტელეფონის შეცვლა
page-setup-recovery-phone-back-button-title = პარამეტრებზე დაბრუნება
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = ტელეფონის ნომრის შეცვლა

## Add secondary email page

add-secondary-email-step-1 = 1-ელი ნაბიჯი 2-დან
add-secondary-email-error-2 = ხარვეზი წარმოიშვა ამ ელფოსტის შექმნისას
add-secondary-email-page-title =
    .title = დამატებითი ელფოსტა
add-secondary-email-enter-address =
    .label = შეიყვანეთ ელფოსტის მისამართი
add-secondary-email-cancel-button = გაუქმება
add-secondary-email-save-button = შენახვა
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = ელფოსტის ნიღბები ვერ ვერ მიეთითება დამატებით ელფოსტად

## Verify secondary email page

add-secondary-email-step-2 = მე-2 ნაბიჯი 2-დან
verify-secondary-email-page-title =
    .title = დამატებითი ელფოსტა
verify-secondary-email-verification-code-2 =
    .label = შეიყვანეთ დადასტურების კოდი
verify-secondary-email-cancel-button = გაუქმება
verify-secondary-email-verify-button-2 = დასტური
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = გთხოვთ, 5 წუთის განმავლობაში შეიყვანოთ დადასტურების კოდი, რომელიც გამოგზავნილია მისამართზე <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } წარმატებით დაემატა
verify-secondary-email-resend-code-button = დასტურის კოდის კვლავ გაგზავნა

##

# Link to delete account on main Settings page
delete-account-link = ანგარიშის წაშლა
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = ანგარიშზე შესვლა წარმატებით დასრულდა. თქვენი { -product-mozilla-account } და მონაცემები დარჩება მოქმედი.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = გამოარკვიეთ, სადმე ხომ არ გამჟღავნდა თქვენი მონაცემები და დაიბრუნეთ განკარგვის უფლება
# Links out to the Monitor site
product-promo-monitor-cta = შეამოწმეთ უფასოდ

## Profile section

profile-heading = პროფილი
profile-picture =
    .header = სურათი
profile-display-name =
    .header = გამოსაჩენი სახელი
profile-primary-email =
    .header = მთავარი ელფოსტა

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = { $currentStep } ნაჯიბი { $numberOfSteps }-იდან.

## Security section of Setting

security-heading = უსაფრთხოება
security-password =
    .header = პაროლი
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = შექმნის თარიღი { $date }
security-not-set = არაა დაყენებული
security-action-create = შექმნა
security-set-password = დააყენეთ პაროლი სინქრონიზაციისა და ანგარიშის უსაფრთხოების გარკვეული შესაძლებლობებით სარგებლობისთვის.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = ბოლო მოქმედებები ანგარიშზე
signout-sync-header = სეანსი ამოიწურა
signout-sync-session-expired = სამწუხაროდ, რაღაც ხარვეზია. გთხოვთ გამოხვიდეთ ბრაუზერის მენიუს ანგარიშიდან და სცადოთ ხელახლა.

## SubRow component

tfa-row-backup-codes-title = შესვლის სამარქაფო კოდები
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = კოდები არაა ხელმისაწვდომი
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } კოდია დარჩენილი
       *[other] { $numCodesAvailable } კოდია დარჩენილი
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = ახალი კოდების შექმნა
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = დამატება
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = ესაა აღდგენის მეტად უსაფრთხო გზა, თუ ვერ იყენებთ თქვენს მობილურ მოწყობილობას ან დამმოწმებელ პროგრამას.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = აღდგენის ტელეფონი
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = ტელეფონი არაა დამატებული
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = შეცვლა
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = დამატება
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = მოცილება
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = აღდგენის ტელეფონის მოცილება
tfa-row-backup-phone-delete-restriction-v2 = თუ გსურთ ამოშალოთ თქვენი აღდგენის ტელეფონი, დაამატეთ შესვლის სამარქაფო კოდები ან ჯერ გათიშეთ ორბიჯიანი დამოწმება, ანგარიში რომ არ ჩაგეკეტოთ.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = ესაა აღდგენის მეტად იოლი გზა, თუ ვერ იყენებთ თქვენს დამმოწმებელ პროგრამას.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = გაეცანით SIM-ბარათის შენაცვლების საფრთხის შესახებ

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = გამორთვა
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = ჩართვა
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = იგზავნება…
switch-is-on = ჩართ.
switch-is-off = გამორთ.

## Sub-section row Defaults

row-defaults-action-add = დამატება
row-defaults-action-change = შეცვლა
row-defaults-action-disable = ამორთვა
row-defaults-status = არცერთი

## Account recovery key sub-section on main Settings page

rk-header-1 = ანგარიშის აღდგენის გასაღები
rk-enabled = ჩართულია
rk-not-set = არაა დაყენებული
rk-action-create = შექმნა
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = შეცვლა
rk-action-remove = მოცილება
rk-key-removed-2 = ანგარიშის აღდგენის გასაღები მოცილებულია
rk-cannot-remove-key = თქვენი ანგარიშის აღდგენის გასაღების წაშლა ვერ მოხერხდა.
rk-refresh-key-1 = ანგარიშის აღდგენის გასაღების განახლება
rk-content-explain = აღადგინეთ მონაცემები, როცა პაროლი დაგავიწყდებათ.
rk-cannot-verify-session-4 = სამწუხაროდ, ხარვეზი წარმოიშვა თქვენი სეანსის დამოწმებისას
rk-remove-modal-heading-1 = მოცილდეს ანგარიშის აღდგენის გასაღები?
rk-remove-modal-content-1 =
    იმ შემთხვევაში, თუ თქვენს პაროლს გაანულებთ, ვეღარ შეძლებთ
    ანგარიშის აღდგენის გასაღებით თქვენს მონაცემებთან წვდომას. ეს ქმედება შეუქცევადია.
rk-remove-error-2 = თქვენი ანგარიშის აღდგენის გასაღების წაშლა ვერ მოხერხდა
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = ანგარიშის აღდგენის გასაღების წაშლა

## Secondary email sub-section on main Settings page

se-heading = დამატებითი ელფოსტა
    .header = დამატებითი ელფოსტა
se-cannot-refresh-email = სამწუხაროდ, ხარვეზი წარმოიშვა ამ ელფოსტის განახლებისას.
se-cannot-resend-code-3 = სამწუხაროდ, ხარვეზი წარმოიშვა დასტურის კოდის ხელახლა გამოგზავნისას
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } ახლა უკვე თქვენი მთავარი ელფოსტაა
se-set-primary-error-2 = სამწუხაროდ, ხარვეზი წარმოიშვა თქვენი მთავარი ელფოსტის შეცვლისას
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } წარმატებით წაიშალა
se-delete-email-error-2 = სამწუხაროდ, ხარვეზი წარმოიშვა ამ ელფოსტის წაშლისას
se-verify-session-3 = ამ მოქმედების შესასრულებლად თქვენი მიმდინარე სეანსის დამოწმება დაგჭირდებათ
se-verify-session-error-3 = სამწუხაროდ, ხარვეზი წარმოიშვა თქვენი სეანსის დამოწმებისას
# Button to remove the secondary email
se-remove-email =
    .title = ელფოსტის მოცილება
# Button to refresh secondary email status
se-refresh-email =
    .title = ელფოსტის განახლება
se-unverified-2 = დაუდასტურებელი
se-resend-code-2 =
    საჭიროა დადასტურება. <button>ახლიდან გაგზავნეთ დასადასტურებელი კოდი</button>
    თუ არ აღმოჩნდა შემოსული ან უსარგებლო წერილების საქაღალდეებში.
# Button to make secondary email the primary
se-make-primary = მთავარ მისამართად დაყენება
se-default-content = მიიღეთ თქვენს ანგარიშთან წვდომა, თუ ვერ შედიხართ მთავარი ელფოსტით.
se-content-note-1 =
    გაითვალისწინეთ: დამატებითი ელფოსტა ვერ აღადგენს თქვენს მონაცემებს — ამისთვის
    დაგჭირდებათ <a>ანგარიშის აღდგენის გასაღები</a>.
# Default value for the secondary email
se-secondary-email-none = ცარიელი

## Two Step Auth sub-section on Settings main page

tfa-row-header = ორბიჯიანი დამოწმება
tfa-row-enabled = ჩართულია
tfa-row-disabled-status = გამორთულია
tfa-row-action-add = დამატება
tfa-row-action-disable = გამორთვა
tfa-row-action-change = შეცვლა
tfa-row-button-refresh =
    .title = ორბიჯიანი დამოწმების განახლება
tfa-row-cannot-refresh = სამწუხაროდ, ხარვეზი წარმოიშვა ორბიჯიანი დამოწმების განახლებისას.
tfa-row-enabled-description = თქვენი ანგარიში დაცულია ორბიჯიანი დამოწმებით. დაგჭირდებათ ერთჯერადი შესვლის კოდის შეყვანა დამმოწმებელი აპიდან { -product-mozilla-account(case: "loc") } შესვლისას.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = როგორ იცავს ეს თქვენს ანგარიშს
tfa-row-disabled-description-v2 = თქვენი ანგარიშის დაცვისთვის დაიხმარეთ რომელიმე დამმოწმებელი პროგრამა ორბიჯიანი შესვლისთვის.
tfa-row-cannot-verify-session-4 = სამწუხაროდ, ხარვეზი წარმოიშვა თქვენი სეანსის დამოწმებისას
tfa-row-disable-modal-heading = გამოირთოს შესვლისას ორბიჯიანი დამოწმება?
tfa-row-disable-modal-confirm = გამორთვა
tfa-row-disable-modal-explain-1 =
    ეს ქმედება შეუქცევადია. ამასთანავე,
    შეგიძლიათ, <linkExternal>შეცვალოთ შესვლის სამარქაფო კოდები</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = ორბიჯიანი დამოწმება შესვლისას გამორთულია
tfa-row-cannot-disable-2 = ორბიჯიანი დამოწმება ვერ გამოირთვება
tfa-row-verify-session-info = ორბიჯიანი შესვლის გასამართეთ თქვენი მიმდინარე სეანსის დამოწმება დაგჭირდებათ

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = თუ განაგრძობთ, ამით თანახმა ხართ მიიღოთ:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla }-ს გამოწერილი მომსახურებების <mozSubscriptionTosLink> პირობები</mozSubscriptionTosLink> და <mozSubscriptionPrivacyLink>პირადულობის განაცხადი</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts } <mozillaAccountsTos>მომსახურების პირობები</mozillaAccountsTos> და <mozillaAccountsPrivacy>პირადულობის განაცხადი</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = თუ განაგრძობთ, ამით ეთანხმებით <mozillaAccountsTos>მომსახურების პირობებსა</mozillaAccountsTos> და <mozillaAccountsPrivacy>პირადულობის განაცხადს</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = ან
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = შესვლისთვის
continue-with-google-button = გამოიყენეთ { -brand-google }, რომ განაგრძოთ
continue-with-apple-button = გამოიყენეთ { -brand-apple }, რომ განაგრძოთ

## Auth-server based errors that originate from backend service

auth-error-102 = უცნობი ანგარიში
auth-error-103 = არასწორი პაროლი
auth-error-105-2 = არასწორი დამადასტურებელი კოდი
auth-error-110 = უმართებულო საშვი
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = ზედმეტად ბევრი მცდელობა. კვლავ სინჯეთ მოგვიანებით.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = ზედმეტად ბევრი მცდელობაა. მოითმინეთ { $retryAfter }.
auth-error-125 = მოთხოვნა უარყოფილია უსაფრთხოების მიზნით
auth-error-129-2 = მითითებული ტელეფონის ნომერი უმართებულოა. გთხოვთ გადაამოწმოთ და კვლავ სცადოთ.
auth-error-138-2 = დაუმოწმებელი სეანსი
auth-error-139 = ელფოსტის დამატებითი მისამართი უნდა განსხვავდებოდეს ანგარიშის ელფოსტისგან
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = ეს ელფოსტა სათადარიგოა სხვა ანგარიშისთვის. კვლავ სცადეთ მოგვიანებით ან გამოიყენეთ ელფოსტის სხვა მისამართი.
auth-error-155 = TOTP-საშვი ვერ მოიძებნა
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = შესვლის სამარქაფო კოდი ვერ მოიძებნა
auth-error-159 = ანგარიშის აღდგენის უმართებულო გასაღები
auth-error-183-2 = არასწორი ან ვადაგასული დამადასტურებელი კოდი
auth-error-202 = შესაძლებლობა ჩართული არაა
auth-error-203 = სისტემა მიუწვდომელია, სცადეთ მოგვიანებით
auth-error-206 = პაროლი ვერ შეიქმნება, პაროლი უკვე მითითებულია
auth-error-214 = აღდგენის ტელეფონის ნომერი უკვე არსებობს
auth-error-215 = აღდგენის ტელეფონის ნომერი არ არსებობს
auth-error-216 = ტექსტური შეტყობინებების ზღვარი მიღწეულია
auth-error-218 = აღდგენის ტელეფონის მოცილება ვერ ხერხდება, აკლია შესვლის სამარქაფო კოდები.
auth-error-219 = ტელეფონის ამ ნომრით ზედმეტად ბევრი ანგარიშია შექმნილი. გთხოვთ სცადოთ სხვა ნომერი.
auth-error-999 = მოულოდნელი შეცდომა
auth-error-1001 = შესვლის მცდელობა აღკვეთილია
auth-error-1002 = სეანსი ამოიწურა. შედით ანგარიშზე, რომ განაგრძოთ.
auth-error-1003 = ადგილობრივი საცავი ან ფუნთუშები კვლავ გათიშულია
auth-error-1008 = ახალი პაროლი ძველისგან უნდა განსხვავდებოდეს
auth-error-1010 = მართებული პაროლია აუცილებელი
auth-error-1011 = მართებული ელფოსტაა აუცილებელი
auth-error-1018 = დადასტურების გამოგზავნილი წერილი ელფოსტაზე უარყოფილია. მისამართი მცდარბეჭდილი ხომ არაა?
auth-error-1020 = მცდარბეჭდილია ელფოსტა? firefox.com ვერ იქნება ელფოსტის მართებული მომსახურება
auth-error-1031 = ანგარიშის შესაქმნელად უნდა მიუთითოთ ასაკი
auth-error-1032 = მართებული ასაკია აუცილებელი ანგარიშის შესაქმნელად
auth-error-1054 = ორბიჯიანი დამოწმების კოდი არასწორია
auth-error-1056 = შესვლის დამოწმების უმართებულო სამარქაფო კოდი
auth-error-1062 = გაუმართავი გადამისამართება
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = მცდარბეჭდილია ელფოსტა? { $domain } ვერ იქნება ელფოსტის მართებული მომსახურება
auth-error-1066 = ელფოსტის ნიღბები ვერ იქნება გამოყენებული ანგარიშის შესაქმნელად.
auth-error-1067 = მცდარბეჭდილია ელფოსტა?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = ნომრის დაბოლოებაა { $lastFourPhoneNumber }
oauth-error-1000 = რაღაც ხარვეზია. გთხოვთ დახუროთ ჩანართი და სცადოთ ხელახლა.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = მოგესალმებათ { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = ელფოსტა დადასტურებულია
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = შესვლა დადასტურებულია
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = შედით ამ { -brand-firefox }-ში გამართვის დასასრულებლად
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = შესვლა
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = გსურთ კიდევ დაამატოთ მოწყობილობები? შედით { -brand-firefox }-ში სხვა მოწყობილობიდან გამართვის დასასრულებლად
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = შედით { -brand-firefox }-ში მეორე მოწყობილობიდანაც გამართვის დასასრულებლად
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = გსურთ წვდომა თქვენს ჩანართებთან, სანიშნებთან და პაროლებთან სხვა მოწყობილობიდან?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = სხვა მოწყობილობის დაკავშირება
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = ახლა არა
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = შედით { -brand-firefox }-ში Android-ზე გამართვის დასასრულებლად
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = შედით { -brand-firefox }-ში iOS-ზე გამართვის დასასრულებლად

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = საჭიროა ადგილობრივი საცავისა და ფუნთუშების გამოყენება
cookies-disabled-enable-prompt-2 = გთხოვთ ჩართოთ ბრაუზერში ფუნთუშებსა და საცავთან წვდომა { -product-mozilla-account(case: "add") } დასაკავშირებლად. შედეგად ამოქმედდება სხვადასხვა შესაძლებლობა, მათ შორის თქვენი სეანსების დამახსოვრების საშუალება.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = ხელახლა ცდა
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = ვრცლად

## Index / home page

index-header = შეიყვანეთ თქვენი ელფოსტა
index-sync-header = განაგრძეთ თქვენი { -product-mozilla-account(case: "ins") }
index-sync-subheader = დაასინქრონეთ სანიშნები, ისტორია და პაროლები ყველგან, სადაც გიყენიათ { -brand-firefox }.
index-relay-header = ელფოსტის ნიღბის შექმნა
index-relay-subheader = გთხოვთ მიუთითოთ ელფოსტის მისამართი, რომელზეც გსურთ გადაიგზავნოს თქვენი შენიღბული ელფოსტიდან წერილები.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = განაგრძეთ და იხილეთ { $serviceName }
index-subheader-default = განაგრძეთ და იხილეთ ანგარიშის პარამეტრები
index-cta = შედით ან შექმენით ანგარიში
index-account-info = { -product-mozilla-account } აგრეთვე გზას გიხსნით პირადულობის უზრუნველმყოფ სხვა პროდუქტებისკენაც, რომელთაც ქმნის { -brand-mozilla }.
index-email-input =
    .label = შეიყვანეთ თქვენი ელფოსტა
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = ანგარიში წარმატებით წაიშალა
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = დადასტურების გამოგზავნილი წერილი ელფოსტაზე უარყოფილია. მისამართი მცდარბეჭდილი ხომ არაა?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = უჰ! ანგარიშის აღდგენის გასაღების შექმნა ვერ ხერხდება. მოგვიანებით სცადეთ.
inline-recovery-key-setup-recovery-created = ანგარიშის აღდგენის გასაღები შექმნილია
inline-recovery-key-setup-download-header = დაიცავით თქვენი ანგარიში
inline-recovery-key-setup-download-subheader = ჩამოტვირთეთ და შეინახეთ ახლავე
inline-recovery-key-setup-download-info = გადაინახეთ ეს გასაღები ადვილად მისაგნებ ადგილას — მოგვიანებით ამ გვერდზე დაბრუნება აღარ შეგეძლებათ.
inline-recovery-key-setup-hint-header = რჩევები უსაფრთხოებისთვის

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = გამართვის გაუქმება
inline-totp-setup-continue-button = გაგრძელება
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = დაამატეთ დაცვის დამატებითი შრე თქვენი ანგარიშისთვის, შესვლის კოდების მოთხოვნის სახით, <authenticationAppsLink>შესვლის დასამოწმებელი რომელიმე ამ პროგრამიდან</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = ჩართეთ შესვლის ორბიჯიანი დამოწმება, რომ იხილოთ <span>ანგარიშის პარამეტრები</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = ჩართეთ შესვლის ორბიჯიანი დამოწმება, რომ იხილოთ <span>{ $serviceName }</span>
inline-totp-setup-ready-button = მზადაა
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = წააკითხეთ შესვლის კოდი, <span>რომ იხილოთ { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = ხელით შეიყვანეთ კოდი, <span>რომ იხილოთ { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = წააკითხეთ შესვლის კოდი, <span>რომ იხილოთ ანგარიშის პარამეტრები</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = ხელით შეიყვანეთ კოდი, <span>რომ იხილოთ ანგარიშის პარამეტრები</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = აკრიფეთ ეს საიდუმლო გასაღები შესვლის დასამოწმებელ პროგრამაში. <toggleToQRButton>სანაცვლოდ გსურთ წააკითხოთ QR-კოდი?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = გადაუღეთ QR-კოდს შესვლის დასამოწმებელი პროგრამიდან და შემდეგ შეიყვანეთ მის მიერ მოწოდებული პაროლი. <toggleToManualModeButton>ვერ ხერხდება კოდის წაკითხვა?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = დასრულების შემდეგ დაიწყება უსაფრთხოების კოდების შედგენა გამოსაყენებლად.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = შესვლის დამოწმების კოდი
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = საჭიროა დამოწმების კოდი
tfa-qr-code-alt = გამოიყენეთ კოდი { $code } ორბიჯიანი დამოწმების გასამართად მხარდაჭერილ პროგრამებში.
inline-totp-setup-page-title = ორბიჯიანი დამოწმება

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = სამართლებრივი
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = მომსახურების პირობები
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = პირადულობის დაცვის განაცხადი

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = პირადულობის დაცვის განაცხადი

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = მომსახურების პირობები

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = ახლახან თქვენ შეხვედით { -product-firefox }-ში?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = დიახ, დადასტურდეს მოწყობილობა
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = თუ თქვენ არ ყოფილხართ, <link>შეცვალეთ პაროლი</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = მოწყობილობა დაკავშირებულია
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = ახლა დასინქრონებულია: { $deviceFamily } მოწყობილობაზე { $deviceOS }
pair-auth-complete-sync-benefits-text = ახლა უკვე შეგიძლიათ წვდომა თქვენს გახსნილ ჩანართებთან, პაროლებსა და სანიშნებთან ყველა მოწყობილობიდან.
pair-auth-complete-see-tabs-button = იხილეთ დასინქ. ჩანართები მოწყობილობებიდან
pair-auth-complete-manage-devices-link = მოწყობილობების მართვა

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = შეიყვანეთ შესვლის კოდი, <span>რომ იხილოთ ანგარიშის პარამეტრები</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = შეიყვანეთ შესვლის კოდი, <span>რომ იხილოთ { $serviceName }</span>
auth-totp-instruction = გახსენით შესვლის დასამოწმებელი პროგრამა და შეიყვანეთ შესვლის მოცემული კოდი.
auth-totp-input-label = შეიყვანეთ 6-ციფრიანი კოდი
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = თანხმობა
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = შესვლის დამოწმების კოდი აუცილებელია

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = ახლა საჭიროა დამოწმება <span>თქვენი მეორე მოწყობილობიდან</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = მიერთება ვერ მოხერხდა
pair-failure-message = გამართვის მიმდინარეობა შეწყვეტილია.

## Pair index page

pair-sync-header = დაასინქრონეთ { -brand-firefox } მობილურზე ან პლანშეტზე
pair-cad-header = დაუკავშირეთ { -brand-firefox } სხვა მოწყობილობას
pair-already-have-firefox-paragraph = უკვე გაქვთ { -brand-firefox } ტელეფონზე ან პლანშეტზე?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = დაასინქრონეთ მოწყობილობა
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = ან ჩამოტვირთეთ
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = წააკითხეთ, რომ ჩამოტვირთოთ { -brand-firefox } მობილურზე ან გაუგზავნეთ საკუთარ თავს <linkExternal>ჩამოსატვირთი ბმული</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = ახლა არა
pair-take-your-data-message = გაიყოლეთ თქვენი სანიშნები და პაროლები ყველგან, სადაც გიყენიათ { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = დაიწყეთ
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-კოდი

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = მოწყობილობა დაკავშირებულია
pair-success-message-2 = მიერთებულია წარმატებით.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = მიერთების დადასტურება <span>ელფოსტისთვის { $email }</span>
pair-supp-allow-confirm-button = მიერთების დადასტურება
pair-supp-allow-cancel-link = გაუქმება

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = ახლა საჭიროა დამოწმება <span>თქვენი მეორე მოწყობილობიდან</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = მიერთება აპლიკაციის გამოყენებით
pair-unsupported-message = სისტემის კამერას იყენებდით? მიერთებაა საჭირო { -brand-firefox }-პროგრამიდან.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = პაროლის შექმნა დასინქრონებისთვის
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = ამით დაიშიფრება თქვენი მონაცემები. განსხვავებული პაროლებით უნდა გქონდეთ ანგარიშები { -brand-google } და { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = გთხოვთ მოითმინოთ, სანამ გადამისამართდებით დამოწმებულ პროგრამაში.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = შეიყვანეთ ანგარიშის აღდგენის გასაღები
account-recovery-confirm-key-instruction = ეს გასაღები აღადგენს თქვენს დაშიფრულ მონაცემებს, მათ შორის პაროლებსა და სანიშნებს, რომელთაც { -brand-firefox } ინახავს სერვერებზე.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = შეიყვანეთ ანგარიშის აღდგენის 32-სიმბოლოიანი გასაღები
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = თქვენი შესანახის მინიშნებაა:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = გაგრძელება
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = ვერ იპოვეთ ანგარიშის აღდგენის გასაღები?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = შექმენით ახალი პაროლი
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = პაროლი დაყენებულია
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = სამწუხაროდ, ხარვეზი წარმოიშვა პაროლის დაყენებისას
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = გამოიყენეთ ანგარიშის აღდგენის გასაღები
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = თქვენი პაროლი აღდგა.
reset-password-complete-banner-message = არ დაგავიწყდეთ ანგარიშის აღდგენის ახალი გასაღებების შედგენა თქვენი { -product-mozilla-account(case: "gen") } პარამეტრებიდან მომავალში შესვლის ხარვეზების ასარიდებლად.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } ეცდება შესვლის შემდგომ უკან დაგაბრუნოთ ელფოსტის ნიღბის გამოსაყენებლად.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = შეიყვანეთ 10-ნიშნა კოდი
confirm-backup-code-reset-password-confirm-button = თანხმობა
confirm-backup-code-reset-password-subheader = შეიყვანეთ შესვლის სამარქაფო კოდი
confirm-backup-code-reset-password-instruction = შეიყვანეთ რომელიმე ერთჯერადი კოდი, რომელიც შეინახეთ ორბიჯიანი დამოწმების გამართვისას.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = ვერ ახერხებთ შესვლას?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = შეამოწმეთ თქვენი ელფოსტა
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = გამოგზავნილია დასადასტურებელი კოდი მისამართზე <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = შეიყვანეთ 8-ნიშნა კოდი 10 წუთში
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = გაგრძელება
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = კოდის კვლავ გაგზავნა
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = სხვა ანგარიშის გამოყენება

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = პაროლის განულება
confirm-totp-reset-password-subheader-v2 = ორბიჯიანი დამოწმების კოდის შეიყვანა
confirm-totp-reset-password-instruction-v2 = გამოიყენეთ <strong>დამმოწმებელი პროგრამა</strong> პაროლის აღსადგენად.
confirm-totp-reset-password-trouble-code = ვერ ახერხებთ კოდის შეყვანას?
confirm-totp-reset-password-confirm-button = დასტური
confirm-totp-reset-password-input-label-v2 = შეიყვანეთ 6-ნიშნა კოდი
confirm-totp-reset-password-use-different-account = სხვა ანგარიშის გამოყენება

## ResetPassword start page

password-reset-flow-heading = პაროლის განულება
password-reset-body-2 =
    ჩვენ მოგთხოვთ რამდენიმე რაღაცას, რაც მხოლოდ თქვენ გეცოდინებათ ანგარიშის
    დასაცავად.
password-reset-email-input =
    .label = შეიყვანეთ თქვენი ელფოსტა
password-reset-submit-button-2 = განაგრძეთ

## ResetPasswordConfirmed

reset-password-complete-header = თქვენი პაროლი აღდგა.
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = განაგრძეთ და იხილეთ { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = პაროლის განულება
password-reset-recovery-method-subheader = აირჩიეთ აღდგენის გზა
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = დარწმუნდით, რომ იყენებთ აღდგენის რომელიმე საშუალებას.
password-reset-recovery-method-phone = აღდგენის ტელეფონი
password-reset-recovery-method-code = შესვლის სამარქაფო კოდები
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } კოდია დარჩენილი
       *[other] { $numBackupCodes } კოდია დარჩენილი
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = ხარვეზი წარმოიშვა კოდის გამოგზავნისას თქვენს აღდგენის ტელეფონზე
password-reset-recovery-method-send-code-error-description = გთხოვთ, სცადოთ მოგვიანებით ან გამოიყენოთ დამოწმების სამარქაფო კოდები.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = პაროლის განულება
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = შეიყვანეთ აღდგენის კოდი
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = 6-ციფრიანი კოდი ტექსტური შეტყობინებით გამოიგზავნა ნომერზე დაბოლოებით <span>{ $lastFourPhoneDigits }</span>. კოდს ვადა გაუვა 5 წუთში. არავის გაუზიაროთ.
reset-password-recovery-phone-input-label = შეიყვანეთ 6-ციფრიანი კოდი
reset-password-recovery-phone-code-submit-button = თანხმობა
reset-password-recovery-phone-resend-code-button = კოდის კვლავ გაგზავნა
reset-password-recovery-phone-resend-success = კოდი გამოგზავნილია
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = ვეღარ ახერხებთ შესვლას?
reset-password-recovery-phone-send-code-error-heading = ხარვეზი წარმოიშვა კოდის გამოგზავნისას
reset-password-recovery-phone-code-verification-error-heading = ხარვეზი წარმოიშვა კოდის დამოწმებისას
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = გთხოვთ სცადოთ მოგვიანებით.
reset-password-recovery-phone-invalid-code-error-description = კოდი უმართებულო ან ვადაგასულია.
reset-password-recovery-phone-invalid-code-error-link = სანაცვლოდ გამოიყენებთ დამოწმების სამარქაფო კოდებს?
reset-password-with-recovery-key-verified-page-title = პაროლი აღდგა წარმატებით
reset-password-complete-new-password-saved = ახალი პაროლი შენახულია!
reset-password-complete-recovery-key-created = შექმნილია ანგარიშის აღდგენის გასაღები. ჩამოტვირთეთ და შეინახეთ ახლავე
reset-password-complete-recovery-key-download-info =
    ეს გასაღები გადამწყვეტია
    მონაცემთა აღდგენისთვის, თუ დაგავიწყდებათ პაროლი. <b>ჩამოტვირთეთ და შეინახეთ უსაფრთხოდ
    ახლავე, ვინაიდან მოგვიანებით ვეღარ შეძლებთ ამ გვერდთან წვდომას.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = შეცდომა:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = მიმდინარეობს შესვლის დამოწმება…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = დადასტურების შეცდომა
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = დასადასტურებელი ბმული ვადაგასულია
signin-link-expired-message-2 = ბმული, რომელზეც გადახვედით ვადაგასულია ან უკვე გამოყენებულია.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = შეიყვანეთ პაროლი <span>თქვენი { -product-mozilla-account(case: "ben") }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = გაიხსნება { $serviceName }
signin-subheader-without-logo-default = გადასვლა ანგარიშის პარამეტრებზე
signin-button = შესვლა
signin-header = შესვლა
signin-use-a-different-account-link = სხვა ანგარიშის გამოყენება
signin-forgot-password-link = დაგავიწყდათ პაროლი?
signin-password-button-label = პაროლი
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } ეცდება შესვლის შემდგომ უკან დაგაბრუნოთ ელფოსტის ნიღბის გამოსაყენებლად.
signin-code-expired-error = კოდი ვადაგასულია. გთხოვთ, ხელახლა შეხვიდეთ ანგარიშზე.
signin-account-locked-banner-heading = პაროლის განულება
signin-account-locked-banner-description = ჩვენ ანგარიში ჩაიკეტა საეჭვო მოქმედებებისგან თავდასაცავად.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = შესვლისთვის გაანულეთ პაროლი

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = ბმულს, რომელზეც გადახვედით ან სიმბოლოები აკლია, ან დაზიანებულია თქვენი ელფოსტის კლიენტის მიერ. ყურადღებით გადმოიტანეთ მისამართი და სცადეთ ხელახლა.
report-signin-header = გსურთ მოგვახსენოთ უნებართვო შესვლის შესახებ?
report-signin-body = ესაა შეტყობინება თქვენს ანგარიშთან წვდომის მცდელობის შესახებ. საეჭვოდ მიგაჩნიათ და გსურთ მოგვახსენოთ ამის შესახებ?
report-signin-submit-button = საეჭვო მოქმედების მოხსენება
report-signin-support-link = რის გამოა ეს?
report-signin-error = სამწუხაროდ, ხარვეზი წარმოიშვა მოხსენებისას.
signin-bounced-header = ვწუხვართ. თქვენი ანგარიში ჩაკეტილია.
# $email (string) - The user's email.
signin-bounced-message = დასადასტურებელი ბმულის { $email } ელფოსტაზე გამოგზავნა ვერ მოხერხდა და თქვენი ანგარიში ჩაიკეტა { -brand-firefox }-მონაცემთა უსაფრთხოებისთვის.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = თუ ელფოსტის მითითებული მისამართი მართებულია, <linkExternal>გვაცნობეთ</linkExternal> და დაგეხმარებით თქვენს ანგარიშთან წვდომის დაბრუნებაში.
signin-bounced-create-new-account = აღარ ფლობთ ელფოსტის ამ მისამართს? შექმენით ახალი ანგარიში
back = უკან

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = დაამოწმეთ შესვლა <span>ანგარიშის პარამეტრებზე გადასასვლელად</span>
signin-push-code-heading-w-custom-service = დაამოწმეთ შესვლა <span>რომ განაგრზოთ და იხილოთ { $serviceName }</span>
signin-push-code-instruction = გთხოვთ, ნახოთ სხვა მოწყობილობები და დაადასტუროთ ეს შესვლა თქვენი { -brand-firefox }-ბრაუზერიდან.
signin-push-code-did-not-recieve = არ მიგიღიათ შეტყობინება?
signin-push-code-send-email-link = ელფოსტის კოდი

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = დაადასტურეთ თქვენი შესვლა
signin-push-code-confirm-description = აღმოჩენილია შესვლის მცდელობა შემდეგი მოწყობილობიდან. თუ თქვენ იყავით, გთხოვთ დაადასტუროთ შესვლა
signin-push-code-confirm-verifying = მოწმდება
signin-push-code-confirm-login = შესვლის დადასტურება
signin-push-code-confirm-wasnt-me = არაფერი მომიმოქმედებია, შეიცვალოს პაროლი.
signin-push-code-confirm-login-approved = თქვენი შესვლა დამოწმებულია. გთხოვთ დახუროთ ფანჯარა.
signin-push-code-confirm-link-error = ბმულია დაზიანებული. გთხოვთ, კვლავ სცადოთ.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = შესვლა
signin-recovery-method-subheader = აირჩიეთ აღდგენის გზა
signin-recovery-method-details = დარწმუნდით, რომ იყენებთ აღდგენის რომელიმე საშუალებას.
signin-recovery-method-phone = აღდგენის ტელეფონი
signin-recovery-method-code-v2 = შესვლის სამარქაფო კოდები
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } კოდია დარჩენილი
       *[other] { $numBackupCodes } კოდია დარჩენილი
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = ხარვეზი წარმოიშვა კოდის გამოგზავნისას თქვენს აღდგენის ტელეფონზე
signin-recovery-method-send-code-error-description = გთხოვთ, სცადოთ მოგვიანებით ან გამოიყენოთ დამოწმების სამარქაფო კოდები.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = შესვლა
signin-recovery-code-sub-heading = შეიყვანეთ შესვლის სამარქაფო კოდი
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = შეიყვანეთ რომელიმე ერთჯერადი კოდი, რომელიც შეინახეთ ორბიჯიანი დამოწმების გამართვისას.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = შეიყვანეთ 10-ნიშნა კოდი
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = თანხმობა
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = აღდგენის ტელეფონის გამოყენება
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = ვერ ახერხებთ შესვლას?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = შესვლის დამოწმების სამარქაფო კოდი აუცილებელია
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = ხარვეზი წარმოიშვა კოდის გამოგზავნისას თქვენს აღდგენის ტელეფონზე
signin-recovery-code-use-phone-failure-description = გთხოვთ სცადოთ მოგვიანებით.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = შესვლა
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = შეიყვანეთ აღდგენის კოდი
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = ექვსციფრიანი კოდი ტექსტური შეტყობინებით გამოიგზავნა ნომერზე დაბოლოებით <span>{ $lastFourPhoneDigits }</span>. კოდს ვადა გაუვა 5 წუთში. არავის გაუზიაროთ.
signin-recovery-phone-input-label = შეიყვანეთ 6-ციფრიანი კოდი
signin-recovery-phone-code-submit-button = თანხმობა
signin-recovery-phone-resend-code-button = კოდის კვლავ გაგზავნა
signin-recovery-phone-resend-success = კოდი გამოგზავნილია
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = ვერ ახერხებთ შესვლას?
signin-recovery-phone-send-code-error-heading = ხარვეზი წარმოიშვა კოდის გამოგზავნისას.
signin-recovery-phone-code-verification-error-heading = ხარვეზი წარმოიშვა კოდის დამოწმებისას.
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = გთხოვთ კვლავ სცადოთ მოგვიანებით.
signin-recovery-phone-invalid-code-error-description = კოდი უმართებულო ან ვადაგასულია.
signin-recovery-phone-invalid-code-error-link = სანაცვლოდ გამოიყენებთ დამოწმების სამარქაფო კოდებს?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = შესვლა წარმატებულია. შეზღუდვები შეიძლება ახლდეს, თუ კვლავ გამოიყენებთ აღდგენის ტელეფონს.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = გმადლობთ ყურადღებისთვის
signin-reported-message = ჩვენი გუნდი უკვე გაფრთხილებულია. ამგვარი მოხსენებები გვეხმარება დამრღვევების გამოვლენასა და თავდაცვაში.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = შეიყვანეთ დასტურის კოდი<span> თქვენი { -product-mozilla-account(case: "ben") }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = შეიყვანეთ კოდი, რომელიც მოგივათ ელფოსტაზე <email>{ $email }</email> 5 წუთის განმავლობაში.
signin-token-code-input-label-v2 = შეიყვანეთ 6-ციფრიანი კოდი
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = დასტური
signin-token-code-code-expired = კოდი ვადაგასულია?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = ახალი კოდის გაგზავნა.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = საჭიროა დასტურის კოდი
signin-token-code-resend-error = Რაღაც ხარვეზი წარმოიშვა. ახალი კოდის გაგზავნა ვერ მოხერხდა.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } ეცდება შესვლის შემდგომ უკან დაგაბრუნოთ ელფოსტის ნიღბის გამოსაყენებლად.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = შესვლა
signin-totp-code-subheader-v2 = ორბიჯიანი დამოწმების კოდის შეიყვანა
signin-totp-code-instruction-v4 = გამოიყენეთ <strong>დამმოწმებელი პროგრამა</strong> შესვლის დასამოწმებლად.
signin-totp-code-input-label-v4 = შეიყვანეთ 6-ნიშნა კოდი
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = რატომ მოგეთხოვათ დამოწმება?
signin-totp-code-aal-banner-content = ორსაფეხურიანი დამოწმება გაქვთ გამართული ანგარიშზე, მაგრამ ამ მოწყობილობიდან კოდით ჯერ არ შესულხართ.
signin-totp-code-aal-sign-out = გამოსვლა ამ მოწყობილობაზე
signin-totp-code-aal-sign-out-error = სამწუხაროდ, ხარვეზი წარმოიშვა გამოსვლისას
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = დასტური
signin-totp-code-other-account-link = სხვა ანგარიშის გამოყენება
signin-totp-code-recovery-code-link = ვერ შეგყავთ კოდი?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = შესვლის დამოწმების კოდი აუცილებელია
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } ეცდება შესვლის შემდგომ უკან დაგაბრუნოთ ელფოსტის ნიღბის გამოსაყენებლად.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = ამ შესვლის დამოწმება
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = იხილეთ თქვენი ელფოსტა { $email }, რომელზეც გამოგზავნილია დამოწმების კოდი.
signin-unblock-code-input = შეიყვანეთ დამოწმების კოდი
signin-unblock-submit-button = განაგრძეთ
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = დამოწმების კოდი აუცილებელია
signin-unblock-code-incorrect-length = დამოწმების კოდი უნდა შედგებოდეს 8 სიმბოლოსგან
signin-unblock-code-incorrect-format-2 = დამოწმების კოდი უნდა შეიცავდეს მხოლოდ ასოებს და/ან ციფრებს
signin-unblock-resend-code-button = არ მიგიღიათ და არც ჯართის საქაღალდეშია? გაგზავნეთ ხელახლა
signin-unblock-support-link = რის გამოა ეს?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } ეცდება შესვლის შემდგომ უკან დაგაბრუნოთ ელფოსტის ნიღბის გამოსაყენებლად.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = შეიყვანეთ დადასტურების კოდი
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = შეიყვანეთ დასტურის კოდი <span>თქვენი { -product-mozilla-account(case: "ben") }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = შეიყვანეთ კოდი, რომელიც მოგივათ ელფოსტაზე <email>{ $email }</email> 5 წუთის განმავლობაში.
confirm-signup-code-input-label = შეიყვანეთ 6-ციფრიანი კოდი
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = დასტური
confirm-signup-code-sync-button = დასინქ. დაწყება
confirm-signup-code-code-expired = კოდი ვადაგასულია?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = ახალი კოდის გაგზავნა.
confirm-signup-code-success-alert = ანგარიში წარმატებით დამოწმდა
# Error displayed in tooltip.
confirm-signup-code-is-required-error = დადასტურების კოდის აუცილებელია
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } ეცდება შესვლის შემდგომ უკან დაგაბრუნოთ ელფოსტის ნიღბის გამოსაყენებლად.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = პაროლის შექმნა
signup-relay-info = პაროლი საჭიროა შენიღბული ელფოსტის უსაფრთხოდ სამართავად და დაცვის საშუალებებთან წვდომისთვის, რომელთაც უზრუნველყოფს { -brand-mozilla }.
signup-sync-info = დაასინქრონეთ თქვენი პაროლები, სანიშნები და სხვა მონაცემები ყველგან, სადაც კი გიყენიათ { -brand-firefox }.
signup-sync-info-with-payment = დაასინქრონეთ თქვენი პაროლები, გადახდის საშუალებები, სანიშნები და სხვა მონაცემები ყველგან, სადაც კი გიყენიათ { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = ელფოსტის შეცვლა

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = სინქრონიზაცია ჩართულია
signup-confirmed-sync-success-banner = { -product-mozilla-account } დამოწმებულია
signup-confirmed-sync-button = დაიწყეთ მოგზაურობა ინტერნეტში
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = თქვენი პაროლები, გადახდის საშუალებები, მისამართები, სანიშნები, ისტორია და ა. შ. შესაძლებელია დაასინქრონოთ ყველგან, სადაც გიყენიათ { -brand-firefox }.
signup-confirmed-sync-description-v2 = თქვენი პაროლები, მისამართები, სანიშნები, ისტორია და ა. შ. შესაძლებელია დაასინქრონოთ ყველგან, სადაც გიყენიათ { -brand-firefox }.
signup-confirmed-sync-add-device-link = სხვა მოწყობილობის დამატება
signup-confirmed-sync-manage-sync-button = სინქრონიზაციის მართვა
signup-confirmed-sync-set-password-success-banner = დასინქრონების პაროლი შეიქმნა
