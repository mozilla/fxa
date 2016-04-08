#!/bin/bash

if [ "$#" -ne 1 ]; then
  echo "batch file must be specified"
  exit 1
fi

BATCH=${1}
BATCH_DIRNAME=`dirname ${BATCH}`
BASENAME=`basename ${BATCH}`

ERRORS_DIRNAME=${BATCH_DIRNAME}-errors
ERRORS_OUTPUT=${ERRORS_DIRNAME}/${BASENAME}

if [ ! -d ${ERRORS_DIRNAME} ]; then
  echo "creating ${ERRORS_DIRNAME}"
  mkdir -p ${ERRORS_DIRNAME}
fi

UNSENT_DIRNAME=${BATCH_DIRNAME}-unsent
UNSENT_OUTPUT=${UNSENT_DIRNAME}/${BASENAME}

if [ ! -d ${UNSENT_DIRNAME} ]; then
  echo "creating ${UNSENT_DIRNAME}"
  mkdir -p ${UNSENT_DIRNAME}
fi

echo ${BATCH}

node must-reset.js -i ${BATCH}
rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

### TODO If we need more delay in between the batches the bulk-mailer itself sends, add a `-d <seconds> to the below line. 
### If instead of sending 10 emails at a time, the mailer should send 5 (or some other number), -b <batch_size>
### TODO Finally, when sending for real for real, the --send option needs to be added.
node bulk-mailer.js -i ${BATCH} -t password_reset_required -e ${ERRORS_OUTPUT} -u ${UNSENT_OUTPUT} --real 
rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi


# once the batch is completed, remove the batch file to
# reduce the possibility of resending emails to the same people
rm ${BATCH}
