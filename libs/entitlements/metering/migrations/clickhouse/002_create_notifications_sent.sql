CREATE TABLE IF NOT EXISTS notifications_sent
(
    client_id         LowCardinality(String),
    slug              LowCardinality(String),
    subject           String,
    threshold         Float64,
    signing_client_id LowCardinality(String),
    window_id         String,
    sent_at           DateTime64(3, 'UTC')
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(sent_at)
ORDER BY (client_id, slug, subject, threshold, signing_client_id, sent_at)
TTL toDateTime(sent_at) + INTERVAL 90 DAY;
