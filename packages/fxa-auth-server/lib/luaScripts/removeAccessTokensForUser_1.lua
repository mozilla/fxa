local uid = KEYS[1]
local ids = redis.call('smembers', uid)

if #ids > 0 then
  redis.call('unlink', unpack(ids))
  redis.call('del', uid)
end
