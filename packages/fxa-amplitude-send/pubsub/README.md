# GCP cloud function to import FxA Amplitude events from pub/sub

You can deploy this script like so:

```
gcloud functions deploy fxaAmplitudeImport \
  --runtime nodejs10 \
  --entry-point main \
  --trigger-topic fxa-amplitude-event-export \
```

If it's a fresh deploy,
e.g. the cloud function was previously deleted,
you'll need to set some environment variables too:

```
gcloud functions deploy fxaAmplitudeImport \
  --runtime nodejs10 \
  --entry-point main \
  --trigger-topic fxa-amplitude-event-export \
  --set-env-vars AMPLITUDE_API_KEY=deadbeef,HMAC_KEY=baadf00d
```

Note that you can't set
the `IGNORED_EVENTS` environment variable
from the command line
because it won't accept the JSON.
You'll need to set that one in the GCP console
after you've deployed the function:

https://console.cloud.google.com/functions/details/us-central1/fxaAmplitudeImport

Once the function is deployed,
you can view the logs like so:

```
gcloud functions logs read --limit 100
```
