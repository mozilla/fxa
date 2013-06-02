data = circular_buffer.new(240, 3, 15)
local cols = {
  rss = data:set_header(1, "RSS", "max"),
  heapTotal = data:set_header(2, "HEAP_TOTAL", "max"),
  heapUsed = data:set_header(3, "HEAP_USED", "max")
}

function process_message()
  local ts = read_message("Timestamp")
  local payload = read_message("Payload")
  if payload == nil then return 0 end

  for k, v in string.gmatch(payload, "stats.(%w+) (%d+)") do
    if cols[k] ~= nil then
      data:set(ts, cols[k], v)
    end
  end

  return 0
end

function timer_event(ns)
  output(data)
  inject_message("cbuf", "Process Memory Usage")
end
