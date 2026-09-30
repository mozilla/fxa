#!/bin/bash
# Benchmark only: samples the container's memory and CPU (cgroup v1 or v2)
# and the biggest processes every 2s into artifacts/, until killed.
mkdir -p artifacts
if [[ -f /sys/fs/cgroup/memory.current ]]; then
  MEM=/sys/fs/cgroup/memory.current; LIMIT=$(cat /sys/fs/cgroup/memory.max)
  cpu() { awk '/^usage_usec/{print $2}' /sys/fs/cgroup/cpu.stat; }
else
  MEM=/sys/fs/cgroup/memory/memory.usage_in_bytes; LIMIT=$(cat /sys/fs/cgroup/memory/memory.limit_in_bytes)
  cpu() { echo $(( $(cat /sys/fs/cgroup/cpuacct/cpuacct.usage) / 1000 )); }
fi
echo "limit_bytes $LIMIT nproc $(nproc)" > artifacts/resources.log
while true; do
  ts=$(date +%s)
  echo "$ts $(cat $MEM) $(cpu)" >> artifacts/resources.log
  ps -eo rss=,pcpu=,args= --sort=-rss | head -6 | cut -c1-200 | sed "s/^/$ts /" >> artifacts/top-processes.log
  sleep 2
done
