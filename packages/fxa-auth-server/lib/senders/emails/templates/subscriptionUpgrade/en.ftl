# Variables:
# $productNameNew (String) - The name of the subscribed product, e.g. Mozilla VPN

subscriptionUpgrade-subject = You have upgraded to { $productNameNew }

subscriptionUpgrade-title = Thank you for upgrading!

# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productNameNew (String) - The name of the new subscribed product, e.g. Mozilla VPN
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycle (String) - The interval of time from the end of one payment statement date to the next payment statement date, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content = You have successfully upgraded from { $productNameOld } to { $productNameNew }. Starting with your next bill, your charge will change from { $paymentAmountOld } per { $productPaymentCycle } to { $paymentAmountNew }. At that time you will also be charged a one-time fee of { $paymentProrated } to reflect the higher charge for the remainder of this { $productPaymentCycle }. If there is new software for you to install in order to use { $productNameNew }, you will receive a separate email with download instructions. Your subscription will automatically renew each billing period unless you choose to cancel.
