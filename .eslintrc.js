module.exports = {
  'root': true,
  'extends': 'airbnb',
  'parser': 'babel-eslint',
  'parserOptions': {ecmaVersion: 7},
  'env': {
    es6: true,
    commonjs: true
  },
  'settings': {
    'import/resolver': {
      webpack: {config: 'webpack.common.js'}
    }
  },
  rules: {
    'no-confusing-arrow': [0, {'allowParents': false}],
    'no-underscore-dangle': 0,
    /**
     * Disabled JSX rules because was removed
     * @see https://github.com/facebookincubator/create-react-app/issues/2631#issuecomment-312894470
     */
    "jsx-a11y/href-no-hash": "off",
    "jsx-a11y/anchor-is-valid": ["warn", { "aspects": ["invalidHref"] }]
  },
  'plugins': ['import', 'babel'],
  globals: { '__DEVELOPMENT__': true, '__PRODUCTION__': true },
};
