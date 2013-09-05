#!/bin/sh
#
# Single-box heka collector and log-analyzer thing.

set -e

YUM="yum --assumeyes --enablerepo=epel"
UDO="sudo -u mozsvc"

cd /home/mozsvc


# Install ElasticSearch.

wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.3.tar.gz
tar -zxvf elasticsearch-0.90.3.tar.gz
chown -R mozsvc:mozsvc elasticsearch-0.90.3
rm -f elasticsearch-0.90.3.tar.gz

cat >> /home/mozsvc/circus.ini << EOF
[watcher:elasticsearch]
working_dir=/home/mozsvc/elasticsearch-0.90.3
cmd=bin/elasticsearch -f
numprocesses=1 
stdout_stream.class = FileStream
stdout_stream.filename = /home/mozsvc/elasticsearch.log
stdout_stream.refresh_time = 0.5
stdout_stream.max_bytes = 1073741824
stdout_stream.backup_count = 3
stderr_stream.class = StdoutStream

[env:elasticsearch]
ES_HEAP_SIZE = 32m

EOF


# Install Kibana with a custom dashboard.

cd /home/mozsvc
wget https://github.com/elasticsearch/kibana/archive/master.tar.gz
mv master.tar.gz kibana-master.tar.gz
mkdir -p /opt
cd /opt
tar -zxvf /home/mozsvc/kibana-master.tar.gz
rm /home/mozsvc/kibana-master.tar.gz
# A big JSON blob defining the custom dashboard.
# This would be much better managed as a separate file in e.g. puppet...
cat >> /opt/kibana-master/dashboards/weblogs.json << EOF
{"index": {"default": "_all", "pattern": "[nginx-log-]YYYY-MM-DD", "interval": "none"}, "style": "light", "rows": [{"panels": [{"load": {"elasticsearch": true, "local": true, "gist": true}, "span": 2, "temp": true, "type": "dashcontrol", "editable": true, "hide_control": false, "elasticsearch_size": 20, "error": false, "group": ["default"], "save": {"default": true, "elasticsearch": true, "local": true, "gist": false}, "ttl_enable": true, "temp_ttl": "30d"}, {"span": 5, "remember": 10, "title": "query", "editable": true, "label": "Search", "pinned": true, "error": false, "query": "*", "type": "query", "history": ["Status:5*", "Status:2*", "Status:4*", "Status:\"4*\"", "Status:\"5*\"", "Status:\"2*\"", "*", "-Status:\"200\"", "Status:\"200\""]}, {"status": "Stable", "error": "", "span": 3, "title": "Time Picker", "time_options": ["5m", "15m", "1h", "6h", "12h", "24h", "2d", "7d", "30d"], "timespan": "5m", "editable": true, "refresh": {"enable": true, "interval": 30, "min": 3}, "timefield": "Timestamp", "mode": "relative", "filter_id": 0, "timeformat": "", "type": "timepicker"}], "collapse": false, "title": "Options", "editable": true, "height": "50px", "collapsable": true}, {"panels": [{"type": "filtering", "error": false, "editable": true, "group": ["default"], "span": 3}], "collapse": true, "title": "Filters", "editable": true, "height": "50px", "collapsable": true}, {"panels": [{"bars": true, "interval": "1s", "zoomlinks": true, "timezone": "browser", "spyable": true, "linewidth": 3, "fill": 0, "span": 10, "stack": true, "percentage": false, "auto_int": true, "type": "histogram", "value_field": null, "x-axis": true, "editable": true, "legend": true, "time_field": "Timestamp", "y-axis": true, "lines": false, "points": false, "mode": "count", "queries": {"mode": "all", "ids": [1, 0, 2]}, "resolution": 100, "interactive": true}], "collapse": false, "title": "Graph", "editable": true, "height": "250px", "collapsable": true}, {"panels": [{"sort": ["Timestamp", "desc"], "header": true, "trimFactor": 300, "spyable": true, "field_list": true, "size": 30, "style": {"font-size": "9pt"}, "span": 12, "pages": 10, "type": "table", "status": "Stable", "error": false, "editable": true, "offset": 0, "group": ["default"], "overflow": "min-height", "normTimes": true, "sortable": true, "fields": ["Timestamp", "Method", "Url", "Status", "RequestTime", "Hostname"], "paging": true, "queries": {"mode": "all", "ids": [1, 0, 2]}, "highlight": []}], "collapse": false, "title": "Events", "editable": true, "height": "650px", "collapsable": true}], "title": "picl-idp web logs", "failover": false, "editable": true, "services": {"filter": {"list": {"0": {"from": "2013-09-02T00:34:17.248Z", "field": "Timestamp", "to": "2013-09-02T00:39:17.248Z", "alias": "", "mandate": "must", "active": true, "type": "time", "id": 0}}, "ids": [0], "idQueue": [1, 2]}, "query": {"list": {"1": {"pin": false, "color": "#7EB26D", "alias": "", "query": "Url:* AND Status:2*", "type": "lucene", "id": 1}, "0": {"pin": false, "color": "#EAB839", "alias": "", "query": "Url:* AND Status:4*", "type": "lucene", "id": 0}, "2": {"pin": false, "color": "#E24D42", "alias": "", "query": "Url:* AND Status:5*", "type": "lucene", "id": 2}}, "ids": [1, 0, 2], "idQueue": [3, 4]}}}
EOF


# Install graphite and friends.
# XXX TODO: currently not used; get this working

python-pip install whisper carbon graphite-web

cd /opt/graphite
chown -R mozsvc:mozsvc ./storage
cp conf/carbon.conf.example conf/carbon.conf
cp conf/storage-schemas.conf.example conf/storage-schemas.conf

cat >> /home/mozsvc/circus.ini << EOF
[watcher:carbon-cache]
working_dir=/opt/graphite
cmd=bin/carbon-cache.py start --debug
numprocesses=1 
stdout_stream.class = FileStream
stdout_stream.filename = /home/mozsvc/carbon-cache.log
stdout_stream.refresh_time = 0.5
stdout_stream.max_bytes = 1073741824
stdout_stream.backup_count = 3
stderr_stream.class = StdoutStream

EOF


# Install RabbitMQ for receving logs from other boxes.

$YUM install rabbitmq-server

service rabbitmq-server start
chkconfig rabbitmq-server on


# Configure heka to receive logs from all the other boxes via AMQP.
# Nginx logs go into kibana.  Statmetric logs go into Carbon.
# Everything else just gets dumped to the debug log file.
# XXX TODO: security, signing, blah blah blah.

cd /home/mozsvc

cat >> /home/mozsvc/hekad/hekad.toml << EOF
[aggregator-input]
type = "AMQPInput"
url = "amqp://guest:guest@localhost:5672/"
exchange = "heka"
exchangeType = "fanout"

[ElasticSearchOutput]
message_matcher = "Type == 'logfile'"
index = "nginx-log-%{2006-01-02}"
esindexfromtimestamp = true
flush_interval = 500
flush_count = 50

[CarbonOutput]
message_matcher = "Type == 'heka.statmetric'"
address = "localhost:2003"
EOF


# Configure nginx to serve kibana.

$YUM install nginx

cat << EOF > /etc/nginx/nginx.conf
user  nginx;
worker_processes  1;
events {
    worker_connections  20480;
}
http {
    include       mime.types;
    default_type  application/octet-stream;
    log_format xff '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                   '\$status \$body_bytes_sent "\$http_referer" '
                   '"\$http_user_agent" XFF="\$http_x_forwarded_for" '
                   'TIME=\$request_time ';
    access_log /var/log/nginx/access.log xff;
    sendfile on;
    server {
        listen       80 default;
        location /kibana {
            alias /opt/kibana-master;
            autoindex on;
        }
        location / {
            alias /home/mozsvc/www/;
            autoindex on;
        }
    }
}
EOF

cd /home/mozsvc
$UDO mkdir www
$UDO chmod +x .
$UDO cat > www/index.html << EOF
<html>
<body>
<a href="/kibana/index.html#/dashboard/file/weblogs.json">Kibana Dashboard</a>
</body>
<html>
EOF

/sbin/chkconfig nginx on
/sbin/service nginx start

