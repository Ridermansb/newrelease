module.exports = {
  env: {
    browser: true,
    es6: true,
    commonjs: true,
    jquery: true,
  },
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {'jsx': true},
  },
  globals: {
    GITHUB_API_URI: true,
    '$': true
  },
  plugins: ['react', 'jsx-a11y']
};
