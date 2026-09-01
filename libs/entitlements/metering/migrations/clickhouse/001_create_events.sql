CREATE TABLE IF NOT EXISTS events
(
    event_id_hash UInt64,
    client_id     LowCardinality(String),
    slug          LowCardinality(String),
    subject       String,
    amount        Int64,
    event_time    DateTime64(3, 'UTC') CODEC(Delta, ZSTD(1)),
    ingested_at   DateTime64(3, 'UTC') CODEC(Delta, ZSTD(1)),
    INDEX idx_event_time event_time TYPE minmax GRANULARITY 1,
    INDEX idx_ingested_at ingested_at TYPE minmax GRANULARITY 1
)
ENGINE = ReplacingMergeTree(ingested_at)
PARTITION BY toYYYYMM(event_time)
ORDER BY (client_id, slug, subject, event_time, event_id_hash)
TTL toDateTime(event_time) + INTERVAL 90 DAY
SETTINGS index_granularity = 4096;
