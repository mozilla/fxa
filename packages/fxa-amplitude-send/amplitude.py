import json
import sys

def transform(line):
    try:
        parsed_line = json.loads(line)

        assert(type(parsed_line) is dict)

        event = parsed_line["Fields"]

        assert("time" in event)
        assert("user_id" in event or "device_id" in event)

    except:
        return None

if __name__ == "__main__":
    transform(sys.argv[1])

