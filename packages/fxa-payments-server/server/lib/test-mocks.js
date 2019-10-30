const baseTime = 1570000000000;
const relativeBaseTime = 9000;
const offset = 150;

module.exports = {
  // Mocks shared between lib/amplitude.test.js and
  // lib/routes/post-metrics.test.js.
  amplitude: {
    baseTime,
    relativeBaseTime,
    requestReceivedTime: baseTime + 1000,
    event: {
      offset,
      type: 'amplitude.subPaySetup.view',
    },
    data: {
      deviceId: '0123456789abcdef0123456789abcdef',
      flowBeginTime: baseTime + offset,
      flowId:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      flushTime: relativeBaseTime + 2,
      perfStartTime: relativeBaseTime + 1,
      planId: '123doneProMonthly',
      productId: '123doneProProduct',
      startTime: baseTime,
      version: '148.8',
      view: 'product',
    },
    request: {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:72.0) Gecko/20100101 Firefox/72.0',
      },
    },
    expectedOutput: {
      app_version: '148.8',
      device_id: '0123456789abcdef0123456789abcdef',
      event_properties: {
        plan_id: '123doneProMonthly',
        product_id: '123doneProProduct',
      },
      event_type: 'fxa_pay_setup - view',
      op: 'amplitudeEvent',
      os_name: 'Mac OS X',
      os_version: '10.14',
      session_id: baseTime + offset,
      // time = data.perfStartTime + event.offset + requestReceivedTime - data.flushTime
      //      = 9001 + 150 + (baseTime + 1000) - 9002 = baseTime + 1149 = 1570000001149
      time: 1570000001149,
      user_properties: {
        flow_id:
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        ua_browser: 'Firefox',
        ua_version: '72.0',
      },
    },
  },
};
