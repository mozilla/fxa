local userId = KEYS[1]
local tokenId = KEYS[2]
local token = ARGV[1]
local limit = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])
local maxttl = tonumber(ARGV[4])
local args = {token}
local toAdd = {tokenId}
if ttl then
  table.insert(args, 'PX')
  table.insert(args, ttl)
end
local count = redis.call('scard', userId)
if count > limit then
  local toDel = redis.call('spop', userId, math.floor(limit / 2))
  redis.call('unlink', unpack(toDel))
elseif count > 0 and count % 5 == 0 then
  local popped = redis.call('spop', userId, limit)
  -- check for expired tokens
  local values = redis.call('mget', unpack(popped))
  for i, value in ipairs(values) do
    if value then
      -- token has not expired
      table.insert(toAdd, popped[i])
    end
  end
end
redis.call('set', tokenId, unpack(args))
redis.call('sadd', userId, unpack(toAdd))
redis.call('pexpire', userId, maxttl)
