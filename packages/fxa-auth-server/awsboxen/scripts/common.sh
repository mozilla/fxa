#!/bin/sh

set -e

YUM="yum --assumeyes --enablerepo=epel"

$YUM update
$YUM install python-pip git openssl-devel python-devel
$YUM install gcc gcc-c++ czmq-devel zeromq nginx


# Add ssh public keys.

git clone https://github.com/mozilla/identity-pubkeys
cd identity-pubkeys
git checkout b63a19a153f631c949e7f6506ad4bf1f258dda69
cat *.pub >> /home/ec2-user/.ssh/authorized_keys
cd ..
rm -rf identity-pubkeys


# Add an unprivileged user as which to run various services.

useradd mozsvc
UDO="sudo -u mozsvc"


# Configure circus to run on startup, executing the mozsvc user's circus.ini.
# Additional build steps may add to circus.ini to make their programs run.
# Note that we depend on cloudinit to move /etc/rc.local.post-cloudinit
# to /etc/rc.local after it has done whatever extra setup is required.

python-pip install "psutil < 1.1"  # v1.1 doesn't build for some reason
python-pip install circus

cd /home/mozsvc
touch circus.ini
chown mozsvc:mozsvc circus.ini

cat > /etc/rc.local.post-cloudinit << EOF
# Run the mozsvc-user-controlled service processes via circus.
su -l mozsvc -c '/usr/bin/circusd --daemon /home/mozsvc/circus.ini'
exit 0
EOF
chmod 755 /etc/rc.local.post-cloudinit


# Install heka.

HEKAFILE=heka-0_4_0-picl-idp-amd64.tar.gz
cd /opt
wget https://people.mozilla.com/~rmiller/heka/$HEKAFILE
tar -xzvf $HEKAFILE
rm -f $HEKAFILE

cd /home/mozsvc
$UDO mkdir ./hekad


# Set some basic heka configuration.

cat > ./hekad/hekad.toml << EOF
[hekad]
base_dir = "/home/mozsvc/hekad"

[UdpInput]
address = "127.0.0.1:4880"

[StatsdInput]
address = ":8125"

[StatAccumInput]
emit_in_fields = true

[debug]
type = "FileOutput"
message_matcher = "TRUE"
path = "/home/mozsvc/hekad/hekad.log"
format = "json"

EOF
chown mozsvc:mozsvc hekad/hekad.toml


# Run heka automatically via circus.

cat >> circus.ini << EOF

[watcher:hekad]
working_dir=/home/mozsvc/hekad
cmd=/opt/heka-0_4_0-linux-amd64/bin/hekad -config=/home/mozsvc/hekad/hekad.toml
numprocesses = 1
stdout_stream.class = FileStream
stdout_stream.filename = /home/mozsvc/hekad/circus.log
stdout_stream.refresh_time = 0.5
stdout_stream.max_bytes = 1073741824
stdout_stream.backup_count = 3
stderr_stream.class = StdoutStream

EOF


# A very hacky system monitoring setup. Ugh.
#
# A python script that polls useful system metrics and sends them to
# the heka statsd input.
#
# Someone with the experience and/or patience to figure out a better
# solution is most welcome to do so...

python-pip install statsd

$UDO mkdir ./hackymon/

cat > ./hackymon/hackymon.py << EOF

import os
import time
import psutil
import statsd
import traceback
import socket

hostname = socket.gethostname()

prev_disk_info = psutil.disk_io_counters()
prev_time = time.time()

while True:
    try:
        cur_disk_info = psutil.disk_io_counters()
        cur_time = time.time()

        d_time = cur_time - prev_time
        d_read_count = cur_disk_info.read_count - prev_disk_info.read_count
        d_read_bytes = cur_disk_info.read_bytes - prev_disk_info.read_bytes
        d_read_time = cur_disk_info.read_time - prev_disk_info.read_time
        d_write_count = cur_disk_info.write_count - prev_disk_info.write_count
        d_write_bytes = cur_disk_info.write_bytes - prev_disk_info.write_bytes
        d_write_time = cur_disk_info.write_time - prev_disk_info.write_time
        d_read_time = float(d_read_time)
        d_write_time = float(d_write_time)

        prev_disk_info = cur_disk_info
        prev_time = cur_time

        c = statsd.StatsClient('localhost', 8125)
        def gauge(name, value):
            # XXX TODO: accumulate them all on the logging box,
            # identified by the hostname of each machine.
            # name = "hackymon." + name + "." + hostname
            c.gauge(name, int(value))

        gauge("disk_rcps", d_read_count / d_time)
        gauge("disk_wcps", d_write_count / d_time)
        gauge("disk_rbps", d_read_bytes / d_time)
        gauge("disk_wbps", d_write_bytes / d_time)
        gauge("disk_rtps", d_read_time / d_time)
        gauge("disk_wtps", d_write_time / d_time)

        gauge("cpu_percent", psutil.cpu_percent())
        gauge("vmem_percent", psutil.virtual_memory().percent)
        gauge("disk_percent", psutil.disk_usage("/").percent)

        loadavg = os.getloadavg()
        gauge("loadavg1", loadavg[0] * 100)
        gauge("loadavg5", loadavg[1] * 100)
        gauge("loadavg15", loadavg[2] * 100)

    except Exception:
        traceback.print_exc()

    time.sleep(5)

EOF
chown mozsvc:mozsvc ./hackymon/hackymon.py

cat >> circus.ini << EOF

[watcher:hackymon]
working_dir=/home/mozsvc/hackymon
cmd=python /home/mozsvc/hackymon/hackymon.py
numprocesses = 1
stdout_stream.class = FileStream
stdout_stream.filename = /home/mozsvc/hackymon/hackymon.log
stdout_stream.refresh_time = 0.5
stdout_stream.max_bytes = 1073741824
stdout_stream.backup_count = 3
stderr_stream.class = StdoutStream

EOF


# Run local heka dashboard showing hackymon load metrics.
# XXX TODO: accumulate these all on the logbox, using e.g. graphite
# and pencil for graphing them together.

cat >> ./hekad/hekad.toml << EOF

[hackymonLoadGauges]
type = "SandboxFilter"
message_matcher = "Type == 'heka.statmetric'"
ticker_interval = 10
script_type = "lua"
filename = "hackymon_report_load.lua"
preserve_data = false
memory_limit = 1048576
instruction_limit = 1000
output_limit = 64512

[hackymonResourceGauges]
type = "SandboxFilter"
message_matcher = "Type == 'heka.statmetric'"
ticker_interval = 10
script_type = "lua"
filename = "hackymon_report_resources.lua"
preserve_data = false
memory_limit = 1048576
instruction_limit = 1000
output_limit = 64512

[hackymonDiskGauges]
type = "SandboxFilter"
message_matcher = "Type == 'heka.statmetric'"
ticker_interval = 10
script_type = "lua"
filename = "hackymon_report_disk.lua"
preserve_data = false
memory_limit = 1048576
instruction_limit = 1000
output_limit = 64512

[DashboardOutput]

EOF

cat >> ./hekad/hackymon_report_load.lua << EOF

data = circular_buffer.new(240, 3, 10)
local LOADAVG1 = data:set_header(1, "LOADAVG1", "percent", "max")
local LOADAVG5 = data:set_header(2, "LOADAVG5", "percent", "max")
local LOADAVG15 = data:set_header(3, "LOADAVG15", "percent", "max")

function process_message()
  local ts = read_message("Timestamp")

  local loadavg1 = read_message("Fields[loadavg1]")
  local loadavg5 = read_message("Fields[loadavg5]")
  local loadavg15 = read_message("Fields[loadavg15]")

  data:set(ts, LOADAVG1, loadavg1)
  data:set(ts, LOADAVG5, loadavg5)
  data:set(ts, LOADAVG15, loadavg15)

  return 0
end

function timer_event(ns)
  output(data)
  inject_message("cbuf", "HackyMon Load Metrics")
end

EOF
chown mozsvc:mozsvc ./hekad/hackymon_report_load.lua


cat >> ./hekad/hackymon_report_resources.lua << EOF

data = circular_buffer.new(240, 3, 10)
local CPU = data:set_header(1, "CPU", "percent", "max")
local VMEM = data:set_header(2, "VMEM", "percent", "max")
local DISK = data:set_header(3, "DISK", "percent", "max")

function process_message()
  local ts = read_message("Timestamp")

  local cpu = read_message("Fields[cpu_percent]")
  local vmem = read_message("Fields[vmem_percent]")
  local disk = read_message("Fields[disk_percent]")

  data:set(ts, CPU, cpu)
  data:set(ts, VMEM, vmem)
  data:set(ts, DISK, disk)

  return 0
end

function timer_event(ns)
  output(data)
  inject_message("cbuf", "HackyMon Resource Metrics")
end

EOF
chown mozsvc:mozsvc ./hekad/hackymon_report_resources.lua


cat >> ./hekad/hackymon_report_disk.lua << EOF

data = circular_buffer.new(240, 2, 10)
local RBPS = data:set_header(1, "RBPS", "bytes/sec", "max")
local WBPS = data:set_header(2, "WBPS", "bytes/sec", "max")

function process_message()
  local ts = read_message("Timestamp")

  local rbps = read_message("Fields[disk_rbps]")
  local wbps = read_message("Fields[disk_wbps]")

  data:set(ts, RBPS, rbps)
  data:set(ts, WBPS, wbps)

  return 0
end

function timer_event(ns)
  output(data)
  inject_message("cbuf", "HackyMon Disk Metrics")
end

EOF
chown mozsvc:mozsvc ./hekad/hackymon_report_disk.lua
