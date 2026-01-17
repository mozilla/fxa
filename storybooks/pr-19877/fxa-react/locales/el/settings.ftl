# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Ένας νέος κωδικός στάλθηκε στο email σας.
resend-link-success-banner-heading = Ένας νέος σύνδεσμος στάλθηκε στο email σας.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Προσθέστε το { $accountsEmail } στις επαφές σας για να εξασφαλίσετε την ομαλή παράδοση.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Κλείσιμο μηνύματος
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = Οι { -product-firefox-accounts(case: "nom", capitalization: "lower") } θα γίνουν { -product-mozilla-accounts(case: "nom", capitalization: "lower") } την 1η Νοεμβρίου
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Θα συνεχίσετε να συνδέεστε με το ίδιο όνομα χρήστη και κωδικό πρόσβασης και δεν θα γίνουν άλλες αλλαγές στα προϊόντα που χρησιμοποιείτε.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Έχουμε μετονομάσει τους { -product-firefox-accounts(case: "acc", capitalization: "lower") } σε { -product-mozilla-accounts(case: "acc", capitalization: "lower") }. Θα συνεχίσετε να συνδέεστε με το ίδιο όνομα χρήστη και κωδικό πρόσβασης και δεν θα γίνουν άλλες αλλαγές στα προϊόντα που χρησιμοποιείτε.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Μάθετε περισσότερα
# Alt text for close banner image
brand-close-banner =
    .alt = Κλείσιμο μηνύματος
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Λογότυπο «m» της { -brand-mozilla }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Πίσω
button-back-title = Πίσω

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Λήψη και συνέχεια
    .title = Λήψη και συνέχεια
recovery-key-pdf-heading = Κλειδί ανάκτησης λογαριασμού
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Δημιουργία: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Κλειδί ανάκτησης λογαριασμού
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Αυτό το κλειδί σάς επιτρέπει να ανακτήσετε τα κρυπτογραφημένα δεδομένα του προγράμματος περιήγησής σας (συμπεριλαμβανομένων των κωδικών πρόσβασης, των σελιδοδεικτών και του ιστορικού) εάν ξεχάσετε τον κωδικό πρόσβασής σας. Αποθηκεύστε το σε ένα μέρος που θα θυμάστε.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Τοποθεσίες αποθήκευσης του κλειδιού σας
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Μάθετε περισσότερα σχετικά με το κλειδί ανάκτησης του λογαριασμού σας
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Δυστυχώς, προέκυψε πρόβλημα κατά τη λήψη του κλειδιού ανάκτησης του λογαριασμού σας.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Περισσότερα από τη { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Λάβετε τα τελευταία νέα και ενημερώσεις προϊόντων
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Πρώιμη πρόσβαση σε δοκιμές νέων προϊόντων
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Ειδοποιήσεις για δράσεις που αφορούν την ανάκτηση του ελέγχου του διαδικτύου

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Έγινε λήψη
datablock-copy =
    .message = Έγινε αντιγραφή
datablock-print =
    .message = Έγινε εκτύπωση

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Έγινε αντιγραφή του κωδικού
       *[other] Έγινε αντιγραφή των κωδικών
    }
datablock-download-success =
    { $count ->
        [one] Έγινε λήψη του κωδικού
       *[other] Έγινε λήψη των κωδικών
    }
datablock-print-success =
    { $count ->
        [one] Έγινε εκτύπωση του κωδικού
       *[other] Έγινε εκτύπωση των κωδικών
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Αντιγράφηκε

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (εκτίμηση)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (εκτίμηση)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (εκτίμηση)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (εκτίμηση)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Άγνωστη τοποθεσία
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } σε { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Διεύθυνση IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Κωδικός πρόσβασης
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Επανάληψη κωδικού πρόσβασης
form-password-with-inline-criteria-signup-submit-button = Δημιουργία λογαριασμού
form-password-with-inline-criteria-reset-new-password =
    .label = Νέος κωδικός πρόσβασης
form-password-with-inline-criteria-confirm-password =
    .label = Επιβεβαίωση κωδικού πρόσβασης
form-password-with-inline-criteria-reset-submit-button = Δημιουργία νέου κωδικού πρόσβασης
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Κωδικός πρόσβασης
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Επανάληψη κωδικού πρόσβασης
form-password-with-inline-criteria-set-password-submit-button = Έναρξη συγχρονισμού
form-password-with-inline-criteria-match-error = Οι κωδικοί πρόσβασης δεν ταιριάζουν
form-password-with-inline-criteria-sr-too-short-message = Ο κωδικός πρόσβασης πρέπει να περιέχει τουλάχιστον 8 χαρακτήρες.
form-password-with-inline-criteria-sr-not-email-message = Ο κωδικός πρόσβασης δεν πρέπει να περιέχει τη διεύθυνση email σας.
form-password-with-inline-criteria-sr-not-common-message = Ο κωδικός πρόσβασης δεν πρέπει να είναι ένας συνήθης κωδικός πρόσβασης.
form-password-with-inline-criteria-sr-requirements-met = Ο κωδικός πρόσβασης πληροί όλες τις απαιτήσεις.
form-password-with-inline-criteria-sr-passwords-match = Οι κωδικοί πρόσβασης ταιριάζουν.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Αυτό το πεδίο απαιτείται

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Εισαγάγετε τον { $codeLength }ψήφιο κωδικό για να συνεχίσετε
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Εισαγάγετε τον κωδικό { $codeLength } χαρακτήρων για να συνεχίσετε

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Κλειδί ανάκτησης λογαριασμού { -brand-firefox }
get-data-trio-title-backup-verification-codes = Εφεδρικοί κωδικοί ταυτοποίησης
get-data-trio-download-2 =
    .title = Λήψη
    .aria-label = Λήψη
get-data-trio-copy-2 =
    .title = Αντιγραφή
    .aria-label = Αντιγραφή
get-data-trio-print-2 =
    .title = Εκτύπωση
    .aria-label = Εκτύπωση

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Προειδοποίηση
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Προσοχή
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Προειδοποίηση
authenticator-app-aria-label =
    .aria-label = Εφαρμογή ελέγχου ταυτότητας
backup-codes-icon-aria-label-v2 =
    .aria-label = Οι εφεδρικοί κωδικοί ταυτοποίησης ενεργοποιήθηκαν
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Οι εφεδρικοί κωδικοί ταυτοποίησης απενεργοποιήθηκαν
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Η ανάκτησης μέσω SMS ενεργοποιήθηκε
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Η ανάκτησης μέσω SMS απενεργοποιήθηκε
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Καναδική σημαία
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Νύγμα
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Επιτυχία
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Ενεργοποίηση
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Κλείσιμο μηνύματος
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Κώδικας
error-icon-aria-label =
    .aria-label = Σφάλμα
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Πληροφορίες
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Σημαία Ηνωμένων Πολιτειών

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Ένας υπολογιστής, ένα κινητό τηλέφωνο και μια εικόνα ραγισμένης καρδιάς στο καθένα
hearts-verified-image-aria-label =
    .aria-label = Ένας υπολογιστής, ένα κινητό τηλέφωνο και ένα tablet με μια καρδιά που πάλλεται στο καθένα
signin-recovery-code-image-description =
    .aria-label = Έγγραφο που περιέχει κρυφό κείμενο.
signin-totp-code-image-label =
    .aria-label = Μια συσκευή με κρυφό εξαψήφιο κωδικό.
confirm-signup-aria-label =
    .aria-label = Ένας φάκελος που περιέχει έναν σύνδεσμο
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Απεικόνιση ενός κλειδιού ανάκτησης λογαριασμού.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Απεικόνιση που αναπαριστά ένα κλειδί ανάκτησης λογαριασμού.
password-image-aria-label =
    .aria-label = Μια απεικόνιση που αναπαριστά πληκτρολόγηση ενός κωδικού πρόσβασης.
lightbulb-aria-label =
    .aria-label = Απεικόνιση που αναπαριστά μια υπόδειξη για δημιουργία χώρου.
email-code-image-aria-label =
    .aria-label = Απεικόνιση που αναπαριστά ένα email που περιέχει έναν κωδικό.
recovery-phone-image-description =
    .aria-label = Κινητή συσκευή που λαμβάνει κωδικό μέσω μηνύματος κειμένου.
recovery-phone-code-image-description =
    .aria-label = Ελήφθη κωδικός σε κινητή συσκευή.
backup-recovery-phone-image-aria-label =
    .aria-label = Κινητή συσκευή με δυνατότητες μηνυμάτων κειμένου SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Οθόνη συσκευής με κωδικούς
sync-clouds-image-aria-label =
    .aria-label = Σύννεφα με εικονίδιο συγχρονισμού
confetti-falling-image-aria-label =
    .aria-label = Κινούμενη πτώση κομφετί

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Συνδεθήκατε στο { -brand-firefox }.
inline-recovery-key-setup-create-header = Ασφαλίστε τον λογαριασμό σας
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Έχετε χρόνο για να προστατέψετε τα δεδομένα σας;
inline-recovery-key-setup-info = Δημιουργήστε ένα κλειδί ανάκτησης λογαριασμού, ώστε να μπορείτε να επαναφέρετε τα συγχρονισμένα δεδομένα περιήγησής σας εάν ξεχάσετε τον κωδικό πρόσβασής σας.
inline-recovery-key-setup-start-button = Δημιουργία κλειδιού ανάκτησης λογαριασμού
inline-recovery-key-setup-later-button = Κάντε το αργότερα

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Απόκρυψη κωδικού πρόσβασης
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Εμφάνιση κωδικού πρόσβασης
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Ο κωδικός πρόσβασής σας είναι επί του παρόντος ορατός στην οθόνη.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Ο κωδικός πρόσβασής σας είναι κρυφός.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Ο κωδικός πρόσβασής σας είναι πλέον ορατός στην οθόνη.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Ο κωδικός πρόσβασής σας είναι πλέον κρυφός.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Επιλογή χώρας
input-phone-number-enter-number = Εισαγάγετε τον αριθμό τηλεφώνου
input-phone-number-country-united-states = Ηνωμένες Πολιτείες
input-phone-number-country-canada = Καναδάς
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Πίσω

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Ο σύνδεσμος επαναφοράς κωδικού πρόσβασης είναι κατεστραμμένος
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Ο σύνδεσμος επιβεβαίωσης είναι κατεστραμμένος
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Κατεστραμμένος σύνδεσμος
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Ο σύνδεσμος στον οποίο κάνατε κλικ δεν είχε κάποιους χαρακτήρες και ενδέχεται να έχει καταστραφεί από το πρόγραμμα email σας. Αντιγράψτε προσεκτικά τη διεύθυνση και δοκιμάστε ξανά.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Λήψη νέου συνδέσμου

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Απομνημόνευση κωδικού πρόσβασης;
# link navigates to the sign in page
remember-password-signin-link = Σύνδεση

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Το κύριο email έχει ήδη επαληθευτεί
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Η σύνδεση έχει ήδη επιβεβαιωθεί
confirmation-link-reused-message = Αυτός ο σύνδεσμος επιβεβαίωσης έχει ήδη χρησιμοποιηθεί και μπορεί να χρησιμοποιηθεί μόνο μία φορά.

## Locale Toggle Component

locale-toggle-select-label = Επιλογή γλώσσας
locale-toggle-browser-default = Προεπιλογή προγράμματος περιήγησης
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Εσφαλμένο αίτημα

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Χρειάζεστε αυτόν τον κωδικό πρόσβασης για την πρόσβαση σε τυχόν κρυπτογραφημένα δεδομένα που έχετε αποθηκεύσει σε εμάς.
password-info-balloon-reset-risk-info = Η επαναφορά κωδικού πρόσβασης σημαίνει πιθανή απώλεια δεδομένων, όπως κωδικών πρόσβασης και σελιδοδεικτών.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Επιλέξτε έναν ισχυρό κωδικό πρόσβασης που δεν έχετε χρησιμοποιήσει σε άλλους ιστοτόπους. Βεβαιωθείτε ότι πληροί τις απαιτήσεις ασφαλείας:
password-strength-short-instruction = Επιλέξτε έναν ισχυρό κωδικό πρόσβασης:
password-strength-inline-min-length = Τουλάχιστον 8 χαρακτήρες
password-strength-inline-not-email = Όχι τη διεύθυνση email σας
password-strength-inline-not-common = Όχι κάποιο συνήθη κωδικό πρόσβασής σας
password-strength-inline-confirmed-must-match = Η επιβεβαίωση ταιριάζει με τον νέο κωδικό πρόσβασης
password-strength-inline-passwords-match = Οι κωδικοί πρόσβασης ταιριάζουν

## Notification Promo Banner component

account-recovery-notification-cta = Δημιουργία
account-recovery-notification-header-value = Μην χάσετε τα δεδομένα σας εάν ξεχάσετε τον κωδικό πρόσβασής σας
account-recovery-notification-header-description = Δημιουργήστε ένα κλειδί ανάκτησης λογαριασμού, για να επαναφέρετε τα συγχρονισμένα δεδομένα περιήγησής σας σε περίπτωση που ξεχάσετε τον κωδικό πρόσβασής σας.
recovery-phone-promo-cta = Προσθήκη τηλεφώνου ανάκτησης
recovery-phone-promo-heading = Προσθέστε επιπλέον προστασία στον λογαριασμό σας με ένα τηλέφωνο ανάκτησης
recovery-phone-promo-description = Μπορείτε πλέον να συνδεθείτε με έναν κωδικό πρόσβασης μίας χρήσης μέσω SMS εάν δεν μπορείτε να χρησιμοποιήσετε την εφαρμογή ελέγχου ταυτότητας δύο παραγόντων.
recovery-phone-promo-info-link = Μάθετε περισσότερα σχετικά με την ανάκτηση και τον κίνδυνο εναλλαγής SIM
promo-banner-dismiss-button =
    .aria-label = Απόρριψη μηνύματος

## Ready component

ready-complete-set-up-instruction = Ολοκληρώστε τη ρύθμιση εισάγοντας τον νέο κωδικό πρόσβασής σας στις άλλες σας συσκευές με { -brand-firefox }.
manage-your-account-button = Διαχείριση του λογαριασμού σας
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Μπορείτε τώρα να χρησιμοποιήσετε το { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Μπορείτε πλέον χρησιμοποιήσετε τις ρυθμίσεις λογαριασμού
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Ο λογαριασμός σας είναι έτοιμος!
ready-continue = Συνέχεια
sign-in-complete-header = Η σύνδεση επιβεβαιώθηκε
sign-up-complete-header = Ο λογαριασμός επιβεβαιώθηκε
primary-email-verified-header = Το κύριο email επιβεβαιώθηκε

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Τοποθεσίες αποθήκευσης του κλειδιού σας:
flow-recovery-key-download-storage-ideas-folder-v2 = Φάκελος σε ασφαλή συσκευή
flow-recovery-key-download-storage-ideas-cloud = Αξιόπιστος χώρος αποθήκευσης σε cloud
flow-recovery-key-download-storage-ideas-print-v2 = Εκτυπωμένο φυσικό αντίγραφο
flow-recovery-key-download-storage-ideas-pwd-manager = Διαχείριση κωδικών πρόσβασης

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Προσθέστε μια υπόδειξη για να βρείτε εύκολα το κλειδί σας
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Αυτή η υπόδειξη θα σας βοηθήσει να θυμηθείτε πού αποθηκεύσατε το κλειδί ανάκτησης του λογαριασμού σας. Μπορούμε να σας την εμφανίσουμε κατά την επαναφορά του κωδικού πρόσβασης για να ανακτήσετε τα δεδομένα σας.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Εισαγάγετε μια υπόδειξη (προαιρετικό)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Τέλος
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Η υπόδειξη πρέπει να περιέχει λιγότερους από 255 χαρακτήρες.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Η υπόδειξη δεν μπορεί να περιέχει μη ασφαλείς χαρακτήρες unicode. Επιτρέπονται μόνο γράμματα, αριθμοί, σημεία στίξης και σύμβολα.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Προειδοποίηση
password-reset-chevron-expanded = Σύμπτυξη προειδοποίησης
password-reset-chevron-collapsed = Ανάπτυξη προειδοποίησης
password-reset-data-may-not-be-recovered = Τα δεδομένα του προγράμματος περιήγησής σας ενδέχεται να μην ανακτηθούν
password-reset-previously-signed-in-device-2 = Είχατε συνδεθεί από κάποια συσκευή στο παρελθόν;
password-reset-data-may-be-saved-locally-2 = Τα δεδομένα του προγράμματος περιήγησής σας ενδέχεται να έχουν αποθηκευτεί σε εκείνη τη συσκευή. Κάντε επαναφορά του κωδικού πρόσβασής σας και συνδεθείτε εκεί για να ανακτήσετε και να συγχρονίσετε τα δεδομένα σας.
password-reset-no-old-device-2 = Έχετε μια νέα συσκευή, αλλά δεν έχετε πρόσβαση σε καμία από τις προηγούμενες;
password-reset-encrypted-data-cannot-be-recovered-2 = Λυπούμαστε, αλλά δεν είναι δυνατή η ανάκτηση των κρυπτογραφημένων δεδομένων περιήγησής σας από τους διακομιστές του { -brand-firefox }.
password-reset-warning-have-key = Διαθέτετε κλειδί ανάκτησης λογαριασμού;
password-reset-warning-use-key-link = Χρησιμοποιήστε το τώρα για να επαναφέρετε τον κωδικό πρόσβασής σας και να διατηρήσετε τα δεδομένα σας

## Alert Bar

alert-bar-close-message = Κλείσιμο μηνύματος

## User's avatar

avatar-your-avatar =
    .alt = Η εικόνα σας
avatar-default-avatar =
    .alt = Προεπιλεγμένη εικόνα χρήστη

##


# BentoMenu component

bento-menu-title-3 = Προϊόντα { -brand-mozilla }
bento-menu-tagline = Περισσότερα προϊόντα από τη { -brand-mozilla } που προστατεύουν το απόρρητό σας
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } για υπολογιστές
bento-menu-firefox-mobile = { -brand-firefox } για κινητές συσκευές
bento-menu-made-by-mozilla = Από τη { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Αποκτήστε το { -brand-firefox } για κινητά ή tablet
connect-another-find-fx-mobile-2 = Βρείτε το { -brand-firefox } στο { -google-play } και το { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Λήψη του { -brand-firefox } στο { -google-play }
connect-another-app-store-image-3 =
    .alt = Λήψη του { -brand-firefox } στο { -app-store }

## Connected services section

cs-heading = Συνδεδεμένες υπηρεσίες
cs-description = Όλες οι υπηρεσίες που χρησιμοποιείτε και έχετε κάνετε σύνδεση.
cs-cannot-refresh =
    Δυστυχώς, προέκυψε πρόβλημα με την ανανέωση της λίστας συνδεδεμένων
    υπηρεσιών.
cs-cannot-disconnect = Η εφαρμογή πελάτη δεν βρέθηκε, δεν είναι δυνατή η αποσύνδεση
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Έγινε αποσύνδεση από το { $service }
cs-refresh-button =
    .title = Ανανέωση συνδεδεμένων υπηρεσιών
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Απουσία ή διπλή παρουσία στοιχείων;
cs-disconnect-sync-heading = Αποσύνδεση από το Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Τα δεδομένα περιήγησής σας θα παραμείνουν στο <span>{ $device }</span>,
    αλλά δεν θα συγχρονίζονται πλέον με τον λογαριασμό σας.
cs-disconnect-sync-reason-3 = Ποιος είναι ο κύριος λόγος για την αποσύνδεση του <span>{ $device }</span>;

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Η συσκευή:
cs-disconnect-sync-opt-suspicious = Είναι ύποπτη
cs-disconnect-sync-opt-lost = Έχει χαθεί ή κλαπεί
cs-disconnect-sync-opt-old = Είναι παλιά ή έχει αντικατασταθεί
cs-disconnect-sync-opt-duplicate = Είναι αντίγραφο
cs-disconnect-sync-opt-not-say = Προτιμώ να μην πω

##

cs-disconnect-advice-confirm = Εντάξει, το κατάλαβα
cs-disconnect-lost-advice-heading = Αποσυνδέθηκε απολεσθείσα ή κλεμμένη συσκευή
cs-disconnect-lost-advice-content-3 = Εφόσον η συσκευή σας χάθηκε ή κλάπηκε, θα πρέπει να αλλάξετε τον κωδικό πρόσβασης του { -product-mozilla-account(case: "gen", capitalization: "lower") } στις ρυθμίσεις λογαριασμού σας, για την προστασία των δεδομένων σας. Θα πρέπει επίσης να αναζητήσετε πληροφορίες από τον κατασκευαστή της συσκευής σας σχετικά με την απομακρυσμένη διαγραφή δεδομένων.
cs-disconnect-suspicious-advice-heading = Η ύποπτη συσκευή αποσυνδέθηκε
cs-disconnect-suspicious-advice-content-2 =
    Αν η αποσυνδεδεμένη συσκευή είναι πράγματι ύποπτη, θα πρέπει να αλλάξετε τον κωδικό πρόσβασης του
    { -product-mozilla-account(case: "gen", capitalization: "lower") } σας, για την προστασία των δεδομένων σας. Θα πρέπει επίσης να αλλάξετε όλους τους άλλους αποθηκευμένους κωδικούς πρόσβασης του { -brand-firefox } στη σελίδα «about:logins».
cs-sign-out-button = Αποσύνδεση

## Data collection section

dc-heading = Συλλογή και χρήση δεδομένων
dc-subheader-moz-accounts = { -product-mozilla-accounts(case: "nom", capitalization: "upper") }
dc-subheader-ff-browser = Πρόγραμμα περιήγησης { -brand-firefox }
dc-subheader-content-2 = Να επιτρέπεται στους { -product-mozilla-accounts(case: "acc", capitalization: "lower") } η αποστολή τεχνικών δεδομένων και δεδομένων αλληλεπίδρασης στη { -brand-mozilla }.
dc-subheader-ff-content = Για να ελέγξετε ή να ενημερώσετε τις ρυθμίσεις των τεχνικών δεδομένων και των δεδομένων αλληλεπίδρασης του προγράμματος περιήγησης { -brand-firefox }, ανοίξτε τις ρυθμίσεις του { -brand-firefox } και μεταβείτε στην ενότητα «Απόρρητο και ασφάλεια».
dc-opt-out-success-2 = Επιτυχής απενεργοποίηση. Οι { -product-mozilla-accounts(case: "nom", capitalization: "lower") } δεν θα στέλνουν τεχνικά δεδομένα ή δεδομένα αλληλεπίδρασης στη { -brand-mozilla }.
dc-opt-in-success-2 = Ευχαριστούμε! Η κοινοποίηση αυτών των δεδομένων μάς βοηθά να βελτιώσουμε τους { -product-mozilla-accounts(case: "acc", capitalization: "lower") }.
dc-opt-in-out-error-2 = Δυστυχώς, προέκυψε πρόβλημα κατά την αλλαγή της προτίμησής σας για τη συλλογή δεδομένων
dc-learn-more = Μάθετε περισσότερα

# DropDownAvatarMenu component

drop-down-menu-title-2 = Μενού { -product-mozilla-account(case: "gen", capitalization: "lower") }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Συνδεθήκατε ως
drop-down-menu-sign-out = Αποσύνδεση
drop-down-menu-sign-out-error-2 = Δυστυχώς, προέκυψε πρόβλημα κατά την αποσύνδεση

## Flow Container

flow-container-back = Πίσω

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Εισαγάγετε ξανά τον κωδικό πρόσβασής σας για ασφάλεια
flow-recovery-key-confirm-pwd-input-label = Εισαγάγετε τον κωδικό πρόσβασής σας
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Δημιουργία κλειδιού ανάκτησης λογαριασμού
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Δημιουργία νέου κλειδιού ανάκτησης λογαριασμού

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Το κλειδί ανάκτησης λογαριασμού δημιουργήθηκε. Κάντε λήψη και αποθήκευσή του τώρα
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Αυτό το κλειδί σάς επιτρέπει να ανακτήσετε τα δεδομένα σας εάν ξεχάσετε τον κωδικό πρόσβασής σας. Αποθηκεύστε το κάπου που θα θυμάστε. Δεν θα μπορείτε να επιστρέψετε σε αυτήν τη σελίδα αργότερα.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Συνέχεια χωρίς λήψη

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Το κλειδί ανάκτησης λογαριασμού δημιουργήθηκε

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Δημιουργήστε ένα κλειδί ανάκτησης λογαριασμού σε περίπτωση που ξεχάσετε τον κωδικό πρόσβασής σας
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Αλλαγή κλειδιού ανάκτησης λογαριασμού
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Κρυπτογραφούμε τα δεδομένα περιήγησης, τους κωδικούς πρόσβασης, τους σελιδοδείκτες και πολλά άλλα. Είναι εξαιρετικό για το απόρρητο, αλλά μπορεί να χάσετε τα δεδομένα σας εάν ξεχάσετε τον κωδικό πρόσβασής σας.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Αυτός είναι ο λόγος για τον οποίο η δημιουργία ενός κλειδιού ανάκτησης λογαριασμού είναι τόσο σημαντική: μπορείτε να το χρησιμοποιήσετε για να επαναφέρετε τα δεδομένα σας.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Έναρξη
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Ακύρωση

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Συνδεθείτε στην εφαρμογή ελέγχου ταυτότητάς σας
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Βήμα 1:</strong> Σαρώστε αυτόν τον κωδικό QR με οποιαδήποτε εφαρμογή ελέγχου ταυτότητας, όπως το Duo ή τον Επαληθευτή Google.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Κωδικός QR για τη ρύθμιση της ταυτοποίησης δύο παραγόντων. Σαρώστε τον ή επιλέξτε «Αδυναμία σάρωσης κωδικού QR;» για να αποκτήστε ένα μυστικό κλειδί ρύθμισης.
flow-setup-2fa-cant-scan-qr-button = Αδυναμία σάρωσης κωδικού QR;
flow-setup-2fa-manual-key-heading = Εισαγάγετε τον κωδικό χειροκίνητα
flow-setup-2fa-manual-key-instruction = <strong>Βήμα 1:</strong> Εισαγάγετε αυτόν τον κωδικό στην εφαρμογή ελέγχου ταυτότητας της επιλογής σας.
flow-setup-2fa-scan-qr-instead-button = Σάρωση κωδικού QR;
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Μάθετε περισσότερα για τις εφαρμογές ελέγχου ταυτότητας
flow-setup-2fa-button = Συνέχεια
flow-setup-2fa-step-2-instruction = <strong>Βήμα 2:</strong> Εισαγάγετε τον κωδικό από την εφαρμογή ελέγχου ταυτότητάς σας.
flow-setup-2fa-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
flow-setup-2fa-code-error = Μη έγκυρος ή ληγμένος κωδικός. Ελέγξτε την εφαρμογή ελέγχου ταυτότητας και δοκιμάστε ξανά.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Επιλέξτε μια μέθοδο ανάκτησης
flow-setup-2fa-backup-choice-description = Αυτή σας επιτρέπει να συνδεθείτε εάν χάσετε την πρόσβαση στην κινητή συσκευή ή την εφαρμογή ελέγχου ταυτότητάς σας.
flow-setup-2fa-backup-choice-phone-title = Τηλέφωνο ανάκτησης
flow-setup-2fa-backup-choice-phone-badge = Ευκολότερη μέθοδος
flow-setup-2fa-backup-choice-phone-info = Λάβετε έναν κωδικό ανάκτησης μέσω γραπτού μηνύματος. Διατίθεται προς το παρόν στις ΗΠΑ και τον Καναδά.
flow-setup-2fa-backup-choice-code-title = Εφεδρικοί κωδικοί ταυτοποίησης
flow-setup-2fa-backup-choice-code-badge = Ασφαλέστερη μέθοδος
flow-setup-2fa-backup-choice-code-info = Δημιουργήστε και αποθηκεύστε κωδικούς ταυτοποίησης μιας χρήσης.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Μάθετε για την ανάκτηση και τον κίνδυνο εναλλαγής SIM

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Εισαγάγετε εφεδρικό κωδικό ταυτοποίησης
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Πληκτρολογήστε έναν από τους κωδικούς σας για να επιβεβαιώσετε ότι τους έχετε αποθηκεύσει. Χωρίς αυτούς τους κωδικούς, ενδέχεται να μην μπορείτε να συνδεθείτε αν δεν έχετε την εφαρμογή ελέγχου ταυτότητάς σας.
flow-setup-2fa-backup-code-confirm-code-input = Εισαγάγετε κωδικό 10 χαρακτήρων
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Τέλος

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Αποθήκευση εφεδρικών κωδικών ταυτοποίησης
flow-setup-2fa-backup-code-dl-save-these-codes = Διατηρήστε τους σε ένα μέρος που θα θυμάστε. Σε περίπτωση που δεν έχετε πρόσβαση στην εφαρμογή ελέγχου ταυτότητάς σας, θα χρειαστεί να εισαγάγετε έναν από αυτούς τους κωδικούς για να συνδεθείτε.
flow-setup-2fa-backup-code-dl-button-continue = Συνέχεια

##

flow-setup-2fa-inline-complete-success-banner = Η ταυτοποίηση δύο παραγόντων ενεργοποιήθηκε
flow-setup-2fa-inline-complete-success-banner-description = Για την προστασία όλων των συνδεδεμένων συσκευών σας, θα πρέπει να αποσυνδεθείτε από οπουδήποτε χρησιμοποιείτε αυτόν τον λογαριασμό και έπειτα, να συνδεθείτε ξανά με τη χρήση της νέας σας ταυτοποίησης δύο παραγόντων.
flow-setup-2fa-inline-complete-backup-code = Εφεδρικοί κωδικοί ταυτοποίησης
flow-setup-2fa-inline-complete-backup-phone = Τηλέφωνο ανάκτησης
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Απομένει { $count } κωδικός
       *[other] Απομένουν { $count } κωδικοί
    }
flow-setup-2fa-inline-complete-backup-code-description = Αυτή είναι η πιο ασφαλής μέθοδος ανάκτησης εάν δεν μπορείτε να συνδεθείτε με την κινητή σας συσκευή ή την εφαρμογή ελέγχου ταυτότητάς σας.
flow-setup-2fa-inline-complete-backup-phone-description = Αυτή είναι η πιο εύκολη μέθοδος ανάκτησης εάν δεν μπορείτε να συνδεθείτε με την εφαρμογή ελέγχου ταυτότητάς σας.
flow-setup-2fa-inline-complete-learn-more-link = Πώς προστατεύεται ο λογαριασμός σας
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Συνέχεια στο { $serviceName }
flow-setup-2fa-prompt-heading = Ρύθμιση ταυτοποίησης δύο παραγόντων
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = Το { $serviceName } απαιτεί να ρυθμίσετε την ταυτοποίηση δύο παραγόντων για την προστασία του λογαριασμού σας.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Μπορείτε να χρησιμοποιήσετε οποιαδήποτε από <authenticationAppsLink>αυτές τις εφαρμογές ελέγχου ταυτότητας</authenticationAppsLink> για να συνεχίσετε.
flow-setup-2fa-prompt-continue-button = Συνέχεια

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Εισάγετε τον κωδικό επαλήθευσής
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Ένας εξαψήφιος κωδικός έχει αποσταλεί στο <span>{ $phoneNumber }</span> μέσω μηνύματος κειμένου. Αυτός ο κωδικός λήγει μετά από 5 λεπτά.
flow-setup-phone-confirm-code-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
flow-setup-phone-confirm-code-button = Επιβεβαίωση
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Έληξε ο κωδικός;
flow-setup-phone-confirm-code-resend-code-button = Αποστολή νέου κωδικού
flow-setup-phone-confirm-code-resend-code-success = Ο κωδικός απεστάλη
flow-setup-phone-confirm-code-success-message-v2 = Προστέθηκε τηλέφωνο ανάκτησης
flow-change-phone-confirm-code-success-message = Το τηλέφωνο ανάκτησης άλλαξε

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Επαληθεύστε τον αριθμό τηλεφώνου σας
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Θα λάβετε ένα μήνυμα κειμένου από τη { -brand-mozilla } με έναν κωδικό για την επαλήθευση του αριθμού σας. Μην μοιραστείτε αυτόν τον κωδικό με κανέναν.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Το τηλέφωνο ανάκτησης είναι διαθέσιμο μόνο στις Ηνωμένες Πολιτείες και τον Καναδά. Δεν προτείνεται η χρήση αριθμών VoIP και μασκών τηλεφώνου.
flow-setup-phone-submit-number-legal = Παρέχοντας τον αριθμό σας, συμφωνείτε με την αποθήκευσή του από εμάς, ώστε να μπορούμε να σας στέλνουμε μηνύματα αποκλειστικά για την επαλήθευση του λογαριασμού σας. Ενδέχεται να ισχύουν χρεώσεις μηνυμάτων και δεδομένων.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Αποστολή κωδικού

## HeaderLockup component, the header in account settings

header-menu-open = Κλείσιμο μενού
header-menu-closed = Μενού πλοήγησης ιστοτόπου
header-back-to-top-link =
    .title = Επιστροφή στην κορυφή
header-back-to-settings-link =
    .title = Επιστροφή στις ρυθμίσεις { -product-mozilla-account(case: "gen", capitalization: "lower") }
header-title-2 = { -product-mozilla-account(case: "nom", capitalization: "upper") }
header-help = Βοήθεια

## Linked Accounts section

la-heading = Συνδεδεμένοι λογαριασμοί
la-description = Έχετε παραχωρήσει πρόσβαση στους εξής λογαριασμούς.
la-unlink-button = Αποσύνδεση
la-unlink-account-button = Αποσύνδεση
la-set-password-button = Ορισμός κωδικού πρόσβασης
la-unlink-heading = Αποσύνδεση από τρίτο λογαριασμό
la-unlink-content-3 = Θέλετε σίγουρα να αποσυνδέσετε τον λογαριασμό σας; Η αποσύνδεση του λογαριασμού σας δεν θα σας αποσυνδέσει αυτόματα από τις συνδεδεμένες υπηρεσίες σας. Για να το κάνετε αυτό, θα πρέπει να αποσυνδεθείτε χειροκίνητα από την ενότητα «Συνδεδεμένες υπηρεσίες».
la-unlink-content-4 = Πριν αποσυνδέσετε τον λογαριασμό σας, πρέπει να ορίσετε έναν κωδικό πρόσβασης. Χωρίς κωδικό πρόσβασης, δεν θα υπάρχει τρόπος να κάνετε είσοδο μετά την αποσύνδεση του λογαριασμού σας.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Κλείσιμο
modal-cancel-button = Ακύρωση
modal-default-confirm-button = Επιβεβαίωση

## ModalMfaProtected

modal-mfa-protected-title = Εισαγωγή κωδικού επιβεβαίωσης
modal-mfa-protected-subtitle = Βοηθήστε μας να βεβαιωθούμε ότι εσείς αλλάζετε τα στοιχεία του λογαριασμού σας
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Εισαγάγετε τον κωδικό που απεστάλη στο <email>{ $email }</email> εντός { $expirationTime } λεπτού.
       *[other] Εισαγάγετε τον κωδικό που απεστάλη στο <email>{ $email }</email> εντός { $expirationTime } λεπτών.
    }
modal-mfa-protected-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
modal-mfa-protected-cancel-button = Ακύρωση
modal-mfa-protected-confirm-button = Επιβεβαίωση
modal-mfa-protected-code-expired = Έληξε ο κωδικός;
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Αποστολή νέου κωδικού.

## Modal Verify Session

mvs-verify-your-email-2 = Επιβεβαίωση email
mvs-enter-verification-code-2 = Εισαγωγή κωδικού επιβεβαίωσης
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Εισαγάγετε τον κωδικό επιβεβαίωσης που απεστάλη στο <email>{ $email }</email> εντός 5 λεπτών.
msv-cancel-button = Ακύρωση
msv-submit-button-2 = Επιβεβαίωση

## Settings Nav

nav-settings = Ρυθμίσεις
nav-profile = Προφίλ
nav-security = Ασφάλεια
nav-connected-services = Συνδεδεμένες υπηρεσίες
nav-data-collection = Συλλογή και χρήση δεδομένων
nav-paid-subs = Συνδρομές επί πληρωμή
nav-email-comm = Επικοινωνία μέσω email

## Page2faChange

page-2fa-change-title = Τροποποίηση ελέγχου ταυτότητας δύο παραγόντων
page-2fa-change-success = Η ταυτοποίηση δύο παραγόντων έχει ενημερωθεί
page-2fa-change-success-additional-message = Για την προστασία όλων των συνδεδεμένων συσκευών σας, θα πρέπει να αποσυνδεθείτε από οπουδήποτε χρησιμοποιείτε αυτόν τον λογαριασμό και έπειτα, να συνδεθείτε ξανά με τη χρήση της νέας σας ταυτοποίησης δύο παραγόντων.
page-2fa-change-totpinfo-error = Προέκυψε σφάλμα κατά την αντικατάσταση της εφαρμογής ταυτοποίησης δύο παραγόντων. Δοκιμάστε ξανά αργότερα.
page-2fa-change-qr-instruction = <strong>Βήμα 1:</strong> Σαρώστε τον κωδικό QR με οποιαδήποτε εφαρμογή ελέγχου ταυτότητας, όπως το Duo ή το Google Authenticator. Αυτό δημιουργεί μια νέα σύνδεση και οι παλιές συνδέσεις δεν θα λειτουργούν πλέον.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Εφεδρικοί κωδικοί ταυτοποίησης
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Προέκυψε πρόβλημα κατά την αντικατάσταση των εφεδρικών κωδικών ταυτοποίησής σας
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Προέκυψε πρόβλημα κατά τη δημιουργία των εφεδρικών κωδικών ταυτοποίησής σας
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Οι εφεδρικοί κωδικοί ταυτοποίησης ενημερώθηκαν
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Οι εφεδρικοί κωδικοί ταυτοποίησης δημιουργήθηκαν
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Φυλάξτε τους σε ένα μέρος που θα θυμάστε. Οι παλιοί σας κωδικοί ταυτοποίησης θα αντικατασταθούν αφού ολοκληρώσετε το επόμενο βήμα.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Επιβεβαιώστε ότι έχετε αποθηκεύσει τους κωδικούς ταυτοποίησης σας εισάγοντας έναν. Οι παλιοί σας εφεδρικοί κωδικοί θα απενεργοποιηθούν μόλις ολοκληρωθεί αυτό το βήμα.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Εσφαλμένος εφεδρικός κωδικός ταυτοποίησης

## Page2faSetup

page-2fa-setup-title = Ταυτοποίηση δύο παραγόντων
page-2fa-setup-totpinfo-error = Προέκυψε σφάλμα κατά τη ρύθμιση της ταυτοποίησης δύο παραγόντων. Δοκιμάστε ξανά αργότερα.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Αυτός ο κωδικός δεν είναι σωστός. Δοκιμάστε ξανά.
page-2fa-setup-success = Η ταυτοποίηση δύο παραγόντων έχει ενεργοποιηθεί
page-2fa-setup-success-additional-message = Για την προστασία όλων των συνδεδεμένων συσκευών σας, θα πρέπει να αποσυνδεθείτε από οπουδήποτε χρησιμοποιείτε αυτόν τον λογαριασμό και έπειτα, να συνδεθείτε ξανά με τη χρήση της ταυτοποίησης δύο παραγόντων.

## Avatar change page

avatar-page-title =
    .title = Εικόνα προφίλ
avatar-page-add-photo = Προσθήκη φωτογραφίας
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Λήψη φωτογραφίας
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Αφαίρεση φωτογραφίας
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Νέα λήψη φωτογραφίας
avatar-page-cancel-button = Ακύρωση
avatar-page-save-button = Αποθήκευση
avatar-page-saving-button = Αποθήκευση…
avatar-page-zoom-out-button =
    .title = Σμίκρυνση
avatar-page-zoom-in-button =
    .title = Μεγέθυνση
avatar-page-rotate-button =
    .title = Περιστροφή
avatar-page-camera-error = Δεν ήταν δυνατή η εκκίνηση της κάμερας
avatar-page-new-avatar =
    .alt = νέα εικόνα προφίλ
avatar-page-file-upload-error-3 = Προέκυψε πρόβλημα κατά τη μεταφόρτωση της εικόνας του προφίλ σας
avatar-page-delete-error-3 = Προέκυψε πρόβλημα κατά τη διαγραφή της εικόνας του προφίλ σας
avatar-page-image-too-large-error-2 = Το μέγεθος του αρχείου εικόνας είναι πολύ μεγάλο για μεταφόρτωση

## Password change page

pw-change-header =
    .title = Αλλαγή κωδικού πρόσβασης
pw-8-chars = Τουλάχιστον 8 χαρακτήρες
pw-not-email = Όχι τη διεύθυνση email σας
pw-change-must-match = Ο νέος κωδικός πρόσβασης αντιστοιχεί στην επιβεβαίωση
pw-commonly-used = Όχι κάποιο συνήθη κωδικό πρόσβασής σας
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Για την προστασία σας, μην επαναχρησιμοποιείτε κωδικούς πρόσβασης. Δείτε περισσότερες συμβουλές για τη <linkExternal>δημιουργία ισχυρών κωδικών πρόσβασης</linkExternal>.
pw-change-cancel-button = Ακύρωση
pw-change-save-button = Αποθήκευση
pw-change-forgot-password-link = Ξεχάσατε τον κωδικό πρόσβασής σας;
pw-change-current-password =
    .label = Εισαγωγή τρέχοντος κωδικού πρόσβασης
pw-change-new-password =
    .label = Εισαγωγή νέου κωδικού πρόσβασης
pw-change-confirm-password =
    .label = Επιβεβαίωση νέου κωδικού πρόσβασης
pw-change-success-alert-2 = Ο κωδικός πρόσβασης ενημερώθηκε

## Password create page

pw-create-header =
    .title = Δημιουργία κωδικού πρόσβασης
pw-create-success-alert-2 = Ο κωδικός πρόσβασης ορίστηκε
pw-create-error-2 = Δυστυχώς, προέκυψε πρόβλημα κατά τον ορισμό του κωδικού πρόσβασής σας

## Delete account page

delete-account-header =
    .title = Διαγραφή λογαριασμού
delete-account-step-1-2 = Βημα 1 απο 2
delete-account-step-2-2 = Βημα 2 απο 2
delete-account-confirm-title-4 = Ίσως έχετε συνδέσει τον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας με ένα ή περισσότερα από τα εξής προϊόντα ή υπηρεσίες της { -brand-mozilla }, που σας προστατεύουν και σας βοηθούν με τις εργασίες σας στο διαδίκτυο:
delete-account-product-mozilla-account = { -product-mozilla-account(case: "nom", capitalization: "upper") }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Συγχρονισμός δεδομένων { -brand-firefox }
delete-account-product-firefox-addons = Πρόσθετα { -brand-firefox }
delete-account-acknowledge = Σημειώστε ότι η διαγραφή του λογαριασμού σας:
delete-account-chk-box-1-v4 =
    .label = Όλες οι επί πληρωμή συνδρομές σας θα ακυρωθούν
delete-account-chk-box-2 =
    .label = Ενδέχεται να χάσετε τις αποθηκευμένες πληροφορίες και λειτουργίες από τα προϊόντα { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Η εκ νέου ενεργοποίηση με το ίδιο email ενδέχεται να μην επαναφέρει τις αποθηκευμένες πληροφορίες σας
delete-account-chk-box-4 =
    .label = Όλες οι επεκτάσεις και τα θέματα που έχετε δημοσιεύει στο addons.mozilla.org θα διαγραφούν
delete-account-continue-button = Συνέχεια
delete-account-password-input =
    .label = Εισαγωγή κωδικού πρόσβασης
delete-account-cancel-button = Ακύρωση
delete-account-delete-button-2 = Διαγραφή

## Display name page

display-name-page-title =
    .title = Εμφανιζόμενο όνομα
display-name-input =
    .label = Εισαγάγετε το εμφανιζόμενο όνομα
submit-display-name = Αποθήκευση
cancel-display-name = Ακύρωση
display-name-update-error-2 = Προέκυψε πρόβλημα κατά την ενημέρωση του εμφανιζόμενου ονόματός σας
display-name-success-alert-2 = Το εμφανιζόμενο όνομα ενημερώθηκε

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Πρόσφατη δραστηριότητα λογαριασμού
recent-activity-account-create-v2 = Ο λογαριασμός δημιουργήθηκε
recent-activity-account-disable-v2 = Ο λογαριασμός απενεργοποιήθηκε
recent-activity-account-enable-v2 = Ο λογαριασμός ενεργοποιήθηκε
recent-activity-account-login-v2 = Έναρξη σύνδεσης στον λογαριασμό
recent-activity-account-reset-v2 = Ξεκίνησε η επαναφορά κωδικού πρόσβασης
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Οι ειδοποιήσεις αδυναμίας παράδοσης email διαγράφηκαν
recent-activity-account-login-failure = Αποτυχία απόπειρας σύνδεσης στον λογαριασμό
recent-activity-account-two-factor-added = Η ταυτοποίηση δύο παραγόντων ενεργοποιήθηκε
recent-activity-account-two-factor-requested = Ζητήθηκε ταυτοποίηση δύο παραγόντων
recent-activity-account-two-factor-failure = Η ταυτοποίηση δύο παραγόντων απέτυχε
recent-activity-account-two-factor-success = Επιτυχής ταυτοποίηση δύο παραγόντων
recent-activity-account-two-factor-removed = Η ταυτοποίηση δύο παραγόντων καταργήθηκε
recent-activity-account-password-reset-requested = Ο λογαριασμός ζήτησε επαναφορά κωδικού πρόσβασης
recent-activity-account-password-reset-success = Επιτυχής επαναφορά κωδικού πρόσβασης λογαριασμού
recent-activity-account-recovery-key-added = Το κλειδί ανάκτησης λογαριασμού ενεργοποιήθηκε
recent-activity-account-recovery-key-verification-failure = Αποτυχία επαλήθευσης κλειδιού ανάκτησης λογαριασμού
recent-activity-account-recovery-key-verification-success = Επιτυχής επαλήθευση κλειδιού ανάκτησης λογαριασμού
recent-activity-account-recovery-key-removed = Το κλειδί ανάκτησης λογαριασμού αφαιρέθηκε
recent-activity-account-password-added = Προστέθηκε νέος κωδικός πρόσβασης
recent-activity-account-password-changed = Ο κωδικός πρόσβασης άλλαξε
recent-activity-account-secondary-email-added = Προστέθηκε δευτερεύουσα διεύθυνση email
recent-activity-account-secondary-email-removed = Αφαιρέθηκε δευτερεύουσα διεύθυνση email
recent-activity-account-emails-swapped = Έγινε εναλλαγή του κύριου email με το δευτερεύον
recent-activity-session-destroy = Έγινε αποσύνδεση από τη συνεδρία
recent-activity-account-recovery-phone-send-code = Απεστάλη κωδικός τηλεφώνου ανάκτησης
recent-activity-account-recovery-phone-setup-complete = Η ρύθμιση του τηλεφώνου ανάκτησης ολοκληρώθηκε
recent-activity-account-recovery-phone-signin-complete = Η σύνδεση με τηλέφωνο ανάκτησης ολοκληρώθηκε
recent-activity-account-recovery-phone-signin-failed = Η σύνδεση με τηλέφωνο ανάκτησης απέτυχε
recent-activity-account-recovery-phone-removed = Το τηλέφωνο ανάκτησης αφαιρέθηκε
recent-activity-account-recovery-codes-replaced = Οι κωδικοί ανάκτησης αντικαταστάθηκαν
recent-activity-account-recovery-codes-created = Δημιουργήθηκαν κωδικοί ανάκτησης
recent-activity-account-recovery-codes-signin-complete = Η σύνδεση με κωδικούς ανάκτησης ολοκληρώθηκε
recent-activity-password-reset-otp-sent = Έγινε αποστολή του κωδικού επιβεβαίωσης επαναφοράς κωδικού πρόσβασης
recent-activity-password-reset-otp-verified = Έγινε επαλήθευση του κωδικού επιβεβαίωσης επαναφοράς κωδικού πρόσβασης
recent-activity-must-reset-password = Ζητήθηκε επαναφορά του κωδικού πρόσβασης
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Άλλη δραστηριότητα λογαριασμού

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Κλειδί ανάκτησης λογαριασμού
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Πίσω στις ρυθμίσεις

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Αφαίρεση αριθμού τηλεφώνου ανάκτησης
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Αυτή η ενέργεια θα καταργήσει το <strong>{ $formattedFullPhoneNumber }</strong> από τηλέφωνο ανάκτησης.
settings-recovery-phone-remove-recommend = Προτείνουμε να διατηρήσετε αυτήν τη μέθοδο, επειδή είναι πιο εύκολη από την αποθήκευση εφεδρικών κωδικών ταυτοποίησης.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Εάν το διαγράψετε, βεβαιωθείτε ότι διαθέτετε ακόμα τους αποθηκευμένους εφεδρικούς κωδικούς ταυτοποίησής σας. <linkExternal>Σύγκριση μεθόδων ανάκτησης</linkExternal>
settings-recovery-phone-remove-button = Αφαίρεση αριθμού τηλεφώνου
settings-recovery-phone-remove-cancel = Ακύρωση
settings-recovery-phone-remove-success = Το τηλέφωνο ανάκτησης αφαιρέθηκε

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Προσθήκη τηλεφώνου ανάκτησης
page-change-recovery-phone = Αλλαγή τηλεφώνου ανάκτησης
page-setup-recovery-phone-back-button-title = Πίσω στις ρυθμίσεις
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Αλλαγή αριθμού τηλεφώνου

## Add secondary email page

add-secondary-email-step-1 = Βήμα 1 από 2
add-secondary-email-error-2 = Προέκυψε πρόβλημα κατά τη δημιουργία αυτού του email
add-secondary-email-page-title =
    .title = Δευτερεύον email
add-secondary-email-enter-address =
    .label = Εισαγωγή διεύθυνσης email
add-secondary-email-cancel-button = Ακύρωση
add-secondary-email-save-button = Αποθήκευση
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Οι μάσκες email δεν μπορούν να χρησιμοποιηθούν ως δευτερεύον email

## Verify secondary email page

add-secondary-email-step-2 = Βήμα 2 από 2
verify-secondary-email-page-title =
    .title = Δευτερεύον email
verify-secondary-email-verification-code-2 =
    .label = Εισαγωγή κωδικού επιβεβαίωσης
verify-secondary-email-cancel-button = Ακύρωση
verify-secondary-email-verify-button-2 = Επιβεβαίωση
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Εισαγάγετε τον κωδικό επιβεβαίωσης που απεστάλη στο <strong>{ $email }</strong> εντός 5 λεπτών.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = Το { $email } προστέθηκε επιτυχώς
verify-secondary-email-resend-code-button = Εκ νέου αποστολή κωδικού επιβεβαίωσης

##

# Link to delete account on main Settings page
delete-account-link = Διαγραφή λογαριασμού
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Έγινε επιτυχής σύνδεση. Ο { -product-mozilla-account(case: "nom", capitalization: "lower") } και τα δεδομένα σας θα παραμείνουν ενεργά.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Μάθετε πού εκτίθενται τα προσωπικά σας δεδομένα και ανακτήστε τον έλεγχό τους
# Links out to the Monitor site
product-promo-monitor-cta = Δωρεάν σάρωση

## Profile section

profile-heading = Προφίλ
profile-picture =
    .header = Εικόνα
profile-display-name =
    .header = Εμφανιζόμενο όνομα
profile-primary-email =
    .header = Κύριο email

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Βήμα { $currentStep } από { $numberOfSteps }.

## Security section of Setting

security-heading = Ασφάλεια
security-password =
    .header = Κωδικός πρόσβασης
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Δημιουργία: { $date }
security-not-set = Δεν έχει οριστεί
security-action-create = Δημιουργία
security-set-password = Ορίστε έναν κωδικό πρόσβασης για συγχρονισμό και χρήση συγκεκριμένων λειτουργιών ασφαλείας του λογαριασμού.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Προβολή πρόσφατης δραστηριότητας λογαριασμού
signout-sync-header = Η συνεδρία έληξε
signout-sync-session-expired = Δυστυχώς, κάτι πήγε στραβά. Αποσυνδεθείτε από το μενού του προγράμματος περιήγησης και δοκιμάστε ξανά.

## SubRow component

tfa-row-backup-codes-title = Εφεδρικοί κωδικοί ταυτοποίησης
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Δεν υπάρχουν διαθέσιμοι κωδικοί
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Απομένει { $numCodesAvailable } κωδικός
       *[other] Απομένουν { $numCodesAvailable } κωδικοί
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Δημιουργία νέων κωδικών
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Προσθήκη
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Αυτή είναι η πιο ασφαλής μέθοδος ανάκτησης εάν δεν μπορείτε να χρησιμοποιήσετε την κινητή σας συσκευή ή την εφαρμογή ελέγχου ταυτότητάς σας.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Τηλέφωνο ανάκτησης
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Δεν έχει προστεθεί αριθμός τηλεφώνου
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Αλλαγή
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Προσθήκη
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Αφαίρεση
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Αφαίρεση τηλεφώνου ανάκτησης
tfa-row-backup-phone-delete-restriction-v2 = Εάν θέλετε να αφαιρέσετε το τηλέφωνο ανάκτησής σας, προσθέστε εφεδρικούς κωδικούς ταυτοποίησης ή απενεργοποιήστε πρώτα την ταυτοποίηση δύο παραγόντων, ώστε να μην κλειδωθείτε εκτός του λογαριασμού σας.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Αυτή είναι η πιο εύκολη μέθοδος ανάκτησης εάν δεν μπορείτε να χρησιμοποιήσετε την εφαρμογή ελέγχου ταυτότητάς σας.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Μάθετε σχετικά με τον κίνδυνο εναλλαγής SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Απενεργοποίηση
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Ενεργοποίηση
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Υποβολή…
switch-is-on = ενεργό
switch-is-off = ανενεργό

## Sub-section row Defaults

row-defaults-action-add = Προσθήκη
row-defaults-action-change = Αλλαγή
row-defaults-action-disable = Απενεργοποίηση
row-defaults-status = Κανένα

## Account recovery key sub-section on main Settings page

rk-header-1 = Κλειδί ανάκτησης λογαριασμού
rk-enabled = Ενεργό
rk-not-set = Δεν έχει οριστεί
rk-action-create = Δημιουργία
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Αλλαγή
rk-action-remove = Αφαίρεση
rk-key-removed-2 = Το κλειδί ανάκτησης λογαριασμού αφαιρέθηκε
rk-cannot-remove-key = Δεν ήταν δυνατή η κατάργηση του κλειδιού ανάκτησης λογαριασμού.
rk-refresh-key-1 = Ανανέωση κλειδιού ανάκτησης λογαριασμού
rk-content-explain = Ανακτήστε τις πληροφορίες σας εάν ξεχάσετε τον κωδικό πρόσβασής σας.
rk-cannot-verify-session-4 = Δυστυχώς, προέκυψε πρόβλημα με την επιβεβαίωση της συνεδρίας σας
rk-remove-modal-heading-1 = Αφαίρεση κλειδιού ανάκτησης λογαριασμού;
rk-remove-modal-content-1 =
    Σε περίπτωση που επαναφέρετε τον κωδικό πρόσβασής σας, δεν θα μπορείτε να χρησιμοποιήσετε
    το κλειδί ανάκτησης λογαριασμού σας για πρόσβαση στα δεδομένα σας. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
rk-remove-error-2 = Δεν ήταν δυνατή η αφαίρεση του κλειδιού ανάκτησης του λογαριασμού σας
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Διαγραφή κλειδιού ανάκτησης λογαριασμού

## Secondary email sub-section on main Settings page

se-heading = Δευτερεύον email
    .header = Δευτερεύον email
se-cannot-refresh-email = Δυστυχώς, προέκυψε πρόβλημα κατά την ανανέωση του email.
se-cannot-resend-code-3 = Δυστυχώς, προέκυψε πρόβλημα κατά την επαναποστολή του κωδικού επιβεβαίωσης
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = Το { $email } είναι πλέον το κύριο email σας
se-set-primary-error-2 = Δυστυχώς, προέκυψε πρόβλημα κατά την αλλαγή του κύριου email σας
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = Το { $email } διαγράφηκε επιτυχώς
se-delete-email-error-2 = Δυστυχώς, προέκυψε πρόβλημα κατά τη διαγραφή αυτού του email
se-verify-session-3 = Θα χρειαστεί να επιβεβαιώσετε την τρέχουσα συνεδρία σας για την εκτέλεση αυτής της ενέργειας
se-verify-session-error-3 = Δυστυχώς, προέκυψε πρόβλημα με την επιβεβαίωση της συνεδρίας σας
# Button to remove the secondary email
se-remove-email =
    .title = Αφαίρεση email
# Button to refresh secondary email status
se-refresh-email =
    .title = Ανανέωση email
se-unverified-2 = μη επιβεβαιωμένο
se-resend-code-2 =
    Απαιτείται επιβεβαίωση. Κάντε <button>νέα αποστολή κωδικού επιβεβαίωσης</button>
    εάν δεν υπάρχει στα εισερχόμενα ή τον φάκελο ανεπιθύμητων μηνυμάτων σας.
# Button to make secondary email the primary
se-make-primary = Ορισμός ως κύριο
se-default-content = Αποκτήστε πρόσβαση στον λογαριασμό σας εάν δεν μπορείτε να συνδεθείτε στο κύριο email σας.
se-content-note-1 =
    Σημείωση: ένα δευτερεύον email δεν θα ανακτήσει τα δεδομένα σας. Για τον
    σκοπό αυτό, θα χρειαστείτε ένα <a>κλειδί ανάκτησης λογαριασμού</a>.
# Default value for the secondary email
se-secondary-email-none = Κανένα

## Two Step Auth sub-section on Settings main page

tfa-row-header = Ταυτοποίηση δύο παραγόντων
tfa-row-enabled = Ενεργή
tfa-row-disabled-status = Ανενεργή
tfa-row-action-add = Προσθήκη
tfa-row-action-disable = Απενεργοποίηση
tfa-row-action-change = Αλλαγή
tfa-row-button-refresh =
    .title = Ανανέωση ταυτοποίησης δύο παραγόντων
tfa-row-cannot-refresh =
    Δυστυχώς, προέκυψε πρόβλημα κατά την ανανέωση
    της ταυτοποίησης δύο παραγόντων.
tfa-row-enabled-description = Ο λογαριασμός σας προστατεύεται από ταυτοποίηση δύο παραγόντων. Θα πρέπει να εισαγάγετε έναν κωδικό μίας χρήσης από την εφαρμογή ελέγχου ταυτότητάς σας κατά τη σύνδεση στον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Πώς προστατεύεται ο λογαριασμός σας
tfa-row-disabled-description-v2 = Ασφαλίστε τον λογαριασμό σας με μια τρίτη εφαρμογή ελέγχου ταυτότητας ως ένα δεύτερο βήμα για τη σύνδεση.
tfa-row-cannot-verify-session-4 = Δυστυχώς, προέκυψε πρόβλημα με την επιβεβαίωση της συνεδρίας σας
tfa-row-disable-modal-heading = Απενεργοποίηση ταυτοποίησης δύο παραγόντων;
tfa-row-disable-modal-confirm = Απενεργοποίηση
tfa-row-disable-modal-explain-1 =
    Δεν μπορείτε να αναιρέσετε αυτήν την ενέργεια. Έχετε επίσης
    την επιλογή <linkExternal>αντικατάστασης των εφεδρικών κωδικών ταυτοποίησής σας</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Η ταυτοποίηση δύο παραγόντων απενεργοποιήθηκε
tfa-row-cannot-disable-2 = Δεν ήταν δυνατή η απενεργοποίηση της ταυτοποίησης δύο παραγόντων
tfa-row-verify-session-info = Θα χρειαστεί να επιβεβαιώσετε την τρέχουσα συνεδρία σας για να ρυθμίσετε την ταυτοποίηση δύο παραγόντων

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Συνεχίζοντας, συμφωνείτε με:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Όροι υπηρεσίας</mozSubscriptionTosLink> και <mozSubscriptionPrivacyLink>Σημείωση απορρήτου</mozSubscriptionPrivacyLink> των συνδρομητικών υπηρεσιών της { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Όροι υπηρεσίας</mozillaAccountsTos> και <mozillaAccountsPrivacy>Σημείωση απορρήτου</mozillaAccountsPrivacy> των { -product-mozilla-accounts(case: "gen", capitalization: "lower") }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Συνεχίζοντας, αποδέχεστε τους <mozillaAccountsTos>Όρους υπηρεσίας</mozillaAccountsTos> και τη <mozillaAccountsPrivacy>Σημείωση απορρήτου</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Ή
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Σύνδεση με
continue-with-google-button = Συνέχεια με { -brand-google }
continue-with-apple-button = Συνέχεια με { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Άγνωστος λογαριασμός
auth-error-103 = Λάθος κωδικός πρόσβασης
auth-error-105-2 = Μη έγκυρος κωδικός επιβεβαίωσης
auth-error-110 = Μη έγκυρο διακριτικό
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Έχετε προσπαθήσει πάρα πολλές φορές. Δοκιμάστε ξανά αργότερα.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Έχετε προσπαθήσει πάρα πολλές φορές. Δοκιμάστε ξανά { $retryAfter }.
auth-error-125 = Το αίτημα αποκλείστηκε για λόγους ασφαλείας
auth-error-129-2 = Πληκτρολογήσατε μη έγκυρο αριθμό τηλεφώνου. Ελέγξτε τον και δοκιμάστε ξανά.
auth-error-138-2 = Μη επιβεβαιωμένη συνεδρία
auth-error-139 = Το δευτερεύον email πρέπει να είναι διαφορετικό από το email του λογαριασμού σας
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Αυτή η διεύθυνση email έχει δεσμευτεί από άλλο λογαριασμό. Δοκιμάστε ξανά αργότερα ή χρησιμοποιήστε μια άλλη διεύθυνση email.
auth-error-155 = Δεν βρέθηκε διακριτικό TOTP
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Δεν βρέθηκε εφεδρικός κωδικός ταυτοποίησης
auth-error-159 = Μη έγκυρο κλειδί ανάκτησης λογαριασμού
auth-error-183-2 = Μη έγκυρος ή παλιός κωδικός επιβεβαίωσης
auth-error-202 = Η λειτουργία δεν είναι ενεργή
auth-error-203 = Το σύστημα δεν είναι διαθέσιμο, δοκιμάστε ξανά σύντομα
auth-error-206 = Δεν είναι δυνατή η δημιουργία κωδικού πρόσβασης, έχει ήδη οριστεί κωδικός πρόσβασης
auth-error-214 = Ο αριθμός τηλεφώνου ανάκτησης υπάρχει ήδη
auth-error-215 = Ο αριθμός τηλεφώνου ανάκτησης δεν υπάρχει
auth-error-216 = Έχετε φτάσει το όριο των μηνυμάτων κειμένου
auth-error-218 = Δεν είναι δυνατή η αφαίρεση του τηλεφώνου ανάκτησης, δεν υπάρχουν εφεδρικοί κωδικοί ταυτοποίησης.
auth-error-219 = Αυτός ο αριθμός τηλεφώνου έχει καταχωρηθεί σε πάρα πολλούς λογαριασμούς. Δοκιμάστε έναν άλλο αριθμό.
auth-error-999 = Απροσδόκητο σφάλμα
auth-error-1001 = Η προσπάθεια σύνδεσης ακυρώθηκε
auth-error-1002 = Η συνεδρία έληξε. Συνδεθείτε για να συνεχίσετε.
auth-error-1003 = Η τοπική αποθήκευση ή τα cookie εξακολουθούν να είναι απενεργοποιημένα
auth-error-1008 = Ο νέος κωδικός πρόσβασής σας πρέπει να είναι διαφορετικός
auth-error-1010 = Απαιτείται έγκυρος κωδικός πρόσβασης
auth-error-1011 = Απαιτείται έγκυρο email
auth-error-1018 = Το email επιβεβαίωσής σας μόλις επιστράφηκε. Μήπως πληκτρολογήσατε λάθος email;
auth-error-1020 = Εσφαλμένο email; Το firefox.com δεν είναι έγκυρη υπηρεσία email
auth-error-1031 = Πρέπει να εισαγάγετε την ηλικία σας για εγγραφή
auth-error-1032 = Πρέπει να εισαγάγετε μια έγκυρη ηλικία για εγγραφή
auth-error-1054 = Μη έγκυρος κωδικός ταυτοποίησης δύο παραγόντων
auth-error-1056 = Μη έγκυρος εφεδρικός κωδικός ταυτοποίησης
auth-error-1062 = Μη έγκυρη ανακατεύθυνση
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Εσφαλμένο email; Το { $domain } δεν είναι έγκυρη υπηρεσία email
auth-error-1066 = Οι μάσκες email δεν μπορούν να χρησιμοποιηθούν για τη δημιουργία λογαριασμού.
auth-error-1067 = Εσφαλμένο email;
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Αριθμός που λήγει σε { $lastFourPhoneNumber }
oauth-error-1000 = Κάτι πήγε στραβά. Κλείστε αυτήν την καρτέλα και δοκιμάστε ξανά.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Συνδεθήκατε στο { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Το email επιβεβαιώθηκε
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Η είσοδος επιβεβαιώθηκε
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Συνδεθείτε σε αυτό το { -brand-firefox } για να ολοκληρώσετε τη ρύθμιση
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Σύνδεση
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Προσθέτετε ακόμα συσκευές; Συνδεθείτε στο { -brand-firefox } από μια άλλη συσκευή για να ολοκληρώσετε τη ρύθμιση
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Συνδεθείτε στο { -brand-firefox } σε κάποια άλλη συσκευή για να ολοκληρώσετε τη ρύθμιση
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Θέλετε να λάβετε τις καρτέλες, τους σελιδοδείκτες και τους κωδικούς πρόσβασής σας σε μια άλλη συσκευή;
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Σύνδεση άλλης συσκευής
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Όχι τώρα
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Συνδεθείτε στο { -brand-firefox } για Android για να ολοκληρώσετε τη ρύθμιση
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Συνδεθείτε στο { -brand-firefox } για iOS για να ολοκληρώσετε τη ρύθμιση

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Απαιτούνται cookie και τοπική αποθήκευση
cookies-disabled-enable-prompt-2 = Ενεργοποιήστε τα cookie και τον τοπικό χώρο αποθήκευσης στο πρόγραμμα περιήγησής σας για να αποκτήσετε πρόσβαση στον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας. Με αυτόν τον τρόπο, θα ενεργοποιήσετε λειτουργίες όπως η απομνημόνευση της σύνδεσής σας μεταξύ των συνεδριών.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Δοκιμή ξανά
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Μάθετε περισσότερα

## Index / home page

index-header = Εισαγάγετε το email σας
index-sync-header = Συνέχεια στον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας
index-sync-subheader = Συγχρονίστε τους κωδικούς πρόσβασης, τις καρτέλες και τους σελιδοδείκτες σας οπουδήποτε χρησιμοποιείτε το { -brand-firefox }.
index-relay-header = Δημιουργία μάσκας email
index-relay-subheader = Εισαγάγετε τη διεύθυνση email όπου θα θέλατε να προωθούνται τα email από τη μάσκα email σας.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Συνέχεια στο { $serviceName }
index-subheader-default = Συνέχεια στις ρυθμίσεις λογαριασμού
index-cta = Εγγραφή ή σύνδεση
index-account-info = Ένας { -product-mozilla-account(case: "nom", capitalization: "lower") } ξεκλειδώνει επίσης την πρόσβαση σε περισσότερα προϊόντα της { -brand-mozilla } που προστατεύουν το απόρρητό σας.
index-email-input =
    .label = Εισαγάγετε το email σας
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Επιτυχής διαγραφή λογαριασμού
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Το email επιβεβαίωσής σας μόλις επιστράφηκε. Μήπως πληκτρολογήσατε λάθος email;

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Ωχ! Δεν ήταν δυνατή η δημιουργία του κλειδιού ανάκτησης του λογαριασμού σας. Δοκιμάστε ξανά αργότερα.
inline-recovery-key-setup-recovery-created = Το κλειδί ανάκτησης λογαριασμού δημιουργήθηκε
inline-recovery-key-setup-download-header = Ασφαλίστε τον λογαριασμό σας
inline-recovery-key-setup-download-subheader = Κάντε το λήψη και αποθήκευση τώρα
inline-recovery-key-setup-download-info = Αποθηκεύστε αυτό το κλειδί σε μέρος που θα θυμάστε. Δεν θα μπορείτε να επιστρέψετε σε αυτήν τη σελίδα αργότερα.
inline-recovery-key-setup-hint-header = Σύσταση ασφαλείας

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Ακύρωση ρύθμισης
inline-totp-setup-continue-button = Συνέχεια
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Προσθέστε ένα επιπλέον επίπεδο ασφαλείας στον λογαριασμό σας με κωδικούς ταυτοποίησης από μία από <authenticationAppsLink>αυτές τις εφαρμογές ταυτοποίησης</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Ενεργοποιήστε την ταυτοποίηση δύο παραγόντων <span>για να συνεχίσετε στις ρυθμίσεις λογαριασμού</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Ενεργοποιήστε την ταυτοποίηση δύο παραγόντων <span>για να συνεχίσετε στο { $serviceName }</span>
inline-totp-setup-ready-button = Έτοιμο
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Σαρώστε τον κωδικό ταυτοποίησης <span>για να συνεχίσετε στο { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Εισαγάγετε τον κωδικό χειροκίνητα <span>για να συνεχίσετε στο { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Σαρώστε τον κωδικό ταυτοποίησης <span>για να συνεχίσετε στις ρυθμίσεις λογαριασμού</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Εισαγάγετε τον κωδικό χειροκίνητα <span>για να συνεχίσετε στις ρυθμίσεις λογαριασμού</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Πληκτρολογήστε αυτό το μυστικό κλειδί στην εφαρμογή ταυτοποίησής σας. <toggleToQRButton>Σάρωση κωδικού QR;</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Σαρώστε τον κωδικό QR στην εφαρμογή ταυτοποίησης και εισαγάγετε τον κωδικό που παρέχει. <toggleToManualModeButton>Δεν μπορείτε να σαρώσετε τον κωδικό;</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Μόλις τελειώσετε, θα αρχίσει η δημιουργία των κωδικών ταυτοποίησής σας.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Κωδικός ταυτοποίησης
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Απαιτείται κωδικός ταυτοποίησης
tfa-qr-code-alt = Χρησιμοποιήστε τον κωδικό { $code } για να ρυθμίσετε την ταυτοποίηση δύο παραγόντων στις υποστηριζόμενες εφαρμογές.
inline-totp-setup-page-title = Ταυτοποίηση δύο παραγόντων

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Νομικά
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Όροι υπηρεσίας
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Σημείωση απορρήτου

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Σημείωση απορρήτου

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Όροι υπηρεσίας

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Συνδεθήκατε μόλις στο { -product-firefox };
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Ναι, έγκριση συσκευής
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Εάν δεν το κάνατε εσείς, <link>αλλάξτε τον κωδικό πρόσβασής σας</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Η συσκευή συνδέθηκε
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Κάνετε τώρα συγχρονισμό με το: { $deviceFamily } με { $deviceOS }
pair-auth-complete-sync-benefits-text = Τώρα μπορείτε να έχετε πρόσβαση στις ανοικτές καρτέλες, τους κωδικούς πρόσβασης και τους σελιδοδείκτες σας σε όλες τις συσκευές σας.
pair-auth-complete-see-tabs-button = Εμφάνιση καρτελών από συγχρονισμένες συσκευές
pair-auth-complete-manage-devices-link = Διαχείριση συσκευών

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Εισαγάγετε τον κωδικό ταυτοποίησης <span>για να συνεχίσετε στις ρυθμίσεις λογαριασμού</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Εισαγάγετε τον κωδικό ταυτοποίησης <span>για να συνεχίσετε στο { $serviceName }</span>
auth-totp-instruction = Ανοίξτε την εφαρμογή ταυτοποίησής σας και εισαγάγετε τον κωδικό ταυτοποίησης που σας παρέχει.
auth-totp-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Επιβεβαίωση
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Απαιτείται κωδικός ταυτοποίησης

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Απαιτείται τώρα έγκριση <span>από την άλλη συσκευή σας</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Ανεπιτυχής σύζευξη
pair-failure-message = Η διαδικασία ρύθμισης τερματίστηκε.

## Pair index page

pair-sync-header = Συγχρονίστε το { -brand-firefox } στο τηλέφωνο ή το tablet σας
pair-cad-header = Συνδέστε το { -brand-firefox } σε άλλη συσκευή
pair-already-have-firefox-paragraph = Έχετε ήδη το { -brand-firefox } στο κινητό ή το tablet σας;
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Συγχρονισμός συσκευής
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Ή λήψη
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Κάντε σάρωση για λήψη του { -brand-firefox } για κινητές συσκευές ή στείλτε στον εαυτό σας έναν <linkExternal>σύνδεσμο λήψης</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Όχι τώρα
pair-take-your-data-message = Μεταφέρετε τις καρτέλες, τους σελιδοδείκτες και τους κωδικούς πρόσβασής σας οπουδήποτε χρησιμοποιείτε το { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Έναρξη
# This is the aria label on the QR code image
pair-qr-code-aria-label = Κωδικός QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Η συσκευή συνδέθηκε
pair-success-message-2 = Επιτυχής σύζευξη.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Επιβεβαίωση σύζευξης <span>για το { $email }</span>
pair-supp-allow-confirm-button = Επιβεβαίωση σύζευξης
pair-supp-allow-cancel-link = Ακύρωση

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Απαιτείται έγκριση <span>από την άλλη συσκευή σας</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Σύζευξη με εφαρμογή
pair-unsupported-message = Χρησιμοποιήσατε την κάμερα συστήματος; Πρέπει να κάνετε σύζευξη μέσα από την εφαρμογή { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Δημιουργία κωδικού πρόσβασης για συγχρονισμό
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Αυτός κρυπτογραφεί τα δεδομένα σας. Πρέπει να είναι διαφορετικός από τον κωδικό πρόσβασης του λογαριασμού { -brand-google } ή { -brand-apple } σας.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Περιμένετε, ανακατευθύνεστε στην εξουσιοδοτημένη εφαρμογή.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Εισαγάγετε το κλειδί ανάκτησης του λογαριασμού σας
account-recovery-confirm-key-instruction = Αυτό το κλειδί ανακτά τα κρυπτογραφημένα δεδομένα περιήγησής σας, όπως κωδικούς πρόσβασης και σελιδοδείκτες, από τους διακομιστές του { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Εισαγάγετε το κλειδί ανάκτησης 32 χαρακτήρων του λογαριασμού σας
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Η υπόδειξη για την τοποθεσία αποθήκευσης είναι:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Συνέχεια
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Δεν μπορείτε να βρείτε το κλειδί ανάκτησης του λογαριασμού σας;

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Δημιουργία νέου κωδικού πρόσβασης
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Ο κωδικός πρόσβασης ορίστηκε
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Δυστυχώς, προέκυψε πρόβλημα κατά τον ορισμό του κωδικού πρόσβασής σας
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Χρήση κλειδιού ανάκτησης λογαριασμού
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Έγινε επαναφορά του κωδικού πρόσβασής σας.
reset-password-complete-banner-message = Μην ξεχάσετε να δημιουργήσετε ένα νέο κλειδί ανάκτησης λογαριασμού από τις ρυθμίσεις του { -product-mozilla-account(case: "gen", capitalization: "lower") } σας για να αποτρέψετε μελλοντικά προβλήματα σύνδεσης.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Εισαγάγετε τον κωδικό 10 χαρακτήρων
confirm-backup-code-reset-password-confirm-button = Επιβεβαίωση
confirm-backup-code-reset-password-subheader = Εισαγάγετε εφεδρικό κωδικό ταυτοποίησης
confirm-backup-code-reset-password-instruction = Εισαγάγετε έναν από τους κωδικούς μίας χρήσης που αποθηκεύσατε κατά τη ρύθμιση της ταυτοποίησης δύο παραγόντων.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Έχετε κλειδωθεί;

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Ελέγξτε τα email σας
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Στείλαμε έναν κωδικό επιβεβαίωσης στο <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Εισαγάγετε τον οκταψήφιο κωδικό μέσα σε 10 λεπτά
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Συνέχεια
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Αποστολή νέου κωδικού
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Χρήση διαφορετικού λογαριασμού

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Επαναφορά κωδικού πρόσβασης
confirm-totp-reset-password-subheader-v2 = Εισαγάγετε κωδικό ταυτοποίησης δύο παραγόντων
confirm-totp-reset-password-instruction-v2 = Ελέγξτε την <strong>εφαρμογή ταυτοποίησής</strong> σας για να επαναφορέρετε τον κωδικό πρόσβασής σας.
confirm-totp-reset-password-trouble-code = Πρόβλημα με την εισαγωγή του κωδικού;
confirm-totp-reset-password-confirm-button = Επιβεβαίωση
confirm-totp-reset-password-input-label-v2 = Εισαγάγετε τον εξαψήφιο κωδικό
confirm-totp-reset-password-use-different-account = Χρήση διαφορετικού λογαριασμού

## ResetPassword start page

password-reset-flow-heading = Επαναφορά κωδικού πρόσβασης
password-reset-body-2 =
    Θα σας ρωτήσουμε μερικά πράγματα που μόνο εσείς γνωρίζετε, προκειμένου
    να διατηρήσουμε τον λογαριασμό σας ασφαλή.
password-reset-email-input =
    .label = Εισαγάγετε το email σας
password-reset-submit-button-2 = Συνέχεια

## ResetPasswordConfirmed

reset-password-complete-header = Έγινε επαναφορά του κωδικού πρόσβασής σας
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Συνέχεια στο { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Επαναφέρετε τον κωδικό πρόσβασής σας
password-reset-recovery-method-subheader = Επιλέξτε μια μέθοδο ανάκτησης
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Ας βεβαιωθούμε ότι είστε εσείς, χρησιμοποιώντας τις μεθόδους ανάκτησής σας.
password-reset-recovery-method-phone = Τηλέφωνο ανάκτησης
password-reset-recovery-method-code = Εφεδρικοί κωδικοί ταυτοποίησης
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Απομένει { $numBackupCodes } κωδικός
       *[other] Απομένουν { $numBackupCodes } κωδικοί
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Προέκυψε πρόβλημα κατά την αποστολή του κωδικού στο τηλέφωνο ανάκτησής σας
password-reset-recovery-method-send-code-error-description = Δοκιμάστε ξανά αργότερα ή χρησιμοποιήστε τους εφεδρικούς κωδικούς ταυτοποίησής σας.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Επαναφορά κωδικού πρόσβασης
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Εισαγάγετε κωδικό ανάκτησης
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Ένας εξαψήφιος κωδικός έχει αποσταλεί στον αριθμό τηλεφώνου που λήγει σε <span>{ $lastFourPhoneDigits }</span> μέσω μηνύματος κειμένου. Αυτός ο κωδικός λήγει μετά από 5 λεπτά. Μην μοιραστείτε αυτόν τον κωδικό με κανέναν.
reset-password-recovery-phone-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
reset-password-recovery-phone-code-submit-button = Επιβεβαίωση
reset-password-recovery-phone-resend-code-button = Αποστολή νέου κωδικού
reset-password-recovery-phone-resend-success = Ο κωδικός απεστάλη
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Έχετε κλειδωθεί;
reset-password-recovery-phone-send-code-error-heading = Προέκυψε πρόβλημα κατά την αποστολή του κωδικού
reset-password-recovery-phone-code-verification-error-heading = Προέκυψε πρόβλημα κατά την επαλήθευση του κωδικού σας
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Δοκιμάστε ξανά αργότερα.
reset-password-recovery-phone-invalid-code-error-description = Ο κωδικός δεν είναι έγκυρος ή έχει λήξει.
reset-password-recovery-phone-invalid-code-error-link = Χρήση εφεδρικών κωδικών ταυτοποίησης;
reset-password-with-recovery-key-verified-page-title = Επιτυχής επαναφορά κωδικού πρόσβασης
reset-password-complete-new-password-saved = Ο νέος κωδικός πρόσβασης αποθηκεύτηκε!
reset-password-complete-recovery-key-created = Το νέο κλειδί ανάκτησης λογαριασμού δημιουργήθηκε. Κάντε λήψη και αποθήκευσή του τώρα
reset-password-complete-recovery-key-download-info =
    Αυτό το κλειδί είναι απαραίτητο για την ανάκτηση των δεδομένων
    σας εάν ξεχάσετε τον κωδικό πρόσβασής σας. <b>Αποθηκεύστε το σε ένα ασφαλές μέρος
    τώρα, καθώς δεν θα μπορέσετε να αποκτήσετε ξανά πρόσβαση σε αυτήν τη σελίδα αργότερα.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Σφάλμα:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Επικύρωση σύνδεσης…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Σφάλμα επιβεβαίωσης
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Ο σύνδεσμος επιβεβαίωσης έληξε
signin-link-expired-message-2 = Ο σύνδεσμος στον οποίο κάνατε κλικ έχει λήξει ή έχει ήδη χρησιμοποιηθεί.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Εισαγάγετε τον κωδικό πρόσβασης <span>για τον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Συνέχεια στο { $serviceName }
signin-subheader-without-logo-default = Συνέχεια στις ρυθμίσεις λογαριασμού
signin-button = Σύνδεση
signin-header = Σύνδεση
signin-use-a-different-account-link = Χρήση διαφορετικού λογαριασμού
signin-forgot-password-link = Ξεχάσατε τον κωδικό πρόσβασής σας;
signin-password-button-label = Κωδικός πρόσβασης
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.
signin-code-expired-error = Ο κωδικός έληξε. Κάντε ξανά σύνδεση.
signin-account-locked-banner-heading = Επαναφορά κωδικού πρόσβασης
signin-account-locked-banner-description = Κλειδώσαμε τον λογαριασμό σας για να τον προφυλάξουμε από ύποπτη δραστηριότητα.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Επαναφέρετε τον κωδικό πρόσβασής σας για να συνδεθείτε

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Λείπουν χαρακτήρες απο τον σύνδεσμο που κάνατε κλικ και ενδέχεται να έχει καταστραφεί από το πρόγραμμα email σας. Αντιγράψτε προσεκτικά τη διεύθυνση και δοκιμάστε ξανά.
report-signin-header = Αναφορά μη εξουσιοδοτημένης σύνδεσης;
report-signin-body = Λάβατε ένα email σχετικά με κάποια απόπειρα πρόσβασης στον λογαριασμό σας. Θα θέλατε να αναφέρετε αυτήν τη δραστηριότητα ως ύποπτη;
report-signin-submit-button = Αναφορά δραστηριότητας
report-signin-support-link = Γιατί συμβαίνει αυτό;
report-signin-error = Δυστυχώς, προέκυψε πρόβλημα κατά την υποβολή της αναφοράς.
signin-bounced-header = Συγγνώμη. Έχουμε κλειδώσει τον λογαριασμό σας.
# $email (string) - The user's email.
signin-bounced-message = Το email επιβεβαίωσης που στείλαμε στο { $email } επιστράφηκε και έχουμε κλειδώσει τον λογαριασμό σας για να προστατέψουμε τα δεδομένα του { -brand-firefox } σας.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Αν αυτή είναι μια έγκυρη διεύθυνση email, <linkExternal>ενημερώστε μας</linkExternal> και θα σας βοηθήσουμε να ξεκλειδώσετε τον λογαριασμό σας.
signin-bounced-create-new-account = Δεν είστε πλέον κάτοχος αυτού του email; Δημιουργήστε έναν νέο λογαριασμό
back = Πίσω

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Επαληθεύστε αυτά τα στοιχεία σύνδεσης <span>για να συνεχίσετε στις ρυθμίσεις λογαριασμού</span>
signin-push-code-heading-w-custom-service = Επαληθεύστε αυτά τα στοιχεία σύνδεσης <span>για να συνεχίσετε στο { $serviceName }</span>
signin-push-code-instruction = Ελέγξτε τις άλλες σας συσκευές και εγκρίνετε αυτήν τη σύνδεση από το πρόγραμμα περιήγησης { -brand-firefox } σας.
signin-push-code-did-not-recieve = Δεν λάβατε ειδοποίηση;
signin-push-code-send-email-link = Κωδικός email

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Επιβεβαιώστε τη σύνδεσή σας
signin-push-code-confirm-description = Εντοπίσαμε μια απόπειρα σύνδεσης από την παρακάτω συσκευή. Αν ήσασταν εσείς, εγκρίνετε τη σύνδεση
signin-push-code-confirm-verifying = Επαλήθευση
signin-push-code-confirm-login = Επιβεβαίωση σύνδεσης
signin-push-code-confirm-wasnt-me = Δεν ήμουν εγώ, αλλαγή κωδικού πρόσβασης.
signin-push-code-confirm-login-approved = Η σύνδεσή σας έχει εγκριθεί. Κλείστε αυτό το παράθυρο.
signin-push-code-confirm-link-error = Ο σύνδεσμος είναι κατεστραμμένος. Δοκιμάστε ξανά.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Σύνδεση
signin-recovery-method-subheader = Επιλέξτε μια μέθοδο ανάκτησης
signin-recovery-method-details = Ας βεβαιωθούμε ότι είστε εσείς που χρησιμοποιείτε τις μεθόδους ανάκτησής σας.
signin-recovery-method-phone = Τηλέφωνο ανάκτησης
signin-recovery-method-code-v2 = Εφεδρικοί κωδικοί ταυτοποίησης
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Απομένει { $numBackupCodes } κωδικός
       *[other] Απομένουν { $numBackupCodes } κωδικοί
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Προέκυψε πρόβλημα κατά την αποστολή κωδικού στο τηλέφωνο ανάκτησής σας
signin-recovery-method-send-code-error-description = Δοκιμάστε ξανά αργότερα ή χρησιμοποιήστε τους εφεδρικούς κωδικούς ταυτοποίησής σας.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Σύνδεση
signin-recovery-code-sub-heading = Εισαγάγετε εφεδρικό κωδικό ταυτοποίησης
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Εισαγάγετε έναν από τους κωδικούς μιας χρήσης που αποθηκεύσατε κατά τη ρύθμιση της ταυτοποίησης δύο παραγόντων.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Εισαγάγετε τον κωδικό 10 χαρακτήρων
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Επιβεβαίωση
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Χρήση τηλεφώνου ανάκτησης
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Έχετε κλειδωθεί;
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Απαιτείται εφεδρικός κωδικός ταυτοποίησης
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Προέκυψε πρόβλημα κατά την αποστολή κωδικού στο τηλέφωνο ανάκτησής σας
signin-recovery-code-use-phone-failure-description = Δοκιμάστε ξανά αργότερα.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Σύνδεση
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Εισαγάγετε τον κωδικό ανάκτησης
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Ένας εξαψήφιος κωδικός έχει αποσταλεί στον αριθμό τηλεφώνου που λήγει σε <span>{ $lastFourPhoneDigits }</span> μέσω μηνύματος κειμένου. Αυτός ο κωδικός λήγει μετά από 5 λεπτά. Μην μοιραστείτε αυτόν τον κωδικό με κανέναν.
signin-recovery-phone-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
signin-recovery-phone-code-submit-button = Επιβεβαίωση
signin-recovery-phone-resend-code-button = Αποστολή νέου κωδικού
signin-recovery-phone-resend-success = Ο κωδικός απεστάλη
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Έχετε κλειδωθεί;
signin-recovery-phone-send-code-error-heading = Προέκυψε πρόβλημα κατά την αποστολή του κωδικού
signin-recovery-phone-code-verification-error-heading = Προέκυψε πρόβλημα κατά την επαλήθευση του κωδικού σας
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Δοκιμάστε ξανά αργότερα.
signin-recovery-phone-invalid-code-error-description = Ο κωδικός δεν είναι έγκυρος ή έχει λήξει.
signin-recovery-phone-invalid-code-error-link = Χρήση εφεδρικών κωδικών ταυτοποίησης;
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Έγινε επιτυχής σύνδεση. Ενδέχεται να ισχύσουν περιορισμοί αν χρησιμοποιήσετε ξανά το τηλέφωνο ανάκτησής σας.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Σας ευχαριστούμε για την εγρήγορσή σας
signin-reported-message = Η ομάδα μας έχει ειδοποιηθεί. Αναφορές σαν κι αυτή μάς βοηθούν να αποκλείουμε τους εισβολείς.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Εισαγάγετε τον κωδικό επιβεβαίωσης <span>για τον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Εισαγάγετε τον κωδικό επιβεβαίωσης που απεστάλη στο <email>{ $email }</email>, εντός 5 λεπτών.
signin-token-code-input-label-v2 = Εισαγάγετε τον εξαψήφιο κωδικό
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Επιβεβαίωση
signin-token-code-code-expired = Έληξε ο κωδικός;
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Αποστολή νέου κωδικού.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Απαιτείται κωδικός επιβεβαίωσης
signin-token-code-resend-error = Κάτι πήγε στραβά. Δεν ήταν δυνατή η αποστολή νέου κωδικού.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Σύνδεση
signin-totp-code-subheader-v2 = Εισαγάγετε κωδικό ταυτοποίησης δύο παραγόντων
signin-totp-code-instruction-v4 = Ελέγξτε την <strong>εφαρμογή ταυτοποίησής</strong> σας για να επιβεβαιώσετε τη σύνδεσή σας.
signin-totp-code-input-label-v4 = Εισαγάγετε τον εξαψήφιο κωδικό
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Γιατί σας ζητείται να κάνετε ταυτοποίηση;
signin-totp-code-aal-banner-content = Έχετε ρυθμίσει την ταυτοποίηση δύο παραγόντων στον λογαριασμό σας, αλλά δεν έχετε συνδεθεί ακόμα με κωδικό σε αυτήν τη συσκευή.
signin-totp-code-aal-sign-out = Αποσύνδεση σε αυτήν τη συσκευή
signin-totp-code-aal-sign-out-error = Δυστυχώς, προέκυψε πρόβλημα κατά την αποσύνδεση
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Επιβεβαίωση
signin-totp-code-other-account-link = Χρήση διαφορετικού λογαριασμού
signin-totp-code-recovery-code-link = Πρόβλημα με την εισαγωγή του κωδικού;
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Απαιτείται κωδικός ταυτοποίησης
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Πιστοποίηση σύνδεσης
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Ελέγξτε το email σας για τον κωδικό ταυτοποίησης που απεστάλη στο { $email }.
signin-unblock-code-input = Εισαγάγετε κωδικό ταυτοποίησης
signin-unblock-submit-button = Συνέχεια
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Απαιτείται κωδικός ταυτοποίησης
signin-unblock-code-incorrect-length = Ο κωδικός ταυτοποίησης πρέπει να περιέχει 8 χαρακτήρες
signin-unblock-code-incorrect-format-2 = Ο κωδικός ταυτοποίησης μπορεί να περιέχει μόνο γράμματα ή/και αριθμούς
signin-unblock-resend-code-button = Δεν βρίσκεται στα εισερχόμενα ή στα ανεπιθύμητα; Αποστολή ξανά
signin-unblock-support-link = Γιατί συμβαίνει αυτό;
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Εισαγωγή κωδικού επιβεβαίωσης
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Εισαγάγετε τον κωδικό επιβεβαίωσης <span>για τον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Εισαγάγετε τον κωδικό επιβεβαίωσης που απεστάλη στο <email>{ $email }</email>, εντός 5 λεπτών.
confirm-signup-code-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Επιβεβαίωση
confirm-signup-code-sync-button = Έναρξη συγχρονισμού
confirm-signup-code-code-expired = Έληξε ο κωδικός;
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Αποστολή νέου κωδικού.
confirm-signup-code-success-alert = Επιτυχής επιβεβαίωση λογαριασμού
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Απαιτείται κωδικός επιβεβαίωσης
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Δημιουργία κωδικού πρόσβασης
signup-relay-info = Απαιτείται ένας κωδικός πρόσβασης για τη διαχείριση των μασκών email σας και την πρόσβαση στα εργαλεία ασφαλείας της { -brand-mozilla }.
signup-sync-info = Συγχρονίστε τους κωδικούς πρόσβασης, τους σελιδοδείκτες και πολλά άλλα, σε όποια συσκευή χρησιμοποιείτε το { -brand-firefox }.
signup-sync-info-with-payment = Συγχρονίστε τους κωδικούς πρόσβασης, τις μεθόδους πληρωμής, τους σελιδοδείκτες και πολλά άλλα, σε όποια συσκευή χρησιμοποιείτε το { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Αλλαγή email

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Ο συγχρονισμός είναι ενεργός
signup-confirmed-sync-success-banner = Ο { -product-mozilla-account(case: "nom", capitalization: "lower") } επιβεβαιώθηκε
signup-confirmed-sync-button = Έναρξη περιήγησης
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Οι κωδικοί πρόσβασης, οι μέθοδοι πληρωμής, οι διευθύνσεις, οι σελιδοδείκτες, το ιστορικό σας και πολλά άλλα μπορούν να συγχρονίζονται σε όποια συσκευή χρησιμοποιείτε το { -brand-firefox }.
signup-confirmed-sync-description-v2 = Οι κωδικοί πρόσβασης, οι διευθύνσεις, οι σελιδοδείκτες, το ιστορικό σας και πολλά άλλα μπορούν να συγχρονίζονται σε όποια συσκευή χρησιμοποιείτε το { -brand-firefox }.
signup-confirmed-sync-add-device-link = Προσθήκη άλλης συσκευής
signup-confirmed-sync-manage-sync-button = Διαχείριση συγχρονισμού
signup-confirmed-sync-set-password-success-banner = Ο κωδικός πρόσβασης συγχρονισμού δημιουργήθηκε
