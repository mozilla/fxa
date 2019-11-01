from base64 import b64decode
from Queue import Queue

import boto3
import hashlib
import hmac
import json
import os
import requests
import sys
import threading
import zlib

AMPLITUDE_API_KEY = os.environ["FXA_AMPLITUDE_API_KEY"]
HMAC_KEY = os.environ["FXA_AMPLITUDE_HMAC_KEY"]
THREAD_COUNT = int(os.environ["FXA_AMPLITUDE_THREAD_COUNT"])

# For crude pre-emptive rate-limit obedience.
MAX_EVENTS_PER_BATCH = 10
MAX_BATCHES_PER_SECOND = 100

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

        with SenderThreadPool() as pool:
            # This will fail if the data is not compressed.
            process_compressed(pool, s3_object.get()["Body"].read())

def process_compressed (pool, data):
    events = ""
    batches = None

    for chunk in decompress(data):
        events += chunk
        partitioned_events = partition_available_events(events)
        if is_partitioned(partitioned_events):
            events = partitioned_events[2]
            batches = process(pool, partitioned_events[0], batches, False)

    process(pool, events, batches)

def decompress (data):
    decompressor = zlib.decompressobj(ZLIB_WBITS)

    for chunk in data:
        decompressed = decompressor.decompress(chunk)
        if decompressed:
            yield decompressed

    remaining = decompressor.flush()
    if len(remaining) > 0:
        yield remaining

def partition_available_events (events):
    partitioned_events = events.rpartition("\n")

    if not is_partitioned(partitioned_events):
        partitioned_events = events.rpartition("\r")

    return partitioned_events

def is_partitioned (partition):
    return partition[1] != ""

def process (pool, events, batches = None, is_last_call = True):
    if batches is None:
        batches = {"identify": [], "event": []}

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
            pool.send(batches)
            batches = {"identify": [], "event": []}

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
    if len(batches["identify"]) > 0:
        # https://amplitude.zendesk.com/hc/en-us/articles/205406617-Identify-API-Modify-User-Properties#request-format
        response = requests.post("https://api.amplitude.com/identify",
                                 data={"api_key": AMPLITUDE_API_KEY, "identification": json.dumps(batches["identify"])})
        response.raise_for_status()

    # https://amplitude.zendesk.com/hc/en-us/articles/204771828#request-format
    response = requests.post("https://api.amplitude.com/httpapi",
                             data={"api_key": AMPLITUDE_API_KEY, "event": json.dumps(batches["event"])})

    # For want of a better error-handling mechanism,
    # one failed request fails an entire dump from S3.
    response.raise_for_status()


class SenderThreadPool:
    """A simple single-producer multi-consumer thread pool to send batches.

    This class manages a pool of background threads to send event batches.
    Use it like so:

        with SenderThreadPool() as p:
            for batches in do_some_stuff_to_generate_batches():
                p.send(batches)

    The call to send() will push the batch onto an internal queue where it
    will get picked up async by the worker threads.  The `with` statement
    will join all threads before exiting, to ensure that the send gets
    completed.
    """

    def __init__(self):
        self._queue = Queue()
        self._threads = []
        self._err = None

    def __enter__(self):
        for _ in xrange(THREAD_COUNT):
            t = threading.Thread(target=self._worker_thread)
            self._threads.append(t)
            t.start()
        return self

    def __exit__(self, exc_typ, exc_val, exc_tb):
        # Push a sentinel so each thread will shut down cleanly.
        for t in self._threads:
            self._queue.put(None)
        # Wait for all the threads to shut down.
        for t in self._threads:
            t.join()
        # If we're existing successfully, but there was an error
        # in one of the worker threads, raise it now.
        if exc_typ is None and self._err is not None:
            raise self._err

    def send(self, batches):
        # If one of the worker threads raised an error,
        # re-raise it in the main thread.
        if self._err is not None:
            raise self._err
        self._queue.put(batches)

    def _worker_thread(self):
        try:
            batches = self._queue.get()
            while batches is not None:
                send(batches)
                batches = self._queue.get()
        except Exception as err:
            self._err = err



if __name__ == "__main__":
    argc = len(sys.argv)
    if argc == 1:
        with SenderThreadPool() as pool:
            process(pool, sys.stdin.read())
    elif argc == 2:
        with SenderThreadPool() as pool:
            with open(sys.argv[1]) as f:
                process_compressed(pool, f)
    else:
        sys.exit("Usage: {} <path-to-gzipped-log-file>\nOR pipe uncompressed logs via stdin".format(sys.argv[0]))

