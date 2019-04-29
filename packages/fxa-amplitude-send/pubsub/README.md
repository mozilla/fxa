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

You can view the logs like so:

```
gcloud functions logs read --limit 100
```
