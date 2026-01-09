# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Your { $productName } subscription will expire soon
subscriptionEndingReminder-title = Your { $productName } subscription will expire soon

# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Your access to { $productName } will end on <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = If you’d like to continue using { $productName }, you can reactivate your subscription in <a data-l10n-name="subscriptionEndingReminder-account-settings">Account Settings</a> before <strong>{ $serviceLastActiveDateOnly }</strong>. If you need assistance, <a data-l10n-name="subscriptionEndingReminder-contact-support">contact our Support Team</a>.  
subscriptionEndingReminder-content-line1-plaintext = Your access to { $productName } will end on { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = If you’d like to continue using { $productName }, you can reactivate your subscription in Account Settings before { $serviceLastActiveDateOnly }. If you need assistance, contact our Support Team.  

subscriptionEndingReminder-content-closing = Thanks for being a valued subscriber!

subscriptionEndingReminder-churn-title = Want to keep access?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Limited terms and restrictions apply</a>

# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion 
subscriptionEndingReminder-churn-terms-plaintext = Limited terms and restrictions apply: { $churnTermsUrlWithUtm }

# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Contact our Support Team: { $subscriptionSupportUrlWithUtm }
