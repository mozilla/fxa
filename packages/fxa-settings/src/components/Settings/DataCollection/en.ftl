## Data collection section

dc-heading = Data Collection and Use
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } browser
dc-subheader-content-2 = Allow { -product-mozilla-accounts } to send technical and interaction data to { -brand-mozilla }.
dc-subheader-ff-content = To review or update your { -brand-firefox } browser technical and interaction data settings, open { -brand-firefox } settings and navigate to Privacy and Security.
dc-opt-out-success-2 = Opt out successful. { -product-mozilla-accounts } won’t send technical or interaction data to { -brand-mozilla }.
dc-opt-in-success-2 = Thanks! Sharing this data helps us improve { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Sorry, there was a problem changing your data collection preference
dc-learn-more = Learn more

## Synced data row and delete modal

dc-subheader-synced-data = Synced data
# <link> opens Firefox's "Account and sync" settings on Firefox Desktop, and is plain text elsewhere.
dc-synced-data-content = Delete synced data stored on { -brand-mozilla }’s servers. This won’t delete data on your devices or turn off syncing. To manage what syncs on this device, go to <link>Account and sync</link> in { -brand-firefox } Settings.
dc-synced-data-delete-button = Delete synced data
dc-synced-data-modal-heading = Delete synced data?
dc-synced-data-modal-content = This deletes your synced data from { -brand-mozilla }’s servers, not your devices. If syncing is on, your data may return to { -brand-mozilla }’s servers.
dc-synced-data-modal-content-sign-out = This deletes your synced data from { -brand-mozilla }’s servers, not your devices. If syncing is on, your data may return to { -brand-mozilla }’s servers. Sign out to stop syncing data.
# $count (Number) - the number of devices on the account that can sync
dc-synced-data-modal-may-be-syncing = { $count ->
  [one] { $count } device may be syncing. To stop syncing, sign out or go to Settings > Account and sync in { -brand-firefox }, and disconnect sync.
  *[other] { $count } devices may be syncing. To stop syncing, sign out or go to Settings > Account and sync in { -brand-firefox }, and disconnect sync.
}
# $deviceName (String) - the name of the device the user is currently using
dc-synced-data-this-device = { $deviceName } (this device)
# $count (Number) - the number of devices on the account that can sync
dc-synced-data-sign-out-all = Sign out of { -brand-firefox } on all my devices ({ $count })
# Tooltip and accessible name for the button that expands the device list
dc-synced-data-show-devices = Show devices
# Label on a device the user chose to sign out of
dc-synced-data-sign-out-badge = Sign out
# Label on a device the user chose to keep signed in
dc-synced-data-stay-signed-in-badge = Stay signed in
dc-synced-data-modal-cancel = Cancel
dc-synced-data-modal-delete = Delete
dc-synced-data-modal-delete-and-sign-out = Delete and sign out
