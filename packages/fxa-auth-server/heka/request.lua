data = circular_buffer.new(1440, 5, 60)
local OK = data:set_header(1, "200", "count")
local REDIRECT = data:set_header(2, "300", "count")
local BADREQUEST = data:set_header(3, "400", "count")
local SERVERERR = data:set_header(4, "500", "count")
local TOTAL = data:set_header(5, "TOTAL", "count")

function process_message()
  local ts = read_message("Timestamp")
  local statusCode = read_message("Fields[statusCode]")
  if statusCode == nil then return 0 end

  data:add(ts, TOTAL, 1)

  if statusCode < 200 then
    return 0
  elseif statusCode < 300 then
    data:add(ts, OK, 1)
  elseif statusCode < 400 then
    data:add(ts, REDIRECT, 1)
  elseif statusCode < 500 then
    data:add(ts, BADREQUEST, 1)
  elseif statusCode < 600 then
    data:add(ts, SERVERERR, 1)
  end

  return 0
end

function timer_event(ns)
  output(data)
  inject_message("cbuf", "HTTP status codes")
end
