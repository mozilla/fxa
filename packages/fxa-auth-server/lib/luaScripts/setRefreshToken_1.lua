local uid = KEYS[1]
local tokenId = ARGV[1]
local token = ARGV[2]

-- For now, we always completely replace the data in redis.
-- If we add more fields we might like to implement a merge here instead.
return redis.call('hset', uid, tokenId, token)
