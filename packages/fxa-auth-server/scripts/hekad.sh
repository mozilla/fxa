#!/bin/sh

#
# chkconfig: 35 99 99
# description: Heka Daemon
#

. /etc/rc.d/init.d/functions

USER="app"

DAEMON="/usr/bin/hekad"
ROOT_DIR="/home/app"

CONFIG_FILE=$HEKAD_CONFIG
: ${CONFIG_FILE:="/etc/hekad.toml"}

LOG_FILE="$ROOT_DIR/hekad.log"

LOCK_FILE="/var/lock/subsys/hekad"

do_start()
{
  if [ ! -f "$LOCK_FILE" ] ; then
    echo -n $"Starting hekad: "
    runuser -l "$USER" -c "$DAEMON -config=$CONFIG_FILE >> $LOG_FILE &" && echo_success || echo_failure
    RETVAL=$?
    echo
    [ $RETVAL -eq 0 ] && touch $LOCK_FILE
  else
    echo "hekad is locked."
    RETVAL=1
  fi
}
do_stop()
{
  echo -n $"Stopping hekad: "
  pid=`ps -aefw | grep "$DAEMON" | grep -v " grep " | awk '{print $2}'`
  runuser -l "$USER" -c "kill -SIGINT $pid > /dev/null 2>&1" && echo_success || echo_failure
  RETVAL=$?
  echo
  [ $RETVAL -eq 0 ] && rm -f $LOCK_FILE
}

case "$1" in
  start)
    do_start
    ;;
  stop)
    do_stop
    ;;
  restart)
    do_stop
    do_start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    RETVAL=1
esac

exit $RETVAL
