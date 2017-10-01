module.exports = {
  env: {
    browser: true,
    es6: true,
    commonjs: true,
    jasmine: true,
  },
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {'jsx': true},
  },
  globals: {
    GITHUB_API_URI: true
  },
  plugins: ['react', 'jsx-a11y']
};
