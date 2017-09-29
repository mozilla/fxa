from base64 import b64decode

import boto3
import hashlib
import hmac
import json
import os
import requests
import sys
import time
import zlib

AMPLITUDE_API_KEY = os.environ["FXA_AMPLITUDE_API_KEY"]
HMAC_KEY = os.environ["FXA_AMPLITUDE_HMAC_KEY"]

# For crude pre-emptive rate-limit obedience.
MAX_EVENTS_PER_BATCH = 10
MAX_BATCHES_PER_SECOND = 100
MIN_BATCH_INTERVAL = 1.0 / MAX_BATCHES_PER_SECOND

IDENTIFY_VERBS = ("$set", "$setOnce", "$add", "$append", "$unset")

# Cargo-culted from the internet. zlib >= 1.2.3.5 apparently supports
# specifying wbits=0 but that didn't work for me locally. This did.
ZLIB_WBITS = 32 + zlib.MAX_WBITS

def kms_decrypt_env(key):
    """Decrypt environment variable"""
    return kms_decrypt(b64decode(os.environ[key]))

def kms_decrypt(encrypted_data):
    """Decrypt KMS variables"""
    res = boto3.client("kms").decrypt(
        CiphertextBlob=encrypted_data,
    )
    return res["Plaintext"].decode("utf-8")

if "LAMBDA_TASK_ROOT" in os.environ:
    AMPLITUDE_API_KEY = str(kms_decrypt_env("FXA_AMPLITUDE_API_KEY"))
    HMAC_KEY = str(kms_decrypt_env("FXA_AMPLITUDE_HMAC_KEY"))

def handle (message, context):
    # http://docs.aws.amazon.com/AmazonS3/latest/dev/notification-content-structure.html
    if (type(message) is str):
        message = json.loads(message)
    records = message["Records"]

    for record in records:
        if record["eventSource"] != "aws:s3":
            continue

        print record["s3"]["bucket"]["name"], record["s3"]["object"]["key"]

        s3 = boto3.resource("s3", region_name=record["awsRegion"])
        s3_object = s3.Object(record["s3"]["bucket"]["name"], record["s3"]["object"]["key"])

        # This will fail if the data is not compressed.
        process_compressed(s3_object.get()["Body"].read())

def process_compressed (data):
    events = ""
    batches = None

    for chunk in decompress(data):
        events += chunk
        partitioned_events = partition_available_events(events)
        if is_partitioned(partitioned_events):
            events = partitioned_events[2]
            batches = process(partitioned_events[0], is_last_call = False)

    process(events, batches)

def decompress (data):
    decompressor = zlib.decompressobj(ZLIB_WBITS)
    for chunk in data:
        decompressed = decompressor.decompress(chunk)
        if decompressed:
            yield decompressed

def partition_available_events (events):
    partitioned_events = events.rpartition("\n")

    if not is_partitioned(partitioned_events):
        partitioned_events = events.rpartition("\r")

    return partitioned_events

def is_partitioned (partition):
    return partition[1] != ""

def process (events, batches = {"identify": [], "event": []}, is_last_call = True):
    for event_string in events.splitlines():
        event = json.loads(event_string)

        if "Fields" in event:
            # Auth server events are wrapped inside a `Fields` property.
            event = event["Fields"]
            if "op" in event and "data" in event:
                # Mailer events have an extra layer of indirection.
                event = json.loads(event["data"])
            else:
                # Non-mailer events have stringified `event_properties` and `user_properties`.
                if "event_properties" in event:
                    event["event_properties"] = json.loads(event["event_properties"])
                if "user_properties" in event:
                    event["user_properties"] = json.loads(event["user_properties"])

        if not is_event_ok(event):
            print "skipping malformed event", event
            continue

        user_id = device_id = None
        insert_id_hmac = hmac.new(HMAC_KEY, digestmod=hashlib.sha256)

        if "user_id" in event:
            user_id_hmac = hmac.new(HMAC_KEY, event["user_id"], hashlib.sha256)
            user_id = event["user_id"] = user_id_hmac.hexdigest()
            insert_id_hmac.update(user_id)

        if "device_id" in event:
            device_id = event["device_id"]
            insert_id_hmac.update(device_id)

        if "session_id" in event:
            insert_id_hmac.update(str(event["session_id"]))

        insert_id_hmac.update(event["event_type"])
        insert_id_hmac.update(str(event["time"]))
        event["insert_id"] = insert_id_hmac.hexdigest()

        if contains_identify_verbs(event["user_properties"]):
            result = process_identify_verbs(event["user_properties"])
            batches["identify"].append({"user_id": user_id, "device_id": device_id,
                                        "user_properties": result["identify"]})
            event["user_properties"] = result["pruned"]

        batches["event"].append(event)
        if len(batches["event"]) == MAX_EVENTS_PER_BATCH:
            send(batches)
            batches["identify"] = []
            batches["event"] = []

    if not is_last_call:
        return batches

    if len(batches["event"]) > 0:
        send(batches)

def is_event_ok (event):
    # https://amplitude.zendesk.com/hc/en-us/articles/204771828#keys-for-the-event-argument
    return ("device_id" in event or "user_id" in event) and "event_type" in event and "time" in event

def contains_identify_verbs (user_properties):
    return reduce(lambda contains, verb: contains or verb in user_properties, IDENTIFY_VERBS, False)

def process_identify_verbs (user_properties):
    def split (payloads, key):
        payloads["identify" if key in IDENTIFY_VERBS else "pruned"][key] = user_properties[key]
        return payloads

    return reduce(split, user_properties.keys(), {"identify": {}, "pruned": {}})

def send (batches):
    batch_interval = time.time() - send.batch_time
    if batch_interval < MIN_BATCH_INTERVAL:
        time.sleep(MIN_BATCH_INTERVAL - batch_interval)

    print "sending, identify: {}, event: {}".format(len(batches["identify"]), len(batches["event"]))

    if len(batches["identify"]) > 0:
        # https://amplitude.zendesk.com/hc/en-us/articles/205406617-Identify-API-Modify-User-Properties#request-format
        requests.post("https://api.amplitude.com/identify",
                      data={"api_key": AMPLITUDE_API_KEY, "identification": json.dumps(batches["identify"])})

    # https://amplitude.zendesk.com/hc/en-us/articles/204771828#request-format
    response = requests.post("https://api.amplitude.com/httpapi",
                             data={"api_key": AMPLITUDE_API_KEY, "event": json.dumps(batches["event"])})

    # For want of a better error-handling mechanism,
    # one failed request fails an entire dump from S3.
    response.raise_for_status()

    send.batch_time = time.time()

send.batch_time = 0

if __name__ == "__main__":
    argc = len(sys.argv)
    if argc == 1:
        process(sys.stdin.read())
    elif argc == 2:
        with open(sys.argv[1]) as f:
            process_compressed(f)
    else:
        sys.exit("Usage: {} <path-to-gzipped-log-file>\nOR pipe uncompressed logs via stdin".format(sys.argv[0]))

