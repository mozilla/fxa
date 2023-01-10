#!/bin/bash -ex

bash <(curl -s https://codecov.io/bash) -F $1 -X gcov
