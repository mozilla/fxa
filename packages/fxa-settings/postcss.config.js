module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-assets': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    // Plain-color fallback for browsers without light-dark() (Acorn's tokens use it).
    '@csstools/postcss-light-dark-function': {},
    autoprefixer: {},
  },
};
