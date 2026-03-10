# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-subject = Your { $productName } free trial ends soon

# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-content-greeting = Dear { $productName } customer,

# Variables:
#   $serviceLastActiveDateOnly (String) - The date the free trial ends, e.g. January 20, 2016
freeTrialEndingReminder-content-trial-ending = Your free trial is scheduled to end on <strong>{ $serviceLastActiveDateOnly }</strong>.
freeTrialEndingReminder-content-trial-ending-plaintext = Your free trial is scheduled to end on { $serviceLastActiveDateOnly }.

# Variables:
#   $invoiceTotal (String) - The total amount that will be charged, e.g. $9.99
#   $serviceLastActiveDateOnly (String) - The date the charge will occur, e.g. January 20, 2016
freeTrialEndingReminder-content-auto-charge = Unless you cancel before then, your subscription will automatically begin and we'll charge <strong>{ $invoiceTotal }</strong> to the payment method on your account on <strong>{ $serviceLastActiveDateOnly }</strong>.
freeTrialEndingReminder-content-auto-charge-plaintext = Unless you cancel before then, your subscription will automatically begin and we'll charge { $invoiceTotal } to the payment method on your account on { $serviceLastActiveDateOnly }.

freeTrialEndingReminder-content-charge-heading = Charge details

# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $invoiceSubtotal (String) - The subtotal amount of the subscription, e.g. $12.99
freeTrialEndingReminder-content-charge-subscription = { $productName } subscription: { $invoiceSubtotal }

# Variables:
#   $invoiceDiscountAmount (String) - The discount amount, as a negative number, e.g. -$3.00
freeTrialEndingReminder-content-charge-discount = Discount: { $invoiceDiscountAmount }

# Variables:
#   $invoiceTaxAmount (String) - The tax amount, e.g. $1.20
freeTrialEndingReminder-content-charge-tax = Tax: { $invoiceTaxAmount }

# Variables:
#   $serviceLastActiveDateOnly (String) - The date the charge will occur, e.g. January 20, 2016
#   $invoiceTotal (String) - The total amount due, e.g. $9.99
freeTrialEndingReminder-content-charge-total = Total due on { $serviceLastActiveDateOnly }: { $invoiceTotal }

freeTrialEndingReminder-content-account-link = You can review or update your payment method and account information <a data-l10n-name="freeTrialEndingReminder-update-billing">here</a>.
freeTrialEndingReminder-content-account-link-plaintext = You can review or update your payment method and account information here:

# Variables:
#   $serviceLastActiveDateOnly (String) - The date the trial ends, e.g. January 20, 2016
freeTrialEndingReminder-content-cancel-link = To avoid being charged, cancel before <strong>{ $serviceLastActiveDateOnly }</strong>: <a data-l10n-name="freeTrialEndingReminder-cancel-subscription">Cancel subscription</a>
freeTrialEndingReminder-content-cancel-link-plaintext = To avoid being charged, cancel before { $serviceLastActiveDateOnly }:

# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-content-thanks = Thank you for trying { $productName }. If you have any questions about your trial or subscription, please <a data-l10n-name="freeTrialEndingReminder-contact-support">contact us</a>.
freeTrialEndingReminder-content-thanks-plaintext = Thank you for trying { $productName }. If you have any questions about your trial or subscription, please contact us.

freeTrialEndingReminder-content-closing = Sincerely,

# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-content-signature = The { $productName } team

# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
freeTrialEndingReminder-content-support-plaintext = Contact us: { $subscriptionSupportUrlWithUtm }
