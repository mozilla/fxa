#/bin/bash -ex

CMD=$1
INCLUDE=''

while IFS= read -r line; do
    echo "Including: $line"
    INCLUDE="--include $line $INCLUDE";
    if [[ $line =~ all ]] ; then
        echo 'Running All Tests'
        INCLUDE='';
        break;
    fi
done < packages/test.list

NODE_ENV=test yarn workspaces foreach $INCLUDE \
    --verbose \
    --interlaced \
    --parallel run $CMD;
