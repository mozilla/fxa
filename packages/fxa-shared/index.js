
module.exports = {
  email: {
    popularDomains: require('./email/popularDomains')
  },
  metrics: {
    amplitude: require('./metrics/amplitude')
  },
  l10n: {
    localizeTimestamp: require('./l10n/localizeTimestamp'),
    supportedLanguages: require('./l10n/supportedLanguages')
  },
  oauth: {
    scopes: require('./oauth/scopes')
  }
};
