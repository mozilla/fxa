const { join } = require('path');

module.exports = {
  'postcss-import': {},
  plugins: {
    tailwindcss: {
      config: join(__dirname, 'tailwind.config.js'),
    },
    autoprefixer: {},
  },
};
