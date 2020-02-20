local uid = KEYS[1]
local clientId = ARGV[1]
local ids = redis.call('smembers', uid)

local toDel = {}
for _, id in ipairs(ids) do
  local v = redis.call('get', id)
  if v then
    local t = cjson.decode(v)
    if t.clientId == clientId then
      table.insert(toDel, id)
    end
  else
    table.insert(toDel, id)
  end
end
if #toDel > 0 then
  redis.call('srem', uid, unpack(toDel))
  redis.call('unlink', unpack(toDel))
end
