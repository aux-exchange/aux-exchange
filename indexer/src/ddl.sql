CREATE TABLE IF NOT EXISTS swaps (
    kind String,
    pool_type String,
    sequence_number UInt64,
    timestamp DateTime64,
    sender String,
    coin_type_in String,
    coin_type_out String,
    fee_bps UInt16,
    amount_in Decimal(28, 18),
    amount_out Decimal(28, 18),
    reserve_in Decimal(28, 18),
    reserve_out Decimal(28, 18)
) Engine = ReplacingMergeTree(sequence_number)
ORDER BY (pool_type, sequence_number);
